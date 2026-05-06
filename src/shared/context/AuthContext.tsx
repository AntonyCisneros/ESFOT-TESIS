import { AuthService, AuthUser } from "@shared/api/authService";
import { useStorageState } from "@shared/hooks/useStorageState";
import React, { createContext, useEffect, useState } from "react";

type AuthContextType = {
  state: "idle" | "signIn" | "signOut";
  isLoading: boolean;
  isSignedIn: boolean;
  user: AuthUser | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType>({
  state: "idle",
  isLoading: false,
  isSignedIn: false,
  user: null,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isSignedIn, setIsSignedIn, isSignedInLoading] =
    useStorageState("isSignedIn");
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [state, setState] = useState<"idle" | "signIn" | "signOut">("idle");

  // Bootstrap async data when the app starts.
  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        const currentUser = await AuthService.getCurrentUser();
        if (currentUser) {
          setUser({
            id: currentUser.id,
            email: currentUser.email || "",
          });
          setIsSignedIn("true");
        } else {
          setIsSignedIn(null);
        }
      } catch (error) {
        console.error("Error getting current user:", error);
        setIsSignedIn(null);
      } finally {
        setIsLoading(false);
      }
    };

    bootstrapAsync();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const authContext: AuthContextType = {
    state: state,
    isLoading: isLoading || isSignedInLoading === true,
    isSignedIn: isSignedIn === "true",
    user,
    signIn: async (email: string, password: string) => {
      setState("signIn");
      try {
        const user = await AuthService.login(email, password);
        setUser({
          id: user.id,
          email: user.email || "",
        });
        setIsSignedIn("true");
        setState("idle");
      } catch (error) {
        setState("idle");
        throw error;
      }
    },
    signUp: async (email: string, password: string) => {
      setState("signIn");
      try {
        const user = await AuthService.signup(email, password);
        if (!user) throw new Error("No se pudo crear el usuario");
        setUser({
          id: user.id,
          email: user.email || "",
        });
        setIsSignedIn("true");
        setState("idle");
      } catch (error) {
        setState("idle");
        throw error;
      }
    },
    signOut: async () => {
      setState("signOut");
      try {
        await AuthService.logout();
        setUser(null);
        setIsSignedIn(null);
        setState("idle");
      } catch (error) {
        setState("idle");
        throw error;
      }
    },
  };

  return (
    <AuthContext.Provider value={authContext}>{children}</AuthContext.Provider>
  );
}
