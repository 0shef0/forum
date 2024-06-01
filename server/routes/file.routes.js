const { authJwt, cors} = require("../middleware");
const controller = require("../controllers/file.controller");
const { isAdmin } = require("../middleware/authJwt");

module.exports = function(app) {
    app.use(cors.corsOpt);

    app.post("/api/posts/:post_id/files/upload",
        [authJwt.verifyToken],
        controller.uploadFile)

    app.get("/api/posts/:post_id/files/:file_id/download",
            [authJwt.verifyToken],
            controller.downloadFile)

    app.delete("/api/posts/:post_id/files/:file_id/delete",
                [authJwt.verifyToken, authJwt.isAdmin],
                controller.deleteFile)
}