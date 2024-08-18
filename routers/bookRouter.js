const express = require("express");

const bookController = require("../controllers/bookController");
const authController = require("../controllers/authController");
const reviewRouter = require("./reviewRouter");

const router = express.Router();

router;
router
  .route("/")
  .post(
    authController.protect,
    authController.restrictTo(["admin"]),
    bookController.createBook
  )
  .get(bookController.getAllBooks);

router
  .route("/:id")
  .get(bookController.getBook)
  .patch(
    authController.protect,
    authController.restrictTo(["admin"]),
    bookController.uploadBookImages,
    bookController.resizeBookImages,
    bookController.updateBook
  )
  .delete(
    authController.protect,
    authController.restrictTo(["admin"]),
    bookController.deleteBook
  );

router.use("/:bookId/add-review", reviewRouter);
module.exports = router;
