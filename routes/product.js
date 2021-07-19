const express = require("express");
const router = express.Router();

//controllers
const {
  create,
  listAll,
  remove,
  read,
  update,
  listDynemically,
  productsCount,
  starRating,
  listRelated,
  searchFilter,
  listBySubCategory,
} = require("../controllers/product");
//middleware for auth check
const { authCheck, adminCheck } = require("../middlewares/auth");

router.post("/product", authCheck, adminCheck, create);
router.get("/products/total", productsCount);

router.get("/products/:count", listAll);

router.get("/product/:slug", read);
router.put("/product/:slug", update);
router.delete("/product/:slug", authCheck, adminCheck, remove);
router.post("/products", listDynemically);
router.post("/products/sub-category", listBySubCategory);
//rating
router.put("/product/star/:productId", authCheck, starRating);
//related
router.get("/product/related/:productId", listRelated);
//search
router.post("/search/filters", searchFilter);

module.exports = router;
