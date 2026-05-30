const mysql = require('mysql2/promise');

async function fix() {
  const c = await mysql.createConnection({
    host: 'localhost',
    port: 3307,
    user: 'root',
    password: 'lvba123456',
    database: 'lims_db'
  });

  try {
    await c.execute("ALTER TABLE roles ADD COLUMN description VARCHAR(255) COMMENT '角色描述'");
    console.log('Added description to roles');
  } catch(e) {
    console.log('roles.description:', e.message.substring(0, 60));
  }

  try {
    await c.execute("ALTER TABLE samples ADD COLUMN result_status VARCHAR(50) COMMENT '结果状态'");
    console.log('Added result_status to samples');
  } catch(e) {
    console.log('samples.result_status:', e.message.substring(0, 60));
  }

  await c.end();
}

fix().catch(e => {
  console.error('Error:', e.message);
  process.exit(1);
});
