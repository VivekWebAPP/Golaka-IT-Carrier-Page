import express from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../db.js';
import authenticateToken from '../middleware/authenticateToken.js';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.USER_EMAIL,
    pass: process.env.PASSWORD
  }
});

router.post('/send-email', (req, res) => {
  console.log(req.body);
  const { to, subject, text } = req.body;

  const mailOptions = {
    from: process.env.USER_EMAIL,
    to: to,
    subject: subject,
    text: text
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return res.status(500).send({ message: 'Error sending email', error });
    }
    res.status(200).send({ message: 'Email sent successfully', info });
  });
});

// Sign up route
router.post('/signup', [
  body('name').isString().isLength(5).withMessage('Name should be at least 5 characters long'),
  body('email').isEmail().withMessage('Email is not valid'),
  body('password').isString().isLength(5).withMessage('Password should be at least 5 characters long'),
], async (req, res) => {

  try {
    console.log(req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;
    const [existingUser] = await pool.query('SELECT * FROM Admins WHERE email = ?', [email]);
    if (existingUser.length > 0) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query('INSERT INTO Admins (name, email, password) VALUES (?, ?, ?)', [name, email, hashedPassword]);

    res.status(201).json({ message: 'Admin registered successfully' });
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login route
router.post('/login', [
  body('email').isEmail().withMessage('Email is not valid'),
  body('password').isString().isLength({ min: 5 }).withMessage('Password should be at least 5 characters long'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    const [user] = await pool.query('SELECT * FROM Admins WHERE email = ?', [email]);

    if (user.length === 0) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const admin = user[0];

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign({ userId: admin.id }, process.env.SECRET_KEY, { expiresIn: '1h' });

    res.status(200).json({ token });
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get admin details route
router.get('/details', authenticateToken, async (req, res) => {
  try {
    const [user] = await pool.query('SELECT id, name, email FROM Admins WHERE id = ?', [req.user.userId]);
    if (user.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({ user: user[0] });
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/forgetPassword', [
  body('email').isEmail().withMessage('Email is not valid'),
  body('password').isString().isLength({ min: 5 }).withMessage('Password should be at least 5 characters long'),
], async (req, res) => {
  try {
    const error = validationResult(req);
    if (!error.isEmpty()) {
      return res.status(400).json({ errors: error.array() });
    }
    const [user] = await pool.query('SELECT id, name, email FROM Admins WHERE email = ?', [req.body.email]);
    const { email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    if (user.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    let sql = 'UPDATE Admins SET ';
    const fields = [];
    const values = [];

    if(name){
      fields.push('name = ?');
      values.push(user[0].name);
    }
    if(email){
      fields.push('email = ?');
      values.push(email);
    }
    if(password){
      fields.push('password = ?');
      values.push(hashedPassword);
    }
    if(fields.length === 0){
      return res.status(400).json({ error: 'No fields to update' });
    }

    sql += fields.join(', ') + ' WHERE id = ?';
    values.push(user[0].id);

    await pool.query(sql, values);
    res.status(200).json({ message: 'Password updated successfully' });

  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
})

// Route to save rejection feedback
router.post('/save-rejection', authenticateToken, async (req, res) => {

  try {
    const { user_id, rejection_reason } = req.body;

    if (!user_id || !rejection_reason) {
      return res.status(400).json({ error: 'User ID and rejection reason are required.' });
    }

    const query = `
      INSERT INTO rejected_users_feedback (user_id, rejection_reason) 
      VALUES (?, ?)
  `;

    await pool.query(query, [user_id, rejection_reason]);

    res.status(200).send({ feedback: 'Admin feedback successfully saved to database' });

  } catch (error) {
    console.log(error.message);
    res.status(501).send({ error: "Internal server error" });
  }

});

// Get all feedback from the database
router.get('/feedback', authenticateToken, async (req, res) => {
  const getFeedbackQuery = `SELECT * FROM rejected_users_feedback`;

  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query(getFeedbackQuery);
    connection.release();

    if (rows.length === 0) {
      return res.status(404).json({ message: 'No feedback found.' });
    }

    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching feedback:', error.message);
    res.status(500).json({ error: 'An error occurred while fetching feedback.' });
  }
});



export default router;
