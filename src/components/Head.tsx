import { Helmet } from 'react-helmet';

type HeadProps = {
  title: string;
};

export const Head = ({ title }: HeadProps) => {
  return (
    <Helmet>
      <title>{title}</title>
    </Helmet>
  );
};
