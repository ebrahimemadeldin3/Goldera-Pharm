import fs from 'node:fs';
import { createRequire } from 'node:module';
import { randomUUID } from 'node:crypto';
const root = '/Users/marwan/Documents/Golderapharm';
const require = createRequire(`${root}/goldBack/package.json`);
const { Client } = require('pg');
require('dotenv').config({ path: `${root}/goldBack/.env`, quiet: true });
const schema = 'goldera_qa_20261004_' + randomUUID().replaceAll('-', '').slice(0, 10);
const client = new Client({ connectionString: process.env.DATABASE_URL });
await client.connect();
try {
  await client.query('BEGIN');
  await client.query(`CREATE SCHEMA "${schema}"`);
  await client.query(`SET LOCAL search_path TO "${schema}"`);
  const raw = fs.readFileSync(`${root}/audit/2026-10-04/full-system/schema.sql`, 'utf8');
  const sql = raw.slice(raw.indexOf('-- CreateSchema')).replaceAll('"public"', `"${schema}"`);
  await client.query(sql.replace(/CREATE SCHEMA IF NOT EXISTS[^;]+;/, ''));
  await client.query('COMMIT');
} catch (error) { await client.query('ROLLBACK'); throw error; }
await client.end();
const url = new URL(process.env.DATABASE_URL);
url.searchParams.set('schema', schema);
fs.writeFileSync('/private/tmp/goldera-full-qa.json', JSON.stringify({ schema, databaseUrl: url.href }), { mode: 0o600 });
console.log(JSON.stringify({ schema, isolatedSchemaCreated: true }));
