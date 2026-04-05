"use client";

import { createContext, useContext, useEffect, useMemo, useReducer, type Dispatch, type ReactNode } from "react";
import { logout, watchAuthState } from "@/lib/auth";
import { DEMO_USER, disableDemoMode, isDemoModeEnabled } from "@/lib/demo-mode";
import type { AppUser } from "@/types/user";

type AuthState = {
  user: AppUser | null;
  loading: boolean;
};

type AuthAction =
  | { type: "SET_USER"; payload: AppUser | null }
  | { type: "SET_LOADING"; payload: boolean };

const initialState: AuthState = {
  user: null,
  loading: true,
};

function reducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "SET_USER":
      return { ...state, user: action.payload, loading: false };
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    default:
      return state;
  }
}

const AuthContext = createContext<{
  state: AuthState;
  dispatch: Dispatch<AuthAction>;
  signOut: () => Promise<void>;
} | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const unsubscribe = watchAuthState((user) => {
      if (user) {
        dispatch({ type: "SET_USER", payload: user });
        return;
      }

      // TEMPORARY: allow a client-only demo identity when no Firebase user is authenticated.
      if (isDemoModeEnabled()) {
        dispatch({ type: "SET_USER", payload: DEMO_USER });
        return;
      }

      dispatch({ type: "SET_USER", payload: null });
    });

    return () => unsubscribe();
  }, []);

  const value = useMemo(
    () => ({
      state,
      dispatch,
      signOut: async () => {
        disableDemoMode();
        await logout();
      },
    }),
    [state],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
