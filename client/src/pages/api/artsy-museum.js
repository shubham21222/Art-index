export default async function handler(req, res) {
  const { slug } = req.query;

  if (!slug) {
    return res.status(400).json({ error: "Slug parameter is required" });
  }

  try {
    // Artsy GraphQL query for individual museum
    const query = {
      "id": "PartnerAppQuery",
      "query": `query PartnerAppQuery($partnerID: String!) {
        partner(id: $partnerID) {
          internalID
          slug
          name
          href
          initials
          type
          profile {
            bio
            image {
              cropped(width: 445, height: 334, version: ["wide", "large", "featured", "larger"]) {
                src
                srcSet
              }
            }
            id
          }
          locationsConnection(first: 15) {
            edges {
              node {
                city
                country
                id
              }
            }
          }
          categories {
            name
            slug
            id
          }
          showsConnection(first: 10, status: RUNNING) {
            edges {
              node {
                internalID
                slug
                name
                href
                startAt
                endAt
                image {
                  cropped(width: 445, height: 334, version: ["wide", "large", "featured", "larger"]) {
                    src
                    srcSet
                  }
                }
                description
                location {
                  city
                  country
                }
              }
            }
          }
          artworksConnection(first: 20, filter: IS_FOR_SALE) {
            edges {
              node {
                internalID
                slug
                title
                href
                image {
                  cropped(width: 445, height: 334, version: ["wide", "large", "featured", "larger"]) {
                    src
                    srcSet
                  }
                }
                artistNames
                date
                medium
                dimensions {
                  cm
                  in
                }
              }
            }
          }
        }
      }`,
      "variables": {
        "partnerID": slug
      }
    };

    console.log("Calling Artsy API for museum:", slug);

    // Call Artsy's GraphQL API
    const response = await fetch('https://metaphysics-cdn.artsy.net/v2', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(query)
    });

    const data = await response.json();
    
    if (data.errors) {
      console.error("Artsy API errors:", data.errors);
      return res.status(404).json({ error: "Museum not found" });
    }

    const museum = data.data?.partner;
    
    if (!museum) {
      return res.status(404).json({ error: "Museum not found" });
    }

    // Format the response to match our expected structure
    const formattedMuseum = {
      _id: museum.internalID,
      slug: museum.slug,
      name: museum.name,
      description: museum.profile?.bio || "",
      profileImage: museum.profile?.image?.cropped?.src || "/placeholder.jpeg",
      contact: {
        email: "",
        phone: "",
        address: museum.locationsConnection?.edges?.[0]?.node?.city 
          ? `${museum.locationsConnection.edges[0].node.city}, ${museum.locationsConnection.edges[0].node.country || ""}`
          : "",
        website: museum.href || ""
      },
      events: museum.showsConnection?.edges?.map(edge => ({
        _id: edge.node.internalID,
        name: edge.node.name,
        image: edge.node.image?.cropped?.src || "/placeholder.jpeg",
        startDate: edge.node.startAt,
        endDate: edge.node.endAt,
        description: edge.node.description || "",
        location: edge.node.location?.city 
          ? `${edge.node.location.city}, ${edge.node.location.country || ""}`
          : "",
        isActive: true
      })) || [],
      artworks: museum.artworksConnection?.edges?.map(edge => ({
        _id: edge.node.internalID,
        name: edge.node.title,
        images: [edge.node.image?.cropped?.src || "/placeholder.jpeg"],
        description: edge.node.medium || "",
        artist: edge.node.artistNames || "",
        year: edge.node.date || "",
        medium: edge.node.medium || ""
      })) || [],
      isActive: true,
      createdBy: null, // Artsy museums don't have a createdBy field
      createdAt: null,
      updatedAt: null,
      // For compatibility with existing components
      image: {
        src: museum.profile?.image?.cropped?.src || "/placeholder.jpeg",
        width: 445,
        height: 334,
      },
      city: museum.locationsConnection?.edges?.[0]?.node?.city || "Unknown",
      country: museum.locationsConnection?.edges?.[0]?.node?.country || "Unknown",
      categories: museum.categories || [],
      type: "artsy"
    };

    console.log("Formatted Artsy museum:", formattedMuseum.name);

    res.status(200).json({ museum: formattedMuseum });

  } catch (error) {
    console.error("Error calling Artsy API:", error);
    res.status(500).json({ error: "Failed to fetch museum data" });
  }
} 