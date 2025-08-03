const express = require('express');
const connectDB = require('./src/config/db');
const cors = require('cors');
require('dotenv').config();

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => res.send('API Server Farmacovigilanza Funzionante! 🚀'));

app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/users', require('./src/routes/userRoutes'));
app.use('/api/reports', require('./src/routes/reportRoutes'));
app.use('/api/dashboard', require('./src/routes/dashboardRoutes'));
app.use('/api/analytics', require('./src/routes/analyticsRoutes'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server avviato sulla porta ${PORT}`));
