require("dotenv").config();

const app = require("./app");
const { pool } = require("./config/db");

const PORT = process.env.PORT || 5001;

async function startServer() {

    try {

        const connection = await pool.getConnection();

        console.log("✅ MySQL Connected");

        connection.release();

    } catch (error) {

        console.warn("⚠️ MySQL not connected (running in standalone file analysis mode):", error.message);

    }

    app.listen(PORT, () => {

        console.log(`🚀 Server running on http://localhost:${PORT}`);

    });

}

startServer();