const { authJwt } = require("../middleware");
const { cors } = require("../middleware")
const controller = require("../controllers/category.controller");

module.exports = function(app) {
  app.use(cors.corsOpt);

  app.get("/api/categories",
          [authJwt.verifyToken, authJwt.isAdmin],
          controller.getCategories)
  app.get("/api/categories/:category_id",
          [authJwt.verifyToken, authJwt.isAdmin],
          controller.getCategory)
  app.get("/api/categories/category_id/posts",
          [authJwt.verifyToken, authJwt.isAdmin],
          controller.getPostFromCategory)
  app.post("/api/categories",
          [authJwt.verifyToken, authJwt.isAdmin, authJwt.checkAdmin],
          controller.createCategory)
  app.patch("/api/categories/:category_id",
            [authJwt.verifyToken, authJwt.isAdmin, authJwt.checkAdmin],
            controller.updateCategory)
  app.delete("/api/categories/:category_id",
            [authJwt.verifyToken, authJwt.isAdmin, authJwt.checkAdmin],
            controller.deleteCategory)
}