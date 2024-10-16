import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Product name is required"],
        },
        description: {
            type: String,
            required: [true, "Product description is required"],
        },
        price: {
            type: Number,
            required: [true, "Product price is required"],
            min: 0,
        },
        image: {
            type: String,
            required: [true, "Product image is required"],
        },
        category: {
            type: String,
            required: [true, "A product must belong to a category"],
        },
        // this property will decide whether to show this product in the featured products or not.
        isFeatured: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);

export default Product;
