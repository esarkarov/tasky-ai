import { Helmet } from 'react-helmet';

type HeadProps = {
  title: string;
};

const Head = ({ title }: HeadProps) => {
  return (
    <Helmet>
      <title>{title}</title>
    </Helmet>
  );
};

export default Head;
