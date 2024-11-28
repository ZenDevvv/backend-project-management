import { z } from "zod";
import { config } from "../../config/config";

export const userIdSchema = z.object({
  id: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, config.VALIDATION_MESSAGES.USER.ID_FORMAT),
});

export const createUserSchema = z.object({
  email: z
    .string()
    .email()
    .nonempty(config.VALIDATION_MESSAGES.USER.EMAIL_REQUIRED),
  password: z
    .string()
    .min(8, config.VALIDATION_MESSAGES.USER.PASSWORD_MIN_LENGTH)
    .nonempty(config.VALIDATION_MESSAGES.USER.PASSWORD_REQUIRED),
  username: z
    .string()
    .nonempty(config.VALIDATION_MESSAGES.USER.USERNAME_REQUIRED),
  firstname: z
    .string()
    .nonempty(config.VALIDATION_MESSAGES.USER.FIRSTNAME_REQUIRED),
  lastname: z
    .string()
    .nonempty(config.VALIDATION_MESSAGES.USER.LASTNAME_REQUIRED),
});

export const loginUserSchema = z.object({
  email: z
    .string()
    .email()
    .nonempty(config.VALIDATION_MESSAGES.USER.EMAIL_REQUIRED),
  // password: z
  //   .string()
  //   .min(8, config.VALIDATION_MESSAGES.USER.PASSWORD_MIN_LENGTH)
  //   .nonempty(config.VALIDATION_MESSAGES.USER.PASSWORD_REQUIRED),
});

export const updateUserSchema = z.object({
  _id: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, config.VALIDATION_MESSAGES.USER.ID_FORMAT),
  email: z.string().email().optional(),
});
