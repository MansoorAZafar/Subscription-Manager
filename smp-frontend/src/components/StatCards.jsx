import {
  CalendarMonth,
  Check,
  CreditCard,
  Insights,
} from "@mui/icons-material";
import { useSmp } from "../app/SmpProvider.jsx";

const money = (value) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    value || 0,
  );
const daysTo = (date) =>
  Math.max(
    0,
    Math.ceil((new Date(`${date}T12:00:00`) - new Date()) / 86400000),
  );

export default function StatCards() {
  const { summary, items } = useSmp();
  const sampleMonthly = items.reduce(
    (sum, item) => sum + item.price * (item.cycle === "Yearly" ? 1 / 12 : 1),
    0,
  );
  const monthly = summary?.monthlySpend ?? sampleMonthly;
  const upcoming = summary?.upcomingPayments?.[0];
  const nextName = upcoming?.name || items[0]?.name;
  const nextDate = upcoming?.nextPaymentDate || items[0]?.date;
  const nextPrice = upcoming?.price ?? items[0]?.price ?? 0;
  const activeCount = summary?.activeSubscriptions ?? items.length;
  const categoryCount =
    summary?.activeCategories ??
    new Set(items.map((item) => item.category)).size;
  return (
    <div className="stats">
      <article className="stat-card">
        <div className="stat-head">
          MONTHLY SPEND{" "}
          <span className="stat-icon purple">
            <CreditCard />
          </span>
        </div>
        <div className="stat-value">
          {money(monthly)}
          <small>/mo</small>
        </div>
        <div className="stat-foot">
          <span className="trend">Steady</span>{" "}
          <span>equivalent monthly cost</span>
        </div>
      </article>
      <article className="stat-card">
        <div className="stat-head">
          YEARLY FORECAST{" "}
          <span className="stat-icon blue">
            <Insights />
          </span>
        </div>
        <div className="stat-value">
          {money(summary?.yearlyForecast ?? monthly * 12)}
        </div>
        <div className="stat-foot">
          <span className="muted-pill">Based on active subscriptions</span>
        </div>
      </article>
      <article className="stat-card">
        <div className="stat-head">
          ACTIVE SUBSCRIPTIONS{" "}
          <span className="stat-icon green">
            <Check />
          </span>
        </div>
        <div className="stat-value">
          {activeCount}
          <small> services</small>
        </div>
        <div className="stat-foot">
          <span>
            Across <b>{categoryCount} categories</b>
          </span>
        </div>
      </article>
      <article className="stat-card">
        <div className="stat-head">
          NEXT PAYMENT{" "}
          <span className="stat-icon orange">
            <CalendarMonth />
          </span>
        </div>
        <div className="stat-value">{money(nextPrice)}</div>
        <div className="stat-foot">
          <span className="next-date">
            {nextName && nextDate
              ? `${nextName} · in ${daysTo(nextDate)} days`
              : "Nothing scheduled"}
          </span>
        </div>
      </article>
    </div>
  );
}
