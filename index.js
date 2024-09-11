import express from "express";
import cors from 'cors';
import ConnectToDB from "./db.js";
import dotenv from 'dotenv';
import AdminRoute from './routes/auth.js';
import ResumeUpload from './routes/resumeUpload.js';

dotenv.config();

const app = express();
const port = process.env.PORT;

// Allowed origins
const allowedOrigins = [
    'http://localhost:3000',
    'https://golokait-carriers-page.vercel.app'
];

// Connect to the database
ConnectToDB();

// Middleware
app.use(express.json());

// CORS configuration
app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,  // Allow credentials like cookies
}));

// Handle preflight OPTIONS requests globally
app.options('*', cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
}));

// Routes
app.get('/', (req, res) => {
    res.send('Hello World');
});

app.use('/adminRoute', AdminRoute);
app.use('/resume', ResumeUpload);

// Start the server
app.listen(port, () => {
    console.log(`Server Started At Port: http://localhost:${port}/`);
});
