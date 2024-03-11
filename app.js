const express = require("express");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const cors = require("cors");

const booksRouter = require("./routers/bookRouter");
const usersRouter = require("./routers/userRouter");
const reviewsRouter = require("./routers/reviewRouter");
const globalErrorHandler = require("./controllers/errorController");

const app = express();

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

app.use(express.json({ limit: "10KB" }));
app.use(
  rateLimit({
    limit: 50,
    windowMs: 60 * 1000,
    message: "Rate limit exceeded",
  })
);

app.use(helmet());
app.use(cors());

app.use("/api/v1/books", booksRouter);
app.use("/api/v1/users", usersRouter);
app.use("/api/v1/reviews", reviewsRouter);

app.use("*", (req, res, next) => {
  res.status(404).json({ status: "failure", message: "route does not exist" });
});
app.use(globalErrorHandler);

module.exports = app;
