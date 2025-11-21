'use client';
import { Head } from '@/shared/components/atoms/Head/Head';
import { Button } from '@/shared/components/ui/button';
import { ROUTES } from '@/shared/constants';
import { useAuth } from '@clerk/clerk-react';
import { Link } from 'react-router';

export const HomePage = () => {
  const { isSignedIn } = useAuth();

  return (
    <>
      <Head title="Tasky AI | AI-Powered Task Management App" />

      <section
        className="py-14"
        role="main"
        aria-labelledby="homepage-heading">
        <div className="container px-6 md:px-10 grid grid-cols-1 gap-16 items-center xl:gap-20 xl:grid-cols-[1fr_1.5fr]">
          <div className="flex flex-col items-center text-center space-y-8 lg:text-left lg:items-start lg:space-y-10">
            <h1
              id="homepage-heading"
              className="text-balance text-5xl font-bold leading-[1.1] tracking-tight max-w-[20ch] md:text-6xl lg:text-7xl xl:text-6xl animate-[fade-in-up_0.8s_ease-out]">
              Simplify Your Work and Life with{' '}
              <span className="inline-flex bg-gradient-to-r from-primary via-[#ea580c] to-primary bg-clip-text text-transparent font-extrabold drop-shadow-[0_0_24px_rgba(251,146,60,0.3)]">
                AI-Powered
              </span>{' '}
              Task Management.
            </h1>

            <p
              className="text-pretty max-w-[50ch] text-lg leading-relaxed text-muted-foreground/90 md:text-xl lg:text-2xl animate-[fade-in-up_0.8s_ease-out_0.2s_both]"
              aria-label="App description">
              Simplify life for both you and your team with the AI powered task manager and to-do list app.
            </p>

            <div
              className="mt-6 flex gap-4 justify-center lg:justify-start animate-[fade-in-up_0.8s_ease-out_0.4s_both]"
              role="group"
              aria-label="Primary actions">
              {isSignedIn ? (
                <Button
                  asChild
                  size="lg"
                  className="h-12 px-10 text-lg font-semibold shadow-[0_8px_30px_rgba(251,146,60,0.4)] transition-all duration-300">
                  <Link
                    to={ROUTES.TODAY}
                    aria-label="Go to your dashboard">
                    Go to Dashboard
                  </Link>
                </Button>
              ) : (
                <Button
                  asChild
                  size="lg"
                  className="h-12 px-10 text-lg font-semibold shadow-[0_8px_30px_rgba(251,146,60,0.4)] transition-all duration-300">
                  <Link
                    to={ROUTES.REGISTER}
                    aria-label="Create your Tasky AI account">
                    Get Started
                  </Link>
                </Button>
              )}
            </div>
          </div>

          <figure className="relative group perspective-[2000px] animate-[slide-in-right_1s_ease-out_0.3s_both]">
            <div
              className="absolute -inset-8 bg-gradient-to-br from-primary/30 via-orange-500/20 to-primary/30 rounded-[3rem] blur-3xl opacity-60 group-hover:opacity-80 transition-all duration-700 animate-[glow-pulse_4s_ease-in-out_infinite]"
              aria-hidden="true"
            />
            <div
              className="absolute -inset-4 bg-gradient-to-tr from-primary/20 to-orange-400/20 rounded-[2.5rem] blur-2xl opacity-40 group-hover:opacity-60 transition-all duration-500"
              aria-hidden="true"
            />
            <div className="relative bg-gradient-to-br from-secondary/60 to-secondary/40 backdrop-blur-md rounded-[2rem] overflow-hidden aspect-square max-md:max-w-[520px] max-md:mx-auto md:aspect-video shadow-[0_20px_60px_rgba(0,0,0,0.3),0_0_0_1px_rgba(255,255,255,0.1)] ring-1 ring-white/10 transition-all duration-700 group-hover:scale-[1.03] group-hover:rotate-y-2 group-hover:shadow-[0_30px_80px_rgba(251,146,60,0.3),0_0_0_1px_rgba(255,255,255,0.15)]">
              <div
                className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                aria-hidden="true"
              />
              <img
                src="/banner/hero-banner-sm.png"
                width={520}
                height={520}
                alt="Illustration of Tasky AI app interface on mobile"
                className="md:hidden w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <img
                src="/banner/hero-banner-lg.png"
                width={1000}
                height={562}
                alt="Illustration of Tasky AI app interface on desktop"
                className="max-md:hidden w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
          </figure>
        </div>
      </section>
    </>
  );
};
