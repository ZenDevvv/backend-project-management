// Desc: Main route of the application
import { Request, Response, Router } from "express";
import { API_ENDPOINTS } from "../config/endpointsConfig";
import { config } from "../config/config";
const router = Router();

router.get(API_ENDPOINTS.MAIN.DEFAULT, (_req: Request, res: Response) => {
  res.send({
    status: res.statusCode,
    message: config.MSG.WELCOME,
    timestamp: new Date().toISOString(),
  });
});

export default router;
