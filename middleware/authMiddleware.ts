import { Request, Response, NextFunction } from "express";
import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import { config } from "../config/config";
import userRepository from "../repository/userRepository";
import { CustomRequest } from "../type/types";
import { UserModel } from "../models/userModel";

interface DecodedToken {
  userId: {
    id?: string;
    [key: string]: any;
  };
  [key: string]: any;
}

// Usage: import unifiedAuthMiddleware from 'middleware/authMiddleware';
// Purpose: Middleware to verify JWT token and attach user to request object.
const unifiedAuthMiddleware = asyncHandler(
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization || (req.headers.Authorization as string);
    const tokenMatch = authHeader ? authHeader.match(config.JWTCONFIG.BEARER_REGEX) : null;
    let token = tokenMatch ? tokenMatch[1] : null;

    if (!token) {
      token = req.cookies.jwt;
    }

    if (!token) {
      res.status(401).json({ message: config.ERROR.USER.NOT_AUTHORIZED });
      return;
    }

    try {
      const decoded = jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET || config.JWTCONFIG.SECRET
      ) as DecodedToken;

      const userId = typeof decoded.user === "string" ? decoded.user : decoded.user.id;

      const user = await userRepository.getUser(userId, {
        options: {
          select: "email firstname lastname status type lastActive",
        },
      });

      if (!user) {
        res.status(401).json({ message: config.ERROR.USER.NOT_AUTHORIZED });
        return;
      }

      req.user = user as UserModel;
      req.token = token;
      next();
    } catch (error) {
      res.clearCookie(config.JWTCONFIG.CLEAR_COOKIE);
      if (error instanceof Error) {
        res.status(401).json({ message: error.message });
      } else {
        res.status(401).json({ message: "An unknown error occurred" });
      }
      res.end();
    }
  }
);

export default unifiedAuthMiddleware;
