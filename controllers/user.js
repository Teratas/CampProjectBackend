const User = require("../models/user");
const s3Client = require("../cloud/s3");
const crypto = require("crypto");
const { ObjectId } = require("mongodb");
exports.updateProfile = async (req, res, next) => {
  const profileImageFile = req?.file;
  // console.log('req',req)
  // console.log('before parse')
  // const test = JSON.stringify({
  //     id : "67e39e67e0a2a22d967bae7d",
  //     email  : "TienEIEI1@gmail.com"
  // })
  const userData = JSON.parse(req.body.userData);
  // console.log('after')
  if (profileImageFile) {
    const buffer = profileImageFile.buffer;
    const mimetype = profileImageFile.mimetype;
    const id = req.params.id;

    if (!id) {
      return res.status(401).json({
        success: false,
        message: "Failed to update this user",
      });
    }

    const user = await User.findById(id);
    const imageKey = (user?.profileImageKey && user?.profileImageKey !== '/')
      ? user.profileImageKey
      : crypto.randomBytes(32).toString("hex");

    await s3Client.uploadFile(buffer, imageKey, mimetype);
    const url = await s3Client.createSignedUrl(imageKey);

    const updatedUser = await User.findOneAndUpdate(
      { _id: id },
      {
        $set: {
          ...userData,
          profileImageKey: imageKey,
        },
      },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      throw new Error("User not found");
    }

    return res.status(200).json({
      success: true,
      url,
      updatedUser,
    });
  } else {
    const id = req.params.id;
    if (!id) {
      return res.status(401).json({
        success: false,
        message: "Failed to update this user",
      });
    }
    const updatedUser = await User.findOneAndUpdate(
      { _id: id },
      { $set: userData },
      { new: true, runValidators: true }
    );
    res.status(200).json({
      success: true,
      data: {
        user: updatedUser,
        url: "",
      },
    });
  }
};

exports.getUserByEmail = async (req, res, next) => {
    const {email} = req.body

    if(!email){
        return res.status(400).json({
            success : false,
            message : "Cannot find user with this email"
        })
    }

    const user = await User.findOne({email : email})

    if(!user){
        return res.status(400).json({
            success : false,
            message : "Failed to find this user"
        })
    }
    if(user.profileImageKey && user.profileImageKey !== '/'){
        user.profileImageKey = await s3Client.createSignedUrl(user.profileImageKey)
    }
    res.status(200).json({
        success : true,
        message : "Successfully Find This User",
        data : user
    })
}
