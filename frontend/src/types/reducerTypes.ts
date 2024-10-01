import { User } from "./types";

export interface userReducerInitialState {
    user: User | null;
    loading: boolean;
  }

  export type UserResponse = {
    success: boolean;
    user: User;
  };