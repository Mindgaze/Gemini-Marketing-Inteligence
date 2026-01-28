
import React from 'react';
import { 
  LayoutDashboard, 
  Database, 
  Search, 
  BrainCircuit, 
  Menu,
  X,
  TrendingUp
} from 'lucide-react';
import { AppView } from '../types';

interface LayoutProps {
  currentView: AppView;
  setView: (view: AppView) => void;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ currentView, setView, children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);

  const menuItems = [
    { id: AppView.DATA_LAB, label: 'Data Lab', icon: Database },
    { id: AppView.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
    { id: AppView.REVENUE_PREDICTOR, label: 'Revenue Predictor', icon: TrendingUp },
    { id: AppView.SEMANTIC_SEARCH, label: 'Semantic Search', icon: Search },
    { id: AppView.AI_AUDITOR, label: 'AI Auditor', icon: BrainCircuit },
  ];

  return (
    <div className="flex h-screen bg-[#0f172a] text-slate-200 overflow-hidden">
      {/* Sidebar */}
      <aside 
        className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-[#1e293b] border-r border-slate-700/50 transition-all duration-300 flex flex-col`}
      >
        <div className="p-6 flex items-center justify-between">
          {isSidebarOpen && <span className="font-bold text-xl bg-gradient-to-r from-teal-400 to-blue-500 bg-clip-text text-transparent">MarketPro AI</span>}
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-1 hover:bg-slate-700 rounded transition-colors">
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="flex-1 mt-6 px-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all ${
                currentView === item.id 
                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-lg shadow-blue-500/10' 
                : 'hover:bg-slate-800 text-slate-400'
              }`}
            >
              <item.icon size={20} />
              {isSidebarOpen && <span className="font-medium">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-700/50">
          <div className={`p-3 bg-slate-800/50 rounded-lg flex items-center gap-3 ${!isSidebarOpen && 'justify-center'}`}>
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-teal-500 to-blue-500 flex items-center justify-center text-xs font-bold text-white">GM</div>
            {isSidebarOpen && (
              <div className="flex flex-col overflow-hidden">
                <span className="text-sm font-semibold truncate">Growth Manager</span>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider">Premium Access</span>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative bg-[#0f172a]">
        <header className="sticky top-0 z-10 bg-[#0f172a]/80 backdrop-blur-md border-b border-slate-800 px-8 py-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold capitalize text-slate-100">
            {menuItems.find(i => i.id === currentView)?.label}
          </h1>
          <div className="flex items-center gap-4">
             <div className="px-3 py-1 bg-green-500/10 text-green-400 text-xs font-medium rounded-full border border-green-500/20">
               Gemini Flash Ready
             </div>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
