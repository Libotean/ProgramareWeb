module.exports = (req, res, next) => {
    if (req.session && req.session.user) {
        return next();
    } else {
        return res.status(401).json({ error: "Trebuie sa fii autentificat pentru a vedea aceste date." });
    }
};