"use client";
import { useState } from "react";
import { useQuery } from "@apollo/client";
import { ApolloClient, gql, InMemoryCache } from "@apollo/client";
import { motion } from "framer-motion";
import { Clock, Eye, ChevronRight } from "lucide-react";

// GraphQL query remains the same
const VIEWING_ROOMS_QUERY = gql`
  query viewingRoomRoutes_ViewingRoomsAppQuery($count: Int!, $after: String) {
    allViewingRooms: viewer {
      ...ViewingRoomsApp_allViewingRooms_2QE1um
    }
  }

  fragment ViewingRoomsApp_allViewingRooms_2QE1um on Viewer {
    viewingRoomsConnection(first: $count, after: $after) {
      edges {
        node {
          slug
          status
          title
          image {
            imageURLs {
              normalized
            }
          }
          distanceToOpen(short: true)
          distanceToClose(short: true)
          partner {
            name
            id
          }
          __typename
        }
        cursor
      }
      pageInfo {
        endCursor
        hasNextPage
      }
    }
  }
`;

const client = new ApolloClient({
  uri: "https://metaphysics-cdn.artsy.net/v2",
  cache: new InMemoryCache(),
});

const ViewingRoomCard = ({ room }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8 }}
      className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
    >
      <div className="relative group">
        <div className="relative w-full h-64 overflow-hidden">
          {room.image?.imageURLs?.normalized ? (
            <img
              src={room.image.imageURLs.normalized}
              alt={room.title}
              className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
              <Eye className="w-12 h-12 text-gray-400" />
            </div>
          )}
          <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <button className="px-6 py-2 bg-white text-black rounded-full transform -translate-y-4 group-hover:translate-y-0 transition-all duration-300 flex items-center gap-2">
              View Room <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
      
      <div className="p-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
            {room.status}
          </span>
          {room.distanceToClose && (
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <Clock className="w-3 h-3" />
              Closes in {room.distanceToClose}
            </span>
          )}
        </div>
        
        <h3 className="text-xl font-semibold mb-2 line-clamp-2 hover:text-blue-600 transition-colors">
          {room.title}
        </h3>
        
        {room.partner?.name && (
          <p className="text-sm text-gray-600">{room.partner.name}</p>
        )}
      </div>
    </motion.div>
  );
};

export default function LatestViewingRooms() {
  const [count, setCount] = useState(12);
  const [after, setAfter] = useState(null);

  const { loading, error, data, fetchMore } = useQuery(VIEWING_ROOMS_QUERY, {
    variables: { count, after },
    client,
  });

  const viewingRooms = data?.allViewingRooms?.viewingRoomsConnection?.edges.map((edge) => edge.node) || [];
  const pageInfo = data?.allViewingRooms?.viewingRoomsConnection?.pageInfo;

  const loadMore = () => {
    if (pageInfo?.hasNextPage) {
      fetchMore({
        variables: {
          count: 12,
          after: pageInfo.endCursor,
        },
      }).then((fetchMoreResult) => {
        setAfter(fetchMoreResult.data.allViewingRooms.viewingRoomsConnection.pageInfo.endCursor);
      });
    }
  };

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-red-500">
        <p>Error: {error.message}</p>
      </div>
    );
  }

  if (viewingRooms.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-500">
        <Eye className="w-16 h-16 mb-4" />
        <p className="text-xl">No viewing rooms available</p>
      </div>
    );
  }

  return (
    <section className="px-6 py-12 bg-gray-50">
      <div className=" mx-auto">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h2 className="text-4xl font-bold text-gray-900">Latest Viewing Rooms</h2>
            <p className="mt-2 text-gray-600">Explore our curated collection of virtual exhibitions</p>
          </div>
          <a 
            href="#" 
            className="group flex items-center gap-2 text-gray-900 font-medium hover:text-blue-600 transition-colors"
          >
            View All
            <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {viewingRooms.map((room) => (
            <ViewingRoomCard key={room.slug} room={room} />
          ))}
        </div>

        {pageInfo?.hasNextPage && (
          <div className="flex justify-center mt-12">
            <button
              onClick={loadMore}
              className="px-8 py-3 bg-black text-white rounded-full font-medium hover:bg-gray-800 transition-colors duration-300 flex items-center gap-2"
            >
              Load More
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}