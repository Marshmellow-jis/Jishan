import mysql, { type Pool, type RowDataPacket } from 'mysql2/promise';
import { randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

let pool: Pool | undefined;
let ready = false;
let migrationRun: Promise<void> | undefined;

function getPool(): Pool {
  if (pool) return pool;
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error('Managed database is not configured.');
  pool = mysql.createPool(databaseUrl);
  return pool;
}

export async function ensureDatabase(): Promise<void> {
  if (ready) return;
  if (migrationRun) return migrationRun;
  migrationRun = (async () => {
    const connection = await getPool().getConnection();
    try {
      await connection.query(`CREATE TABLE IF NOT EXISTS schema_migrations (
        version VARCHAR(80) NOT NULL PRIMARY KEY,
        applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);
      const [applied] = await connection.execute<(RowDataPacket & { version: string })[]>(
        'SELECT version FROM schema_migrations WHERE version = ?', ['001_initial'],
      );
      if (applied.length === 0) {
        const thisDirectory = path.dirname(fileURLToPath(import.meta.url));
        const migrationPath = path.resolve(thisDirectory, 'migrations/001_initial.sql');
        const sql = await readFile(migrationPath, 'utf8');
        for (const statement of sql.split(';').map((part) => part.trim()).filter(Boolean)) {
          await connection.query(statement);
        }
        await connection.execute('INSERT INTO schema_migrations (version) VALUES (?)', ['001_initial']);
      }
      ready = true;
    } finally {
      connection.release();
    }
  })();
  try {
    await migrationRun;
  } catch (error) {
    migrationRun = undefined;
    throw error;
  }
}

export async function query<T extends RowDataPacket[]>(sql: string, params: unknown[] = []): Promise<T> {
  await ensureDatabase();
  const [rows] = await getPool().execute<T>(sql, params);
  return rows;
}

export async function execute(sql: string, params: unknown[] = []) {
  await ensureDatabase();
  const [result] = await getPool().execute(sql, params);
  return result;
}

export async function upsertFarmer(openId: string, name: string, email?: string | null) {
  await ensureDatabase();
  const id = randomUUID();
  await getPool().execute(
    `INSERT INTO users (id, open_id, display_name, email, role)
     VALUES (?, ?, ?, ?, 'farmer')
     ON DUPLICATE KEY UPDATE display_name = VALUES(display_name), email = VALUES(email)`,
    [id, openId, name.slice(0, 160) || 'Farmer', email?.slice(0, 254) || null],
  );
  const [rows] = await getPool().execute<(RowDataPacket & { id: string; open_id: string; display_name: string; email: string | null; role: string })[]>(
    'SELECT id, open_id, display_name, email, role FROM users WHERE open_id = ? LIMIT 1',
    [openId],
  );
  const user = rows[0];
  if (!user) throw new Error('Could not resolve the signed-in user.');
  return { id: user.id, openId: user.open_id, name: user.display_name, email: user.email, role: user.role };
}

export async function getUserByOpenId(openId: string) {
  await ensureDatabase();
  const [rows] = await getPool().execute<(RowDataPacket & { id: string; open_id: string; display_name: string; email: string | null; role: string })[]>(
    'SELECT id, open_id, display_name, email, role FROM users WHERE open_id = ? LIMIT 1',
    [openId],
  );
  const user = rows[0];
  return user ? { id: user.id, openId: user.open_id, name: user.display_name, email: user.email, role: user.role } : null;
}
