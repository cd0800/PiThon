# PiThon

PiThon is a React and Vite learning dashboard with a local SQLite-backed API.

## Run Locally

Install dependencies:

```bash
npm install
```

Start the backend API:

```bash
npm run backend
```

Start the frontend in a second terminal:

```bash
npm run dev
```

The frontend proxies `/api` requests to the backend during development.

For a production-style local run:

```bash
npm run build
npm start
```

The Node server serves `dist` when it exists and continues to expose `/api`.

## Current Data

The app is wired for users, classes, assignments, questions, answers, progress, and feedback. Runtime data is stored in `server/data/pithon.sqlite`, which is created automatically when the backend starts.

The JSON files in `server/data` are seed/import files. They are used to initialise SQLite when a collection is empty; the running app reads and writes SQLite.

Set `PITHON_DATA_KEY` in production so encrypted user fields are protected by an environment-specific key.

Optional production environment variables:

- `PITHON_DATA_KEY`: secret key used for encrypted user fields.
- `PITHON_ALLOWED_ORIGIN`: browser origin allowed to call the API.
- `PORT`: API/static server port.

Security notes:

- Passwords are hashed with `scrypt`.
- Session tokens are stored hashed in SQLite and expire after 8 hours.
- Browser bearer tokens are kept in `sessionStorage`.
- The server applies security headers, JSON body limits, basic rate limiting, and protected-route authorization checks.

The seeded question topics are:

- Arithmetic
- Basic algebra

## Checks

```bash
npm run lint
npm run build
node --check server/server.js
```
