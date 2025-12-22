import {
  createContext,
  useContext,
  useState,
  useEffect,
  useLayoutEffect,
} from "react";
import apiClient, { REFRESH_TOKEN_URL } from "../AxiosAPI/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isChecking, setIsChecking] = useState(true);

  // Logout clears server cookie and local state
  const logout = async () => {
    try {
      await apiClient.post("/users/logout", {}, { withCredentials: true });
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setUser(null);
      setToken(null);
      window.location.assign("/");
    }
  };

  // On mount, attempt silent refresh and fetch user
  useEffect(() => {
    let cancelled = false;

    const initializeAuth = async () => {
      setIsChecking(true);
      try {
        let accessToken = token;

        if (!accessToken) {
          const refreshRes = await apiClient.post(
            REFRESH_TOKEN_URL,
            {},
            { withCredentials: true } // ensure cookie is sent
          );
          accessToken = refreshRes.data.access_token; // reuse same variable
          if (accessToken && !cancelled) setToken(accessToken);
        }

        if (accessToken) {
          const userRes = await apiClient.get("/users/me", {
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          if (!cancelled) setUser(userRes.data.value || userRes.data);
        }
      } catch (e) {
        if (!cancelled) {
          setToken(null);
          setUser(null);
        }
      } finally {
        if (!cancelled) setIsChecking(false);
      }
    };

    initializeAuth();
    return () => {
      cancelled = true;
    };
  }, []); // you can optionally add `token` if you want re-run when it changes

  // Attach token to requests
  useLayoutEffect(() => {
    const authInterceptor = apiClient.interceptors.request.use((config) => {
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
    return () => {
      apiClient.interceptors.request.eject(authInterceptor);
    };
  }, [token]);

  // Automatically refresh on 401, logout on failure
  useLayoutEffect(() => {
    const refreshInterceptor = apiClient.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config || {};
        if (
          error.response &&
          error.response.status === 401 &&
          !originalRequest._retry &&
          originalRequest.url !== REFRESH_TOKEN_URL &&
          originalRequest.url !== "/users/login"
        ) {
          originalRequest._retry = true;
          try {
            const response = await apiClient.post(
              REFRESH_TOKEN_URL,
              {},
              { withCredentials: true }
            );
            const newToken = response.data.access_token;
            setToken(newToken);
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return apiClient(originalRequest);
          } catch (refreshError) {
            logout();
            return Promise.reject(refreshError);
          }
        }
        return Promise.reject(error);
      }
    );
    return () => {
      apiClient.interceptors.response.eject(refreshInterceptor);
    };
  }, [token]);

  const contextValue = {
    user,
    token,
    isTokenChecking: isChecking,
    apiClient,
    logout,
    setToken,
    setUser,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
