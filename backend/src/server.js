import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import documentRoutes from './routes/documentRoutes.js';
import matchRoutes from './routes/matchRoutes.js';

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// Mock Auth Route
app.post('/auth/login', (req, res) => {
  res.json({ token: 'mock-static-jwt-token-12345' });
});

// API Routes
app.use('/documents',documentRoutes);
app.use('/', matchRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend Server running on port ${PORT}`));