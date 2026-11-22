const FOLLOWUP_MESSAGE =
  'Take another look at HIM — just 7 products made for the Indian Man. Explore now: https://www.heismard.com/';

function normalizeIndianPhone(raw: string): string {
  const digits = String(raw || '').replace(/\D/g, '');
  if (digits.length === 10) return `91${digits}`;
  if (digits.length >= 11 && digits.length <= 15) return digits;
  return '';
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { phone, name, source = 'mobile_visit' } = req.body || {};
  const normalizedPhone = normalizeIndianPhone(phone);

  if (!normalizedPhone) {
    return res.status(400).json({
      success: false,
      error: 'Please enter a valid 10-digit WhatsApp mobile number.',
    });
  }

  const cleanVal = (val?: string) => (val || '').trim().replace(/^["']|["']$/g, '').trim();
  const accessToken = cleanVal(process.env.WHATSAPP_ACCESS_TOKEN);
  const phoneNumberId = cleanVal(process.env.WHATSAPP_PHONE_NUMBER_ID);
  const templateName = cleanVal(process.env.WHATSAPP_TEMPLATE_NAME);
  const templateLang = cleanVal(process.env.WHATSAPP_TEMPLATE_LANG) || 'en_US';
  const cleanName = String(name || '').replace(/<[^>]*>/g, '').trim().slice(0, 80);
  const personalizedText = cleanName
    ? `Hi ${cleanName}, ${FOLLOWUP_MESSAGE}`
    : FOLLOWUP_MESSAGE;

  if (accessToken && phoneNumberId) {
    const payload = templateName
      ? {
          messaging_product: 'whatsapp',
          to: normalizedPhone,
          type: 'template',
          template: {
            name: templateName,
            language: { code: templateLang },
          },
        }
      : {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: normalizedPhone,
          type: 'text',
          text: {
            preview_url: true,
            body: personalizedText,
          },
        };

    try {
      const waRes = await fetch(
        `https://graph.facebook.com/v21.0/${encodeURIComponent(phoneNumberId)}/messages`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      );

      const waData = await waRes.json().catch(() => ({}));
      if (!waRes.ok) {
        return res.status(502).json({
          success: false,
          delivered: false,
          error: waData?.error?.message || 'WhatsApp Cloud API rejected the message.',
          fallbackUrl: `https://wa.me/${normalizedPhone}?text=${encodeURIComponent(personalizedText)}`,
        });
      }

      return res.status(200).json({
        success: true,
        delivered: true,
        mode: 'whatsapp_cloud_api',
        messageId: waData?.messages?.[0]?.id || null,
        message: personalizedText,
        source,
      });
    } catch {
      return res.status(500).json({
        success: false,
        delivered: false,
        error: 'Unable to reach WhatsApp Cloud API right now.',
        fallbackUrl: `https://wa.me/${normalizedPhone}?text=${encodeURIComponent(personalizedText)}`,
      });
    }
  }

  return res.status(200).json({
    success: true,
    delivered: false,
    mode: 'deep_link_ready',
    message: personalizedText,
    whatsappUrl: `https://api.whatsapp.com/send?text=${encodeURIComponent(personalizedText)}`,
    source,
  });
}
