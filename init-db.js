import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function initDatabase() {
    const sqlFilePath = path.join(__dirname, 'migrations', '001_init.sql');

    let connection;
    try {
        connection = await mysql.createConnection({
            host: 'localhost',
            port: 3307,
            user: 'root',
            password: 'lvba123456',
            multipleStatements: true
        });

        console.log('已连接到MySQL服务器');

        await connection.query('DROP DATABASE IF EXISTS lims_db');
        console.log('已清除旧的 lims_db 数据库');

        const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
        console.log(`已读取SQL文件: ${sqlFilePath}`);

        await connection.query(sqlContent);
        console.log('SQL脚本执行成功！');

        const [users] = await connection.query('SELECT id, username, real_name, role_id, department, status FROM lims_db.users');
        console.log('\n验证 - users表数据:');
        console.table(users);

        const [roles] = await connection.query('SELECT id, name, code, status FROM lims_db.roles');
        console.log('\n验证 - roles表数据:');
        console.table(roles);

        const [tables] = await connection.query(`
            SELECT table_name FROM information_schema.tables
            WHERE table_schema = 'lims_db'
        `);
        console.log(`\n验证 - lims_db数据库共有 ${tables.length} 张表:`);
        tables.forEach(t => console.log('  - ' + t.TABLE_NAME));

        console.log('\n数据库初始化完成！');
    } catch (error) {
        console.error('执行出错:', error.message);
        process.exit(1);
    } finally {
        if (connection) await connection.end();
    }
}

initDatabase();
