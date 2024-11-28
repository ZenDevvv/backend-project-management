import mongoose, { PipelineStage } from "mongoose";
import ProjectModel from "../models/projectModel";
import projectRepository from "../repository/projectRepository";

interface MonthlyBreakdown {
  month: string;
  monthIndex: number;
  year: number;
  budgetedAmount: number;
  actualSpent: number;
  estimatedExpenses: number;
}

async function generateMonthlyBreakdown(
  projectId: string
): Promise<MonthlyBreakdown[]> {
  const project = await projectRepository.getProjectbyId(projectId);

  if (!project) {
    throw new Error("Project not found.");
  }

  const pipeline: PipelineStage[] = [
    {
      $match: { _id: new mongoose.Types.ObjectId(projectId) },
    },
    {
      $addFields: {
        allMonths: {
          $map: {
            input: { $range: [0, 12] },
            as: "m",
            in: {
              $dateFromParts: {
                year: { $year: "$estimatedStartDate" },
                month: { $add: ["$$m", 1] },
                day: 1,
              },
            },
          },
        },
      },
    },
    {
      $unwind: "$allMonths",
    },
    {
      $match: {
        $expr: {
          $and: [
            { $gte: ["$allMonths", "$estimatedStartDate"] },
            { $lte: ["$allMonths", "$estimatedEndDate"] },
          ],
        },
      },
    },
    {
      $addFields: {
        monthIndex: { $subtract: [{ $month: "$allMonths" }, 1] },
        year: { $year: "$allMonths" },
        totalMonths: {
          $add: [
            {
              $subtract: [
                {
                  $add: [
                    { $multiply: [{ $year: "$estimatedEndDate" }, 12] },
                    { $month: "$estimatedEndDate" },
                  ],
                },
                {
                  $add: [
                    { $multiply: [{ $year: "$estimatedStartDate" }, 12] },
                    { $month: "$estimatedStartDate" },
                  ],
                },
              ],
            },
            1,
          ],
        },
      },
    },
    {
      $addFields: {
        budgetedAmount: {
          $divide: ["$forecastedBudget", "$totalMonths"],
        },
        monthlyExpenses: {
          $filter: {
            input: {
              $map: {
                input: {
                  $concatArrays: ["$opexExpenditures", "$capexExpenditures"],
                },
                as: "expense",
                in: {
                  monthIdx: { $subtract: [{ $month: "$$expense.date" }, 1] },
                  year: { $year: "$$expense.date" },
                  actual: "$$expense.actualAmount",
                  estimated: "$$expense.estimatedAmount",
                },
              },
            },
            as: "expense",
            cond: {
              $and: [
                { $eq: ["$$expense.monthIdx", "$monthIndex"] },
                { $eq: ["$$expense.year", "$year"] },
              ],
            },
          },
        },
      },
    },
    {
      $addFields: {
        actualSpent: { $sum: "$monthlyExpenses.actual" },
        estimatedExpenses: { $sum: "$monthlyExpenses.estimated" },
      },
    },
    {
      $project: {
        _id: 0,
        month: {
          $arrayElemAt: [
            [
              "January",
              "February",
              "March",
              "April",
              "May",
              "June",
              "July",
              "August",
              "September",
              "October",
              "November",
              "December",
            ],
            "$monthIndex",
          ],
        },
        monthIndex: 1,
        year: 1,
        budgetedAmount: 1,
        actualSpent: 1,
        estimatedExpenses: 1,
      },
    },
    {
      $sort: { year: 1, monthIndex: 1 },
    },
  ];

  const monthlyBreakdown = await ProjectModel.aggregate(pipeline).exec();

  return monthlyBreakdown;
}

export { generateMonthlyBreakdown, MonthlyBreakdown };
