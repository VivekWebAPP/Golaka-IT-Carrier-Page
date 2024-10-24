import express from 'express';
import dotenv from 'dotenv';
import createTables from './model/CombinedModel.js';
import userRoutes from './routes/userRegestration.js';
import adminRoutes from './routes/adminAuth.js';
import jobRoutes from './routes/JobCreationRoute.js';
import bodyParser from 'body-parser';

dotenv.config();

const app = express();
const port = process.env.PORT || 5002;

app.use(express.json());  // Parse JSON bodies
// app.use(bodyParser.urlencoded({ extended: true }))
// app.use(express.urlencoded({ extended: false }));

createTables();  // Ensure tables are created

// Home route
app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.use('/users', userRoutes);
app.use('/admin', adminRoutes);
app.use('/jobPortal',jobRoutes);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

