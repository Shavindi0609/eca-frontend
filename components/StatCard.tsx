interface StatCardProps {
  label: string;
  value: number | string;
  hint?: string;
}

export default function StatCard({ label, value, hint }: StatCardProps) {
  return (
    <div className="card p-5 hover:shadow-lg hover:shadow-ink/5 transition-shadow">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</p>
      <p className="text-3xl font-extrabold mt-2 text-ink">{value}</p>
      {hint && <p className="text-xs text-muted mt-1">{hint}</p>}
    </div>
  );
}
