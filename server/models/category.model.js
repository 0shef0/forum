module.exports = (sequelize, Sequelize) => {
    const Category = sequelize.define("categories", {
        title: {
            type: Sequelize.STRING(20)
        },
        description: {
            type: Sequelize.STRING(100)
        },
});

    return Category;
  };
  