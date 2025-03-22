const express = require('express')
const passport = require('passport')
const {register, login} = require('../controllers/auth')

const router = express.Router()

const {protect} = require('../middleware/auth')

router.post('/register', register)
router.post('/login', login)

router.get('/test', (req, res, next) => {
    res.status(200).json({
        success: true,
        message: "Success reach backend"
    })
})
router.get('/facebook', passport.authenticate('facebook', {
    scope : ['email']
}))

router.get(
    "/facebook/callback",
    passport.authenticate("facebook", { failureRedirect: "/" }),
    (req, res) => {
      res.json({ message: "Login Successful", user: req.user });
    }
  );
  
router.get('/facebook/logout', (req, res) => {
    req.logout(() => {
        res.redirect('/');
    });
});
module.exports = router