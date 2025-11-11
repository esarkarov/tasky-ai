import { memo } from 'react';
import { Helmet } from 'react-helmet';

interface HeadProps {
  title: string;
  description?: string;
  keywords?: string[];
}

export const Head = memo(({ title, description, keywords }: HeadProps) => {
  return (
    <Helmet>
      <title>{title}</title>
      {description && (
        <meta
          name="description"
          content={description}
        />
      )}
      {keywords && keywords.length > 0 && (
        <meta
          name="keywords"
          content={keywords.join(', ')}
        />
      )}

      <meta
        name="viewport"
        content="width=device-width, initial-scale=1"
      />
      <meta charSet="utf-8" />
    </Helmet>
  );
});

Head.displayName = 'Head';
