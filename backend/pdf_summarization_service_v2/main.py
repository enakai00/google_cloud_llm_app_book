import json
import os
import sqlalchemy
import tempfile
import google.auth
from cloudevents.http import from_http
from flask import Flask, request
from google.cloud import storage
from google.cloud.sql.connector import Connector
from langchain.document_loaders import PyPDFLoader, GCSFileLoader
from langchain.llms import VertexAI
from langchain.chains import AnalyzeDocumentChain
from langchain.chains.question_answering import load_qa_chain
from langchain.embeddings import VertexAIEmbeddings


app = Flask(__name__)

# Get environment variables
_, PROJECT_ID = google.auth.default()
DB_REGION = os.environ.get('DB_REGION', 'asia-northeast1')
DB_INSTANCE_NAME = os.environ.get('DB_INSTANCE_NAME', 'llm-app-db')
DB_USER = os.environ.get('DB_USER', 'db-admin')
DB_PASS = os.environ.get('DB_PASS', 'handson')
DB_NAME = os.environ.get('DB_NAME', 'documents')

# Prepare connection pool
INSTANCE_CONNECTION_NAME = '{}:{}:{}'.format(
        PROJECT_ID, DB_REGION, DB_INSTANCE_NAME)

connector = Connector()

def getconn():
    conn = connector.connect(
        INSTANCE_CONNECTION_NAME, 'pg8000',
        user=DB_USER, password=DB_PASS, db=DB_NAME
    )
    return conn

pool = sqlalchemy.create_engine('postgresql+pg8000://', creator=getconn)


def delete_doc(source):
    with pool.connect() as db_conn:
        delete_stmt = sqlalchemy.text(
            'DELETE FROM docs_embeddings WHERE source=:source;'
        )
        parameters = {'source': source}
        db_conn.execute(delete_stmt, parameters=parameters)
        db_conn.commit()
    return


def insert_doc(source, uid, filename, page, content, embedding_vector):
    with pool.connect() as db_conn:
        insert_stmt = sqlalchemy.text(
            'INSERT INTO docs_embeddings \
             (source, uid, filename, page, content, embedding) \
             VALUES (:source, :uid, :filename, :page, :content, :embedding);'
        )
        parameters = {
            'source': source,
            'uid': uid,
            'filename': filename,
            'page': page,
            'content': content,
            'embedding': embedding_vector
        }
        db_conn.execute(insert_stmt, parameters=parameters)
        db_conn.commit()
    return


@app.route('/')
def index():
    return 'Google Cloud PDF summarization service.'


def upload_to_gcs(bucket_name, filepath, filename):
    storage_client = storage.Client()
    bucket = storage_client.bucket(bucket_name)
    blob = bucket.blob(filepath)
    blob.upload_from_filename(filename)


# This handler is triggered by storage events
@app.route('/api/post', methods=['POST'])
def process_event():
    event = from_http(request.headers, request.data)
    event_id = event['id']
    data = event.data
    bucket_name = data['bucket']
    filepath = data['name']
    uid = filepath.split('/')[0]
    print('{} - Uploaded file: {}'.format(event_id, filepath))

    storage_client = storage.Client()
    bucket = storage_client.bucket(bucket_name)
    blob = bucket.get_blob(filepath)
    if blob.content_type != 'application/pdf':
        print('{} - {} is not a pdf file.'.format(event_id, filepath))
        return ('This is not a pdf file.', 200)

    directory = os.path.dirname(filepath)
    filename = os.path.basename(filepath)
    filename_body, ext = os.path.splitext(filename)
    new_filepath = directory + '/summary/' + filename_body + '.txt'

    # Generate summary of pdf
    _, PROJECT_ID = google.auth.default()
    try:
        document = GCSFileLoader(
            project_name=PROJECT_ID, bucket=bucket_name, blob=filepath,
            loader_func=PyPDFLoader).load()
    except:
        print('{} - {} is not accessible. It may have been deleted.'.format(
            event_id, filepath))
        return ('File is not accessible.', 200)

    pdf_content = document[0].page_content[:5000]

    llm = VertexAI(
        model_name='text-bison@001',
        max_output_tokens=256, temperature=0.1, top_p=0.8, top_k=40
    )

    qa_chain = load_qa_chain(llm, chain_type='map_reduce')
    qa_document_chain = AnalyzeDocumentChain(combine_docs_chain=qa_chain)
    prompt = '何についての文書ですか？日本語で5文以内にまとめてください。'
    description = qa_document_chain.run(
        input_document=pdf_content, question=prompt)

    print('{} - Description of {}: {}'.format(event_id, filename, description))
    with tempfile.NamedTemporaryFile() as tmp_file:
        with open(tmp_file.name, 'w') as f:
            f.write(description)
        upload_to_gcs(bucket_name, new_filepath, tmp_file.name)


    # Store embedding vectores
    try:
        pages = GCSFileLoader(
            project_name=PROJECT_ID, bucket=bucket_name, blob=filepath,
            loader_func=PyPDFLoader).load_and_split()
    except:
        print('{} - {} is not accessible. It may have been deleted.'.format(
            event_id, filepath))
        return ('File is not accessible.', 200)

    page_contents = [
        page.page_content.encode('utf-8').replace(b'\x00', b'').decode('utf-8')
        for page in pages[:100]
    ]

    embeddings = VertexAIEmbeddings(
        model_name='textembedding-gecko-multilingual@latest')
    embedding_vectors = embeddings.embed_documents(page_contents)

    source = pages[0].metadata['source']
    delete_doc(source)
    for c, embedding_vector in enumerate(embedding_vectors):
        page = pages[c].metadata['page']
        insert_doc(source, uid, filename, page,
                   page_contents[c], str(embedding_vector))

    print('{} - Processed {} pages of {}'.format(
        event_id, len(pages)-1, filepath))

    return ('succeeded', 200)


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8080))
    app.run(host='0.0.0.0', port=port)
