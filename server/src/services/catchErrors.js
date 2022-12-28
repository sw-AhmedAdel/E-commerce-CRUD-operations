function unhandledRejection() {
  process.on("unhandledRejection", (err) => {
    console.log("unhandled Rejection");
    console.log(err.name, err.message);

    server.close(() => {
      process.exit(1);
    });
  });
}

function uncaughtExceptions() {
  process.on("uncaughtException", function (err) {
    console.log(err);
    console.log("uncaught Exceptions");
    console.log(err.name, err.message);
    process.exit(1);
  });
}

module.exports = {
  uncaughtExceptions,
  unhandledRejection,
};
