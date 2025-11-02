export const Logo = () => {
  return (
    <div
      className="flex items-center gap-3 font-semibold text-lg"
      aria-label="Tasky AI">
      <img
        src="/logo/logo.svg"
        alt="Tasky AI"
        className="w-6 h-6"
        aria-hidden="true"
      />
      <span>Tasky AI</span>
    </div>
  );
};
