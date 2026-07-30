export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });
    const { id, status } = req.body;

    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;

    try {
        const getRes = await fetch(`${url}/get/withdraws`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const getData = await getRes.json();
        let withdraws = getData.result ? JSON.parse(getData.result) : [];

        const item = withdraws.find(w => w.id === id);
        if (item) {
            item.status = status;

            await fetch(`${url}/set/withdraws`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: JSON.stringify(JSON.stringify(withdraws))
            });

            return res.status(200).json({ success: true });
        }
        return res.status(404).json({ success: false, message: "Request not found" });
    } catch (e) {
        return res.status(500).json({ success: false, message: e.message });
    }
}
