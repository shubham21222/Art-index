import Image from "next/image";

const categories = [
    {
        title: "Expressionism",
        artists: [
            {
                name: "Robert Motherwell",
                nationality: "American",
                years: "1915–1991",
                image: "https://d7hftxdivxxvm.cloudfront.net?height=334&quality=80&resize_to=fill&src=https%3A%2F%2Fd32dm0rphc51dk.cloudfront.net%2FOd-aoUW7nDBWDN-yL46b1Q%2Flarger.jpg&width=445",
            },
            {
                name: "Arshile Gorky",
                nationality: "American",
                years: "1904–1948",
                image: "https://d7hftxdivxxvm.cloudfront.net?height=334&quality=80&resize_to=fill&src=https%3A%2F%2Fd32dm0rphc51dk.cloudfront.net%2FTpAIy8gZzlMVkSE3GYPAWA%2Flarger.jpg&width=445",
            },
            {
                name: "Willem de Kooning",
                nationality: "American",
                years: "1904–1997",
                image: "https://d7hftxdivxxvm.cloudfront.net?height=334&quality=80&resize_to=fill&src=https%3A%2F%2Fd32dm0rphc51dk.cloudfront.net%2Fvmu-Ly3U0NzUQFw18KAQoQ%2Flarger.jpg&width=445",
            },
            {
                name: "Norman Bluhm",
                nationality: "American",
                years: "1921–1999",
                image: "https://d7hftxdivxxvm.cloudfront.net?height=334&quality=80&resize_to=fill&src=https%3A%2F%2Fd32dm0rphc51dk.cloudfront.net%2FNVPMI-QYQmDO7Kd1I5ERkg%2Flarger.jpg&width=445",
            },
        ],
    },
    {
        title: "Pop Art",
        artists: [
            {
                name: "Claes Oldenburg",
                nationality: "Swedish",
                years: "1929–2022",
                image: "https://d7hftxdivxxvm.cloudfront.net?height=334&quality=80&resize_to=fill&src=https%3A%2F%2Fd32dm0rphc51dk.cloudfront.net%2F3cBysud27GWq8WY3iQd6TA%2Flarger.jpg&width=445",
            },
            {
                name: "Richard Hamilton",
                nationality: "British",
                years: "1922–2011",
                image: "https://d7hftxdivxxvm.cloudfront.net?height=334&quality=80&resize_to=fill&src=https%3A%2F%2Fd32dm0rphc51dk.cloudfront.net%2F6l4hbdofcvYkvQdTs9dipw%2Flarger.jpg&width=445",
            },
            {
                name: "Wayne Thiebaud",
                nationality: "American",
                years: "1920–2021",
                image: "https://d7hftxdivxxvm.cloudfront.net?height=334&quality=80&resize_to=fill&src=https%3A%2F%2Fd32dm0rphc51dk.cloudfront.net%2FxSx_4KbhoU89jqTmBxfI5g%2Flarger.jpg&width=445",
            },
            {
                name: "Roy Lichtenstein",
                nationality: "American",
                years: "1923–1997",
                image: "https://d7hftxdivxxvm.cloudfront.net?height=334&quality=80&resize_to=fill&src=https%3A%2F%2Fd32dm0rphc51dk.cloudfront.net%2FLmxcAz0Cr21qowtlhPE_zA%2Flarger.jpg&width=445",
            },
        ],
    }, {
        title: "Light and Space Movement",
        artists: [
            {
                name: "Mary Corse",
                nationality: "American",
                years: "b. 1945",
                image: "https://d7hftxdivxxvm.cloudfront.net?height=334&quality=80&resize_to=fill&src=https%3A%2F%2Fd32dm0rphc51dk.cloudfront.net%2FqDI1PlGT52YmmsyuGjy9bA%2Flarger.jpg&width=445",
            },
            {
                name: "Robert Irwin",
                nationality: "American",
                years: "1928–2023",
                image: "https://d7hftxdivxxvm.cloudfront.net?height=334&quality=80&resize_to=fill&src=https%3A%2F%2Fd32dm0rphc51dk.cloudfront.net%2FllObxOq3r8nj3Q1rU9C7ew%2Flarger.jpg&width=445",
            },
            {
                name: "Peter Alexander",
                nationality: "American",
                years: "1939–2020",
                image: "https://d7hftxdivxxvm.cloudfront.net?height=334&quality=80&resize_to=fill&src=https%3A%2F%2Fd32dm0rphc51dk.cloudfront.net%2FUIiAU5juLT8uEYsgeyptnQ%2Flarger.jpg&width=445",
            },
            {
                name: "Craig Kauffman",
                nationality: "American",
                years: "1932–2010",
                image: "https://d7hftxdivxxvm.cloudfront.net?height=334&quality=80&resize_to=fill&src=https%3A%2F%2Fd32dm0rphc51dk.cloudfront.net%2FZEv0EFrUZV-1Tovspq-eBQ%2Flarger.jpg&width=445",
            },
        ],
    },
    {
        title: "Hyperrealism",
        artists: [
            {
                name: "Karin Kneffel",
                nationality: "German",
                years: "b. 1957",
                image: "https://d7hftxdivxxvm.cloudfront.net?height=334&quality=80&resize_to=fill&src=https%3A%2F%2Fd32dm0rphc51dk.cloudfront.net%2FFinUAdLNbMlh3_HMK2SxnA%2Flarger.jpg&width=445",
            },
            {
                name: "Philip Pearlstein",
                nationality: "American",
                years: "1924–2022",
                image: "https://d7hftxdivxxvm.cloudfront.net?height=334&quality=80&resize_to=fill&src=https%3A%2F%2Fd32dm0rphc51dk.cloudfront.net%2FG09bgiPQBD3-_cwazlXA0w%2Flarger.jpg&width=445",
            },
            {
                name: "Ralph Goings",
                nationality: "American",
                years: "1928–2016",
                image: "https://d7hftxdivxxvm.cloudfront.net?height=334&quality=80&resize_to=fill&src=https%3A%2F%2Fd32dm0rphc51dk.cloudfront.net%2Fg-qvvNWwp4N0qwi98DbuXQ%2Flarge.jpg&width=445",
            },
            {
                name: "Claudio Bravo",
                nationality: "Chilean",
                years: "1936–2011",
                image: "https://d7hftxdivxxvm.cloudfront.net?height=334&quality=80&resize_to=fill&src=https%3A%2F%2Fd32dm0rphc51dk.cloudfront.net%2Fhss0pprj5cKGMX_y1doj9Q%2Flarger.jpg&width=445",
            },
        ],
    },
    {
        title: "Color Field Painting",
        artists: [
            {
                name: "Kenneth Noland",
                nationality: "American",
                years: "1924–2010",
                image: "https://d7hftxdivxxvm.cloudfront.net?height=334&quality=80&resize_to=fill&src=https%3A%2F%2Fd32dm0rphc51dk.cloudfront.net%2FsIa1qWEr6gZPqD3Ug4YT1Q%2Flarger.jpg&width=445",
            },
            {
                name: "Yun Hyong-keun",
                nationality: "South Korean",
                years: "1928–2007",
                image: "https://d7hftxdivxxvm.cloudfront.net?height=334&quality=80&resize_to=fill&src=https%3A%2F%2Fd32dm0rphc51dk.cloudfront.net%2FAC808NjQSNSRsBzCG0N5rQ%2Flarger.jpg&width=445",
            },
            {
                name: "Barnett Newman",
                nationality: "American",
                years: "1905–1970",
                image: "https://d7hftxdivxxvm.cloudfront.net?height=334&quality=80&resize_to=fill&src=https%3A%2F%2Fd32dm0rphc51dk.cloudfront.net%2FCXhxNSvNEviq1Nav03caEg%2Flarger.jpg&width=445",
            },
            {
                name: "Sam Gilliam",
                nationality: "American",
                years: "1933–2022",
                image: "https://d7hftxdivxxvm.cloudfront.net?height=334&quality=80&resize_to=fill&src=https%3A%2F%2Fd32dm0rphc51dk.cloudfront.net%2FWlmUop-Rpagfxjuea9q4Ww%2Flarger.jpg&width=445",
            },
        ],
    },
    {
        title: "Graffiti and Street Art",
        artists: [
            {
                name: "RISK",
                nationality: "American",
                years: "b. 1967",
                image: "https://d7hftxdivxxvm.cloudfront.net?height=334&quality=80&resize_to=fill&src=https%3A%2F%2Fd32dm0rphc51dk.cloudfront.net%2FWmpkOlfRIBpz6IylnpYR0Q%2Flarger.jpg&width=445",
            },
            {
                name: "OSGEMEOS",
                nationality: "Brazilian",
                years: "b. 1974",
                image: "https://d7hftxdivxxvm.cloudfront.net?height=334&quality=80&resize_to=fill&src=https%3A%2F%2Fd32dm0rphc51dk.cloudfront.net%2FkOX5M4JCmetRsrS8-k9TaQ%2Flarger.jpg&width=445",
            },
            {
                name: "LA II (Angel Ortiz)",
                nationality: "American",
                years: "b. 1967",
                image: "https://d7hftxdivxxvm.cloudfront.net?height=334&quality=80&resize_to=fill&src=https%3A%2F%2Fd32dm0rphc51dk.cloudfront.net%2FV0FgCLo6f6NmWe8BCJC5wQ%2Flarger.jpg&width=445",
            },
            {
                name: "Invader",
                nationality: "French",
                years: "b. 1969",
                image: "https://d7hftxdivxxvm.cloudfront.net?height=334&quality=80&resize_to=fill&src=https%3A%2F%2Fd32dm0rphc51dk.cloudfront.net%2Fs-DzfekPAQr95FnBqMwP3w%2Flarger.jpg&width=445",
            },
        ],
    },
];

export default function ArtGallery() {
    return (
        <div className=" mx-auto px-4 py-8">
            {categories.map((category, index) => (
                <div key={index} className="mb-16">
                    {/* Category Title */}
                    <h2 className="text-3xl  text-gray-800 mb-6">{category.title}</h2>

                    {/* Artists Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                        {category.artists.map((artist, idx) => (
                            <div key={idx} className="bg-white shadow-lg rounded-lg overflow-hidden">
                                {/* Artist Image */}
                                <div className="relative w-full h-[280px]">
                                    <Image
                                        src={artist.image}
                                        alt={artist.name}
                                        layout="fill"
                                        objectFit="cover"
                                    />
                                </div>
                                <div className="p-4">
                                    <h3 className="text-lg font-semibold">{artist.name}</h3>
                                    <p className="text-gray-600 text-sm">
                                        {artist.nationality}, {artist.years}
                                    </p>
                                    <button className="btn2 mt-3 w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition">
                                        Follow
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
