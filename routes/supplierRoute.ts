import express, { Request, Response, NextFunction } from "express";
import supplierService from "../services/supplierService";
import { API_ENDPOINTS } from "../config/endpointsConfig";
import {
  createSupplierSchema,
  updateSupplierSchema,
  idParamSchema,
  searchAndUpdateSchema,
} from "../helper/validators/supplierZod";
import { handleError } from "../helper/errorHandler";


const router = express.Router();

router.get(API_ENDPOINTS.SUPPLIER.GET_ALL, getSuppliers);
router.get(API_ENDPOINTS.SUPPLIER.GET_BY_ID, getSupplier);
router.post(API_ENDPOINTS.SUPPLIER.CREATE, createSupplier);
router.put(API_ENDPOINTS.SUPPLIER.UPDATE, updateSupplier);
router.delete(API_ENDPOINTS.SUPPLIER.REMOVE, deleteSupplier);
router.get(API_ENDPOINTS.SUPPLIER.SEARCH, searchSupplier);
router.patch(API_ENDPOINTS.SUPPLIER.SEARCH_AND_UPDATE, searchAndUpdate);

/*
 * @desc   Get all suppliers
 * @route  GET /api/supplier/get/all
 * @access Public
 */
async function getSuppliers(req: Request, res: Response, next: NextFunction) {
  try {
    await supplierService.getSuppliers(req, res, next);
  } catch (error) {
    handleError(res, error);
  }
}

/*
 * @desc   Get supplier by ID
 * @route  GET /api/supplier/:id
 * @access Private
 */
async function getSupplier(req: Request, res: Response, next: NextFunction) {
  try {
    const parseResult = idParamSchema.safeParse(req.params);

    if (!parseResult.success) {
      return res.status(400).json({ errors: parseResult.error.errors });
    }

    await supplierService.getSupplier(req, res, next);
  } catch (error) {
    handleError(res, error);
  }
}

/*
 * @desc   Create supplier
 * @route  POST /api/supplier/create
 * @access Private
 */
async function createSupplier(req: Request, res: Response, next: NextFunction) {
  try {
    const parseResult = createSupplierSchema.safeParse(req.body);

    if (!parseResult.success) {
      return res.status(400).json({ errors: parseResult.error.errors });
    }

    await supplierService.createSupplier(req, res, next);
  } catch (error) {
    handleError(res, error);
  }
}

/*
 * @desc   Update supplier
 * @route  PUT /api/supplier/update/:id
 * @access Private
 */
async function updateSupplier(req: Request, res: Response, next: NextFunction) {
  try {
    const idParseResult = idParamSchema.safeParse(req.params);
    const bodyParseResult = updateSupplierSchema.safeParse(req.body);

    if (!idParseResult.success || !bodyParseResult.success) {
      return res.status(400).json({
        errors: [
          ...(idParseResult.success ? [] : idParseResult.error.errors),
          ...(bodyParseResult.success ? [] : bodyParseResult.error.errors),
        ],
      });
    }

    await supplierService.updateSupplier(req, res, next);
  } catch (error) {
    handleError(res, error);
  }
}

/*
 * @desc   Delete supplier
 * @route  DELETE /api/supplier/delete/:id
 * @access Private
 */
async function deleteSupplier(req: Request, res: Response, next: NextFunction) {
  try {
    const parseResult = idParamSchema.safeParse(req.params);

    if (!parseResult.success) {
      return res.status(400).json({ errors: parseResult.error.errors });
    }

    await supplierService.deleteSupplier(req, res, next);
  } catch (error) {
    handleError(res, error);
  }
}

/*
 * @desc   Search suppliers
 * @route  GET /api/supplier/search
 * @access Public
 */
async function searchSupplier(req: Request, res: Response, next: NextFunction) {
  try {
    await supplierService.searchSuppliers(req, res, next);
  } catch (error) {
    handleError(res, error);
  }
}

/*
 * @desc   Search and update suppliers
 * @route  PATCH /api/supplier/search/update
 * @access Private
 */
async function searchAndUpdate(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const parseResult = searchAndUpdateSchema.safeParse(req.body);

    if (!parseResult.success) {
      return res.status(400).json({ errors: parseResult.error.errors });
    }

    await supplierService.searchAndUpdate(req, res, next);
  } catch (error) {
    handleError(res, error);
  }
}

export default router;
