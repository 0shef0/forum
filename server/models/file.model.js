module.exports = (sequelize, Sequelize) => {
    const File = sequelize.define("files", {
        name: {
            type: Sequelize.STRING
        },
        type: {
            type: Sequelize.STRING
        },
        size: {
            type: Sequelize.INTEGER,
            defaultValue: 0
        },
        path: {
            type: Sequelize.STRING,
            defaultValue: ""
        }
    });

    return File;
};
