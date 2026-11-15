import { Link } from "react-router-dom";

// No admin.notFound.* keys exist yet in @mercato/i18n — see task summary for the gap list.
export function NotFoundPage() {
  return (
    <div className="state-block">
      <div className="state-title">Page not found</div>
      <p className="state-desc">The page you're looking for doesn't exist.</p>
      <Link to="/catalog" className="btn btn-secondary">
        Back to catalog
      </Link>
    </div>
  );
}
