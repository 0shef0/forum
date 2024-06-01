const { authJwt, cors} = require("../middleware");
const controller = require("../controllers/user.controller");

module.exports = function(app) {
  app.use(cors.corsOpt);

  app.get("/api/users", controller.allUsers)

  app.get("/api/users/:user_id", controller.userById)

  app.post("/api/users",
          [authJwt.verifyToken, authJwt.isAdmin, authJwt.checkAdmin],
          controller.createUser)

  app.delete("/api/users/:user_id",
            [authJwt.verifyToken, authJwt.isAdmin, authJwt.checkAdmin],
            controller.delete)

  app.patch("/api/users/:user_id",
            [authJwt.verifyToken, authJwt.isAdmin],
            controller.updateUserData)
};
