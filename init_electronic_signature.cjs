const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function initElectronicSignature() {
  const sqlFilePath = path.join(__dirname, 'migrations', '009_add_electronic_signature.sql');

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

    await connection.query(sql);
    console.log('SQL script executed successfully.');

    // 为现有用户创建默认的电子签名配置
    const [users] = await connection.query('SELECT id, real_name FROM users LIMIT 3');
    
    if (users.length > 0) {
      for (const user of users) {
        // 为每个用户创建批准类型的签名配置
        await connection.execute(
          `INSERT IGNORE INTO electronic_signatures 
           (user_id, signature_type, password_hash, is_active) 
           VALUES (?, 'approval', 'default_hash_for_new_users', TRUE)`,
          [user.id]
        );
        console.log(`为用户 ${user.real_name} 创建了电子签名配置`);
      }
    }

    const [tables] = await connection.query(`
      SELECT TABLE_NAME
      FROM INFORMATION_SCHEMA.TABLES
      WHERE TABLE_SCHEMA = 'lims_db'
      AND TABLE_NAME IN ('electronic_signatures', 'signature_records', 'signature_verifications')
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
    console.error('Error:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\nDatabase connection closed.');
    }
  }
}

initElectronicSignature();
