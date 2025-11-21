import { Separator } from '@/shared/components/ui/separator';

interface NavLink {
  href: string;
  label: string;
}
interface FooterNavLinkProps {
  link: NavLink;
  isLast: boolean;
}

export const FooterNavLink = ({ link, isLast }: FooterNavLinkProps) => {
  return (
    <li className="flex items-center">
      <a
        href={link.href}
        className="text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground"
        target="_blank"
        rel="noopener noreferrer"
        aria-label={link.label}>
        {link.label}
      </a>
      {!isLast && (
        <Separator
          orientation="vertical"
          className="h-3 mx-3"
          aria-hidden="true"
          role="presentation"
        />
      )}
    </li>
  );
};
