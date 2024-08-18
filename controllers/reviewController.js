const factoryController = require("./factoryController");
const catchAsync = require("../utils/catchAsync");
const Book = require("../models/bookModel");
const AppError = require("../utils/appError");

const Review = require("../models/reviewModel");

exports.setBookUserBody = catchAsync(async (req, res, next) => {
  if (!req.body.user) req.body.user = req.user._id;
  if (!req.body.book) req.body.book = req.params.bookId;
  next();
});

exports.authorizeReview = catchAsync(async (req, res, next) => {
  const rev = await Review.findById(req.params.id);
  if (rev.user.toString() !== req.user.id)
    return next(
      new AppError("you do not have permission to modify this review", 401)
    );

  next();
});

exports.createReview = factoryController.createOne(Review);
exports.getAllReviews = factoryController.getAll(Review);
exports.getReview = factoryController.getOne(Review);
exports.updateReview = factoryController.updateOne(Review);
exports.deleteReview = factoryController.deleteOne(Review);
