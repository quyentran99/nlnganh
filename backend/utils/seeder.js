const Product = require('../models/product');
const dotenv = require('dotenv');
const connectDatabase = require('../config/database');

const products = require('../data/products');
const product = require('../models/product');

require('dotenv').config();

connectDatabase();

const seeProduct = async () => {
    try{
        await Product.deleteMany();
        console.log('Sản phẩm đã được xoá.');
        //await Product.insertMany(products);
        // console.log('Sản phẩm đã được thêm vào.');
         process.exit();
    }
    catch(error){
        console.log(error.message);
        process.exit();
    }
} 

seeProduct();