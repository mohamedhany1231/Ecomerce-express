const express = require("express");

const reviewController = require("../controllers/reviewController");
const authController = require("../controllers/authController");

const router = express.Router({ mergeParams: true });

router
  .route("/")
  .post(
    authController.protect,
    reviewController.setBookUserBody,
    reviewController.createReview
  )
  .get(reviewController.getAllReviews);

router.use(authController.protect);

router
  .route("/:id")
  .get(reviewController.getReview)
  .delete(reviewController.authorizeReview, reviewController.deleteReview)
  .patch(reviewController.authorizeReview, reviewController.updateReview);

module.exports = router;
