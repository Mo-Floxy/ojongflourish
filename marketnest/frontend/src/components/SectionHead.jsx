import { Link } from "react-router-dom";

export default function SectionHead({ eyebrow, title, text, linkTo, linkLabel = "View all" }) {
  return (
    <div className="section-head">
      <div>
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h2>{title}</h2>
        {text && <p>{text}</p>}
      </div>
      {linkTo && <Link className="link-arrow" to={linkTo}>{linkLabel}</Link>}
    </div>
  );
}
