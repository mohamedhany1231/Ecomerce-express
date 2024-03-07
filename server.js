const dotenv = require("dotenv");
const mongoose = require("mongoose");

dotenv.config({ path: `${__dirname}/config.env` });
const app = require("./app");

const DB = process.env.DATABASE_STRING.replace(
  "<password>",
  process.env.DATABASE_PASSWORD
);
mongoose.connect(DB).then(() => {
  console.log("connected to database ✅");
});

const port = process.env.PORT || 3000;
app.listen(port, function (err) {
  if (err) console.log("error in server setup : " + err.message);
  else console.log(`listening on port ${port}`);
});
