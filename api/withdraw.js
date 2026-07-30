export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });

    const requestData = req.body;
    requestData.status = "Pending";

    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (!url || !token) {
        return res.status(500).json({ 
            success: false, 
            message: "Missing Environment Variables" 
        });
    }

    const cleanUrl = url.trim().replace(/\/$/, "");
    const cleanToken = token.trim();

    try {
        // 1. Get existing withdraws list
        const getRes = await fetch(`${cleanUrl}/get/withdraws`, {
            headers: { Authorization: `Bearer ${cleanToken}` }
        });
        const getData = await getRes.json();
        
        let withdraws = [];
        if (getData && getData.result) {
            try {
                withdraws = typeof getData.result === 'string' ? JSON.parse(getData.result) : getData.result;
            } catch (e) {
                withdraws = [];
            }
        }

        // Add new withdraw
        withdraws.push(requestData);

        // 2. Upstash REST API POST Array Command (Correct Native Format)
        const setRes = await fetch(`${cleanUrl}`, {
            method: 'POST',
            headers: { 
                Authorization: `Bearer ${cleanToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(["SET", "withdraws", JSON.stringify(withdraws)])
        });

        const setData = await setRes.json();

        if (setData && setData.result === "OK") {
            return res.status(200).json({ success: true, message: "Request Saved Successfully" });
        } else {
            return res.status(500).json({ 
                success: false, 
                message: "Upstash save failed", 
                rawError: setData 
            });
        }
    } catch (e) {
        return res.status(500).json({ success: false, message: e.message });
    }
}
