require('dotenv').config();
const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const path = require('path');

const logger = require('./middleware/logger');

const authRoutes = require('./routes/auth');
const budgetRoutes = require('./routes/budget');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    secret: process.env.SESSION_SECRET || 'secret_temporar_pentru_laborator',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        maxAge: 1000 * 60 * 60 * 2
    }
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
    console.log(`Serverul ruleaza pe:`);
    console.log(`http://localhost:${PORT}`);
});