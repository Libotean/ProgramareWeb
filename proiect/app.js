require('dotenv').config();
const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const path = require('path');
const mongoose = require('mongoose');

const logger = require('./middleware/logger');
const authRoutes = require('./routes/auth');
const budgetRoutes = require('./routes/budget');

const app = express();

// Conectare MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB conectat'))
    .catch(err => console.error('Eroare MongoDB:', err));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 2 }
}));
app.use(logger);

app.get('/', (req, res) => {
    res.render('home', { user: req.session.user });
});

app.use('/', authRoutes);
app.use('/budget', budgetRoutes);

app.use((req, res) => {
    res.status(404).send('Pagina nu a fost gasita!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Serverul ruleaza pe http://localhost:${PORT}`);
});