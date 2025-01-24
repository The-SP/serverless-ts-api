## CRUD API using the Serverless V.3 Framework with TypeScript and Node.js

CRUD API built using the Serverless V.3 Framework, TypeScript, and Node.js. It provides endpoints to create, read, update, and delete tasks, with a PostgreSQL database for storage.

### Setup environment variables
```bash
PGUSER=your_username
PGHOST=your_host
PGDATABASE=your_database
PGPASSWORD=your_password
PGPORT=5432
```

### Usage

- **Running locally**: `serverless offline`
- **Run unit tests**: `npm test`
- **Check test coverage**: `npm run test:coverage`