global.withdraws = global.withdraws || [];

export default function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });
    const { id, status } = req.body;
    const item = global.withdraws.find(w => w.id === id);
    if (item) {
        item.status = status;
        return res.status(200).json({ success: true });
    }
    return res.status(404).json({ success: false, message: "Request not found" });
}
