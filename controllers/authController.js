const jwt = require("jsonwebtoken");
const { promisify } = require("util");

const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });

const sendSignToken = (res, user, statusCode, req) => {
  const token = signToken(user.id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    sameSite: "none",
    partitioned: true,
    domain:
      process.env.NODE_ENV !== "development" && "ecomerce-3qnz.onrender.com",
  };
  if (process.env.NODE_ENV === "production") cookieOptions.secure = true;
  res.cookie("jwt", token, cookieOptions);
  user.password = undefined;
  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const { email, password, confirmPassword, name } = req.body;
  const user = await User.create({ email, password, confirmPassword, name });
  sendSignToken(res, user, 201, req);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new AppError("please provide email and password", 400));
  }
  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.correctPassword(user.password, password))) {
    return next(new AppError("invalid log in credentials", 400));
  }

  sendSignToken(res, user, 200, req);
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies?.jwt) {
    token = req.cookies.jwt;
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
  if (decoded.exp > Date.now()) {
    return next(
      new AppError("token expires , please log in again to gain access", 401)
    );
  }

  if (user.passwordChanged(user.passwordChangedAt, decoded.iat)) {
    return next(
      new AppError("password changed please log in again to gain access", 401)
    );
  }

  req.user = user;
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

exports.logout = (req, res, next) => {
  res.cookie("jwt", "signedOut", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ status: "success" });
};
