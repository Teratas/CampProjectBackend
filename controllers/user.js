const User = require('../models/user')
exports.uploadProfile = async (req, res, next) => {
    console.log(req.file)
    res.status(200).json({
        success: true,
        file: req.file
    })
}