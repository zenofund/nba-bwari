import React from "react";
import { AppContext, appReducer, initialState } from "@/lib/store";

// Member Portal Screens
import { WelcomeScreen } from "@/screens/WelcomeScreen";
import { LoginScreen } from "@/screens/LoginScreen";
import { RegisterScreen } from "@/screens/RegisterScreen";
import { DashboardScreen } from "@/screens/DashboardScreen";
import { AttendanceScreen } from "@/screens/AttendanceScreen";
import { ElectionsScreen } from "@/screens/ElectionsScreen";
import { DocumentsScreen } from "@/screens/DocumentsScreen";
import { ProfileScreen } from "@/screens/ProfileScreen";
import { NotificationsScreen } from "@/screens/NotificationsScreen";
import { FinancialsScreen } from "@/screens/FinancialsScreen";
import { GoodStandingScreen } from "@/screens/GoodStandingScreen";
import { NewsScreen } from "@/screens/NewsScreen";

// Admin Portal Screens
import { AdminLoginScreen } from "@/screens/admin/AdminLoginScreen";
import { AdminDashboardScreen } from "@/screens/admin/AdminDashboardScreen";
import { AdminMembersScreen } from "@/screens/admin/AdminMembersScreen";
import { AdminAttendanceScreen } from "@/screens/admin/AdminAttendanceScreen";
import { AdminFinancialsScreen } from "@/screens/admin/AdminFinancialsScreen";
import { AdminElectionsScreen } from "@/screens/admin/AdminElectionsScreen";
import { AdminContentScreen } from "@/screens/admin/AdminContentScreen";
import { AdminDocumentsScreen } from "@/screens/admin/AdminDocumentsScreen";
import { AdminAuditScreen } from "@/screens/admin/AdminAuditScreen";
import { AdminSettingsScreen } from "@/screens/admin/AdminSettingsScreen";

export function App() {
  const [state, dispatch] = React.useReducer(appReducer, initialState);

  const renderScreen = () => {
    // Admin routes
    if (state.currentScreen === "admin-login") {
      return <AdminLoginScreen />;
    }

    if (state.isAdmin && state.isAuthenticated) {
      switch (state.currentScreen) {
        case "admin-dashboard":  return <AdminDashboardScreen />;
        case "admin-members":    return <AdminMembersScreen />;
        case "admin-attendance": return <AdminAttendanceScreen />;
        case "admin-financials": return <AdminFinancialsScreen />;
        case "admin-elections":  return <AdminElectionsScreen />;
        case "admin-content":    return <AdminContentScreen />;
        case "admin-documents":  return <AdminDocumentsScreen />;
        case "admin-audit":      return <AdminAuditScreen />;
        case "admin-settings":   return <AdminSettingsScreen />;
        default:                 return <AdminDashboardScreen />;
      }
    }

    // Unauthenticated member routes
    if (!state.isAuthenticated) {
      switch (state.currentScreen) {
        case "login":    return <LoginScreen />;
        case "register": return <RegisterScreen />;
        default:         return <WelcomeScreen />;
      }
    }

    // Authenticated member routes
    switch (state.currentScreen) {
      case "dashboard":     return <DashboardScreen />;
      case "attendance":    return <AttendanceScreen />;
      case "elections":     return <ElectionsScreen />;
      case "documents":     return <DocumentsScreen />;
      case "profile":       return <ProfileScreen />;
      case "notifications": return <NotificationsScreen />;
      case "financials":    return <FinancialsScreen />;
      case "good-standing": return <GoodStandingScreen />;
      case "news":          return <NewsScreen />;
      default:              return <DashboardScreen />;
    }
  };

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {renderScreen()}
    </AppContext.Provider>
  );
}

export default App;
