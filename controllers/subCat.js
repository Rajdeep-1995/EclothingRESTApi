const SubCat = require("../models/subCat");
const Product = require("../models/product");
const slugify = require("slugify");

exports.create = async (req, res) => {
  const { name, parent } = req.body;
  try {
    const subCat = await new SubCat({
      name,
      parent,
      slug: slugify(name),
    }).save();
    res.json(subCat);
  } catch (error) {
    console.log(error);
    res.status(400).send("Failed to create sub-catagory");
  }
};

exports.list = async (req, res) => {
  try {
    const subCat = await SubCat.find().sort({ createdAt: -1 }).exec();
    res.json(subCat);
  } catch (error) {
    res.status(400).send("Failed to list sub-categories");
  }
};

exports.read = async (req, res) => {
  try {
    const subCat = await SubCat.findOne({ slug: req.params.slug }).exec();

    const product = await Product.find({ subs: subCat })
      .populate("category")
      .exec();
    res.json({ subCat, product });
  } catch (error) {
    res.status(400).send("Failed to read Sub-category");
  }
};

exports.update = async (req, res) => {
  const { name, parent } = req.body;
  try {
    const SubCatUpdated = await SubCat.findOneAndUpdate(
      {
        slug: req.params.slug,
      },
      { name, slug: slugify(name), parent },
      { new: true }
    );
    res.json(SubCatUpdated);
  } catch (error) {
    res.status(400).send("Failed to update Sub-category");
  }
};

exports.remove = async (req, res) => {
  try {
    const SubCatDelete = await SubCat.findOneAndDelete({
      slug: req.params.slug,
    });
    res.json(SubCatDelete);
  } catch (error) {
    res.status(400).send("Failed to delete Sub-category");
  }
};
