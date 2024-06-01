const { authJwt, cors} = require("../middleware");
const controller = require("../controllers/role.controller");
const {check} = require("express-validator");

module.exports = function(app) {
    app.use(cors.corsOpt);

    app.post("/api/roles",
        [authJwt.verifyToken, authJwt.isAdmin, authJwt.checkAdmin],
        controller.createRole)

    app.get("/api/roles",
        [authJwt.verifyToken],
        controller.getRoles)

    app.post("/api/users/:user_id/addRole",
            [authJwt.verifyToken, authJwt.isAdmin, authJwt.checkAdmin],
            controller.addRoleToUser)
}