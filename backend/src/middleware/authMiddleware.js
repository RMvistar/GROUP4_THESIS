import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../models/User.js";

dotenv.config();

export const verifyToken = (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    // Extract token from bearer
    const token = authHeader.split(" ")[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Add user info to request object for downstream role checks
    req.userId = decoded.id;
    req.user = {
      id: decoded.id,
      role: decoded.role,
    };

    // Backward compatibility for tokens without role in payload
    if (!req.user.role) {
      User.findById(decoded.id)
        .select("role")
        .then((user) => {
          if (!user) {
            return res.status(401).json({ message: "Invalid token user" });
          }

          req.user.role = user.role;
          next();
        })
        .catch((dbError) => {
          console.error("Token user lookup error:", dbError);
          return res.status(500).json({ message: "Server Error" });
        });

      return;
    }

    next();
  } catch (error) {
    console.error("Token verification error:", error);

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    }

    return res.status(401).json({ message: "Invalid token" });
  }
};
