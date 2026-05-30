const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function initSamplingManagement() {
  const sqlFilePath = path.join(__dirname, 'migrations', '008_add_sampling_management.sql');

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

    // 插入示例数据
    const [users] = await connection.query('SELECT id FROM users LIMIT 1');
    const [requests] = await connection.query('SELECT id, request_no FROM inspection_requests LIMIT 1');
    
    if (users.length > 0 && requests.length > 0) {
      const userId = users[0].id;
      const requestId = requests[0].id;
      
      await connection.execute(
        `INSERT INTO sampling_records 
         (request_id, sample_no, sample_name, batch_no, sampling_person_id, sampling_time, sampling_quantity, sampling_unit, sampling_location, storage_location, status, created_by) 
         VALUES (?, ?, ?, ?, ?, NOW(), ?, ?, ?, ?, ?, ?)`,
        [
          requestId,
          'S' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + '001',
          '示例样品',
          'BATCH20260501',
          userId,
          100.00,
          'g',
          '原料仓库A区',
          '留样室1号柜',
          'pending',
          userId
        ]
      );

      console.log('示例取样记录插入成功！');
    }

    const [tables] = await connection.query(`
      SELECT TABLE_NAME
      FROM INFORMATION_SCHEMA.TABLES
      WHERE TABLE_SCHEMA = 'lims_db'
      AND TABLE_NAME IN ('sampling_records', 'sample_handover_records', 'label_print_records')
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

initSamplingManagement();
