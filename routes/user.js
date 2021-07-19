const express = require("express");
const router = express.Router();


router.get("/user",(req,res)=>{
    res.json({
        message:"you hit the user api..."
    })
});

module.exports = router;