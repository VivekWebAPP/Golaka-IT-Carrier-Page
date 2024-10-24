// createUserTable.js
import pool from '../db.js';

const createUsersTable = async () => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS Users (
      id INT PRIMARY KEY AUTO_INCREMENT,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      date DATE NOT NULL,
      time TIME NOT NULL,
      selected VARCHAR(50) DEFAULT 'false',
      rejected VARCHAR(50) DEFAULT 'false',
      resume_data LONGBLOB,
      resume_contentType VARCHAR(255),
      resume_originalName VARCHAR(255),
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );
  `;

  try {
    const connection = await pool.getConnection(); 
    await connection.query(createTableQuery);
    console.log('Users table created successfully');
    connection.release(); 
  } catch (error) {
    console.error('Error creating Users table:', error.message);
  }
};

export default createUsersTable;