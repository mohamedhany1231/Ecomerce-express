const catchAsync = require("../utils/catchAsync.js");
const Book = require("../models/bookModel.js");
const factoryController = require("./factoryController.js");

exports.createBook = factoryController.createOne(Book);
exports.getAllBooks = factoryController.getAll(Book);
exports.getBook = factoryController.getOne(Book);
exports.updateBook = factoryController.updateOne(Book);
exports.deleteBook = factoryController.deleteOne(Book);
