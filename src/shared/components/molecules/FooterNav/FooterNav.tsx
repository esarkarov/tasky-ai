import { FooterNavLink } from '@/shared/components/atoms/FooterNavLink/FooterNavLink';

const SOCIAL_LINKS = [
  {
    href: 'https://linkedin.com/in/elvinsarkarov',
    label: 'LinkedIn',
  },
  {
    href: 'https://github.com/esarkarov',
    label: 'GitHub',
  },
];

export const FooterNav = () => {
  return (
    <nav aria-label="Social media links">
      <ul className="flex flex-wrap items-center">
        {SOCIAL_LINKS.map((link, index) => (
          <FooterNavLink
            key={link.label}
            link={link}
            isLast={index === SOCIAL_LINKS.length - 1}
          />
        ))}
      </ul>
    </nav>
  );
};
