import cron from "node-cron";
import userService from "../services/userService";
import { config } from "../config/config";

// Schedule a cron job to run at midnight on the first day of every month
const cleanUpInactiveUsersJob = cron.schedule(
  config.CRON.CLEAN_UP.INACTIVE_USERS.TIME,
  async () => {
    try {
      console.log(config.CRON.CLEAN_UP.INACTIVE_USERS.MESSAGE);
      await userService.cleanUpInactiveUsers();
    } catch (error) {
      console.error(error);
    }
  }
);

// Function to run the job immediately for testing
export const runCleanUpInactiveUsersJobImmediately = async () => {
  console.log("Running clean up inactive users job immediately for testing");
  try {
    console.log(config.CRON.CLEAN_UP.INACTIVE_USERS.MESSAGE);
    await userService.cleanUpInactiveUsers();
  } catch (error) {
    console.error(error);
  }
};

export default cleanUpInactiveUsersJob;
