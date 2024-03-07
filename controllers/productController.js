const catchAsync = require("../utils/catchAsync");
const Product = require("../models/productModel");

exports.createProduct = catchAsync(async (req, res, next) => {
  const product = await Product.create(req.body);
  res.status(201).json({
    status: "success",
    data: {
      product,
    },
  });
});

const apiFeatures = class {
  constructor(query, queryString) {
    this.queryString = queryString;
    this.query = query;
  }
  filter() {
    const excludedFields = ["sort", "fields", "limit", "page"];
    const filters = { ...this.queryString };
    excludedFields.forEach((field) => {
      delete filters[field];
    });

    let queryStr = JSON.stringify(filters);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }
  sort() {
    // TODO: change default sort
    this.query = this.query.sort(
      this.queryString.sort?.split(",").join(" ") || "-price"
    );

    return this;
  }

  limitFields() {
    this.query = this.query.select(
      this.queryString.fields?.split(",").join(" ") || "-__v"
    );
    return this;
  }

  paginate() {
    const limit = this.queryString.limit || 5;
    const page = this.queryString.page || 1;
    const skip = (page - 1) * limit;

    this.query = this.query.limit(limit).skip(skip);
    return this;
  }
};

exports.getAllProducts = catchAsync(async (req, res, next) => {
  // console.log(filters);
  // const products = await Product.find(filters)
  //   .sort(req.query.sort)
  //   .select(req.query.fields);

  const features = new apiFeatures(Product.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const products = await features.query;

  res.status(200).json({
    status: "success",
    result: products.length,
    data: { products },
  });
});

exports.getProduct = catchAsync(async (req, res, next) => {
  const id = req.params.id;
  const product = await Product.findById(id);
  res.status(200).json({ status: "success", data: { product } });
});

exports.updateProduct = catchAsync(async (req, res, next) => {
  const id = req.params.id;
  const product = await Product.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({ status: "success", data: { product } });
});

exports.deleteProduct = catchAsync(async (req, res, next) => {
  const id = req.params.id;
  await Product.findByIdAndDelete(id);
  res.status(204).json({ status: "success" });
});
