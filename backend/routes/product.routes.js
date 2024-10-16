import express from "express";
import { adminRoute, protectedRoute } from "../middlewares/auth.middleware.js";
import {
    getAllProducts,
    getFeaturedProducts,
} from "../controllers/product.controllers.js";

const router = express.Router();

router.get("/", protectedRoute, adminRoute, getAllProducts);
router.get("/featured", getFeaturedProducts);
export default router;
