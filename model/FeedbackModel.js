import pool from "../db.js";

const createAdminFeedback = async () => {
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS rejected_users_feedback (
            id INT PRIMARY KEY AUTO_INCREMENT,
            user_id INT NOT NULL,
            rejection_reason TEXT,
            rejected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        );
    `;
    try {
        const connection = await pool.getConnection();
        await connection.query(createTableQuery);
        console.log('Admins Feedback table created Successfully');
        connection.release();
    } catch (error) {
        console.error('Error creating Admin Feedback table:', error.message);
    }
}

export default createAdminFeedback;
