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
    await c.execute("ALTER TABLE data_reviews ADD COLUMN status VARCHAR(50) DEFAULT 'pending'");
    console.log('Added status to data_reviews');
  } catch(e) {
    console.log('data_reviews.status:', e.message.substring(0, 80));
  }

  await c.end();
}

fix().catch(e => {
  console.error('Error:', e.message);
  process.exit(1);
});
