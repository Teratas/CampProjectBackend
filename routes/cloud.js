const express = require('express')
const multer = require('multer')
const { uploadProfileImage } = require('../controllers/cloud')

const router = express.Router()
const storage = multer.memoryStorage()
const upload = multer({
    storage,
})

router.post('/upload', upload.single('profileImage'), uploadProfileImage)

module.exports = router