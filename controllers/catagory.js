const Category = require("../models/category");
const Prouduct = require("../models/product");
const SubCat = require("../models/subCat");
const slugify = require("slugify");

exports.create = async (req, res) => {
  const { name } = req.body;
  try {
    const category = await new Category({ name, slug: slugify(name) }).save();
    res.json(category);
  } catch (error) {
    res.status(400).send("Failed to create catagory");
  }
};

exports.list = async (req, res) => {
  try {
    const category = await Category.find().sort({ createdAt: -1 }).exec();
    res.json(category);
  } catch (error) {
    res.status(400).send("Failed to list categories");
  }
};

exports.read = async (req, res) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug }).exec();
    // res.json(category);
    const product = await Prouduct.find({ category })
      .populate("category")
      .exec();
    res.json({ category, product });
  } catch (error) {
    res.status(400).send("Failed to read category");
  }
};

exports.update = async (req, res) => {
  const { name } = req.body;
  try {
    const categoryUpdated = await Category.findOneAndUpdate(
      {
        slug: req.params.slug,
      },
      { name, slug: slugify(name) },
      { new: true }
    );
    res.json(categoryUpdated);
  } catch (error) {
    res.status(400).send("Failed to update category");
  }
};

exports.remove = async (req, res) => {
  try {
    const categoryDelete = await Category.findOneAndDelete({
      slug: req.params.slug,
    });
    res.json(categoryDelete);
  } catch (error) {
    res.status(400).send("Failed to delete category");
  }
};

exports.getSubs = (req, res) => {
  SubCat.find({ parent: req.params.id }).exec((err, subs) => {
    if (err) {
      res.status(400).json(err);
    } else {
      res.json(subs);
    }
  });
};
