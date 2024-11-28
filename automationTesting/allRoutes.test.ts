import request from "supertest";
import app from "../index";
import { API_ENDPOINTS } from "../config/endpointsConfig";

describe("Supplier API", () => {
  const token =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiNjcyNGM2OWM3Yzk4Mjc0MDI2ZGFiMDlkIiwiZW1haWwiOiJtZW93QGdtYWlsLmNvbSIsImZpcnN0bmFtZSI6Im1lb3ciLCJsYXN0bmFtZSI6Im1lb3cifSwiaWF0IjoxNzMwNDYzNDA5fQ.5AipyyJ9qugrPgEECtotYXgonuRwi6qdTYRdugwhuks";
  let supplierId: string;

  beforeAll(async () => {
    const newSupplier = {
      name: "Temp Supplier",
      address: "456 Temp St",
      contactPerson: "987-654-3210",
      email: "temp-supplier@example.com",
      phone: "987-654-3210",
    };

    const response = await request(app)
      .post(`${API_ENDPOINTS.MAIN.DEFAULT}${API_ENDPOINTS.SUPPLIER.CREATE}`)
      .set("Authorization", `Bearer ${token}`)
      .send(newSupplier);

    supplierId = response.body.supplier._id;
  });

  afterAll(async () => {
    if (supplierId) {
      await request(app)
        .delete(
          `${API_ENDPOINTS.MAIN.DEFAULT}${API_ENDPOINTS.SUPPLIER.REMOVE.replace(
            ":id",
            supplierId
          )}`
        )
        .set("Authorization", `Bearer ${token}`);
    }
  });

  it("should get all suppliers", async () => {
    const response = await request(app)
      .get(`${API_ENDPOINTS.MAIN.DEFAULT}${API_ENDPOINTS.SUPPLIER.GET_ALL}`)
      .set("Authorization", `Bearer ${token}`);
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it("should get a supplier by ID", async () => {
    const response = await request(app)
      .get(
        `${
          API_ENDPOINTS.MAIN.DEFAULT
        }${API_ENDPOINTS.SUPPLIER.GET_BY_ID.replace(":id", supplierId)}`
      )
      .set("Authorization", `Bearer ${token}`);
    expect(response.status).toBe(200);
    expect(response.body.supplier).toBeDefined();
    expect(response.body.supplier._id).toBe(supplierId);
  });

  it("should create a supplier", async () => {
    const newSupplier = {
      name: "New Supplier",
      address: "123 Supplier St",
      contactPerson: "123-456-7890",
      email: "new-supplier@example.com",
      phone: "123-456-7890",
    };

    const response = await request(app)
      .post(`${API_ENDPOINTS.MAIN.DEFAULT}${API_ENDPOINTS.SUPPLIER.CREATE}`)
      .set("Authorization", `Bearer ${token}`)
      .send(newSupplier);

    expect(response.status).toBe(201);
    expect(response.body.supplier).toBeDefined();
    expect(response.body.supplier.name).toBe(newSupplier.name);
  });

  it("should update a supplier", async () => {
    const updatedData = {
      name: "Updated Supplier Name",
    };

    const response = await request(app)
      .put(
        `${API_ENDPOINTS.MAIN.DEFAULT}${API_ENDPOINTS.SUPPLIER.UPDATE.replace(
          ":id",
          supplierId
        )}`
      )
      .set("Authorization", `Bearer ${token}`)
      .send(updatedData);

    expect(response.status).toBe(200);
    expect(response.body.supplier).toBeDefined();
    expect(response.body.supplier.name).toBe(updatedData.name);
  });

  it("should search suppliers", async () => {
    const response = await request(app)
      .get(
        `${API_ENDPOINTS.MAIN.DEFAULT}${API_ENDPOINTS.SUPPLIER.SEARCH}?search=New Supplier`
      )
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it("should search and update a project", async () => {
    const searchAndUpdateData = {
      query: { name: "New Supplier" },
      update: { name: "Updated New Supplier" },
    };

    const response = await request(app)
      .patch(
        `${API_ENDPOINTS.MAIN.DEFAULT}${API_ENDPOINTS.SUPPLIER.SEARCH_AND_UPDATE}`
      )
      .set("Authorization", `Bearer ${token}`)
      .send(searchAndUpdateData);

    expect(response.status).toBe(200);

    expect(response.body).toBeDefined();
    expect(response.body.name).toBe(searchAndUpdateData.update.name);
  });

  it("should delete a supplier", async () => {
    const response = await request(app)
      .delete(`/api/supplier/remove/${supplierId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.supplier).toBeDefined();
  });
});

describe("Project API", () => {
  const token =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiNjcyNGM2OWM3Yzk4Mjc0MDI2ZGFiMDlkIiwiZW1haWwiOiJtZW93QGdtYWlsLmNvbSIsImZpcnN0bmFtZSI6Im1lb3ciLCJsYXN0bmFtZSI6Im1lb3cifSwiaWF0IjoxNzMwNDYzNDA5fQ.5AipyyJ9qugrPgEECtotYXgonuRwi6qdTYRdugwhuks";
  let projectId: string;

  const newProject = {
    name: "Test Alpha",
    description:
      "This project focuses on the development of a new software application.",
    estimatedStartDate: "2024-01-01T00:00:00.000Z",
    estimatedEndDate: "2024-10-31T00:00:00.000Z",
    actualStartDate: "2024-01-15T00:00:00.000Z",
    actualEndDate: "2024-05-30T00:00:00.000Z",
    totalBudget: 1000000,
    forecastedBudget: 900000,
    projectStatus: [
      {
        status: "In Progress",
        date: "2024-10-01T00:00:00.000Z",
      },
    ],
    opexExpenditures: [
      {
        personName: "Alice Johnson",
        role: "Finance",
        date: "2024-01-20T00:00:00.000Z",
        estimatedAmount: 50000,
        actualAmount: 45000,
      },
    ],
    capexExpenditures: [
      {
        description: "New Equipment Purchase",
        supplierId: "67251111b50f124e59a6efae",
        date: "2024-02-10T00:00:00.000Z",
        actualAmount: 300000,
        estimatedAmount: 350000,
      },
    ],
    members: [
      {
        userId: "67227fdaaded780ef5c7309e",
        role: "Developer",
      },
    ],
  };

  // Setup: Create a project before running tests
  beforeAll(async () => {
    const response = await request(app)
      .post(`${API_ENDPOINTS.MAIN.DEFAULT}${API_ENDPOINTS.PROJECT.CREATE}`)
      .set("Authorization", `Bearer ${token}`)
      .send(newProject);

    projectId = response.body.project?._id;
  });

  // Cleanup: Delete the project after running tests
  afterAll(async () => {
    if (projectId) {
      await request(app)
        .delete(
          `${API_ENDPOINTS.MAIN.DEFAULT}${API_ENDPOINTS.PROJECT.REMOVE.replace(
            ":id",
            projectId
          )}`
        )
        .set("Authorization", `Bearer ${token}`);
    }
  });

  // Test cases
  it("should get all projects", async () => {
    const response = await request(app)
      .get(`${API_ENDPOINTS.MAIN.DEFAULT}${API_ENDPOINTS.PROJECT.GET_ALL}`)
      .set("Authorization", `Bearer ${token}`);
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it("should get a project by ID", async () => {
    const response = await request(app)
      .get(
        `${API_ENDPOINTS.MAIN.DEFAULT}${API_ENDPOINTS.PROJECT.GET_BY_ID.replace(
          ":id",
          projectId
        )}`
      )
      .set("Authorization", `Bearer ${token}`);
    expect(response.status).toBe(200);
    expect(response.body.project).toBeDefined();
    expect(response.body.project._id).toBe(projectId);
  });

  it("should create a project", async () => {
    const response = await request(app)
      .post(`${API_ENDPOINTS.MAIN.DEFAULT}${API_ENDPOINTS.PROJECT.CREATE}`)
      .set("Authorization", `Bearer ${token}`)
      .send(newProject);

    expect(response.status).toBe(201);
    expect(response.body.project).toBeDefined();
    expect(response.body.project.name).toBe(newProject.name);
  });

  it("should update a project", async () => {
    const updatedData = {
      name: "Updated Project Name",
    };

    const response = await request(app)
      .put(
        `${API_ENDPOINTS.MAIN.DEFAULT}${API_ENDPOINTS.PROJECT.UPDATE.replace(
          ":id",
          projectId
        )}`
      )
      .set("Authorization", `Bearer ${token}`)
      .send(updatedData);

    expect(response.status).toBe(200);
    expect(response.body.project).toBeDefined();
    expect(response.body.project.name).toBe(updatedData.name);
  });

  it("should search and update a project", async () => {
    const searchAndUpdateData = {
      query: { name: "Test Alpha" },
      update: { description: "Updated Description for Search and Update" },
    };

    const response = await request(app)
      .patch(
        `${API_ENDPOINTS.MAIN.DEFAULT}${API_ENDPOINTS.PROJECT.SEARCH_AND_UPDATE}`
      )
      .set("Authorization", `Bearer ${token}`)
      .send(searchAndUpdateData);

    expect(response.status).toBe(200);

    // Check for the updated project directly (not as an array)
    expect(response.body).toBeDefined();
    expect(response.body.description).toBe(
      searchAndUpdateData.update.description
    );
  });

  it("should delete a project", async () => {
    const response = await request(app)
      .delete(
        `${API_ENDPOINTS.MAIN.DEFAULT}${API_ENDPOINTS.PROJECT.REMOVE.replace(
          ":id",
          projectId
        )}`
      )
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.project).toBeDefined();
  });

  it("should search for projects", async () => {
    const response = await request(app)
      .get(
        `${API_ENDPOINTS.MAIN.DEFAULT}${API_ENDPOINTS.PROJECT.SEARCH}?search=Test Alpha`
      )
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });
});
