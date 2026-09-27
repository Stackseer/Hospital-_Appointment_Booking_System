# Hospital Appointment Booking System

A full-stack appointment booking app:

- **Backend** — Java 17 + Spring Boot REST API, H2 in-memory database (no DB install needed)
- **Frontend** — React (Create React App) + plain CSS, talks to the API over `fetch`

```
hospital-appointment-system/
├── backend/     Spring Boot REST API (Maven)
└── frontend/    React single-page app
```

## Running the backend

Requires Java 17+ and Maven (or use the included wrapper if you add one).

```bash
cd backend
mvn spring-boot:run
```

The API starts on **http://localhost:8080**. It seeds 5 doctors and 2 patients on
startup (`src/main/resources/data.sql`) and resets each time you restart it, since
it uses an in-memory H2 database. To inspect the data directly, open
http://localhost:8080/h2-console (JDBC URL: `jdbc:h2:mem:hospitaldb`, user `sa`,
blank password).

To use a real database instead, replace the `spring.datasource.*` properties in
`src/main/resources/application.properties` with your MySQL/Postgres connection
details and add the matching driver dependency to `pom.xml`.

## Running the frontend

Requires Node.js 18+.

```bash
cd frontend
npm install
npm start
```

Opens on **http://localhost:3000** and calls the API at `http://localhost:8080/api`
by default. Override this with an env var if needed:

```bash
REACT_APP_API_URL=http://localhost:8080/api npm start
```

## REST API reference

| Method | Endpoint                              | Description                                   |
|--------|----------------------------------------|------------------------------------------------|
| GET    | `/api/doctors`                         | List doctors (optional `?specialization=`)     |
| GET    | `/api/doctors/{id}`                    | Get one doctor                                 |
| POST   | `/api/doctors`                         | Add a doctor                                   |
| PUT    | `/api/doctors/{id}`                    | Update a doctor                                |
| DELETE | `/api/doctors/{id}`                    | Remove a doctor                                |
| GET    | `/api/patients`                        | List patients                                  |
| POST   | `/api/patients`                        | Add a patient                                  |
| GET    | `/api/appointments`                    | List appointments (`?doctorId=`, `?patientId=`, `?date=`) |
| POST   | `/api/appointments`                    | Book an appointment (see payload below)        |
| PATCH  | `/api/appointments/{id}/reschedule`    | Move to a new date/time                        |
| PATCH  | `/api/appointments/{id}/status`        | Set status (`SCHEDULED`/`COMPLETED`/`CANCELLED`) |
| PATCH  | `/api/appointments/{id}/cancel`        | Shortcut to cancel                             |
| DELETE | `/api/appointments/{id}`               | Delete an appointment                          |

**Booking payload** (`POST /api/appointments`) — pass either `patientId` for a
returning patient, or `newPatient` to register one on the fly (matched by email
if it already exists):

```json
{
  "doctorId": 1,
  "newPatient": { "name": "Aarav Sharma", "email": "aarav@example.com", "phone": "9876543210" },
  "appointmentDate": "2026-10-02",
  "timeSlot": "10:30:00",
  "reason": "Annual checkup"
}
```

The API rejects a booking with **409 Conflict** if that doctor already has a
scheduled appointment at the same date and time slot — this is enforced both at
the service layer and with a database unique constraint, so it holds up even
under concurrent requests.

## Notes

- CORS is pre-configured in `backend/.../config/CorsConfig.java` to allow the
  React dev server (`localhost:3000`). Update the allowed origin before deploying.
- The booking screen pulls live availability for the selected doctor/date and only
  shows open half-hour slots (09:00–16:30); this is a simple fixed schedule you can
  adjust in `frontend/src/components/BookAppointment.jsx`.
- For production: swap H2 for a real database, add authentication, and serve the
  React build (`npm run build`) behind your API or a static host.
