import { Routes, Route } from "react-router-dom";
import LoginRegisterPage from "../pages/LoginRegisterPage";
import AuthLayout from "../components/layout/AuthLayout";
import MainLayout from "../components/layout/MainLayout";
import EventPage from "../pages/EventPage";
import HumanResourcePage from "../pages/HumanResourcePage";
import ResourcePage from "../pages/ResourcePage";
import BudgetPage from "../pages/BudgetPage";
import OrganizationPage from "../pages/OrganizationPage";
import WebLayout from "../components/layout/WebLayout";
import EventDetail from "../components/event/EventDetail";
import ProfilePage from "../pages/ProfilePage";
import OrganizationSettingsPage from "../pages/OrganizationSettingsPage";

export const AppRoutes = () => (
  <Routes>
    <Route
      path="/auth"
      element={
        <AuthLayout>
          <LoginRegisterPage />
        </AuthLayout>
      }
    />
    <Route element={<WebLayout />}>
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/organization" element={<OrganizationPage />} />
      <Route path="/organization/:organizationId/*" element={<MainLayout />}>
        {/* <Route path="dashboard" element={<DashBoardPage />} /> */}
        <Route path="settings" element={<OrganizationSettingsPage />} />
        <Route path="events" element={<EventPage />} />
        <Route path="events/:eventId" element={<EventDetail />} />
        <Route path="human-resource" element={<HumanResourcePage />} />
        <Route path="resources" element={<ResourcePage />} />
        <Route path="budget" element={<BudgetPage />} />
      </Route>
    </Route>
  </Routes>
);
