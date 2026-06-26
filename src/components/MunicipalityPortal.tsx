/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  getIssues, 
  updateIssue, 
  resetMockData, 
} from '../data/mockIssues';
import {
  CivicIssue,
  IssueCategory,
  IssueStatus
} from '../types';
import { 
  AlertTriangle, 
  TrendingUp, 
  ShieldAlert, 
  CheckCircle, 
  Clock, 
  Users, 
  DollarSign, 
  FileText, 
  MapPin, 
  ChevronRight, 
  Sliders, 
  Search, 
  RotateCcw, 
  ArrowLeft,
  Briefcase,
  Play,
  Check,
  ShieldAlert as FakeAlert,
  Sparkles,
  Layers,
  ExternalLink,
  Activity,
  ShieldCheck,
  History,
  Radio,
  Terminal
} from 'lucide-react';

interface MunicipalityPortalProps {
  onBackToHome: () => void;
  onNavigateToCitizen: () => void;
}

// Mock municipal work crews
const MAINTENANCE_TEAMS = [
  "Emergency Grid Safety Unit B",
  "Road Patching Squad 2",
  "Water Utility Crew Alpha",
  "Municipal Lighting Crew 1",
  "General Public Works Team C"
];

const CATEGORIES_MAPPING: Record<IssueCategory, { label: string; icon: string }> = {
  'potholes': { label: 'Pothole', icon: '🕳️' },
  'open drains': { label: 'Open Drain', icon: '🕸️' },
  'broken streetlights': { label: 'Streetlight', icon: '💡' },
  'exposed wiring': { label: 'Exposed Wire', icon: '⚡' },
  'water leakage': { label: 'Water Leak', icon: '💧' }
};

interface CopilotAnalysis {
  priorityReason: string;
  safetyImpact: string;
  duplicateConfidence: string;
  sensitiveZones: string[];
  escalationRec: string;
  recommendedCrew: string;
  recommendedWindow: string;
  operationalImpacts: string[];
  suggestedActions: string[];
  sentiment: 'Concerned' | 'Urgent' | 'Frustrated' | 'Informational';
  sentimentColor: string;
  resolutionPrediction: string;
  weatherImpact: string;
}

function getCopilotAnalysis(issue: CivicIssue): CopilotAnalysis {
  const desc = issue.description.toLowerCase();
  
  let analysis: CopilotAnalysis = {
    priorityReason: "Automated urgency score computed from citizen description keywords and safety impact heuristics.",
    safetyImpact: "Potential minor pedestrian obstruction or local infrastructure deterioration.",
    duplicateConfidence: "Low (No matching active reports found in a 250m radius)",
    sensitiveZones: ["Nagpur Municipal Ward Boundary"],
    escalationRec: "Standard inspection queue. Resolve within regular maintenance cycles.",
    recommendedCrew: "General Public Works Team C",
    recommendedWindow: "Within 3-5 Business Days",
    operationalImpacts: ["Requires localized space clearance"],
    suggestedActions: ["Deploy safety cones", "Take high-res on-site photos", "Verify citizen contact details"],
    sentiment: "Concerned",
    sentimentColor: "text-amber-600 bg-amber-50 border-amber-200",
    resolutionPrediction: "Expected resolution within 48-72 hours post-dispatch.",
    weatherImpact: "Low impact predicted by local meteorology feeds."
  };

  // 1. Citizen Sentiment detection
  if (desc.includes("dangerous") || desc.includes("hazard") || desc.includes("electrocution") || desc.includes("kids") || desc.includes("children")) {
    analysis.sentiment = "Urgent";
    analysis.sentimentColor = "text-rose-600 bg-rose-50 border-rose-100";
  } else if (desc.includes("flicker") || desc.includes("broken") || desc.includes("flood") || desc.includes("extremely deep") || desc.includes("swerv") || desc.includes("pothole")) {
    analysis.sentiment = "Frustrated";
    analysis.sentimentColor = "text-amber-600 bg-amber-50 border-amber-100";
  } else if (desc.includes("unsafe") || desc.includes("dark") || desc.includes("frighten") || desc.includes("scare")) {
    analysis.sentiment = "Concerned";
    analysis.sentimentColor = "text-sky-600 bg-sky-50 border-sky-100";
  } else {
    analysis.sentiment = "Informational";
    analysis.sentimentColor = "text-slate-600 bg-slate-50 border-slate-200";
  }

  // 2. Specific Category intelligence
  if (issue.category === 'exposed wiring') {
    analysis.priorityReason = "High-voltage hazard with active safety risk detected near pedestrian access points. High contact shock threat.";
    analysis.safetyImpact = "Imminent risk of electrical shock, electrocution, or local electrical circuit fire.";
    analysis.duplicateConfidence = "Low (0 active duplicates detected. This appears to be a unique primary circuit fault).";
    analysis.sensitiveZones = ["Oakridge Elementary School (15m)", "Nagpur Residential Block Sector 4", "Local Bus Stop #12"];
    analysis.escalationRec = "Immediately escalate to the Electrical Division Super-Intendent if field arrival exceeds 2 hours.";
    analysis.recommendedCrew = "Emergency Grid Safety Unit B";
    analysis.recommendedWindow = "Under 2 hours (Emergency dispatch)";
    analysis.operationalImpacts = [
      "affects school route",
      "risk increases during rainfall",
      "requires temporary segment power isolation"
    ];
    analysis.suggestedActions = [
      "temporarily isolate electrical line",
      "deploy barricades",
      "notify nearby residents",
      "assign emergency repair unit"
    ];
    analysis.resolutionPrediction = "Likely safe and locked within 3 hours from crew dispatch.";
    analysis.weatherImpact = "Critical (Rain forecast increases conductor spark risk by 80%)";
  } 
  else if (issue.category === 'water leakage') {
    analysis.priorityReason = "Pressurized liquid discharge indicating potential clean water main fracture and adjacent road subgrade erosion.";
    analysis.safetyImpact = "Sub-surface washing could trigger sudden asphalt sinkhole. Heavy non-revenue water loss.";
    analysis.duplicateConfidence = "Medium (3 duplicate pings filtered in Nagpur Central grid block within past 12 hours).";
    analysis.sensitiveZones = ["Pine Street Commercial Retail Strip", "Nagpur Civic Hospital (240m)", "Underground Gas Grid Intersect"];
    analysis.escalationRec = "Dispatch bypass engineers to mitigate downstream resident water supply cuts.";
    analysis.recommendedCrew = "Water Utility Crew Alpha";
    analysis.recommendedWindow = "Within 4 hours";
    analysis.operationalImpacts = [
      "affects traffic flow",
      "risk of water pressure loss in Ward 12",
      "potential sidewalk structural collapse"
    ];
    analysis.suggestedActions = [
      "deploy barricades",
      "isolate pipe line valve",
      "notify nearby residents",
      "assign emergency repair unit"
    ];
    analysis.resolutionPrediction = "Subsurface seal expected to take 6 hours; final road patching may take 24 hours.";
    analysis.weatherImpact = "Moderate (High ambient heat increases community tap water demand load)";
  }
  else if (issue.category === 'potholes') {
    analysis.priorityReason = "Deep pavement crater on high-speed or active transport street segment. Risk of violent vehicle swerves and tire failure.";
    analysis.safetyImpact = "High speed tire blowouts, loss of vehicle control, and hazardous pedestrian lane splashes.";
    analysis.duplicateConfidence = "High (92% match confidence based on coordinates overlapping with a pre-existing road fatigue ticket).";
    analysis.sensitiveZones = ["Bypass Westbound High-Speed Arterial Lane", "Nagpur East Freight Corridor Junction"];
    analysis.escalationRec = "Merge with Highway Division routine inspection lists; authorize rapid asphalt spray patching.";
    analysis.recommendedCrew = "Road Patching Squad 2";
    analysis.recommendedWindow = "Within 24 hours";
    analysis.operationalImpacts = [
      "affects traffic flow",
      "repeated complaints nearby",
      "increases aquaplaning risk during precipitation"
    ];
    analysis.suggestedActions = [
      "deploy barricades",
      "apply polymer-modified hot mix asphalt",
      "assign emergency repair unit",
      "verify surface friction levels post compaction"
    ];
    analysis.resolutionPrediction = "likely fix within 4 hours (asphalt setting takes 45 minutes on site).";
    analysis.weatherImpact = "Moderate (Moisture slows down standard emulsion binder adhesion)";
  }
  else if (issue.category === 'open drains') {
    analysis.priorityReason = "Missing catchment grate causing deep vertical drop-off directly on pedestrian walking paths. High night fall hazard.";
    analysis.safetyImpact = "Severe leg/ankle fractures, pedestrian falls, and blockage of sewer flow due to large debris ingress.";
    analysis.duplicateConfidence = "None detected (No similar open cover alerts nearby).";
    analysis.sensitiveZones = ["12th Street Pedestrian Plaza", "Nagpur Central Public Library (80m)", "Wheelchair Access Ramp"];
    analysis.escalationRec = "Dispatch immediate barricade laying to prevent pedestrian injury in the twilight period.";
    analysis.recommendedCrew = "General Public Works Team C";
    analysis.recommendedWindow = "Within 6 hours";
    analysis.operationalImpacts = [
      "affects pedestrian shopping zone",
      "high liability warning due to dark street zone",
      "risk of severe drainage block in upcoming rain"
    ];
    analysis.suggestedActions = [
      "deploy barricades",
      "install lockable anti-theft hinged drainage cover",
      "notify nearby residents",
      "clean trash blocks inside catch chamber"
    ];
    analysis.resolutionPrediction = "Physical grate seating takes under 30 minutes once crew arrives.";
    analysis.weatherImpact = "Low (Standard mechanical iron replacement)";
  }
  else if (issue.category === 'broken streetlights') {
    analysis.priorityReason = "Illumination outage creating severe safety blindspots in residential blocks with walking school/bus commuters.";
    analysis.safetyImpact = "Increased opportunistic vehicle break-ins, visual strain for elderly, and generic municipal discomfort.";
    analysis.duplicateConfidence = "High (89% confidence duplicate of street lighting segment fault #CH-7998).";
    analysis.sensitiveZones = ["Elm Street Residential Complex", "Bus Transit Terminal Sector A", "Elderly Care Home (180m)"];
    analysis.escalationRec = "Check neighborhood substation relays if entire block is dark.";
    analysis.recommendedCrew = "Municipal Lighting Crew 1";
    analysis.recommendedWindow = "Within 48 hours";
    analysis.operationalImpacts = [
      "affects school route",
      "affects safe night walking route",
      "increases neighborhood security concerns"
    ];
    analysis.suggestedActions = [
      "temporarily isolate electrical line",
      "install long-life high-efficiency 80W LED fixture",
      "notify nearby residents",
      "clean outer acrylic reflector dome"
    ];
    analysis.resolutionPrediction = "Aerial bucket truck swap typically resolved in under 40 minutes.";
    analysis.weatherImpact = "Low (Aerial works restricted only during heavy wind/lightning)";
  }

  return analysis;
}

function getCrewWorkload(issues: CivicIssue[], crewName: string) {
  const activeCount = issues.filter(i => i.assignedTeam === crewName && i.status !== 'resolved').length;
  let level: 'Light' | 'Moderate' | 'Heavy' = 'Light';
  let color = 'text-emerald-700 bg-emerald-50 border-emerald-100';
  if (activeCount >= 3) {
    level = 'Heavy';
    color = 'text-rose-700 bg-rose-50 border-rose-100';
  } else if (activeCount > 0) {
    level = 'Moderate';
    color = 'text-amber-700 bg-amber-50 border-amber-100';
  }
  return { count: activeCount, level, color };
}

export default function MunicipalityPortal({ onBackToHome, onNavigateToCitizen }: MunicipalityPortalProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('governance');
  const [loginError, setLoginError] = useState('');

  // Dashboard state
  const [issues, setIssues] = useState<CivicIssue[]>([]);
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'priority' | 'newest'>('priority');

  // Interactive step checklists per issue id
  const [checkedSteps, setCheckedSteps] = useState<Record<string, boolean[]>>({});

  useEffect(() => {
    // Read from storage
    setIssues(getIssues());
  }, []);

  const refreshIssuesList = () => {
    const fresh = getIssues();
    setIssues(fresh);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim().toLowerCase() === 'admin' && password === 'governance') {
      setIsAuthenticated(true);
      setLoginError('');
      refreshIssuesList();
    } else {
      setLoginError('Invalid municipal credentials. (Hint: admin / governance)');
    }
  };

  const handleStatusChange = (issueId: string, nextStatus: IssueStatus) => {
    let note = `Status changed to ${nextStatus}.`;
    if (nextStatus === 'reviewed') {
      note = "Civic triage verified by municipal controller.";
    } else if (nextStatus === 'assigned') {
      note = `Ticket assigned. Dispatched to responding maintenance crew.`;
    } else if (nextStatus === 'in_progress') {
      note = "Crews are actively working on-site to resolve the issue.";
    } else if (nextStatus === 'resolved') {
      note = "Repairs successfully completed. Clean up site, verify safety criteria, and closed ticket.";
    }

    const updated = updateIssue(issueId, { 
      status: nextStatus,
      statusUpdates: [
        ...issues.find(i => i.id === issueId)?.statusUpdates || [],
        { status: nextStatus, timestamp: new Date().toISOString(), note }
      ]
    });

    if (updated) {
      refreshIssuesList();
    }
  };

  const handleTeamChange = (issueId: string, team: string) => {
    const updated = updateIssue(issueId, { 
      assignedTeam: team,
      status: 'assigned', // Auto transition to assigned if it was reported/reviewed
      statusUpdates: [
        ...issues.find(i => i.id === issueId)?.statusUpdates || [],
        { 
          status: 'assigned', 
          timestamp: new Date().toISOString(), 
          note: `Assigned to: ${team}. Repair logistics initiated.` 
        }
      ]
    });
    if (updated) {
      refreshIssuesList();
    }
  };

  // Toggle checklist step
  const handleToggleStep = (issueId: string, stepIndex: number) => {
    const currentList = checkedSteps[issueId] || [];
    const nextList = [...currentList];
    nextList[stepIndex] = !nextList[stepIndex];
    setCheckedSteps({
      ...checkedSteps,
      [issueId]: nextList
    });
  };

  const handleResetDatabase = () => {
    if (window.confirm("This will reset all reports to the pre-seeded municipal demo data. Continue?")) {
      resetMockData();
      refreshIssuesList();
      setSelectedIssueId(null);
      setCheckedSteps({});
    }
  };

  // Select first issue if none selected
  const activeIssue = issues.find(i => i.id === selectedIssueId) || null;

  // Filter & Rank calculation
  const filteredIssues = issues.filter(issue => {
    const matchesSearch = 
      issue.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.locationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (issue.citizenName && issue.citizenName.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = categoryFilter === 'all' || issue.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || issue.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Sort: default is urgency priority (AI Ranked)
  const sortedIssues = [...filteredIssues].sort((a, b) => {
    if (sortBy === 'priority') {
      return b.aiReport.urgencyScore - a.aiReport.urgencyScore;
    } else {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  // KPI Calculations
  const totalReports = issues.length;
  const criticalReports = issues.filter(i => i.aiReport.safetyRiskLevel === 'Critical' && i.status !== 'resolved').length;
  const inProgressReports = issues.filter(i => i.status === 'in_progress').length;
  const resolvedReports = issues.filter(i => i.status === 'resolved').length;

  // Render Login view if not logged in
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50/60 flex items-center justify-center px-4 font-sans" id="municipality-login-page">
        <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.02),0_1px_3px_rgba(0,0,0,0.01)] max-w-md w-full space-y-6">
          <div className="text-center space-y-3">
            <button 
              type="button"
              onClick={onBackToHome}
              className="text-slate-400 hover:text-slate-850 transition-colors flex items-center gap-1.5 mx-auto text-xs font-bold mb-1"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Portal Selection
            </button>
            <div className="inline-flex h-14 w-14 bg-slate-900 rounded-2xl items-center justify-center text-white font-bold text-2xl shadow-xs select-none">
              🏛️
            </div>
            <h2 className="text-xl font-black text-slate-950 tracking-tight font-display">Municipal Controller Login</h2>
            <p className="text-xs text-slate-400 font-semibold leading-relaxed">Access real-time Nagpur civic ticket priority classification and crew dispatch systems.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {loginError && (
              <div className="p-3.5 bg-rose-50 border border-rose-100 text-rose-800 text-xs font-bold rounded-xl text-center leading-normal">
                {loginError}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Username</label>
              <input 
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-xs bg-slate-50/40 focus:outline-none focus:ring-4 focus:ring-sky-500/5 focus:border-sky-500 font-semibold transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Password</label>
              <input 
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-xs bg-slate-50/40 focus:outline-none focus:ring-4 focus:ring-sky-500/5 focus:border-sky-500 font-semibold transition-all"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-slate-950 hover:bg-slate-900 text-white font-bold py-3.5 rounded-xl text-xs shadow-md hover:shadow-lg transition-all active:scale-98 select-none cursor-pointer"
            >
              Secure Sign In
            </button>
          </form>

          <div className="p-4 bg-sky-50/50 rounded-2xl border border-sky-100/60 text-[11px] text-sky-850 space-y-2">
            <span className="font-bold flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5 text-sky-600" />
              Developer Testing Credentials:
            </span>
            <div className="flex justify-between font-mono text-[10px] bg-white/60 p-2.5 rounded-xl border border-sky-100/40 font-semibold">
              <span>User: <strong className="text-slate-950">admin</strong></span>
              <span>Pass: <strong className="text-slate-950">governance</strong></span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 sm:p-6 md:p-8 gap-6 sm:gap-8 flex flex-col font-sans text-slate-800" id="municipal-portal-root">
      
      {/* Top Banner Dashboard Header */}
      <header className="w-full max-w-7xl mx-auto flex flex-wrap md:flex-nowrap items-center justify-between bg-white px-5 py-4 sm:px-6 sm:py-4.5 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.01),0_1px_2px_rgba(0,0,0,0.03)] border border-slate-200/80 gap-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsAuthenticated(false)}
            className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 hover:text-slate-850 hover:scale-105 transition-all flex items-center justify-center shrink-0"
            title="Log out"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="w-10 h-10 bg-slate-950 rounded-xl flex items-center justify-center text-white font-black text-xl shrink-0 select-none shadow-xs">
            M
          </div>
          <div className="flex flex-col">
            <h1 className="text-sm sm:text-base font-extrabold tracking-tight text-slate-900 font-display flex items-center gap-1.5 leading-none">
              <span>Community Hero Console</span>
              <span className="text-[8px] sm:text-[9px] uppercase font-bold px-2 py-0.5 bg-amber-500 text-slate-950 rounded-full border border-amber-400 tracking-wider">Municipality</span>
            </h1>
            <p className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1 leading-none">Nagpur Dashboard • Control Center</p>
          </div>
        </div>

        {/* Live Operational Feeds Status bar */}
        <div className="hidden lg:flex items-center gap-5 border-l border-slate-200/80 pl-5 text-[10px] font-bold">
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
            </span>
            <span className="text-slate-400 uppercase tracking-wide">GIS TELEMETRY: <strong className="text-slate-700">LIVE</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-sky-500"></span>
            </span>
            <span className="text-slate-400 uppercase tracking-wide">DISPATCH GRID: <strong className="text-sky-700">CONNECTED</strong></span>
          </div>
        </div>

        {/* Action controls */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={handleResetDatabase}
            className="px-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5 text-slate-400" />
            Reset Demo Data
          </button>

          <button
            onClick={onNavigateToCitizen}
            className="px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold transition-all shadow-3xs hover:shadow-xs hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
          >
            Citizen Demo Screen
          </button>
        </div>
      </header>

      {/* Main KPI Stats Bento Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl w-full mx-auto animate-fade-in" id="stats-dashboard">
        {/* Stat 1 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.01)] flex items-center gap-4">
          <div className="h-12 w-12 bg-sky-50 text-sky-600 rounded-xl flex items-center justify-center border border-sky-100/50 text-xl font-bold shrink-0">
            📊
          </div>
          <div>
            <span className="text-[9px] text-slate-400 uppercase font-bold block tracking-wider leading-none">Active Reports</span>
            <span className="text-2xl font-black font-display text-slate-900 leading-none mt-1.5 block">{totalReports}</span>
          </div>
        </div>

        {/* Stat 2 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.01)] flex items-center gap-4">
          <div className="h-12 w-12 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center border border-rose-100/50 text-xl font-bold shrink-0">
            🚨
          </div>
          <div>
            <span className="text-[9px] text-slate-400 uppercase font-bold block tracking-wider leading-none">Critical Hazards</span>
            <span className="text-2xl font-black font-display text-rose-600 leading-none mt-1.5 block">{criticalReports}</span>
          </div>
        </div>

        {/* Stat 3 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.01)] flex items-center gap-4">
          <div className="h-12 w-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center border border-purple-100/50 text-xl font-bold shrink-0">
            🚚
          </div>
          <div>
            <span className="text-[9px] text-slate-400 uppercase font-bold block tracking-wider leading-none">Active Crew Sites</span>
            <span className="text-2xl font-black font-display text-purple-600 leading-none mt-1.5 block">{inProgressReports}</span>
          </div>
        </div>

        {/* Stat 4 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.01)] flex items-center gap-4">
          <div className="h-12 w-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center border border-emerald-100/50 text-xl font-bold shrink-0">
            ✅
          </div>
          <div>
            <span className="text-[9px] text-slate-400 uppercase font-bold block tracking-wider leading-none">Issues Fixed</span>
            <span className="text-2xl font-black font-display text-emerald-600 leading-none mt-1.5 block">{resolvedReports}</span>
          </div>
        </div>
      </div>

      {/* Primary Triage Workspace Area */}
      <main className="max-w-7xl mx-auto w-full flex-grow">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="dashboard-body-grid">
          
          {/* Left Panel: Filter & Ranked List (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* Filter Toolbar */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.01)] space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Search text */}
                <div className="relative flex-grow">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Search className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by ID, keyword, address, citizen..."
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-xs bg-white focus:outline-none focus:ring-4 focus:ring-sky-500/5 focus:border-sky-500 font-semibold"
                  />
                </div>

                {/* Sort Toggle */}
                <div className="flex rounded-xl bg-slate-100 p-1 shrink-0 border border-slate-200/40">
                  <button
                    onClick={() => setSortBy('priority')}
                    className={`px-3.5 py-1.5 rounded-lg text-[10px] font-bold tracking-tight transition-all flex items-center gap-1 cursor-pointer ${
                      sortBy === 'priority' 
                        ? "bg-white text-slate-900 shadow-2xs" 
                        : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    <Sparkles className="h-3 w-3 text-indigo-500 fill-indigo-100/10" />
                    Priority Assessed (Urgency)
                  </button>
                  <button
                    onClick={() => setSortBy('newest')}
                    className={`px-3.5 py-1.5 rounded-lg text-[10px] font-bold tracking-tight transition-all cursor-pointer ${
                      sortBy === 'newest' 
                        ? "bg-white text-slate-900 shadow-2xs" 
                        : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    Date Filed
                  </button>
                </div>
              </div>

              {/* Advanced filter dropdowns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-100">
                {/* Category select */}
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">Type:</span>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none"
                  >
                    <option value="all">All Categories</option>
                    <option value="potholes">Potholes</option>
                    <option value="open drains">Open Drains</option>
                    <option value="broken streetlights">Broken Streetlights</option>
                    <option value="exposed wiring">Exposed Wiring</option>
                    <option value="water leakage">Water Leakage</option>
                  </select>
                </div>

                {/* Status select */}
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">Status:</span>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none"
                  >
                    <option value="all">All Statuses</option>
                    <option value="reported">Reported</option>
                    <option value="reviewed">Reviewed</option>
                    <option value="assigned">Assigned</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>
              </div>
            </div>

            {/* AI Ranked List */}
            <div className="space-y-3.5 max-h-[620px] overflow-y-auto pr-1">
              {sortedIssues.length === 0 ? (
                <div className="bg-white p-12 rounded-2xl border border-slate-200/85 text-center text-slate-400 text-xs py-16 space-y-2 shadow-2xs">
                  <p className="font-bold text-slate-700">No matching tickets in queue.</p>
                  <p className="text-[11px] text-slate-400">Try loosening your search query or reset the database to pre-seed.</p>
                </div>
              ) : (
                sortedIssues.map((issue, idx) => {
                  const isSelected = selectedIssueId === issue.id;
                  const severity = issue.aiReport.safetyRiskLevel;
                  
                  return (
                    <motion.div
                      key={issue.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35, delay: Math.min(idx * 0.05, 0.4), ease: "easeOut" }}
                      whileHover={{ y: -3, boxShadow: "0 8px 16px rgba(0,0,0,0.03)" }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => setSelectedIssueId(issue.id)}
                      className={`p-4.5 rounded-2xl border transition-all cursor-pointer relative flex flex-col gap-3 ${
                        isSelected 
                          ? "bg-slate-900 text-white border-slate-900 ring-2 ring-slate-900/10 shadow-md" 
                          : "bg-white border-slate-200 hover:border-slate-300 text-slate-800"
                      }`}
                      id={`ticket-card-${issue.id}`}
                    >
                      {/* Priority Score badge (Top Left / Right) */}
                      <div className="flex justify-between items-center w-full">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-mono font-bold ${isSelected ? 'text-slate-400' : 'text-slate-400'}`}>
                            #{idx + 1} • {issue.id}
                          </span>
                          <span className="text-[10px] font-medium opacity-80">• {new Date(issue.createdAt).toLocaleDateString()}</span>
                        </div>
                        
                        {/* AI Priority Indicator */}
                        <div className="flex items-center gap-1.5 bg-indigo-50/10 px-2.5 py-1 rounded-lg border border-indigo-500/20 text-[10px] font-extrabold text-indigo-400">
                          <Sparkles className="h-3.5 w-3.5 fill-indigo-400" />
                          <span>PRIORITY: {issue.aiReport.urgencyScore}</span>
                        </div>
                      </div>

                      {/* Title & category */}
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold font-display flex items-center gap-2">
                          <span className="text-sm shrink-0">{CATEGORIES_MAPPING[issue.category]?.icon}</span>
                          <span className={isSelected ? "text-white" : "text-slate-900"}>
                            {CATEGORIES_MAPPING[issue.category]?.label}: {issue.locationName}
                          </span>
                        </h4>
                        <p className={`text-[11px] leading-relaxed line-clamp-2 font-medium ${isSelected ? "text-slate-300" : "text-slate-500"}`}>
                          {issue.description}
                        </p>
                      </div>

                      {/* Row of badges: Severity, Status, Duplicate flags, Weak warning */}
                      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-dashed border-slate-100/10">
                        {/* Severity Badge */}
                        <span className={`px-2 py-0.5 text-[9px] rounded-md font-bold border ${
                          isSelected && severity === 'Critical' ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' :
                          severity === 'Critical' ? 'bg-rose-100 text-rose-800 border-rose-200' :
                          isSelected && severity === 'High' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' :
                          severity === 'High' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                          severity === 'Medium' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                          'bg-slate-100 text-slate-700 border-slate-200'
                        }`}>
                          {severity} Risk
                        </span>

                        {/* Status Badge */}
                        <span className={`px-2 py-0.5 text-[9px] rounded-md font-bold border ${
                          isSelected ? 'bg-white/15 text-white border-white/20' :
                          issue.status === 'reported' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                          issue.status === 'reviewed' ? 'bg-indigo-100 text-indigo-800 border-indigo-200' :
                          issue.status === 'assigned' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                          issue.status === 'in_progress' ? 'bg-purple-100 text-purple-800 border-purple-200' :
                          'bg-emerald-100 text-emerald-800 border-emerald-200'
                        }`}>
                          {issue.status.toUpperCase()}
                        </span>

                        {/* Duplicate badge indicator */}
                        {issue.aiReport.duplicateRisk === 'High' && (
                          <span className="px-2 py-0.5 bg-amber-500 text-slate-950 text-[9px] rounded-md font-bold flex items-center gap-0.5">
                            <Layers className="h-2.5 w-2.5" /> High Dup Risk
                          </span>
                        )}

                        {/* Fake warning badge indicator */}
                        {issue.aiReport.fakeWarning && (
                          <span className="px-2 py-0.5 bg-rose-500 text-white text-[9px] rounded-md font-bold flex items-center gap-0.5">
                            <FakeAlert className="h-2.5 w-2.5" /> Weak Report
                          </span>
                        )}

                        {/* Assigned Team label */}
                        {issue.assignedTeam && (
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-600 border border-slate-200 text-[9px] rounded-md font-bold flex items-center gap-1 ml-auto">
                            <Users className="h-2.5 w-2.5 text-slate-400" />
                            {issue.assignedTeam}
                          </span>
                        )}
                      </div>

                    </motion.div>
                  );
                })
              )}
            </div>

          </div>

          {/* Right Panel: Active Issue Workstation Detail Panel (5 Cols) */}
          <div className="lg:col-span-5" id="ticket-workstation-panel">
            <AnimatePresence mode="wait">
              {activeIssue ? (() => {
                const copilot = getCopilotAnalysis(activeIssue);
                const stepsCompleted = (checkedSteps[activeIssue.id] || []).filter(Boolean).length;
                const totalSteps = copilot.suggestedActions.length;
                const completionPercentage = totalSteps > 0 ? Math.round((stepsCompleted / totalSteps) * 100) : 0;
                
                return (
                  <motion.div
                    key={activeIssue.id}
                    initial={{ opacity: 0, y: 15, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -15, scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 350, damping: 26 }}
                    className="bg-white border border-slate-200/90 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.02)] p-6 space-y-6"
                  >
                    
                    {/* Subtle live indicators header */}
                    <div className="flex flex-wrap items-center justify-between gap-2 bg-indigo-50/50 px-3.5 py-2.5 rounded-2xl border border-indigo-100/50">
                      <div className="flex items-center gap-2">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Priority Triage Complete</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-indigo-700">
                        <Sparkles className="h-3.5 w-3.5 fill-indigo-100/50 animate-pulse" />
                        <span className="text-[10px] font-extrabold uppercase tracking-wider">Active Response Plan</span>
                      </div>
                    </div>

                    {/* Header detail */}
                    <div className="border-b border-slate-150 pb-4 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-mono text-[10px] font-extrabold text-indigo-700 bg-indigo-50/80 px-2.5 py-1 rounded-lg border border-indigo-100/30">
                          {activeIssue.id}
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(activeIssue.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="text-base font-extrabold text-slate-900 tracking-tight leading-tight font-display">
                          {CATEGORIES_MAPPING[activeIssue.category]?.label}: {activeIssue.locationName}
                        </h3>
                        {/* Sentiment Badge */}
                        <span className={`px-2.5 py-1 text-[10px] rounded-full font-bold border shrink-0 flex items-center gap-1.5 shadow-3xs ${copilot.sentimentColor}`}>
                          <span>💬 {copilot.sentiment}</span>
                        </span>
                      </div>
                    </div>

                    {/* CIVIC DISPATCH INSIGHTS */}
                    <div className="p-5 bg-gradient-to-br from-indigo-50/20 to-indigo-50/5 border border-indigo-100/50 rounded-2xl space-y-4">
                      <div className="flex items-center gap-2">
                        <div className="p-1 bg-indigo-100 text-indigo-700 rounded-lg">
                          <Sparkles className="h-4 w-4 fill-indigo-200/50" />
                        </div>
                        <span className="text-xs font-black text-indigo-950 uppercase tracking-wider font-display">Civic Dispatch Insights</span>
                      </div>

                      <div className="space-y-4 text-xs">
                        {/* Executive Summary */}
                        <div className="bg-white p-3.5 border border-indigo-100/30 rounded-xl shadow-3xs relative overflow-hidden group">
                          <div className="absolute top-0 left-0 bottom-0 w-1 bg-indigo-600 rounded-l" />
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[9px] uppercase font-black text-indigo-900 tracking-wider">Response Priority Summary</span>
                            <span className="text-[8px] bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Verified</span>
                          </div>
                          <p className="text-slate-800 leading-relaxed font-semibold italic text-[11.5px]">
                            "{activeIssue.aiReport.executiveSummary}"
                          </p>
                        </div>

                        {/* Score explanation & Safety Impact */}
                        <div className="space-y-3.5 bg-white/40 p-3.5 rounded-xl border border-slate-200/40">
                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wide">
                                Public Safety Urgency Analysis
                              </span>
                              <span className={`text-[11px] font-black px-2 py-0.5 rounded-md ${
                                activeIssue.aiReport.urgencyScore >= 75 ? "bg-rose-50 text-rose-700 border border-rose-100" :
                                activeIssue.aiReport.urgencyScore >= 50 ? "bg-amber-50 text-amber-700 border border-amber-100" :
                                "bg-emerald-50 text-emerald-700 border border-emerald-100"
                              }`}>
                                Priority Score: {activeIssue.aiReport.urgencyScore}/100
                              </span>
                            </div>
                            
                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-2 relative border border-slate-200/30">
                              <motion.div 
                                key={`mp-priority-${activeIssue.id}`}
                                initial={{ width: 0 }}
                                animate={{ width: `${activeIssue.aiReport.urgencyScore}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className={`h-full rounded-full ${
                                  activeIssue.aiReport.urgencyScore >= 75 ? "bg-gradient-to-r from-rose-500 to-red-600" :
                                  activeIssue.aiReport.urgencyScore >= 50 ? "bg-gradient-to-r from-amber-500 to-orange-500" :
                                  "bg-gradient-to-r from-emerald-500 to-teal-500"
                                }`} 
                              />
                            </div>
                            <p className="text-slate-600 leading-relaxed text-[11px] font-semibold">
                              {copilot.priorityReason}
                            </p>
                          </div>

                          <div className="border-t border-slate-150 pt-2.5">
                            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wide block mb-1">Estimated Public Safety Impact</span>
                            <p className="text-slate-700 leading-relaxed text-[11px] font-semibold bg-rose-50/50 p-2.5 rounded-lg border border-rose-100/50">
                              ⚠️ <strong className="text-rose-950">{copilot.safetyImpact}</strong>
                            </p>
                          </div>
                        </div>

                        {/* Duplicate Confidence & Sensitive Zones */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wide block mb-1">Duplicate Confidence</span>
                            {(() => {
                              const match = copilot.duplicateConfidence.match(/(\d+)%/);
                              const percentage = match ? parseInt(match[1]) : (copilot.duplicateConfidence.toLowerCase().includes('low') || copilot.duplicateConfidence.toLowerCase().includes('none') ? 12 : 80);
                              const text = copilot.duplicateConfidence.split('(')[0].trim() || "Low";
                              return (
                                <div className="space-y-1.5">
                                  <span className="inline-block px-2.5 py-1 font-bold bg-white border border-slate-200 text-[10px] rounded-lg shadow-3xs">
                                    {text}
                                  </span>
                                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden border border-slate-200/30">
                                    <motion.div 
                                      key={`mp-dup-${activeIssue.id}`}
                                      initial={{ width: 0 }}
                                      animate={{ width: `${percentage}%` }}
                                      transition={{ duration: 0.8, ease: "easeOut" }}
                                      className={`h-full rounded-full ${percentage > 70 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                                    />
                                  </div>
                                </div>
                              );
                            })()}
                          </div>
                          <div>
                            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wide block mb-1">Technical Est. Cost</span>
                            <span className="font-bold text-slate-800 flex items-center gap-0.5 pt-1 text-[11px]">
                              <DollarSign className="h-3.5 w-3.5 text-slate-400" />
                              {activeIssue.aiReport.estimatedCostRange || "Under assessment"}
                            </span>
                          </div>
                        </div>

                        {/* Sensitive zones list */}
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wide block mb-1.5">Nearby Sensitive Zones</span>
                          <div className="flex flex-wrap gap-1.5">
                            {copilot.sensitiveZones.map((zone, idx) => (
                              <span key={idx} className="bg-amber-50/80 text-amber-800 border border-amber-200/60 px-2 py-0.5 rounded text-[10px] font-bold shadow-3xs">
                                🏫 {zone}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Escalation recommendation */}
                        <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
                          <span className="text-[10px] uppercase font-bold text-indigo-950 tracking-wide block mb-1">Escalation Recommendation</span>
                          <p className="text-slate-700 font-semibold text-[11px] leading-relaxed">
                            💡 {copilot.escalationRec}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* RECOMMENDED CREW ALLOCATION & DISPATCH */}
                    <div className="p-4 bg-emerald-50/10 border border-emerald-100/80 rounded-2xl space-y-3.5">
                      <div className="flex items-center justify-between border-b border-emerald-100/40 pb-2">
                        <span className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                          <Users className="h-4 w-4 text-emerald-600 animate-pulse" /> Dispatch Allocation Suggestion
                        </span>
                        <span className="text-[9px] px-2.5 py-0.5 bg-emerald-100/70 text-emerald-800 border border-emerald-200 rounded-full font-bold uppercase tracking-wider">
                          City Optimized
                        </span>
                      </div>

                      <div className="text-xs space-y-3 text-slate-700">
                        <p className="font-semibold text-slate-800 leading-normal">
                          🎯 Recommended Crew: <strong className="text-emerald-800 font-bold">{copilot.recommendedCrew}</strong> within <span className="underline decoration-emerald-400 decoration-2 font-bold">{copilot.recommendedWindow}</span>.
                        </p>
                        
                        {activeIssue.assignedTeam ? (
                          <div className="p-3 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-xl flex items-center justify-between gap-3 shadow-3xs">
                            <div className="flex items-center gap-2.5">
                              <div className="h-7 w-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm shrink-0">
                                🚚
                              </div>
                              <div>
                                <span className="text-[9px] uppercase font-bold text-emerald-800 block leading-none">Active Route Status</span>
                                <span className="text-xs font-extrabold text-slate-800 block mt-0.5">{activeIssue.assignedTeam}</span>
                              </div>
                            </div>
                            <span className="text-[9px] font-bold text-emerald-700 bg-white px-2 py-0.5 rounded border border-emerald-200 uppercase tracking-wide flex items-center gap-1 shrink-0">
                              <span className="relative flex h-1.5 w-1.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                              </span>
                              En Route
                            </span>
                          </div>
                        ) : (
                          <div className="p-3 bg-amber-50/50 border border-amber-200/60 text-slate-700 text-[11px] font-bold rounded-xl flex items-center justify-center gap-1.5">
                            ⚠️ Dynamic crew assignment required to authorize active road dispatch
                          </div>
                        )}
                      </div>
                    </div>

                    {/* OPERATIONAL IMPACT & RESOLUTION PREDICTION */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Operational Impact */}
                      <div className="p-4 bg-orange-50/10 border border-orange-100/50 rounded-2xl space-y-2">
                        <span className="text-[10px] uppercase font-bold text-orange-950 tracking-wide block">Operational Impact</span>
                        <ul className="space-y-1.5">
                          {copilot.operationalImpacts.map((imp, idx) => (
                            <li key={idx} className="text-[11px] font-bold text-orange-900 flex items-center gap-1.5">
                              <span className="h-1.5 w-1.5 bg-orange-400 rounded-full shrink-0 animate-pulse"></span>
                              {imp}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Resolution prediction */}
                      <div className="p-4 bg-sky-50/10 border border-sky-100/50 rounded-2xl space-y-2">
                        <span className="text-[10px] uppercase font-bold text-sky-950 tracking-wide block">Est. Resolution Prediction</span>
                        <div className="space-y-1">
                          <p className="text-[11px] font-extrabold text-sky-900">
                            ⏱️ {copilot.resolutionPrediction}
                          </p>
                          <p className="text-[10px] text-slate-500 font-semibold leading-relaxed">
                            Weather consideration: {copilot.weatherImpact}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* ORIGINAL CITIZEN REPORT DETAILS & EVIDENCE */}
                    <div className="space-y-3 text-xs">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wide block">Original Citizen Details</span>
                      <p className="text-slate-700 leading-relaxed font-medium bg-slate-50 p-4 rounded-2xl border border-slate-200/50 italic">
                        "{activeIssue.description}"
                      </p>

                      {activeIssue.citizenName && (
                        <div className="flex flex-wrap gap-4 text-[11px] font-semibold text-slate-500 bg-slate-50/20 p-3 rounded-xl border border-slate-200/40">
                          <span>👤 Reporter: <strong className="text-slate-700">{activeIssue.citizenName}</strong></span>
                          {activeIssue.citizenPhone && <span>📞 Tel: <strong className="text-slate-700">{activeIssue.citizenPhone}</strong></span>}
                        </div>
                      )}

                      {activeIssue.photos.length > 0 && (
                        <div className="pt-1">
                          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wide block mb-2">Attached Evidence ({activeIssue.photos.length})</span>
                          <div className="grid grid-cols-3 gap-2.5">
                            {activeIssue.photos.map((url, i) => (
                              <div key={i} className="aspect-square rounded-xl overflow-hidden border border-slate-200 shadow-3xs group relative">
                                <img 
                                  src={url} 
                                  alt="evidential thumbnail" 
                                  className="w-full h-full object-cover group-hover:scale-105 transition-all"
                                  referrerPolicy="no-referrer"
                                />
                                <a 
                                  href={url} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity text-[10px] font-bold gap-1"
                                >
                                  <ExternalLink className="h-3.5 w-3.5" /> Full
                                </a>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* DISPATCH TEAM ALLOCATION WITH DYNAMIC WORKLOAD STATE */}
                    <div className="p-4 border border-slate-200 rounded-2xl space-y-3 bg-slate-50/10">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wide block">Responding Work Crew Dispatch</span>
                        <p className="text-[10px] text-slate-400 font-bold mt-0.5">Crew workloads are dynamically audited from the active ticket queue.</p>
                      </div>

                      <div className="space-y-3">
                        <select
                          value={activeIssue.assignedTeam || ""}
                          onChange={(e) => handleTeamChange(activeIssue.id, e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-sky-500/5 focus:border-sky-500 shadow-3xs"
                        >
                          <option value="" disabled>-- Assign Responding Maintenance Team --</option>
                          {MAINTENANCE_TEAMS.map((team, idx) => {
                            const workload = getCrewWorkload(issues, team);
                            return (
                              <option key={idx} value={team}>
                                {team} ({workload.count} active, Load: {workload.level})
                              </option>
                            );
                          })}
                        </select>

                        {/* Interactive Workload Overview Cards for reference */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                          {MAINTENANCE_TEAMS.map((team, idx) => {
                            const workload = getCrewWorkload(issues, team);
                            const isAssignedToThis = activeIssue.assignedTeam === team;
                            return (
                              <motion.div 
                                key={idx} 
                                onClick={() => handleTeamChange(activeIssue.id, team)}
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                                className={`p-2.5 rounded-xl border text-[10px] cursor-pointer transition-all flex flex-col justify-between gap-1 relative overflow-hidden ${
                                  isAssignedToThis 
                                    ? "bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-emerald-500/30" 
                                    : "bg-white hover:bg-slate-50/80 text-slate-700 border-slate-200/85 hover:border-slate-300"
                                }`}
                              >
                                {isAssignedToThis && (
                                  <div className="absolute top-0 right-0 h-1.5 w-1.5 bg-emerald-400 rounded-bl" />
                                )}
                                <div className="flex items-center justify-between font-bold">
                                  <span className="truncate max-w-[120px]">{team}</span>
                                  {isAssignedToThis && <Check className="h-3.5 w-3.5 stroke-[3] text-emerald-400 shrink-0" />}
                                </div>
                                <div className="flex items-center gap-1.5 mt-1">
                                  <span className="font-mono text-[9px] opacity-80">Load: {workload.count} Active</span>
                                  <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase ${isAssignedToThis ? 'bg-white/20 text-white border border-white/10' : workload.color}`}>
                                    {workload.level}
                                  </span>
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* AI SUGGESTED ACTIONS & DYNAMIC CHECKLIST */}
                    <div className="p-4 border border-indigo-150 rounded-2xl bg-indigo-50/10 space-y-3.5">
                      <div className="flex justify-between items-center border-b border-indigo-100/50 pb-2.5">
                        <span className="text-[10px] uppercase font-bold text-indigo-900 tracking-wide flex items-center gap-1.5">
                          <Briefcase className="h-3.5 w-3.5 text-indigo-600" /> Suggested Crew Actions
                        </span>
                        <span className="text-[10px] text-indigo-800 font-extrabold bg-indigo-100/50 px-2.5 py-0.5 rounded-full border border-indigo-200/30 shadow-3xs">
                          {stepsCompleted} / {totalSteps} Done ({completionPercentage}%)
                        </span>
                      </div>

                      {/* Checklist Progress Bar */}
                      <div className="w-full bg-slate-150 h-1.5 rounded-full overflow-hidden mb-1 border border-slate-200/20">
                        <motion.div 
                          className="bg-indigo-600 h-full rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${completionPercentage}%` }}
                          transition={{ duration: 0.5 }}
                        />
                      </div>

                      <ul className="space-y-2 text-xs text-slate-700 font-semibold">
                        {copilot.suggestedActions.map((step, idx) => {
                          const isChecked = !!(checkedSteps[activeIssue.id]?.[idx]);
                          return (
                            <li key={idx}>
                              <motion.div 
                                whileHover={{ x: 2 }}
                                onClick={() => handleToggleStep(activeIssue.id, idx)}
                                className={`flex items-start gap-3 p-2 rounded-xl transition-all border cursor-pointer ${
                                  isChecked 
                                    ? 'bg-indigo-50/30 border-indigo-100/30' 
                                    : 'bg-white/50 border-slate-200/50 hover:bg-white hover:border-slate-300'
                                }`}
                              >
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleToggleStep(activeIssue.id, idx);
                                  }}
                                  className={`h-4.5 w-4.5 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 transition-all cursor-pointer ${
                                    isChecked 
                                      ? "bg-indigo-600 border-indigo-600 text-white shadow-3xs" 
                                      : "bg-white border-slate-300 hover:border-indigo-400"
                                  }`}
                                >
                                  {isChecked && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                                </button>
                                <span className={`leading-relaxed text-xs ${isChecked ? "line-through text-slate-400 opacity-60 font-medium" : "text-slate-800 font-bold"}`}>
                                  {step.charAt(0).toUpperCase() + step.slice(1)}
                                </span>
                              </motion.div>
                            </li>
                          );
                        })}
                      </ul>
                    </div>

                    {/* STATUS WORKFLOW STATE ACTIONS */}
                    <div className="space-y-3" id="ticket-workflow-controls">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wide block">Update Ticket Workflow State</span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <button
                          type="button"
                          onClick={() => handleStatusChange(activeIssue.id, 'reviewed')}
                          disabled={activeIssue.status === 'reviewed'}
                          className={`py-2.5 px-1 text-center font-bold rounded-xl text-[10px] transition-all flex flex-col items-center justify-center gap-1 ${
                            activeIssue.status === 'reviewed'
                              ? "bg-slate-50 border border-slate-200 text-slate-400"
                              : "bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-100 active:scale-95 cursor-pointer shadow-3xs"
                          }`}
                        >
                          <span>👮 Verified Priority</span>
                        </button>
                        <button
                          type="button"
                          disabled={!activeIssue.assignedTeam || activeIssue.status === 'assigned'}
                          onClick={() => handleStatusChange(activeIssue.id, 'assigned')}
                          className={`py-2.5 px-1 text-center font-bold rounded-xl text-[10px] transition-all flex flex-col items-center justify-center gap-1 ${
                            !activeIssue.assignedTeam || activeIssue.status === 'assigned'
                              ? "bg-slate-50 border border-slate-200 text-slate-400"
                              : "bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-100 active:scale-95 cursor-pointer shadow-3xs"
                          }`}
                          title={!activeIssue.assignedTeam ? "Assign a team first" : ""}
                        >
                          <span>🚚 Crew Assigned</span>
                        </button>
                        <button
                          type="button"
                          disabled={activeIssue.status === 'in_progress'}
                          onClick={() => handleStatusChange(activeIssue.id, 'in_progress')}
                          className={`py-2.5 px-1 text-center font-bold rounded-xl text-[10px] transition-all flex flex-col items-center justify-center gap-1 ${
                            activeIssue.status === 'in_progress'
                              ? "bg-slate-50 border border-slate-200 text-slate-400"
                              : "bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-100 active:scale-95 cursor-pointer shadow-3xs"
                          }`}
                        >
                          <span>🛠️ Set Active</span>
                        </button>
                        <button
                          type="button"
                          disabled={activeIssue.status === 'resolved'}
                          onClick={() => handleStatusChange(activeIssue.id, 'resolved')}
                          className={`py-2.5 px-1 text-center font-bold rounded-xl text-[10px] transition-all flex flex-col items-center justify-center gap-1 ${
                            activeIssue.status === 'resolved'
                              ? "bg-slate-50 border border-slate-200 text-slate-400"
                              : "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-100 active:scale-95 cursor-pointer shadow-3xs"
                          }`}
                        >
                          <span>✅ Mark Resolved</span>
                        </button>
                      </div>
                    </div>

                    {/* WORKFLOW TIMELINE AUDIT TRAIL */}
                    <div className="border-t border-slate-150 pt-5 space-y-3.5">
                      <div className="flex items-center gap-2">
                        <History className="h-4 w-4 text-slate-450" />
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Workflow Audit Trail & Timestamps</span>
                      </div>
                      <div className="relative border-l border-slate-200 ml-2.5 pl-4 space-y-4 text-[11px]">
                        {activeIssue.statusUpdates && activeIssue.statusUpdates.length > 0 ? (
                          [...activeIssue.statusUpdates].reverse().map((update, uIdx) => {
                            const date = new Date(update.timestamp);
                            return (
                              <motion.div 
                                key={uIdx} 
                                initial={{ opacity: 0, x: -5 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: uIdx * 0.05 }}
                                className="relative group"
                              >
                                {/* Dot marker */}
                                <div className={`absolute -left-[21px] top-1 h-2 w-2 rounded-full ring-4 ring-white ${
                                  uIdx === 0 ? "bg-indigo-600 ring-indigo-100" : "bg-slate-350"
                                }`} />
                                <div className="flex items-center justify-between gap-2">
                                  <span className="font-extrabold text-slate-700 capitalize">
                                    {update.status === 'reported' && "📥 Citizen Reported"}
                                    {update.status === 'reviewed' && "👮 Priority Assessed"}
                                    {update.status === 'assigned' && "🚚 Crew Dispatched"}
                                    {update.status === 'in_progress' && "🛠️ Active Site Work"}
                                    {update.status === 'resolved' && "✅ Resolution Closed"}
                                  </span>
                                  <span className="text-[9px] text-slate-400 font-mono">
                                    {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })} • {date.toLocaleDateString()}
                                  </span>
                                </div>
                                <p className="text-slate-500 font-medium mt-0.5 leading-normal">{update.note}</p>
                              </motion.div>
                            );
                          })
                        ) : (
                          <div className="text-slate-400 italic font-semibold">No historical timeline logs found.</div>
                        )}
                      </div>
                    </div>

                  </motion.div>
                );
              })() : (
                <motion.div
                  key="empty-state"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white border border-slate-200/80 p-12 text-center text-slate-400 text-xs shadow-[0_1px_3px_rgba(0,0,0,0.01)] flex flex-col items-center justify-center gap-3.5 py-28 rounded-3xl"
                >
                  <div className="h-16 w-16 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100 text-slate-400 text-2xl">
                    🏛️
                  </div>
                  <div className="space-y-1.5 max-w-xs">
                    <p className="font-bold text-slate-800 text-sm">Select Dispatch Ticket</p>
                    <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
                      Choose a citizen report from the left pane to review civic priority details, assign a municipal dispatch team, or update resolution status.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>

      </main>
    </div>
  );
}
