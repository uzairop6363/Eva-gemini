global.withdraws = global.withdraws || [];

export default function handler(req, res) {
    return res.status(200).json({ success: true, withdraws: global.withdraws });
}
