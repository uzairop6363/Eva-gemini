export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });
    const { id, status } = req.body;

    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (!url || !token) {
        return res.status(500).json({ success: false, message: "Config missing" });
    }

    const cleanUrl = url.trim().replace(/\/$/, "");
    const cleanToken = token.trim();

    try {
        const getRes = await fetch(`${cleanUrl}/get/withdraws`, {
            headers: { Authorization: `Bearer ${cleanToken}` }
        });
        const getData = await getRes.json();
        let withdraws = getData.result ? (typeof getData.result === 'string' ? JSON.parse(getData.result) : getData.result) : [];

        const item = withdraws.find(w => w.id === id);
        if (item) {
            item.status = status;

            await fetch(`${cleanUrl}/set/withdraws`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${cleanToken}` },
                body: JSON.stringify(withdraws)
            });

            return res.status(200).json({ success: true });
        }
        return res.status(404).json({ success: false, message: "Request not found" });
    } catch (e) {
        return res.status(500).json({ success: false, message: e.message });
    }
}
