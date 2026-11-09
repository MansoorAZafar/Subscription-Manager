import { Button } from "@mui/material";
import {
  ArrowForward,
  CalendarMonth,
  Groups2,
  Insights,
  ShieldOutlined,
} from "@mui/icons-material";

const authConfigured = Boolean(
  import.meta.env.VITE_AUTH0_DOMAIN && import.meta.env.VITE_AUTH0_CLIENT_ID,
);

export default function LandingPage({ auth }) {
  const signIn = () =>
    auth.loginWithRedirect({
      appState: { returnTo: window.location.pathname + window.location.search },
    });
  const signUp = () =>
    auth.loginWithRedirect({
      authorizationParams: { screen_hint: "signup" },
      appState: { returnTo: window.location.pathname + window.location.search },
    });

  return (
    <div className="landing-page">
      <header className="landing-nav">
        <a className="brand landing-brand" href="/">
          <span className="brand-mark">s</span>
          <span>
            subscript<span className="brand-dot">.</span>
          </span>
        </a>
        <div className="landing-nav-actions">
          <Button onClick={signIn} disabled={!authConfigured}>
            Sign in
          </Button>
          <Button
            variant="contained"
            onClick={signUp}
            disabled={!authConfigured}
          >
            Get started
          </Button>
        </div>
      </header>
      <main>
        <section className="landing-hero">
          <div className="landing-copy">
            <span className="landing-kicker">
              A CLEARER VIEW OF YOUR RECURRING SPEND
            </span>
            <h1>
              Every subscription,
              <br />
              in one simple place.
            </h1>
            <p>
              Keep track of renewals, understand your monthly spend, and manage
              subscriptions in a shared workspace.
            </p>
            <div className="landing-ctas">
              <Button
                variant="contained"
                endIcon={<ArrowForward />}
                onClick={signUp}
                disabled={!authConfigured}
              >
                Create your free account
              </Button>
              <Button onClick={signIn} disabled={!authConfigured}>
                I already have an account
              </Button>
            </div>
            {!authConfigured && (
              <p className="auth-setup-note">
                Add your Auth0 domain and client ID in{" "}
                <code>smp-frontend/.env</code> to enable sign in.
              </p>
            )}
            <div className="landing-proof">
              <ShieldOutlined />
              <span>
                Your subscription details stay private to you and the people you
                invite.
              </span>
            </div>
          </div>
          <div
            className="landing-preview"
            aria-label="Sample subscription dashboard preview"
          >
            <div className="preview-top">
              <div>
                <span className="preview-label">MONTHLY SUBSCRIPTIONS</span>
                <strong>$108.96</strong>
              </div>
              <span className="preview-period">THIS MONTH</span>
            </div>
            <div className="preview-chart">
              <div className="preview-gridline" />
              <div className="preview-bars">
                {[38, 55, 43, 70, 58, 82, 66, 92, 75, 100, 86, 110].map(
                  (height, index) => (
                    <i key={index} style={{ height }} />
                  ),
                )}
              </div>
              <div className="preview-months">
                <span>JUN</span>
                <span>JUL</span>
                <span>AUG</span>
                <span>SEP</span>
                <span>OCT</span>
                <span>NOV</span>
              </div>
            </div>
            <div className="preview-next">
              <span className="preview-app-icon">N</span>
              <div>
                <b>Next renewal</b>
                <small>Netflix · in 4 days</small>
              </div>
              <strong>$22.99</strong>
            </div>
            <div className="preview-note">
              <Groups2 /> Invite members to your workspace
            </div>
          </div>
        </section>
        <section className="landing-features">
          <div>
            <CalendarMonth />
            <h2>Know what renews next</h2>
            <p>See upcoming charges and keep important dates in view.</p>
          </div>
          <div>
            <Insights />
            <h2>Understand your spend</h2>
            <p>View monthly and yearly subscription totals at a glance.</p>
          </div>
          <div>
            <Groups2 />
            <h2>Manage it together</h2>
            <p>Invite members with access that fits their role.</p>
          </div>
        </section>
      </main>
      <footer className="landing-footer">
        <span>© 2026 Subscript</span>
        <span>Simple subscription tracking for your workspace</span>
      </footer>
    </div>
  );
}
