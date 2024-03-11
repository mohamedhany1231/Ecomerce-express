const express = require("express");

const authController = require("../controllers/authController");
const userController = require("../controllers/userController");
const userRouter = express.Router();

userRouter.route("/login").post(authController.login);
userRouter.route("/signup").post(authController.signup);

userRouter
  .route("/current-user")
  .get(authController.protect, userController.getCurrentUser);

userRouter.route("/logout").post(authController.logout);

userRouter
  .route("/")
  .get(userController.getAllUsers)
  .post(userController.createUser);

userRouter
  .route("/:id")
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = userRouter;
