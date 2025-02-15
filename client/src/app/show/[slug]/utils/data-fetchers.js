// src/app/show/[slug]/utils/data-fetchers.js

export async function getShowData(slug) {
    const ARTSY_API_URL = "https://metaphysics-cdn.artsy.net/v2";
  
    const SHOW_QUERY = `
      query showRoutes_ShowInfoQuery($slug: String!) {
        show(id: $slug) @principalField {
          fair {
            location {
              display
              address
              city
              state
              country
              id
            }
            id
          }
          location {
            display
            address
            city
            state
            country
            openingHours {
              __typename
              ... on OpeningHoursArray {
                schedules {
                  days
                  hours
                }
              }
              ... on OpeningHoursText {
                text
              }
            }
            id
          }
          name
          about: description
          pressRelease(format: HTML)
          hasLocation
          partner {
            __typename
            ... on Partner {
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
            ... on Node {
              __isNode: __typename
              id
            }
          }
          id
        }
      }
    `;
  
    try {
      const response = await fetch(ARTSY_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: SHOW_QUERY,
          variables: { slug },
        }),
        cache: 'no-store',
      });
  
      const { data } = await response.json();
      return data.show;
    } catch (error) {
      console.error("Error fetching show data:", error);
      return null;
    }
  }
  
  export async function getShowArtworks(slug) {
    const ARTSY_API_URL = "https://metaphysics-cdn.artsy.net/v2";
    
    const SHOW_ARTWORKS_QUERY = `
      query ShowArtworksFilterQuery($slug: String!) {
        show(id: $slug) {
          filtered_artworks: filterArtworksConnection(first: 30, input: {sort: "partner_show_position"}) {
            edges {
              node {
                id
                slug
                href
                internalID
                image(includeAll: false) {
                  resized(width: 445, version: ["larger", "large"]) {
                    src
                    width
                    height
                  }
                }
                title
                date
                saleMessage
                artistNames
                artists(shallow: true) {
                  name
                }
                partner(shallow: true) {
                  name
                }
              }
            }
          }
        }
      }
    `;
  
    try {
      const response = await fetch(ARTSY_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: SHOW_ARTWORKS_QUERY,
          variables: { slug },
        }),
        cache: 'no-store',
      });
  
      const { data } = await response.json();
      return data?.show?.filtered_artworks?.edges || [];
    } catch (error) {
      console.error("Error fetching show artworks:", error);
      return [];
    }
  }