import { z } from "zod";
import { config } from "../../config/config";

export const createSupplierSchema = z.object({
  name: z.string().nonempty(config.VALIDATION_MESSAGES.SUPPLIER.NAME_REQUIRED),
  address: z
    .string()
    .nonempty(config.VALIDATION_MESSAGES.SUPPLIER.ADDRESS_REQUIRED),
});

export const updateSupplierSchema = createSupplierSchema.partial();

export const idParamSchema = z.object({
  id: z.string().length(24, config.VALIDATION_MESSAGES.SUPPLIER.INVALID_ID),
});

export const searchAndUpdateSchema = z.object({
  query: z
    .string()
    .nonempty(config.VALIDATION_MESSAGES.SUPPLIER.QUERY_REQUIRED),
  update: z.object({}).refine((obj) => Object.keys(obj).length > 0, {
    message: config.VALIDATION_MESSAGES.SUPPLIER.UPDATE_NOT_EMPTY,
  }),
});
