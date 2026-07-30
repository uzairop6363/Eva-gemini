global.withdraws = global.withdraws || [];

export default function handler(req, res) {
    const { phone } = req.query;
    const userWithdraws = global.withdraws.filter(w => w.registeredPhone === phone);
    return res.status(200).json({ success: true, withdraws: userWithdraws });
}
