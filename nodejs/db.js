// db.js
const mysql = require("mysql2/promise");

// Replace with your database connection details
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "your_password",
  database: process.env.DB_NAME || "your_database_name",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

/**
 * Gets a product from MySQL by ID.
 * @param {string} productId - The ID of the product.
 * @returns {Promise<Object|null>} The product object or null if not found.
 */
const getProductByIdDB = async (productId) => {
  try {
    // 3.1 get data from mysql database by id
    const [rows] = await pool.execute(
      "SELECT id, product_name, product_desc, price, in_stock FROM products WHERE id = ?",
      [productId]
    );

    if (rows.length > 0) {
      return rows[0]; // Return the first matching row
    }

    return null; // Product not found in DB
  } catch (error) {
    console.error("MySQL query error:", error);
    throw new Error("Database query failed");
  }
};

module.exports = { getProductByIdDB };
