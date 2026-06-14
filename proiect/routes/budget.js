const express = require('express');
const router = express.Router();
const requireLogin = require('../middleware/requireLogin');
const Budget = require('../models/Budget');
const Transaction = require('../models/Transactions');

// Dashboard
router.get('/', requireLogin, async (req, res) => {
    req.session.views = (req.session.views || 0) + 1;
    const theme = req.cookies.theme || 'light';
    const userId = req.session.user.id;

    try {
        const budgets = await Budget.find({ userId });

        const budgetsWithSpent = await Promise.all(budgets.map(async (b) => {
            const tranzactii = await Transaction.find({ budgetId: b._id });
            const cheltuit = tranzactii.reduce((sum, t) => sum + t.suma, 0);
            return { ...b.toObject(), cheltuit, tranzactii };
        }));

        const totalAlocat = budgetsWithSpent.reduce((sum, b) => sum + b.alocat, 0);
        const totalCheltuit = budgetsWithSpent.reduce((sum, b) => sum + b.cheltuit, 0);

        res.render('dashboard', {
            user: req.session.user,
            budgets: budgetsWithSpent,
            totalAlocat,
            totalCheltuit,
            ramas: totalAlocat - totalCheltuit,
            views: req.session.views,
            theme
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Eroare la incarcarea datelor!');
    }
});

// Adauga categorie/buget
router.post('/add-budget', requireLogin, async (req, res) => {
    const { categorie, alocat, tip } = req.body;
    try {
        await Budget.create({ userId: req.session.user.id, categorie, alocat: parseFloat(alocat), tip });
        res.redirect('/budget');
    } catch (err) {
        console.error(err);
        res.status(500).send('Eroare la adaugarea categoriei!');
    }
});

// Editeaza suma alocata
router.post('/edit-budget/:id', requireLogin, async (req, res) => {
    const { alocat } = req.body;
    try {
        await Budget.findOneAndUpdate(
            { _id: req.params.id, userId: req.session.user.id },
            { alocat: parseFloat(alocat) }
        );
        res.redirect('/budget');
    } catch (err) {
        console.error(err);
        res.status(500).send('Eroare la editarea categoriei!');
    }
});

// Sterge categorie + tranzactiile ei
router.post('/delete-budget/:id', requireLogin, async (req, res) => {
    try {
        await Transaction.deleteMany({ budgetId: req.params.id, userId: req.session.user.id });
        await Budget.findOneAndDelete({ _id: req.params.id, userId: req.session.user.id });
        res.redirect('/budget');
    } catch (err) {
        console.error(err);
        res.status(500).send('Eroare la stergerea categoriei!');
    }
});

// Adauga tranzactie
router.post('/add-transaction/:budgetId', requireLogin, async (req, res) => {
    const { descriere, suma } = req.body;
    try {
        await Transaction.create({
            userId: req.session.user.id,
            budgetId: req.params.budgetId,
            descriere,
            suma: parseFloat(suma)
        });
        res.redirect('/budget');
    } catch (err) {
        console.error(err);
        res.status(500).send('Eroare la adaugarea tranzactiei!');
    }
});

// Sterge tranzactie
router.post('/delete-transaction/:id', requireLogin, async (req, res) => {
    try {
        await Transaction.findOneAndDelete({ _id: req.params.id, userId: req.session.user.id });
        res.redirect('/budget');
    } catch (err) {
        console.error(err);
        res.status(500).send('Eroare la stergerea tranzactiei!');
    }
});

// Tema
router.post('/set-theme', requireLogin, (req, res) => {
    res.cookie('theme', req.body.theme, { maxAge: 365 * 24 * 60 * 60 * 1000 });
    res.redirect('/budget');
});

module.exports = router;