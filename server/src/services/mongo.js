const mongoose = require("mongoose");
MONGO_URL = process.env.MONGO_URL;
mongoose.set("strictQuery", false);

mongoose.connection.once("open", () => {
  console.log("Running mongo");
});

mongoose.connection.on("error", (err) => {
  console.error("ERROR", err);
});

async function mongoConnect() {
  await mongoose.connect(MONGO_URL);
}

async function mongoDesiconnect() {
  await mongoose.disconnect();
}

module.exports = {
  mongoConnect,
};
