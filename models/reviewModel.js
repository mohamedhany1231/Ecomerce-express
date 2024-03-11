const mongoose = require("mongoose");
const Book = require("./bookModel");

const reviewSchema = new mongoose.Schema({
  review: { type: String },
  rating: {
    type: Number,
    min: [1, "rating must be between 1 and 5"],
    max: [5, "rating must be between 5 and 1"],
    required: true,
  },
  user: { type: mongoose.Schema.ObjectId, required: true, ref: "User" },
  book: {
    type: mongoose.Schema.ObjectId,
    required: true,
    ref: "Book",
  },
  createdAt: { type: Date, default: Date.now() },
});

reviewSchema.pre(/^find/, function (next) {
  // TODO: add photo to user
  this.populate({ path: "user", select: "name" });
  next();
});

reviewSchema.statics.calcRatingOnBook = async function (bookId) {
  const bookRating = await this.aggregate([
    { $match: { book: bookId } },
    {
      $group: {
        _id: bookId,
        nRating: { $sum: 1 },
        avgRating: { $avg: "$rating" },
      },
    },
  ]);

  await Book.findByIdAndUpdate(bookId, {
    name: "book test",
    ratingsAverage: bookRating[0].avgRating,
    ratingsCount: bookRating[0].nRating,
  });
};

reviewSchema.post("save", function () {
  this.constructor.calcRatingOnBook(this.book);
});
const model = mongoose.model("Review", reviewSchema);

module.exports = model;
