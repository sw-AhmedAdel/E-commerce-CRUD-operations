/*

async function httpGetAllProducts(req, res, next) {
  client.get("products", async (error, products) => {
    if (error) console.error(error);
    if (products != null) {
      return res.status(200).json({
        status: "success",
        results: JSON.parse(products).length,
        products: JSON.parse(products),
      });
    } else {
      console.log("feathing data");
      const feature = new filter(req.query);
      const { limit, skip } = feature.pagination();

      const products = await GetAllProducts(
        feature.filter(),
        feature.sort("-createdAt"),
        feature.fields(),
        skip,
        limit
      );
      client.SETEX("products", 3600, JSON.stringify(products));
      return res.status(200).json({
        status: "success",
        results: products.length,
        data: products,
      });
    }
  });
}
*/
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
