import { Helmet } from 'react-helmet';

interface HeadProps {
  title: string;
}

export const Head = ({ title }: HeadProps) => {
  return (
    <Helmet>
      <title>{title}</title>
    </Helmet>
  );
};
