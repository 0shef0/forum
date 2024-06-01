const config = require("../config/db.config.js");
const Sequelize = require("sequelize");
const sequelize = new Sequelize(
  config.DB,
  config.USER,
  config.PASSWORD,
  {
    host: config.HOST,
    dialect: config.dialect,
    operatorsAliases: false,

    pool: {
      max: config.pool.max,
      min: config.pool.min,
      acquire: config.pool.acquire,
      idle: config.pool.idle
    }
  }
);
const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.user = require("../models/user.model.js")(sequelize, Sequelize);
db.role = require("../models/role.model.js")(sequelize, Sequelize);
db.post = require("../models/post.model.js")(sequelize, Sequelize);
db.category = require("../models/category.model.js")(sequelize, Sequelize)
db.like = require("../models/like.model.js")(sequelize, Sequelize)
db.comment = require("../models/comment.model.js")(sequelize, Sequelize)
db.refreshToken = require("../models/refreshToken.model.js")(sequelize, Sequelize);
db.file = require("../models/file.model")(sequelize, Sequelize)
db.user.hasMany(db.post, {
  foreignKey: "userId"
})
db.post.belongsTo(db.user)
db.user.hasMany(db.like, {
  foreignKey: "userId"
})
db.like.belongsTo(db.user)

db.user.hasMany(db.comment, {
  foreignKey: "userId"
})
db.comment.belongsTo(db.user)

//post - category (change id)

db.post.belongsToMany(db.category, {
  through: "category_posts",
  foreignKey: "postId",
  otherKey: "categoryId"
});
db.category.belongsToMany(db.post, {
  through: "category_posts",
  foreignKey: "categoryId",
  otherKey: "postId"
});

//======================================

//role - user

db.role.belongsToMany(db.user, {
  through: "user_roles",
  foreignKey: "roleId",
  otherKey: "userId"
});
db.user.belongsToMany(db.role, {
  through: "user_roles",
  foreignKey: "userId",
  otherKey: "roleId"
});

//======================================

//like - post

db.post.hasMany(db.like, {
  foreignKey: "postId"
})
db.like.belongsTo(db.post)

//=======================================

//like - comment

db.comment.hasMany(db.like, {
  foreignKey: "commentId"
})
db.like.belongsTo(db.comment)

//=======================================

//post - comment

db.post.hasMany(db.comment, {
  foreignKey: "postId"
})
db.comment.belongsTo(db.post)


//=======================================

//comment - comment

db.comment.hasMany(db.comment, {
  foreignKey: "commentId"
})
db.comment.belongsTo(db.comment)

//=======================================

//refreshToken - user

db.refreshToken.belongsTo(db.user, {
  foreignKey: 'userId', targetKey: 'id'
});
db.user.hasOne(db.refreshToken, {
  foreignKey: 'userId', targetKey: 'id'
});

//=======================================

//file - user

db.user.hasMany(db.file, {
  foreignKey: "userId"
})
db.file.belongsTo(db.user)

//=======================================

//file - post

db.post.hasMany(db.file, {
  foreignKey: "postId"
})
db.file.belongsTo(db.post)

//=======================================
db.ROLES = ["user", "admin"];
module.exports = db;

