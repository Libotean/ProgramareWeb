const express = require('express');
const router = express.Router();
const requireLogin = require('../middleware/requireLogin');
const expenses = require('../models/Expense');

router.get('/', requireLogin, async (req, res) => {
    try {
        req.session.views = (req.session.views || 0) + 1;
        const theme = req.cookies.theme || 'light';

        const userExpenses = await Expense.find({ userId: req.session.user.id });

        res.json({ 
            user: req.session.user, 
            expenses: userExpenses, 
            views: req.session.views, 
            theme: theme 
        });
    } catch (err) {
        res.status(500).json({ error: "Eroare la preluarea datelor" });
    }
});

router.post('/set-theme', requireLogin, (req, res) => {
    const selectedTheme = req.body.theme;
    res.cookie('theme', selectedTheme, { maxAge: 365 * 24 * 60 * 60 * 1000, httpOnly: false });
    res.json({ success: true, theme: selectedTheme });
});

router.get('/detalii', requireLogin, (req, res) => {
    res.json({ 
        message: `Detalii avansate pentru ${req.session.user.username}`,
        extraInfo: "Aici vor veni datele pentru grafice in viitor."
    });
});
module.exports = router;