
export interface MarketingRow {
  [key: string]: any;
  ad_copy?: string;
  campaign_name?: string;
  impressions?: number;
  clicks?: number;
  conversions?: number;
  spend?: number;
  revenue?: number; // Added for prediction tracking
  ctr?: number;
  cpa?: number;
  cpc?: number;
  text_cluster?: number;
  similarity_score?: number;
}

export interface FileRecord {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadDate: Date;
  rowCount: number;
  status: 'ready' | 'processing' | 'error';
}

export interface AnalysisResult {
  resumo: string;
  pontosFortes: string[];
  pontosFracos: string[];
  estrategia: string;
  insights: string[];
  recomendacoes: string[];
}

export interface ClusterInfo {
  id: number;
  size: number;
  avgCtr: number;
  avgCpa: number;
  topTerms: string[];
}

export enum AppView {
  DASHBOARD = 'dashboard',
  SCRAPER = 'scraper',
  DATA_LAB = 'datalab',
  SEMANTIC_SEARCH = 'search',
  AI_AUDITOR = 'auditor',
  REVENUE_PREDICTOR = 'predictor'
}
