global.withdraws = global.withdraws || [];

export default function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });
    const requestData = req.body;
    requestData.status = "Pending";
    global.withdraws.push(requestData);
    return res.status(200).json({ success: true, message: "Request Recorded" });
}
