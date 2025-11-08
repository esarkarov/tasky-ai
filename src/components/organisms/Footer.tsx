import { FooterNav } from '@/components/molecules/FooterNav/FooterNav';

export const Footer = () => {
  return (
    <footer
      className="px-4 pb-0 animate-fade-in opacity-0 [animation-delay:0.2s] [animation-fill-mode:forwards]"
      role="contentinfo">
      <div className="container flex min-h-20 flex-col items-center gap-4 rounded-t-2xl border border-b-0 border-white/20 bg-background/90 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] transition-all duration-300 hover:shadow-[0_12px_40px_rgba(0,0,0,0.16)] hover:bg-background/95 hover:border-white/30 lg:flex-row lg:justify-between lg:gap-6">
        <p
          className="text-center text-sm text-muted-foreground/80"
          aria-label="Copyright notice">
          &copy; All rights reserved.
        </p>
        <FooterNav />
      </div>
    </footer>
  );
};
