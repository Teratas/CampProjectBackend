const User = require("../models/user");

const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();
  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
  };
  if (process.env.NODE_ENV === "production") {
    options.secure = true;
  }
  res
    .status(statusCode)
    .cookie("token", token, options)
    .json({
      success: true,
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          tel: user.tel,
          role: user.role,
        },
      },
    });
};

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, tel, role } = req.body;
    if (!name || !email || !password  || !tel) {
      return res.status(400).json({
        success: false,
        message: "Failed to create User",
      });
    }
    const findUser = await User.findOne({email : email})
    if(findUser){
      
      return res.status(400).json({
        success: false,
        message : "Already have this user"
      })
    }
    const user =  await User.create({
      name,
      email,
      tel,
      password,
      role,
    });

    sendTokenResponse(user, 200, res);
  } catch (err) {
    res.status(400).json({
      success: false,
    });
    console.log(err.stack);
  }
};

exports.login = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({
      success: false,
      message: "Please provide an email and password",
    });

  const user = await User.findOne({ email }).select("+password");
  console.log("user", user);
  if (!user) {
    return res.status(400).json({
      success: false,
      message: "Invalid Credential",
    });
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    return res.status(400).json({
      success: false,
      message: "Invalid Credential",
    });
  }

  sendTokenResponse(user, 200, res);
};

exports.logout = async (req, res, next) => {
  res.clearCookie("token");
  res.status(200).json({
    success: true,
    message :"Logged out successfully."
  })
};
