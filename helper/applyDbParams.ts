import { FilterQuery } from "mongoose";
import { DbParams } from "./Dbparams";

export function applyDbParams(query: any, dbParams: DbParams) {
  const { select, populateArray, sort, limit, lean } = dbParams;

  if (populateArray) {
    populateArray.forEach((field) => {
      const [fieldName, fieldSelect] = field.split(":"); 
      query = query.populate(fieldName, fieldSelect ? fieldSelect : "");
    });
  }

  query = query
    .select(select || "_id")
    .sort(sort || {})
    .limit(limit || 10)
    .lean(lean !== undefined ? lean : true);

  return query;
}
