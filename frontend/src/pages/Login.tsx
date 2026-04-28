import React, { useState } from 'react';
import { Smartphone, Send, ArrowRight } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: (user: any, token: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [step, setView] = useState<'phone' | 'otp'>('phone');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Formatar telefone (remover caracteres não numéricos)
    const cleanPhone = phone.replace(/\D/g, '');
    const formattedPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;

    try {
      // API call placeholder
      const response = await fetch('/api/auth/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: formattedPhone }),
      });

      if (response.ok) {
        setView('otp');
      } else {
        const data = await response.json();
        setError(data.message || 'Erro ao solicitar código');
      }
    } catch (err) {
      setError('Falha na conexão com o servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const cleanPhone = phone.replace(/\D/g, '');
    const formattedPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;

    try {
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: formattedPhone, code }),
      });

      if (response.ok) {
        const data = await response.json();
        onLoginSuccess(data.user, data.token);
      } else {
        setError('Código inválido ou expirado');
      }
    } catch (err) {
      setError('Erro ao verificar código');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-surface dark:bg-surface-lowest min-h-screen flex flex-col justify-center p-6">
      <div className="max-w-md w-full mx-auto space-y-8">
        <div className="text-center">
          <div className="bg-primary/10 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Smartphone size={40} className="text-primary" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">Marketplace B2B</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2">Acesso exclusivo para lojistas de Russas/CE</p>
        </div>

        <div className="bg-white dark:bg-surface-lowest p-8 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700">
          {step === 'phone' ? (
            <form onSubmit={handleRequestOTP} className="space-y-6">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest block mb-2 px-1">
                  Seu Telefone (WhatsApp)
                </label>
                <input
                  type="tel"
                  placeholder="(88) 99999-9999"
                  className="w-full bg-surface-low border-2 border-transparent focus:border-primary focus:bg-white rounded-2xl p-4 text-lg font-bold transition-all outline-none"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>

              {error && <p className="text-red-500 text-xs font-bold text-center">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-primary-container text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-primary/20 transition-all active:scale-95 disabled:opacity-50"
              >
                {loading ? 'Enviando...' : 'Receber Código via WhatsApp'}
                {!loading && <Send size={20} />}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP} className="space-y-6">
              <div className="text-center mb-4">
                <p className="text-sm text-slate-500 dark:text-slate-400">Enviamos um código para o número <br /><span className="font-bold text-slate-900 dark:text-slate-100">{phone}</span></p>
                <button type="button" onClick={() => setView('phone')} className="text-xs text-primary font-bold mt-1">Alterar número</button>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest block mb-2 px-1">
                  Código de 6 dígitos
                </label>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="000000"
                  className="w-full bg-surface-low border-2 border-transparent focus:border-primary focus:bg-white rounded-2xl p-4 text-center text-2xl font-black tracking-[0.5em] transition-all outline-none"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                />
              </div>

              {error && <p className="text-red-500 text-xs font-bold text-center">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3 shadow-lg transition-all active:scale-95 disabled:opacity-50"
              >
                {loading ? 'Verificando...' : 'Entrar no Marketplace'}
                {!loading && <ArrowRight size={20} />}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-[10px] text-slate-400 dark:text-slate-500 font-medium">
          Ao entrar, você concorda com nossos termos de uso e política de privacidade.
        </p>
      </div>
    </div>
  );
};

export default Login;
