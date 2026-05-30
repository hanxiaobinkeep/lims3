const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  port: 3307,
  user: 'root',
  password: 'lvba123456',
  database: 'lims_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function testQuery(iteration) {
  try {
    const [rows] = await pool.execute(
      'SELECT u.*, r.name as role_name, r.code as role_code, r.permissions FROM users u LEFT JOIN roles r ON u.role_id = r.id WHERE u.username = ? AND u.status = "active"',
      ['admin']
    );
    console.log(`Query ${iteration}: SUCCESS - found ${rows.length} user(s)`);
    return true;
  } catch (err) {
    console.log(`Query ${iteration}: FAILED - ${err.message}`);
    return false;
  }
}

async function runTests() {
  console.log('Testing 10 consecutive DB queries...\n');
  let success = 0;
  let failed = 0;

  for (let i = 1; i <= 10; i++) {
    const result = await testQuery(i);
    if (result) success++;
    else failed++;
    await new Promise(r => setTimeout(r, 200));
  }

  console.log(`\nResults: ${success} success, ${failed} failed`);
  await pool.end();
}

runTests();
