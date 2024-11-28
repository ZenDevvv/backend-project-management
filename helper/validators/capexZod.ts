import { z } from "zod";
import { config } from "../../config/config";

export const createCapexSchema = z.object({
  type: z.string().nonempty(config.VALIDATION_MESSAGES.CAPEX.NAME_REQUIRED),
  description: z
    .string()
    .or(z.literal(""))
    .transform((value) => (value === "" ? undefined : value))
    .refine((value) => value === undefined || value.length > 0, {
      message: config.VALIDATION_MESSAGES.CAPEX.DESCRIPTION_REQUIRED,
    }),
  date: z.string().nonempty(config.VALIDATION_MESSAGES.CAPEX.DATE_REQUIRED),
  estimatedAmount: z.number().positive(config.VALIDATION_MESSAGES.CAPEX.ESTIMATED_AMOUNT_REQUIRED), 
  actualAmount: z.number().positive(config.VALIDATION_MESSAGES.CAPEX.ACTUAL_AMOUNT_REQUIRED), 
});

export const updateCapexSchema = createCapexSchema.partial();

export const idParamSchema = z.object({
  id: z.string().length(24, config.VALIDATION_MESSAGES.CAPEX.INVALID_ID_FORMAT),
});

export const searchAndUpdateSchema = z.object({
  query: z.string().nonempty(config.VALIDATION_MESSAGES.CAPEX.QUERY_REQUIRED),
  update: z.object({}).refine((obj) => Object.keys(obj).length > 0, {
    message: config.VALIDATION_MESSAGES.CAPEX.UPDATE_NOT_EMPTY,
  }),
  options: z
    .object({
      select: z.string().optional(),
      populate: z.string().optional(),
    })
    .optional(),
});
