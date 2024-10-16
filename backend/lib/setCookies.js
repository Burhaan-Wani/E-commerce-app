export const setCookies = function (res, accessToken, refreshToken) {
    res.cookie("accessToken", accessToken, {
        httpOnly: true, // prevents XSS attacks
        secure: process.env.NODE_ENV === "production",
        samesite: "strict", // prevents CSRF attacks
        maxAge: 15 * 60 * 1000,
    });
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        samesite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });
};
