const express = require("express");
const morgan = require("morgan");

const productsRouter = require("./routers/productRouter");
const usersRouter = require("./routers/userRouter");
const globalErrorHandler = require("./controllers/errorController");

const app = express();

app.use(morgan("dev"));
app.use(express.json({ limit: "10KB" }));

app.use("/api/v1/products", productsRouter);
app.use("/api/v1/users", usersRouter);

app.use("*", (req, res, next) => {
  res.status(404).json({ status: "failure", message: "route does not exist" });
});
app.use(globalErrorHandler);

module.exports = app;
