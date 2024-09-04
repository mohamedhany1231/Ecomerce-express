const { protect } = require("../controllers/authController");
const cartController = require("../controllers/cartController");
const router = require("express").Router();

router.use(protect);

router.route("/").patch(cartController.addToCart);

router.route("/:bookId").delete(cartController.removeFromCart);

module.exports = router;
