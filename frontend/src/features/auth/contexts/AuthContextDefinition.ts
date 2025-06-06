import { createContext } from "react";
import type { User } from "../types";

export type { User };

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string,
    passwordConfirmation: string
  ) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  checkAuth: () => Promise<void>;
  // トークンベース認証用の追加メソッド
  hasToken: () => boolean;
  removeToken: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);
