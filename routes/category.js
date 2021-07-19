const express = require("express");
const router = express.Router();

//controllers
const {
  create,
  read,
  update,
  remove,
  list,
  getSubs,
} = require("../controllers/catagory");
//middleware for auth check
const { authCheck, adminCheck } = require("../middlewares/auth");

router.post("/category", authCheck, adminCheck, create);
router.get("/categories", list);
router.get("/category/:slug", read);
router.put("/category/:slug", authCheck, adminCheck, update);
router.delete("/category/:slug", authCheck, adminCheck, remove);
router.get("/category/subs/:id", getSubs);

module.exports = router;
