# Admin Dashboard

This adds a minimal admin dashboard for TheraTreat with sections to:

- Verify therapist, clinic, and vendor forms
- Manage blogs (add/toggle publish/delete)
- Open TheraSelf tests and view mock test status

## Routes

- `/admin` – Dashboard overview
- `/admin/verify/therapists` – Therapist verifications
- `/admin/verify/clinics` – Clinic verifications
- `/admin/verify/vendors` – Vendor verifications
- `/admin/blogs` – Blog manager
- `/theraself/tests` – TheraSelf tests

## API (mock)

Under `app/api/admin/*` there are mock endpoints that return sample JSON and accept approve/reject actions. Replace with real Prisma/MongoDB logic as needed.

- `GET /api/admin/therapists/pending`
- `POST /api/admin/therapists/:id/approve|reject`
- `GET /api/admin/clinics/pending`
- `POST /api/admin/clinics/:id/approve|reject`
- `GET /api/admin/vendors/pending`
- `POST /api/admin/vendors/:id/approve|reject`
- `GET|POST /api/admin/blogs`

## Next steps

- Auth gate: restrict `/admin/*` to admin users via middleware and session role.
- Connect DB: wire to `prisma` models or `lib/database.ts` and replace mocks.
- Validation: add server-side validation and error handling.
- Audit logs: persist approve/reject actions with actor and timestamp.

## Dev

Run the dev server and open the dashboard:

```powershell
npm install
npm run dev
# open http://localhost:3000/admin
```