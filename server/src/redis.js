const redis = require("redis");
const client = redis.createClient({
  legacyMode: true,
});

async function startServer() {
  await client.connect();
}
client.on("connect", function () {
  console.log("Connecting to redis");
});

client.on("ready", function () {
  console.log("Redis is ready to be used");
});

client.on("end", function () {
  console.log("Clinet is disconnect ");
});

client.on("error", function (err) {
  console.log(err.message);
});

startServer();
module.exports = client;
