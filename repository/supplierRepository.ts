import { FilterQuery, UpdateQuery } from "mongoose";
import Supplier, { ISupplier } from "../models/supplierModel";
import { DbParams } from "../helper/Dbparams";

const supplierRepository = {
  getSupplier,
  getSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  searchSupplier,
  searchAndUpdate,
};

export default supplierRepository;

async function getSupplier(
  id: string,
  dbParams: DbParams = {}
): Promise<ISupplier | null> {
  try {
    let query = Supplier.findById(id);

    (dbParams.populateArray || []).forEach((populateOption) => {
      query = query.populate(populateOption);
    });

    query = query.select(dbParams.select || "_id");
    dbParams.lean !== undefined ? dbParams.lean : true;

    return await query.exec();
  } catch (error) {
    console.error(`Error getting supplier: ${error}`);
    return null;
  }
}

async function getSuppliers(dbParams: DbParams): Promise<{
  suppliers: ISupplier[];
  totalResults: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  hasMore: boolean;
}> {
  try {
    const {
      query = {},
      populateArray = [],
      select = "email",
      sort = {},
      limit = 10,
      page = 1,
    } = dbParams;
    let queryBuilder = Supplier.find(query);
    populateArray.forEach(
      (option) => (queryBuilder = queryBuilder.populate(option))
    );
    const selectedFields = Array.isArray(select) ? select.join(" ") : select;
    const skip = (page - 1) * limit;
    queryBuilder = queryBuilder
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .select(selectedFields);
    const suppliers = await queryBuilder.exec();

    const totalResults = await Supplier.countDocuments(query);
    const totalPages = Math.ceil(totalResults / limit);
    const hasMore = page < totalPages;

    return {
      suppliers,
      totalResults,
      totalPages,
      currentPage: page,
      pageSize: limit,
      hasMore,
    };
  } catch (error) {
    console.error(`Error getting suppliers: ${error}`);
    return {
      suppliers: [],
      totalResults: 0,
      totalPages: 0,
      currentPage: 1,
      pageSize: dbParams.limit || 10,
      hasMore: false,
    };
  }
}

async function createSupplier(
  data: Partial<ISupplier>
): Promise<ISupplier | null> {
  try {
    const supplier = await Supplier.create(data);
    return supplier as ISupplier | null;
  } catch (error) {
    console.error(`Error creating supplier: ${error}`);
    return null;
  }
}

async function updateSupplier(
  id: string,
  data: Partial<ISupplier>
): Promise<ISupplier | null> {
  try {
    return await Supplier.findByIdAndUpdate(id, data, { new: true });
  } catch (error) {
    console.error(`Error updating supplier: ${error}`);
    return null;
  }
}

async function deleteSupplier(id: string): Promise<ISupplier | null> {
  try {
    return await Supplier.findByIdAndDelete(id);
  } catch (error) {
    console.error(`Error deleting supplier: ${error}`);
    return null;
  }
}

async function searchSupplier(query: string): Promise<ISupplier[]> {
  try {
    return await Supplier.find(
      {
        $text: { $search: query },
      },
      {
        score: { $meta: "textScore" },
      }
    )
      .sort({ score: { $meta: "textScore" } })
      .limit(20);
  } catch (error) {
    console.error(`Error searching suppliers: ${error}`);
    return [];
  }
}

async function searchAndUpdate(
  query: FilterQuery<ISupplier>,
  update?: UpdateQuery<ISupplier>,
  options?: { multi?: boolean }
): Promise<ISupplier | null | { modifiedCount: number }> {
  try {
    if (update) {
      if (options?.multi) {
        const result = await Supplier.updateMany(query, update);
        return { modifiedCount: result.modifiedCount };
      } else {
        return await Supplier.findOneAndUpdate(query, update, { new: true });
      }
    } else {
      return await Supplier.findOne(query);
    }
  } catch (error) {
    console.error(`Error in searchAndUpdate: ${error}`);
    return null;
  }
}
