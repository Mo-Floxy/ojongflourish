import { ArrowRight } from "lucide-react";

export default function SectionHead({ eyebrow, title, subtitle, action, onAction, children }) {
  return (
    <div className="section-head">
      <div className="section-head__copy">
        <div className="section-head__title-row">
          {eyebrow}
          <h2 className="section-title">{title}</h2>
        </div>
        {subtitle && <p className="section-sub">{subtitle}</p>}
      </div>
      <div className="section-head__side">
        {children}
        {action && (
          <button type="button" className="see-all" onClick={onAction}>
            {action}
            <ArrowRight size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
