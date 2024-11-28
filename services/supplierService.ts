import { Request, Response, NextFunction } from "express";
import { ISupplier } from "../models/supplierModel";
import supplierRepository from "../repository/supplierRepository";
import { config } from "../config/config";
import { trimAll } from "../helper/trimHelper";
import mongoose, { FilterQuery, UpdateQuery } from "mongoose";

const supplierService = {
  getSupplier,
  getSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  searchSuppliers,
  searchAndUpdate,
};

export default supplierService;
async function getSupplier(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response> {
  try {
    const { id } = req.params;
    const { select, populate } = req.query;

    const parseSelect = (select: string): string[] => {
      return typeof select === "string"
        ? select.split(",").map((field) => field.trim())
        : [];
    };

    const parsePopulate = (populate: string): any[] => {
      if (!populate) return [];
      return populate.split(",").map((field) => {
        const [path, fields] = field.split(":");
        return {
          path,
          select: fields ? fields.split(",").join(" ") : undefined,
        };
      });
    };

    const params = {
      select: parseSelect(select as string),
      populateArray: parsePopulate(populate as string),
    };

    const supplier = await supplierRepository.getSupplier(id, params);

    if (!supplier) {
      return res.status(404).json({ message: config.ERROR.SUPPLIER.NOT_FOUND });
    }

    return res.status(200).json(supplier);
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

async function getSuppliers(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response> {
  const {
    query = {},
    limit = 10,
    page = 1,
    select,
    sort,
    populate,
  } = req.query;

  // Helper function to parse sort parameter
  const parseSort = (sort: string): Record<string, 1 | -1> => {
    const [field, order] = sort.split(":");
    return { [field]: order === "asc" ? 1 : -1 };
  };

  // Helper function to parse populate parameter
  const parsePopulate = (populate: string): any[] => {
    if (!populate) return [];
    return populate.split(",").map((field) => {
      const [path, fields] = field.split(":");
      return { path, select: fields ? fields.split(",").join(" ") : undefined };
    });
  };

  // Helper function to parse select parameter
  const parseSelect = (select: string): string[] => {
    return typeof select === "string" ? select.split(",") : [];
  };

  // Calculate skip for pagination (page starts from 1)
  const skip =
    (parseInt(page as string, 10) - 1) * parseInt(limit as string, 10);

  // Prepare params for repository call
  const params = {
    query,
    limit: parseInt(limit as string, 10) || 10,
    page: parseInt(page as string, 10) || 1, // Ensuring the page is a valid integer
    skip,
    select: parseSelect(select as string),
    sort: typeof sort === "string" ? parseSort(sort) : {},
    populateArray: parsePopulate(populate as string),
  };

  try {
    // Call the repository to fetch the suppliers with pagination
    const suppliers = await supplierRepository.getSuppliers(params);
    return res.status(200).json(suppliers);
  } catch (error) {
    console.error(`Error fetching suppliers: ${error}`);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

async function createSupplier(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response> {
  const trimmedBody = trimAll(req.body);
  try {
    const supplier = await supplierRepository.createSupplier(trimmedBody);
    return res
      .status(201)
      .json({ message: config.SUCCESS.SUPPLIER.CREATE, supplier });
  } catch (error) {
    return handleError(res, error);
  }
}

async function updateSupplier(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response> {
  const trimmedBody = trimAll(req.body);
  const { id } = req.params;

  try {
    const updatedSupplier = await supplierRepository.updateSupplier(
      id,
      trimmedBody
    );
    if (!updatedSupplier) {
      return res.status(404).json({ message: config.ERROR.SUPPLIER.NOT_FOUND });
    }
    return res.status(200).json({
      message: config.SUCCESS.SUPPLIER.UPDATE,
      supplier: updatedSupplier,
    });
  } catch (error) {
    return handleError(res, error);
  }
}

async function deleteSupplier(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response> {
  try {
    const deletedSupplier = await supplierRepository.deleteSupplier(
      req.params.id
    );
    if (!deletedSupplier) {
      return res.status(404).json({ message: config.ERROR.SUPPLIER.NOT_FOUND });
    }
    return res.status(200).json({
      message: config.SUCCESS.SUPPLIER.DELETE,
      supplier: deletedSupplier,
    });
  } catch (error) {
    return handleError(res, error);
  }
}

async function searchSuppliers(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response> {
  const query = (req.query.search as string) || "";
  try {
    const suppliers = await supplierRepository.searchSupplier(query);
    return res.status(200).json(suppliers);
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
    const query: FilterQuery<ISupplier> = req.body.query;
    const update: UpdateQuery<ISupplier> = req.body.update;
    const multi: boolean = req.body.multi || false;

    const result = await supplierRepository.searchAndUpdate(query, update, {
      multi,
    });

    if (multi) {
      res.status(200).json(result);
    } else {
      if (result) {
        res.status(200).json(result);
      } else {
        res.status(404).json({ message: "Supplier not found" });
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
