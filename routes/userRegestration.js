import express from 'express';
import multer from 'multer';
import pool from '../db.js';
import findToken from '../middleware/authenticateToken.js';

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 },
});


router.post('/upload', upload.single('resume'), async (req, res) => {
    try {

        console.log(req.body);
        console.log(req.file);

        const currentDateTime = new Date();

        const year = currentDateTime.getFullYear();
        const month = (currentDateTime.getMonth() + 1).toString().padStart(2, '0');
        const day = currentDateTime.getDate().toString().padStart(2, '0');

        const hours = currentDateTime.getHours().toString().padStart(2, '0');
        const minutes = currentDateTime.getMinutes().toString().padStart(2, '0');
        const seconds = currentDateTime.getSeconds().toString().padStart(2, '0');

        const DATE = `${year}-${month}-${day}`;
        const TIME = `${hours}:${minutes}:${seconds}`;

        const { name, email } = req.body;
        const { buffer, mimetype, originalname } = req.file;

        const sql = `
            INSERT INTO Users (name, email, date, time, resume_data, resume_contentType, resume_originalName)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        await pool.query(sql, [name, email, DATE, TIME, buffer, mimetype, originalname]);

        res.status(201).send({ response: 'User registered and resume uploaded successfully!' });

    } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'Error registering user and uploading resume' });
    }
});

// Get all users (admin only)
router.get('/admin/users', findToken, async (req, res) => {
    try {
        const [users] = await pool.query('SELECT id, name, email, date, time FROM Users');

        res.status(200).json(users);

    } catch (error) {
        console.error(error);
        res.status(500).send('Error retrieving users');
    }
});

// Download resume by user ID
router.get('/admin/download/:id', findToken, async (req, res) => {
    try {
        const [users] = await pool.query('SELECT resume_data, resume_contentType, resume_originalName FROM Users WHERE id = ?', [req.params.id]);

        if (users.length === 0 || !users[0].resume_data) {
            return res.status(404).send('Resume not found');
        }

        const user = users[0];

        res.set({
            'Content-Type': user.resume_contentType,
            'Content-Disposition': `attachment; filename="${user.resume_originalName}"`,
        });

        res.status(200).send(user.resume_data);

    } catch (error) {
        console.error(error);
        res.status(500).send('Error downloading resume');
    }
});

// Update user details based on user ID
router.put('/admin/update/:id', findToken, upload.single('resume'), async (req, res) => {
    try {
        const userId = req.params.id;
        const { name, email, date, time, selected, rejected } = req.body;

        // Check if the user exists
        const [existingUser] = await pool.query('SELECT * FROM Users WHERE id = ?', [userId]);

        if (existingUser.length === 0) {
            return res.status(404).send('User not found');
        }

        // Prepare fields for the update query
        let sql = 'UPDATE Users SET ';
        const fields = [];
        const values = [];

        if (name) {
            fields.push('name = ?');
            values.push(name);
        }
        if (email) {
            fields.push('email = ?');
            values.push(email);
        }
        if (date) {
            fields.push('DATE = ?');
            values.push(date)
        }
        if (time) {
            fields.push('TIME = ?');
            values.push(time)
        }
        if (selected) {
            fields.push('selected = ?');
            values.push(selected);
        }
        if (rejected) {
            fields.push('rejected = ?');
            values.push(rejected);
        }
        if (req.file) {
            const { buffer, mimetype, originalname } = req.file;
            fields.push('resume_data = ?', 'resume_contentType = ?', 'resume_originalName = ?');
            values.push(buffer, mimetype, originalname);
        }

        if (fields.length === 0) {
            return res.status(400).send('No valid fields to update');
        }

        sql += fields.join(', ') + ' WHERE id = ?';
        values.push(userId);

        // Execute the update query
        await pool.query(sql, values);

        res.status(200).send({ message: `User with ID ${userId} updated successfully` });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error updating user details');
    }
});

// Route to delete a user by ID
router.delete('/users/:id', findToken, async (req, res) => {
    const userId = req.params.id;

    try {
        const [result] = await pool.query('DELETE FROM Users WHERE id = ?', [userId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json({ message: `User with ID ${userId} deleted successfully` });
    } catch (error) {
        console.error('Error deleting user:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
