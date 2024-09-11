import express from "express";
import cors from 'cors';
import ConnectToDB from "./db.js";
import dotenv from 'dotenv';
import AdminRoute from './routes/auth.js';
import ResumeUpload from './routes/resumeUpload.js';

dotenv.config();

const app = express();
const port = process.env.PORT;
const allowedOrigins = [
    'http://localhost:3000',
    'https://golokait-carriers-page.vercel.app'
];
ConnectToDB();
app.use(express.json());
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],  // Specify allowed methods
    credentials: true  // Allow credentials (e.g., cookies)
}));
app.options('*', cors());  // Allow preflight requests for all routes

app.get('/', (req, res) => {
    res.send('Hello World');
});

app.use('/adminRoute', AdminRoute);
app.use('/resume', ResumeUpload);

app.listen(port, () => {
    console.log(`Server Started At Port: http://localhost:${port}/`);
});