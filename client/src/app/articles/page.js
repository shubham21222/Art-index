"use client";

import { useState, useEffect } from "react";
import { ApolloClient, InMemoryCache, gql } from "@apollo/client";
import { format } from "date-fns";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Skeleton } from "@/components/ui/skeleton";

// Apollo Client configuration
const client = new ApolloClient({
  uri: "https://metaphysics-cdn.artsy.net/v2",
  cache: new InMemoryCache(),
});

// GraphQL query to fetch the latest article
const ARTICLE_QUERY = gql`
query LatestArticleQuery {
  articles(limit: 1, sort: PUBLISHED_AT_DESC) {
    title
    href
    leadParagraph
    publishedAt
    sections {
      __typename
    }
    postscript
    relatedArticles {
      title
      href
      byline
      thumbnailImage {
        cropped(width: 300, height: 200) {
          src
          srcSet
        }
      }
    }
    internalID
    layout
    channelID
  }
}
`;

// Related Article Card Component
const RelatedArticleCard = ({ article }) => {
  return (
    <a 
      href={article.href} 
      className="block group rounded-lg overflow-hidden bg-white shadow-md hover:shadow-xl transition-shadow duration-300"
    >
      <div className="relative aspect-[3/2] overflow-hidden">
        {article.thumbnailImage?.cropped ? (
          <img
            src={article.thumbnailImage.cropped.src}
            srcSet={article.thumbnailImage.cropped.srcSet}
            alt={article.title}
            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400">No image</span>
          </div>
        )}
      </div>
      <div className="p-4">
        <h2 className="text-lg font-semibold line-clamp-2 group-hover:text-blue-600 transition-colors">
          {article.title}
        </h2>
        {article.byline && (
          <p className="text-gray-600 text-sm mt-2">{article.byline}</p>
        )}
      </div>
    </a>
  );
};

// Loading Skeleton Component
const ArticleSkeleton = () => (
  <div className="container mx-auto p-4 space-y-8">
    <Skeleton className="h-12 w-3/4" />
    <Skeleton className="h-6 w-48" />
    <Skeleton className="h-24 w-full" />
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="space-y-4">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ))}
    </div>
  </div>
);

// Main Article Component
export default function Article() {
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const { data } = await client.query({
          query: ARTICLE_QUERY,
        });

        // Extract the first article from the response
        const fetchedArticle = data?.articles?.edges?.[0]?.node;

        if (!fetchedArticle) {
          throw new Error("No articles found");
        }

        setArticle(fetchedArticle);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, []);

  if (loading) {
    return (
      <>
        <Header />
        <ArticleSkeleton />
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <div className="container mx-auto p-4 min-h-[50vh] flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              {error === "No articles found" ? "No Articles Available" : "Something went wrong"}
            </h2>
            <p className="text-gray-600 mb-6">
              {error === "No articles found"
                ? "There are no articles available at the moment."
                : "We're having trouble loading this article. Please try again later."}
            </p>
            <a
              href="/articles"
              className="inline-block px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              Back to Articles
            </a>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-8">
        <article className="max-w-4xl mx-auto">
          {/* Article Header */}
          <header className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {article.title}
            </h1>
            {article.publishedAt && (
              <time className="text-gray-600">
                {format(new Date(article.publishedAt), 'MMMM d, yyyy')}
              </time>
            )}
          </header>

          {/* Lead Paragraph */}
          {article.leadParagraph && (
            <div className="text-xl text-gray-700 mb-8 leading-relaxed">
              {article.leadParagraph}
            </div>
          )}

          {/* Postscript */}
          {article.postscript && (
            <div className="text-gray-700 mt-8 p-6 bg-gray-50 rounded-lg">
              {article.postscript}
            </div>
          )}

          {/* Related Articles */}
          {article.relatedArticles?.length > 0 && (
            <section className="mt-12 pt-8 border-t border-gray-200">
              <h2 className="text-2xl font-bold mb-6">Related Articles</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {article.relatedArticles.map((relatedArticle) => (
                  <RelatedArticleCard 
                    key={relatedArticle.href} 
                    article={relatedArticle} 
                  />
                ))}
              </div>
            </section>
          )}
        </article>
      </main>
      <Footer />
    </>
  );
}