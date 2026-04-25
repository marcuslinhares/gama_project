import React from 'react';
import { CheckCircle, Send, ShoppingBag, ArrowRight } from 'lucide-react';

interface OrderSuccessProps {
  orderId: string;
  onHome: () => void;
}

const OrderSuccess: React.FC<OrderSuccessProps> = ({ orderId, onHome }) => {
  const sendWhatsapp = () => {
    const text = encodeURIComponent(`Olá! Acabei de realizar o pedido ${orderId} no Marketplace Russas e gostaria de agilizar a aprovação.`);
    // Número fictício do distribuidor
    window.open(`https://wa.me/5588999999999?text=${text}`, '_blank');
  };

  return (
    <div className="bg-white min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-green-100 rounded-full scale-150 animate-pulse" />
        <CheckCircle size={80} className="text-green-500 relative z-10" />
      </div>
      
      <h2 className="text-2xl font-black text-slate-900 leading-tight">Pedido Realizado<br />com Sucesso!</h2>
      <p className="text-slate-500 mt-4 max-w-[240px]">
        O distribuidor foi notificado e revisará seu crédito em breve.
      </p>

      <div className="mt-8 bg-surface-low px-6 py-4 rounded-2xl border border-surface-high/20">
        <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-1">Número do Pedido</span>
        <span className="text-xl font-black text-primary tracking-tight">#{orderId}</span>
      </div>
      
      <div className="mt-12 w-full space-y-3">
        <button 
          onClick={sendWhatsapp} 
          className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-green-500/20 active:scale-95 transition-all"
        >
          <Send size={20} /> Agilizar no WhatsApp
        </button>
        
        <button 
          onClick={onHome} 
          className="w-full flex items-center justify-center gap-2 text-slate-500 font-bold py-4 hover:text-primary transition-colors"
        >
          Voltar ao Catálogo <ArrowRight size={18} />
        </button>
      </div>

      <p className="mt-12 text-[10px] text-slate-300 font-medium">
        Marketplace B2B Russas • Powered by Nexus
      </p>
    </div>
  );
};

export default OrderSuccess;
