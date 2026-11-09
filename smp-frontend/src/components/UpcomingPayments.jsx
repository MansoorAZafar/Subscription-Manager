import { useSmp } from '../app/SmpProvider.jsx'

const money = (value) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value || 0)
const daysTo = (date) => Math.max(0, Math.ceil((new Date(`${date}T12:00:00`) - new Date()) / 86400000))

export default function UpcomingPayments() {
  const { summary, items } = useSmp()
  const upcoming = summary?.upcomingPayments?.length ? summary.upcomingPayments.map((row) => ({ ...row, date: row.nextPaymentDate, icon: row.name[0].toUpperCase(), color: '#7167f8' })) : items.slice(0, 3)
  return <section className="panel upcoming-panel"><div className="panel-heading"><div><h2>Coming up</h2><p>Your next renewals</p></div></div>
    <div className="upcoming-list">{upcoming.map((item) => <div className="upcoming-row" key={item.id}><div className="app-icon" style={{ background: item.color }}>{item.icon}</div><div className="upcoming-name"><b>{item.name}</b><small>{new Date(`${item.date}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</small></div><div className="upcoming-cost"><b>{money(item.price)}</b><small>in {daysTo(item.date)} days</small></div></div>)}{!upcoming.length && <div className="empty-mini">No renewals yet</div>}</div>
  </section>
}
