import mongoose from "mongoose";
import activityLoggingModel from "../models/activityLoggingModel";

const logActivity = async (
  userId: mongoose.Schema.Types.ObjectId,
  referenceId: mongoose.Schema.Types.ObjectId | null,
  action: string
): Promise<void> => {
  try {
    await activityLoggingModel.updateOne(
      { referenceId: referenceId || null },
      {
        $addToSet: {
          activities: {
            actor: userId,
            action,
            referenceId: referenceId || null,
            userId,
            createdAt: new Date(),
          },
        },
      },
      { upsert: true }
    );
  } catch (error) {
    console.error("Error logging activity: ", error);
  }
};

export default logActivity;
