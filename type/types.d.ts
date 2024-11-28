// Objective: Create a custom interface that extends the Request interface from Express to include the user property.

import { Request } from "express";
import { IActivityLogging } from "../models/activityLoggingModel";
import { UserModel } from "../models/userModel";

export interface CustomRequest extends Request {
  user?: UserModel | IActivityLogging;
  token?: string;
}
