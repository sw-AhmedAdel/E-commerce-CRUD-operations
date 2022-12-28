require("dotenv").config();
const http = require("http");
const app = require("./app");
const server = http.createServer(app);

const {
  unhandledRejection,
  uncaughtExceptions,
} = require("./services/catchErrors");
const { mongoConnect } = require("./services/mongo");

unhandledRejection();
uncaughtExceptions();

async function startServer() {
  await mongoConnect();
  console.log(process.env.NODE_ENV);
  server.listen(process.env.PORT, () => {
    console.log("Running the server");
  });
}
startServer();
