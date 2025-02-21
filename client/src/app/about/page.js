import Image from "next/image";
import TrendingNow from "./components/TrendingNow";
import Footer from "../components/Footer";
import Header from "../components/Header";

export default function Home() {

    const artData = [
        {
            title: "Find the art you want",
            description: "Be the first to know when the art you're looking for is available with custom alerts.",
            image: "https://d7hftxdivxxvm.cloudfront.net?quality=80&resize_to=width&src=https%3A%2F%2Ffiles.artsy.net%2Fimages%2F01_CVP_About_Find.png&width=640",
        },
        {
            title: "Buy art with ease",
            description: "Buy art simply and safely, from purchase to delivery.",
            image: "https://d7hftxdivxxvm.cloudfront.net?quality=80&resize_to=width&src=https%3A%2F%2Ffiles.artsy.net%2Fimages%2F02_CVP_About_Buy.png&width=640",
        },
        {
            title: "Bid in global auctions",
            description: "Bid in leading global auctions, from wherever you are.",
            image: "https://d7hftxdivxxvm.cloudfront.net?quality=80&resize_to=width&src=https%3A%2F%2Ffiles.artsy.net%2Fimages%2F03_CVP_About_Bid.png&width=640",
        },
        {
            title: "Track the art market",
            description: "Invest smarter with our free auction results database.",
            image: "https://d7hftxdivxxvm.cloudfront.net?quality=80&resize_to=width&src=https%3A%2F%2Ffiles.artsy.net%2Fimages%2F04_CVP_About_Track.png&width=640",
        },
        {
            title: "Manage your collection",
            description: "Get insight into the market value of artworks in your collection.",
            image: "https://d7hftxdivxxvm.cloudfront.net?quality=80&resize_to=width&src=https%3A%2F%2Ffiles.artsy.net%2Fimages%2F05_CVP_About_Manage.png&width=640",
        },
        {
            title: "Discover new talents",
            description: "Get to know today's up-and-coming artists and trends in the art world.",
            image: "https://d7hftxdivxxvm.cloudfront.net?quality=80&resize_to=width&src=https%3A%2F%2Ffiles.artsy.net%2Fimages%2F07_CVP_About_Discover.png&width=640",
        },
        {
            title: "Follow your favorite artists",
            description: "Follow artists for updates on their latest works and career milestones.",
            image: "https://d7hftxdivxxvm.cloudfront.net?quality=80&resize_to=width&src=https%3A%2F%2Ffiles.artsy.net%2Fimages%2F08_CVP_About_Follow%20(2).png&width=640",
        },
    ];

    return (
        <>
            <Header />
            <div className=" min-h-screen">
                <header className="md:pt-6 pt-[90px] bg-gradient-to-b from-gray-600 to-gray-400 text-white py-6 text-center text-2xl font-semibold">
                    The Future of Art Collecting
                </header>

                <section className=" text-center py-6 px-4">
                    <h2 className="text-2xl font-semibold">Art Index is for art collecting.</h2>
                    <p className="text-gray-700 mt-2 max-w-7xl mx-auto">
                        Welcome to *ArtIndex.ai*, the ultimate marketplace for art dealers, artists, collectors, and enthusiasts. We created Art Index with a singular vision: to provide a seamless, AI-powered platform that connects the global art community. Whether you are searching for your next masterpiece, exploring renowned art museums worldwide, or diving into the rich history of art, Art Index is your trusted destination.
                        Our platform leverages cutting-edge AI technology to enhance the art-buying experience, making it easier than ever to discover and acquire exceptional artworks. By bringing together artists and buyers in one dynamic space, we foster a thriving marketplace that celebrates creativity and innovation.
                        Beyond commerce, Art Index is dedicated to education and accessibility. We believe that art should be explored, studied, and appreciated by all, which is why we provide resources to uncover the stories behind iconic works and movements throughout history. Our AI-driven search capabilities ensure that users can find what theyre looking for with ease—whether its a specific painting, a gallery exhibition, or an in-depth analysis of a historic masterpiece.
                        At Art Index, we value our community and continuously strive to refine our platform based on user feedback. We are committed to making Art Index a space where art lovers of all backgrounds can connect, discover, and be inspired.
                        Join us in shaping the future of the art world—one masterpiece at a time.           </p>
                </section>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4 md:px-12">
                    {artData.map((art, index) => (
                        <div key={index} className="bg-white shadow-md rounded-lg overflow-hidden">
                            <Image src={art.image} alt={art.title} width={500} height={300} className="w-full h-64 object-cover" />
                            <div className="p-4">
                                <h3 className="text-lg font-semibold">{art.title}</h3>
                                <p className="text-gray-600 text-sm">{art.description}</p>
                                <button className="mt-3 px-4 py-2 text-sm border border-gray-800 rounded-full hover:bg-gray-800 hover:text-white transition">View</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <TrendingNow />
            <Footer />
        </>
    );
}

