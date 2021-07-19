const Product = require("../models/product");
const User = require("../models/user");
const slugify = require("slugify");

exports.create = async (req, res) => {
  //console.log(req.body);
  try {
    req.body.slug = slugify(req.body.title); //saving slugified title in incoming slug of req.body
    const newProduct = await new Product(req.body).save(); //saving the entire data in to the database
    res.json(newProduct);
  } catch (error) {
    console.log(error);
    res.status(400).json({
      err: error.message,
    });
  }
};

exports.listAll = async (req, res) => {
  try {
    let products = await Product.find({})
      .limit(parseInt(req.params.count))
      .populate("subs")
      .populate("category")
      .sort([["createdAt", "desc"]])
      .exec();
    res.json(products);
  } catch (error) {
    res.json(error);
    console.log("err------>", error);
  }
};

exports.remove = async (req, res) => {
  try {
    const deletedProduct = await Product.findOneAndRemove({
      slug: req.params.slug,
    }).exec();
    res.json(deletedProduct);
  } catch (error) {
    console.log(error);
    return res.status(400).send("Product delete failed");
  }
};

exports.read = async (req, res) => {
  try {
    let product = await Product.findOne({ slug: req.params.slug })
      .limit(parseInt(req.params.count))
      .populate("subs")
      .populate("category")
      .exec();
    res.json(product);
  } catch (error) {
    res.json(error);
    console.log("err------>", error);
  }
};

exports.update = async (req, res) => {
  try {
    req.body.slug = slugify(req.body.title); //saving slugified title in incoming slug of req.body
    const updateProduct = await Product.findOneAndUpdate(
      { slug: req.params.slug },
      req.body,
      { new: true }
    );
    // console.log(updateProduct);
    res.json(updateProduct);
  } catch (error) {
    console.log(error);
    res.status(400).json({
      err: error.message,
    });
  }
};

// Without pagination
// exports.listDynemically = async (req, res) => {
//   try {
//     const { sort, order, limit } = req.body;
//     const products = await Product.find({})
//       .populate("category")
//       .populate("subs")
//       .sort([[sort, order]]) // sorted by created or updated and orderd by ascending or descending
//       .limit(limit)
//       .exec();
//     res.json(products);
//   } catch (error) {
//     console.log(error);
//   }
// };

// With pagination
exports.listDynemically = async (req, res) => {
  try {
    const { sort, order, page, limit } = req.body;
    const currentpage = page || 1;
    const perPageLimit = limit || 3;

    const products = await Product.find({})
      .skip((currentpage - 1) * perPageLimit) // to skip the per page items as reqested from client
      .populate("category")
      .populate("subs")
      .sort([[sort, order]]) // sorted by created or updated and orderd by ascending or descending
      .limit(perPageLimit)
      .exec();
    res.json(products);
  } catch (error) {
    console.log(error);
  }
};

exports.listBySubCategory = async (req, res) => {
  try {
    const { subCategory, page, limit } = req.body;
    const currentpage = page || 1;
    const perPageLimit = limit || 3;

    let products = await Product.find({ subs: subCategory })
      .skip((currentpage - 1) * perPageLimit)
      .populate("category")
      .populate("subs")
      .limit(perPageLimit)
      .exec();

    res.json(products);
  } catch (error) {
    console.log("Err by listing subCat--->", error);
  }
};

exports.productsCount = async (req, res) => {
  let totalCount = await Product.find({}).estimatedDocumentCount().exec();
  res.json(totalCount);
};

exports.starRating = async (req, res) => {
  const { star } = req.body;

  const product = await Product.findById(req.params.productId).exec(); //find the product
  const user = await User.findOne({ email: req.user.email }).exec(); // find the logged in user (from req.user object)
  //check if the currently logged in user already added rating to this product
  let existingRatingObject = product.ratings.find(
    (ele) => ele.postedBy.toString() === user._id.toString()
  );

  //if user is not added strat rating, push rating to this product
  if (existingRatingObject === undefined) {
    let ratingAdded = await Product.findByIdAndUpdate(
      product._id,
      {
        $push: { ratings: { star, postedBy: user._id } }, //push start value and userId in rating array
      },
      { new: true }
    ).exec();
    res.json(ratingAdded);
  } else {
    //if user already added rating, update the rating
    let ratingUpdated = await Product.updateOne(
      {
        ratings: {
          $elemMatch: existingRatingObject, //find the rating object
        },
      },
      {
        $set: { "ratings.$.star": star }, //update the star value
      },
      { new: true }
    ).exec();
    res.json(ratingUpdated);
  }
};

exports.listRelated = async (req, res) => {
  const currentProduct = await Product.findById(req.params.productId).exec();

  const relatedProducts = await Product.find({
    _id: { $ne: currentProduct._id },
    subs: currentProduct.subs,
  })
    .limit(3)
    .populate("category")
    .populate("subs")
    .exec();

  res.json(relatedProducts);
};

//search / filter

const handleQuery = async (req, res, query) => {
  const products = await Product.find({
    title: { $regex: `.*${query}.*`, $options: "i" },
  })
    .populate("category", "id name")
    .populate("subs", "id name")
    .exec();

  // console.log("matched products--->", products);
  res.json(products);
};

const handlePrice = async (req, res, price) => {
  try {
    const products = await Product.find({
      price: {
        $gte: price[0],
        $lte: price[1],
      },
    })
      .populate("category", "id name")
      .populate("subs", "id name")
      .exec();

    res.json(products);
  } catch (error) {
    console.log(error);
  }
};

const handleCategory = async (req, res, category) => {
  try {
    let products = await Product.find({ category })
      .populate("category", "id name")
      .populate("subs", "id name")
      .exec();

    res.json(products);
  } catch (error) {
    console.log(error);
  }
};

const handleStars = async (req, res, stars) => {
  Product.aggregate([
    {
      $project: {
        document: "$$ROOT",
        //title:"$title"
        floorAvarge: {
          $floor: { $avg: "$ratings.star" },
        },
      },
    },
    {
      $match: { floorAvarge: stars },
    },
  ]).exec((err, aggregates) => {
    if (err) {
      console.log("Star rating err--->", err);
    } else {
      Product.find({ _id: aggregates })
        .populate("category", "id name")
        .populate("subs", "id name")
        .exec((err, products) => {
          if (err) {
            console.log("Failed to find products based on ratings--->", err);
          } else {
            res.json(products);
          }
        });
    }
  });
};

const handleSub = async (req, res, sub) => {
  try {
    let products = await Product.find({ subs: sub })
      .populate("category", "id name")
      .populate("subs", "id name")
      .exec();

    res.json(products);
  } catch (error) {
    console.log(error);
  }
};

const handleShipping = async (req, res, shipping) => {
  try {
    let products = await Product.find({ shipping })
      .populate("category", "id name")
      .populate("subs", "id name")
      .exec();

    res.json(products);
  } catch (error) {
    console.log(error);
  }
};

const handleBrand = async (req, res, brand) => {
  try {
    let products = await Product.find({ brand })
      .populate("category", "id name")
      .populate("subs", "id name")
      .exec();

    res.json(products);
  } catch (error) {
    console.log(error);
  }
};

const handleColor = async (req, res, color) => {
  try {
    let products = await Product.find({ color })
      .populate("category", "id name")
      .populate("subs", "id name")
      .exec();

    res.json(products);
  } catch (error) {
    console.log(error);
  }
};

const handleGender = async (req, res, gender) => {
  try {
    let products = await Product.find({ setGender: gender })
      .populate("category", "id name")
      .populate("subs", "id name")
      .exec();

    res.json(products);
  } catch (error) {
    console.log(error);
  }
};

exports.searchFilter = async (req, res) => {
  const { query, price, category, stars, sub, shipping, brand, color, gender } =
    req.body;

  if (query) {
    console.log("Query", query);
    await handleQuery(req, res, query);
  }

  //price [min,max]
  if (price !== undefined) {
    await handlePrice(req, res, price);
  }

  if (category) {
    await handleCategory(req, res, category);
  }

  if (stars) {
    await handleStars(req, res, stars);
  }

  if (sub) {
    await handleSub(req, res, sub);
  }

  if (shipping) {
    await handleShipping(req, res, shipping);
  }

  if (brand) {
    await handleBrand(req, res, brand);
  }

  if (color) {
    await handleColor(req, res, color);
  }

  if (gender) {
    await handleGender(req, res, gender);
  }
};
