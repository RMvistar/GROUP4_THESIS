import { useMemo, useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useAuthStore } from "../../store/useAuthStore";
import "./AccountSettings.css";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";

function AccountSettings() {
  // useAuthStore gives us the JWT token so we can make authenticated requests.
  const { token } = useAuthStore();

  // storedUser is the user object that was saved to localStorage when they logged in.
  // It includes the mustChangePassword flag the backend sends with every login.
  const storedUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || {};
    } catch {
      return {};
    }
  }, []);

  const [emailForm, setEmailForm] = useState({
    email: storedUser.email || "",
    confirmEmail: "",
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [visiblePasswords, setVisiblePasswords] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  const [messages, setMessages] = useState({
    email: "",
    password: "",
    emailType: "",
    passwordType: "",
  });

  // mustChangePassword comes from the user object stored in localStorage.
  // It is true when an admin just created the account or reset the password.
  const [mustChange, setMustChange] = useState(
    storedUser.mustChangePassword === true,
  );

  const setSectionMessage = (section, type, text) => {
    setMessages((previous) => ({
      ...previous,
      [section]: text,
      [`${section}Type`]: type,
    }));
  };

  const handleEmailSubmit = (event) => {
    event.preventDefault();

    if (!emailForm.email.trim()) {
      setSectionMessage("email", "error", "Email is required.");
      return;
    }

    if (emailForm.email !== emailForm.confirmEmail) {
      setSectionMessage("email", "error", "Email confirmation does not match.");
      return;
    }

    setSectionMessage(
      "email",
      "success",
      "Email change is staged in UI. API integration is pending.",
    );
  };

  // handlePasswordSubmit now actually calls the backend instead of just
  // validating locally.  The backend checks the current password, hashes the
  // new one, saves it, and clears the mustChangePassword flag in the database.
  const handlePasswordSubmit = async (event) => {
    event.preventDefault();

    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      setSectionMessage(
        "password",
        "error",
        "Current and new password are required.",
      );
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setSectionMessage(
        "password",
        "error",
        "New password must be at least 8 characters.",
      );
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setSectionMessage(
        "password",
        "error",
        "Password confirmation does not match.",
      );
      return;
    }

    try {
      // PATCH /api/users/change-password is protected by verifyToken.
      // We send the JWT in the Authorization header so the backend knows who we are.
      const res = await fetch(`${API_BASE_URL}/api/users/change-password`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          // The JWT token that was stored in localStorage during login.
          Authorization: `Bearer ${token}`,
        },
        // Send both passwords in the request body as JSON.
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        // The backend returned an error (e.g. wrong current password).
        setSectionMessage(
          "password",
          "error",
          data.message || "Failed to change password.",
        );
        return;
      }

      // ✅ Success path:
      // 1. Clear the form fields.
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      // 2. Clear the mustChangePassword banner locally so the warning disappears.
      setMustChange(false);
      // 3. Update localStorage so the flag stays cleared if the page refreshes.
      const updatedUser = { ...storedUser, mustChangePassword: false };
      localStorage.setItem("user", JSON.stringify(updatedUser));

      setSectionMessage(
        "password",
        "success",
        "Password changed successfully!",
      );
    } catch {
      setSectionMessage(
        "password",
        "error",
        "Could not connect to server. Please try again.",
      );
    }
  };

  const togglePasswordVisibility = (field) => {
    setVisiblePasswords((previous) => ({
      ...previous,
      [field]: !previous[field],
    }));
  };

  return (
    <div className="account-settings-wrapper">
      <div className="account-settings-content">
        <header className="settings-header">
          <h2>Account Settings</h2>
        </header>

        {/* ─── Temporary-password banner ─────────────────────────────────────
            This warning appears whenever mustChangePassword is still true.
            It disappears the moment the user successfully changes their password
            because handlePasswordSubmit sets setMustChange(false) on success. */}
        {mustChange && (
          <div className="settings-temp-password-banner">
            ⚠️ You are using a <strong>temporary password</strong>. Please
            change it now using the form below before continuing.
          </div>
        )}

        <section className="settings-card">
          <h3>Change Email</h3>
          <form onSubmit={handleEmailSubmit} className="settings-form">
            <label>
              New Email
              <input
                type="email"
                value={emailForm.email}
                onChange={(event) =>
                  setEmailForm((previous) => ({
                    ...previous,
                    email: event.target.value,
                  }))
                }
              />
            </label>

            <label>
              Confirm Email
              <input
                type="email"
                value={emailForm.confirmEmail}
                onChange={(event) =>
                  setEmailForm((previous) => ({
                    ...previous,
                    confirmEmail: event.target.value,
                  }))
                }
              />
            </label>

            <button type="submit">Update Email</button>
          </form>
          {messages.email && (
            <p className={`settings-message ${messages.emailType}`}>
              {messages.email}
            </p>
          )}
        </section>

        <section className="settings-card">
          <h3>Change Password</h3>
          <form onSubmit={handlePasswordSubmit} className="settings-form">
            <label>
              Current Password
              <div className="password-input-row">
                <input
                  type={visiblePasswords.currentPassword ? "text" : "password"}
                  value={passwordForm.currentPassword}
                  onChange={(event) =>
                    setPasswordForm((previous) => ({
                      ...previous,
                      currentPassword: event.target.value,
                    }))
                  }
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => togglePasswordVisibility("currentPassword")}
                  aria-label={
                    visiblePasswords.currentPassword
                      ? "Hide current password"
                      : "Show current password"
                  }
                >
                  {visiblePasswords.currentPassword ? (
                    <FaEyeSlash />
                  ) : (
                    <FaEye />
                  )}
                </button>
              </div>
            </label>

            <label>
              New Password
              <div className="password-input-row">
                <input
                  type={visiblePasswords.newPassword ? "text" : "password"}
                  value={passwordForm.newPassword}
                  onChange={(event) =>
                    setPasswordForm((previous) => ({
                      ...previous,
                      newPassword: event.target.value,
                    }))
                  }
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => togglePasswordVisibility("newPassword")}
                  aria-label={
                    visiblePasswords.newPassword
                      ? "Hide new password"
                      : "Show new password"
                  }
                >
                  {visiblePasswords.newPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </label>

            <label>
              Confirm New Password
              <div className="password-input-row">
                <input
                  type={visiblePasswords.confirmPassword ? "text" : "password"}
                  value={passwordForm.confirmPassword}
                  onChange={(event) =>
                    setPasswordForm((previous) => ({
                      ...previous,
                      confirmPassword: event.target.value,
                    }))
                  }
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => togglePasswordVisibility("confirmPassword")}
                  aria-label={
                    visiblePasswords.confirmPassword
                      ? "Hide confirm new password"
                      : "Show confirm new password"
                  }
                >
                  {visiblePasswords.confirmPassword ? (
                    <FaEyeSlash />
                  ) : (
                    <FaEye />
                  )}
                </button>
              </div>
            </label>

            <button type="submit">Update Password</button>
          </form>
          {messages.password && (
            <p className={`settings-message ${messages.passwordType}`}>
              {messages.password}
            </p>
          )}
        </section>
      </div>
    </div>
  );
}

export default AccountSettings;
