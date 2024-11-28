import capexRepository from "../repository/capexRepository";
import { capex } from "../models/capexModel";
import { DbParams } from "../helper/Dbparams";

class CapexService {
  async getCapex(id: string, dbParams: DbParams = {}): Promise<capex | null> {
    return await capexRepository.getCapex(id, dbParams);
  }
  async getCapexes(dbParams: DbParams = {}): Promise<capex[]> {
    return await capexRepository.getCapexes(dbParams);
  }

  async createCapex(data: Partial<capex>): Promise<capex | null> {
    return await capexRepository.createCapex(data);
  }
  async updateCapex(id: string, data: Partial<capex>): Promise<capex | null> {
    return await capexRepository.updateCapex(id, data);
  }

  async deleteCapex(id: string): Promise<capex | null> {
    return await capexRepository.deleteCapex(id);
  }

  async searchCapex(
    query: string,
    {
      page = 1,
      pageSize = 10,
      ...dbParams
    }: DbParams & { page?: number; pageSize?: number }
  ): Promise<{
    data: capex[];
    pagination: {
      totalResults: number;
      totalPages: number;
      currentPage: number;
      pageSize: number;
      hasMore: boolean;
    };
  }> {
    try {
      const result = await capexRepository.searchCapex(query, {
        ...dbParams,
        page,
        pageSize,
      });

      const totalResults = result.pagination?.totalResults || 0;
      const totalPages = Math.ceil(totalResults / pageSize);
      const hasMore = page < totalPages;

      return {
        data: result.data,
        pagination: {
          totalResults,
          totalPages,
          currentPage: page,
          pageSize,
          hasMore,
        },
      };
    } catch (error) {
      console.error("Error in CapexService.searchCapex:", error);
      throw new Error("Failed to fetch capex data.");
    }
  }

  async searchAndUpdateCapex(
    query: object,
    update?: object,
    options?: { multi?: boolean }
  ): Promise<capex | null | { modifiedCount: number }> {
    return await capexRepository.searchAndUpdateCapex(query, update, options);
  }
}

export default new CapexService();
