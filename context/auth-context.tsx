"use client";

import { createContext, useContext, useEffect, useMemo, useReducer, type Dispatch, type ReactNode } from "react";
import { logout, watchAuthState } from "@/lib/auth";
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
      dispatch({ type: "SET_USER", payload: user });
    });

    return () => unsubscribe();
  }, []);

  const value = useMemo(
    () => ({
      state,
      dispatch,
      signOut: logout,
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
