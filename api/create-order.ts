import Razorpay from 'razorpay';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    return res.status(401).json({
      success: false,
      error: 'Razorpay credentials are not configured on the server.',
    });
  }

  const { amount, currency = 'INR', receipt } = req.body || {};
  const parsedAmount = Math.round(Number(amount));

  if (!Number.isFinite(parsedAmount) || parsedAmount < 100) {
    return res.status(400).json({
      success: false,
      error: 'Amount must be at least 100 paise.',
    });
  }

  const cleanCurrency = String(currency || 'INR').trim().toUpperCase().slice(0, 10) || 'INR';
  const cleanReceipt = String(receipt || `him_rcpt_${Date.now()}`).trim().slice(0, 40);

  try {
    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const order = await razorpay.orders.create({
      amount: parsedAmount,
      currency: cleanCurrency,
      receipt: cleanReceipt,
    });

    return res.status(200).json({
      success: true,
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      key_id: keyId,
    });
  } catch (err: any) {
    const statusCode = Number(err?.statusCode || err?.status || 500);
    const description =
      err?.error?.description || err?.message || 'Failed to create Razorpay order.';

    if (statusCode === 401) {
      return res.status(401).json({ success: false, error: description });
    }
    return res.status(500).json({ success: false, error: description });
  }
}
