# Deploying to AWS Amplify (Next.js 15 SSR)

This app uses Next.js App Router with API routes (SSR). Amplify must bundle the `.next` output.

## Build settings (amplify.yml)

- preBuild: `npm install`
- build: `npm run build`
- artifacts.baseDirectory: `.next`
- artifacts.files: `**/*`
- cache: `node_modules/**/*` and `.next/cache/**/*`

## Environment variables (Amplify Console → App settings → Environment variables)

- `MONGODB_URI` — your MongoDB connection string
- `MONGODB_DB` — optional DB name (defaults to `theratreat`)
- `ADMIN_KEY` — required header `x-admin-key` for admin endpoints

## Node runtime

- Use Node 18/20. `package.json` specifies `"engines": { "node": ">=18.17 <23" }`.

## Redeploy cleanly

- In Amplify Console, start a new build and choose "Clear cache" so new `amplify.yml` is used.

## Networking (MongoDB Atlas)

- If using Atlas IP allowlists, Amplify SSR uses dynamic egress IPs. Either allow `0.0.0.0/0` (dev) or set up VPC/PrivateLink. Otherwise API calls may fail at runtime.
