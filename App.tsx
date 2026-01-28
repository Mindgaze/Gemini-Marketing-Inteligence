import React, { useState, useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line 
} from 'recharts';
import { 
  CloudUpload, 
  Search, 
  Zap, 
  Target, 
  AlertCircle,
  TrendingUp,
  Activity,
  Globe,
  BrainCircuit,
  Trash2,
  CheckCircle2,
  Clock,
  ChevronRight,
  Sparkles,
  Link as LinkIcon,
  Database,
  LayoutDashboard,
  Cpu,
  Coins,
  ArrowRight,
  Layers,
  FileSpreadsheet,
  // Add missing FileText icon
  FileText
} from 'lucide-react';
import Layout from './components/Layout';
import MetricsCard from './components/MetricsCard';
import { AppView, MarketingRow, AnalysisResult, FileRecord } from './types';
import { analyzeMarketingData, predictRevenue, semanticSearchQuery } from './services/geminiService';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.DATA_LAB);
  
  // REAL data parsed from files
  const [data, setData] = useState<MarketingRow[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<FileRecord[]>([]);
  
  // UI States
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<AnalysisResult | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<MarketingRow[]>([]);
  
  // Predictor States
  const [predictionData, setPredictionData] = useState({
    c_date: new Date().toISOString().split('T')[0],
    campaign_name: '',
    category: 'search',
    impressions: 100000,
    mark_spent: 5000,
    clicks: 2500,
    leads: 120,
    orders: 45
  });
  const [predictedRevenue, setPredictedRevenue] = useState<number | null>(null);
  const [isPredicting, setIsPredicting] = useState(false);

  // CSV Parsing Helper
  const parseCSV = (text: string): MarketingRow[] => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];
    
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    return lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim());
      const row: any = {};
      headers.forEach((header, i) => {
        const val = values[i];
        if (['impressions', 'clicks', 'conversions', 'spend', 'revenue', 'leads', 'orders'].includes(header)) {
          row[header] = parseFloat(val) || 0;
        } else {
          row[header] = val;
        }
      });
      
      // Calculate derived metrics locally (No Gemini here)
      row.ctr = (row.clicks || 0) / (row.impressions || 1);
      row.cpa = (row.spend || 0) / (row.conversions || 1);
      row.cpc = (row.spend || 0) / (row.clicks || 1);
      
      return row as MarketingRow;
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    // Fix: Explicitly cast Array.from(files) to File[] to avoid 'unknown' type errors
    for (const file of Array.from(files) as File[]) {
      const fileId = Math.random().toString(36).substr(2, 9);
      const newFile: FileRecord = {
        id: fileId,
        name: file.name,
        size: file.size,
        type: file.type,
        uploadDate: new Date(),
        rowCount: 0,
        status: 'processing'
      };

      setUploadedFiles(prev => [newFile, ...prev]);

      const reader = new FileReader();
      reader.onload = async (event) => {
        const text = event.target?.result as string;
        const parsedData = parseCSV(text);
        
        setData(prev => [...prev, ...parsedData]);
        setUploadedFiles(prev => prev.map(f => 
          f.id === fileId ? { ...f, status: 'ready', rowCount: parsedData.length } : f
        ));
      };
      // Fix: Now correctly receives File object (which extends Blob)
      reader.readAsText(file);
    }
  };

  const stats = useMemo(() => {
    if (data.length === 0) return { impressions: 0, clicks: 0, conversions: 0, spend: 0, ctr: 0, cpa: 0, revenue: 0 };
    const total = data.reduce((acc, row) => ({
      impressions: acc.impressions + (row.impressions || 0),
      clicks: acc.clicks + (row.clicks || 0),
      conversions: acc.conversions + (row.conversions || 0),
      spend: acc.spend + (row.spend || 0),
      revenue: acc.revenue + (row.revenue || 0)
    }), { impressions: 0, clicks: 0, conversions: 0, spend: 0, revenue: 0 });
    
    return {
      ...total,
      ctr: (total.clicks / total.impressions) * 100,
      cpa: total.spend / (total.conversions || 1)
    };
  }, [data]);

  const handleSemanticSearch = async () => {
    if (!searchQuery || data.length === 0) return;
    setIsSearching(true);
    try {
      const sample = data.slice(0, 30).map((d, i) => `${i}: ${d.campaign_name} - ${d.ad_copy}`).join('\n');
      const indices = await semanticSearchQuery(searchQuery, sample);
      setSearchResults(indices.map(idx => data[idx]).filter(Boolean));
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  const handlePredict = async () => {
    if (data.length === 0) return;
    setIsPredicting(true);
    try {
      const context = JSON.stringify(data.slice(0, 15));
      const result = await predictRevenue(predictionData, context);
      setPredictedRevenue(result);
    } catch (err) {
      console.error(err);
    } finally {
      setIsPredicting(false);
    }
  };

  const removeFile = (id: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== id));
    if (uploadedFiles.length <= 1) setData([]);
  };

  return (
    <Layout currentView={currentView} setView={setCurrentView}>
      {currentView === AppView.DATA_LAB && (
        <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {/* Actual File Input */}
              <div className="bg-slate-800/40 border border-slate-700/50 rounded-[32px] p-12 flex flex-col items-center justify-center text-center transition-all hover:bg-slate-800/60 group">
                <div className="w-20 h-20 bg-blue-500/10 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <FileSpreadsheet size={40} className="text-blue-400" />
                </div>
                <h3 className="text-2xl font-black mb-3 text-slate-100">Ingest Raw Datasets</h3>
                <p className="text-sm text-slate-400 mb-8 max-w-sm">
                  Upload your CSV files. The platform will parse them locally and prepare them for AI-driven auditing.
                </p>
                <label className="bg-blue-600 hover:bg-blue-500 text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest cursor-pointer transition-all active:scale-95 shadow-xl shadow-blue-900/20">
                  Select CSV Files
                  <input type="file" className="hidden" multiple accept=".csv" onChange={handleFileUpload} />
                </label>
              </div>

              {/* Real-time Parsed Data Stream */}
              <div className="bg-slate-800/40 border border-slate-700/50 rounded-[32px] overflow-hidden shadow-2xl flex flex-col min-h-[400px]">
                <div className="p-6 border-b border-slate-700/50 flex items-center justify-between bg-slate-900/20">
                  <h3 className="font-bold flex items-center gap-2">
                    <Activity size={18} className="text-emerald-400" />
                    Verified Repository Stream
                  </h3>
                  <span className="text-[10px] font-black uppercase bg-slate-900 px-3 py-1 rounded-full text-slate-500 border border-slate-700">
                    Live Nodes: {data.length}
                  </span>
                </div>
                {data.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-900/50 border-b border-slate-700 text-slate-500 font-black uppercase tracking-widest">
                        <tr>
                          <th className="px-6 py-4">Campaign</th>
                          <th className="px-6 py-4">Spend</th>
                          <th className="px-6 py-4">Impressions</th>
                          <th className="px-6 py-4">Clicks</th>
                          <th className="px-6 py-4">Efficiency</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/50">
                        {data.slice(0, 10).map((row, i) => (
                          <tr key={i} className="hover:bg-slate-700/20 transition-colors">
                            <td className="px-6 py-4 font-bold text-slate-200">{row.campaign_name || 'N/A'}</td>
                            <td className="px-6 py-4 text-slate-400">${row.spend?.toLocaleString()}</td>
                            <td className="px-6 py-4 text-slate-400">{row.impressions?.toLocaleString()}</td>
                            <td className="px-6 py-4 text-slate-400">{row.clicks?.toLocaleString()}</td>
                            <td className="px-6 py-4">
                               <div className="flex flex-col">
                                 <span className="text-blue-400 font-bold">{(row.ctr! * 100).toFixed(2)}% CTR</span>
                                 <span className="text-teal-400 font-bold">${row.cpa?.toFixed(2)} CPA</span>
                               </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center opacity-30 p-12 text-center">
                    <Database size={48} className="mb-4" />
                    <p className="text-sm font-black uppercase tracking-widest">Repository Empty</p>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar List */}
            <div className="bg-slate-800/40 border border-slate-700/50 rounded-[32px] p-6 shadow-xl h-fit">
              <h3 className="font-bold mb-6 flex items-center gap-2">
                <Layers size={18} className="text-blue-400" />
                Active Source Registry
              </h3>
              <div className="space-y-4">
                {uploadedFiles.map(file => (
                  <div key={file.id} className="bg-slate-900/50 border border-slate-700/50 rounded-2xl p-4 group">
                    <div className="flex justify-between items-start">
                       <div className="flex gap-3">
                          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                             <FileText size={20} />
                          </div>
                          <div>
                             <h4 className="text-xs font-bold truncate max-w-[120px]">{file.name}</h4>
                             <p className="text-[10px] text-slate-500">{file.rowCount} rows parsed</p>
                          </div>
                       </div>
                       <button onClick={() => removeFile(file.id)} className="text-slate-700 hover:text-rose-500 transition-colors">
                         <Trash2 size={16} />
                       </button>
                    </div>
                  </div>
                ))}
                {uploadedFiles.length === 0 && (
                   <div className="text-center py-10 opacity-30 border-2 border-dashed border-slate-700 rounded-2xl">
                      <p className="text-[10px] font-black uppercase">No Active Sources</p>
                   </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {currentView === AppView.DASHBOARD && (
        <div className="space-y-8 animate-in fade-in duration-500">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricsCard title="Raw Impressions" value={stats.impressions.toLocaleString()} />
            <MetricsCard title="Parsed Revenue" value={stats.revenue.toLocaleString()} prefix="$" />
            <MetricsCard title="Global Average CTR" value={stats.ctr.toFixed(2)} suffix="%" />
            <MetricsCard title="Aggregated Spend" value={stats.spend.toLocaleString()} prefix="$" />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-slate-800/40 border border-slate-700/50 p-8 rounded-[32px] h-96">
               <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-6">Real Performance Distribution</h4>
               <ResponsiveContainer width="100%" height="80%">
                  <BarChart data={data.slice(0, 15)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="campaign_name" hide />
                    <YAxis stroke="#94a3b8" fontSize={10} />
                    <RechartsTooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155' }} />
                    <Bar dataKey="spend" fill="#3b82f6" name="Spend ($)" />
                    <Bar dataKey="revenue" fill="#10b981" name="Revenue ($)" />
                  </BarChart>
               </ResponsiveContainer>
            </div>
            <div className="bg-slate-800/40 border border-slate-700/50 p-8 rounded-[32px] h-96">
               <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-6">Efficiency Trend (CPA)</h4>
               <ResponsiveContainer width="100%" height="80%">
                  <LineChart data={data.slice(0, 20)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="campaign_name" hide />
                    <YAxis stroke="#94a3b8" fontSize={10} />
                    <RechartsTooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155' }} />
                    <Line type="monotone" dataKey="cpa" stroke="#8b5cf6" strokeWidth={3} dot={false} />
                  </LineChart>
               </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {currentView === AppView.SEMANTIC_SEARCH && (
        <div className="space-y-8 animate-in fade-in max-w-5xl mx-auto">
          <div className="relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-teal-400 transition-colors" size={24} />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSemanticSearch()}
              placeholder="Query themes like 'high ROI tech campaigns' or 'weekend social performance'..."
              className="w-full bg-slate-800/50 border border-slate-700 rounded-3xl py-6 pl-16 pr-24 text-xl outline-none focus:ring-2 focus:ring-teal-500/50 transition-all shadow-2xl"
            />
            <button 
              onClick={handleSemanticSearch}
              disabled={isSearching || data.length === 0}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-teal-600 hover:bg-teal-500 text-white px-6 py-2 rounded-xl font-bold transition-all disabled:opacity-30"
            >
              {isSearching ? 'Thinking...' : 'Search AI'}
            </button>
          </div>

          <div className="space-y-4">
             {searchResults.length > 0 ? searchResults.map((result, i) => (
               <div key={i} className="bg-slate-800/40 border border-slate-700/50 p-6 rounded-2xl hover:border-teal-500/30 transition-all flex gap-6 items-start">
                  <div className="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center flex-shrink-0 text-teal-400">
                    <Target size={24} />
                  </div>
                  <div className="flex-1">
                     <h4 className="font-bold text-lg text-slate-100">{result.campaign_name}</h4>
                     <p className="text-slate-400 text-sm mb-4">"{result.ad_copy || 'No copy available'}"</p>
                     <div className="flex gap-6 text-[10px] font-black uppercase tracking-widest text-slate-600">
                        <span className="bg-slate-900 px-2 py-1 rounded">ROI: {((result.revenue || 0) / (result.spend || 1)).toFixed(2)}x</span>
                        <span className="bg-slate-900 px-2 py-1 rounded">CTR: {(result.ctr! * 100).toFixed(2)}%</span>
                        <span className="bg-slate-900 px-2 py-1 rounded">CPA: ${result.cpa?.toFixed(2)}</span>
                     </div>
                  </div>
               </div>
             )) : (
               <div className="text-center py-20 opacity-30 border-2 border-dashed border-slate-700 rounded-[40px]">
                  <Cpu size={64} className="mx-auto mb-4" />
                  <p className="text-sm font-black uppercase tracking-[0.2em]">Enter query to search parsed repository</p>
               </div>
             )}
          </div>
        </div>
      )}

      {currentView === AppView.REVENUE_PREDICTOR && (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500 max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className={`bg-slate-800/40 border border-slate-700/50 p-10 rounded-[40px] shadow-2xl ${data.length === 0 ? 'opacity-30 pointer-events-none' : ''}`}>
              <h2 className="text-2xl font-black mb-8 flex items-center gap-3">
                <Coins size={28} className="text-amber-400" />
                Fine-tuned Predictor
              </h2>
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-500">Date</label>
                  <input type="date" value={predictionData.c_date} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 outline-none" onChange={e => setPredictionData({...predictionData, c_date: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-500">Impressions</label>
                  <input type="number" value={predictionData.impressions} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 outline-none" onChange={e => setPredictionData({...predictionData, impressions: parseInt(e.target.value)})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6 mb-8">
                 <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase text-slate-500">Planned Spend ($)</label>
                   <input type="number" value={predictionData.mark_spent} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 outline-none" onChange={e => setPredictionData({...predictionData, mark_spent: parseFloat(e.target.value)})} />
                 </div>
                 <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase text-slate-500">Expected Clicks</label>
                   <input type="number" value={predictionData.clicks} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 outline-none" onChange={e => setPredictionData({...predictionData, clicks: parseInt(e.target.value)})} />
                 </div>
              </div>
              <button 
                onClick={handlePredict}
                disabled={isPredicting || data.length === 0}
                className="w-full bg-amber-600 hover:bg-amber-500 text-white font-black uppercase py-5 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl shadow-amber-900/20"
              >
                {isPredicting ? 'Calibrating...' : 'Run Prediction Pipeline'}
              </button>
            </div>

            <div className="bg-slate-800/20 border border-slate-700/50 p-10 rounded-[40px] flex flex-col items-center justify-center text-center">
               {predictedRevenue !== null ? (
                 <div className="animate-in zoom-in-95">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Estimated Revenue</p>
                    <div className="text-7xl font-black text-amber-400 mb-4">${predictedRevenue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                    <p className="text-xs text-slate-400 max-w-xs mx-auto italic">
                      Calibrated using {data.length} actual data nodes from your uploaded datasets.
                    </p>
                 </div>
               ) : (
                 <div className="opacity-30">
                    <TrendingUp size={64} className="mx-auto mb-4" />
                    <p className="text-sm font-black uppercase tracking-widest">Awaiting Calibration</p>
                 </div>
               )}
            </div>
          </div>
        </div>
      )}

      {currentView === AppView.AI_AUDITOR && (
        <div className="space-y-8 animate-in fade-in max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-black text-slate-100">AI Strategic Auditor</h2>
              <p className="text-slate-500 italic">Context-aware auditing based on parsed repository data.</p>
            </div>
            <button 
              onClick={async () => {
                setIsAnalyzing(true);
                try {
                  const result = await analyzeMarketingData(JSON.stringify(data.slice(0, 20)));
                  setAiAnalysis(result);
                } finally { setIsAnalyzing(false); }
              }}
              disabled={isAnalyzing || data.length === 0}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest flex items-center gap-3 shadow-xl shadow-indigo-900/20"
            >
              {isAnalyzing ? <div className="animate-spin w-5 h-5 border-2 border-white/30 border-t-white rounded-full"></div> : <BrainCircuit size={20} />}
              Run Strategic Audit
            </button>
          </div>

          {aiAnalysis ? (
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                   <div className="bg-slate-800/40 border border-slate-700/50 p-8 rounded-[40px]">
                      <h3 className="text-lg font-black uppercase tracking-widest text-indigo-400 mb-6 flex items-center gap-2"><Zap size={20} /> Executive Insight</h3>
                      <p className="text-slate-300 leading-relaxed text-lg italic">"{aiAnalysis.resumo}"</p>
                   </div>
                   <div className="grid grid-cols-2 gap-8">
                      <div className="bg-emerald-500/5 border border-emerald-500/20 p-6 rounded-3xl">
                        <h4 className="font-bold text-emerald-400 mb-4 flex items-center gap-2"><CheckCircle2 size={18} /> Validated Strengths</h4>
                        <ul className="space-y-3 text-sm text-slate-300">
                          {aiAnalysis.pontosFortes.map((p, i) => <li key={i}>• {p}</li>)}
                        </ul>
                      </div>
                      <div className="bg-rose-500/5 border border-rose-500/20 p-6 rounded-3xl">
                        <h4 className="font-bold text-rose-400 mb-4 flex items-center gap-2"><AlertCircle size={18} /> Performance Gaps</h4>
                        <ul className="space-y-3 text-sm text-slate-300">
                          {aiAnalysis.pontosFracos.map((p, i) => <li key={i}>• {p}</li>)}
                        </ul>
                      </div>
                   </div>
                </div>
                <div className="bg-slate-800/40 border border-slate-700/50 p-8 rounded-[40px] h-fit">
                   <h4 className="text-sm font-black uppercase tracking-widest text-slate-500 mb-6 flex items-center gap-2"><TrendingUp size={16} /> Data-Driven Actions</h4>
                   <div className="space-y-4">
                      {aiAnalysis.recomendacoes.map((rec, i) => (
                        <div key={i} className="p-4 bg-slate-900/50 rounded-2xl border border-slate-700 text-xs text-slate-300 flex gap-3 group hover:border-indigo-500/50 transition-colors">
                           <span className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center flex-shrink-0 font-bold group-hover:bg-indigo-500 group-hover:text-white transition-colors">{i+1}</span>
                           {rec}
                        </div>
                      ))}
                   </div>
                </div>
             </div>
          ) : (
            <div className="text-center py-32 bg-slate-800/10 border-2 border-dashed border-slate-700 rounded-[60px] opacity-40">
               <Cpu size={80} className="mx-auto mb-6 animate-pulse" />
               <h3 className="text-2xl font-black uppercase tracking-widest mb-2">Awaiting Foundation</h3>
               <p className="italic">Upload data to trigger AI reasoning based on verified performance nodes.</p>
            </div>
          )}
        </div>
      )}
    </Layout>
  );
};

export default App;