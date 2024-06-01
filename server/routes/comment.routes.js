const { authJwt, cors} = require("../middleware");
const controller = require("../controllers/comment.controller");

module.exports = function(app) {
  app.use(cors.corsOpt);
  
  app.get("/api/comments/:comment_id",
            controller.getComment)

  app.post("/api/comments/:comment_id",
            [authJwt.verifyToken],
            controller.replyComment)

  app.get("/api/comments/:comment_id/like", 
            controller.getLikesFromComment)

  app.post("/api/comments/:comment_id/like",
            [authJwt.verifyToken],
            controller.createLike)

  app.patch("/api/comments/:comment_id",
            [authJwt.verifyToken, authJwt.isAdmin],
            controller.updateComment)

  app.delete("/api/comments/:comment_id",
            [authJwt.verifyToken, authJwt.isAdmin],
            controller.deleteComment)

  app.delete("/api/comments/:comment_id/like",
            [authJwt.verifyToken, authJwt.isAdmin],
            controller.deleteLike)
} 