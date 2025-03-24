import React from "react";
import { createBrowserRouter } from "react-router-dom";
import TaskManagementPanel from "./task-management/page";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <TaskManagementPanel />,
  },
  {
    path: "/tasks",
    element: <TaskManagementPanel />,
  }
]); 