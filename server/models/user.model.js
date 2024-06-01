module.exports = (sequelize, Sequelize) => {
  const User = sequelize.define("users", {
    raiting: {
      type: Sequelize.INTEGER,
      defaultValue: 0
    },
    username: {
      type: Sequelize.STRING(20)
    },
    email: {
      type: Sequelize.STRING
    },
    password: {
      type: Sequelize.STRING
    },
    jwtId: {
      type: Sequelize.STRING
    }
  });
  return User;
};
