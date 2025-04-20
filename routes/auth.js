const express = require('express')
const passport = require('passport')
const {register, login, logout} = require('../controllers/auth')

const router = express.Router()

router.post('/register', register)
router.post('/login', login)
router.get('/logout', logout);

module.exports = router