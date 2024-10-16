import { redis } from "../db/redis.js";
import Product from "../models/product.model.js";

export const getAllProducts = async (req, res) => {
    try {
        const products = await Product.find({});
        res.status(200).json({
            status: true,
            results: products.length,
            products,
        });
    } catch (error) {
        console.log("Erro in getAllProducts controller");
        res.status(500).json({
            status: false,
            messsage: error.message,
        });
    }
};

export const getFeaturedProducts = async (req, res) => {
    try {
        // fetch products from redis if present
        let featuredProducts = await redis.get("featured_products");
        if (featuredProducts) {
            return res.status(200).json({
                status: true,
                featuredProducts: JSON.parse(featuredProducts),
            });
        }

        // otherwise fetch from the database
        featuredProducts = await Product.find({ isFeatured: true }).lean();
        if (!featuredProducts) {
            return res.status(404).json({
                status: false,
                message: "No featured products found",
            });
        }

        await redis.set("featured_products", JSON.stringify(featuredProducts));
        res.status(200).json({
            status: true,
            featuredProducts,
        });
    } catch (error) {
        console.log("Error in getFeaturedProducts controller", error.message);
        res.status(500).json({
            status: false,
            message: error.message,
        });
    }
};
