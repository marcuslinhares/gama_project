import React from 'react';
import Home from './pages/Home';

function App() {
  return (
    <div className="min-h-screen bg-surface">
      <Home />
      
      {/* Bottom Nav Mockup */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md px-6 py-4 flex justify-between items-center shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <button className="text-primary flex flex-col items-center gap-1">
          <div className="w-1 h-1 bg-primary rounded-full"></div>
          <span className="text-[10px] font-bold">Início</span>
        </button>
        <button className="text-slate-400 flex flex-col items-center gap-1">
          <span className="text-[10px] font-bold">Carrinho</span>
        </button>
        <button className="text-slate-400 flex flex-col items-center gap-1">
          <span className="text-[10px] font-bold">Meus Pedidos</span>
        </button>
      </nav>
    </div>
  );
}

export default App;
