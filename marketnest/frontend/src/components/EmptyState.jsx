export default function EmptyState({ icon: Icon, title, text, action }) {
  return (
    <div className="empty-state">
      {Icon && (
        <span className="empty-icon"><Icon size={26} /></span>
      )}
      <h3>{title}</h3>
      {text && <p>{text}</p>}
      {action}
    </div>
  );
}
