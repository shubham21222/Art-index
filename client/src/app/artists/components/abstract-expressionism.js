import Head from 'next/head';
import Image from 'next/image';

export default function AbstractExpressionism({ gene }) {
  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <Head>
        <title>{gene.name} - Art Movement</title>
        <meta name="description" content={gene.meta.description} />
        <meta property="og:image" content={gene.image.cropped.src} />
      </Head>

      {/* Header Section */}
      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900">{gene.displayName || gene.name}</h1>
        <p className="mt-4 text-lg text-gray-700">{gene.meta.description}</p>
      </header>

      {/* Featured Image */}
      <div className="mb-12">
        <Image
          src={gene.image.cropped.src}
          alt={`${gene.name} Art Movement`}
          width={1200}
          height={630}
          className="rounded-lg shadow-lg mx-auto"
        />
      </div>

      {/* Artists Section */}
      <section className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Artists of {gene.name}</h2>
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {gene.artistsConnection.edges.map(({ node }) => (
            <li key={node.internalID} className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-medium text-gray-900">{node.name}</h3>
              <a
                href={node.href}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-block text-blue-600 hover:text-blue-800"
              >
                View Artist Profile
              </a>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

// Fetch data for the page
export async function getStaticProps() {
  const query = `
    query geneRoutes_GeneShowQuery($slug: String!) @cacheable {
      gene(id: $slug) @principalField {
        ...GeneShow_gene
        id
      }
    }

    fragment GeneMeta_gene on Gene {
      name
      displayName
      href
      meta {
        description
      }
      image {
        cropped(width: 1200, height: 630) {
          src
        }
      }
    }

    fragment GeneShow_gene on Gene {
      ...GeneMeta_gene
      internalID
      name
      displayName
      formattedDescription: description(format: HTML)
      similar(first: 10) {
        edges {
          node {
            internalID
            name
            href
            id
          }
        }
      }
      artistsConnection(first: 10) {
        edges {
          node {
            internalID
            name
            href
            id
          }
        }
      }
    }
  `;

  const variables = { slug: "abstract-expressionism" };

  const response = await fetch("https://metaphysics-cdn.artsy.net/v2", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
  });

  const { data } = await response.json();

  return {
    props: {
      gene: data.gene,
    },
  };
}