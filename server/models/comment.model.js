module.exports = (sequelize, Sequelize) => {
    const Comment = sequelize.define("comments", {
        content: {
            type: Sequelize.STRING(255)
        },
});
    return Comment;
  };