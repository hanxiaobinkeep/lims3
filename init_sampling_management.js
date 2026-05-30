const mysql = require('mysql2/promise');

async function initSamplingManagement() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    port: 3307,
    user: 'root',
    password: 'lvba123456',
    database: 'lims_db'
  });

  try {
    console.log('开始初始化取样管理相关表...');

    // 读取并执行SQL文件
    const fs = require('fs');
    const path = require('path');
    const sql = fs.readFileSync(path.join(__dirname, 'migrations', '008_add_sampling_management.sql'), 'utf8');
    
    // 分割并执行多个语句
    const statements = sql.split(';').filter(s => s.trim());
    for (const statement of statements) {
      if (statement.trim()) {
        await connection.execute(statement);
      }
    }

    console.log('取样管理相关表创建成功！');

    // 插入示例数据
    const [users] = await connection.execute('SELECT id FROM users LIMIT 1');
    const [requests] = await connection.execute('SELECT id, request_no FROM inspection_requests LIMIT 1');
    
    if (users.length > 0 && requests.length > 0) {
      const userId = users[0].id;
      const requestId = requests[0].id;
      
      // 插入示例取样记录
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

  } catch (error) {
    console.error('初始化取样管理失败:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

if (require.main === module) {
  initSamplingManagement().catch(console.error);
}

module.exports = initSamplingManagement;
