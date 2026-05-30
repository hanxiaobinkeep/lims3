const mysql = require('mysql2/promise');

async function initDocumentManagement() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    port: 3307,
    user: 'root',
    password: 'lvba123456',
    database: 'lims_db'
  });

  try {
    console.log('开始创建文件管理相关表...');

    const fs = require('fs');
    const path = require('path');
    const sql = fs.readFileSync(path.join(__dirname, 'migrations/014_add_document_management.sql'), 'utf8');
    
    const statements = sql.split(';').filter(s => s.trim());
    for (const statement of statements) {
      if (statement.trim()) {
        await connection.execute(statement);
      }
    }

    console.log('文件管理相关表创建成功！');

    // 插入文件分类数据
    const insertCategory = `
      INSERT INTO document_categories (category_code, category_name, parent_id, level, sort_order, description) 
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    await connection.execute(insertCategory, ['QM', '质量手册', 0, 1, 1, '实验室质量管理体系纲领性文件']);
    await connection.execute(insertCategory, ['QP', '程序文件', 0, 1, 2, '实验室质量管理体系程序文件']);
    await connection.execute(insertCategory, ['WI', '作业指导书', 0, 1, 3, '实验室具体操作指导文件']);
    await connection.execute(insertCategory, ['QR', '记录表格', 0, 1, 4, '实验室记录用表格模板']);
    await connection.execute(insertCategory, ['SOP', '标准操作规程', 0, 1, 5, '标准操作规程文件']);

    console.log('文件分类数据插入成功！');

    // 获取分类ID
    const [categoryRows] = await connection.execute('SELECT id FROM document_categories ORDER BY id');
    const categoryIds = categoryRows.map(r => r.id);

    if (categoryIds.length > 0) {
      // 插入示例文件数据
      const insertDocument = `
        INSERT INTO documents (
          document_code, document_name, category_id, document_type, version, status,
          content, author, author_name, effective_date, is_current_version, remark
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      await connection.execute(insertDocument, [
        'QM-001-2026',
        '质量手册',
        categoryIds[0],
        '质量手册',
        '1.0',
        'approved',
        '本质量手册规定了实验室质量管理体系的要求...',
        1,
        '系统管理员',
        '2026-01-01',
        true,
        '实验室质量管理体系纲领性文件'
      ]);

      await connection.execute(insertDocument, [
        'QP-001-2026',
        '文件控制程序',
        categoryIds[1],
        '程序文件',
        '1.0',
        'approved',
        '本程序规定了实验室文件的控制要求...',
        1,
        '系统管理员',
        '2026-01-01',
        true,
        '文件管理控制程序'
      ]);

      await connection.execute(insertDocument, [
        'WI-001-2026',
        'HPLC操作指导书',
        categoryIds[2],
        '作业指导书',
        '1.0',
        'approved',
        '本指导书规定了高效液相色谱仪的操作方法...',
        1,
        '系统管理员',
        '2026-01-01',
        true,
        'HPLC仪器操作指导'
      ]);

      await connection.execute(insertDocument, [
        'SOP-001-2026',
        '样品管理规程',
        categoryIds[4],
        '标准操作规程',
        '1.0',
        'approved',
        '本规程规定了样品管理的具体要求...',
        1,
        '系统管理员',
        '2026-01-01',
        true,
        '样品接收、存储、处置管理'
      ]);

      console.log('示例文件数据插入成功！');
    }

  } catch (error) {
    console.error('初始化失败:', error);
  } finally {
    await connection.end();
  }
}

initDocumentManagement();
