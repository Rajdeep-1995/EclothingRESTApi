const cloudinary = require("cloudinary");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

exports.uploadImages = async (req, res) => {
  let result = await cloudinary.uploader.upload(req.body.image, {
    public_id: `${Date.now()}`,
    resource_type: "auto", //.png .jpeg --> auto
  });

  res.json({
    public_id: result.public_id,
    url: result.secure_url,
  });
};

exports.removeImage = (req, res) => {
  cloudinary.uploader.destroy(req.body.public_id, (err, result) => {
    if (err) return res.json({ success: false, err });
    res.send("Deleted");
  });
};
