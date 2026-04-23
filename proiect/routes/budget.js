const express = require('express');
const router = express.Router();
const requireLogin = require('../middleware/requireLogin');
const expenses = require('../db/expenses');

router.get('/', requireLogin, (req, res) => {
    req.session.views = (req.session.views || 0) + 1;

    const theme = req.cookies.theme || 'light';

    res.render('dashboard', {
        user: req.session.user,
        expenses: expenses,
        views: req.session.views,
        theme: theme
    });
});

router.post('/set-theme', requireLogin, (req, res) => {
    const selectedTheme = req.body.theme;
    res.cookie('theme', selectedTheme, { maxAge: 365 * 24 * 60 * 60 * 1000 });
    res.redirect('/budget');
});

router.get('/detalii', requireLogin, (req, res) => {
    res.send(`<h1>Detalii avansate pentru ${req.session.user.username}</h1><p>Aici poti vedea graficele tale.</p><a href="/budget">Inapoi</a>`);
});

module.exports = router;