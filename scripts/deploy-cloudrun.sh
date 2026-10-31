#!/usr/bin/env bash
# Build and deploy DevCraft Studio to Google Cloud Run.
#
# Required environment variables:
#   PROJECT_ID            GCP project ID
#   APP_URL               final public URL (https://...)
#   CLOUD_SQL_INSTANCE    project:region:instance
#   MEDIA_BUCKET          Cloud Storage bucket for uploads
#   SERVICE_ACCOUNT       runtime service account email
#   ADMIN_EMAIL           first super admin email
#
# Optional:
#   REGION=asia-southeast2
#   SERVICE=devcraft-studio
#   REPO=devcraft
#   IMAGE_TAG=latest
#   DB_DATABASE=devcraft
#   DB_USERNAME=devcraft
#   ADMIN_NAME="DevCraft Admin"
#   MIN_INSTANCES=0
#   MAX_INSTANCES=1
#   APP_KEY_SECRET=devcraft-app-key
#   DB_PASSWORD_SECRET=devcraft-db-password
#   ADMIN_PASSWORD_SECRET=devcraft-admin-password
set -euo pipefail

if ! command -v gcloud >/dev/null 2>&1; then
    echo "gcloud tidak ditemukan. Install Google Cloud SDK dulu: https://cloud.google.com/sdk/docs/install" >&2
    exit 1
fi

: "${PROJECT_ID:?Set PROJECT_ID}"
: "${APP_URL:?Set APP_URL (https://...)}"
: "${CLOUD_SQL_INSTANCE:?Set CLOUD_SQL_INSTANCE (project:region:instance)}"
: "${MEDIA_BUCKET:?Set MEDIA_BUCKET}"
: "${SERVICE_ACCOUNT:?Set SERVICE_ACCOUNT}"
: "${ADMIN_EMAIL:?Set ADMIN_EMAIL}"

case "$APP_URL" in
    https://*) ;;
    *)
        echo "APP_URL harus berupa URL https://..." >&2
        exit 1
        ;;
esac

if ! gcloud auth print-access-token >/dev/null 2>&1; then
    echo "Belum login ke gcloud. Jalankan: gcloud auth login && gcloud config set project ${PROJECT_ID}" >&2
    exit 1
fi

REGION="${REGION:-asia-southeast2}"
SERVICE="${SERVICE:-devcraft-studio}"
REPO="${REPO:-devcraft}"
IMAGE_TAG="${IMAGE_TAG:-latest}"
DB_DATABASE="${DB_DATABASE:-devcraft}"
DB_USERNAME="${DB_USERNAME:-devcraft}"
ADMIN_NAME="${ADMIN_NAME:-DevCraft Admin}"
MIN_INSTANCES="${MIN_INSTANCES:-0}"
MAX_INSTANCES="${MAX_INSTANCES:-1}"
APP_KEY_SECRET="${APP_KEY_SECRET:-devcraft-app-key}"
DB_PASSWORD_SECRET="${DB_PASSWORD_SECRET:-devcraft-db-password}"
ADMIN_PASSWORD_SECRET="${ADMIN_PASSWORD_SECRET:-devcraft-admin-password}"

IMAGE="${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPO}/${SERVICE}:${IMAGE_TAG}"

if ! gcloud artifacts repositories describe "$REPO" \
    --project "$PROJECT_ID" --location "$REGION" >/dev/null 2>&1; then
    echo "Creating Artifact Registry repository ${REPO}..."
    gcloud artifacts repositories create "$REPO" \
        --project "$PROJECT_ID" \
        --location "$REGION" \
        --repository-format docker \
        --description "DevCraft Studio container images"
fi

echo "Building ${IMAGE} with Cloud Build..."
gcloud builds submit \
    --project "$PROJECT_ID" \
    --tag "$IMAGE" \
    .

echo "Deploying ${SERVICE} to Cloud Run (${REGION})..."
gcloud run deploy "$SERVICE" \
    --project "$PROJECT_ID" \
    --region "$REGION" \
    --platform managed \
    --image "$IMAGE" \
    --service-account "$SERVICE_ACCOUNT" \
    --allow-unauthenticated \
    --port 8080 \
    --execution-environment gen2 \
    --memory 1Gi \
    --cpu 1 \
    --concurrency 40 \
    --timeout 60 \
    --min-instances "$MIN_INSTANCES" \
    --max-instances "$MAX_INSTANCES" \
    --cpu-boost \
    --add-cloudsql-instances "$CLOUD_SQL_INSTANCE" \
    --add-volume "mount-path=/var/www/storage/app/public,type=cloud-storage,bucket=${MEDIA_BUCKET},readonly=false,mount-options=uid=33;gid=33" \
    --set-env-vars "^|^APP_NAME=DevCraft Studio|APP_ENV=production|APP_DEBUG=false|APP_URL=${APP_URL}|APP_LOCALE=id|APP_TIMEZONE=Asia/Jakarta|LOG_CHANNEL=stderr|DB_CONNECTION=mysql|DB_DATABASE=${DB_DATABASE}|DB_USERNAME=${DB_USERNAME}|CLOUD_SQL_CONNECTION_NAME=${CLOUD_SQL_INSTANCE}|SESSION_DRIVER=database|SESSION_SECURE_COOKIE=true|CACHE_STORE=database|QUEUE_CONNECTION=sync|FILESYSTEM_DISK=public|CLOUD_STORAGE_MOUNT=true|INERTIA_SSR_ENABLED=true|INERTIA_SSR_URL=http://127.0.0.1:13714|ADMIN_NAME=${ADMIN_NAME}|ADMIN_EMAIL=${ADMIN_EMAIL}" \
    --set-secrets "APP_KEY=${APP_KEY_SECRET}:latest,DB_PASSWORD=${DB_PASSWORD_SECRET}:latest,ADMIN_PASSWORD=${ADMIN_PASSWORD_SECRET}:latest"

echo
echo "Deployed. Service URL:"
gcloud run services describe "$SERVICE" \
    --project "$PROJECT_ID" \
    --region "$REGION" \
    --format 'value(status.url)'

echo "Health check: ${APP_URL}/up"
