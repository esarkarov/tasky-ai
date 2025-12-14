interface DashboardHeaderProps {
  title: string;
  description: string;
}

export const DashboardHeader = ({ title, description }: DashboardHeaderProps) => {
  return (
    <div>
      <h1 className="text-5xl font-bold mb-2 tracking-tight">{title}</h1>
      <p className="text-muted-foreground text-base">{description}</p>
    </div>
  );
};
