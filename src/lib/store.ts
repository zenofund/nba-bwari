// ============================================================
// NBA BWARI DIGITAL PORTAL — App State Store
// Simple React context-based state management
// TODO: Replace with Zustand or Redux Toolkit for production
// ============================================================

import React from "react";
import { mockMember } from "@/lib/mock-data";

type Member = typeof mockMember;

type AdminScreen =
  | "admin-login"
  | "admin-dashboard"
  | "admin-members"
  | "admin-attendance"
  | "admin-financials"
  | "admin-elections"
  | "admin-content"
  | "admin-documents"
  | "admin-audit"
  | "admin-settings";

type Screen =
  | "welcome"
  | "login"
  | "register"
  | "dashboard"
  | "attendance"
  | "elections"
  | "vote"
  | "documents"
  | "profile"
  | "notifications"
  | "financials"
  | "good-standing"
  | "news"
  | "news-detail"
  | "admin-login"
  | "admin-dashboard"
  | "admin-members"
  | "admin-attendance"
  | "admin-financials"
  | "admin-elections"
  | "admin-content"
  | "admin-documents"
  | "admin-audit"
  | "admin-settings";

type AppState = {
  isAuthenticated: boolean;
  isAdmin: boolean;
  member: Member | null;
  currentScreen: Screen;
  unreadNotifications: number;
};

type AppAction =
  | { type: "LOGIN"; member: Member }
  | { type: "ADMIN_LOGIN"; member: Member }
  | { type: "LOGOUT" }
  | { type: "NAVIGATE"; screen: Screen }
  | { type: "SET_UNREAD"; count: number };

const initialState: AppState = {
  isAuthenticated: false,
  isAdmin: false,
  member: null,
  currentScreen: "welcome",
  unreadNotifications: 2,
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "LOGIN":
      return { ...state, isAuthenticated: true, isAdmin: false, member: action.member, currentScreen: "dashboard" };
    case "ADMIN_LOGIN":
      return { ...state, isAuthenticated: true, isAdmin: true, member: action.member, currentScreen: "admin-dashboard" };
    case "LOGOUT":
      return { ...initialState };
    case "NAVIGATE":
      return { ...state, currentScreen: action.screen };
    case "SET_UNREAD":
      return { ...state, unreadNotifications: action.count };
    default:
      return state;
  }
}

export const AppContext = React.createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}>({
  state: initialState,
  dispatch: () => null,
});

export function useApp() {
  return React.useContext(AppContext);
}

export { appReducer, initialState };
export type { AppState, AppAction, Screen, AdminScreen, Member };
