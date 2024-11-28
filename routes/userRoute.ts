import express, { Request, Response, NextFunction } from "express";
import userService from "../services/userService";
import { config } from "../config/config";
import { API_ENDPOINTS } from "../config/endpointsConfig";
import logActivity from "../middleware/activityLogger";
import { CustomRequest } from "../type/types";
import restrictToTypes from "../helper/restrictUserType";
import {
  userIdSchema,
  createUserSchema,
  loginUserSchema,
  updateUserSchema,
} from "../helper/validators/userZod";
import { handleError } from "../helper/errorHandler";

const router = express.Router();

// Routes
router.get(API_ENDPOINTS.USER.GET_ALL, getUsers);
router.get(API_ENDPOINTS.USER.GET_BY_ID, getUser);
router.post(API_ENDPOINTS.USER.CREATE, createUser);
router.put(API_ENDPOINTS.USER.UPDATE, updateUser);
router.delete(API_ENDPOINTS.USER.REMOVE, deleteUser);
router.post(API_ENDPOINTS.USER.LOGIN, loginUser);
router.get(API_ENDPOINTS.USER.LOGOUT, logoutUser);
router.get(API_ENDPOINTS.USER.CHECKLOGIN, currentUser);
router.get(
  API_ENDPOINTS.USER.SEARCH,
  restrictToTypes(config.USER_ACCESS_CONTROL.ALL_TYPES),
  searchUser
);

// Route Handlers
async function getUsers(req: Request, res: Response, next: NextFunction) {
  await userService.getUsers(req, res, next);
}

/*
 * @desc   Get user
 * @route  GET /api/user/:id
 * @access Private
 */
async function getUser(req: Request, res: Response, next: NextFunction) {
  try {
    userIdSchema.parse(req.params);
    await userService.getUser(req, res, next);
  } catch (error) {
    handleError(res, error);
  }
}

/*
 * @desc   Create user
 * @route  POST /api/user/create
 * @access Public
 */
async function createUser(req: Request, res: Response, next: NextFunction) {
  try {
    createUserSchema.parse(req.body);
    await userService.createUser(req, res, next);
  } catch (error) {
    handleError(res, error);
  }
}

/*
 * @desc   Update user
 * @route  PUT /api/user/update
 * @access Private
 */
async function updateUser(req: Request, res: Response, next: NextFunction) {
  try {
    updateUserSchema.parse(req.body);
    await userService.updateUser(req, res, next);
  } catch (error) {
    handleError(res, error);
  }
}

/*
 * @desc   Remove user
 * @route  DELETE /api/user/remove
 * @access Private
 */
async function deleteUser(req: Request, res: Response, next: NextFunction) {
  try {
    userIdSchema.parse(req.params);
    await userService.deleteUser(req, res, next);
  } catch (error) {
    handleError(res, error);
  }
}

/*
 * @desc   Login user
 * @route  POST /api/user/login
 * @access Public
 */
async function loginUser(
  req: CustomRequest,
  res: Response,
  next: NextFunction
) {
  // Validate the request body using the Zod schema
  const parseResult = loginUserSchema.safeParse(req.body);

  if (!parseResult.success) {
    return res.status(400).json({ errors: parseResult.error.errors });
  }

  try {
    const result = await userService.loginUser(req, res, next);
    if (result && result.user && result.user.id) {
      req.user = result.user;
      if (req.user) {
        await logActivity(req.user.id, null, "login");
      } else {
        console.error("User is not available");
      }
    } else {
      console.error("User is not available");
    }
    res.status(200).send(result);
  } catch (error) {
    if (!res.headersSent) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      res.status(400).send({ error: errorMessage });
    }
  }
}
/*
 * @desc   Logout user
 * @route  GET /api/user/logout
 * @access Private
 */
async function logoutUser(
  req: CustomRequest,
  res: Response,
  next: NextFunction
) {
  try {
    await userService.logoutUser(req, res, next);

    if (req.user?.id) {
      await logActivity(req.user.id, null, "logout");
    }

    req.user = undefined;
    res.status(200).json({ message: config.SUCCESS.USER.LOGOUT });
  } catch (error) {
    if (!res.headersSent) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      res.status(400).send({ error: errorMessage });
    }
  }
}

/*
 * @desc   Check login
 * @route  GET /api/user/login
 * @access Private
 */
async function currentUser(req: Request, res: Response, next: NextFunction) {
  await userService.currentUser(req, res, next);
}

/*
 * @desc   Search user
 * @route  GET /api/user/search
 * @access Private
 */
async function searchUser(req: Request, res: Response, next: NextFunction) {
  await userService.searchUser(req, res, next);
}

export default router;
