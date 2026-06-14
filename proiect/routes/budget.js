const express = require('express');
const router = express.Router();
const requireLogin = require('../middleware/requireLogin');
const Budget = require('../models/Budget');
const Transaction = require('../models/Transactions');

const luniRo = ['Ianuarie','Februarie','Martie','Aprilie','Mai','Iunie','Iulie','August','Septembrie','Octombrie','Noiembrie','Decembrie'];

// Dashboard
router.get('/', requireLogin, async (req, res) => {
    req.session.views = (req.session.views || 0) + 1;
    const theme = req.cookies.theme || 'light';
    const userId = req.session.user.id;
    const now = new Date();
    const luna = parseInt(req.query.luna) || now.getMonth() + 1;
    const an = parseInt(req.query.an) || now.getFullYear();

    try {
        const budgets = await Budget.find({ userId, luna, an });

        const budgetsWithSpent = await Promise.all(budgets.map(async (b) => {
            const tranzactii = await Transaction.find({ budgetId: b._id });
            const cheltuit = tranzactii.reduce((sum, t) => sum + t.suma, 0);
            return { ...b.toObject(), cheltuit, tranzactii };
        }));

        const totalAlocat = budgetsWithSpent.reduce((sum, b) => sum + b.alocat, 0);
        const totalCheltuit = budgetsWithSpent.reduce((sum, b) => sum + b.cheltuit, 0);

        // Verifica daca exista recurente neaplicate pentru luna curenta
        const lunaCurenta = now.getMonth() + 1;
        const anCurent = now.getFullYear();
        let areRecurenteNeaplicate = false;
        if (luna === lunaCurenta && an === anCurent) {
            const toateRecurentele = await Budget.find({ userId, recurent: true });
            const categoriiRecurente = [...new Set(toateRecurentele.map(r => r.categorie))];
            for (const cat of categoriiRecurente) {
                const exista = await Budget.findOne({
                    userId,
                    categorie: cat,
                    luna: lunaCurenta,
                    an: anCurent
                });
                if (!exista) { areRecurenteNeaplicate = true; break; }
            }
        }

        res.render('dashboard', {
            user: req.session.user,
            budgets: budgetsWithSpent,
            totalAlocat,
            totalCheltuit,
            ramas: totalAlocat - totalCheltuit,
            views: req.session.views,
            theme,
            luna,
            an,
            lunaText: luniRo[luna - 1],
            areRecurenteNeaplicate
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Eroare la incarcarea datelor!');
    }
});

// Adauga categorie/buget
router.post('/add-budget', requireLogin, async (req, res) => {
    const { categorie, alocat, tip, recurent } = req.body;
    const now = new Date();
    const luna = parseInt(req.query.luna) || now.getMonth() + 1;
    const an = parseInt(req.query.an) || now.getFullYear();

    try {
        await Budget.create({
            userId: req.session.user.id,
            categorie,
            alocat: parseFloat(alocat),
            tip,
            recurent: recurent === 'on',
            luna,
            an
        });
        res.redirect(`/budget?luna=${luna}&an=${an}`);
    } catch (err) {
        console.error(err);
        res.status(500).send('Eroare la adaugarea categoriei!');
    }
});

// Editeaza suma alocata
router.post('/edit-budget/:id', requireLogin, async (req, res) => {
    const { alocat, luna, an } = req.body;
    try {
        await Budget.findOneAndUpdate(
            { _id: req.params.id, userId: req.session.user.id },
            { alocat: parseFloat(alocat) }
        );
        res.redirect(`/budget?luna=${luna}&an=${an}`);
    } catch (err) {
        console.error(err);
        res.status(500).send('Eroare la editarea categoriei!');
    }
});

// Sterge categorie + tranzactiile ei
router.post('/delete-budget/:id', requireLogin, async (req, res) => {
    const { luna, an } = req.body;
    try {
        await Transaction.deleteMany({ budgetId: req.params.id, userId: req.session.user.id });
        await Budget.findOneAndDelete({ _id: req.params.id, userId: req.session.user.id });
        res.redirect(`/budget?luna=${luna}&an=${an}`);
    } catch (err) {
        console.error(err);
        res.status(500).send('Eroare la stergerea categoriei!');
    }
});

// Adauga tranzactie
router.post('/add-transaction/:budgetId', requireLogin, async (req, res) => {
    const { descriere, suma, luna, an } = req.body;
    try {
        await Transaction.create({
            userId: req.session.user.id,
            budgetId: req.params.budgetId,
            descriere,
            suma: parseFloat(suma),
            luna: parseInt(luna),
            an: parseInt(an)
        });
        res.redirect(`/budget?luna=${luna}&an=${an}`);
    } catch (err) {
        console.error(err);
        res.status(500).send('Eroare la adaugarea tranzactiei!');
    }
});

// Sterge tranzactie
router.post('/delete-transaction/:id', requireLogin, async (req, res) => {
    const { luna, an } = req.body;
    try {
        await Transaction.findOneAndDelete({ _id: req.params.id, userId: req.session.user.id });
        res.redirect(`/budget?luna=${luna}&an=${an}`);
    } catch (err) {
        console.error(err);
        res.status(500).send('Eroare la stergerea tranzactiei!');
    }
});

// Aplica template recurente
router.post('/aplica-recurente', requireLogin, async (req, res) => {
    const userId = req.session.user.id;
    const now = new Date();
    const luna = now.getMonth() + 1;
    const an = now.getFullYear();

    try {
        const toateRecurentele = await Budget.find({ userId, recurent: true });
        const categoriiVazute = new Set();
        const recurente = toateRecurentele.filter(r => {
            if (categoriiVazute.has(r.categorie)) return false;
            categoriiVazute.add(r.categorie);
            return true;
        });
        for (const r of recurente) {
            const exista = await Budget.findOne({ userId, categorie: r.categorie, luna, an });
            if (!exista) {
                await Budget.create({
                    userId,
                    categorie: r.categorie,
                    alocat: r.alocat,
                    tip: r.tip,
                    recurent: true,
                    luna,
                    an
                });
            }
        }
        res.redirect(`/budget?luna=${luna}&an=${an}`);
    } catch (err) {
        console.error(err);
        res.status(500).send('Eroare la aplicarea template-ului!');
    }
});

// Rapoarte
router.get('/rapoarte', requireLogin, async (req, res) => {
    const userId = req.session.user.id;
    const theme = req.cookies.theme || 'light';

    try {
        const toateBugetele = await Budget.find({ userId }).sort({ an: -1, luna: -1 });

        const luniUnice = [];
        const vazute = new Set();
        for (const b of toateBugetele) {
            const key = `${b.an}-${b.luna}`;
            if (!vazute.has(key)) {
                vazute.add(key);
                luniUnice.push({ luna: b.luna, an: b.an });
            }
        }

        const rapoarte = await Promise.all(luniUnice.map(async ({ luna, an }) => {
            const budgets = await Budget.find({ userId, luna, an });
            const categorii = await Promise.all(budgets.map(async (b) => {
                const tranzactii = await Transaction.find({ budgetId: b._id });
                const cheltuit = tranzactii.reduce((sum, t) => sum + t.suma, 0);
                return { categorie: b.categorie, alocat: b.alocat, cheltuit, tip: b.tip };
            }));
            const totalAlocat = categorii.reduce((sum, c) => sum + c.alocat, 0);
            const totalCheltuit = categorii.reduce((sum, c) => sum + c.cheltuit, 0);
            return { luna, an, lunaText: luniRo[luna - 1], categorii, totalAlocat, totalCheltuit };
        }));

        res.render('rapoarte', { user: req.session.user, rapoarte, theme, luniRo });
    } catch (err) {
        console.error(err);
        res.status(500).send('Eroare la incarcarea rapoartelor!');
    }
});

// Tema
router.post('/set-theme', requireLogin, (req, res) => {
    const { luna, an } = req.body;
    res.cookie('theme', req.body.theme, { maxAge: 365 * 24 * 60 * 60 * 1000 });
    res.redirect(`/budget?luna=${luna}&an=${an}`);
});

module.exports = router;