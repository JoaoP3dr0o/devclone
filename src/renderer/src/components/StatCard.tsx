type StatCardProps = {
  label: string
  value: string
}

function StatCard({ label, value }: StatCardProps): React.JSX.Element {
  return (
    <div
      style={{
        border: '1px solid rgba(148, 163, 184, 0.16)',
        borderRadius: 18,
        padding: 18,
        background: 'rgba(15, 23, 42, 0.72)'
      }}
    >
      <div style={{ color: '#94a3b8', fontSize: 13 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 800, marginTop: 8 }}>{value}</div>
    </div>
  )
}

export default StatCard
