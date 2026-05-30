const mysql = require('mysql2/promise');
const fs = require('fs');

async function run() {
  const pool = mysql.createPool({
    host: 'localhost',
    port: 3307,
    user: 'root',
    password: 'lvba123456',
    database: 'lims_db',
    waitForConnections: true,
    connectionLimit: 10
  });

  const sql = fs.readFileSync('migrations/020_add_culture_media.sql', 'utf8');
  const statements = sql.split(';').filter(s => s.trim());

  for (const statement of statements) {
    if (statement.trim()) {
      try {
        await pool.query(statement);
        console.log('OK:', statement.substring(0, 60).replace(/\n/g, ' '));
      } catch (err) {
        if (err.code === 'ER_TABLE_EXISTS_ERROR') {
          console.log('SKIP (table exists):', statement.substring(0, 40));
        } else if (err.code === 'ER_DUP_ENTRY') {
          console.log('SKIP (dup entry):', statement.substring(0, 40));
        } else {
          console.error('ERROR:', err.message, '|', statement.substring(0, 60));
        }
      }
    }
  }

  console.log('Migration done!');
  await pool.end();
}

run().catch(console.error);
