const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "user muse have a name"],
    minLength: [3, "user name must be 3 characters or more"],
    maxLength: [20, " user name must be 20 characters or less"],
  },
  password: {
    type: String,
    required: [true, "user muse have a password"],
    minLength: [8, "user password must be 3 characters or more"],
    maxLength: [30, " user password must be 20 characters or less"],
    select: false,
  },
  confirmPassword: {
    type: String,
    required: [true, "please confirm your password"],
    validate: {
      validator: function (value) {
        return this.password === value;
      },
      message: "password does not match",
    },
  },
  email: {
    type: String,
    required: [true, "user muse have an email"],
    validate: [validator.isEmail, "please provide a valid email"],
    unique: [true, "user with this email already exists"],
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  passwordChangedAt: { type: Date, default: Date.now() },
  role: { type: String, default: "user", enum: ["admin", "user"] },
});
userSchema.pre("save", async function (next) {
  this.password = await bcrypt.hash(this.password, 12);
  this.confirmPassword = undefined;
  next();
});

userSchema.methods.correctPassword = async function (password, candidate) {
  return await bcrypt.compare(candidate, password);
};

userSchema.methods.passwordChanged = function (
  passwordChangedDate,
  tokenCreationDate
) {
  return tokenCreationDate * 1000 < new Date(passwordChangedDate).getTime();
};

const userModel = mongoose.model("User", userSchema);

module.exports = userModel;
