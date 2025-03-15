import { MongoClient } from "mongodb";
import fetch from "node-fetch";

// MongoDB Connection Configuration
const MONGO_URI = "mongodb://admin:K7%24mP%21v9qL2x@172.233.136.79:27017/";
const AUCTION_DATABASE_NAME = "auction_lots_db";
const AUCTION_COLLECTION_NAME = "auction_lots";

// GraphQL API Endpoint
const GRAPHQL_URL = "https://metaphysics-cdn.artsy.net/v2";

// Auction Query with Pagination Support
const AUCTION_QUERY = `
    query HomeAuctionLotsRailQuery($first: Int!, $after: String) {
      viewer {
        artworksConnection(forSale: true, first: $first, after: $after, geneIDs: "our-top-auction-lots") {
          edges {
            node {
              internalID
              href
              slug
              title
              artistNames
              image {
                src: url(version: ["larger", "large"])
                width
                height
              }
              sale {
                endAt
                isClosed
              }
              saleArtwork {
                highestBid {
                  display
                }
                openingBid {
                  display
                }
              }
              collectorSignals {
                auction {
                  lotClosesAt
                  registrationEndsAt
                }
              }
            }
          }
          pageInfo {
            endCursor
            hasNextPage
          }
        }
      }
    }
`;

// Sleep function
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Fetch auction data with pagination
async function fetchAuctionData() {
    const allAuctionArtworks = [];
    const pageSize = 20;
    let afterCursor = null;
    const sleepSeconds = 1;

    try {
        while (true) {
            // Prepare variables for pagination
            const variables = {
                first: pageSize,
                after: afterCursor
            };

            // Send POST request to GraphQL API
            const response = await fetch(GRAPHQL_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: AUCTION_QUERY, variables })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            if (result.errors) {
                console.error("GraphQL Errors:", result.errors);
                break;
            }

            // Extract auction artworks and page info
            const connection = result.data?.viewer?.artworksConnection;
            const edges = connection?.edges || [];
            const pageInfo = connection?.pageInfo;

            if (!edges.length) {
                console.log("No more auction lots to fetch.");
                break;
            }

            // Add artworks to the list
            const auctionArtworks = edges.map(edge => edge.node);
            allAuctionArtworks.push(...auctionArtworks);
            console.log(`Fetched ${auctionArtworks.length} auction lots, total so far: ${allAuctionArtworks.length}`);

            // Check if there's more to fetch
            if (!pageInfo?.hasNextPage) {
                console.log("Reached the end of auction lots.");
                break;
            }

            // Update cursor for the next page
            afterCursor = pageInfo.endCursor;

            // Sleep before the next request
            console.log(`Sleeping for ${sleepSeconds} second(s)...`);
            await sleep(sleepSeconds * 1000);
        }
    } catch (error) {
        console.error("Error fetching auction data:", error);
    }

    return allAuctionArtworks;
}

// Store data in MongoDB
async function storeInMongoDB(auctionData) {
    let client;

    try {
        // Connect to MongoDB
        client = new MongoClient(MONGO_URI);
        await client.connect();
        
        const db = client.db(AUCTION_DATABASE_NAME);
        const collection = db.collection(AUCTION_COLLECTION_NAME);

        // Insert or update auction lots
        for (const artwork of auctionData) {
            await collection.updateOne(
                { internalID: artwork.internalID },
                { $set: artwork },
                { upsert: true }
            );
        }

        console.log(`Stored ${auctionData.length} auction lots in MongoDB.`);
    } catch (error) {
        console.error("Error storing auction data in MongoDB:", error);
    } finally {
        if (client) {
            await client.close();
        }
    }
}

// Main function
async function main() {
    console.log("Starting auction data fetch...");
    const auctionData = await fetchAuctionData();
    
    if (auctionData.length > 0) {
        console.log("Starting MongoDB storage...");
        await storeInMongoDB(auctionData);
        console.log("Process completed successfully.");
    } else {
        console.log("No auction data to store.");
    }
}

// Run the script
if (require.main === module) {
    main().catch(console.error);
} 