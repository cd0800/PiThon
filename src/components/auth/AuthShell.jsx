import { LogoMark } from "../ui/index.js";

export function AuthShell({ children, kicker, title }) {
  return (
    <section className="auth-page" aria-labelledby="auth-title">
      <div className="auth-card">
        <LogoMark />
        <div className="auth-heading">
          <span>{kicker}</span>
          <h1 id="auth-title">{title}</h1>
        </div>
        {children}
      </div>
    </section>
  );
}
