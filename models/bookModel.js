const mongoose = require("mongoose");

const productsSchema = new mongoose.Schema({
  name: {
    required: [true, " book must have a name"],
    type: String,
    minLength: [8, "book name muse be 8 or more characters"],
    maxLength: [60, "book name muse be 60 or less characters"],
    unique: [true, "book name muse be unique"],
  },
  author: { type: String, default: "unknown author" },
  price: {
    type: Number,
    required: [true, " book must have a price"],
    min: [0, "book price can't be negative"],
  },
  category: {
    type: String,
    required: [true, " book must have a category"],
    enum: [
      "fantasy",
      "history",
      "poetry",
      "thriller",
      "romance",
      "science",
      "psychology",
    ],
  },
  ratingsAverage: { type: Number, default: 0 },
  ratingsCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now() },
  imageCover: { type: String },
  images: [String],
});

const productsModel = mongoose.model("Book", productsSchema);

module.exports = productsModel;
