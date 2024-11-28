import { Response, NextFunction } from "express";
import { CustomRequest } from "./../type/types";

const restrictToTypes = (allowedTypes: string[]) => {
  return (req: CustomRequest, res: Response, next: NextFunction) => {

    if (!req.user || typeof (req.user as any).type !== "string") {
      return res
        .status(403)
        .json({ message: "No type assigned or unauthorized" });
    }

    const user = req.user as { type: string };

    if (!allowedTypes.includes(user.type)) {
      return res.status(403).json({ message: "Access denied" });
    }

    next();
  };
};

export default restrictToTypes;
