const admin = require("../firebase/index");
const User = require("../models/user");

exports.authCheck = async (req, res, next) => {
  // console.log(req.headers);
  try {
    const firebaseUser = await admin
      .auth()
      .verifyIdToken(req.headers.authtoken);
    // console.log("Firebase user info:->>>>>", firebaseUser);
    req.user = firebaseUser;
    next();
  } catch (error) {
    res.status(401).json({
      err: "Token invalid or expired",
    });
  }
};

exports.adminCheck = async (req, res, next) => {
  const { email } = req.user;

  const adminUser = await User.findOne({ email }).exec();

  if (adminUser.role !== "admin") {
    res.status(403).json({
      err: "Admin resource. Access denied",
    });
  } else {
    next();
  }
};
