import Image from "next/image";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ShowsGallery from "./components/ShowsGallery1";

const cities = [
  "All", "Online Exclusive", "New York", "London", "Los Angeles", "Paris", "Berlin", "Miami", "San Francisco", "Hong Kong", "Milan", "São Paulo", "Tokyo", "Toronto", "Mexico City", "Brussels", "Singapore", "Barcelona", "Cape Town", "Sydney", "Istanbul", "Dubai", "Seoul", "Buenos Aires", "Montreal", "All Cities"
];

const shows = [
  {
    title: "Retro Africa",
    subtitle: "Retro Africa at Black-Owned Galleries Now",
    date: "Feb 1 - Feb 28",
    img: "/retro-africa.jpg",
  },
  {
    title: "SEPTIEME Gallery",
    subtitle: "SEPTIEME Gallery at Black-Owned Galleries Now",
    date: "Feb 1 - Feb 28",
    img: "/septieme-gallery.jpg",
  },
  {
    title: "Sakhile&Me",
    subtitle: "Sakhile&Me at Black-Owned Galleries Now",
    date: "Feb 1 - Feb 28",
    img: "/sakhile-me.jpg",
  },
  {
    title: "Superposition",
    subtitle: "Superposition at Black-Owned Galleries Now",
    date: "Feb 1 - Feb 28",
    img: "/superposition.jpg",
  },
  {
    title: "Ojiri Gallery",
    subtitle: "Ojiri Gallery at Black-Owned Galleries Now",
    date: "Feb 1 - Feb 28",
    img: "/ojiri-gallery.jpg",
  },
  {
    title: "MASSIMODECARLO",
    subtitle: "Jessie Homer French. In Memoriam",
    date: "Feb 6 - Mar 10",
    img: "/massimodecarlo.jpg",
  },
  {
    title: "LXXI",
    subtitle: "Retro-active",
    date: "Jan 28 - Feb 28",
    img: "/lxxi.jpg",
  },
  {
    title: "Jonathan Carver Moore",
    subtitle: "Jonathan Carver Moore at Black-Owned Galleries Now",
    date: "Feb 1 - Feb 28",
    img: "/jonathan-carver-moore.jpg",
  },
];

export default function Home() {
  return (
    <>
    <Header />
    <div className=" mx-auto mt-[50px] px-4 py-8">
    <div className="flex space-x-4 pb-4 overflow-x-auto whitespace-nowrap scrollbar-hide">
        {cities.map((city, index) => (
          <button key={index} className="px-4 py-2 text-sm bg-gray-200 rounded-full hover:bg-gray-300">
            {city}
          </button>
        ))}
      </div>
      <h1 className="text-3xl mt-[20px] font-bold mb-6">Featured Shows</h1>
      <div className="grid grid-cols-1  sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
        {shows.map((show, index) => (
          <div key={index} className="group overflow-hidden rounded-lg shadow-lg">
            <div className="relative w-full h-64">
              <Image
                src={show.img}
                alt={show.title}
                layout="fill"
                objectFit="cover"
                className="group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="p-4">
              <h2 className="text-xl font-semibold">{show.title}</h2>
              <p className="text-gray-600">{show.subtitle}</p>
              <p className="text-gray-500 text-sm mt-1">{show.date}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="border-b-1 border-black"></div>
    </div>
    <ShowsGallery />
    <Footer />
    </>
  );
}
