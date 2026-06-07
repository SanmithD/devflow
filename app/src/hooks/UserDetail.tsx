import axios from "axios";
import { useEffect, useState } from "react";
import { UserType } from "../types/profile.type";

export const useUserInfo = (): UserType | null => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get("/api/auth/profile");

        setUser(res.data.data);
      } catch (err) {
        console.log(err);
      }
    };

    fetchUser();
  }, []);

  return user;
};