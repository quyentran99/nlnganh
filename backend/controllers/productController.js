const product = require("../models/product");
const Product = require("../models/product");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const APIFeatures = require("../utils/apiFeatures");
//create new product
exports.newProduct = catchAsyncErrors(async (req, res, next) => {
  req.body.user = req.user.id;
  const product = await Product.create(req.body);

  res.status(201).json({
    success: true,
    product,
  });
});

//get all product
exports.getProducts = catchAsyncErrors(async (req, res, next) => {
  const resPerPage = 4;
  const apiFeatures = new APIFeatures(Product.find(), req.query)
    .search()
    .filter()
    .pagination(resPerPage);

  const products = await apiFeatures.query;

  res.status(200).json({
    success: true,
    count: products.length,
    products,
  });
});

//get single product
exports.getSingleProduct = catchAsyncErrors(async (req, res, next) => {
  const products = await Product.findById(req.params.id);
  if (!products) {
    return next(new ErrorHandler("Không tìm thấy sản phẩm", 404));
  }
  return res.status(200).json({
    success: true,
    products,
  });
});

//update product
exports.updateProduct = catchAsyncErrors(async (req, res, next) => {
  let products = await Product.findById(req.params.id);
  if (!products) {
    return next(new ErrorHandler("Không tìm thấy sản phẩm", 404));
  }

  products = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
    products,
  });
});

//delete product
exports.deleteProduct = catchAsyncErrors(async (req, res, next) => {
  const products = await Product.findById(req.params.id);
  if (!products) {
    return next(new ErrorHandler("Không tìm thấy sản phẩm", 404));
  }

  await product.remove();

  res.status(200).json({
    success: true,
    message: "Sản phẩm đã được xoá thành công.",
  });
});

//create new review
exports.createProductReview = catchAsyncErrors (async(req, res, next) =>{

  const {rating, comment, productId} = req.body;

  const review = {
    user: req.user._id,
    name: req.user.name,
    rating: Number(rating),
    comment
  }

  const product = await Product.findById(productId);

  const isReviewed = product.reviews.find(
    r => r.user.toString() === req.user._id.toString()
  )

  if(isReviewed){
    product.reviews.forEach(review => {
      if(review.user.toString() === req.user._id.toString()){
        review.comment = comment;
        review.rating = rating;
      }
    })
  }
  else {
    product.reviews.push(review);
    product.numofReviews = product.reviews.length;
  }

  product.ratings = product.reviews.reduce((acc, item) => item.rating +acc, 0) / product.reviews.length

  await product.save({ validateBeforeSave: false});

  res.status(200).json({
    success: true,
  })
})

//get product reviews
exports.getProductReviews = catchAsyncErrors( async(req, res, next) => {
  const product = await Product.findById(req.query.id);

  res.status(200).json({
    success: true,
    reviews: product.reviews
  })

})

//delete product reviews
exports.deleteReviews = catchAsyncErrors( async(req, res, next) => {
  const product = await Product.findById(req.query.productId);

    const reviews = product.reviews.filter(review => review._id.toString() !== req.query.id.toString());

    const numOfReviews = reviews.length;

    const ratings = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length;

    await Product.findByIdAndUpdate(req.query.productId,
        {
            reviews,
            ratings,
            numOfReviews
        },
        {
            new: true,
            runValidators: true,
            useFindAndModify: false
        })

    res.status(200).json({
        success: true,
        message: `Delete review successfully`
    })
 
})