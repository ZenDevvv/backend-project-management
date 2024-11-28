import { z } from "zod";
import { config } from "../../config/config";

export const projectIdSchema = z.object({
  id: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, config.VALIDATION_MESSAGES.PROJECT.ID_FORMAT),
});

const memberSchema = z.object({
  userId: z
    .string()
    .nonempty(config.VALIDATION_MESSAGES.PROJECT.USER_ID_REQUIRED),
  role: z.string().nonempty(config.VALIDATION_MESSAGES.PROJECT.ROLE_REQUIRED),
});

const projectStatusSchema = z.object({
  status: z
    .string()
    .nonempty(config.VALIDATION_MESSAGES.PROJECT.STATUS_REQUIRED),
  date: z
    .string()
    .nonempty(config.VALIDATION_MESSAGES.PROJECT.STATUS_DATE_REQUIRED),
});

export const createProjectSchema = z.object({
  name: z.string().nonempty(config.VALIDATION_MESSAGES.PROJECT.NAME_REQUIRED),
  description: z
    .string()
    .nonempty(config.VALIDATION_MESSAGES.PROJECT.DESCRIPTION_REQUIRED),
  estimatedStartDate: z
    .string()
    .nonempty(config.VALIDATION_MESSAGES.PROJECT.ESTIMATED_START_REQUIRED),
  estimatedEndDate: z
    .string()
    .nonempty(config.VALIDATION_MESSAGES.PROJECT.ESTIMATED_END_REQUIRED),

  projectStatus: z.array(projectStatusSchema).optional(),

  forecastedBudget: z
    .number()
    .positive(config.VALIDATION_MESSAGES.PROJECT.FORECASTED_BUDGET_POSITIVE),
  members: z.array(memberSchema).optional(),
});

export const searchAndUpdateSchema = z.object({
  query: z
    .object({
      name: z.string().optional(),
    })
    .refine((val) => Object.keys(val).length > 0, {
      message: config.VALIDATION_MESSAGES.PROJECT.QUERY_FIELD_REQUIRED,
    }),

  update: z
    .object({
      description: z.string().optional(),
    })
    .refine((val) => Object.keys(val).length > 0, {
      message: config.VALIDATION_MESSAGES.PROJECT.UPDATE_FIELD_REQUIRED,
    }),
});
