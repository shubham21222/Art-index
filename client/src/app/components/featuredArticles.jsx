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
    <section className="mx-auto px-4 py-8">
      <h2 className="text-2xl mb-6">Featured</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {featuredArticles.map((article, index) => (
          <div key={index} className="group cursor-pointer">
            <div className="w-full h-60 relative overflow-hidden rounded-lg">
              <Image
                src={article.image}
                alt={article.title}
                layout="fill"
                objectFit="cover"
                className="transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <p className="text-sm text-gray-500 mt-2">{article.category}</p>
            <h3 className="text-2xl  mt-1">{article.title}</h3>
          </div>
        ))}
      </div>
    </section>
  );
}