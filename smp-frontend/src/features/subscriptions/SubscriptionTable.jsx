import { useMemo } from "react";
import { Chip, IconButton, TextField } from "@mui/material";
import {
  ChevronLeft,
  ChevronRight,
  DeleteOutline,
  EditOutlined,
  Search,
} from "@mui/icons-material";
import { useSmp } from "../../app/SmpProvider.jsx";

const money = (value) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    value || 0,
  );

export default function SubscriptionTable() {
  const {
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
    loading,
    can,
    setEditor,
    deleteSubscription,
  } = useSmp();
  const filters = useMemo(
    () => ["All subscriptions", ...categories],
    [categories],
  );
  return (
    <section className="panel subscriptions-panel">
      <div className="panel-heading sub-heading">
        <div>
          <h2>
            Subscriptions <span className="sub-count">{totalElements}</span>
          </h2>
          <p>Manage this workspace’s recurring payments</p>
        </div>
      </div>
      <div className="table-controls">
        <div className="filters">
          {filters.map((category) => (
            <button
              key={category}
              className={`filter-chip ${filter === category ? "selected" : ""}`}
              onClick={() => {
                setPage(0);
                setFilter(category);
              }}
            >
              {category}
            </button>
          ))}
        </div>
        <TextField
          size="small"
          placeholder="Search subscriptions..."
          value={search}
          onChange={(event) => {
            setPage(0);
            setSearch(event.target.value);
          }}
          InputProps={{
            startAdornment: (
              <Search sx={{ mr: 1, color: "#999daa", fontSize: 19 }} />
            ),
          }}
          className="search-field"
        />
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>SUBSCRIPTION</th>
              <th>CATEGORY</th>
              <th>BILLING CYCLE</th>
              <th>NEXT PAYMENT</th>
              <th>AMOUNT</th>
              <th>STATUS</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>
                  <div className="service-cell">
                    <div
                      className="app-icon small-app"
                      style={{ background: item.color }}
                    >
                      {item.icon}
                    </div>
                    <div>
                      <b>{item.name}</b>
                      <small>{item.plan}</small>
                    </div>
                  </div>
                </td>
                <td>
                  <span className="category-tag">{item.category}</span>
                </td>
                <td>{item.cycle}</td>
                <td>
                  {new Date(`${item.date}T12:00:00`).toLocaleDateString(
                    "en-US",
                    { month: "short", day: "numeric", year: "numeric" },
                  )}
                </td>
                <td className="amount-cell">
                  {money(item.price)}
                  <small> / {item.cycle === "Yearly" ? "yr" : "mo"}</small>
                </td>
                <td>
                  <Chip
                    size="small"
                    label={item.status}
                    className="status-chip"
                  />
                </td>
                <td>
                  {can("update:subscriptions") && (
                    <IconButton
                      size="small"
                      aria-label="Edit subscription"
                      onClick={() => setEditor(item)}
                    >
                      <EditOutlined fontSize="small" />
                    </IconButton>
                  )}
                  {can("delete:subscriptions") && (
                    <IconButton
                      size="small"
                      aria-label="Delete subscription"
                      onClick={() => deleteSubscription(item)}
                    >
                      <DeleteOutline fontSize="small" />
                    </IconButton>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {loading ? (
          <div className="empty-state">Loading subscriptions…</div>
        ) : (
          items.length === 0 && (
            <div className="empty-state">
              No subscriptions match your search.
            </div>
          )
        )}
      </div>
      <div className="table-footer">
        Showing{" "}
        <b>
          {items.length ? page * 25 + 1 : 0}–{page * 25 + items.length}
        </b>{" "}
        of <b>{totalElements}</b> subscriptions{" "}
        <div className="pager">
          <button
            aria-label="Previous page"
            disabled={page === 0}
            onClick={() => setPage((current) => Math.max(0, current - 1))}
          >
            <ChevronLeft fontSize="small" />
          </button>
          <span>
            {page + 1} / {Math.max(totalPages, 1)}
          </span>
          <button
            aria-label="Next page"
            disabled={page + 1 >= totalPages}
            onClick={() => setPage((current) => current + 1)}
          >
            <ChevronRight fontSize="small" />
          </button>
        </div>
      </div>
    </section>
  );
}
