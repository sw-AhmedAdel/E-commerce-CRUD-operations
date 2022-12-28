const client = require("../redis");

async function cashingProducts(req, res, next) {
  let key_value;
  if (Object.keys(req.query).length === 0) {
    key_value = "products";
  } else {
    key_value = JSON.stringify(req.query);
  }

  client.get(key_value, async (error, products) => {
    if (error) console.error(error);
    else if (products != null) {
      return res.status(200).json({
        status: "success",
        results: JSON.parse(products).length,
        products: JSON.parse(products),
      });
    } else {
      req.key_value = key_value;
      next();
    }
  });
}

async function cashingUsers(req, res, next) {
  client.get("users", async (error, users) => {
    if (error) console.error(error);
    else if (users != null) {
      return res.status(200).json({
        status: "success",
        results: JSON.parse(users).length,
        users: JSON.parse(users),
      });
    } else {
      req.key_value = "users";
      next();
    }
  });
}

module.exports = {
  cashingProducts,
  cashingUsers,
};
