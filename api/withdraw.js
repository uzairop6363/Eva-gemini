export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });

    const requestData = req.body;
    requestData.status = "Pending";

    let url = process.env.UPSTASH_REDIS_REST_URL;
    let token = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (!url || !token) {
        return res.status(500).json({ 
            success: false, 
            message: "Vercel Variables Missing! Dashboard check karein." 
        });
    }

    // Extra spaces aur quotes clean karna
    url = url.trim().replace(/['"]/g, '').replace(/\/$/, "");
    token = token.trim().replace(/['"]/g, '');

    try {
        // 1. Existing data fetch
        const getRes = await fetch(`${url}/get/withdraws`, {
            method: 'GET',
            headers: { 
                'Authorization': `Bearer ${token}` 
            }
        });

        const getStatus = getRes.status;
        const getData = await getRes.json();
        
        if (getStatus !== 200) {
            return res.status(500).json({
                success: false,
                message: `Upstash Connection Failed (${getStatus}): ${getData.error || 'Unauthorized/Invalid Token'}`
            });
        }

        let withdraws = [];
        if (getData && getData.result) {
            try {
                withdraws = typeof getData.result === 'string' ? JSON.parse(getData.result) : getData.result;
            } catch (e) {
                withdraws = [];
            }
        }

        withdraws.push(requestData);

        // 2. Save Updated Array to Upstash (URL Path Command - 100% Reliable)
        const setRes = await fetch(`${url}/set/withdraws/${encodeURIComponent(JSON.stringify(withdraws))}`, {
            method: 'GET',
            headers: { 
                'Authorization': `Bearer ${token}` 
            }
        });

        const setStatus = setRes.status;
        const setData = await setRes.json();

        if (setStatus === 200 && setData.result === "OK") {
            return res.status(200).json({ success: true, message: "Request Saved Successfully!" });
        } else {
            return res.status(500).json({ 
                success: false, 
                message: `Save Failed (${setStatus}): ${setData.error || 'Upstash Rejected Data'}` 
            });
        }
    } catch (e) {
        return res.status(500).json({ success: false, message: "Network Catch Error: " + e.message });
    }
}
