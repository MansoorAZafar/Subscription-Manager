import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { createApiClient } from "../api/apiClient.js";

const SmpContext = createContext(null);
const searchParams = () => new URLSearchParams(window.location.search);
const toView = (row) => ({
  ...row,
  date: row.nextPaymentDate,
  status: row.active ? "Active" : "Paused",
  color: "#7167f8",
  icon: (row.name || "?")[0].toUpperCase(),
});

export function SmpProvider({ children }) {
  const auth = useAuth0();
  const apiUrl = import.meta.env.VITE_API_URL;
  const api = useMemo(
    () => createApiClient(apiUrl, auth.getAccessTokenSilently),
    [apiUrl, auth.getAccessTokenSilently],
  );
  const [workspaces, setWorkspaces] = useState([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState(null);
  const [members, setMembers] = useState([]);
  const [items, setItems] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filter, setFilter] = useState("All subscriptions");
  const [categories, setCategories] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [editor, setEditor] = useState(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [inviteUrl, setInviteUrl] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const timer = window.setTimeout(
      () => setDebouncedSearch(search.trim()),
      250,
    );
    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    if (auth.isAuthenticated) return;
    setWorkspaces([]);
    setSelectedWorkspace(null);
    setMembers([]);
    setItems([]);
    setTotalElements(0);
    setTotalPages(0);
    setPage(0);
    setSummary(null);
    setCategories([]);
    setError("");
  }, [auth.isAuthenticated]);

  useEffect(() => {
    if (!auth.isAuthenticated || !apiUrl) return;
    let cancelled = false;
    async function loadWorkspaces() {
      try {
        let acceptedId;
        const inviteToken = searchParams().get("invite");
        if (inviteToken) {
          const accepted = await api.post("/household-invitations/accept", {
            token: inviteToken,
          });
          acceptedId = accepted.id;
          window.history.replaceState({}, "", window.location.pathname);
          if (!cancelled) setNotice("You joined the shared workspace.");
        }
        const list = await api.get("/households");
        const active =
          list.find((home) => home.id === acceptedId) || list[0] || null;
        if (!cancelled) {
          setWorkspaces(list);
          setSelectedWorkspace(active);
          setPage(0);
        }
      } catch (cause) {
        if (!cancelled)
          setError(`Could not load your workspaces: ${cause.message}`);
      }
    }
    loadWorkspaces();
    return () => {
      cancelled = true;
    };
  }, [api, apiUrl, auth.isAuthenticated]);

  useEffect(() => {
    if (!auth.isAuthenticated || !apiUrl || !selectedWorkspace) return;
    let cancelled = false;
    async function loadWorkspace() {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          householdId: selectedWorkspace.id,
          page,
          size: 25,
        });
        if (debouncedSearch) params.set("search", debouncedSearch);
        if (filter !== "All subscriptions") params.set("category", filter);
        const [subscriptionPage, memberRows, availableCategories, analytics] =
          await Promise.all([
            api.get(`/subscriptions?${params}`),
            api.get(`/households/${selectedWorkspace.id}/members`),
            api.get(
              `/subscriptions/categories?householdId=${selectedWorkspace.id}`,
            ),
            api.get(`/analytics/summary?householdId=${selectedWorkspace.id}`),
          ]);
        if (cancelled) return;
        setItems(subscriptionPage.content.map(toView));
        setTotalElements(subscriptionPage.totalElements);
        setTotalPages(subscriptionPage.totalPages);
        setMembers(memberRows);
        setCategories(availableCategories);
        setSummary(analytics);
        setError("");
        if (
          subscriptionPage.totalPages > 0 &&
          page >= subscriptionPage.totalPages
        )
          setPage(subscriptionPage.totalPages - 1);
      } catch (cause) {
        if (!cancelled)
          setError(`Could not load this workspace: ${cause.message}`);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadWorkspace();
    return () => {
      cancelled = true;
    };
  }, [
    api,
    apiUrl,
    auth.isAuthenticated,
    selectedWorkspace,
    page,
    debouncedSearch,
    filter,
    refreshKey,
  ]);

  const can = useCallback(
    (permission) => {
      return Boolean(
        auth.isAuthenticated &&
        selectedWorkspace?.permissions?.includes(permission),
      );
    },
    [auth.isAuthenticated, selectedWorkspace],
  );
  const chooseWorkspace = useCallback((home) => {
    setSelectedWorkspace(home);
    setPage(0);
    setFilter("All subscriptions");
    setItems([]);
    setMembers([]);
    setSummary(null);
  }, []);

  const saveSubscription = useCallback(
    async (input) => {
      try {
        if (!auth.isAuthenticated || !selectedWorkspace)
          throw new Error(
            "Sign in and select a workspace before adding subscriptions.",
          );
        const body = {
          name: input.name,
          plan: input.plan,
          category: input.category,
          price: Number(input.price),
          cycle: input.cycle,
          nextPaymentDate: input.date,
          active: input.active ?? true,
        };
        const suffix = editor?.id
          ? `/${editor.id}`
          : `?householdId=${selectedWorkspace.id}`;
        if (editor?.id) await api.put(`/subscriptions${suffix}`, body);
        else await api.post(`/subscriptions${suffix}`, body);
        setPage(0);
        setRefreshKey((value) => value + 1);
        setEditor(null);
        setNotice("Subscription saved.");
        setError("");
      } catch (cause) {
        setError(cause.message);
      }
    },
    [api, auth.isAuthenticated, editor, selectedWorkspace],
  );

  const deleteSubscription = useCallback(
    async (item) => {
      try {
        if (!auth.isAuthenticated)
          throw new Error("Sign in before changing subscriptions.");
        await api.delete(`/subscriptions/${item.id}`);
        setRefreshKey((value) => value + 1);
        setError("");
      } catch (cause) {
        setError(cause.message);
      }
    },
    [api, auth.isAuthenticated],
  );

  const inviteMember = useCallback(
    async (email, role) => {
      setInviteUrl("");
      try {
        const result = await api.post(
          `/households/${selectedWorkspace.id}/invitations`,
          { email, role },
        );
        setInviteUrl(result.inviteUrl);
        setNotice(
          `One-time invite link created for ${email}. Copy it to share.`,
        );
        setError("");
        return true;
      } catch (cause) {
        setError(cause.message);
        return false;
      }
    },
    [api, selectedWorkspace],
  );

  const updateMemberRole = useCallback(
    async (member, role) => {
      try {
        await api.put(
          `/households/${selectedWorkspace.id}/members/${member.id}/role`,
          { role },
        );
        setMembers((current) =>
          current.map((row) => (row.id === member.id ? { ...row, role } : row)),
        );
      } catch (cause) {
        setError(cause.message);
      }
    },
    [api, selectedWorkspace],
  );

  const removeMember = useCallback(
    async (member) => {
      try {
        await api.delete(
          `/households/${selectedWorkspace.id}/members/${member.id}`,
        );
        setMembers((current) => current.filter((row) => row.id !== member.id));
        setWorkspaces((current) =>
          current.map((home) =>
            home.id === selectedWorkspace.id
              ? { ...home, memberCount: Math.max(1, home.memberCount - 1) }
              : home,
          ),
        );
      } catch (cause) {
        setError(cause.message);
      }
    },
    [api, selectedWorkspace],
  );

  const value = useMemo(
    () => ({
      auth,
      workspaces,
      selectedWorkspace,
      chooseWorkspace,
      members,
      items,
      totalElements,
      totalPages,
      page,
      setPage,
      search,
      setSearch,
      filter,
      setFilter,
      categories,
      summary,
      loading,
      error,
      setError,
      notice,
      setNotice,
      editor,
      setEditor,
      shareOpen,
      setShareOpen,
      inviteUrl,
      can,
      saveSubscription,
      deleteSubscription,
      inviteMember,
      updateMemberRole,
      removeMember,
    }),
    [
      auth,
      workspaces,
      selectedWorkspace,
      chooseWorkspace,
      members,
      items,
      totalElements,
      totalPages,
      page,
      search,
      filter,
      categories,
      summary,
      loading,
      error,
      notice,
      editor,
      shareOpen,
      inviteUrl,
      can,
      saveSubscription,
      deleteSubscription,
      inviteMember,
      updateMemberRole,
      removeMember,
    ],
  );

  return <SmpContext.Provider value={value}>{children}</SmpContext.Provider>;
}

export function useSmp() {
  const context = useContext(SmpContext);
  if (!context) throw new Error("useSmp must be used inside SmpProvider");
  return context;
}
