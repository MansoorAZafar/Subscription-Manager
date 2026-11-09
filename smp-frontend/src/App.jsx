import { lazy, Suspense, useState } from "react";
import {
  Alert,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Snackbar,
} from "@mui/material";
import { Add, ChevronRight, NotificationsNone } from "@mui/icons-material";
import StatCards from "./components/StatCards.jsx";
import UpcomingPayments from "./components/UpcomingPayments.jsx";
import SubscriptionTable from "./features/subscriptions/SubscriptionTable.jsx";
import SubscriptionDialog from "./features/subscriptions/SubscriptionDialog.jsx";
import MembersDialog from "./features/sharing/MembersDialog.jsx";
import EmptyDashboard from "./components/EmptyDashboard.jsx";
import LandingPage from "./components/LandingPage.jsx";
import { useSmp } from "./app/SmpProvider.jsx";

const SpendingChart = lazy(
  () => import("./features/analytics/SpendingChart.jsx"),
);

export default function App() {
  const state = useSmp();
  const { auth } = state;
  const [toastOpen, setToastOpen] = useState(false);
  if (auth.isLoading)
    return (
      <div className="auth-loading">
        <CircularProgress />
      </div>
    );
  if (!auth.isAuthenticated) return <LandingPage auth={auth} />;

  const {
    error,
    setError,
    notice,
    setNotice,
    setEditor,
    selectedWorkspace,
    workspaces,
    chooseWorkspace,
    setShareOpen,
    can,
    items,
  } = state;
  const startSubscription = () =>
    setEditor({
      date: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
      cycle: "Monthly",
      category: "Entertainment",
      active: true,
    });
  const userName =
    auth.user?.given_name || auth.user?.name?.split(" ")[0] || "there";
  const today = new Date()
    .toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    })
    .toUpperCase();

  return (
    <div className="shell">
      <main className="main">
        <header className="topbar">
          <div className="breadcrumbs">
            <span>Workspace</span>
            <ChevronRight />
            <b>Overview</b>
          </div>
          <div className="top-actions">
            <span className="updated">
              <i /> All changes saved
            </span>
            <span className="top-divider" />
            <Button
              startIcon={<NotificationsNone />}
              onClick={() => setToastOpen(true)}
            >
              Notifications
            </Button>
            <Button
              onClick={() =>
                auth.logout({
                  logoutParams: { returnTo: window.location.origin },
                })
              }
            >
              Sign out
            </Button>
          </div>
        </header>
        <div className="content">
          <div className="greeting">
            <div>
              <div className="eyebrow">{today}</div>
              <h1>
                Good{" "}
                {new Date().getHours() < 12
                  ? "morning"
                  : new Date().getHours() < 18
                    ? "afternoon"
                    : "evening"}
                , {userName} <span>✦</span>
              </h1>
              <p>Here’s what’s happening with your recurring payments.</p>
            </div>
            {can("create:subscriptions") && (
              <Button
                className="add-button"
                variant="contained"
                startIcon={<Add />}
                onClick={startSubscription}
              >
                Add subscription
              </Button>
            )}
          </div>
          <div className="workspace-toolbar">
            <div className="workspace-current">
              <div className="workspace-name-row">
                <b>{selectedWorkspace?.name || "Loading workspace…"}</b>
                {selectedWorkspace && (
                  <span
                    className={`workspace-type-badge ${selectedWorkspace.role === "OWNER" ? "is-owned" : "is-shared"}`}
                  >
                    {selectedWorkspace.role === "OWNER"
                      ? "My workspace"
                      : "Shared with me"}
                  </span>
                )}
              </div>
              <div className="workspace-meta">
                <span>{selectedWorkspace?.memberCount || 0} members</span>
                {selectedWorkspace?.role && (
                  <span className="workspace-role-badge">
                    {selectedWorkspace.role === "OWNER"
                      ? "Owner · Admin"
                      : `${selectedWorkspace.role[0]}${selectedWorkspace.role.slice(1).toLowerCase()} access`}
                  </span>
                )}
              </div>
            </div>
            <div className="workspace-actions">
              {workspaces.length > 1 && (
                <FormControl size="small" className="workspace-picker">
                  <InputLabel id="workspace-picker-label">
                    Switch workspace
                  </InputLabel>
                  <Select
                    labelId="workspace-picker-label"
                    label="Switch workspace"
                    value={selectedWorkspace?.id || ""}
                    onChange={(event) =>
                      chooseWorkspace(
                        workspaces.find(
                          (home) => home.id === Number(event.target.value),
                        ),
                      )
                    }
                  >
                    {workspaces.map((home) => (
                      <MenuItem value={home.id} key={home.id}>
                        <div className="workspace-option">
                          <span>
                            <b>{home.name}</b>
                            <small>
                              {home.role === "OWNER"
                                ? "Created by you"
                                : `Shared with you · ${home.role.toLowerCase()} access`}
                            </small>
                          </span>
                          <span
                            className={`workspace-option-tag ${home.role === "OWNER" ? "is-owned" : "is-shared"}`}
                          >
                            {home.role === "OWNER" ? "Mine" : "Shared"}
                          </span>
                        </div>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
              {can("view:members") && (
                <Button onClick={() => setShareOpen(true)}>Members</Button>
              )}
            </div>
          </div>
          {error && (
            <Alert severity="error" onClose={() => setError("")} sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          {state.loading && state.totalElements === 0 ? (
            <div className="workspace-loading">
              <CircularProgress size={24} />
              <span>Loading your workspace…</span>
            </div>
          ) : state.totalElements === 0 ? (
            <EmptyDashboard
              role={selectedWorkspace?.role}
              onAddSubscription={startSubscription}
              onInvite={() => setShareOpen(true)}
              canCreateSubscriptions={can("create:subscriptions")}
              canManageMembers={can("manage:members")}
            />
          ) : (
            <>
              <StatCards />
              <div className="dashboard-grid">
                <Suspense
                  fallback={
                    <section className="panel spend-panel">
                      <div className="empty-state">Loading analytics…</div>
                    </section>
                  }
                >
                  <SpendingChart
                    amount={
                      state.summary?.monthlySpend ??
                      items.reduce(
                        (sum, item) =>
                          sum +
                          item.price * (item.cycle === "Yearly" ? 1 / 12 : 1),
                        0,
                      )
                    }
                  />
                </Suspense>
                <UpcomingPayments />
              </div>
              <SubscriptionTable />
            </>
          )}
          <footer className="footer">
            <span>© 2026 Subscript. Made for a little more peace of mind.</span>
            <span>Secure workspace sharing</span>
          </footer>
        </div>
      </main>
      <SubscriptionDialog />
      <MembersDialog />
      <Snackbar
        open={toastOpen || Boolean(notice)}
        autoHideDuration={4500}
        onClose={() => {
          setToastOpen(false);
          setNotice("");
        }}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          severity="info"
          onClose={() => {
            setToastOpen(false);
            setNotice("");
          }}
          className="toast"
        >
          {notice || "You’re all caught up."}
        </Alert>
      </Snackbar>
    </div>
  );
}
