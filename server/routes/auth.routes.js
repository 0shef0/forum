const { authJwt } = require("../middleware")
const { verifySignUp } = require("../middleware");
const { cors } = require("../middleware")
const controller = require("../controllers/auth.controller");
const { check } = require("express-validator")

module.exports = function(app) {
    app.use(cors.corsOpt);

  app.post(
    "/api/auth/register",
    [
      check("username",
          "Incorrect username. Username must be longer than 3 and shorter than 21 symbols").isLength({min: 4, max: 20}),
      check("email",
          "Incorrect email").isEmail(),
      verifySignUp.checkDuplicateUsernameOrEmail,
    ],
    controller.signup
  );

  app.post("/api/auth/login", controller.signin);

  app.get("/api/auth/refreshtoken", controller.refreshToken);

  app.get("/api/auth/logout",
            [authJwt.verifyToken],
            controller.logout);
};

