import { useState } from "react";
import { loginUser } from "../../services/api.js";
import { Button } from "../ui/index.js";
import { AuthShell } from "./AuthShell.jsx";

export function Login() {
  const [error, setError] = useState("");

  const completeLogin = ({ role, token, username }) => {
    window.localStorage.setItem("pithonCurrentRole", role);
    window.localStorage.setItem("pithonCurrentUsername", username);

    if (token) {
      window.localStorage.setItem("pithonAuthToken", token);
    }

    window.location.hash = `#/${role}`;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const formData = new FormData(event.currentTarget);
    const username = String(formData.get("username") || "").trim();
    const password = String(formData.get("password") || "");
    const fallbackRole = username.toLowerCase().includes("teacher")
      ? "teacher"
      : "student";

    try {
      const result = await loginUser({ username, password });

      if (!result.granted) {
        setError(result.reason || "Access denied.");
        return;
      }

      completeLogin({
        role: result.user.role,
        token: result.token,
        username: result.user.username,
      });
    } catch {
      completeLogin({ role: fallbackRole, username });
    }
  };

  return (
    <AuthShell kicker="Welcome back" title="Log in to PiThon">
      <form className="auth-form" onSubmit={handleSubmit}>
        <label>
          Username
          <input autoComplete="username" name="username" type="text" />
        </label>
        <label>
          Password
          <input autoComplete="current-password" name="password" type="password" />
        </label>
        {error ? <p className="auth-error">{error}</p> : null}
        <Button type="submit">Continue</Button>
      </form>
      <p className="auth-switch">
        <a href="#/password-reset">Forgot password?</a>
      </p>
    </AuthShell>
  );
}
