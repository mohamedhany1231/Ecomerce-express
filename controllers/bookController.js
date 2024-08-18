const multer = require("multer");
const sharp = require("sharp");
const fs = require("fs");
const { v2: cloudinary } = require("cloudinary");
const { promisify } = require("util");

const catchAsync = require("../utils/catchAsync.js");
const AppError = require("../utils/appError.js");
const Book = require("../models/bookModel.js");
const factoryController = require("./factoryController.js");

const multerStorage = multer.memoryStorage();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
  secure: true,
});

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) cb(null, true);
  else {
    cb(new AppError("not an image , please upload only image", 400), false);
  }
};

const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

exports.uploadBookImages = upload.fields([
  { name: "imageCover", maxCount: 1 },
  { name: "images", maxCount: 3 },
]);

exports.resizeBookImages = catchAsync(async (req, res, next) => {
  if (req.files.imageCover) {
    req.body.imageCover = `book-${req.params.id}-${Date.now()}-cover.jpeg`;
    await sharp(req.files.imageCover[0].buffer)
      .resize(1920, 1080)
      .toFormat("jpeg")
      .jpeg({ quality: 90 })
      .toFile(`${req.body.imageCover}`);

    const uploadResponse = await cloudinary.uploader.upload(
      `${req.body.imageCover}`,
      { public_id: req.body.imageCover, folder: "books" }
    );

    await promisify(fs.rm)(req.body.imageCover);

    req.body.imageCover = uploadResponse.url;
  }
  if (req.files.images) {
    req.body.images = [];
    await Promise.all(
      req.files.images.map(async (img, i) => {
        const fileName = `book-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;

        await sharp(req.files.images[0].buffer)
          .resize(1920, 1080)
          .toFormat("jpeg")
          .jpeg({ quality: 90 })
          .toFile(`${fileName}`);

        const uploadResponse = await cloudinary.uploader.upload(`${fileName}`, {
          public_id: fileName,
          folder: "books",
        });

        req.body.images.push(uploadResponse.url);
        await promisify(fs.rm)(fileName);
      })
    );
  }

  next();
});

exports.topBooks = exports.createBook = factoryController.createOne(Book);
exports.getAllBooks = factoryController.getAll(Book);
exports.getBook = factoryController.getOne(Book);
exports.updateBook = factoryController.updateOne(Book);
exports.deleteBook = factoryController.deleteOne(Book);
