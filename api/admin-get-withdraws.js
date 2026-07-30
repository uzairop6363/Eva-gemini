export default async function handler(req, res) {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (!url || !token) {
        return res.status(200).json({ success: true, withdraws: [] });
    }

    const cleanUrl = url.trim().replace(/\/$/, "");
    const cleanToken = token.trim();

    try {
        const response = await fetch(`${cleanUrl}/get/withdraws`, {
            headers: { Authorization: `Bearer ${cleanToken}` }
        });
        const data = await response.json();

        let withdraws = [];
        if (data && data.result) {
            withdraws = typeof data.result === 'string' ? JSON.parse(data.result) : data.result;
        }

        return res.status(200).json({ success: true, withdraws });
    } catch (e) {
        return res.status(500).json({ success: false, withdraws: [] });
    }
}
