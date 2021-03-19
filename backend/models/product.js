const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Vui lòng nhập tên sản phẩm'],
        trim: true,
        maxLength: [100, 'Tên sản phẩm không vượt quá 100 ký tự']
    },
    price: {
        type: Number,
        required: [true, 'Vui lòng nhập giá sản phẩm'],
        maxLength: [5, 'Tên sản phẩm không vượt quá 5 ký tự'],
        default: 0.0
    },
    description: {
        type: String,
        required: [true, 'Vui lòng nhập mô tả sản phẩm'],
    },
    ratings: {
        type: Number,
        default: 0
    },
    images: [
        {
            public_id: {
                type: String,
                required: true
            },
            url: {
                type: String,
                required: true
            },
        }
    ],
    category: {
        type: String,
        required: [true, 'Vui lòng chọn danh mục sản phẩm'],
        enum: {
            values: [
                'Electronics',
                'Camera',
                'Laptop',
                'Accessories',
                'Headphone',
                'Food',
                'Books',
                'Clothes/Shoes',
                'Beaty/Heath',
                'Sports',
                'Outdoor',
                'Home', 
                "Phone"
            ],
            message: 'Vui lòng chọn danh mục sản phẩm'
        }
    },
    seller: {
        type: String,
        required: [true, 'Vui lòng chọn người bán sản phẩm']
    },
    stock: {
        type: Number,
        required: [true, 'Vui lòng nhập kho sản phẩm'],
        maxLength: [5, 'Product name cannot exceed 5 characters'],
        default: 0
    },
    numofReviews: {
        type: Number,
        default: 0
    },
    reviews: [
        {
            user: {
                type: mongoose.Schema.ObjectId,
                ref: 'User',
                required: true
            },
            name: {
                type: String,
                required: true
            },
            rating: {
                type: Number,
                required: true
            },
            comment: {
                type: String,
                required: true
            }
        }
    ],
    
    createdAT: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('Product', productSchema);