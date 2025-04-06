const User = require('../models/user')
const s3Client = require('../cloud/s3')
const crypto = require('crypto');
const { ObjectId } = require('mongodb');
exports.updateProfile = async (req, res, next) => {
    const profileImageFile = req?.file;
    // console.log('req',req)
    // console.log('before parse')
    // const test = JSON.stringify({
    //     id : "67e39e67e0a2a22d967bae7d",
    //     email  : "TienEIEI1@gmail.com"
    // })
    const userData = JSON.parse(req.body.userData)
    // console.log('after')
    if(profileImageFile){
        const buffer = profileImageFile?.buffer;
        const mimetype = profileImageFile?.mimetype;
        const id = req.params.id
        if(!id){
            return res.status(401).json({
                success : true,
                message : "Failed to update this user"
            })
        } 
        const user = User.findById(id)
        const imageKey = !user?.profileImage ? user?.profileImage : crypto.randomBytes(32).toString('hex')
        await s3Client.uploadFile(buffer, imageKey, mimetype)
        const url = await s3Client.createSignedUrl(imageKey)
        const updatedUser = await User.findOneAndUpdate(
            {
                _id : id,
            },
            {$set : userData},
            {new : true, runValidators : true}
            )
        if(!updatedUser){
            throw new Error('User not found')
        }
        res.status(200).json({
            url,
            updatedUser
        })
    }
    else{
        const id = req.params.id
        if(!id){
            return res.status(401).json({
                success : false,
                message : "Failed to update this user"
            })
        }
        const updatedUser = await User.findOneAndUpdate({_id : id}, {$set : userData}, {new : true, runValidators : true})
        res.status(200).json(
            {
                url : "",
                updatedUser
            }
        )
    }
}