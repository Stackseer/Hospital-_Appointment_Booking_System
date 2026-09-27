# Hospital Appointment Frontend — Redesigned UI

This is a drop-in replacement for the existing React frontend.

## What changed
- Modern healthcare dashboard with responsive sidebar/topbar
- Redesigned doctor directory with search, cards, availability states and booking CTA
- 3-step appointment booking flow: Doctor → Date & Time → Patient Details
- Redesigned appointment history with filters, status badges and cancellation action
- Responsive mobile navigation
- Loading skeletons, empty states and error states
- Inline SVG icons; no new UI library or dependency required
- Existing Spring Boot REST API contract is preserved

## Run

From this `frontend` folder:

```powershell
npm install
npm start
```

The frontend expects the backend at:

`http://localhost:8080/api`

You can override it with `REACT_APP_API_URL` if needed.

## Important

Do not copy the old `node_modules` folder over this version. Run `npm install` after replacing the frontend folder.
