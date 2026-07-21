import { useMemo, useState } from "react";
import { verifyEmailCode } from "../../services/api.js";
import { Button, InputOTP } from "../ui/index.js";
import { AuthShell } from "./AuthShell.jsx";

const DEMO_VERIFICATION_CODE = "123456";

export function EmailVerification() {
  const [error, setError] = useState("");
  const pendingVerification = useMemo(() => {
    try {
      return JSON.parse(
        window.localStorage.getItem("pithonPendingVerification") || "{}"
      );
    } catch {
      return {};
    }
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const enteredCode = Array.from(
      event.currentTarget.querySelectorAll(".ui-otp-input")
    )
      .map((input) => input.value)
      .join("");

    if (enteredCode !== DEMO_VERIFICATION_CODE) {
      setError(`Use demo code ${DEMO_VERIFICATION_CODE}.`);
      return;
    }

    const role = pendingVerification.role === "teacher" ? "teacher" : "student";

    try {
      const result = await verifyEmailCode({
        code: enteredCode,
        email: pendingVerification.email,
        role,
        username: pendingVerification.username,
      });

      if (!result.verified) {
        setError(result.reason || "Verification failed.");
        return;
      }
    } catch {
      // Keep the local demo flow available when the API server is not running.
    }

    window.localStorage.removeItem("pithonPendingVerification");
    window.localStorage.setItem("pithonCurrentRole", role);
    window.localStorage.setItem(
      "pithonCurrentUsername",
      pendingVerification.username || ""
    );
    window.location.hash = `#/${role}`;
  };

  return (
    <AuthShell kicker="Email verification" title="Enter your code">
      <div className="auth-demo-code" role="note">
        <span>Demo verification code</span>
        <strong>{DEMO_VERIFICATION_CODE}</strong>
        {pendingVerification.email ? (
          <p>No email is sent in this local demo. Use this code for {pendingVerification.email}.</p>
        ) : (
          <p>No email is sent in this local demo. Use this code to continue.</p>
        )}
      </div>
      <form className="auth-form auth-verification-form" onSubmit={handleSubmit}>
        <InputOTP length={6} />
        {error ? <p className="auth-error">{error}</p> : null}
        <Button type="submit">Continue</Button>
      </form>
    </AuthShell>
  );
}
