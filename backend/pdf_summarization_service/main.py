import json
import os
import tempfile
from cloudevents.http import from_http
from flask import Flask, request
from google.cloud import storage
from langchain.document_loaders import PyPDFLoader
from langchain.llms import VertexAI
from langchain.chains import AnalyzeDocumentChain
from langchain.chains.question_answering import load_qa_chain


app = Flask(__name__)


@app.route('/')
def index():
    return 'Google Cloud PDF summarization service.'


def download_from_gcs(bucket_name, filepath, filename):
    storage_client = storage.Client()
    bucket = storage_client.bucket(bucket_name)
    blob = bucket.blob(filepath)
    blob.download_to_filename(filename)


def upload_to_gcs(bucket_name, filepath, filename):
    storage_client = storage.Client()
    bucket = storage_client.bucket(bucket_name)
    blob = bucket.blob(filepath)
    blob.upload_from_filename(filename)


# This handler is triggered by storage events
@app.route('/api/post', methods=['POST'])
def process_event():
    event = from_http(request.headers, request.data)
    data = event.data
    bucket_name = data['bucket']
    filepath = data['name']

    directory = os.path.dirname(filepath)
    filename = os.path.basename(filepath)
    filename_body, ext = os.path.splitext(filename)
    new_filepath = directory + '/summary/' + filename_body + '.txt'

    print('Uploaded file: {}'.format(filepath))

    if not ext.lower() == '.pdf':
        return ('This is not a pdf file', 200)

    with tempfile.TemporaryDirectory() as tmp_dir:
        tmp_file = os.path.join(tmp_dir, filename)
        download_from_gcs(bucket_name, filepath, tmp_file)

        # Generate summary of the pdf
        loader = PyPDFLoader(tmp_file)
        document = loader.load()
        llm = VertexAI(
            model_name='text-bison@001',
            max_output_tokens=256, temperature=0.1, top_p=0.8, top_k=40
        )

        qa_chain = load_qa_chain(llm, chain_type='map_reduce')
        qa_document_chain = AnalyzeDocumentChain(combine_docs_chain=qa_chain)
        prompt = '何についての文書ですか？日本語で5文以内にまとめてください。'
        description = qa_document_chain.run(
            input_document=document[0].page_content[:5000],
            question=prompt)

    print('Description of {}: {}'.format(filename, description))
    with tempfile.NamedTemporaryFile() as tmp_file:
        with open(tmp_file.name, 'w') as f:
            f.write(description)
        upload_to_gcs(bucket_name, new_filepath, tmp_file.name)

    return ('succeeded', 200)


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8080))
    app.run(host='0.0.0.0', port=port)
