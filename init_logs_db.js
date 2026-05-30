import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function initLogsDb() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    port: 3307,
    user: 'root',
    password: 'lvba123456',
    multipleStatements: true
  });

  try {
    const sql = fs.readFileSync(path.join(__dirname, 'migrations/003_add_system_logs.sql'), 'utf8');
    console.log('开始执行系统日志表创建...');
    await connection.query(sql);
    console.log('✅ 系统日志表创建成功！');
  } catch (error) {
    console.error('❌ 执行失败:', error.message);
  } finally {
    await connection.end();
  }
}

initLogsDb();
