import Image from "next/image";
import PlaceHolder from "../../../public/placeholder.jpeg"

const featuredArticles = [
  {
    category: "Art Index Editorial",
    title: "Moroccan Photographer Mous Lamrabat's Vibrant Images Bridge East and West",
    image: PlaceHolder,
  },
  {
    category: "Art Index Curatorial",
    title: "New This Week",
    image: PlaceHolder,
  },
  {
    category: "Art Index Editorial",
    title: "8 Artists to Follow If You Like David Lynch",
    image: PlaceHolder,
  },
  {
    category: "Art Index Curatorial",
    title: "Most Loved",
    image: PlaceHolder,
  },
];

export default function FeaturedSection() {
  return (
    <section className="max-w-[1500px]  mx-auto px-4 py-12 ">
      <h2 className="text-3xl font-bold text-center mb-10 text-black">
        Featured Articles
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {featuredArticles.map((article, index) => (
          <div
            key={index}
            className="group relative overflow-hidden rounded-lg shadow-md transition-shadow duration-300 hover:shadow-xl"
          >
            {/* Image Container */}
            <div className="relative w-full h-64 overflow-hidden rounded-t-lg">
              <Image
                src={article.image}
                alt={article.title}
                layout="fill"
                objectFit="cover"
                className="transition-transform duration-500 group-hover:scale-110"
              />
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-50 group-hover:opacity-75 transition-opacity duration-300"></div>
            </div>

            {/* Content */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-black bg-opacity-60 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
              <p className="text-xs font-semibold tracking-widest uppercase text-gray-300 mb-1">
                {article.category}
              </p>
              <h3 className="text-lg font-bold leading-tight">{article.title}</h3>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}