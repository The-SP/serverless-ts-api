import * as awsLambda from "aws-lambda";

import {
  getTask,
  getTasks,
  createTask,
  updateTask,
  deleteTask,
} from "./handler";
import client from "./db";

// Mock the database client
jest.mock("./db", () => ({
  query: jest.fn(),
}));

const mockedClient = client as jest.Mocked<typeof client>;

describe("getTasks function", () => {
  it("should return a list of tasks", async () => {
    const fakeEvent = {
      pathParameters: {},
    } as unknown as awsLambda.APIGatewayProxyEvent;

    const mockTasks = [{ id: 1, title: "Task 1", completed: false }];
    mockedClient.query.mockResolvedValueOnce({ rows: mockTasks } as never);

    const expected = {
      statusCode: 200,
      body: JSON.stringify(mockTasks),
    };
    const result = await getTasks(fakeEvent);

    expect(result).toEqual(expected);
  });
});

describe("getTask function", () => {
  it("should return a task if it exists", async () => {
    const fakeEvent = {
      pathParameters: { id: "1" },
    } as unknown as awsLambda.APIGatewayProxyEvent;

    const mockTask = { id: 1, title: "Task 1", completed: false };
    mockedClient.query.mockResolvedValueOnce({ rows: [mockTask] } as never);

    const expected = {
      statusCode: 200,
      body: JSON.stringify(mockTask),
    };

    const result = await getTask(fakeEvent);
    expect(result).toEqual(expected);
  });

  it("should throw an error if task ID is missing", async () => {
    const fakeEvent = {
      pathParameters: {}, // Simulate missing parameters
    } as unknown as awsLambda.APIGatewayProxyEvent;

    expect(getTask(fakeEvent)).rejects.toThrow(
      "Missing required parameter: task id"
    );
  });

  it("should return a 404 error if task doesn't exist", async () => {
    const fakeEvent = {
      pathParameters: { id: "999" },
    } as unknown as awsLambda.APIGatewayProxyEvent;

    mockedClient.query.mockResolvedValueOnce({ rows: [] } as never);

    const expected = {
      statusCode: 404,
      body: JSON.stringify({ error: "Task not found" }),
    };

    const result = await getTask(fakeEvent);
    expect(result).toEqual(expected);
  });
});

describe("createTask funciton", () => {
  it("should create a task and return 201 status", async () => {
    const fakeEvent = {
      body: JSON.stringify({ title: "Task 1" }),
    } as unknown as awsLambda.APIGatewayProxyEvent;

    const mockTask = { id: 1, title: "Task 1", completed: false };
    mockedClient.query.mockResolvedValueOnce({ rows: [mockTask] } as never);

    const expected = {
      statusCode: 201,
      body: JSON.stringify(mockTask),
    };

    const result = await createTask(fakeEvent);
    expect(result).toEqual(expected);
  });

  it("should throw an error if the body is missing", async () => {
    const fakeEvent = {
      body: "",
    } as unknown as awsLambda.APIGatewayProxyEvent;

    await expect(createTask(fakeEvent)).rejects.toThrow(
      "Missing required parameter: body"
    );
  });

  it("should return a 400 error if title is missing", async () => {
    const fakeEvent = {
      body: JSON.stringify({}),
    } as unknown as awsLambda.APIGatewayProxyEvent;

    const expected = {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing task title" }),
    };

    const result = await createTask(fakeEvent);
    expect(result).toEqual(expected);
  });
});

describe("updateTask funciton", () => {
  it("should update a task and return 200 status", async () => {
    const fakeEvent = {
      pathParameters: { id: "1" },
      body: JSON.stringify({ title: "Updated Task" }),
    } as unknown as awsLambda.APIGatewayProxyEvent;

    const mockTask = { id: 1, title: "Updated Task", completed: false };
    mockedClient.query.mockResolvedValueOnce({ rows: [mockTask] } as never);

    const expected = {
      statusCode: 200,
      body: JSON.stringify(mockTask),
    };

    const result = await updateTask(fakeEvent);
    expect(result).toEqual(expected);
  });

  it("should throw an error if task ID is missing", async () => {
    const fakeEvent = {
      pathParameters: {}, // Simulate missing parameters
      body: JSON.stringify({ title: "Task 1" }),
    } as unknown as awsLambda.APIGatewayProxyEvent;

    expect(updateTask(fakeEvent)).rejects.toThrow(
      "Missing required parameter: task id"
    );
  });

  it("should throw an error if the body is missing", async () => {
    const fakeEvent = {
      pathParameters: { id: "1" },
      body: null,
    } as unknown as awsLambda.APIGatewayProxyEvent;

    await expect(updateTask(fakeEvent)).rejects.toThrow(
      "Missing required parameter: body"
    );
  });

  describe("deleteTask funciton", () => {
    it("should delete a task and return 200 status", async () => {
      const fakeEvent = {
        pathParameters: { id: "1" },
      } as unknown as awsLambda.APIGatewayProxyEvent;

      mockedClient.query.mockResolvedValueOnce({ rows: [] } as never);

      const expected = {
        statusCode: 200,
        body: JSON.stringify({ message: "Task 1 deleted successfully" }),
      };

      const result = await deleteTask(fakeEvent);
      expect(result).toEqual(expected);
    });

    it("should throw an error if task ID is missing", async () => {
      const fakeEvent = {
        pathParameters: {}, // Simulate missing parameters
      } as unknown as awsLambda.APIGatewayProxyEvent;

      expect(deleteTask(fakeEvent)).rejects.toThrow(
        "Missing required parameter: task id"
      );
    });
  });
});
