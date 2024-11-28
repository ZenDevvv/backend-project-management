import { FilterQuery, UpdateQuery } from "mongoose";
import Project, { ProjectModel } from "../models/projectModel";
import { generateMonthlyBreakdown } from "../helper/projectServiceBreakdown";
import CapexModel from "../models/capexModel";
export interface DbParams {
  query?: FilterQuery<ProjectModel>;
  select?: string | string[];
  limit?: number;
  populateArray?: string[];
  lean?: boolean;
  sort?: Record<string, any>;
}

const projectRepository = {
  getProject,
  getProjects,
  createProject,
  updateProject,
  deleteProject,
  searchProjects,
  searchAndUpdate,
  getProjectDashboard,
  getProjectsByUserId,
  getProjectbyId,
};

export default projectRepository;

async function getProjectsByUserId(
  userId: string,
  dbParams: DbParams & { page: number; pageSize: number }
): Promise<{
  data: ProjectModel[];
  pagination: {
    totalResults: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
    hasMore: boolean;
  };
}> {
  const { populateArray, sort, page, pageSize, select } = dbParams;

  const skip = (page - 1) * pageSize;

  try {
    const projects = await Project.find({ "members.userId": userId })
      .populate(populateArray || [])
      .sort(sort || {})
      .skip(skip)
      .limit(pageSize)
      .select(typeof select === "string" ? select : select?.join(" ") || "")
      .lean()
      .exec();
    const totalResults = await Project.countDocuments({
      "members.userId": userId,
    });
    const totalPages = Math.ceil(totalResults / pageSize);
    const hasMore = page < totalPages;

    return {
      data: projects as ProjectModel[],
      pagination: {
        totalResults,
        totalPages,
        currentPage: page,
        pageSize,
        hasMore,
      },
    };
  } catch (error) {
    console.error(
      `Error getting projects by userId: ${
        error instanceof Error ? error.message : error
      }`
    );
    return {
      data: [],
      pagination: {
        totalResults: 0,
        totalPages: 0,
        currentPage: page,
        pageSize,
        hasMore: false,
      },
    };
  }
}

async function getProjectDashboard(name: string): Promise<any | null> {
  try {
    const project = await Project.findOne({ name }).populate(
      "capexExpenditures"
    );
    if (!project) return null;
    const opexExpenditures = project.opexExpenditures || [];
    const capexExpenditures = project.capexExpenditures || [];
    const totalOpex = opexExpenditures.reduce(
      (total, expenditure) => total + (expenditure as any).actualAmount,
      0
    );
    const totalCapex = capexExpenditures.reduce(
      (total, expenditure) => total + (expenditure as any).actualAmount,
      0
    );
    const totalExpenditure = totalOpex + totalCapex;
    const opexVsCapex =
      totalExpenditure === 0 ? 0 : totalOpex / totalExpenditure;
    const monthlyBreakdown = await generateMonthlyBreakdown(
      project._id.toString()
    );

    const result = {
      budgetExpenditure: [project.totalBudget, project.forecastedBudget],
      expenditureBreakdown: [totalOpex, totalCapex],
      opexVsCapex,
      monthly: monthlyBreakdown,
    };

    return result;
  } catch (error) {
    console.error("Error in getProjectDashboard:", error);
    return null;
  }
}

async function getProjectbyId(projectId: string) {
  try {
    const project = await Project.findById(projectId)
      .select(
        "estimatedStartDate estimatedEndDate forecastedBudget opexExpenditures capexExpenditures"
      )
      .exec();

    // Check if project was found
    if (!project) {
      throw new Error("Project not found");
    }

    return project;
  } catch (error) {
    console.error("Error fetching project:", error);
    throw new Error("Unable to fetch project");
  }
}

async function getProject(
  name: string,
  dbParams: DbParams
): Promise<ProjectModel | null> {
  if (!name) throw new Error("Project ID is required");

  try {
    const project = await Project.findOne({ name })
      .populate(dbParams.populateArray || []) // Populate the fields as specified in dbParams
      .select(
        typeof dbParams.select === "string"
          ? dbParams.select
          : dbParams.select?.join(" ") || ""
      )
      .lean()
      .exec();

    if (project && (dbParams.select?.includes("monthlyBreakdown") || false)) {
      project.monthlyBreakdown = await generateMonthlyBreakdown(
        project._id.toString()
      );
    }

    return project as ProjectModel;
  } catch (error) {
    console.error(
      `Error getting project: ${error instanceof Error ? error.message : error}`
    );
    return null;
  }
}

async function getProjects(dbParams: DbParams): Promise<ProjectModel[]> {
  try {
    const projects = await Project.find(dbParams.query || {})
      .populate(dbParams.populateArray || []) // Populate fields as requested
      .sort(dbParams.sort || {})
      .limit(dbParams.limit ?? 10)
      .select(
        typeof dbParams.select === "string"
          ? dbParams.select
          : dbParams.select?.join(" ") || ""
      )
      .lean()
      .exec();

    return projects as ProjectModel[];
  } catch (error) {
    console.error(
      `Error getting projects: ${
        error instanceof Error ? error.message : error
      }`
    );
    return [];
  }
}

async function createProject(
  data: Partial<ProjectModel>
): Promise<ProjectModel | null> {
  try {
    const existingProject = await Project.findOne({ name: data.name });
    if (existingProject) {
      throw new Error(`Project with name '${data.name}' already exists.`);
    }
    return await Project.create(data);
  } catch (error) {
    throw error;
  }
}

async function updateProject(
  id: string,
  data: Partial<ProjectModel>
): Promise<ProjectModel | null> {
  try {
    return await Project.findByIdAndUpdate(id, data, { new: true });
  } catch (error) {
    console.error(`Error updating project: ${error}`);
    return null;
  }
}

async function deleteProject(id: string): Promise<ProjectModel | null> {
  try {
    return await Project.findByIdAndDelete(id);
  } catch (error) {
    console.error(`Error deleting project: ${error}`);
    return null;
  }
}

async function searchProjects(query: string): Promise<ProjectModel[]> {
  try {
    // Use lean() to get plain JavaScript objects instead of Mongoose documents
    const projects = await Project.find({ $text: { $search: query } })
      .sort({ score: { $meta: "textScore" } })
      .limit(20)
      .lean()
      .exec();

    return await Promise.all(
      projects.map(async (project) => {
        const monthlyBreakdown = await generateMonthlyBreakdown(
          project._id.toString()
        );
        return {
          ...project,
          monthlyBreakdown,
        } as ProjectModel;
      })
    );
  } catch (error) {
    console.error(`Error searching projects: ${error}`);
    return [];
  }
}

async function searchAndUpdate(
  query: FilterQuery<ProjectModel>,
  update?: UpdateQuery<ProjectModel>,
  options?: { multi?: boolean }
): Promise<ProjectModel | null | { modifiedCount: number }> {
  try {
    if (!update) return null;

    return options?.multi
      ? await Project.updateMany(query, update)
      : await Project.findOneAndUpdate(query, update, { new: true });
  } catch (error) {
    console.error(`Error searching and updating projects: ${error}`);
    return null;
  }
}
