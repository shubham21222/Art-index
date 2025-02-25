import Image from 'next/image';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function ArtsyPage() {
    return (
        <>
            <Header />
            <div className="max-w-[1500px] mx-auto md:mt-0 mt-8 min-h-screen  text-black">
                <div className="max-w-7xl mx-auto py-10 text-center">
                    <input
                        type="text"
                        placeholder="Search by Artist Name"
                        className="w-full p-3 border rounded"
                    />
                    <div className="flex justify-center gap-4 mt-4">
                        <select className="border p-2 rounded">
                            <option>Medium</option>
                        </select>
                        <select className="border p-2 rounded">
                            <option>Size</option>
                        </select>
                    </div>
                    <button className="mt-4 bg-black text-white px-6 py-2 rounded">Search</button>
                </div>

                {/* Main Content */}
                <div className="mx-auto px-4">
                    <h1 className="text-3xl font-bold">Auction records from 300,000 artists — and counting</h1>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-6">
                        {[
                            { name: 'Banksy', img: 'https://files.artsy.net/images/banksy.png' },
                            { name: 'David Hockney', img: 'https://files.artsy.net/images/david_hockney.png' },
                            { name: 'KAWS', img: 'https://files.artsy.net/images/kaws.png' },
                            { name: 'Takashi Murakami', img: 'https://files.artsy.net/images/takashi_murakami.png' },
                        ].map((artist) => (
                            <div key={artist.name} className="text-center">
                                <div className="relative w-20 h-20 mx-auto mb-2">
                                    <Image
                                        src={artist.img}
                                        alt={artist.name}
                                        layout="fill"
                                        objectFit="cover"
                                        className="rounded-full"
                                    />
                                </div>
                                <p className="text-lg font-semibold">{artist.name}</p>
                            </div>
                        ))}
                    </div>

                    {/* Section 1: Image on Right, Content on Left */}
                    <div className="flex flex-col md:flex-row gap-6 py-6">
                        <div className="md:w-1/2">
                            <h2 className="text-2xl font-bold">Research and validate prices</h2>
                            <p>Access the data you need to make the right decisions for your collection.</p>
                        </div>
                        <div className="md:w-1/2 relative" style={{ height: '600px' }}> {/* Set a fixed height */}
                            <Image
                                src="https://d7hftxdivxxvm.cloudfront.net?height=660&quality=80&resize_to=fill&src=https%3A%2F%2Ffiles.artsy.net%2Fimages%2Fkehinde_wiley_portrait_of_nelly_moudime_ii.png&width=800"
                                alt="Kehinde Wiley"
                                fill
                                className="object-cover"
                            />
                        </div>
                    </div>

                    {/* Section 2: Image on Left, Content on Right (Reversed Layout) */}
                    <div className="flex flex-col md:flex-row-reverse gap-6 py-6">
                        <div className="md:w-1/2">
                            <h2 className="text-2xl font-bold">Search for free</h2>
                            <p>The Artsy Price Database is for every collector—no subscriptions, no limits.</p>
                        </div>
                        <div className="md:w-1/2 relative" style={{ height: '600px' }}> {/* Set a fixed height */}
                            <Image
                                src="https://d7hftxdivxxvm.cloudfront.net?height=660&quality=80&resize_to=fill&src=https%3A%2F%2Ffiles.artsy.net%2Fimages%2Fdamien_hirst_kindness.jpg&width=800"
                                alt="Kehinde Wiley"
                                fill
                                className="object-cover"
                            />
                        </div>
                    </div>

                    {/* Section 3: Image on Right, Content on Left */}
                    <div className="flex flex-col md:flex-row gap-6 py-6">
                        <div className="md:w-1/2">
                            <h2 className="text-2xl font-bold">Track artists and their markets</h2>
                            <p>Get insights into artists you follow with a personalized feed in the Artsy app.</p>
                        </div>
                        <div className="md:w-1/2 relative" style={{ height: '600px' }}> {/* Set a fixed height */}
                            <Image
                                src="https://d7hftxdivxxvm.cloudfront.net?height=660&quality=80&resize_to=fill&src=https%3A%2F%2Ffiles.artsy.net%2Fimages%2Fmatthew_wong_morning.jpg&width=800"
                                alt="Kehinde Wiley"
                                fill
                                className="object-cover"
                            />
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
}