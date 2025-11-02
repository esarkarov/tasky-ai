import { FooterNavLink } from '@/components/atoms/FooterNavLink/FooterNavLink';
import { SOCIAL_LINKS } from '@/constants/app-links';

export const FooterNav = () => {
  return (
    <nav aria-label="Social media links">
      <ul className="flex flex-wrap items-center">
        {SOCIAL_LINKS.map((link, index) => (
          <FooterNavLink
            key={link.href}
            link={link}
            index={index}
          />
        ))}
      </ul>
    </nav>
  );
};
