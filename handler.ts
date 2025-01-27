import * as awsLambda from "aws-lambda";

import client from "./db";

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
  if (!event.pathParameters?.id) {
    throw new Error("Missing required parameter: task id");
  }

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
  if (!event.body) throw new Error("Missing required parameter: body");

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
    statusCode: 201,
    body: JSON.stringify(res.rows[0]),
  };
};

const updateTask = async (event: awsLambda.APIGatewayProxyEvent) => {
  if (!event.pathParameters?.id)
    throw new Error("Missing required parameter: task id");
  if (!event.body) throw new Error("Missing required parameter: body");

  const taskId = parseInt(event.pathParameters?.id);
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

const toggleTaskCompletion = async (event: awsLambda.APIGatewayProxyEvent) => {
  try {
    if (!event.pathParameters?.id)
      throw new Error("Missing required parameter: task id");
    const taskId = parseInt(event.pathParameters?.id);
    const res = await client.query("SELECT * from tasks WHERE id=$1", [taskId]);
    if (res.rows.length === 0)
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Task not found." }),
      };
    const task = res.rows[0];
    const newCompletionStatus = !task.completed;
    const updatedRes = await client.query(
      "UPDATE tasks SET completed=$2 WHERE id=$1 RETURNING *",
      [taskId, newCompletionStatus]
    );
    return {
      statusCode: 200,
      body: JSON.stringify(updatedRes.rows[0]),
    };
  } catch (err) {
    console.error("Error toggling task completion:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({
        context: "Toggle task completion",
        error: "Internal Server Error",
      }),
    };
  }
};

const deleteTask = async (event: awsLambda.APIGatewayProxyEvent) => {
  if (!event.pathParameters?.id) {
    throw new Error("Missing required parameter: task id");
  }

  const taskId = parseInt(event.pathParameters?.id);
  await client.query("DELETE FROM tasks WHERE id = $1", [taskId]);
  return {
    statusCode: 200,
    body: JSON.stringify({ message: `Task ${taskId} deleted successfully` }),
  };
};

const taskAnalytics = async (event: awsLambda.APIGatewayProxyEvent) => {
  try {
    const res = await client.query(`
        SELECT
            COUNT(*) AS "totalTasks",
            SUM(CASE WHEN completed = TRUE THEN 1 ELSE 0 END) AS "completedTasks"
        FROM tasks
    `);

    const analytics = res.rows[0];
    const totalTasks = parseInt(analytics.totalTasks);
    const completedTasks = parseInt(analytics.completedTasks);
    const completionRate =
      totalTasks === 0 ? 0 : (completedTasks / totalTasks) * 100;

    return {
      statusCode: 200,
      body: JSON.stringify({
        totalTasks: analytics.totalTasks,
        completedTasks: analytics.completedTasks,
        completionRate: `${Math.round(completionRate)}%`,
      }),
    };
  } catch (err) {
    console.error("Error fetching task analytics:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({
        context: "task-analytics",
        error: "Internal Server Error",
      }),
    };
  }
};

const taskReminders = async (event: awsLambda.APIGatewayProxyEvent) => {
  try {
    const res = await client.query(`
        SELECT * FROM tasks WHERE completed = false;
    `);
    const incompleteTasks = res.rows;
    console.log(`Sending reminders for ${incompleteTasks.length} tasks...`);

    incompleteTasks.forEach((task) => {
      const currentDateTime = new Date().toISOString();
      const msg = `[${currentDateTime}] Reminder: ${task.title} is not completed yet.`;
      console.log(msg);
    });
    console.log("All reminders have been sent.");
  } catch (err) {
    console.error("Error sending task reminders:", err);
  }
};

export {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  toggleTaskCompletion,
  taskAnalytics,
  taskReminders,
};
