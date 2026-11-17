import crypto from 'crypto';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) {
    return res.status(401).json({
      success: false,
      verified: false,
      error: 'Razorpay secret key is not configured on the server.',
    });
  }

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body || {};

  if (
    typeof razorpay_order_id !== 'string' ||
    !razorpay_order_id.trim() ||
    typeof razorpay_payment_id !== 'string' ||
    !razorpay_payment_id.trim() ||
    typeof razorpay_signature !== 'string' ||
    !razorpay_signature.trim()
  ) {
    return res.status(400).json({
      success: false,
      verified: false,
      error: 'Missing required payment verification fields.',
    });
  }

  const generatedSignature = crypto
    .createHmac('sha256', keySecret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  const providedBuf = Buffer.from(razorpay_signature.trim(), 'utf8');
  const expectedBuf = Buffer.from(generatedSignature, 'utf8');

  const isValid =
    providedBuf.length === expectedBuf.length &&
    crypto.timingSafeEqual(providedBuf, expectedBuf);

  if (!isValid) {
    return res.status(400).json({
      success: false,
      verified: false,
      error: 'Payment signature verification failed.',
    });
  }

  return res.status(200).json({
    success: true,
    verified: true,
    razorpay_order_id,
    razorpay_payment_id,
  });
}
