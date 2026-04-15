import { createBrowserRouter } from "react-router";
import Login from "./pages/Login";
import Register from "./pages/Register";
import EmployeeListIntegrated from "./pages/EmployeeListIntegrated";
import EmployeeDetail from "./pages/EmployeeDetail";
import AddEmployee from "./pages/AddEmployee";
import { ProtectedRoute, GuestRoute } from "./components/ProtectedRoute";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <ProtectedRoute><EmployeeListIntegrated /></ProtectedRoute>,
  },
  {
    path: "/login",
    element: <GuestRoute><Login /></GuestRoute>,
  },
  {
    path: "/register",
    element: <GuestRoute><Register /></GuestRoute>,
  },
  {
    path: "/employees",
    element: <ProtectedRoute><EmployeeListIntegrated /></ProtectedRoute>,
  },
  {
    path: "/employees/add",
    element: <ProtectedRoute><AddEmployee /></ProtectedRoute>,
  },
  {
    path: "/employees/:id",
    element: <ProtectedRoute><EmployeeDetail /></ProtectedRoute>,
  },
]);
