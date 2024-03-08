const jwt = require("jsonwebtoken");
const { promisify } = require("util");

const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
const sendSignToken = (res, user) => {
  const token = signToken(user.id);

  res.status(200).json({
    status: "success",
    token,
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const { email, password, confirmPassword, name } = req.body;
  const user = await User.create({ email, password, confirmPassword, name });
  sendSignToken(res, user);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new AppError("please provide email and password", 400));
  }

  const user = await User.findOne({ email });
  if (!user || !(await user.correctPassword(user.password, password))) {
    return next(new AppError("invalid log in credentials", 400));
  }

  sendSignToken(res, user);
});
//   TODO: log out if password has changed

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(
      new AppError("you are not logged in , please log in to gain access", 401)
    );
  }

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  const user = await User.findById(decoded.id);

  if (!user) {
    return next(
      new AppError("user belonging to this token no longer exist", 401)
    );
  }

  if (user.passwordChanged(user.passwordChangedAt, decoded.iat)) {
    return next(
      new AppError("password changed please log in again to gain access", 401)
    );
  }

  if (decoded.exp > Date.now()) {
    return next(
      new AppError("token expires , please log in again to gain access", 401)
    );
  }

  next();
});

exports.restrictTo = (...allowedRoles) =>
  catchAsync(async (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      next(
        new AppError("you don't have permission to preform this action", 403)
      );
    }

    next();
  });
