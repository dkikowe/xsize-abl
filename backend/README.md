# XSIZE Backend

Backend API for the XSIZE/TAP partner mobile app.

## Local Start

```bash
npm install
cp .env.example .env
npm start
```

The server listens on `http://localhost:4000` by default.

## Environment

Required variables:

- `MONGODB_URI`
- `AWS_BUCKET_NAME`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION`

Optional variables:

- `PORT`
- `MAX_IMAGE_SIZE_MB`
- `CLIENT_ORIGIN`
- `ADMIN_PASSWORD`
