import { useMemo, useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "./AccountSettings.css";

function AccountSettings() {
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

  const handlePasswordSubmit = (event) => {
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

    setSectionMessage(
      "password",
      "success",
      "Password change is validated in UI. API integration is pending.",
    );
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
