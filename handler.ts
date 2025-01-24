import * as awsLambda from "aws-lambda";

import client from "./db";

const hello = async (
  event: awsLambda.APIGatewayProxyEvent
): Promise<awsLambda.APIGatewayProxyResult> => {
  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        message: "Go Serverless v1.0! Your function executed successfully!",
        input: event,
      },
      null,
      2
    ),
  };
};

const getTasks = async (
  event: awsLambda.APIGatewayProxyEvent
): Promise<awsLambda.APIGatewayProxyResult> => {
  const res = await client.query("SELECT * FROM tasks");
  return {
    statusCode: 200,
    body: JSON.stringify(res.rows),
  };
};

const getTask = async (event: awsLambda.APIGatewayProxyEvent) => {
  const taskId = parseInt(event.pathParameters.id);
  const res = await client.query("SELECT * FROM TASKS WHERE id=$1", [taskId]);
  if (res.rows.length === 0) {
    return {
      statusCode: 404,
      body: JSON.stringify({ error: "Task not found" }),
    };
  }
  return {
    statusCode: 200,
    body: JSON.stringify(res.rows[0]),
  };
};

const createTask = async (event: awsLambda.APIGatewayProxyEvent) => {
  const { title } = JSON.parse(event.body);
  if (!title) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing task title" }),
    };
  }

  const res = await client.query(
    "INSERT INTO tasks (title, completed) VALUES ($1, $2) RETURNING *",
    [title, false]
  );

  return {
    statusCode: 200,
    body: JSON.stringify(res.rows[0]),
  };
};

const updateTask = async (event: awsLambda.APIGatewayProxyEvent) => {
  const taskId = parseInt(event.pathParameters.id);
  const { title } = JSON.parse(event.body);
  const res = await client.query(
    "UPDATE tasks SET title = $1 WHERE id = $2 RETURNING *",
    [title, taskId]
  );
  return {
    statusCode: 200,
    body: JSON.stringify(res.rows[0]),
  };
};

const deleteTask = async (event: awsLambda.APIGatewayProxyEvent) => {
  const taskId = parseInt(event.pathParameters.id);
  await client.query("DELETE FROM tasks WHERE id = $1", [taskId]);
  return {
    statusCode: 200,
    body: JSON.stringify({ message: `Task ${taskId} deleted successfully` }),
  };
};

export { hello, getTasks, getTask, createTask, updateTask, deleteTask };
