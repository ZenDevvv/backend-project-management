import { Request, Response, NextFunction } from "express";
import { ProjectModel } from "../models/projectModel";
import projectRepository from "../repository/projectRepository";
import { config } from "../config/config";
import { trimAll } from "../helper/trimHelper";
import { FilterQuery } from "mongoose";
import { DbParams } from "../repository/projectRepository";

const projectService = {
  getProject,
  getProjects,
  createProject,
  updateProject,
  deleteProject,
  searchProjects,
  searchAndUpdate,
  getProjectDashboard,
  getProjectsByUserId,
};

export default projectService;

async function getProjectsByUserId(
  userId: string,
  dbParams: DbParams & { page: number; pageSize: number }
) {
  try {
    const { data: projects, pagination } =
      await projectRepository.getProjectsByUserId(userId, dbParams);

    if (projects.length === 0) {
      return {
        success: false,
        message: "No projects found for this user",
        pagination, 
      };
    }

    return {
      success: true,
      projects,
      pagination, 
    };
  } catch (error) {
    console.error(`Error in service - getProjectsByUserId: ${error}`);
    return {
      success: false,
      message: "An error occurred while fetching projects",
    };
  }
}

async function getProjectDashboard(name: string): Promise<ProjectModel | null> {
  try {
    const project = await projectRepository.getProjectDashboard(name);
    return project;
  } catch (error) {
    console.error(`Error getting project by name: ${error}`);
    return null;
  }
}

async function getProject(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response> {
  const { name } = req.params;

  const select =
    typeof req.query.select === "string"
      ? req.query.select
          .split(",")
          .map((field) => field.trim())
          .join(" ")
      : undefined;

  const populateArray =
    typeof req.query.populate === "string"
      ? req.query.populate.split(",").map((field) => field.trim())
      : undefined;

  try {
    const project = await projectRepository.getProject(name, {
      select,
      populateArray,
    });

    if (!project) {
      return res.status(404).json({ message: config.ERROR.PROJECT.NOT_FOUND });
    }

    return res.status(200).json({ project });
  } catch (error) {
    return handleError(res, error);
  }
}
async function getProjects(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response> {
  const queryParam = req.query.query || ""; // Default to an empty string if not provided
  const limit = parseInt(req.query.limit as string, 10) || 10; // Default to 10 if limit is not provided or invalid

  // Build the query object for MongoDB search
  const query =
    typeof queryParam === "string" && queryParam.trim() !== ""
      ? { name: { $regex: queryParam, $options: "i" } }
      : {}; // If queryParam is empty or not a string, match all

  // Handle select query (for specifying fields to retrieve)
  const select =
    typeof req.query.select === "string"
      ? req.query.select
          .split(",")
          .map((field) => field.trim())
          .join(" ") // Join selected fields by space
      : undefined;

  // Handle populate query (for joining related collections)
  const populateArray =
    typeof req.query.populate === "string"
      ? req.query.populate.split(",").map((field) => field.trim()) // Handle multiple fields
      : undefined;

  const dbParams = {
    query,
    limit,
    select,
    populateArray,
  };

  try {
    const projects = await projectRepository.getProjects(dbParams);
    return res.status(200).json(projects);
  } catch (error) {
    return handleError(res, error);
  }
}

async function createProject(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response> {
  const trimmedBody = trimAll(req.body);
  try {
    const project = await projectRepository.createProject(trimmedBody);
    return res
      .status(201)
      .json({ message: config.SUCCESS.PROJECT.CREATE, project });
  } catch (error) {
    return handleError(res, error);
  }
}

async function updateProject(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response> {
  const trimmedBody = trimAll(req.body);
  const { id } = req.params;

  try {
    const updatedProject = await projectRepository.updateProject(
      id,
      trimmedBody
    );
    if (!updatedProject) {
      return res.status(404).json({ message: config.ERROR.PROJECT.NOT_FOUND });
    }
    return res.status(200).json({
      message: config.SUCCESS.PROJECT.UPDATE,
      project: updatedProject,
    });
  } catch (error) {
    return handleError(res, error);
  }
}

async function deleteProject(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response> {
  try {
    const deletedProject = await projectRepository.deleteProject(req.params.id);
    if (!deletedProject) {
      return res.status(404).json({ message: config.ERROR.PROJECT.NOT_FOUND });
    }
    return res.status(200).json({
      message: config.SUCCESS.PROJECT.DELETE,
      project: deletedProject,
    });
  } catch (error) {
    return handleError(res, error);
  }
}

async function searchProjects(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response> {
  try {
    const query = req.query.search as string;
    const projects = await projectRepository.searchProjects(query);
    return res.status(200).json(projects);
  } catch (error) {
    return handleError(res, error);
  }
}

async function searchAndUpdate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const query: FilterQuery<ProjectModel> = req.body.query;
    const update = req.body.update;
    const multi: boolean = req.body.multi || false;

    const result = await projectRepository.searchAndUpdate(query, update, {
      multi,
    });

    if (multi) {
      res.status(200).json(result);
    } else {
      if (result) {
        res.status(200).json(result);
      } else {
        res.status(404).json({ message: "Project not found" });
      }
    }
  } catch (error) {
    console.error(`Error in searchAndUpdate: ${error}`);
    next(error);
  }
}

function handleError(res: Response, error: unknown): Response {
  if (error instanceof Error) {
    return res.status(500).json({ message: error.message });
  }
  return res.status(500).json({ message: "An unknown error occurred" });
}
