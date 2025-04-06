const { Router } = require("express")
const {updateProfile} = require('../controllers/user')
const path = require('path')
const multer = require('multer')
const router = Router()
const storage = multer.memoryStorage()
const fileFilter = (req, file, cb) => {
    const filetypes = /png|jpeg|gif|webp/;

    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    const mimeType = file.mimetype.startsWith('image/');
    if (extname && mimeType) {
        return cb(null, true);
    }
    else {
        return cb(new Error("Error: Only PNG, JPEG, and GIF files are allowed!"));
    }
};
const maxSize = 5 * 1024 * 1024 // bytes / 5mb
const upload = multer({
    storage: storage,
    fileFilter,
    limits : {fileSize : maxSize}
})
router.put('/update-user/:id',upload.single('profileImage') , updateProfile)

module.exports = router
