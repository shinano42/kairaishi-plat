const router = require('express').Router();

const authCheck = (req, res, next) => {
    if (!req.user) {
        // if user is not logged in
        res.redirect('/auth/login');
    } else {
        // if logged in
        next();
    }
};


router.get('/',  (req, res) => {
        let fields = ['name', 'anime', 'sculptor', 'color', 'material', 'scale', 'size', 'specification', 'description']; 
        res.render('search', { user: req.user, fields: fields});
});

module.exports = router;
