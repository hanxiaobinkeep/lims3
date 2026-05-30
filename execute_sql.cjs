const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function executeSqlFile() {
  const sqlFilePath = path.join(__dirname, 'migrations', '002_add_tables.sql');

  let connection;
  try {
    connection = await mysql.createConnection({
      host: 'localhost',
      port: 3307,
      user: 'root',
      password: 'lvba123456',
      database: 'lims_db',
      multipleStatements: true
    });

    console.log('Connected to MySQL database.');

    const sql = fs.readFileSync(sqlFilePath, 'utf8');
    console.log(`Read SQL file: ${sqlFilePath}`);
    console.log(`SQL length: ${sql.length} characters`);

    const [results] = await connection.query(sql);
    console.log('SQL script executed successfully.');
    console.log('Results:', JSON.stringify(results, null, 2));

    const [tables] = await connection.query(`
      SELECT TABLE_NAME
      FROM INFORMATION_SCHEMA.TABLES
      WHERE TABLE_SCHEMA = 'lims_db'
      AND TABLE_NAME IN ('stability_protocols', 'environment_plans', 'environment_samples', 'deviation_investigations')
      ORDER BY TABLE_NAME
    `);

    console.log('\n--- Verification: Newly created tables ---');
    if (tables.length === 0) {
      console.log('No target tables found.');
    } else {
      tables.forEach((row, index) => {
        console.log(`${index + 1}. ${row.TABLE_NAME}`);
      });
      console.log(`\nTotal: ${tables.length} tables created/found.`);
    }

  } catch (error) {
    console.error('Error executing SQL:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\nDatabase connection closed.');
    }
  }
}

executeSqlFile();
