import express from "express";
import { body, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import Admin from "../model/Admin.js";
import findToken from '../middleware/findToken.js';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();
const router = express.Router();

router.get('/getAllUser', async (req, res) => {
    try {
        const users = await Admin.find({});
        res.status(200).send({ users });
    } catch (error) {
        res.status(400).send({ error: 'Internal Error Occurred' });
    }
});

router.post('/sigin', [
    body('name').isString().isLength({ min: 5 }).withMessage('Name should be at least 5 characters long'),
    body('email').isEmail().withMessage('Email is not valid'),
    body('password').isString().isLength({ min: 5 }).withMessage('Password should be at least 5 characters long'),
], async (req, res) => {
    try {
        // Validate input
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        // Check if user already exists by email
        let user = await Admin.findOne({ email: req.body.email });
        if (user) {
            return res.status(400).json({ error: 'User already exists with this email' });
        }

        // Check if user already exists by name (if `name` is unique)
        user = await Admin.findOne({ name: req.body.name });
        if (user) {
            return res.status(400).json({ error: 'User already exists with this name' });
        }

        // Create new user
        user = new Admin({
            name: req.body.name,
            email: req.body.email,
            password: await bcrypt.hash(req.body.password, 10),
        });

        try {
            await user.save();
        } catch (err) {
            if (err.code === 11000) { // Duplicate key error code
                return res.status(400).json({ error: 'User already exists with this name' });
            }
            throw err;
        }
        const data = {
            user: {
                userId: user.id,
            }
        };
        
        const secretKey = process.env.Secrete_Key;
        const jwtToken = jwt.sign(data, secretKey, { expiresIn: '1h' });

        // Send response
        res.status(200).json({ jwtToken });
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});


router.post('/login', [
    body('email').isEmail().withMessage('Email Is Not Valid'),
    body('password').isString().isEmpty().isLength(5).withMessage('Password Must Be Of Minimum 5 In Length'),
], async (req, res) => {
    try {
        const error = validationResult(req);
        if (error.isEmpty()) {
            return res.status(400).send({ error: 'Internal Error Occurred' });
        }
        console.log(req.body.email,req.body.password)
        let user = await Admin.findOne(req.email);
        if (!user) {
            return res.status(400).send({ error: 'User Does Not Exist' });
        }
        const Matched = await bcrypt.compare(req.body.password, user.password);
        if (!Matched) {
            return res.status(400).send({ error: 'Invalid Cridentials Provided' });
        }

        const data = {
            user: {
                userId: user.id,
            }
        };

        const SecreteKey = process.env.Secrete_Key;
        const jwtToken = jwt.sign(data, SecreteKey);

        res.status(200).send({ jwtToken });
        console.log(jwtToken);

    } catch (error) {
        console.log('error ', error.message);
        return res.status(400).send({ error: 'Internal Error Occurred' });
    }
});


router.get('/getUserInfo', findToken, async (req, res) => {
    try {
        const userId = await res.user;
        if (!userId) {
            return res.status(400).send({ error: 'Internal Server Error' });
        }
        const user = await Admin.findById(userId);
        if (!user) {
            return res.status(400).send({ error: 'User Does Not Exist' });
        }
        res.status(200).send({ user });

    } catch (error) {
        console.log('error ', error.message);
        return res.status(400).send({ error: 'Internal Error Occurred' });
    }
});

export default router;