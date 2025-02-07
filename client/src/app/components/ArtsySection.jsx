import Image from "next/image";

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
        author: "Artsy Editorial",
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
        <div className="mx-auto px-6 py-8">
            <h1 className="text-4xl  mb-6">Artsy Editorial</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column (50%) - Large Article */}
                <div className="w-full">
                    {largeArticle && (
                        <div className="relative">
                            <Image
                                src={largeArticle.image}
                                alt={largeArticle.title}
                                width={1200}
                                height={800}
                                className="w-full h-auto rounded-md"
                            />
                            <div className=" bottom-4 left-4 bg-white p-6">
                                <p className="text-xs uppercase text-gray-500">{largeArticle.category}</p>
                                <h2 className="text-2xl font-semibold">{largeArticle.title}</h2>
                                <p className="text-gray-500 text-sm mt-1">By {largeArticle.author}</p>
                                <p className="text-gray-500 text-xs">{largeArticle.date}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column (50%) - Remaining Articles */}
                <div className="w-full grid grid-cols-2 gap-4">
                    {remainingArticles.map((article, index) => (
                        <div key={index} className="relative">
                            <Image
                                src={article.image}
                                alt={article.title}
                                width={600}
                                height={400}
                                className="w-full h-auto rounded-md"
                            />
                            <div className="inset-0  text-black p-4 flex flex-col justify-end">
                                <p className="text-xs uppercase text-gray-700">{article.category}</p>
                                <h3 className="text-black text-lg font-semibold leading-tight">{article.title}</h3>
                                <p className="text-gray-700 text-sm">By {article.author}</p>
                                <p className="text-gray-700 text-xs">{article.date}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
