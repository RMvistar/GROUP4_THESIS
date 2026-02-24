export const getStoredToken = () => {
  const token = localStorage.getItem("token");

  if (!token || token === "null" || token === "undefined") {
    return null;
  }

  return token;
};

export const isTokenExpired = (token) => {
  if (!token) return true;

  try {
    const payloadBase64 = token.split(".")[1];
    if (!payloadBase64) return true;

    const normalizedBase64 = payloadBase64
      .replace(/-/g, "+")
      .replace(/_/g, "/");
    const payload = JSON.parse(atob(normalizedBase64));

    if (!payload.exp) return false;

    const nowInSeconds = Math.floor(Date.now() / 1000);
    return payload.exp <= nowInSeconds;
  } catch {
    return true;
  }
};

export const clearAuthStorage = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};
