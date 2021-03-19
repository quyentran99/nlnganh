const User = require('../models/user');
const ErrorHandler = require('../utils/errorHandler');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const sendToken = require('../utils/jwtToken');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');
const { send } = require('process');
const { read } = require('fs');

exports.registerUser = catchAsyncErrors( async (req, res, next) => {
    const {name, email, password } = req.body;

    const user = await User.create({
        name,
        email, 
        password,
        avatar: {
            public_id: 'products/jfjfhdsjhcjd',
            url: 'https://res.cloudinary.com/nienluannganh/image/upload/v1612186212/nienluan/Quyen_rucjsl.png'
        }
    })

    sendToken(user, 200, res)

    
})

exports.loginUser = catchAsyncErrors( async (req, res, next) => {
    const {email, password} = req.body;

    if(!email || !password){
        return next(new ErrorHandler('Vui lòng nhập đúng email và pasword', 400))
    }

    const user = await User.findOne({ email }).select('+password')

    if(!user){
        return next(new ErrorHandler('Email hoặc mật khẩu không hợp lệ'), 400)
    }

    const isPasswordMathched = await user.comparePassword(password);

    if(!isPasswordMathched){
        return next(new ErrorHandler('Email hoặc mật khẩu không hợp lệ'), 400)
    }

    sendToken(user, 200, res)
})

exports.logout = catchAsyncErrors( async(req, res, next) => {
    res.cookie('token', null, {
        expires: new Date(Date.now()),
        httpOnly: true
    })

    res.status(200).json({
        success: true,
        message: 'Đăng xuất thành công'
    })
})

exports.forgotPassword = catchAsyncErrors( async(req, res, next) => {
    const user = await User.findOne({ email: req.body.email });

    if(!user){
        return next(new ErrorHandler('Người dùng không tìm thấy email này', 404))
    }

    const resetToken = user.getResetPasswordToken(); 
    await user.save({ validateBeforeSave: false})

    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/password/reset/${resetToken}`;

    const message = `Your password reset token is as follow:\n\n${resetUrl}\n\nIf you have not requested this email, then ignore it.`

    try{
        await sendEmail({
            email: user.email,
            subject: 'Khôi phục lại mật khẩu',
            message
        })
        res.status(200).json({
            success: true,
            message: `Email sent to: ${user.email}`
        })
    }
    catch(error){
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save({ validateBeforesSave: false });
        return next(new ErrorHandler(error.message, 500));
    }
});

exports.resetPassword = catchAsyncErrors( async(req, res, next) =>{
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex')
    
    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() }
    })

    if(!user){
        return next(new ErrorHandler('Mã thông báo đặt lại mật khẩu không hợp lệ hoặc đã hết hạn', 400))
    }

    if(req.body.password !== req.body.confirmPassword){
        return next(new ErrorHandler('Mật khẩu không đúng', 400))
    }

    user.password = req.body.password;

    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    sendToken(user, 200, res);

})

exports.getUserProfile = catchAsyncErrors( async (req, res, next) => {
    const user = await User.findById(req.user.id);

    res.status(200).json({
        success: true,
        user
    })

})

//update / change password
exports.updatePassword = catchAsyncErrors( async (req, res, next) => {
    const user = await User.findById(req.user.id).select('+password');

    const isMatched = await user.comparePassword(req.body.oldPassword)
    if(!isMatched){
        return next(new ErrorHandler('Mật khẩu cũ không chính xác'));
    }

    user.password = req.body.password;
    await user.save();

    sendToken(user, 200, res);
})

//update user profile
exports.updateProfile = catchAsyncErrors( async (req, res, next) => {
    const newUserdata = {
        name: req.body.name,
        email: req.body.email,
    }
    const user = await User.findByIdAndUpdate(req.user.id, newUserdata, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    })
    res.status(200).json({
        success: true
    })
}) 

//get all user 
exports.allUsers = catchAsyncErrors( async (req, res, body) => {
    const users = await User.find();

    res.status(200).json({
        success: true,
        users
    })

})

//get user detail
exports.getUserDetails = catchAsyncErrors( async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if(!user) {
        return next(new ErrorHandler('User not found', 400));
    }
    res.status(200).json({
        success: true,
        user
    })
})

//update user profile
exports.updateUser = catchAsyncErrors( async (req, res, next) => {
    const newUserdata = {
        name: req.body.name,
        email: req.body.email,
        role: req.body.role 
    }
    const user = await User.findByIdAndUpdate(req.params.id, newUserdata, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    })
    res.status(200).json({
        success: true
    })
}) 

//DELETE USER
exports.deleteUser = catchAsyncErrors( async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if(!user){
        return next(new ErrorHandler('User not found' , 400));
    }

    await user.remove();

    res.status(200).json({
        success: true,
    })
})
