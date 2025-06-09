export async function POST(request) {
    try {
        const body = await request.json();
        const { query, variables } = body;

        const response = await fetch("https://metaphysics-cdn.artsy.net/v2", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ query, variables }),
        });

        const data = await response.json();
        return Response.json(data);
    } catch (error) {
        console.error("Error in artwork API route:", error);
        return Response.json({ error: "Internal Server Error" }, { status: 500 });
    }
} 