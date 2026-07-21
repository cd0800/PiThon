import { useState } from "react";
import { requestEmailVerification } from "../../services/api.js";
import { Button } from "../ui/index.js";
import { AuthShell } from "./AuthShell.jsx";

export function SignUp() {
  const [role, setRole] = useState("student");

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const pendingUser = {
      email: String(formData.get("email") || "").trim(),
      username: String(formData.get("username") || "").trim(),
      role,
    };

    try {
      await requestEmailVerification(pendingUser);
    } catch {
      // Keep the local demo flow available when the API server is not running.
    }

    window.localStorage.setItem(
      "pithonPendingVerification",
      JSON.stringify(pendingUser)
    );
    window.location.hash = "#/verify-email";
  };

  return (
    <AuthShell kicker="Create account" title="Join PiThon">
      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="auth-role-toggle" aria-label="Choose account type">
          {["student", "teacher"].map((option) => (
            <button
              aria-pressed={role === option}
              className="auth-role-option"
              key={option}
              onClick={() => setRole(option)}
              type="button"
            >
              {option}
            </button>
          ))}
        </div>
        <label>
          Username
          <input autoComplete="username" name="username" type="text" />
        </label>
        <label>
          Password
          <input autoComplete="new-password" name="password" type="password" />
        </label>
        <label>
          Email
          <input autoComplete="email" name="email" type="email" />
        </label>
        <Button type="submit">Continue</Button>
      </form>
      <p className="auth-switch">
        Already have an account? <a href="#/login">Log in</a>
      </p>
    </AuthShell>
  );
}
