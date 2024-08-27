import express from "express";
import cors from 'cors';
import ConnectToDB from "./db.js";
import dotenv from 'dotenv';
import AdminRoute from './routes/auth.js';
import ResumeUpload from './routes/resumeUpload.js';

dotenv.config();

const app = express();
const port = process.env.PORT;
ConnectToDB();
app.use(express.json());
app.use(cors());

app.get('/',(req,res)=>{
    res.send('Hello World');
});

app.use('/adminRoute',AdminRoute);
app.use('/resume',ResumeUpload);

app.listen(port,()=>{
    console.log(`Server Started At Port: http://localhost:${port}/`);
});