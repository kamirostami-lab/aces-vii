// Edge Function — Returns polling data as JSON
// Deployed to /api/polling.json
// Enables client-side refresh without rebuild

export default async (request, context) => {
    const url = new URL(request.url);

    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': 'https://acestrategies.au',
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=3600'
    };

    if (request.method === 'OPTIONS') {
        return new Response(null, { headers });
    }

    try {
        const sheetId = context.env.GOOGLE_SHEETS_ID;
        const apiKey = context.env.GOOGLE_SHEETS_API_KEY;

        if (!sheetId || !apiKey) {
            console.error('Missing GOOGLE_SHEETS_ID or GOOGLE_SHEETS_API_KEY environment variables');
            return new Response(JSON.stringify({ error: 'Service misconfigured' }), { status: 503, headers });
        }
        const range = url.searchParams.get('state') === 'federal'
            ? 'Federal Polling!A2:H2'
            : 'SA Polling!A2:H2';

        const response = await fetch(
            `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?key=${apiKey}`
        );

        const data = await response.json();
        const values = data.values?.[0] || [];

        const pollingData = {
            state: url.searchParams.get('state') === 'federal' ? 'federal' : 'sa',
            labor_tpp: parseFloat(values[0]) || 66,
            liberal_tpp: parseFloat(values[1]) || 34,
            labor_primary: parseFloat(values[2]) || 47,
            liberal_primary: parseFloat(values[3]) || 21,
            greens_primary: parseFloat(values[4]) || 13,
            sample_size: parseInt(values[5]) || 1006,
            margin_of_error: parseFloat(values[6]) || 3.9,
            last_updated: values[7] || new Date().toISOString().split('T')[0],
            _cached_at: new Date().toISOString()
        };

        return new Response(JSON.stringify(pollingData, null, 2), { headers });

    } catch (error) {
        return new Response(JSON.stringify({
            error: 'Failed to fetch polling data',
            message: error.message
        }), {
            status: 500,
            headers
        });
    }
};

export const config = {
    path: "/api/polling.json"
};