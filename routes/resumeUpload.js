import express from 'express';
import User from '../model/User.js';
import multer from 'multer';
import findToken from '../middleware/findToken.js';
import isAdmin from '../middleware/isAdmin.js';

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post('/upload', upload.single('resume'), async (req, res) => {
    try {
        const currentDateTime = new Date();

        const year = currentDateTime.getFullYear();
        const month = (currentDateTime.getMonth() + 1).toString().padStart(2, '0'); // Months are zero-based
        const day = currentDateTime.getDate().toString().padStart(2, '0');

        const hours = currentDateTime.getHours().toString().padStart(2, '0');
        const minutes = currentDateTime.getMinutes().toString().padStart(2, '0');
        const seconds = currentDateTime.getSeconds().toString().padStart(2, '0');

        const date = `${year}-${month}-${day}`;
        const time = `${hours}:${minutes}:${seconds}`;

        const newUser = new User({
            name: req.body.name,
            email: req.body.email,
            date: date,
            time: time,
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
