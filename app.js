const express = require("express");
const path = require("path");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const compression = require("compression");

const booksRouter = require("./routers/bookRouter");
const usersRouter = require("./routers/userRouter");
const reviewsRouter = require("./routers/reviewRouter");
const globalErrorHandler = require("./controllers/errorController");

const app = express();

const corsConfig = {
  origin: [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://instant-mart.vercel.app",
  ],
  credentials: true,
};
app.use(cors(corsConfig));
app.options("*", cors(corsConfig));
app.use(morgan("dev"));
if (process.env.NODE_ENV !== "production") {
}

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json({ limit: "10KB" }));
app.set("trust proxy", 1);
app.use(
  rateLimit({
    limit: 50,
    windowMs: 60 * 1000,
    message: "Rate limit exceeded",
  })
);

app.use(helmet());

app.use(cookieParser());
app.use(compression());

app.use("/api/v1/books", booksRouter);
app.use("/api/v1/users", usersRouter);
app.use("/api/v1/reviews", reviewsRouter);

app.use("*", (req, res, next) => {
  res.status(404).json({ status: "failure", message: "route does not exist" });
});

app.use(globalErrorHandler);

module.exports = app;
