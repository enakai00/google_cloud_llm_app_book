## Setup when using VM instead of Cloud Shell

```
https://github.com/nodesource/distributions

sudo apt-get install git jq -y

git config --global user.email "xxxx"
git config --global user.name "xxxx"

gcloud auth login
gcloud config set project

GOOGLE_CLOUD_PROJECT=[Project ID]
```

## Create artifact repo

```
gcloud artifacts repositories create llm-app-repo\
  --repository-format docker \
  --location asia-northeast1 \
  --description "Docker repository for llm-application"

REPO=asia-northeast1-docker.pkg.dev/$GOOGLE_CLOUD_PROJECT/llm-app-repo
```

## Deploy backend

### English correction
```
gcloud iam service-accounts create llm-app-backend
SERVICE_ACCOUNT=llm-app-backend@$GOOGLE_CLOUD_PROJECT.iam.gserviceaccount.com

gcloud projects add-iam-policy-binding $GOOGLE_CLOUD_PROJECT \
  --member serviceAccount:$SERVICE_ACCOUNT \
  --role roles/aiplatform.user

SERVICE_NAME=english-correction-service
gcloud builds submit ./backend/english_correction_service \
  --tag $REPO/$SERVICE_NAME

gcloud run deploy $SERVICE_NAME \
  --image $REPO/$SERVICE_NAME \
  --service-account $SERVICE_ACCOUNT \
  --region asia-northeast1 --no-allow-unauthenticated

SERVICE_URL=$(gcloud run services list --platform managed \
  --format="table[no-heading](URL)" --filter="metadata.name:${SERVICE_NAME}")
curl -X POST -H "Authorization: Bearer $(gcloud auth print-identity-token)" \
  -H "Content-Type: application/json" \
  -d '{"text":"I go to school yesterday. I eat apple for lunch. I like to eat apple."}' \
  -s ${SERVICE_URL}/api/post | jq .
```


### Fashion compliment
```
SERVICE_NAME=fashion-compliment-service

gcloud builds submit ./backend/fashion_compliment_service \
  --tag $REPO/$SERVICE_NAME

gcloud run deploy $SERVICE_NAME \
  --image $REPO/$SERVICE_NAME \
  --service-account $SERVICE_ACCOUNT \
  --region asia-northeast1 --no-allow-unauthenticated

cp ./backend/fashion_compliment/image.jpg ./

SERVICE_URL=$(gcloud run services list --platform managed \
  --format="table[no-heading](URL)" --filter="metadata.name:${SERVICE_NAME}")
echo {\"image\":\"$(base64 -w0 image.jpg)\", \"lang\":\"ja\"} | \
curl -X POST -H "Authorization: Bearer $(gcloud auth print-identity-token)" \
-H "Content-Type: application/json" -d @- \
-s ${SERVICE_URL}/api/post | jq .
```


## Deploy main application

```
gcloud iam service-accounts create llm-application
SERVICE_ACCOUNT=llm-application@$GOOGLE_CLOUD_PROJECT.iam.gserviceaccount.com

gcloud projects add-iam-policy-binding $GOOGLE_CLOUD_PROJECT \
  --member serviceAccount:$SERVICE_ACCOUNt \
  --role 'roles/firebase.sdkAdminServiceAgent'

gcloud projects add-iam-policy-binding $GOOGLE_CLOUD_PROJECT \
  --member serviceAccount:$SERVICE_ACCOUNt \
  --role 'roles/run.invoker'

#gcloud projects add-iam-policy-binding $GOOGLE_CLOUD_PROJECT \
#  --member serviceAccount:llm-application@$GOOGLE_CLOUD_PROJECT.iam.gserviceaccount.com \
#  --role 'roles/firebaseauth.admin'
#gcloud projects add-iam-policy-binding $GOOGLE_CLOUD_PROJECT \
#  --member serviceAccount:llm-application@$GOOGLE_CLOUD_PROJECT.iam.gserviceaccount.com \
#  --role 'roles/iam.serviceAccountTokenCreator'


gcloud builds submit ./src \
  --tag $REPO/llm-application

gcloud run deploy llm-app \
  --image $REPO/llm-application \
  --service-account $SERVICE_ACCOUNT \
  --region asia-northeast1 --allow-unauthenticated
```


## Config files

`.env.local`

```
# Backend service endpoints
ENGLISH_CORRECTION_API="https://english-correction-service-xxxxx-uc.a.run.app/api/post"
FASHION_COMPLIMENT_API="https://fashion-compliment-service-xxxxx-an.a.run.app/api/post"
```

`.firebase.js`

```
export const firebaseConfig = {
  apiKey: "xxxxx",
  authDomain: "xxxxxx",
  projectId: "xxxxx",
  storageBucket: "xxxx",
  messagingSenderId: "xxxx",
  appId: "xxxxx"
};
```
