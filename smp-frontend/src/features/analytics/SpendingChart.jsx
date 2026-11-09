import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export default function SpendingChart({ amount }) {
  const history = Array.from({ length: 6 }, (_, index) => {
    const now = new Date();
    const date = new Date(now.getFullYear(), now.getMonth() + index, 1);
    return {
      month: date.toLocaleDateString("en-US", { month: "short" }),
      value: Number(amount || 0),
    };
  });
  return (
    <section className="panel spend-panel">
      <div className="panel-heading">
        <div>
          <h2>Spending overview</h2>
          <p>Flat cost projection if your subscriptions stay active</p>
        </div>
        <span className="select-button">Next 6 months</span>
      </div>
      <div className="chart-legend">
        <i /> Monthly equivalent{" "}
        <span className="chart-amount">
          ${Number(amount || 0).toFixed(2)}
          <small> per month</small>
        </span>
      </div>
      <div className="chart">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={history}
            margin={{ left: -22, right: 8, top: 12, bottom: 0 }}
          >
            <defs>
              <linearGradient id="lavender" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#796df6" stopOpacity={0.18} />
                <stop offset="100%" stopColor="#796df6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="#eff0f4" />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#9699a6", fontSize: 11 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#9699a6", fontSize: 11 }}
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip
              formatter={(value) => [`$${value}`, "Monthly equivalent"]}
              contentStyle={{
                border: "1px solid #eeeef2",
                borderRadius: 10,
                boxShadow: "0 6px 20px #1e23300c",
              }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#796df6"
              strokeWidth={2.5}
              fill="url(#lavender)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
