const AppError = require("../utils/appError");
const Book = require("../models/bookModel");
const catchAsync = require("../utils/catchAsync");
const User = require("../models/userModel");

exports.addToCart = catchAsync(async (req, res, next) => {
  const { book: bookId, count = 1 } = req.body;

  if (Math.round(count) !== count)
    return next(new AppError("count must be integer", 400));

  const book = await Book.findById(bookId);
  if (!book) return next(new AppError("invalid book id", 400));

  let user;
  if (req.user.cart.find((c) => c.book?._id?.toString() === bookId)) {
    await req.user.save({ validateBeforeSave: false });
    user = await User.findOneAndUpdate(
      { _id: req.user.id, "cart.book": bookId },
      { $inc: { "cart.$.count": count } },
      { new: true, runValidators: true }
    );

    user = await User.findOneAndUpdate(
      { _id: req.user.id },
      {
        $pull: { cart: { count: { $lte: 0 } } },
      },
      { new: true, runValidators: true }
    );
  } else {
    if (count <= 0) return next(new AppError("count must be positive", 400));
    user = await User.findByIdAndUpdate(
      req.user.id,
      {
        $push: { cart: { book: bookId, count } },
      },
      { new: true, runValidators: true }
    );
  }

  res.status(200).json({
    data: {
      user,
    },
  });
});

exports.removeFromCart = catchAsync(async (req, res, next) => {
  const { bookId } = req.params;

  const user = await User.findOneAndUpdate(
    { _id: req.user.id },
    {
      $pull: { cart: { book: bookId } },
    },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    data: {
      user,
    },
  });
});
