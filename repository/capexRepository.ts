import mongoose, { FilterQuery, UpdateQuery, Document, Types } from "mongoose";
import CapexModel, { capex } from "../models/capexModel";
import { applyDbParams } from "../helper/applyDbParams";
import { DbParams } from "../helper/Dbparams";
import projectRepository from "./projectRepository";
import { ProjectModel } from "../models/projectModel";

const capexRepository = {
  getCapex,
  getCapexes,
  createCapex,
  updateCapex,
  deleteCapex,
  searchCapex,
  searchAndUpdateCapex,
};

export default capexRepository;

async function getCapex(
  id: string,
  dbParams: DbParams = {}
): Promise<capex | null> {
  try {
    const query = applyDbParams(CapexModel.findById(id), dbParams);
    return await query.exec();
  } catch (error) {
    console.error(`Error getting capex with ID ${id}: ${error}`);
    return null;
  }
}

async function getCapexes(dbParams: DbParams = {}): Promise<capex[]> {
  try {
    const query = applyDbParams(
      CapexModel.find(dbParams.query || {}),
      dbParams
    );
    return await query.exec();
  } catch (error) {
    console.error(`Error getting capexes: ${error}`);
    return [];
  }
}

async function createCapex(data: Partial<capex>): Promise<capex | null> {
  try {
    const capex = await new CapexModel(data).save();
    const projectId = capex.projectId?.toString();

    if (!projectId) return capex;

    const project = await projectRepository.getProjectbyId(projectId);
    if (!project) return capex;

    const updatedCapexExpenditures = [
      ...project.capexExpenditures,
      capex._id as Types.ObjectId,
    ];

    await projectRepository.updateProject(projectId, {
      capexExpenditures: updatedCapexExpenditures,
    });

    return capex;
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
}

async function updateCapex(
  id: string,
  data: Partial<capex>
): Promise<capex | null> {
  try {
    const response = await CapexModel.findByIdAndUpdate(id, data, {
      new: true,
    });

    return response;
  } catch (error) {
    console.error(`Error updating capex with ID ${id}: ${error}`);
    return null;
  }
}

async function deleteCapex(id: string): Promise<capex | null> {
  try {
    const deletedCapex = await CapexModel.findByIdAndDelete(id);
    if (!deletedCapex) return null;

    const projectId = deletedCapex.projectId?.toString();
    if (!projectId) return deletedCapex;

    const updateData: UpdateQuery<ProjectModel> = {
      $pull: { capexExpenditures: id },
    };
    await projectRepository.updateProject(projectId, updateData);

    return deletedCapex;
  } catch (error) {
    console.error(`Error deleting capex with ID ${id}: ${error}`);
    return null;
  }
}

export async function searchCapex(
  query: string,
  dbParams: DbParams & { page: number; pageSize: number }
) {
  const { select, populateArray, page, pageSize } = dbParams;

  const skip = (page - 1) * pageSize;

  const searchCriteria = mongoose.Types.ObjectId.isValid(query)
    ? {
        $or: [
          { supplierId: new mongoose.Types.ObjectId(query) },
          { projectId: new mongoose.Types.ObjectId(query) },
        ],
      }
    : { $text: { $search: query } };

  try {
    const results = await CapexModel.find(searchCriteria)
      .sort(searchCriteria.$text ? { score: { $meta: "textScore" } } : {})
      .select(Array.isArray(select) ? select.join(" ") : select || "")
      .populate(populateArray || [])
      .skip(skip)
      .limit(pageSize);

    const totalResults = await CapexModel.countDocuments(searchCriteria);
    const totalPages = Math.ceil(totalResults / pageSize);
    const hasMore = page < totalPages;

    return {
      data: results,
      pagination: {
        totalResults,
        totalPages,
        currentPage: page,
        pageSize,
        hasMore,
      },
    };
  } catch (error) {
    console.error("Error in CapexRepository.searchCapex:", error);
    throw new Error("Failed to execute search query.");
  }
}

async function searchAndUpdateCapex(
  query: FilterQuery<capex>,
  update?: UpdateQuery<capex>,
  options?: { multi?: boolean }
): Promise<capex | null | { modifiedCount: number }> {
  try {
    if (update) {
      if (options?.multi) {
        const result = await CapexModel.updateMany(query, update);
        return { modifiedCount: result.modifiedCount };
      } else {
        return await CapexModel.findOneAndUpdate(query, update, { new: true });
      }
    }
    return await CapexModel.findOne(query);
  } catch (error) {
    console.error(`Error searching and updating capex: ${error}`);
    return null;
  }
}
