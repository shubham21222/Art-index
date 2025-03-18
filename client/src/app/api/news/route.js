import { NextResponse } from 'next/server';
import Parser from 'rss-parser';

const parser = new Parser();
const GOOGLE_NEWS_URL = 'https://news.google.com/rss/search?q=art+gallery+OR+contemporary+art+OR+art+exhibition&hl=en-US&gl=US&ceid=US:en';

export async function GET() {
  try {
    // Fetch and parse the RSS feed
    const feed = await parser.parseURL(GOOGLE_NEWS_URL);
    
    // Process and format the news items
    const articles = feed.items.slice(0, 8).map(item => ({
      category: "Art News",
      title: item.title.replace(/ - .*$/, ''), // Remove source from title
      link: item.link,
      pubDate: item.pubDate,
      source: item.source?.name || extractSource(item.title),
      description: item.contentSnippet || '',
    }));

    return NextResponse.json({ articles });
  } catch (error) {
    console.error('Error fetching news:', error);
    return NextResponse.json({ error: 'Failed to fetch news' }, { status: 500 });
  }
}

function extractSource(title) {
  const sourceMatch = title.match(/ - ([^-]+)$/);
  return sourceMatch ? sourceMatch[1].trim() : 'Art News';
} 