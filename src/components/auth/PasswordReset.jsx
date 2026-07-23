import { Button } from "../ui/index.js";
import { AuthShell } from "./AuthShell.jsx";

export function PasswordReset() {
  const handleSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    window.sessionStorage.setItem(
      "pithonPendingVerification",
      JSON.stringify({
        email: formData.get("email"),
        mode: "password-reset",
        role: "student",
      })
    );
    window.location.hash = "#/verify-email";
  };

  return (
    <AuthShell kicker="Password reset" title="Confirm your email">
      <form className="auth-form" onSubmit={handleSubmit}>
        <label>
          Email
          <input autoComplete="email" name="email" type="email" />
        </label>
        <Button type="submit">Continue</Button>
      </form>
    </AuthShell>
  );
}
