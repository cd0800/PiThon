import { useState } from "react";
import { Button } from "../ui/index.js";
import { AuthShell } from "./AuthShell.jsx";

export function SignUp() {
  const [role, setRole] = useState("student");

  const handleSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    window.localStorage.setItem(
      "pithonPendingVerification",
      JSON.stringify({
        email: formData.get("email"),
        role,
      })
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
