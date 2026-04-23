const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const userDB = require('../db/users');
const e = require('express');

router.get('/register', (req, res) => res.render('register', {error: null }));

router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
    
    const users = userDB.getUsers();
    if (users.find(u => u.email === email)) {
        return res.render('register', { error: "Email-ul este deja folosit!" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = { username, email, password: hashedPassword };
    
    userDB.saveUser(newUser);
    
    req.session.user = newUser;
    res.redirect('/budget');
});

router.get('/login', (req, res) => res.render('login', { error: null }));

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const users = userDB.getUsers();
    
    const user = users.find(u => u.email === email);

    if (user && await bcrypt.compare(password, user.password)) {
        req.session.user = user;
        res.redirect('/budget');
    } else {
        res.render('login', { error: "Email sau parola incorecta!" });
    }
});

router.get('/logout', (req, res) => {
    req.session.destroy();
    res.clearCookie('connect.sid');
    res.redirect('/');
});

module.exports = router;