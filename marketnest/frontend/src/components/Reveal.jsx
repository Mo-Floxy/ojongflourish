export default function Reveal({ children, className = "", delay = 0 }) {
  return (
    <div className={`reveal ${className}`.trim()} style={{ animationDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}
