import { MongoClient } from "mongodb";

export const config = {
  api: {
    bodyParser: false,
  },
};

// Calculate distance between two points using Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c; // Distance in kilometers
  return distance;
}

// Parse location string to extract coordinates
function parseLocation(location) {
  if (!location) return null;
  
  // Handle "city, country" format
  const parts = location.split(',').map(part => part.trim());
  return {
    city: parts[0] || null,
    country: parts[1] || null
  };
}

// Parse coordinates from "lat,lon" format
function parseCoordinates(near) {
  if (!near) return null;
  
  const coords = near.split(',').map(coord => parseFloat(coord.trim()));
  if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
    return {
      latitude: coords[0],
      longitude: coords[1]
    };
  }
  return null;
}

export default async function handler(req, res) {
  // Get query parameters
  const { 
    near,           // "48.86,2.35" format (latitude,longitude) or null for all museums
    category,       // category filter
    type = "INSTITUTION", // type filter
    limit = 12      // limit results
  } = req.query;

  try {
    // Artsy GraphQL query
    const query = {
      "id": "PartnersFilteredCellsQuery",
      "query": `query PartnersFilteredCellsQuery(
        $after: String
        $near: String
        $category: [String]
        $type: [PartnerClassification]
      ) {
        viewer {
          ...PartnersFilteredCells_viewer_iDCAR
        }
      }

      fragment CellPartner_partner on Partner {
        ...EntityHeaderPartner_partner
        internalID
        slug
        name
        href
        initials
        locationsConnection(first: 15) {
          edges {
            node {
              city
              id
            }
          }
        }
        categories {
          name
          slug
          id
        }
        profile {
          image {
            cropped(width: 445, height: 334, version: ["wide", "large", "featured", "larger"]) {
              src
              srcSet
            }
          }
          id
        }
      }

      fragment EntityHeaderPartner_partner on Partner {
        internalID
        type
        slug
        href
        name
        initials
        locationsConnection(first: 15) {
          edges {
            node {
              city
              id
            }
          }
        }
        categories {
          name
          slug
          id
        }
        profile {
          internalID
          avatar: image {
            cropped(width: 45, height: 45) {
              src
              srcSet
            }
          }
          icon {
            cropped(width: 45, height: 45, version: ["untouched-png", "large", "square"]) {
              src
              srcSet
            }
          }
          id
        }
      }

      fragment PartnersFilteredCells_viewer_iDCAR on Viewer {
        partnersConnection(after: $after, defaultProfilePublic: true, eligibleForListing: true, first: 12, near: $near, partnerCategories: $category, sort: RANDOM_SCORE_DESC, type: $type) {
          totalCount
          edges {
            node {
              internalID
              ...CellPartner_partner
              id
              __typename
            }
            cursor
          }
          pageInfo {
            endCursor
            hasNextPage
          }
        }
      }`,
      "variables": {
        "after": null,
        "near": near || null, // Use null for all museums when no coordinates provided
        "category": category ? [category] : null,
        "type": [type]
      }
    };

    console.log("Calling Artsy API with coordinates:", near || "All locations");

    // Call Artsy's GraphQL API
    const response = await fetch('https://metaphysics-cdn.artsy.net/v2', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(query)
    });

    const data = await response.json();
    
    console.log(`Artsy API returned ${data.data?.viewer?.partnersConnection?.totalCount || 0} institutions`);

    // Return the exact same structure as Artsy
    res.status(200).json(data);

  } catch (error) {
    console.error("Error calling Artsy API:", error);
    res.status(500).json({ 
      data: {
        viewer: {
          partnersConnection: {
            totalCount: 0,
            edges: [],
            pageInfo: {
              endCursor: null,
              hasNextPage: false
            }
          }
        }
      }
    });
  }
}