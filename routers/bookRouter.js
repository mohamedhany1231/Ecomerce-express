const express = require("express");

const bookController = require("../controllers/bookController");
const authController = require("../controllers/authController");
const reviewRouter = require("./reviewRouter");

const router = express.Router();

router
  .route("/")
  .post(bookController.createBook)
  .get(bookController.getAllBooks);

router
  .route("/:id")
  .get(bookController.getBook)
  .patch(
    bookController.uploadBookImages,
    bookController.resizeBookImages,
    bookController.updateBook
  )
  .delete(bookController.deleteBook);

router.use("/:bookId/add-review", reviewRouter);
module.exports = router;
