import express, { Request, Response, NextFunction } from "express";
import projectService from "../services/projectService";
import { API_ENDPOINTS } from "../config/endpointsConfig";
import { ZodError } from "zod";
import {
  projectIdSchema,
  createProjectSchema,
  searchAndUpdateSchema,
} from "../helper/validators/projectZod";
import { DbParams } from "../repository/projectRepository";
import { handleError } from "../helper/errorHandler";

const router = express.Router();

router.get(API_ENDPOINTS.PROJECT.GET_ALL, getProjects);
router.get(API_ENDPOINTS.PROJECT.GET_BY_ID, getProject);
router.post(API_ENDPOINTS.PROJECT.CREATE, createProject);
router.put(API_ENDPOINTS.PROJECT.UPDATE, updateProject);
router.delete(API_ENDPOINTS.PROJECT.REMOVE, deleteProject);
router.get(API_ENDPOINTS.PROJECT.SEARCH, searchProject);
router.patch(API_ENDPOINTS.PROJECT.SEARCH_AND_UPDATE, searchAndUpdate);
router.get(API_ENDPOINTS.PROJECT.DASHBOARD, getProjectDashboard);
router.get("/project/get/byUser/:id", getProjectsByUserId);

// In your router file
async function getProjectDashboard(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { name } = req.params;
  if (typeof name !== "string") {
    return res.status(400).json({ message: "Project name is required" });
  }
  try {
    const project = await projectService.getProjectDashboard(name);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    return res.status(200).json({ project });
  } catch (error) {
    handleError(res, error);
  }
}

async function getProjectsByUserId(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const userId = req.params.id;

  const dbParams: DbParams & { page: number; pageSize: number } = {
    limit: parseInt(req.query.limit as string) || 10,
    sort: req.query.sort ? JSON.parse(req.query.sort as string) : {},
    select: req.query.select ? (req.query.select as string).split(",") : [],
    populateArray: req.query.populate
      ? (req.query.populate as string).split(",")
      : [],
    page: parseInt(req.query.page as string) || 1, 
    pageSize: parseInt(req.query.pageSize as string) || 10, 
  };

  try {
    const response = await projectService.getProjectsByUserId(userId, dbParams);

    if (!response.success) {
      return res.status(404).json({ message: response.message });
    }

    return res.status(200).json({
      projects: response.projects,
      pagination: response.pagination, 
    });
  } catch (error) {
    return handleError(res, error);
  }
}

// Route Handlers
async function getProjects(req: Request, res: Response, next: NextFunction) {
  await projectService.getProjects(req, res, next);
}

async function getProject(req: Request, res: Response, next: NextFunction) {
  try {
    await projectService.getProject(req, res, next);
  } catch (error) {
    handleError(res, error);
  }
}

async function createProject(req: Request, res: Response, next: NextFunction) {
  try {
    createProjectSchema.parse(req.body);
    await projectService.createProject(req, res, next);
  } catch (error) {
    handleError(res, error);
  }
}

async function updateProject(req: Request, res: Response, next: NextFunction) {
  try {
    projectIdSchema.parse(req.params);
    await projectService.updateProject(req, res, next);
  } catch (error) {
    handleError(res, error);
  }
}

async function deleteProject(req: Request, res: Response, next: NextFunction) {
  try {
    projectIdSchema.parse(req.params);
    await projectService.deleteProject(req, res, next);
  } catch (error) {
    handleError(res, error);
  }
}

async function searchProject(req: Request, res: Response, next: NextFunction) {
  await projectService.searchProjects(req, res, next);
}

async function searchAndUpdate(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    searchAndUpdateSchema.parse(req.body);
    await projectService.searchAndUpdate(req, res, next);
  } catch (error) {
    handleError(res, error);
  }
}

export default router;
