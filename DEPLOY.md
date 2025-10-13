Amplify deployment checklist

1) Add environment variables in Amplify Console
-----------------------------------------------
- Open the Amplify Console for your app.
- Go to App settings → Environment variables.
- Add the following (replace values with your real secrets):
  - MONGODB_URI = mongodb+srv://<user>:<pass>@<cluster>/theratreat?retryWrites=true&w=majority
  - MONGODB_DB = theratreat
  - JWT_SECRET = <long-random-secret>
  - NEXT_PUBLIC_RAZORPAY_KEY_ID = <public-razorpay-key>
  - RAZORPAY_KEY_ID = <razorpay-key>
  - RAZORPAY_KEY_SECRET = <razorpay-secret>
  - (optional) REQUIRE_DB = 1  # Enforce no mock fallback
  - (optional for debugging) DB_DEBUG = 1
- Save and Redeploy the branch.

2) If you prefer SSM/Secrets Manager
------------------------------------
- Ensure parameters live under the path Amplify expects (logs showed /amplify/dz89g5jq42izq/main/).
- Confirm Amplify service role has permission to read SSM parameters in that path.
- Minimal IAM policy for SSM (replace REGION and ACCOUNT_ID):

  {
    "Version": "2012-10-17",
    "Statement": [
      {
        "Effect": "Allow",
        "Action": ["ssm:GetParameters","ssm:GetParameter","ssm:GetParametersByPath"],
        "Resource": "arn:aws:ssm:REGION:ACCOUNT_ID:parameter/amplify/dz89g5jq42izq/*"
      }
    ]
  }

3) Verify after deploy
----------------------
- Visit: https://<your-app>/api/health/db
- Expected response when configured correctly:
  { "ok": true, "mock": false, "databaseName": "theratreat" }
- If it still returns mock:true, check Amplify build logs for the env check output and the "Failed to set up process.env.secrets" warning.

4) Security: rotate leaked secrets
----------------------------------
- The repo previously contained live secrets. Rotate all leaked credentials immediately:
  - MongoDB user/password (create new DB user, update MONGODB_URI, delete old user)
  - JWT secret
  - Razorpay keys
  - Twilio, SendGrid, Cloudinary, 100ms keys

6) Notifications & Reminder Scheduler
------------------------------------
- Add env vars for notifications:
  - SENDGRID_API_KEY, SENDGRID_FROM_EMAIL
  - TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_SMS_FROM (and optionally TWILIO_WHATSAPP_FROM)
  - NEXT_PUBLIC_BASE_URL (e.g., https://your-domain.com)
  - CRON_SECRET (required by /api/cron/send-reminders)
- Schedule a recurring job to POST to `/api/cron/send-reminders` with header `x-cron-key: $CRON_SECRET` every 5–10 minutes.
  - Vercel: Project → Settings → Cron Jobs → Add POST job to `/api/cron/send-reminders`
  - Amplify/Render: Use their scheduled tasks to call the URL with the header.
  - Self-hosted: OS cron + curl/PowerShell Invoke-RestMethod.
- See NOTIFICATIONS.md for detailed steps and test instructions.
- After rotation, remove `.env.local` from your machine or keep it out of git by adding to `.gitignore`.

5) Optional: enforce in CI
--------------------------
- We added `scripts/check-required-env.mjs` which runs in Amplify preBuild to fail early if required envs are missing.
- Keep `REQUIRE_DB=1` to make builds fail instead of silently using mock DB once you are confident the envs are present.

If you want, I can also provide the exact Amplify Console UI steps with screenshots for your account (requires you to grant me view access).