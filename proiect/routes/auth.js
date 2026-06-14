const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/User');

router.get('/register', (req, res) => res.render('register', { error: null }));

router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    try {
        const existing = await User.findOne({ email });
        if (existing) {
            return res.render('register', { error: 'Email-ul este deja folosit!' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({ username, email, password: hashedPassword });

        req.session.user = { id: newUser._id, username: newUser.username, email: newUser.email };
        res.redirect('/budget');
    } catch (err) {
        console.error(err);
        res.render('register', { error: 'Eroare la inregistrare!' });
    }
});

router.get('/login', (req, res) => res.render('login', { error: null }));

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (user && await bcrypt.compare(password, user.password)) {
            req.session.user = { id: user._id, username: user.username, email: user.email };
            res.redirect('/budget');
        } else {
            res.render('login', { error: 'Email sau parola incorecta!' });
        }
    } catch (err) {
        console.error(err);
        res.render('login', { error: 'Eroare la autentificare!' });
    }
});

router.get('/logout', (req, res) => {
    req.session.destroy();
    res.clearCookie('connect.sid');
    res.redirect('/');
});

module.exports = router;