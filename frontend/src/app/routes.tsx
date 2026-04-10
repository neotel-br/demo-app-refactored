import { createBrowserRouter } from "react-router";
import Login from "./pages/Login";
import Register from "./pages/Register";
import EmployeeListIntegrated from "./pages/EmployeeListIntegrated";
import EmployeeDetail from "./pages/EmployeeDetail";
import AddEmployee from "./pages/AddEmployee";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: EmployeeListIntegrated,
  },
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/register",
    Component: Register,
  },
  {
    path: "/employees",
    Component: EmployeeListIntegrated,
  },
  {
    path: "/employees/add",
    Component: AddEmployee,
  },
  {
    path: "/employees/:id",
    Component: EmployeeDetail,
  },
]);
