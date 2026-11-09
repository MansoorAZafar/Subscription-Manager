import { useState } from "react";
import { Avatar, Button, IconButton, MenuItem, TextField } from "@mui/material";
import {
  Close,
  ContentCopy,
  GroupAdd,
  PersonRemove,
} from "@mui/icons-material";
import { useSmp } from "../../app/SmpProvider.jsx";

export default function MembersDialog() {
  const {
    shareOpen,
    setShareOpen,
    members,
    inviteMember,
    inviteUrl,
    updateMemberRole,
    removeMember,
    can,
  } = useSmp();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("VIEWER");
  const [busy, setBusy] = useState(false);
  if (!shareOpen) return null;
  const submitInvite = async (event) => {
    event.preventDefault();
    setBusy(true);
    const sent = await inviteMember(email, role);
    if (sent) setEmail("");
    setBusy(false);
  };
  return (
    <div className="modal-backdrop" onClick={() => setShareOpen(false)}>
      <section
        className="modal members-modal"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-title">
          <div>
            <h2>Members</h2>
            <p>Manage who can access this workspace.</p>
          </div>
          <IconButton onClick={() => setShareOpen(false)} aria-label="Close">
            <Close />
          </IconButton>
        </div>
        <div className="member-list">
          {members.map((member) => (
            <div className="member-row" key={member.id}>
              <Avatar
                sx={{
                  width: 34,
                  height: 34,
                  bgcolor: member.role === "OWNER" ? "#e6e4ff" : "#eef3f8",
                  color: "#675cf6",
                  fontSize: 11,
                }}
              >
                {(member.name || member.email || "?").slice(0, 1).toUpperCase()}
              </Avatar>
              <div className="member-identity">
                <b>{member.name || member.email || "Workspace member"}</b>
                <small>{member.email || "Verified workspace member"}</small>
              </div>
              {member.role === "OWNER" ? (
                <span className="role-badge">Owner · Admin</span>
              ) : can("manage:members") ? (
                <>
                  <TextField
                    size="small"
                    select
                    value={member.role}
                    onChange={(event) =>
                      updateMemberRole(member, event.target.value)
                    }
                    className="role-select"
                  >
                    <MenuItem value="EDITOR">Editor</MenuItem>
                    <MenuItem value="VIEWER">Viewer</MenuItem>
                  </TextField>
                  <IconButton
                    size="small"
                    onClick={() => removeMember(member)}
                    aria-label="Remove member"
                  >
                    <PersonRemove fontSize="small" />
                  </IconButton>
                </>
              ) : (
                <span className="role-badge">{member.role.toLowerCase()}</span>
              )}
            </div>
          ))}
        </div>
        {can("manage:members") && (
          <form className="invite-form" onSubmit={submitInvite}>
            <h3>Invite someone</h3>
            <TextField
              label="Email address"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              fullWidth
            />
            <div className="invite-controls">
              <TextField
                label="Access level"
                select
                value={role}
                onChange={(event) => setRole(event.target.value)}
              >
                <MenuItem value="VIEWER">Viewer · view subscriptions</MenuItem>
                <MenuItem value="EDITOR">
                  Editor · manage subscriptions
                </MenuItem>
              </TextField>
              <Button
                type="submit"
                variant="contained"
                startIcon={<GroupAdd />}
                disabled={busy}
              >
                {busy ? "Creating…" : "Create invite link"}
              </Button>
            </div>
            {inviteUrl && (
              <>
                <div className="invite-link">
                  <span>{inviteUrl}</span>
                  <IconButton
                    onClick={async () => {
                      await navigator.clipboard.writeText(inviteUrl);
                    }}
                    aria-label="Copy invitation link"
                  >
                    <ContentCopy fontSize="small" />
                  </IconButton>
                </div>
                <small className="invite-link-help">
                  One-time link · expires in 7 days · recipient must sign in
                  with this email
                </small>
              </>
            )}
          </form>
        )}
        <div className="role-help">
          <b>Owner / Admin</b> manages access · <b>Editor</b> manages
          subscriptions · <b>Viewer</b> can view only
        </div>
      </section>
    </div>
  );
}
