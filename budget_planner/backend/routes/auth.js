const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/User');
// const e = require('express');

router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: "Email-ul este deja folosit!" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            username,
            email,
            password: hashedPassword
        });

        await newUser.save();

        req.session.user = { id: newUser._id, username: newUser.username, email: newUser.email };
        
        res.status(201).json({ message: "Cont creat cu succes!", user: req.session.user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Eroare la inregistrare" });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (user && await bcrypt.compare(password, user.password)) {
            req.session.user = { id: user._id, username: user.username, email: user.email };
            res.json({ message: "Logare reusita!", user: req.session.user });
        } else {
            res.status(401).json({ error: "Email sau parola incorecta!" });
        }
    } catch (err) {
        res.status(500).json({ error: "Eroare la server" });
    }
});

router.get('/logout', (req, res) => {
    req.session.destroy();
    res.clearCookie('connect.sid');
    res.json({ message: "Ai fost deconectat cu succes!" });
});

module.exports = router;