interface Props {
  value: number; // 0-100
  color?: string;
  trackColor?: string;
  height?: number;
}

export default function ProgressBar({
  value,
  color = "var(--ganzy-orange)",
  trackColor = "var(--stone-border)",
  height = 8,
}: Props) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div
      className="w-full rounded-full overflow-hidden"
      style={{ height, background: trackColor }}
    >
      <div
        className="h-full rounded-full transition-[width] duration-500"
        style={{ width: `${pct}%`, background: color }}
      />
    </div>
  );
}
