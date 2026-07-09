export const sendWhatsAppOTP = async (phone: string, code: string) => {
  const url = `${process.env.EVOLUTION_URL}/message/sendText/${process.env.EVOLUTION_INSTANCE}`;
  const text = `Seu código de acesso ao Marketplace B2B Russas é: ${code}`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': process.env.EVOLUTION_KEY || '',
      },
      body: JSON.stringify({ number: phone, text }),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    console.log(`[WhatsApp] OTP sent to ${phone}`);
  } catch (error) {
    console.error('Failed to send WhatsApp message', error);
    console.log(`[DEV FALLBACK] OTP for ${phone}: ${code}`);
  }
};
