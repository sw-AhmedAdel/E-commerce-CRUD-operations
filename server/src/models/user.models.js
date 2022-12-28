const User = require("./user.mongo");

async function findByCredentials(email, password) {
  const user = await User.findByCredentials(email, password);
  return user;
}

async function createUser(user) {
  const newUser = new User(user);
  await newUser.save();
  return newUser;
}

async function findUser(filter) {
  return await User.findOne(filter);
}

async function getALLUsers() {
  return await User.find(
    {},
    {
      __v: 0,
    }
  );
}

async function UpdateMe(id, user) {
  const updatedUser = await User.findByIdAndUpdate(id, user, {
    new: true,
    runValidators: true,
  });

  return updatedUser;
}

async function DeleteMe(id) {
  await User.findByIdAndUpdate(id, {
    active: false,
  });
}

module.exports = {
  createUser,
  findByCredentials,
  findUser,
  getALLUsers,
  UpdateMe,
  DeleteMe,
};
