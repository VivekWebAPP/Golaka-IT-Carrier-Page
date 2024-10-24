import express from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../db.js';
import authenticateToken from '../middleware/authenticateToken.js';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

router.post('/jobs', authenticateToken, async (req, res) => {
    try {
        const { job_title, job_description, job_requirements, location, employment_type, status } = req.body;

        const createJobQuery = `
            INSERT INTO job_positions (job_title, job_description, job_requirements, location, employment_type, status)
            VALUES (?, ?, ?, ?, ?, ?);
        `;

        await pool.query(createJobQuery, [job_title, job_description, job_requirements, location, employment_type, status]);

        res.status(201).send({ response: 'Job Created successfully!' });
        
    } catch (error) {
        console.error('Error adding job position:', error.message);
        res.status(500).json({ error: 'An error occurred while adding the job position.' });
    }
});

router.get('/jobs/open', async (req, res) => {

    try {
        const getJobsQuery = `SELECT * FROM job_positions WHERE status = 'Open'`;
        const [jobs] = await pool.query(getJobsQuery);

        res.status(200).send({ jobs });
    } catch (error) {
        console.error('Error fetching job positions:', error.message);
        res.status(500).json({ error: 'An error occurred while fetching job positions.' });
    }
});

router.put('/jobs/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { job_title, job_description, job_requirements, location, employment_type, status } = req.body;

        const [existingJobs] = await pool.query('SELECT * FROM job_positions WHERE id = ?', [id]);

        if (existingJobs.length === 0) {
            return res.status(404).send('Existing Jobs not found');
        }

        let sql = 'UPDATE job_positions SET ';
        const fields = [];
        const values = [];

        if (job_title) {
            fields.push('job_title = ?');
            values.push(job_title);
        }
        if (job_description) {
            fields.push('job_description = ?');
            values.push(job_description);
        }
        if (job_requirements) {
            fields.push('job_requirements = ?');
            values.push(job_requirements)
        }
        if (location) {
            fields.push('location = ?');
            values.push(location)
        }
        if (employment_type) {
            fields.push('employment_type = ?');
            values.push(employment_type);
        }
        if (status) {
            fields.push('status = ?');
            values.push(status);
        }

        if (fields.length === 0) {
            return res.status(400).send('No valid fields to update');
        }

        sql += fields.join(', ') + ' WHERE id = ?';
        values.push(id);

        await pool.query(sql, values);

        res.status(200).json({ message: 'Job position updated successfully.' });
    } catch (error) {
        console.error('Error updating job position:', error.message);
        res.status(500).json({ error: 'An error occurred while updating the job position.' });
    }
});

router.delete('/jobs/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
    
        const [result] = await pool.query('DELETE FROM job_positions WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Job not found' });
        }

        res.status(200).json({ message: `Job with ID ${id} deleted successfully` });

    } catch (error) {
        console.error('Error deleting job position:', error.message);
        res.status(500).json({ error: 'An error occurred while deleting the job position.' });
    }
});

export default router;