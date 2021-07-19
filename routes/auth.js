const express = require("express");
const router = express.Router();

//controllers
const {createOrUpdateUser, currentUser} = require("../controllers/auth");
//middleware for auth check
const { authCheck, adminCheck } = require("../middlewares/auth");

router.post("/create-or-update-user", authCheck ,createOrUpdateUser);
router.post("/current-user", authCheck ,currentUser);
router.post("/current-admin", authCheck , adminCheck ,currentUser);

module.exports = router;