const AppError = require("../utils/appError");
const handleCastError = (err) => {
  const message = `invalid ${err.path} : ${err.message}`;
  return new AppError(message, 400);
};
const handleValidationError = (err) => {
  const errors = Object.values(err.errors);
  return new AppError(errors.join(", "), 400);
};

const handleDuplicateField = (err) => {
  console.log();
  const message = ` duplicated field value ${
    err.message.match(/\{(.*?)\}/)[0]
  } , please use another value`;
  return new AppError(message, 400);
};

module.exports = (err, req, res, next) => {
  let error = { ...err, name: err.name, code: err.code, message: err.message };
  if (err.name === "CastError") error = handleCastError(err);
  if (err.name === "ValidationError") error = handleValidationError(err);
  if (err.code === 11000) error = handleDuplicateField(err);

  if (error?.isOperational)
    return res
      .status(error.statusCode || 500)
      .json({ status: error.status, message: error.message });

  res.status(500).json({ status: "fail", message: "something went wrong" });
  console.log(`ERROR 🔥 : ${err.message}`);
  console.log(err);
};
