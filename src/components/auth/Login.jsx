import { Button } from "../ui/index.js";
import { AuthShell } from "./AuthShell.jsx";

export function Login() {
  const handleSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const username = String(formData.get("username") || "").toLowerCase();

    window.location.hash = username.includes("teacher")
      ? "#/teacher"
      : "#/student";
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
        <Button type="submit">Continue</Button>
      </form>
      <p className="auth-switch">
        <a href="#/password-reset">Forgot password?</a>
      </p>
    </AuthShell>
  );
}
