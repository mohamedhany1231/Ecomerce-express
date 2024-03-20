const multer = require("multer");
const sharp = require("sharp");

const catchAsync = require("../utils/catchAsync.js");
const AppError = require("../utils/appError.js");
const Book = require("../models/bookModel.js");
const factoryController = require("./factoryController.js");

const multerStorage = multer.memoryStorage();

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
  if (!req.files.imageCover) return next();

  req.body.imageCover = `book-${req.params.id}-${Date.now()}-cover.jpeg`;
  await sharp(req.files.imageCover[0].buffer)
    .resize(1920, 1080)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(`public/img/books/${req.body.imageCover}`);

  req.body.images = [];

  await Promise.all(
    req.files.images.map(async (img, i) => {
      const fileName = `book-${req.params.id}-${Date.now()}-${i + 1}`;
      await sharp(img.buffer)
        .resize(1920, 1080)
        .toFormat("jpeg")
        .jpeg({ quality: 90 })
        .toFile(`public/img/books/${fileName}`);
      req.body.images.push(fileName);
    })
  );

  next();
});

exports.createBook = factoryController.createOne(Book);
exports.getAllBooks = factoryController.getAll(Book);
exports.getBook = factoryController.getOne(Book);
exports.updateBook = factoryController.updateOne(Book);
exports.deleteBook = factoryController.deleteOne(Book);
