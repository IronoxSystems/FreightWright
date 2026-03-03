import { createBrowserRouter } from "react-router";
import { Home } from "./pages/Home";
import { Review } from "./pages/Review";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Home,
  },
  {
    path: "/review",
    Component: Review,
  },
]);
