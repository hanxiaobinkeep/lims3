const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');

async function fixPasswords() {
    const password = '123456';
    const saltRounds = 10;

    // 生成正确的 bcrypt 哈希值
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    console.log('生成的正确哈希值:', hashedPassword);

    // 验证哈希值
    const isValid = await bcrypt.compare(password, hashedPassword);
    console.log('哈希验证结果:', isValid);

    // 数据库连接配置
    const dbConfig = {
        host: 'localhost',
        port: 3307,
        user: 'root',
        password: 'lvba123456',
        database: 'lims_db'
    };

    let connection;
    try {
        // 连接数据库
        connection = await mysql.createConnection(dbConfig);
        console.log('数据库连接成功');

        // 更新所有用户的密码
        const [result] = await connection.execute(
            'UPDATE users SET password = ?',
            [hashedPassword]
        );
        console.log(`成功更新 ${result.affectedRows} 条用户记录`);

        // 验证更新结果
        const [rows] = await connection.execute(
            'SELECT id, username, password FROM users LIMIT 1'
        );
        if (rows.length > 0) {
            console.log('验证更新后的记录:');
            console.log('  用户ID:', rows[0].id);
            console.log('  用户名:', rows[0].username);
            console.log('  新密码哈希:', rows[0].password);

            // 验证新密码哈希是否正确
            const verifyNewHash = await bcrypt.compare(password, rows[0].password);
            console.log('新密码哈希验证结果:', verifyNewHash ? '成功' : '失败');
        }

        console.log('\n密码修复完成！');
    } catch (error) {
        console.error('数据库操作失败:', error.message);
    } finally {
        if (connection) {
            await connection.end();
            console.log('数据库连接已关闭');
        }
    }
}

fixPasswords();
