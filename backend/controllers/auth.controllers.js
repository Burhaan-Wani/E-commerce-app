import jwt from "jsonwebtoken";
import { generateTokens } from "../lib/generateTokens.js";
import { storeRefreshToken } from "../lib/redisRefreshToken.js";
import { setCookies } from "../lib/setCookies.js";
import User from "../models/user.model.js";
import { redis } from "../db/redis.js";

export const signup = async (req, res, next) => {
    const { name, email, password } = req.body;
    try {
        if (!name || !email || !password) {
            return res.status(400).json({
                status: false,
                message: "All fields are required",
            });
        }
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({
                status: true,
                message: "User with this email already exists",
            });
        }
        const user = await User.create({
            name,
            email,
            password,
        });

        // user authentication
        // generate tokens
        const { accessToken, refreshToken } = generateTokens(user._id);

        // store accesstoken in redis DB
        await storeRefreshToken(user._id, refreshToken);

        // set cookies for authentication
        setCookies(res, accessToken, refreshToken);

        user.password = undefined;
        res.status(201).json({
            status: true,
            message: "User created successfully",
            user,
        });
    } catch (error) {
        res.status(500).json({
            status: false,
            message: error.message,
        });
    }
};

export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                status: false,
                message: "Email and Password is required",
            });
        }
        const user = await User.findOne({ email });
        if (!user || !(await user.comparePasswords(password))) {
            return res.status(400).json({
                status: false,
                message: "Email or Password is incorrect",
            });
        }
        // generate tokens

        const { accessToken, refreshToken } = generateTokens(user._id);

        // store accesstoken in redis DB
        await storeRefreshToken(user._id, refreshToken);

        // set cookies for authentication
        setCookies(res, accessToken, refreshToken);
        user.password = undefined;
        res.status(200).json({
            status: true,
            message: "Logged in successfully",
            user,
        });
    } catch (error) {
        console.log("Error in login controller", error.message);
        res.status(500).json({
            status: false,
            message: error.message,
        });
    }
};

export const logout = async (req, res, next) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (refreshToken) {
            const decoded = jwt.verify(
                refreshToken,
                process.env.REFRESH_TOKEN_SECRET
            );
            await redis.del(`refreshToken:${decoded.userId}`);
        }
        res.clearCookie("accessToken");
        res.clearCookie("refreshToken");
        res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
        res.status(500).json({
            status: false,
            message: error.message,
        });
    }
};

export const refreshToken = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
            return res.status(400).json({
                status: false,
                message: "No refresh token provided",
            });
        }
        const decoded = jwt.verify(
            refreshToken,
            process.env.REFRESH_TOKEN_SECRET
        );
        const storedToken = await redis.get(`refreshToken:${decoded.userId}`);
        if (storedToken !== refreshToken) {
            return res.status(400).json({
                status: false,
                message: "Invalid refresh token",
            });
        }
        const accessToken = jwt.sign(
            { userId: decoded.userId },
            process.env.ACCESS_TOKEN_SECRET,
            {
                expiresIn: "15m",
            }
        );
        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            samesite: "strict",
            maxAge: 15 * 60 * 1000,
        }).json({
            status: true,
            message: "Access token refreshed successfully",
        });
    } catch (error) {
        console.log("Error in refreshToken controller", error.message);
        res.status(500).json({
            status: false,
            message: error.message,
        });
    }
};
