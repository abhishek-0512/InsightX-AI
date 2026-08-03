const mysql = require("mysql2/promise");
require("dotenv").config();

console.log("HOST      :", process.env.DB_HOST);
console.log("PORT      :", process.env.DB_PORT);
console.log("USER      :", process.env.DB_USER);
console.log("PASSWORD  :", process.env.DB_PASSWORD);
console.log("DATABASE  :", process.env.DB_NAME);

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

exports.pool = pool;

exports.importDataset = async (tableName, rows) => {

    if (!rows || rows.length === 0) return;

    const connection = await pool.getConnection();

    try {

        await connection.beginTransaction();

        // Get CSV headers
        const headers = Object.keys(rows[0]);

        // Create table using the CSV columns only
        const columns = headers
            .map(header => `\`${header}\` TEXT`)
            .join(",");

        await connection.query(`
            CREATE TABLE IF NOT EXISTS \`${tableName}\` (
                ${columns}
            )
        `);

        // Prepare insert query
        const placeholders = headers
            .map(() => "?")
            .join(",");

        const sql = `
            INSERT INTO \`${tableName}\`
            (${headers.map(h => `\`${h}\``).join(",")})
            VALUES (${placeholders})
        `;

        // Insert all rows
        for (const row of rows) {

            const values = headers.map(header => row[header] ?? null);

            await connection.query(sql, values);

        }

        await connection.commit();

        console.log(`✅ Dataset imported successfully into table: ${tableName}`);

    } catch (error) {

        await connection.rollback();

        console.error("❌ Error importing dataset:");
        console.error(error);

        throw error;

    } finally {

        connection.release();

    }

};