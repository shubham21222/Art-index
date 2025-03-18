import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";

const articles = [
    {
        category: "Art Market",
        title: "Zona Maco 2025 Keeps Mexico City at Its Heart While Expanding Its International Reach",
        author: "Ray Rinaldi",
        date: "Feb 6, 2025",
        image: "https://d7hftxdivxxvm.cloudfront.net?height=720&quality=80&resize_to=fill&src=https%3A%2F%2Fartsy-media-uploads.s3.amazonaws.com%2Fs4aIuo0gAZWMisG1aYzuSA%252FZONA%2BMACO%2B25%2BMAG.png&width=670",
        large: true,
    },
    {
        category: "Art",
        title: "5 Artists on Our Radar This February",
        author: "Art Index Editorial",
        date: "Feb 5, 2025",
        image: "https://d7hftxdivxxvm.cloudfront.net?height=334&quality=80&resize_to=fill&src=https%3A%2F%2Fartsy-media-uploads.s3.amazonaws.com%2FmNddEk6KwoghL_O9U5n6AQ%252FAOOR%2BFEB25%2BMAG.jpeg&width=445",
    },
    {
        category: "Art Market",
        title: "Meet 10 Young Indian Art Collectors Making Waves",
        author: "Shreya Arvani",
        date: "Feb 4, 2025",
        image: "https://d7hftxdivxxvm.cloudfront.net?height=334&quality=80&resize_to=fill&src=https%3A%2F%2Fartsy-media-uploads.s3.amazonaws.com%2F_TsZgLOGMUx2X5Y3nyRenA%252FYOUNG%2BINDIAN%2BCOLLECTORS%2BMAG%2BREV.jpg&width=445",
    },
    {
        category: "Art",
        title: "Christina Kimeze’s Freewheeling Paintings Capture the Joy of Rollerskating",
        author: "Emily Steer",
        date: "Feb 5, 2025",
        image: "https://d7hftxdivxxvm.cloudfront.net?height=334&quality=80&resize_to=fill&src=https%3A%2F%2Fartsy-media-uploads.s3.amazonaws.com%2FYaivq-tpfykBmH46ibvbRw%252Fmag_kimeze.jpg&width=445",
    },
    {
        category: "Art Market",
        title: "Swiss Fair Art Genève Makes a Compelling Counterpoint to Art Basel",
        author: "Brian Ng",
        date: "Feb 5, 2025",
        image: "https://d7hftxdivxxvm.cloudfront.net?height=334&quality=80&resize_to=fill&src=https%3A%2F%2Fartsy-media-uploads.s3.amazonaws.com%2FoLaIAOscEskE603660funA%252FArtGeneve2025MAG%2B%25281%2529.jpg&width=445",
    },
    {
        category: "Art",
        title: "5 Standout Shows to See at Small Galleries This February",
        author: "Maxwell Rabb",
        date: "Feb 5, 2025",
        image: "https://d7hftxdivxxvm.cloudfront.net?height=334&quality=80&resize_to=fill&src=https%3A%2F%2Fartsy-media-uploads.s3.amazonaws.com%2FmQBpyFy2ODZSxnJUUGASVQ%252Fcustom-image%2B5.png&width=445",
    },
    {
        category: "Art Market",
        title: "1-54 Marrakech 2025 Highlights the Red City’s Status as a Global Arts Hub",
        author: "Sarah Moroz",
        date: "Feb 5, 2025",
        image: "https://d7hftxdivxxvm.cloudfront.net?height=334&quality=80&resize_to=fill&src=https%3A%2F%2Fartsy-media-uploads.s3.amazonaws.com%2FsOAzMNeRl7uS-_nQKans_Q%252F1-54Marrakech2025MAG.jpg&width=445",
    },
];



export default function ArtsySection() {
    const largeArticle = articles.find((article) => article.large);
    const remainingArticles = articles.filter((article) => !article.large);

    return (
        <div className="max-w-[1500px] mx-auto px-6 py-8">
            <h1 className="text-4xl font-bold text-center mb-10">Art Index Editorial</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Column (50%) - Large Article */}
                <div className="relative group overflow-hidden rounded-lg shadow-md transition-all duration-300 hover:shadow-lg">
                    {largeArticle ? (
                        <>
                            <Image
                                src={largeArticle.image}
                                alt={largeArticle.title}
                                width={1200}
                                height={800}
                                className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
                                <p className="text-xs uppercase text-white">{largeArticle.category}</p>
                                <h2 className="text-2xl font-bold text-white">{largeArticle.title}</h2>
                                <p className="text-sm text-gray-300 mt-1">By {largeArticle.author}</p>
                                <p className="text-xs text-gray-400">{largeArticle.date}</p>
                            </div>
                        </>
                    ) : (
                        <Skeleton className="w-full h-[400px] rounded-lg" />
                    )}
                </div>

                {/* Right Column (50%) - Remaining Articles */}
                <div className="grid grid-cols-2 gap-6">
                    {remainingArticles.length > 0 ? (
                        remainingArticles.map((article, index) => (
                            <div key={index} className="relative group overflow-hidden rounded-lg shadow-md transition-all duration-300 hover:shadow-lg">
                                <Image
                                    src={article.image}
                                    alt={article.title}
                                    width={600}
                                    height={400}
                                    className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                                    <p className="text-xs uppercase text-gray-300">{article.category}</p>
                                    <h3 className="text-lg font-bold text-white leading-tight">{article.title}</h3>
                                    <p className="text-sm text-gray-400">By {article.author}</p>
                                    <p className="text-xs text-gray-500">{article.date}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        Array.from({ length: 6 }).map((_, index) => (
                            <Skeleton key={index} className="w-full h-[200px] rounded-lg" />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}