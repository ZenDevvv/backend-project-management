// Usage: import { trimAll } from 'helper/trimHelper';
// Purpose: Trim all string values in object.
function trimAll(obj: { [key: string]: any }): { [key: string]: any } {
  const trimmedObj: { [key: string]: any } = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      trimmedObj[key] = typeof obj[key] === "string" ? obj[key].trim() : obj[key];
    }
  }
  return trimmedObj;
}

export { trimAll };
