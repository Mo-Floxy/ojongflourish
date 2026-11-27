import { Minus, Plus } from "lucide-react";

export default function QtyStepper({ value = 1, min = 1, max = 99, onChange, disabled = false }) {
  return (
    <div className="qty-stepper">
      <button
        type="button"
        aria-label="Decrease quantity"
        disabled={disabled || value <= min}
        onClick={() => onChange(Math.max(min, value - 1))}
      >
        <Minus size={14} />
      </button>
      <span>{value}</span>
      <button
        type="button"
        aria-label="Increase quantity"
        disabled={disabled || value >= max}
        onClick={() => onChange(Math.min(max, value + 1))}
      >
        <Plus size={14} />
      </button>
    </div>
  );
}
