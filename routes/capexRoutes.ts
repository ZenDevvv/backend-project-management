import express, { Request, Response, NextFunction } from "express";
import CapexService from "../services/capexService";
import { API_ENDPOINTS } from "../config/endpointsConfig";
import { ZodError, ZodIssue } from "zod";
import { DbParams } from "../helper/Dbparams";
import {
  createCapexSchema,
  updateCapexSchema,
  idParamSchema,
  searchAndUpdateSchema,
} from "../helper/validators/capexZod";
import { handleError } from "../helper/errorHandler";

const router = express.Router();

router.get(API_ENDPOINTS.CAPEX.GET_ALL, getCapexes);
router.get(API_ENDPOINTS.CAPEX.GET_BY_ID, getCapex);
router.post(API_ENDPOINTS.CAPEX.CREATE, createCapex);
router.put(API_ENDPOINTS.CAPEX.UPDATE, updateCapex);
router.delete(API_ENDPOINTS.CAPEX.REMOVE, deleteCapex);
router.get(API_ENDPOINTS.CAPEX.SEARCH, searchCapex);
router.put(API_ENDPOINTS.CAPEX.SEARCH_AND_UPDATE, searchAndUpdateCapex);

// Route Handlers
async function getCapexes(req: Request, res: Response, next: NextFunction) {
  try {
    const dbParams: DbParams = {};
    if (req.query.select) {
      dbParams.select = (req.query.select as string).split(",");
    }
    if (req.query.populate) {
      dbParams.populateArray = (req.query.populate as string).split(",");
    }
    const capexes = await CapexService.getCapexes(dbParams);
    return res.status(200).json(capexes);
  } catch (error) {
    handleError(res, error);
  }
}

async function getCapex(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;

    const result = idParamSchema.safeParse(req.params);
    if (!result.success) {
      return res.status(400).json({
        message: result.error.format().id?._errors[0] ?? "Invalid ID",
      });
    }

    const dbParams: DbParams = {
      select: req.query.select
        ? (req.query.select as string).split(",")
        : undefined,
      populateArray: req.query.populate
        ? (req.query.populate as string).split(",")
        : undefined,
    };

    const capex = await CapexService.getCapex(id, dbParams);
    if (capex) {
      return res.status(200).json(capex);
    } else {
      return res.status(404).json({ message: "Capex not found" });
    }
  } catch (error) {
    handleError(res, error);
  }
}

async function createCapex(req: Request, res: Response, next: NextFunction) {
  try {
    createCapexSchema.parse(req.body);
    const capex = await CapexService.createCapex(req.body);
    return res.status(201).json(capex);
  } catch (error) {
    handleError(res, error);
  }
}

async function updateCapex(req: Request, res: Response, next: NextFunction) {
  try {
    const result = idParamSchema.safeParse(req.params);
    if (!result.success) {
      return res.status(400).json({
        message: result.error.format().id?._errors[0] ?? "Invalid ID",
      });
    }

    const capex = await CapexService.updateCapex(req.params.id, req.body);
    if (capex) {
      return res.status(200).json(capex);
    } else {
      return res.status(404).json({ message: "Capex not found" });
    }
  } catch (error) {
    handleError(res, error);
  }
}

async function deleteCapex(req: Request, res: Response, next: NextFunction) {
  try {
    const result = idParamSchema.safeParse(req.params);
    if (!result.success) {
      return res.status(400).json({
        message: result.error.format().id?._errors[0] ?? "Invalid ID",
      });
    }

    const capex = await CapexService.deleteCapex(req.params.id);
    if (capex) {
      return res.status(200).json({ message: "Capex deleted" });
    } else {
      return res.status(404).json({ message: "Capex not found" });
    }
  } catch (error) {
    handleError(res, error);
  }
}

export async function searchCapex(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const dbParams: DbParams = {
      select: req.query.select
        ? (req.query.select as string).split(",")
        : undefined,
      populateArray: req.query.populate
        ? (req.query.populate as string).split(",")
        : undefined,
      page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
      pageSize: req.query.pageSize
        ? parseInt(req.query.pageSize as string, 10)
        : 10,
    };

    const query = req.query.search as string;

    if (!query) {
      return res.status(400).json({ message: "Search query is required." });
    }

    const capexes = await CapexService.searchCapex(query, dbParams);

    return res.status(200).json(capexes);
  } catch (error) {
    handleError(res, error);
  }
}

async function searchAndUpdateCapex(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { query, update, options } = req.body;
    const dbParams: DbParams = {
      select: options?.select ? options.select.split(",") : undefined,
      populateArray: options?.populate
        ? options.populate.split(",")
        : undefined,
    };

    const result = await CapexService.searchAndUpdateCapex(
      query,
      update,
      dbParams
    );
    return res.status(200).json(result);
  } catch (error) {
    handleError(res, error);
  }
}

export default router;
