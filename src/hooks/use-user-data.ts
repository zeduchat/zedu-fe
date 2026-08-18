import { useState, useEffect, useContext } from "react";
import { ACTIONS } from "~/store/Actions";
import { DataContext } from "~/store/GlobalState";
import { GetRequest, DeleteRequest } from "~/utils/request"; // Ensure this import path is correct

const USER_STORAGE_KEY = "user";

export type User = {
  id: string;
  avatar_url: string;
  default_avatar_url?: string;
  email: string;
  full_name: string;
  phone: string;
  user_name: string;
  username: string;
  created_at?: string;
  deleted_at?: string;
  updated_at?: string;
  deactivated?: boolean;
  user_id?: string;
};

export const useUserData = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { state, dispatch } = useContext(DataContext);

  const updateUser = (newUserData: Partial<User>) => {
    setUser((prevUser) => {
      if (!prevUser) {
        if (!newUserData.id) {
          console.error("Attempting to set user data without an id");
          return null;
        }
        return newUserData as User;
      }
      const updatedUser = { ...prevUser, ...newUserData };
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
      return updatedUser;
    });
    window.dispatchEvent(new Event("userDataUpdated"));
  };

  const clearUser = () => {
    localStorage.clear();
    setUser(null);
    window.dispatchEvent(new Event("userDataUpdated"));
  };

  const fetchAndUpdateUser = async () => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      setError("No token found");
      return;
    }
    try {
      const response = await GetRequest("/profile", token);
      if (response?.status === 200 || response?.status === 201) {
        const profileData = response?.data?.data;
        if (!profileData.id) {
          throw new Error("User data is missing id");
        }
        updateUser(profileData);
        localStorage.setItem("user", JSON.stringify(profileData));
        dispatch({ type: ACTIONS.CALLBACK, payload: !state?.callback });
      } else {
        setError("Failed to fetch user data");
      }
    } catch (err) {
      setError("An error occurred while fetching user data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const deleteProfilePicture = async () => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      setError("No token found");
      return;
    }
    try {
      const response = await DeleteRequest("/profile/image", token);
      if (response?.status === 200 || response?.status === 201) {
        updateUser({ ...user, avatar_url: "" });
        return true;
      } else {
        setError("Failed to delete profile picture");
        return false;
      }
    } catch (err) {
      setError("An error occurred while deleting profile picture");
      console.error(err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // useEffect(() => {
  //   fetchAndUpdateUser();
  // }, []);

  useEffect(() => {
    const handleStorageChange = () => {
      const storedUser = localStorage.getItem(USER_STORAGE_KEY);
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          if (parsedUser && parsedUser.id) {
            setUser(parsedUser);
          } else {
            console.error("Stored user data is invalid");
            localStorage.removeItem(USER_STORAGE_KEY);
          }
        } catch (error) {
          console.error("Error parsing stored user data", error);
          localStorage.removeItem(USER_STORAGE_KEY);
        }
      } else {
        setUser(null);
      }
    };

    handleStorageChange(); // Initial load
    window.addEventListener("userDataUpdated", handleStorageChange);
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("userDataUpdated", handleStorageChange);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  return {
    user,
    updateUser,
    clearUser,
    fetchAndUpdateUser,
    deleteProfilePicture,
    loading,
    error,
  };
};
