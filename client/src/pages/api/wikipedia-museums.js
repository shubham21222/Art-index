import axios from 'axios';
import * as cheerio from 'cheerio';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { country, category } = req.query;
    
    // Wikipedia URLs for museum lists
    const wikipediaUrls = {
      'global': 'https://en.wikipedia.org/wiki/Lists_of_museums',
      'artcyclopedia': 'http://www.artcyclopedia.com/museums.html',
      'us': 'https://en.wikipedia.org/wiki/List_of_museums_in_the_United_States',
      'uk': 'https://en.wikipedia.org/wiki/List_of_museums_in_England',
      'france': 'https://en.wikipedia.org/wiki/List_of_museums_in_France',
      'germany': 'https://en.wikipedia.org/wiki/List_of_museums_in_Germany',
      'italy': 'https://en.wikipedia.org/wiki/List_of_museums_in_Italy',
      'spain': 'https://en.wikipedia.org/wiki/List_of_museums_in_Spain',
      'japan': 'https://en.wikipedia.org/wiki/List_of_museums_in_Japan',
      'china': 'https://en.wikipedia.org/wiki/List_of_museums_in_China',
      'art': 'https://en.wikipedia.org/wiki/List_of_art_museums',
      'history': 'https://en.wikipedia.org/wiki/List_of_history_museums',
      'science': 'https://en.wikipedia.org/wiki/List_of_science_museums',
      'natural_history': 'https://en.wikipedia.org/wiki/List_of_natural_history_museums'
    };

    let targetUrl = wikipediaUrls.global;
    
    if (country && wikipediaUrls[country.toLowerCase()]) {
      targetUrl = wikipediaUrls[country.toLowerCase()];
    } else if (category && wikipediaUrls[category.toLowerCase()]) {
      targetUrl = wikipediaUrls[category.toLowerCase()];
    }

    // Fetch Wikipedia page
    const response = await axios.get(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    const $ = cheerio.load(response.data);
    const museums = [];

    // Parse different types of museum lists
    $('ul li, ol li').each((index, element) => {
      const text = $(element).text().trim();
      
      // Look for museum patterns
      if (text.includes('Museum') || text.includes('Gallery') || text.includes('Collection')) {
        // Extract museum name and location
        const museumMatch = text.match(/^([^,]+?)(?:,|$)/);
        const locationMatch = text.match(/,([^,]+?)(?:,|$)/);
        
        if (museumMatch) {
          const museumName = museumMatch[1].trim();
          const location = locationMatch ? locationMatch[1].trim() : '';
          
          // Skip if it's too short or doesn't look like a museum
          if (museumName.length > 5 && !museumName.includes('List of') && !museumName.includes('Category:')) {
            museums.push({
              name: museumName,
              location: location,
              description: text,
              source: 'Wikipedia',
              url: targetUrl
            });
          }
        }
      }
    });

    // Also parse table data if available
    $('table.wikitable tr').each((index, element) => {
      const cells = $(element).find('td');
      if (cells.length >= 2) {
        const name = $(cells[0]).text().trim();
        const location = $(cells[1]).text().trim();
        
        if (name && (name.includes('Museum') || name.includes('Gallery'))) {
          museums.push({
            name: name,
            location: location,
            description: `${name} in ${location}`,
            source: 'Wikipedia',
            url: targetUrl
          });
        }
      }
    });

    // Remove duplicates
    const uniqueMuseums = museums.filter((museum, index, self) => 
      index === self.findIndex(m => m.name === museum.name)
    );

    // Limit results to prevent overwhelming response
    const limitedMuseums = uniqueMuseums.slice(0, 100);

    res.status(200).json({
      success: true,
      museums: limitedMuseums,
      total: limitedMuseums.length,
      source: targetUrl
    });

  } catch (error) {
    console.error('Error fetching Wikipedia museum data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch museum data from Wikipedia',
      error: error.message
    });
  }
} 