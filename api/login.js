export default function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });
    const { phone, password } = req.body;
    return res.status(200).json({
        success: true,
        user: { name: "User " + phone.slice(-4), phone: phone, wallet: 0, reward: 0, ads: 5, watchedAds: 0, plan: "FREE PLAN" }
    });
}
