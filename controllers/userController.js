const factoryController = require("./factoryController");
const User = require("../models/userModel");
const AppError = require("../utils/appError.js");
const { v2: cloudinary } = require("cloudinary");
const fs = require("fs");
const { promisify } = require("util");

const multer = require("multer");
const catchAsync = require("../utils/catchAsync");
const sharp = require("sharp");

const multerStorage = multer.memoryStorage();
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) cb(null, true);
  else {
    cb(new AppError("not an image , please upload a valid image", 400));
  }
};

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
  secure: true,
});

const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

exports.uploadPicture = upload.fields([{ name: "photo", maxCount: 1 }]);

exports.resizeImage = catchAsync(async (req, res, next) => {
  if (req.files.photo) {
    const userId = req.user?.id || req.params.id;
    const fileName = `user-${userId}-${Date.now()}`;
    await sharp(req.files.photo[0].buffer)
      .resize(1920, 1080)
      .toFormat("jpeg")
      .jpeg({ quality: 90 })
      .toFile(fileName);

    const uploadResponse = await cloudinary.uploader.upload(fileName, {
      folder: "users",
      public_id: fileName,
    });

    await promisify(fs.rm)(fileName);

    req.body.photo = uploadResponse.url;
  }
  next();
});

exports.createUser = factoryController.createOne(User);
exports.getUser = factoryController.getOne(User);
exports.deleteUser = factoryController.deleteOne(User);
exports.updateUser = factoryController.updateOne(User);
exports.getAllUsers = factoryController.getAll(User);

exports.getCurrentUser = (req, res, next) => {
  res.status(200).json({ status: "success", data: { user: req.user } });
};
