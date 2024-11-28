import { CallbackFunction } from "../helper/types";

// This function is used to check the origin of the request. If the origin of the request starts with the specified string, the callback will be called with null and true. Otherwise, the callback will be called with an error.
const wildCardOrigin = (
  origin: string | undefined,
  callback: CallbackFunction,
  startsWith: string
): void => {
  if (origin && origin.startsWith(startsWith)) {
    callback(null, true);
  } else {
    callback(new Error("Not allowed by CORS"));
  }
};

export default wildCardOrigin;
