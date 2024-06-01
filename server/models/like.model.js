module.exports = (sequelize, Sequelize) => {
    const Like = sequelize.define("likes", {
        type: {
            type: Sequelize.ENUM("like", "dislike"),
            defaultValue: "like",
        }    
});

    return Like;
  };