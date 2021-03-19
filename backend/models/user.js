const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required: [true, 'Vui lòng nhập tên của bạn'],
        maxLength: [30, 'Tên của bạn không thể vượt quá 30 kí tự'] 
    },
    email: {
        type: String,
        required: [true, 'Vui lòng nhập email của bạn'],
        unique: true,
        validate: [validator.isEmail, 'Vui lòng nhập đúng địa chỉ email']
    },
    password: {
        type: String,
        require: [true, 'Vui lòng nhập mật khẩu của bạn'],
        minlength: [6, 'Mật khẩu của bạn phải lớn hơn 6 kí tự'],
        select: false
    },
    avatar: {
        public_id: {
            type: String,
            require: true
        },
        url: {
            type: String,
            require: true
        }
    },
    role: {
        type: String,
        default: 'user'
    },

    createdAt: {
        type: Date,
        default: Date.now 
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date 
    

})
userSchema.pre('save', async function(next){
    if(!this.isModified('password')){
        next()
    }
    this.password = await bcrypt.hash(this.password, 10)
})

userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password)
}
userSchema.methods.getJwtToken = function(){
    return jwt.sign({ id: this._id}, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_TIME
    });

}

userSchema.methods.getResetPasswordToken = function(){
    const resetToken = crypto.randomBytes(20).toString('hex');

    this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex')

    this.resetPasswordExpire = Date.now() + 30 * 60 * 1000

    return resetToken
}

module.exports = mongoose.model('User', userSchema);