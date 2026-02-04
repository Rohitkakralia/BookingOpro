import mysql from "mysql2/promise";

const connectDB = async () => {
  try {
    const pool = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
    });

    const connection = await pool.getConnection();
    console.log("MySQL Connected:", connection.config.host);
    connection.release();

    return pool;
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
};

export default connectDB;
