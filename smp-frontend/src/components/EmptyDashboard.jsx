import { Button } from "@mui/material";
import { Add, GroupAdd, ReceiptLong } from "@mui/icons-material";

export default function EmptyDashboard({
  role,
  onAddSubscription,
  onInvite,
  canCreateSubscriptions,
  canManageMembers,
}) {
  const isOwner = role === "OWNER";
  const isViewer = role === "VIEWER";
  return (
    <section className="empty-dashboard">
      <div className="empty-dashboard-icon">
        <ReceiptLong />
      </div>
      <span className="eyebrow">
        {isOwner ? "YOUR WORKSPACE IS READY" : "SHARED WORKSPACE"}
      </span>
      <h2>
        {isViewer
          ? "This workspace is empty."
          : "Your subscriptions will live here."}
      </h2>
      <p>
        {isOwner
          ? "Add your first recurring payment to start tracking renewals and workspace spending. You can also invite people to manage this collection with you."
          : isViewer
            ? "You have Viewer access. The workspace owner or an editor can add subscriptions and invite members."
            : "This workspace has no subscriptions yet. Add the first recurring payment to get tracking started."}
      </p>
      {(canCreateSubscriptions || canManageMembers) && (
        <div className="empty-dashboard-actions">
          {canCreateSubscriptions && (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={onAddSubscription}
            >
              Add your first subscription
            </Button>
          )}
          {canManageMembers && (
            <Button
              variant="outlined"
              startIcon={<GroupAdd />}
              onClick={onInvite}
            >
              Invite members
            </Button>
          )}
        </div>
      )}
      {isOwner ? (
        <div className="empty-dashboard-owner">
          <GroupAdd />
          <span>
            You’re the <b>workspace owner and admin</b>. You can invite members
            and choose their access.
          </span>
        </div>
      ) : isViewer ? (
        <div className="empty-dashboard-owner viewer-access-note">
          <ReceiptLong />
          <span>
            You’re viewing this workspace as a <b>Viewer</b>. Contact an owner
            if you need more access.
          </span>
        </div>
      ) : (
        <div className="empty-dashboard-owner">
          <GroupAdd />
          <span>
            You can manage subscriptions here. <b>Workspace owners</b> manage
            member access.
          </span>
        </div>
      )}
    </section>
  );
}
