const Order = require('../models/order');
const Product = require('../models/product');

const ErrorHandler = require('../utils/errorHandler');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');


//create new order
exports.newOrder = catchAsyncErrors( async(req, res, next) =>{
    const {
        orderItems,
        shippingInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        paymentInfo
    } = req.body;

    const order = await Order.create({
        orderItems,
        shippingInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        paymentInfo,
        paidAt: Date.now(),
        user: req.user._id
    })

    res.status(200).json({
        success: true,
        order
    })
})

//get order single 
exports.getSingleOrder = catchAsyncErrors( async(req, res, next) => {
    const order = await Order.findById(req.params.id).populate('user', 'name email')

    if(!order){
        return next(new ErrorHandler('Không tìm thấy id sản phẩm', 404));
    } 
    res.status(200).json({
        success: true,
        order 
    })
})

//get single order
exports.getSingleOrder = catchAsyncErrors(async (req, res, next) =>{
    const order = await Order.findById(req.params.id).populate('user','email');

    if(!order){
        return next(new ErrorHandler('Không tìm thấy đơn hàng cùng với id này', 404));
    }

    res.status(200).json({
        success: true,
        order
    })

})

//get all order 
exports.allOrders = catchAsyncErrors(async (req, res, next) =>{
    const orders = await Order.find();

    let TotalAmount = 0;

    orders.forEach(order => {
        TotalAmount += order.totalPrice;
    })

    res.status(200).json({
        success: true,
        TotalAmount,
        orders
    })

})

//UPDATE / PROCESS  order - ADMIN 
exports.updateOrder = catchAsyncErrors(async (req, res, next) =>{
    const order = await Order.findById(req.params.id);

    if(order.orderStatus === 'Delivered'){
        return next(new ErrorHandler('Đơn hàng của bạn đang được vận chuyển',400));
    }

    order.orderItems.forEach(async item => {
        await updateStock(item.product, item.quantity)
    })

    order.orderStatus = req.body.status,
    order.deliveredAt = Date.now()

    await order.save();

    res.status(200).json({
        success: true
    })
})
async function updateStock(id, quantity){
    const product = await Product.findById(id);
    console.log('hiii', product)

    product.stock = product.stock - quantity;
    await product.save({ validateBeforeSave: false});
}

//get logged in user order 
exports.myOrders = catchAsyncErrors(async (req, res, next) =>{
    const orders = await Order.find({ user: req.user.id});

    res.status(200).json({
        success: true,
        orders
    })

})

//delete order order
exports.deleteOrder = catchAsyncErrors(async (req, res, next) =>{
    const order = await Order.findById(req.params.id);

    if(!order){
        return next(new ErrorHandler('Không tìm thấy đơn hàng', 404));
    }

    await order.remove();

    res.status(200).json({
        success: true,
        message: "Đơn hàng đã được xoá thành công."
    })

})
