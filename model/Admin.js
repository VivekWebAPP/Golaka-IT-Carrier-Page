// createAdminTable.js
import pool from '../db.js';

const createAdminTable = async () => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS Admins (
      id INT PRIMARY KEY AUTO_INCREMENT,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(50) DEFAULT 'admin',
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );
  `;

  try {
    const connection = await pool.getConnection(); 
    await connection.query(createTableQuery); 
    console.log('Admins table created successfully');
    connection.release(); 
  } catch (error) {
    console.error('Error creating Admins table:', error.message);
  }
};

export default createAdminTable;