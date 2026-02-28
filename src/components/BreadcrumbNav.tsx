import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface BreadcrumbNavProps {
  items: BreadcrumbItem[];
}

export const BreadcrumbNav = ({ items }: BreadcrumbNavProps) => {
  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
        <li>
          <Link to="/" className="inline-flex items-center gap-1 hover:text-primary transition-colors">
            <Home className="h-3.5 w-3.5" />
            <span className="sr-only">Home</span>
          </Link>
        </li>
        {items.map((item, i) => (
          <li key={i} className="inline-flex items-center gap-1">
            <ChevronRight className="h-3 w-3 text-muted-foreground/50" />
            {item.path ? (
              <Link to={item.path} className="hover:text-primary transition-colors">
                {item.label}
              </Link>
            ) : (
              <span className="text-foreground font-medium">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};
