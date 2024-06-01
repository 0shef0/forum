module.exports = (sequelize, Sequelize) => {
    const Post = sequelize.define("posts", {
        title: {
            type: Sequelize.STRING(100)
        },
        content: {
            type: Sequelize.STRING(4096)
        },
        status: {
            type: Sequelize.ENUM("active", "inactive"),
            defaultValue: "active",
        },
        likesCount: {
            type: Sequelize.INTEGER,
            defaultValue: 0
        }
});

    return Post;
  };
  