export default async function handler(req, res) {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (!url || !token) {
        return res.status(200).json({ success: true, withdraws: [] });
    }

    try {
        const response = await fetch(`${url}/get/withdraws`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const data = await response.json();
        const withdraws = data.result ? JSON.parse(data.result) : [];
        return res.status(200).json({ success: true, withdraws });
    } catch (e) {
        return res.status(500).json({ success: false, withdraws: [] });
    }
}
