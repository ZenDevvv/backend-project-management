// Purpose: To define the API endpoints for the application.
// Note: This file is used by the routes to define the API endpoints.
export const API_ENDPOINTS = {
  // Main API endpoint
  MAIN: {
    DEFAULT: "/api",
  },

  // User API endpoint
  USER: {
    GET_ALL: "/user/get/all",
    GET_BY_ID: "/user/get/:id",
    CREATE: "/user/create",
    UPDATE: "/user/update",
    REMOVE: "/user/remove/:id",
    LOGIN: "/user/login",
    LOGOUT: "/user/logout",
    CHECKLOGIN: "/current/user",
    SEARCH: "/user/search",
  },
  PROJECT: {
    GET_BY_USER_ID: "/project/get/byUser/:id",
    GET_ALL: "/project/get/all",
    GET_BY_ID: "/project/get/:name",
    CREATE: "/project/create",
    UPDATE: "/project/update/:id",
    REMOVE: "/project/remove/:id",
    SEARCH: "/project/search",
    SEARCH_AND_UPDATE: "/project/searchAndUpdate",
    DASHBOARD: "/project/dashboard/:name",
  },

  SUPPLIER: {
    GET_ALL: "/supplier/get/all",
    GET_BY_ID: "/supplier/get/:id",
    CREATE: "/supplier/create",
    UPDATE: "/supplier/update/:id",
    REMOVE: "/supplier/remove/:id",
    SEARCH: "/supplier/search",
    SEARCH_AND_UPDATE: "/supplier/searchAndUpdate",
  },
  CAPEX: {
    GET_ALL: "/capex/get/all",
    GET_BY_ID: "/capex/get/:id",
    CREATE: "/capex/create",
    UPDATE: "/capex/update/:id",
    REMOVE: "/capex/delete/:id",
    SEARCH: "/capex/search",
    SEARCH_AND_UPDATE: "/capex/searchAndUpdate",
  },

  // ... Add more API endpoints here
};
