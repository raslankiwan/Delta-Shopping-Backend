import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import { FullPageSpinner } from "./ui";

export function ProtectedRoute() {
  const { status } = useAuth();
  const location = useLocation();

  if (status === "initializing") {
    return <FullPageSpinner />;
  }

  if (status === "unauthenticated") {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
