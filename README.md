

```
gcloud artifacts repositories create llm-app-repo\
  --repository-format docker \
  --location asia-northeast1 \
  --description "Docker repository for llm-application"

gcloud iam service-accounts create llm-application

gcloud projects add-iam-policy-binding $GOOGLE_CLOUD_PROJECT \
  --member serviceAccount:llm-application@$GOOGLE_CLOUD_PROJECT.iam.gserviceaccount.com \
  --role 'roles/firebase.sdkAdminServiceAgent'

gcloud projects add-iam-policy-binding $GOOGLE_CLOUD_PROJECT \
  --member serviceAccount:llm-application@$GOOGLE_CLOUD_PROJECT.iam.gserviceaccount.com \
  --role 'roles/run.invoker'

#gcloud projects add-iam-policy-binding $GOOGLE_CLOUD_PROJECT \
#  --member serviceAccount:llm-application@$GOOGLE_CLOUD_PROJECT.iam.gserviceaccount.com \
#  --role 'roles/firebaseauth.admin'
#gcloud projects add-iam-policy-binding $GOOGLE_CLOUD_PROJECT \
#  --member serviceAccount:llm-application@$GOOGLE_CLOUD_PROJECT.iam.gserviceaccount.com \
#  --role 'roles/iam.serviceAccountTokenCreator'



gcloud builds submit ./src \
  --tag asia-northeast1-docker.pkg.dev/$GOOGLE_CLOUD_PROJECT/llm-app-repo/llm-app

gcloud run deploy llm-app \
  --image asia-northeast1-docker.pkg.dev/$GOOGLE_CLOUD_PROJECT/llm-app-repo/llm-app \
  --service-account llm-application@$GOOGLE_CLOUD_PROJECT.iam.gserviceaccount.com \
  --region asia-northeast1 --allow-unauthenticated
```
