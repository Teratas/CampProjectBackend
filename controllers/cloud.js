const { uploadFile, createSignedUrl } = require('../cloud/s3')
const User = require('../models/user')
const crypto = require('crypto')
exports.uploadProfileImage = async (req, res, next) => {
    const buffer = req.file.buffer;
    const keyName = crypto.randomBytes(32).toString('hex')
    const mimetype = req.file.mimetype
    await uploadFile(buffer, keyName, mimetype)
    const url = await createSignedUrl(keyName)
    res.status(200).json({
        success: true,
        url,
    })
}