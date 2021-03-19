const mongoose = require('mongoose');

const orderSchema = mongoose.Schema({
    shippingInfo: {
        address: {
            type: String,
            require: true
        },
        city: {
            type: String,
            require: true
        },
        phoneNo: {
            type: Number,
            require: true
        },
        postalCode: {
            type: String,
            require: true
        },
        country: {
            type: String,
            require: true
        }
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        require: true,
        ref: 'User'
    },
    orderItems: [
        {
            name: {
                type: String,
                require: true
            },
            quantity: {
                type: Number,
                require: true
            },
            image: {
                type: String,
                require: true
            },
            price: {
                type: Number,
                require: true
            },
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
                require: true,
            }
        }
    ],
    paymentInfo: {
        id: {
            type: String
        },
        status: {
            type: String
        }
    },
    paidAt: {
        type: Date
    },
    itemsPrice: {
        type: Number,
        require: true,
        default: 0.0
    },
    shippingPrice: {
        type: Number,
        require: true,
        default: 0.0 
    },
    totalPrice: {
        type: Number,
        require: true,
        default: 0.0 
    },
    orderStatus: {
        type: String,
        require: true,
        default: 'Processing'
    },
    deliveredAt: {
        type: Date,
    },
    createAt: {
        type: Date,
        default: Date.now

    }
})

module.exports = mongoose.model('Order', orderSchema); 
