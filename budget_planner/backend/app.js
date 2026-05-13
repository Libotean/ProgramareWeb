require('dotenv').config();
const cors = require('cors');
const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const path = require('path');
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Conectat la MongoDB'))
    .catch(err => console.error('Eroare la conectarea la MongoDB:', err));

const logger = require('./middleware/logger');
const authRoutes = require('./routes/auth');
const budgetRoutes = require('./routes/budget');

const app = express();

app.use(cors({
    origin: 'http://localhost:5173', 
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { 
        maxAge: 1000 * 60 * 60 * 2,
        httpOnly: true,
        sameSite: 'lax'
    }
}));

app.use(logger);


// RUTE
app.get('/', (req, res) => {
    res.json({ status: "Activ", user: req.session.user || null });
});

app.use('/api/auth', authRoutes); 
app.use('/api/budget', budgetRoutes);

app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint inexistent' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Backend-ul rulează pe: http://localhost:${PORT}`);
});