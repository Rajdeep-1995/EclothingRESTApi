const express = require("express");
const router = express.Router();

const { uploadImages, removeImage } = require("../controllers/cloudinary");
const { authCheck, adminCheck } = require("../middlewares/auth");

router.post("/imageuploads", authCheck, adminCheck, uploadImages);
router.post("/imageremove", authCheck, adminCheck, removeImage);

module.exports = router;
