import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import type { User } from "@shared/schema";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, name: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const validateSession = async () => {
      const storedUser = localStorage.getItem("vitravels_user");
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          if (parsed.sessionId) {
            // Validate session with server
            const response = await fetch("/api/auth/me", {
              headers: { "X-Session-Id": parsed.sessionId },
            });
            if (response.ok) {
              setUser(parsed);
            } else {
              // Session invalid, clear local storage
              localStorage.removeItem("vitravels_user");
            }
          } else {
            localStorage.removeItem("vitravels_user");
          }
        } catch {
          localStorage.removeItem("vitravels_user");
        }
      }
      setIsLoading(false);
    };
    
    validateSession();
  }, []);

  const login = async (email: string, name: string) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name }),
      });
      
      if (!response.ok) {
        throw new Error("Login failed");
      }
      
      const userData = await response.json();
      setUser(userData);
      localStorage.setItem("vitravels_user", JSON.stringify(userData));
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    const storedUser = localStorage.getItem("vitravels_user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        if (parsed.sessionId) {
          await fetch("/api/auth/logout", {
            method: "POST",
            headers: { "X-Session-Id": parsed.sessionId },
          });
        }
      } catch {
        // Ignore errors during logout
      }
    }
    setUser(null);
    localStorage.removeItem("vitravels_user");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
