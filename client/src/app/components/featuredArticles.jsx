import Image from "next/image";

const featuredArticles = [
  {
    category: "Artsy Editorial",
    title: "Moroccan Photographer Mous Lamrabat's Vibrant Images Bridge East and West",
    image: "https://d7hftxdivxxvm.cloudfront.net?height=297&quality=80&resize_to=fill&src=https%3A%2F%2Fd32dm0rphc51dk.cloudfront.net%2FPTuFJyIa0p7AK_9V9f4LLQ%2Fmain.jpg&width=445",
  },
  {
    category: "Artsy Curatorial",
    title: "New This Week",
    image: "https://d7hftxdivxxvm.cloudfront.net?height=297&quality=80&resize_to=fill&src=https%3A%2F%2Fd32dm0rphc51dk.cloudfront.net%2FG7xBub62DfiD_g2Es1I8CA%2Fmain.jpg&width=445",
  },
  {
    category: "Artsy Editorial",
    title: "8 Artists to Follow If You Like David Lynch",
    image: "https://d7hftxdivxxvm.cloudfront.net?height=297&quality=80&resize_to=fill&src=https%3A%2F%2Fd32dm0rphc51dk.cloudfront.net%2FBuixF13TUeGS52PGSdu1XA%2Fmain.jpg&width=445",
  },
  {
    category: "Artsy Curatorial",
    title: "Most Loved",
    image: "https://d7hftxdivxxvm.cloudfront.net?height=297&quality=80&resize_to=fill&src=https%3A%2F%2Fd32dm0rphc51dk.cloudfront.net%2Fe4ncoyhwKkCU-lKw-_hpFg%2Fmain.jpg&width=445",
  },
];

export default function FeaturedSection() {
  return (
    <section className="max-w-[1500px]  mx-auto px-4 py-12 bg-gray-50">
      <h2 className="text-3xl font-bold text-center mb-10 text-gray-800">
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