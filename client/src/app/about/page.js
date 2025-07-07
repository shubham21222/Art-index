import Image from "next/image";
import TrendingNow from "./components/TrendingNow";
import Footer from "../components/Footer";
import Header from "../components/Header";
import Link from "next/link";

export default function Home() {
    const artData = [
        {
            title: "Find the art you want",
            description: "Be the first to know when the art you're looking for is available with custom alerts.",
            image: "https://d7hftxdivxxvm.cloudfront.net?quality=80&resize_to=width&src=https%3A%2F%2Ffiles.artsy.net%2Fimages%2F01_CVP_About_Find.png&width=640",
            icon: "🔍"
        },
        {
            title: "Buy art with ease",
            description: "Buy art simply and safely, from purchase to delivery.",
            image: "https://d7hftxdivxxvm.cloudfront.net?quality=80&resize_to=width&src=https%3A%2F%2Ffiles.artsy.net%2Fimages%2F02_CVP_About_Buy.png&width=640",
            icon: "💳"
        },
        {
            title: "Bid in global auctions",
            description: "Bid in leading global auctions, from wherever you are.",
            image: "https://d7hftxdivxxvm.cloudfront.net?quality=80&resize_to=width&src=https%3A%2F%2Ffiles.artsy.net%2Fimages%2F03_CVP_About_Bid.png&width=640",
            icon: "🏛️"
        },
        {
            title: "Track the art market",
            description: "Invest smarter with our free auction results database.",
            image: "https://d7hftxdivxxvm.cloudfront.net?quality=80&resize_to=width&src=https%3A%2F%2Ffiles.artsy.net%2Fimages%2F04_CVP_About_Track.png&width=640",
            icon: "📊"
        },
        {
            title: "Manage your collection",
            description: "Get insight into the market value of artworks in your collection.",
            image: "https://d7hftxdivxxvm.cloudfront.net?quality=80&resize_to=width&src=https%3A%2F%2Ffiles.artsy.net%2Fimages%2F05_CVP_About_Manage.png&width=640",
            icon: "🎨"
        },
        {
            title: "Discover new talents",
            description: "Get to know today's up-and-coming artists and trends in the art world.",
            image: "https://d7hftxdivxxvm.cloudfront.net?quality=80&resize_to=width&src=https%3A%2F%2Ffiles.artsy.net%2Fimages%2F07_CVP_About_Discover.png&width=640",
            icon: "⭐"
        },
    ];

    return (
        <>
            <Header />
            <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
                {/* Hero Section */}
                <header className="relative md:pt-6 pt-[90px] bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 text-white py-20 text-center overflow-hidden">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-10">
                        <div 
                            className="absolute inset-0"
                            style={{
                                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                                backgroundSize: '60px 60px'
                            }}
                        ></div>
                    </div>
                    
                    <div className="relative z-10 max-w-4xl mx-auto px-6">
                        <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                    The Future of Art Collecting
                        </h1>
                        <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto mb-8"></div>
                        <p className="text-xl md:text-2xl text-gray-300 leading-relaxed">
                            Where technology meets creativity, and every masterpiece finds its home
                        </p>
                    </div>
                </header>

                {/* Mission Statement Section */}
                <section className="py-20 px-6 bg-white">
                    <div className="max-w-6xl mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">
                                Art Index is for 
                                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> art collecting</span>
                            </h2>
                            <div className="w-32 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto mb-12"></div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-12 items-center">
                            <div className="space-y-6">
                                <div className="prose prose-lg max-w-none">
                                    <p className="text-lg text-gray-700 leading-relaxed mb-6">
                                        Welcome to <strong className="text-blue-600">ArtIndex.ai</strong>, the ultimate marketplace for art dealers, artists, collectors, and enthusiasts. We created Art Index with a singular vision: to provide a seamless, AI-powered platform that connects the global art community.
                                    </p>
                                    
                                    <p className="text-lg text-gray-700 leading-relaxed mb-6">
                                        Whether you are searching for your next masterpiece, exploring renowned art museums worldwide, or diving into the rich history of art, Art Index is your trusted destination.
                                    </p>
                                    
                                    <p className="text-lg text-gray-700 leading-relaxed mb-6">
                        Our platform leverages cutting-edge AI technology to enhance the art-buying experience, making it easier than ever to discover and acquire exceptional artworks. By bringing together artists and buyers in one dynamic space, we foster a thriving marketplace that celebrates creativity and innovation.
                                    </p>
                                </div>
                            </div>
                            
                            <div className="relative">
                                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 border border-gray-200">
                                    <div className="space-y-4">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                            <span className="text-gray-700 font-medium">AI-Powered Discovery</span>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                                            <span className="text-gray-700 font-medium">Global Art Community</span>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                            <span className="text-gray-700 font-medium">Secure Transactions</span>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                                            <span className="text-gray-700 font-medium">Educational Resources</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-16 text-center">
                            <div className="prose prose-lg max-w-none">
                                <p className="text-lg text-gray-700 leading-relaxed mb-6">
                                    Beyond commerce, Art Index is dedicated to education and accessibility. We believe that art should be explored, studied, and appreciated by all, which is why we provide resources to uncover the stories behind iconic works and movements throughout history.
                                </p>
                                
                                <p className="text-lg text-gray-700 leading-relaxed mb-8">
                                    Our AI-driven search capabilities ensure that users can find what they&apos;re looking for with ease—whether it&apos;s a specific painting, a gallery exhibition, or an in-depth analysis of a historic masterpiece.
                                </p>
                                
                                <Link href="/partnerships">
                                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-full inline-block font-semibold text-lg">
                                    Join us in shaping the future of the art world
                                </div>
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Grid Section */}
                <section className="py-20 px-6 bg-gradient-to-b from-gray-50 to-white">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                                Everything You Need to 
                                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Collect Art</span>
                            </h2>
                            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                                Discover our comprehensive suite of tools designed to enhance your art collecting journey
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {artData.map((art, index) => (
                                <div key={index} className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-blue-200">
                                    <div className="relative overflow-hidden">
                                        <Image 
                                            src={art.image} 
                                            alt={art.title} 
                                            width={500} 
                                            height={300} 
                                            className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300" 
                                        />
                                        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-full w-12 h-12 flex items-center justify-center text-2xl">
                                            {art.icon}
                                        </div>
                                    </div>
                                    <div className="p-6">
                                        <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                                            {art.title}
                                        </h3>
                                        <p className="text-gray-600 leading-relaxed mb-4">
                                            {art.description}
                                        </p>
                                        {/* <button className="inline-flex items-center px-6 py-3 text-sm font-semibold text-blue-600 border-2 border-blue-600 rounded-full hover:bg-blue-600 hover:text-white transition-all duration-300 group-hover:shadow-lg">
                                            Learn More
                                            <svg className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                            </svg>
                                        </button> */}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Community Section */}
                <section className="py-20 px-6 bg-white">
                    <div className="max-w-6xl mx-auto text-center">
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">
                            Built for the 
                            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Art Community</span>
                        </h2>
                        <p className="text-xl text-gray-600 mb-12 max-w-4xl mx-auto">
                            At Art Index, we value our community and continuously strive to refine our platform based on user feedback. We are committed to making Art Index a space where art lovers of all backgrounds can connect, discover, and be inspired.
                        </p>
                        
                        <div className="grid md:grid-cols-3 gap-8 mt-16">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Global Network</h3>
                                <p className="text-gray-600">Connect with art enthusiasts and professionals worldwide</p>
                            </div>
                            
                            <div className="text-center">
                                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">AI Innovation</h3>
                                <p className="text-gray-600">Cutting-edge technology to enhance your art discovery</p>
                            </div>
                            
                            <div className="text-center">
                                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Passion Driven</h3>
                                <p className="text-gray-600">Created by art lovers, for art lovers</p>
                            </div>
                        </div>
                </div>
                </section>
            </div>
                {/* <TrendingNow /> */}
            <Footer />
        </>
    );
}

