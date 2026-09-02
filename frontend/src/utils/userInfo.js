export function getStoredUserInfo() {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem("userInfo");
  return stored ? JSON.parse(stored) : null;
}

export function storeUserInfo(data) {
  localStorage.setItem("userInfo", JSON.stringify(data));
  window.dispatchEvent(new Event("userInfoUpdated"));
}

export function clearStoredUserInfo() {
  localStorage.removeItem("userInfo");
  window.dispatchEvent(new Event("userInfoUpdated"));
}
