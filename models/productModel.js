const mongoose = require("mongoose");

const productsSchema = new mongoose.Schema({
  name: {
    required: [true, " product must have a name"],
    type: String,
    minLength: [8, "product name muse be 8 or more characters"],
    maxLength: [60, "product name muse be 60 or less characters"],
    unique: [true, "product name muse be unique"],
  },
  price: {
    type: Number,
    required: [true, " product must have a price"],
    min: [0, "product price can't be negative"],
  },
  category: {
    type: String,
    required: [true, " product must have a category"],
    enum: ["electronic", "digital", "books", "kitchen"],
  },
  ratingsAverage: Number,
  ratingsCount: Number,
  createdAt: { type: Date, default: Date.now() },
});

const productsModel = mongoose.model("Product", productsSchema);

module.exports = productsModel;
