import { redis } from "../db/redis.js";

export const storeRefreshToken = async (userId, refreshToken) => {
    await redis.set(
        `refreshToken:${userId}`,
        refreshToken,
        "EX",
        7 * 24 * 60 * 60 * 1000
    );
};
