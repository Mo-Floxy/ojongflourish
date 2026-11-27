import mysql from 'mysql2/promise';
import { env, dbSslConfig } from '../config/env.js';

const baseConfig = {
  host: env.db.host,
  port: env.db.port,
  user: env.db.user,
  password: env.db.password,
  database: env.db.name,
  charset: 'utf8mb4',
  timezone: '+00:00',
  namedPlaceholders: false,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: dbSslConfig(),
};

export const pool = mysql.createPool(baseConfig);

export async function query(sql, params = []) {
  const [result] = await pool.execute(sql, params);
  return result;
}

export async function queryOne(sql, params = []) {
  const [rows] = await pool.execute(sql, params);
  return rows[0] ?? null;
}

export async function withTransaction(callback) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function createDatabase() {
  const connection = await mysql.createConnection({
    ...baseConfig,
    database: undefined,
    multipleStatements: false,
  });
  try {
    await connection.query(
      `CREATE DATABASE IF NOT EXISTS \`${env.db.name.replace(/[^a-zA-Z0-9_]/g, '')}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
    );
  } finally {
    await connection.end();
  }
}

export async function pingDatabase() {
  const connection = await pool.getConnection();
  try {
    await connection.ping();
    return true;
  } finally {
    connection.release();
  }
}
