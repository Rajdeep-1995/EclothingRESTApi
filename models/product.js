const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 32,
      text: true,
    },
    slug: {
      type: String,
      lowercase: true,
      unique: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
      maxlength: 200,
      text: true,
    },
    price: {
      type: Number,
      required: true,
      trim: true,
      maxlength: 32,
    },
    category: {
      type: ObjectId,
      ref: "Catagory",
    },
    subs: [
      {
        type: ObjectId,
        ref: "SubCat",
      },
    ],
    quantity: Number,
    sold: {
      type: Number,
      default: 0,
    },
    images: {
      type: Array,
    },
    shipping: {
      type: String,
      enum: ["Yes", "No"],
    },
    color: {
      type: String,
      enum: ["Black", "Blue", "Grey", "Brown", "White"],
    },
    brand: {
      type: String,
      enum: [
        "Nike",
        "Louis Vuitton",
        "Hermes",
        "H&M",
        "Zara",
        "Levi’s",
        "The North Face",
        "Under Armour",
        "Old Navy",
        "Calvin Klein",
        "Aldo",
        "Desigual",
      ],
    },
    pSize: [],
    sSize: [],
    setGender: {
      type: String,
    },
    ratings: [
      {
        star: Number,
        postedBy: { type: ObjectId, ref: "User" },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
