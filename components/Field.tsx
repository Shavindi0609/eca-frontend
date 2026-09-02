import type { ReactNode } from "react";

interface FieldProps {
  label: string;
  children: ReactNode;
}

export default function Field({ label, children }: FieldProps) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-muted mb-1">{label}</span>
      {children}
    </label>
  );
}
