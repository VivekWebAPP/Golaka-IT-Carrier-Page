import pool from "../db.js";

const createJobPosition = async () => {
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS job_positions (
            id INT PRIMARY KEY AUTO_INCREMENT,
            job_title VARCHAR(255) NOT NULL,
            job_description TEXT NOT NULL,
            job_requirements TEXT NOT NULL,
            location VARCHAR(255) NOT NULL,
            employment_type ENUM('Full-time', 'Part-time', 'Internship') NOT NULL,
            status ENUM('Open', 'Closed') DEFAULT 'Open',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        );
    `
    try {
        const connection = await pool.getConnection();
        await connection.query(createTableQuery);
        console.log('Job Portal table created Successfully');
        connection.release();
    } catch (error) {
        console.error('Error creating Job Portal table:', error.message);
    }
}

export default createJobPosition;