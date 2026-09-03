export function getStoredUserInfo() {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem("userInfo");
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch (e) {
    console.error("Failed to parse userInfo from localStorage", e);
    localStorage.removeItem("userInfo");
    return null;
  }
}

export function storeUserInfo(data) {
  localStorage.setItem("userInfo", JSON.stringify(data));
  window.dispatchEvent(new Event("userInfoUpdated"));
}

export function clearStoredUserInfo() {
  localStorage.removeItem("userInfo");
  window.dispatchEvent(new Event("userInfoUpdated"));
}
