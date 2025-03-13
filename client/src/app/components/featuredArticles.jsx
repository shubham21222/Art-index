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
    <section className="w-full max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-6">
      <h2 className="text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-10 text-black">
        Featured Articles
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
        {featuredArticles.map((article, index) => (
          <div
            key={index}
            className="group relative overflow-hidden rounded-lg shadow-md transition-shadow duration-300 hover:shadow-xl"
          >
            {/* Image Container */}
            <div className="relative w-full aspect-[4/3] sm:aspect-[16/9] overflow-hidden rounded-t-lg">
              <Image
                src={article.image}
                alt={article.title}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-50 group-hover:opacity-75 transition-opacity duration-300"></div>
            </div>

            {/* Content */}
            <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 bg-black bg-opacity-60 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
              <p className="text-xs sm:text-sm font-semibold tracking-widest uppercase text-gray-300 mb-1">
                {article.category}
              </p>
              <h3 className="text-sm sm:text-base lg:text-lg font-bold leading-tight">{article.title}</h3>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}