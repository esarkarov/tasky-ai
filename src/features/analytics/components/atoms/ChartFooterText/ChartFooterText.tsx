interface ChartFooterTextProps {
  text: string;
  className?: string;
}

export const ChartFooterText = ({ text, className = '' }: ChartFooterTextProps) => {
  return <div className={`leading-none text-muted-foreground ${className}`}>{text}</div>;
};
