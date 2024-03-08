const catchAsync = require("../utils/catchAsync");
const Product = require("../models/productModel");
const factoryController = require("./factoryController.js");

exports.createProduct = factoryController.createOne(Product);
exports.getAllProducts = factoryController.getAll(Product);
exports.getProduct = factoryController.getOne(Product);
exports.updateProduct = factoryController.updateOne(Product);
exports.deleteProduct = factoryController.deleteOne(Product);
