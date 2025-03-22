const User = require('../models/user')

const sendTokenResponse = (user, statusCode, res) => {
    const token = user.getSignedJwtToken()
    const options = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24*60*60*1000)
    }
    if(process.env.NODE_ENV === 'production'){
        options.secure=true;
    } 
    res.status(statusCode).cookie('token', token, options).json({
        success : true,
        data : {
            token,
            user
        }
    })
}

exports.register = async (req, res, next) => {
    try{
        const {name, email, password, tel} = req.body

        const user = await User.create({
            name,
            email,
            tel,
            password
        })

        sendTokenResponse(user, 200, res)
    }catch(err){
        res.status(400).json({
            success:false,
        })
        console.log(err.stack)
    }
}

exports.login =async (req, res, next) => {
    const {email, password} = req.body;

    if(!email || !password) return res.status(400).json({
        success: false,
        message: 'Please provide an email and password'
    })

    const user = await User.findOne({email}).select('+password')
    console.log('user', user)
    if(!user){
        return res.status(400).json({
            success: false,
            message: "Invalid Credential"
        })
    }
    
    const isMatch = await user.matchPassword(password)
    if(!isMatch){
        return res.status(400).json({
            success: false,
            message: "Invalid Credential"
        })
    }

    sendTokenResponse(user, 200, res)
}