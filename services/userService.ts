// Description: This file contains the user service responsible for handling user related operations.

import { Request, Response, NextFunction } from "express";
import { UserModel } from "../models/userModel";
import userRepository from "../repository/userRepository";
import { config } from "../config/config";
import { trimAll } from "../helper/trimHelper";
import { generateToken, sendResponseCookie } from "../utils/token";
import * as bcrypt from "bcrypt";
import validator from "validator";
import { CustomRequest } from "../type/types";

const userService = {
  getUser,
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  loginUser,
  logoutUser,
  currentUser,
  searchUser,
  cleanUpInactiveUsers,
};

export default userService;

async function getUser(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response> {
  try {
    const params = {
      populateArray: Array.isArray(req.query.populateArray)
        ? req.query.populateArray
        : [req.query.populateArray].filter(Boolean),
      select: req.query.select
        ? Array.isArray(req.query.select)
          ? req.query.select
          : [req.query.select]
        : ["_id"],
      lean: req.query.lean === "true",
    };

    const dbParams = {
      query: { _id: req.params.id },
      options: {
        populateArray: params.populateArray,
        select: params.select.join(" "),
        lean: params.lean,
      },
    };

    const user = await userRepository.getUser(req.params.id, dbParams);
    if (!user) {
      return res.status(400).json({ message: config.ERROR.USER.NOT_FOUND });
    }
    return res.status(200).json(user);
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ message: error.message });
    } else {
      return res.status(500).json({ message: "An unknown error occurred" });
    }
  }
}

async function getUsers(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response> {
  const params = {
    query: req.query.query || {},
    queryArray: req.query.queryArray,
    queryArrayType: req.query.queryArrayType,
    populateArray: Array.isArray(req.query.populateArray)
      ? req.query.populateArray
      : [req.query.populateArray].filter(Boolean),
    sort: req.query.sort,
    limit: parseInt(req.query.limit as string, 10),
    select: req.query.select
      ? Array.isArray(req.query.select)
        ? req.query.select
        : [req.query.select]
      : [],
    lean: req.query.lean === "true",
  };

  try {
    let dbParams: any = { query: { ...(params.query as object) } };

    if (params.queryArray) {
      let queryArrayObj: Record<string, any> = {};
      queryArrayObj[params.queryArrayType as string] = params.queryArray;
      dbParams.query = { ...dbParams.query, ...queryArrayObj };
    }

    if (params.populateArray.length > 0) {
      dbParams.options = dbParams.options || {};
      dbParams.options.populate = params.populateArray;
    }

    let optionsObj = {
      sort: params.sort,
      limit: params.limit,
      select: params.select ? params.select.join(" ") : undefined,
      lean: params.lean,
    };
    dbParams.options = { ...dbParams.options, ...optionsObj };
    const users = await userRepository.getUsers(dbParams);
    return res.status(200).json(users);
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ message: error.message });
    } else {
      return res.status(500).json({ message: "An unknown error occurred" });
    }
  }
}

async function createUser(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response> {
  const trimmedBody = trimAll(req.body);
  try {
    const { email, password, username, firstname, lastname, ...others } =
      trimmedBody;

    const userAvailable = await userRepository.searchAndUpdate({ email });
    if (userAvailable) {
      return res.status(400).json({ message: config.ERROR.USER.ALREADY_EXIST });
    }

    const hashedPassword = await bcrypt.hash(
      password,
      config.BCRYPT.SALT_ROUNDS
    );

    const user = await userRepository.createUser({
      username,
      firstname,
      lastname,
      email,
      ...others,
      password: hashedPassword,
    });

    return res
      .status(201)
      .json({ message: config.SUCCESS.USER.REGISTER, user });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ message: error.message });
    } else {
      return res.status(500).json({ message: "An unknown error occurred" });
    }
  }
}

async function updateUser(
  req: CustomRequest,
  res: Response,
  _next: NextFunction
): Promise<Response> {
  const trimmedBody = trimAll(req.body);
  try {
    const {
      _id,
      email,
      password,
      firstname,
      lastname,
      username,
      ...otherUpdates
    } = trimmedBody;

    if (!_id) {
      return res.status(400).json({ message: config.ERROR.USER.NO_ID });
    }

    if (email && !validator.isEmail(email)) {
      return res.status(400).json({ message: config.ERROR.USER.INVALID_EMAIL });
    }

    let updates: any = { ...otherUpdates };
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updates.password = hashedPassword;
    }

    if (email) updates.email = email;
    if (firstname) updates.firstname = firstname;
    if (lastname) updates.lastname = lastname;
    if (username) updates.username = username;

    const updatedUser = await userRepository.updateUser(_id, updates);

    if (!updatedUser) {
      return res.status(400).json({ message: config.ERROR.USER.NOT_FOUND });
    }

    const { password: _, ...userWithoutPassword } = updatedUser.toObject();

    return res
      .status(200)
      .json({ message: config.SUCCESS.USER.UPDATE, user: userWithoutPassword });
  } catch (error) {
    if (error instanceof Error && (error as any).code === 11000) {
      return res
        .status(400)
        .json({ message: config.ERROR.USER.EMAIL_ALREADY_EXISTS });
    } else {
      if (error instanceof Error) {
        return res.status(500).json({
          message: config.ERROR.USER.UPDATE_FAILED,
          error: error.message,
        });
      } else {
        return res.status(500).json({
          message: config.ERROR.USER.UPDATE_FAILED,
          error: "Unknown error",
        });
      }
    }
  }
}

async function deleteUser(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response> {
  try {
    const user = await userRepository.getUser(req.params.id);
    if (!user) {
      return res.status(400).json({ message: config.ERROR.USER.NOT_FOUND });
    }
    const deletedUser = await userRepository.deleteUser(req.params.id);
    return res
      .status(200)
      .json({ message: config.SUCCESS.USER.DELETE, user: deletedUser });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ message: error.message });
    } else {
      return res.status(500).json({ message: "Unknown error" });
    }
  }
}

async function loginUser(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> {
  const trimmedBody = trimAll(req.body);
  try {
    const { email, password } = trimmedBody;
    const userResult = await userRepository.searchAndUpdate({ email });
    if (!userResult) {
      return res.status(400).json({ message: config.ERROR.USER.NO_ACCOUNT });
    }
    const user = userResult as UserModel;
    if (user.status === "deactivated") {
      return res.status(403).json({ message: config.ERROR.USER.DEACTIVATED });
    }
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res
        .status(400)
        .json({ message: config.ERROR.USER.INVALID_CREDENTIALS });
    }

    user.lastActive = new Date();
    await user.save();

    const userResponse = {
      id: user.id,
      email: user.email,
      firstname: user.firstname,
      lastname: user.lastname,
      type: user.type,
    };

    const token = generateToken(user);
    sendResponseCookie(res, token);
    return res.status(200).json({ user: userResponse, token });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ message: error.message });
    } else {
      return res.status(500).json({ message: "Unknown error" });
    }
  }
}

async function logoutUser(
  req: CustomRequest,
  res: Response,
  _next: NextFunction
): Promise<Response> {
  try {
    // Clear the authentication cookie
    res.clearCookie(config.JWTCONFIG.CLEAR_COOKIE, {
      httpOnly: true,
      secure: process.env.NODE_ENV === config.JWTCONFIG.NODE_ENV,
      sameSite: "strict",
      path: "/",
    });

    // Clear the user from the request object
    req.user = undefined;

    // Send a success response
    return res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ message: error.message });
    } else {
      return res
        .status(500)
        .json({ message: "Unknown error occurred during logout" });
    }
  }
}

async function currentUser(
  req: CustomRequest,
  res: Response,
  _next: NextFunction
): Promise<Response> {
  try {
    if (!req.user) {
      return res
        .status(401)
        .json({ message: config.ERROR.USER.NOT_AUTHORIZED });
    }

    // Type guard to check if req.user is of type UserModel
    if (
      typeof req.user === "object" &&
      "email" in req.user &&
      "_id" in req.user
    ) {
      const userResponse = { ...req.user } as Partial<UserModel>;

      if ("password" in userResponse) {
        delete userResponse.password;
      }
      return res
        .status(200)
        .json({ user: userResponse, token: (req as any).token });
    } else {
      console.error("Invalid user data: ", req.user);
      return res
        .status(400)
        .json({ message: "User data is incomplete or invalid" });
    }
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ message: error.message });
    } else {
      return res.status(500).json({ message: "Unknown error" });
    }
  }
}

async function searchUser(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response> {
  try {
    const query = req.query.search as string;
    const users = await userRepository.searchUser(query);
    return res.status(200).json(users);
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ message: error.message });
    } else {
      return res.status(500).json({ message: "Unknown error" });
    }
  }
}

async function cleanUpInactiveUsers(): Promise<void> {
  try {
    const now = new Date();

    // Deactivate users who have been inactive for more than the threshold
    const deactivateSince = new Date(now);
    deactivateSince.setMonth(
      deactivateSince.getMonth() -
        config.CRON.CLEAN_UP.INACTIVE_USERS_DEACTIVATE_THRESHOLD
    );
    const deactivateResult = (await userRepository.searchAndUpdate(
      { lastActive: { $lt: deactivateSince } },
      { $set: { status: "deactivated" } },
      { multi: true }
    )) as { modifiedCount: number };

    if (deactivateResult.modifiedCount > 0) {
      console.log(`Deactivated ${deactivateResult.modifiedCount} users`);
    } else {
      console.log(config.ERROR.NO_DEACTIVE_USERS);
    }

    // Archive users who have been inactive for more than the archive threshold
    const archiveSince = new Date(now);
    archiveSince.setFullYear(
      archiveSince.getFullYear() -
        config.CRON.CLEAN_UP.INACTIVE_USERS_ARCHIVE_THRESHOLD
    );
    const archiveResult = (await userRepository.searchAndUpdate(
      { lastActive: { $lt: archiveSince } },
      { $set: { status: "archived" } },
      { multi: true }
    )) as { modifiedCount: number };

    if (archiveResult.modifiedCount > 0) {
      console.log(`Archived ${archiveResult.modifiedCount} users`);
    } else {
      console.log(config.ERROR.NO_ARCHIVE_USERS);
    }
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    } else {
      throw new Error(config.ERROR.UNEXPECTED);
    }
  }
}
