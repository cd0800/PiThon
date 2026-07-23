import { useState } from "react";
import { requestEmailVerification } from "../../services/api.js";
import { Button } from "../ui/index.js";
import { AuthShell } from "./AuthShell.jsx";

export function SignUp() {
  const [role, setRole] = useState("student");
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    const formData = new FormData(event.currentTarget);
    const pendingUser = {
      email: String(formData.get("email") || "").trim(),
      password: String(formData.get("password") || ""),
      username: String(formData.get("username") || "").trim(),
      role,
    };

    if (!pendingUser.username || !pendingUser.email || !pendingUser.password) {
      setError("Username, email, and password are required.");
      return;
    }

    try {
      await requestEmailVerification(pendingUser);
    } catch (signupError) {
      setError(signupError.message || "Could not start verification.");
      return;
    }

    window.sessionStorage.setItem(
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
          <input autoComplete="username" name="username" required type="text" />
        </label>
        <label>
          Password
          <input autoComplete="new-password" name="password" required type="password" />
        </label>
        <label>
          Email
          <input autoComplete="email" name="email" required type="email" />
        </label>
        {error ? <p className="auth-error">{error}</p> : null}
        <Button type="submit">Continue</Button>
      </form>
      <p className="auth-switch">
        Already have an account? <a href="#/login">Log in</a>
      </p>
    </AuthShell>
  );
}
