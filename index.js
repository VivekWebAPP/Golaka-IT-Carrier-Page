import express from 'express';
import dotenv from 'dotenv';
import createTables from './model/CombinedModel.js';
import userRoutes from './routes/userRegestration.js';
import adminRoutes from './routes/adminAuth.js';
import jobRoutes from './routes/JobCreationRoute.js';
import bodyParser from 'body-parser';
import cors from 'cors';

dotenv.config();

const app = express();
const port = process.env.PORT || 5002;
const assiginedOrigin = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'http://localhost:3003',
  'http://localhost:3004',
  'http://localhost:3005',
]

app.use(express.json());  // Parse JSON bodies
// app.use(bodyParser.urlencoded({ extended: true }))
// app.use(express.urlencoded({ extended: false }));
app.use(cors({
  origin: assiginedOrigin, // Allow requests from this origin
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Specify allowed HTTP methods
  credentials: true, // If your requests include credentials like cookies
}));

createTables();  // Ensure tables are created

// Home route
app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.use('/users', userRoutes);
app.use('/admin', adminRoutes);
app.use('/jobPortal', jobRoutes);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

