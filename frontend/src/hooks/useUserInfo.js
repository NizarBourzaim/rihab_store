"use client";

import { useEffect, useState } from "react";
import { getStoredUserInfo } from "../utils/userInfo";

export function useUserInfo() {
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    const load = () => setUserInfo(getStoredUserInfo());

    // Deferred so the first client render matches the server-rendered markup.
    setTimeout(load, 0);

    window.addEventListener("userInfoUpdated", load);
    window.addEventListener("storage", load);

    return () => {
      window.removeEventListener("userInfoUpdated", load);
      window.removeEventListener("storage", load);
    };
  }, []);

  return userInfo;
}
