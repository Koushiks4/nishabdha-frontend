import { Helmet } from 'react-helmet-async';

interface SchemaOrgProps {
  type: 'Organization' | 'Product' | 'BreadcrumbList';
  data: any;
}

export default function SchemaOrg({ type, data }: SchemaOrgProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": type,
    ...data
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
}
