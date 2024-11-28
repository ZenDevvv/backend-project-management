import wildCardOrigin from "../helper/checkOrigin";
import { CallbackFunction } from "../helper/types";

// Purpose: Configuration file for the project.
// Note: This is a sample configuration file. Modify this file to fit your project's needs.

// Configuration object
export const config = {
  // PORT
  PORT: 5000,

  // Bcrypt configuration
  BCRYPT: {
    SALT_ROUNDS: 10,
  },

  // Welcome Message
  MSG: {
    WELCOME:
      "You're successfully connected to UNLAD TEMPLATE API (TypeScript).",
  },

  // Success messages
  SUCCESS: {
    SERVER: "Server is running on port:",
    DATABASE: "Database connected:",
    USER: {
      REGISTER: "User registered successfully",
      LOGIN: "Login successful",
      UPDATE: "Update successful",
      DELETE: "Delete successful",
      LOGOUT: "Logout successful, token cleared.",
    },
    PROJECT: {
      CREATE: "Project created successfully",
      UPDATE: "Project updated successfully",
      DELETE: "Project deleted successfully",
      SEARCH: "Project search successful",
    },
    SUPPLIER: {
      CREATE: "Supplier created successfully",
      UPDATE: "Supplier updated successfully",
      DELETE: "Supplier deleted successfully",
      SEARCH: "Supplier search successful",
    },
  },

  // Status codes and messages
  STATUS: {
    VALIDATION_ERROR: {
      CODE: 400,
      TITLE: "Validation error",
    },
    UNAUTHORIZED: {
      CODE: 401,
      TITLE: "Unauthorized",
    },
    FORBIDDEN: {
      CODE: 403,
      TITLE: "Forbidden",
    },
    NOT_FOUND: {
      CODE: 404,
      TITLE: "Not found",
    },
    SERVER_ERROR: {
      CODE: 500,
      TITLE: "Server error",
    },
    DEFAULT_ERROR: {
      TITLE: "Unexpected error",
      CODE: 500,
      UNEXPECTED: "An unexpected error occurred. Please try again later.",
    },
  },

  // CORS configuration
  CORS: {
    METHODS: ["GET", "POST", "PUT", "DELETE"],
    LOCAL: function (origin: string, callback: CallbackFunction) {
      wildCardOrigin(origin, callback, "http://localhost:5173");
    },
    DEV_SITE: function (origin: string, callback: CallbackFunction) {
      wildCardOrigin(
        origin,
        callback,
        "https://project-management-app-delta-three.vercel.app"
      );
    },
    TEST_SITE: function (origin: string, callback: CallbackFunction) {
      wildCardOrigin(origin, callback, "https://example-test-dev");
    },
  },

  DB: {
    // Change this to your MongoDB URI
    URI: "mongodb+srv://zero:%40Qwerty123@projectmanagement.wu59a.mongodb.net/?retryWrites=true&w=majority&appName=ProjectManagement",
    COLLECTION: "sessions",
  },

  JWTCONFIG: {
    // Change this to your JWT secret
    SECRET: "s@mple",
    BEARER_REGEX: /^Bearer\s+(\S+)$/,
    ADMIN_EXPIRESIN: "1d",
    EXPIRESIN: "1h",
    CLEAR_COOKIE: "jwt",
    NODE_ENV: "production",
  },

  // Error messages
  ERROR: {
    MONGODB_NOT_DEFINE:
      "MONGODB_URI is not defined in the environment variables.",
    CONNECTION_FAILED: "Database connection failed:",
    UNEXPECTED: "An unexpected error occurred. Please try again later.",
    RATELIMIT:
      "Too many requests from this IP, please try again after 15 minutes",
    NO_DEACTIVE_USERS: "No users to deactivate",
    NO_ARCHIVE_USERS: "No users to archive",
    CORS: "Not allowed by cors",

    // User error messages
    USER: {
      NOT_AUTHORIZED: "User is not authorized",
      NOT_FOUND: "User not found",
      INVALID_CREDENTIALS: "Invalid credentials",
      INVALID_TOKEN: "Invalid token.",
      EMAIL_ALREADY_EXISTS: "Email already exists",
      NO_ACCOUNT: "No account found with this email. Please register.",
      INVALID_EMAIL: "Invalid email format",
      REQUIRED_FIELDS: "Both email and password are required.",
      ALREADY_EXIST: "User already exists",
      UPDATE_FAILED: "An error occurred during the update.",
      INVALID_ID: "Invalid user ID",
      DEACTIVATED: "User is deactivated because of inactivity",
      NO_ID: "No user ID provided",
    },

    // Project error messages
    PROJECT: {
      NOT_FOUND: "Project not found",
      ALREADY_EXISTS: "Project already exists",
      INVALID_ID: "Invalid project ID",
      REMOVE_FAILED: "Error removing project",
      UPDATE_FAILED: "Error updating project",
      REQUIRED_FIELDS: "Some required fields are missing",
    },

    // Supplier error messages
    SUPPLIER: {
      NOT_FOUND: "Supplier not found",
      ALREADY_EXISTS: "Supplier already exists",
      INVALID_ID: "Invalid supplier ID",
      REMOVE_FAILED: "Error removing supplier",
      UPDATE_FAILED: "Error updating supplier",
      REQUIRED_FIELDS: "Some required fields are missing",
      INVALID_EMAIL: "Invalid email",
    },
  },

  // User roles
  METHOD: {
    GET: "GET",
    POST: "POST",
    PUT: "PUT",
    DELETE: "DELETE",
  },

  // Validation Constants
  VALIDATION: {
    USER: {
      EMAIL: "email",
      PASSWORD: "password",
      ID: "id",
    },
    PROJECT: {
      NAME: "name",
      DESCRIPTION: "description",
      ID: "id",
    },
    SUPPLIER: {
      NAME: "name",
      CONTACT: "contactPerson",
      ID: "id",
      ADDRESS: "address",
    },
  },

  USER_ACCESS_CONTROL: {
    ONLY_ADMIN: ["admin"],
    ONLY_USER: ["user"],
    ONLY_VIEWER: ["viewer"],
    ADMIN_USER: ["admin", "user"],
    ADMIN_VIEWER: ["admin", "viewer"],
    USER_VIEWER: ["user", "viewer"],
    ALL_TYPES: ["admin", "user", "viewer"],
  },

  // Response messages
  RESPONSE: {
    ERROR: {
      SAMPLE: {
        ID: "sampleId is missing!",
        NOT_FOUND: "Sample not found",
        REMOVE: "Error removing field",
        UPDATE: "Error updating field",
        ALREADY_EXISTS: "Sample already exists",
        NOT_FOUND_ID: "Sample not found! with the provided _id",
        INVALID_PARAMETER: {
          GET: "sampleService.get params is missing!",
          GET_ALL: "sampleService.getAllField params is missing!",
          CREATE: "sampleService.create params is missing!",
          UPDATE: "sampleService.update params is missing!",
          ID: "sampleService.update params._id is missing!",
          REMOVE: "sampleService.remove params is missing!",
          SEARCH: "sampleService.search params is missing!",
        },
      },
    },
  },

  VALIDATION_MESSAGES: {
    USER: {
      ID_FORMAT: "Invalid user ID format",
      EMAIL_REQUIRED: "Email is required",
      PASSWORD_REQUIRED: "Password is required",
      PASSWORD_MIN_LENGTH: "Password must be at least 8 characters",
      USERNAME_REQUIRED: "Username is required",
      FIRSTNAME_REQUIRED: "First name is required",
      LASTNAME_REQUIRED: "Last name is required",
    },
    SUPPLIER: {
      NAME_REQUIRED: "Supplier name is required",
      ADDRESS_REQUIRED: "Supplier address is required",
      CONTACT_PERSON_REQUIRED: "Supplier contact person is required",
      PHONE_REQUIRED: "Supplier phone is required",
      EMAIL_REQUIRED: "Supplier email is required",
      INVALID_ID: "Invalid Supplier ID",
      QUERY_REQUIRED: "Query is required",
      UPDATE_NOT_EMPTY: "Update object must not be empty",
    },
    PROJECT: {
      ID_FORMAT: "Invalid project ID format",
      NAME_REQUIRED: "Project name is required",
      DESCRIPTION_REQUIRED: "Project description is required",
      ESTIMATED_START_REQUIRED: "Project estimated start is required",
      ESTIMATED_END_REQUIRED: "Project estimated end date is required",
      STATUS_REQUIRED: "Project status is required",
      STATUS_DATE_REQUIRED: "Project status date is required",
      TOTAL_BUDGET_POSITIVE: "Total budget must be positive",
      FORECASTED_BUDGET_POSITIVE: "Forecasted budget must be positive",
      QUERY_FIELD_REQUIRED: "Query must contain at least one field.",
      UPDATE_FIELD_REQUIRED: "Update object must contain at least one field.",
      USER_ID_REQUIRED: "User ID is required",
      ROLE_REQUIRED: "Role is required",
    },
    CAPEX: {
      NAME_REQUIRED: "Validation: Capex name is required",
      AMOUNT_REQUIRED: "Validation: Capex amount is required",
      DESCRIPTION_REQUIRED: "Validation: Capex description is required",
      CATEGORY_REQUIRED: "Validation: Capex category is required",
      DATE_REQUIRED: "Validation: Capex date is required",
      INVALID_ID_FORMAT: "Validation: Invalid Capex ID format",
      QUERY_REQUIRED: "Validation: Query is required",
      UPDATE_NOT_EMPTY: "Validation: Update object must not be empty",
      ESTIMATED_AMOUNT_REQUIRED: "Estimated amount must be a positive number.",
      ACTUAL_AMOUNT_REQUIRED: "Actual amount must be a positive number.",
    },
  },

  // Cron job configuration
  CRON: {
    CLEAN_UP: {
      INACTIVE_USERS: {
        TIME: "0 0 1 * *",
        MESSAGE: "Running clean up job for inactive users",
      },
      INACTIVE_USERS_DEACTIVATE_THRESHOLD: 6, // 6 months
      INACTIVE_USERS_ARCHIVE_THRESHOLD: 1, // 1 year
    },
  },
};
