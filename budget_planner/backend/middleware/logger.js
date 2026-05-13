module.exports = (req, res, next) => {
    const userEmail = req.session.user ? req.session.user.email : "anonim";
    console.log(`${req.method} ${req.url} - user: ${userEmail}`);
    next(); 
};