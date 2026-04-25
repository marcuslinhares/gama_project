import axios from 'axios';

export const sendWhatsAppOTP = async (phone: string, code: string) => {
  const url = `${process.env.EVOLUTION_URL}/message/sendText/${process.env.EVOLUTION_INSTANCE}`;
  const text = `Seu código de acesso ao Marketplace B2B Russas é: ${code}`;
  
  try {
    await axios.post(url, {
      number: phone,
      text: text
    }, {
      headers: { 'apikey': process.env.EVOLUTION_KEY }
    });
    console.log(`[WhatsApp] OTP sent to ${phone}`);
  } catch (error) {
    console.error('Failed to send WhatsApp message', error);
    // In development, we fallback to log so we can still test without a real API
    console.log(`[DEV FALLBACK] OTP for ${phone}: ${code}`);
  }
};
