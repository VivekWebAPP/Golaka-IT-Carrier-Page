import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const ConnectionString = process.env.MONGODB_URI;

const ConnectToDB = async () => {
    try {
        await mongoose.connect(ConnectionString);
        console.log('Connected To Database');
    } catch (error) {
        console.error('Failed To Connect To Database');
    }
};

export default ConnectToDB;
