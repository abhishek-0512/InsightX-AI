require("dotenv").config();

const app = require("./app");
const { pool } = require("./config/db");

const PORT = process.env.PORT || 5000;

async function startServer() {

    try {

        const connection = await pool.getConnection();

        console.log("✅ MySQL Connected");

        connection.release();

        app.listen(PORT, () => {

            console.log(`🚀 Server running on http://localhost:${PORT}`);

        });

    } catch (error) {

        console.error("❌ Failed to start server");

        console.error(error);

        process.exit(1);

    }

}

startServer();