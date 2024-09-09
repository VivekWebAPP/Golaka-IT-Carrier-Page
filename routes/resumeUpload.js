import express from 'express';
import User from '../model/User.js';
import multer from 'multer';
import findToken from '../middleware/findToken.js';
import isAdmin from '../middleware/isAdmin.js';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();
const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // Set file size limit to 10MB
});

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.USER_EMAIL,
        pass: process.env.PASSWORD
    }
});

router.post('/send-email', (req, res) => {
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

router.post('/upload', upload.single('resume'), async (req, res) => {
    try {
        const currentDateTime = new Date();

        const year = currentDateTime.getFullYear();
        const month = (currentDateTime.getMonth() + 1).toString().padStart(2, '0'); // Months are zero-based
        const day = currentDateTime.getDate().toString().padStart(2, '0');

        const hours = currentDateTime.getHours().toString().padStart(2, '0');
        const minutes = currentDateTime.getMinutes().toString().padStart(2, '0');
        const seconds = currentDateTime.getSeconds().toString().padStart(2, '0');

        const DATE = `${year}-${month}-${day}`;
        const TIME = `${hours}:${minutes}:${seconds}`;

        const newUser = new User({
            name: req.body.name,
            email: req.body.email,
            date: DATE,
            time: TIME,
            resume: {
                data: req.file.buffer,
                contentType: req.file.mimetype,
                originalName: req.file.originalname,
            },
        });

        await newUser.save();

        res.status(201).send({ response: 'User registered and resume uploaded successfully!' });

    } catch (error) {

        res.status(500).send({ error: 'Error registering user and uploading resume' });

    }
});

router.get('/admin/users', findToken, async (req, res) => {
    try {
        const users = await User.find({});

        res.status(200).json(users);

    } catch (error) {
        res.status(500).send('Error retrieving users');
    }
});

router.get('/admin/download/:id', findToken, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user || !user.resume.data) {
            return res.status(404).send('Resume not found');
        }

        res.set({
            'Content-Type': user.resume.contentType,
            'Content-Disposition': `attachment; filename="${user.resume.originalName}"`,
        });

        res.status(200).send(user.resume.data);

    } catch (error) {
        res.status(500).send('Error downloading resume');
    }
});

export default router;
