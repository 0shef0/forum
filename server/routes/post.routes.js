const { authJwt, cors} = require("../middleware");
const controller = require("../controllers/post.controller");

module.exports = function(app) {
  app.use(cors.corsOpt);

  app.get("/api/posts", controller.getAllPosts)

  app.get("/api/posts/:post_id", controller.getPost)

  app.get("/api/posts/:post_id/comments", controller.getCommentsFromPost)

  app.get("/api/posts/:post_id/categories", controller.getCategoriesFromPost)

  app.get("/api/posts/:post_id/like", controller.getLikesFromPost)

  app.get("/api/posts/:post_id/files", controller.getFilesFromPost)

  app.post("/api/posts/:post_id/like",
          [authJwt.verifyToken],
          controller.createLike)

  app.post("/api/posts/:post_id/comments",
          [authJwt.verifyToken],
          controller.createComment)

  app.post("/api/posts",
            [authJwt.verifyToken],
            controller.createPost)

  app.patch("/api/posts/:post_id",
            [authJwt.verifyToken, authJwt.isAdmin],
            controller.updatePost)

  app.delete("/api/posts/:post_id",
            [authJwt.verifyToken, authJwt.isAdmin],
            controller.deletePost)
  
  app.delete("/api/posts/:post_id/like",
            [authJwt.verifyToken],
            controller.deleteLike)
};