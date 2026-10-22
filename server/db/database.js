// Opens (or creates) the SQLite database file and applies the schema.
// Every other server file imports `db` from here, so there is exactly
// one shared connection for the whole app.

import fs from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3';

const PROJECT_ROOT = path.join(import.meta.dirname, '..', '..');

// The DB file lives in /data. Override with the DB_PATH environment variable if needed.
export const DB_PATH = process.env.DB_PATH ?? path.join(PROJECT_ROOT, 'data', 'hobbies.db');

// Make sure the folder exists before SQLite tries to create the file in it.
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

const db = new Database(DB_PATH);

// WAL mode: faster writes and readers don't block the writer.
db.pragma('journal_mode = WAL');
// SQLite does NOT enforce foreign keys unless you switch them on, per connection.
db.pragma('foreign_keys = ON');

// Create tables if they don't exist yet.
const schema = fs.readFileSync(path.join(import.meta.dirname, 'schema.sql'), 'utf8');
db.exec(schema);

export default db;
