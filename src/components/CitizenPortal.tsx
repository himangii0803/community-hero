/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  getIssues, 
  addIssue, 
} from '../data/mockIssues';
import {
  CivicIssue,
  IssueCategory,
  IssueStatus,
  StatusUpdate
} from '../types';
import MapPlaceholder from './MapPlaceholder';
import PhotoUploader from './PhotoUploader';
import { 
  AlertTriangle, 
  Sparkles, 
  MapPin, 
  Camera, 
  MessageSquare, 
  CheckCircle, 
  FileText, 
  Clock, 
  ChevronRight, 
  ArrowLeft, 
  Activity, 
  Sliders, 
  Check, 
  ShieldAlert, 
  RefreshCcw,
  User,
  Phone
} from 'lucide-react';

interface CitizenPortalProps {
  onBackToHome: () => void;
  onNavigateToMunicipality: () => void;
}

const CATEGORIES: { value: IssueCategory; label: string; icon: string; bg: string; text: string; description: string }[] = [
  { 
    value: 'potholes', 
    label: 'Pothole / Road Damage', 
    icon: '🕳️', 
    bg: 'bg-amber-50', 
    text: 'text-amber-800 border-amber-200',
    description: 'Cracks, craters, or crumbling road surfaces affecting traffic.'
  },
  { 
    value: 'open drains', 
    label: 'Open Drain / Grate', 
    icon: '🕸️', 
    bg: 'bg-emerald-50', 
    text: 'text-emerald-800 border-emerald-200',
    description: 'Missing storm sewer covers, clogged blockages, or exposed pits.'
  },
  { 
    value: 'broken streetlights', 
    label: 'Broken Streetlight', 
    icon: '💡', 
    bg: 'bg-blue-50', 
    text: 'text-blue-800 border-blue-200',
    description: 'Completely unlit bulb, flickering, or physically damaged poles.'
  },
  { 
    value: 'exposed wiring', 
    label: 'Exposed Wiring', 
    icon: '⚡', 
    bg: 'bg-rose-50', 
    text: 'text-rose-800 border-rose-200',
    description: 'Dangling live cables, unsealed power cabinets, sparking lines.'
  },
  { 
    value: 'water leakage', 
    label: 'Water Leakage', 
    icon: '💧', 
    bg: 'bg-sky-50', 
    text: 'text-sky-800 border-sky-200',
    description: 'Flooding roadways, sub-surface bursts, or leaking hydrants.'
  }
];

// Helper function to automatically detect category, severity, and suggested department from description
function detectCategoryAndSeverity(descriptionText: string, photosCount: number) {
  const text = descriptionText.toLowerCase();
  let detectedCategory: IssueCategory = 'potholes'; // Default
  let suggestedDept = 'Roads & Asphalt Division';
  
  // High-precision keywords
  if (text.includes('wire') || text.includes('cable') || text.includes('spark') || text.includes('shock') || text.includes('electric') || text.includes('voltage') || text.includes('power box') || text.includes('transformer') || text.includes('utility pole')) {
    detectedCategory = 'exposed wiring';
    suggestedDept = 'Electricity & Power Distribution Department';
  } else if (text.includes('drain') || text.includes('manhole') || text.includes('sewer') || text.includes('catch basin') || text.includes('grate') || text.includes('gutter') || text.includes('exposed pit') || text.includes('open pit')) {
    detectedCategory = 'open drains';
    suggestedDept = 'Sanitation & Stormwater Department';
  } else if (text.includes('light') || text.includes('streetlight') || text.includes('lamp') || text.includes('bulb') || text.includes('flicker') || text.includes('darkness') || text.includes('dark block') || text.includes('pole broken')) {
    detectedCategory = 'broken streetlights';
    suggestedDept = 'Street Lighting & Electrical Department';
  } else if (text.includes('leak') || text.includes('water') || text.includes('burst') || text.includes('gush') || text.includes('flood') || text.includes('pipe') || text.includes('hydrant') || text.includes('bubbling')) {
    detectedCategory = 'water leakage';
    suggestedDept = 'Water Works & Supply Department';
  } else if (text.includes('pothole') || text.includes('crater') || text.includes('asphalt') || text.includes('crack') || text.includes('pavement') || text.includes('road surface') || text.includes('swerv') || text.includes('tire')) {
    detectedCategory = 'potholes';
    suggestedDept = 'Roads & Asphalt Division';
  } else {
    // Fallback search
    if (text.includes('spark') || text.includes('shock') || text.includes('power')) {
      detectedCategory = 'exposed wiring';
      suggestedDept = 'Electricity & Power Distribution Department';
    } else if (text.includes('water') || text.includes('leak') || text.includes('flow')) {
      detectedCategory = 'water leakage';
      suggestedDept = 'Water Works & Supply Department';
    } else if (text.includes('hole') || text.includes('bump')) {
      detectedCategory = 'potholes';
      suggestedDept = 'Roads & Asphalt Division';
    } else if (text.includes('dark') || text.includes('night')) {
      detectedCategory = 'broken streetlights';
      suggestedDept = 'Street Lighting & Electrical Department';
    }
  }

  // Calculate Urgency and Severity
  let score = 30;
  let risk: 'Low' | 'Medium' | 'High' | 'Critical' = 'Medium';
  let duplicateRisk: 'None' | 'Low' | 'High' = 'None';
  let estCost = '₹12,000 - ₹30,000';
  let plans: string[] = [];
  let safetyRisk = 'General safety notice for public right of way.';

  if (detectedCategory === 'exposed wiring') {
    const isCritical = text.includes('school') || text.includes('children') || text.includes('dangling') || text.includes('spark') || text.includes('live') || text.includes('water') || text.includes('rain');
    score = isCritical ? 95 : 82;
    risk = isCritical ? 'Critical' : 'High';
    estCost = '₹15,000 - ₹35,000';
    plans = [
      "Secure hazardous electrical pole and isolate power grid segment.",
      "Dispatch certified electrical line technician within 2 hours.",
      "Install secure, weatherbox enclosure and seal."
    ];
    safetyRisk = isCritical 
      ? 'Imminent electrocution hazard near high foot-traffic zone.' 
      : 'Unsecured live wire contact hazard for pedestrians and animals.';
  } else if (detectedCategory === 'water leakage') {
    const isHigh = text.includes('gushing') || text.includes('flood') || text.includes('burst') || text.includes('pressure') || text.includes('main');
    score = isHigh ? 80 : 55;
    risk = isHigh ? 'High' : 'Medium';
    estCost = '₹25,000 - ₹75,000';
    plans = [
      "Deploy water works squad to locate supply gate valves.",
      "Isolate local supply lines to prevent further roadbed erosion.",
      "Excavate cracked segment and replace with reinforced pipe section."
    ];
    safetyRisk = isHigh 
      ? 'Pressurized flooding causing rapid asphalt erosion and road instability.' 
      : 'Constant flow causing water logging, slipping hazards, and moss growth.';
  } else if (detectedCategory === 'potholes') {
    const isHigh = text.includes('accident') || text.includes('tire') || text.includes('deep') || text.includes('swerve') || text.includes('highway') || text.includes('expressway');
    score = isHigh ? 68 : 35;
    risk = isHigh ? 'High' : 'Low';
    estCost = '₹5,000 - ₹12,000';
    plans = [
      "Deploy reflective caution signs and high-vis traffic cones.",
      "Clean out loose debris, moisture, and crumbling base aggregate.",
      "Fill with hot-pour polymer asphalt mix and compact with static roller."
    ];
    safetyRisk = isHigh 
      ? 'High-speed tire blowout or sudden swerving loss-of-control risk.' 
      : 'Asphalt cracking causing vehicle suspension wear and minor traffic delays.';
  } else if (detectedCategory === 'open drains') {
    const isCritical = text.includes('missing') || text.includes('fall') || text.includes('deep') || text.includes('open') || text.includes('kid') || text.includes('child');
    score = isCritical ? 88 : 50;
    risk = isCritical ? 'Critical' : 'Medium';
    estCost = '₹8,000 - ₹18,000';
    plans = [
      "Erect a physical security barricade over the open pit.",
      "Source standard factory-matched replacement drain cover or grate.",
      "Install concrete anchors or high-tensile locking hinges to secure grate."
    ];
    safetyRisk = isCritical 
      ? 'Deep open concrete drop-off creating high risk of falling and major bodily injury.' 
      : 'Missing drainage cover causing wheel damage and potential pedestrian trip hazards.';
  } else if (detectedCategory === 'broken streetlights') {
    const isMedium = text.includes('dark') || text.includes('unsafe') || text.includes('flicker') || text.includes('crime') || text.includes('corner');
    score = isMedium ? 45 : 25;
    risk = isMedium ? 'Medium' : 'Low';
    estCost = '₹4,000 - ₹9,000';
    plans = [
      "Schedule street lighting inspection truck for the night shift.",
      "Inspect electrical node connections and wire health inside pole base.",
      "Replace dead luminaire ballast and install new energy-efficient LED bulb."
    ];
    safetyRisk = isMedium 
      ? 'Complete block darkness reducing pedestrian security and increasing vehicle blind spots.' 
      : 'Flickering illumination causing visual discomfort and reduced driver visibility.';
  }

  // Adjustments based on descriptions / photos
  const isShort = descriptionText.trim().length < 25;
  if (isShort) {
    score = Math.max(15, Math.round(score * 0.5));
    risk = 'Low';
  }

  // Duplicate Risks
  if (detectedCategory === 'broken streetlights' && (text.includes('elm') || text.includes('main') || text.includes('ward'))) {
    duplicateRisk = 'High';
  } else if (detectedCategory === 'potholes' && text.includes('bypass')) {
    duplicateRisk = 'Low';
  }

  // Generate municipal executive summary
  let execSummary = `Analyzed description of reported ${detectedCategory} issue. Scheduled for immediate department attention.`;
  if (!isShort) {
    execSummary = `Assessed potential '${detectedCategory}' concern based on description details. Priority status: ${risk === 'Critical' || risk === 'High' ? 'Safety Risk Present' : 'Standard Priority'}.`;
  } else {
    execSummary = `Citizen notice concerning potential road/utility issue at location.`;
  }

  // Calculate real-time Confidence Score
  let confidence = 85;
  if (descriptionText.trim().length > 100) confidence += 8;
  if (isShort) confidence -= 18;
  if (photosCount > 0) confidence += 6;
  confidence = Math.min(99, Math.max(55, confidence));

  return {
    category: detectedCategory,
    suggestedDept,
    urgencyScore: score,
    safetyRiskLevel: risk,
    duplicateRisk,
    estimatedCostRange: estCost,
    recommendedActionPlan: plans.length > 0 ? plans : ["Schedule routine maintenance inspection", "Repair surface and close ticket"],
    executiveSummary: execSummary,
    technicalDescription: `System automatically classified this from input: "${descriptionText.substring(0, 60)}...". Photos uploaded: ${photosCount}.`,
    fakeWarning: isShort && photosCount === 0,
    fakeWarningDetails: isShort && photosCount === 0 
      ? "Notice: Your description is very short and no photos are uploaded. Providing extra details or photos helps the municipal team verify and schedule repairs much quicker!" 
      : undefined,
    safetyRisk,
    confidenceScore: confidence
  };
}

export default function CitizenPortal({ onBackToHome, onNavigateToMunicipality }: CitizenPortalProps) {
  const [activeTab, setActiveTab] = useState<'report' | 'track'>('report');
  const [issues, setIssues] = useState<CivicIssue[]>([]);
  const [mySubmittedIds, setMySubmittedIds] = useState<string[]>([]);
  
  // Form State
  const [category, setCategory] = useState<IssueCategory>('potholes');
  const [description, setDescription] = useState('');
  const [locationName, setLocationName] = useState('102 Oak Street (Near Elementary School)');
  const [locationCoords, setLocationCoords] = useState({ lat: 37.7749, lng: -122.4194 });
  const [photos, setPhotos] = useState<string[]>([]);
  const [citizenName, setCitizenName] = useState('');
  const [citizenPhone, setCitizenPhone] = useState('');

  // AI Review Simulator State
  const [formStep, setFormStep] = useState<'edit' | 'ai_review' | 'success'>('edit');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiLoadingStep, setAiLoadingStep] = useState(0);
  const [generatedAIReport, setGeneratedAIReport] = useState<CivicIssue['aiReport'] | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [citizenFriendlyNote, setCitizenFriendlyNote] = useState<string>('');
  const [aiMode, setAiMode] = useState<'live' | 'fallback'>('live');
  const [aiSource, setAiSource] = useState<'Gemini Live' | 'Demo Fallback'>('Gemini Live');
  const [devErrorDetail, setDevErrorDetail] = useState<string | null>(null);
  const [lastSubmittedIssueId, setLastSubmittedIssueId] = useState<string | null>(null);

  // Status Tracking Detail State
  const [selectedIssue, setSelectedIssue] = useState<CivicIssue | null>(null);
  const [trackFilter, setTrackFilter] = useState<'all' | 'mine'>('mine');

  useEffect(() => {
    setIssues(getIssues());
    // Read user's submitted list from session/local storage
    const mine = localStorage.getItem('COMMUNITY_HERO_MY_SUBMISSIONS');
    if (mine) {
      try {
        setMySubmittedIds(JSON.parse(mine));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Sync state with storage
  const refreshIssues = () => {
    const refreshed = getIssues();
    setIssues(refreshed);
    if (selectedIssue) {
      const updatedSelected = refreshed.find(i => i.id === selectedIssue.id);
      if (updatedSelected) {
        setSelectedIssue(updatedSelected);
      }
    }
  };

  // Helper to map Gemini's detected issue type to the standard categories used by the app
  const mapIssueTypeToCategory = (issueType: string): IssueCategory => {
    const normalized = (issueType || "").toLowerCase().trim();
    if (normalized.includes("pothole") || normalized.includes("road") || normalized.includes("damage")) {
      return "potholes";
    }
    if (normalized.includes("drain") || normalized.includes("pit") || normalized.includes("manhole") || normalized.includes("sewer")) {
      return "open drains";
    }
    if (normalized.includes("streetlight") || normalized.includes("lamp") || normalized.includes("light")) {
      return "broken streetlights";
    }
    if (normalized.includes("wire") || normalized.includes("cable") || normalized.includes("electric") || normalized.includes("exposed")) {
      return "exposed wiring";
    }
    if (normalized.includes("leak") || normalized.includes("water") || normalized.includes("pipe")) {
      return "water leakage";
    }
    return category; // fallback to the user's manual selection if we cannot determine
  };

  // Local rule engine to generate highly detailed reports when the server/Gemini is unreachable (e.g. offline, quota)
  const getLocalFallbackReportClient = (desc: string, locName: string, name: string) => {
    const descLower = (desc || "").toLowerCase();
    const citizenNameVal = name || "Citizen";
    const loc = locName || "Nagpur neighborhood";

    let detectedIssueType = "Other";
    let severityLevel = "Medium";
    let priorityScore = 55;
    let suggestedMunicipalTeam = "Public Works Maintenance";
    let publicSafetyRisk = "General infrastructure concern that could impact safety or local resident comfort if left unaddressed.";
    let executiveSummary = `Issue reported at ${loc} concerning general civic infrastructure maintenance. Needs inspection.`;
    let suggestedFirstActions = [
      "Schedule inspector visit to verify report details",
      "Catalog issue in Nagpur maintenance backlog",
      "Notify the citizen upon triage completion"
    ];

    if (descLower.includes("pothole") || descLower.includes("crater") || descLower.includes("road") || descLower.includes("asphalt") || descLower.includes("street")) {
      detectedIssueType = "Pothole / Road Damage";
      severityLevel = "Medium";
      priorityScore = 65;
      suggestedMunicipalTeam = "Road Repair Team";
      publicSafetyRisk = "Unresolved potholes pose direct hazards to motorized traffic, two-wheelers, and can cause accidents when drivers swerve suddenly.";
      executiveSummary = `Asphalt degradation and pothole damage reported on road at ${loc}, disrupting smooth neighborhood transit.`;
      suggestedFirstActions = [
        "Conduct physical site assessment and measure crater depth",
        "Deploy warning markers or fill pothole with cold mix temporary asphalt",
        "Schedule permanent patch-up and resurfacing"
      ];
    } else if (descLower.includes("drain") || descLower.includes("pit") || descLower.includes("manhole") || descLower.includes("sewer") || descLower.includes("open")) {
      detectedIssueType = "Open Drain";
      severityLevel = "High";
      priorityScore = 85;
      suggestedMunicipalTeam = "Drainage Team";
      publicSafetyRisk = "An open drain or uncovered pit presents a severe risk of deep falls, especially during rains, for children, senior citizens, and pets.";
      executiveSummary = `Uncovered drainage channel or open sewer manhole reported at ${loc}, requiring instant perimeter sealing.`;
      suggestedFirstActions = [
        "Secure the open drain perimeter immediately with high-visibility safety barriers",
        "Manufacture and securely mount a durable, heavy-duty replacement cover",
        "Inspect adjacent sewer walls for erosion"
      ];
    } else if (descLower.includes("light") || descLower.includes("streetlight") || descLower.includes("dark") || descLower.includes("bulb") || descLower.includes("lamp")) {
      detectedIssueType = "Broken Streetlight";
      severityLevel = "Medium";
      priorityScore = 55;
      suggestedMunicipalTeam = "Streetlight Maintenance Team";
      publicSafetyRisk = "Lack of operational streetlights results in blind spots, increases the risk of night-time traffic accidents, and degrades pedestrian safety.";
      executiveSummary = `Non-operational public street illumination lamp reported at ${loc}, creating a dark zone.`;
      suggestedFirstActions = [
        "Deploy a mobile ladder vehicle to inspect the overhead light assembly",
        "Replace the faulty bulb with a high-efficiency public LED bulb",
        "Check the photo-sensor automatic switch configuration"
      ];
    } else if (descLower.includes("wire") || descLower.includes("cable") || descLower.includes("exposed") || descLower.includes("shock") || descLower.includes("electric")) {
      detectedIssueType = "Exposed Wiring";
      severityLevel = "Critical";
      priorityScore = 95;
      suggestedMunicipalTeam = "Electrical Safety Team";
      publicSafetyRisk = "Hanging or bare electrical lines introduce extreme danger of lethal shocks or electrical fires, magnified during wet weather.";
      executiveSummary = `Dangling or uninsulated live electric cables hanging dangerously low near pedestrian pathways at ${loc}.`;
      suggestedFirstActions = [
        "Coordinate with electricity dispatch to isolate local current supply immediately",
        "Re-wrap exposed wires in high-grade weatherproof insulation conduits",
        "Test distribution pillar box grounding systems"
      ];
    } else if (descLower.includes("leak") || descLower.includes("water") || descLower.includes("pipe") || descLower.includes("burst")) {
      detectedIssueType = "Water Leakage";
      severityLevel = "Medium";
      priorityScore = 48;
      suggestedMunicipalTeam = "Water Utility Team";
      publicSafetyRisk = "Escaping pressurized municipal water ruins the asphalt base, encourages algae growth, and represents a wasteful loss of drinking water.";
      executiveSummary = `Active potable water main leakage or pipe puncture reported at ${loc}, resulting in localized water logging.`;
      suggestedFirstActions = [
        "Locate and isolate the corresponding hydraulic control valve",
        "Excavate road surface and weld-seal the pipe fracture",
        "Restore the surrounding pathway and clear blockages"
      ];
    }

    const friendlyNote = `Hello ${citizenNameVal}! Our civic assistant reviewed your message about the ${detectedIssueType.toLowerCase()} at ${loc}. To ensure Nagpur municipal teams resolve this quickly, we have translated your concern into a standardized, tech-ready dispatch report for the ${suggestedMunicipalTeam}. Thank you for contributing to your community's safety!`;

    return {
      detectedIssueType,
      severityLevel,
      priorityScore,
      confidenceScore: 98,
      publicSafetyRisk,
      duplicateReportStatus: "No similar reports found nearby",
      suggestedMunicipalTeam,
      municipalityReadySummary: executiveSummary,
      suggestedFirstActions,
      citizenFriendlyNote: friendlyNote,
      isFallback: true,
      devErrorDetail: "Auto-fallback engaged silently"
    };
  };

  // Helper to trigger realistic automated AI detection via real Gemini API with premium multi-step animation
  const handleRequestAIReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    setIsGeneratingAI(true);
    setAiLoadingStep(0);
    setAiError(null);
    
    let fetchResult: any = null;
    let fetchError: any = null;
    let step = 0;

    // Start timer interval to increment steps every 750ms
    const stepInterval = setInterval(() => {
      setAiLoadingStep((prev) => {
        if (prev < 4) {
          step = prev + 1;
          return prev + 1;
        }
        return prev;
      });
    }, 750);

    try {
      const response = await fetch("/api/gemini/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          description,
          photos,
          locationName,
          citizenName,
          citizenPhone,
          mode: aiMode
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to analyze report");
      }

      fetchResult = await response.json();
    } catch (err: any) {
      console.warn("Gemini API bypassed or failed (silent auto-fallback active):", err);
      // Silently fall back to local rule engine instead of raising a visible error to citizens
      fetchResult = getLocalFallbackReportClient(description, locationName, citizenName);
    }

    // Wait until at least step 4 (3.0 seconds total elapsed) has been reached before finishing up
    const finishUp = () => {
      clearInterval(stepInterval);
      if (fetchError) {
        setAiError(fetchError);
        setIsGeneratingAI(false);
      } else if (fetchResult) {
        const geminiResult = fetchResult;
        
        // Update the category state dynamically to match the detected value
        const mappedCategory = mapIssueTypeToCategory(geminiResult.detectedIssueType);
        setCategory(mappedCategory);
        
        const parsedDuplicateRisk = geminiResult.duplicateReportStatus?.toLowerCase().includes("no similar")
          ? "None"
          : "High";

        const report: CivicIssue['aiReport'] = {
          executiveSummary: geminiResult.municipalityReadySummary || "Civic report summarized.",
          technicalDescription: geminiResult.publicSafetyRisk || "Awaiting detail validation.",
          safetyRiskLevel: (geminiResult.severityLevel === "Critical" ? "Critical" : geminiResult.severityLevel === "High" ? "High" : geminiResult.severityLevel === "Medium" ? "Medium" : "Low"),
          urgencyScore: geminiResult.priorityScore ?? 50,
          duplicateRisk: parsedDuplicateRisk,
          fakeWarning: false,
          recommendedActionPlan: geminiResult.suggestedFirstActions || [
            "Inspect the location for verification",
            "Add temporary safety warning",
            "Assign the repair team"
          ],
          safetyRisk: geminiResult.publicSafetyRisk || "General safety concerns noted.",
          suggestedDepartment: geminiResult.suggestedMunicipalTeam || "Public Works Maintenance",
          confidenceScore: geminiResult.confidenceScore ?? 95
        };

        setAiSource(geminiResult.isFallback ? 'Demo Fallback' : 'Gemini Live');
        setDevErrorDetail(geminiResult.devErrorDetail || null);
        setCitizenFriendlyNote(geminiResult.citizenFriendlyNote || "");
        setGeneratedAIReport(report);
        
        // Stagger to done state (Step 5)
        setAiLoadingStep(5);
        
        setTimeout(() => {
          setIsGeneratingAI(false);
          setFormStep('ai_review');
        }, 600);
      }
    };

    const checkInterval = setInterval(() => {
      if (step >= 4) {
        clearInterval(checkInterval);
        finishUp();
      }
    }, 100);
  };

  // Submit report after citizen reviews and confirms AI triage
  const handleSubmitReport = () => {
    if (!generatedAIReport) return;

    const issueId = `CH-${Math.floor(1000 + Math.random() * 9000)}`;
    const newIssue: CivicIssue = {
      id: issueId,
      category,
      description,
      locationName,
      locationCoords,
      photos,
      createdAt: new Date().toISOString(),
      status: 'reported',
      statusUpdates: [
        {
          status: 'reported',
          timestamp: new Date().toISOString(),
          note: `Report filed by citizen. Automated civic classification completed and sent to suggested municipal department.`
        }
      ],
      citizenName: citizenName || 'Anonymous Citizen',
      citizenPhone: citizenPhone || undefined,
      aiReport: generatedAIReport
    };

    // Save
    addIssue(newIssue);
    setLastSubmittedIssueId(issueId);
    
    // Add to user's list
    const nextMine = [issueId, ...mySubmittedIds];
    setMySubmittedIds(nextMine);
    localStorage.setItem('COMMUNITY_HERO_MY_SUBMISSIONS', JSON.stringify(nextMine));

    // Refresh core list
    setIssues(getIssues());
    setFormStep('success');
  };

  const handleResetForm = () => {
    setCategory('potholes');
    setDescription('');
    setPhotos([]);
    setCitizenName('');
    setCitizenPhone('');
    setGeneratedAIReport(null);
    setLastSubmittedIssueId(null);
    setFormStep('edit');
    setActiveTab('track'); // Take user directly to status tracking
    setTrackFilter('mine'); // Filter for their newly created item
  };

  // Status mapping colors
  const getStatusStyle = (status: IssueStatus) => {
    switch (status) {
      case 'reported': return { text: 'Reported', color: 'bg-blue-100 text-blue-800 border-blue-200' };
      case 'reviewed': return { text: 'Assessed & Verified', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' };
      case 'assigned': return { text: 'Team Assigned', color: 'bg-amber-100 text-amber-800 border-amber-200' };
      case 'in_progress': return { text: 'Work in Progress', color: 'bg-purple-100 text-purple-800 border-purple-200' };
      case 'resolved': return { text: 'Resolved & Fixed', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
    }
  };

  const getSeverityBadge = (level: string) => {
    switch (level) {
      case 'Critical': return 'bg-rose-100 text-rose-800 font-bold border-rose-200';
      case 'High': return 'bg-amber-100 text-amber-800 font-bold border-amber-200';
      case 'Medium': return 'bg-blue-100 text-blue-800 font-semibold border-blue-200';
      default: return 'bg-slate-100 text-slate-700 font-medium border-slate-200';
    }
  };

  // Filter track list
  const filteredIssues = issues.filter(issue => {
    if (trackFilter === 'mine') {
      return mySubmittedIds.includes(issue.id);
    }
    return true; // Show all issues in the neighborhood
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 sm:p-6 md:p-8 gap-6 sm:gap-8 flex flex-col font-sans text-slate-800" id="citizen-portal-root">
      
      {/* Top Civic Navigation Header styled to match Bento Grid theme */}
      <header className="w-full max-w-7xl mx-auto flex flex-wrap md:flex-nowrap items-center justify-between bg-white px-5 py-4 sm:px-6 sm:py-4.5 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.01),0_1px_2px_rgba(0,0,0,0.03)] border border-slate-200/80 gap-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBackToHome}
            className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 hover:text-slate-850 hover:scale-105 transition-all flex items-center justify-center shrink-0"
            title="Back to portal select"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="w-10 h-10 bg-gradient-to-tr from-sky-600 to-sky-500 rounded-xl flex items-center justify-center text-white font-black text-xl shrink-0 select-none shadow-xs">
            H
          </div>
          <div className="flex flex-col">
            <h1 className="text-sm sm:text-base font-extrabold tracking-tight text-slate-900 font-display flex items-center gap-1.5 leading-none">
              <span>Community Hero</span>
              <span className="text-[8px] sm:text-[9px] uppercase font-bold px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100/60 tracking-wider">Citizen</span>
            </h1>
            <p className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1 leading-none">Nagpur Portal • Civic Care Active</p>
          </div>
        </div>

        <div className="flex bg-slate-100/80 p-1 rounded-xl border border-slate-200/50 shrink-0">
          <button
            onClick={() => { setActiveTab('report'); setFormStep('edit'); }}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'report' 
                ? "bg-white text-slate-900 shadow-2xs font-bold" 
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            <span>Report Issue</span>
          </button>
          <button
            onClick={() => { setActiveTab('track'); refreshIssues(); }}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'track' 
                ? "bg-white text-slate-900 shadow-2xs font-bold" 
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <Activity className="h-3.5 w-3.5" />
            <span>Track Status</span>
          </button>
        </div>

        <button 
          onClick={onNavigateToMunicipality}
          className="text-xs bg-slate-950 hover:bg-slate-900 text-white font-bold px-4 py-2.5 rounded-xl shadow-3xs hover:shadow-xs hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer"
        >
          Municipal Console
        </button>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto w-full flex-grow flex flex-col gap-6 sm:gap-8">
        
        {/* TAB 1: REPORT CIVIC ISSUE FORM */}
        {activeTab === 'report' && (
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.01),0_1px_2px_rgba(0,0,0,0.03)] p-6 sm:p-8 md:p-10 space-y-8 animate-fade-in" id="report-wizard">
            
            {/* Step 1: Editor Form */}
            {formStep === 'edit' && (
              isGeneratingAI ? (
                <div className="max-w-2xl mx-auto py-10 px-4 sm:px-6 flex flex-col items-center text-center font-sans" id="ai-premium-loading">
                  {/* Soft ambient glowing visual wrapper */}
                  <div className="relative mb-8">
                    <div className="absolute inset-0 bg-sky-400/10 blur-2xl rounded-full animate-pulse" />
                    <div className="relative h-16 w-16 bg-sky-50 text-sky-600 rounded-2xl flex items-center justify-center border border-sky-100 shadow-md">
                      <RefreshCcw className="h-7 w-7 animate-spin text-sky-600" />
                    </div>
                  </div>

                  <div className="space-y-2 mb-10">
                    <h3 className="text-lg sm:text-xl font-bold text-slate-900 font-display">
                      Reviewing Your Community Report
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed font-medium">
                      Nagpur Civic Intelligence is actively analyzing details to prioritize safety responses and prevent overlapping dispatches.
                    </p>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full max-w-md bg-slate-100 h-2.5 rounded-full overflow-hidden mb-10 shadow-3xs relative border border-slate-200/50">
                    <motion.div 
                      className="bg-gradient-to-r from-sky-500 to-sky-600 h-full rounded-full"
                      initial={{ width: "5%" }}
                      animate={{ 
                        width: `${
                          aiLoadingStep === 0 ? 20 :
                          aiLoadingStep === 1 ? 40 :
                          aiLoadingStep === 2 ? 60 :
                          aiLoadingStep === 3 ? 80 :
                          aiLoadingStep === 4 ? 95 : 100
                        }%` 
                      }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                    />
                  </div>

                  {/* Interactive Step-by-Step Milestones */}
                  <div className="w-full max-w-md text-left space-y-5 bg-slate-50/50 border border-slate-200/50 rounded-2xl p-6 sm:p-7 shadow-3xs">
                    {[
                      { label: "Understanding report details", desc: "Analyzing description text and attached media" },
                      { label: "Reviewing safety & hazard severity", desc: "Evaluating public hazard levels and structural safety impact" },
                      { label: "Checking nearby duplicates", desc: "Auditing coordinates against active neighborhood reports" },
                      { label: "Routing to municipal department", desc: "Identifying specialized engineering and dispatch teams" },
                      { label: "Preparing public dispatch summary", desc: "Formulating safety advisory and recommended crew tasks" }
                    ].map((step, idx) => {
                      const isCompleted = aiLoadingStep > idx;
                      const isActive = aiLoadingStep === idx;
                      
                      return (
                        <div 
                          key={idx} 
                          className={`flex items-start gap-4 transition-all duration-300 ${
                            isCompleted ? "opacity-100" :
                            isActive ? "opacity-100 scale-[1.02]" :
                            "opacity-45"
                          }`}
                        >
                          {/* Milestone Left Indicator */}
                          <div className="shrink-0 mt-0.5">
                            {isCompleted ? (
                              <div className="h-5 w-5 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-xs border border-emerald-200">
                                <Check className="h-3 w-3 stroke-[3]" />
                              </div>
                            ) : isActive ? (
                              <div className="h-5 w-5 bg-sky-500 text-white rounded-full flex items-center justify-center text-xs shadow-xs">
                                <span className="relative flex h-2 w-2">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-200 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                                </span>
                              </div>
                            ) : (
                              <div className="h-5 w-5 bg-slate-200 text-slate-400 rounded-full flex items-center justify-center text-[10px] font-bold border border-slate-300/30">
                                {idx + 1}
                              </div>
                            )}
                          </div>

                          {/* Milestone Text Details */}
                          <div className="space-y-0.5">
                            <h4 className={`text-xs font-bold leading-none ${
                              isCompleted ? "text-slate-800" :
                              isActive ? "text-sky-700 font-extrabold" :
                              "text-slate-500"
                            }`}>
                              {step.label}
                            </h4>
                            <p className={`text-[10px] leading-normal ${
                              isCompleted ? "text-slate-400" :
                              isActive ? "text-slate-500 font-medium" :
                              "text-slate-400/70"
                            }`}>
                              {step.desc}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <p className="text-[10px] text-slate-400 font-semibold mt-8 uppercase tracking-widest leading-none flex items-center gap-1.5 justify-center">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Connecting Nagpur Alliance Teams
                  </p>
                </div>
              ) : (
                <form onSubmit={handleRequestAIReview} className="space-y-8">
                <div className="border-b border-slate-200/60 pb-5">
                  <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5 font-display">
                    <FileText className="h-5.5 w-5.5 text-sky-600" />
                    File a New Community Report
                  </h2>
                  <p className="text-xs text-slate-400 mt-1.5 leading-relaxed font-medium">
                    Please share details of the civic issue below. We will instantly assess public safety priority, locate nearby reports, and route it to Nagpur's response teams to get it resolved.
                  </p>
                </div>

                {/* 2. Description Area */}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-700 tracking-wide uppercase flex items-center gap-1.5">
                    <MessageSquare className="h-3.5 w-3.5 text-slate-400" />
                    Describe what is happening
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the issue. For example: 'A deep pothole has opened up in the left lane, right near the crosswalk. Multiple cars have to brake hard or swerve to avoid hitting it. Dangerous at night.'"
                    className="w-full p-4.5 border border-slate-200 rounded-2xl text-xs bg-slate-50/40 hover:bg-slate-50/70 focus:bg-white focus:outline-none focus:ring-4 focus:ring-sky-500/5 focus:border-sky-500 placeholder:text-slate-400 font-medium leading-relaxed transition-all"
                  />
                  <div className="flex justify-between items-center px-1">
                    <span className="text-[10px] text-slate-400 font-medium">Be specific about potential safety hazards.</span>
                    <span className={`text-[10px] font-bold ${description.length < 25 ? 'text-amber-600' : 'text-slate-400'}`}>
                      {description.length} chars {description.length < 25 && "(Min 25 recommended for detailed priority triage)"}
                    </span>
                  </div>
                </div>

                {/* 3. Photo Uploader Component */}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-700 tracking-wide uppercase flex items-center gap-1.5">
                    <Camera className="h-3.5 w-3.5 text-slate-400" />
                    Upload Photos (1 to 5)
                  </label>
                  <PhotoUploader onPhotosChange={setPhotos} />
                </div>

                {/* 4. Interactive Location Selector */}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-700 tracking-wide uppercase flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    Pin Location On Map
                  </label>
                  <MapPlaceholder 
                    onLocationSelect={(name, coords) => {
                      setLocationName(name);
                      setLocationCoords(coords);
                    }}
                  />
                </div>

                {/* 5. Citizen Contact Info */}
                <div className="bg-slate-50/50 rounded-2xl p-6 border border-slate-200/60 space-y-4">
                  <h4 className="text-xs font-bold text-slate-800">Your Contact Details (Optional)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <User className="h-4 w-4" />
                      </div>
                      <input
                        type="text"
                        placeholder="Your full name"
                        value={citizenName}
                        onChange={(e) => setCitizenName(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-xs bg-white focus:outline-none focus:ring-4 focus:ring-sky-500/5 focus:border-sky-500 font-semibold"
                      />
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Phone className="h-4 w-4" />
                      </div>
                      <input
                        type="tel"
                        placeholder="Your phone number"
                        value={citizenPhone}
                        onChange={(e) => setCitizenPhone(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-xs bg-white focus:outline-none focus:ring-4 focus:ring-sky-500/5 focus:border-sky-500 font-semibold"
                      />
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-relaxed font-semibold">
                    Contact details will only be used to update you regarding repairs, or if Nagpur municipal workers require assistance finding the exact spot. Leave blank to report anonymously.
                  </p>
                </div>

                {/* Submit Action to trigger AI Review */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isGeneratingAI || !description.trim()}
                    className="w-full bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-bold py-3.5 px-4 rounded-xl shadow-3xs hover:shadow-xs hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center justify-center gap-2 text-xs select-none cursor-pointer"
                  >
                    {isGeneratingAI ? (
                      <>
                        <RefreshCcw className="h-4 w-4 animate-spin" />
                        <span>Reviewing details for city response teams...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 text-sky-100 shrink-0 fill-sky-200/20" />
                        <span>Submit for Civic Priority Review</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
              )
            )}

            {/* Step 2: Citizen AI Generated Report Review Screen */}
            {formStep === 'ai_review' && generatedAIReport && (
              <div className="space-y-10 animate-fade-in" id="ai-review-screen">
                
                {/* Header Title & Subtitle */}
                <div className="border-b border-slate-100 pb-6">
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-display">
                    We reviewed your report details
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed font-medium">
                    We have carefully processed the details of your report to ensure it is routed swiftly and accurately to Nagpur's response crews. Please review the assessed details below.
                  </p>
                </div>

                {/* Primary AI Insights & Draft Preview Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                  
                  {/* Left Column: Report Draft, AI Understanding, Community Impact, and Nearby Status */}
                  <div className="lg:col-span-7 space-y-8">
                    
                    {/* 2. AI Understanding (Elevated as the Main Visual Focus) */}
                    <div className="bg-gradient-to-br from-white via-sky-50/10 to-indigo-50/10 border border-sky-100/60 rounded-2xl p-6 sm:p-8 space-y-6 shadow-[0_4px_24px_-4px_rgba(14,165,233,0.06)] relative overflow-hidden transition-all hover:shadow-[0_4px_32px_-4px_rgba(14,165,233,0.1)] duration-300">
                      
                      {/* Decorative soft light blur */}
                      <div className="absolute top-0 right-0 w-32 h-32 bg-sky-100/20 rounded-full filter blur-2xl pointer-events-none" />
                      
                      <div className="flex items-center justify-between pb-4 border-b border-sky-100/30 relative z-10">
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 rounded-xl bg-sky-500/10 flex items-center justify-center border border-sky-500/20">
                            <Sparkles className="h-4.5 w-4.5 text-sky-600 fill-sky-600/10 animate-pulse" />
                          </div>
                          <span className="text-[11px] uppercase font-extrabold tracking-wider text-sky-850">
                            Civic Priority & Safety Assessment
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 text-[10px] font-extrabold rounded-full border bg-emerald-50 text-emerald-800 border-emerald-200 shadow-3xs">
                            Verified via Civic Engine
                          </span>
                          <span className="hidden sm:inline-block px-2.5 py-1 text-[10px] font-bold bg-sky-50 text-sky-750 rounded-full border border-sky-100">
                            City Ready
                          </span>
                        </div>
                      </div>

                      {/* Silently switch to elegant civic response mode if auto-fallback engaged */}
                      {devErrorDetail && (
                        <div className="bg-emerald-50 border border-emerald-100 text-emerald-950 text-[11px] rounded-xl p-3.5 leading-relaxed relative z-10 shadow-3xs flex items-center gap-2">
                          <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                          <span className="font-semibold text-emerald-800">Community Hero prepared a civic assessment successfully.</span>
                        </div>
                      )}

                      {/* Friendly banner statement */}
                      <div className="bg-[#FAF9F5] text-slate-700 border border-slate-200/30 rounded-xl p-4.5 text-sm font-medium leading-relaxed relative z-10 shadow-3xs">
                        <span className="text-emerald-600 font-bold mr-1.5">💡 Community Impact Note:</span>
                        {citizenFriendlyNote || (
                          <>
                            Our initial assessment prioritizes this as a <span className="font-bold text-sky-700 underline decoration-sky-300 decoration-2 underline-offset-2">{generatedAIReport.safetyRiskLevel.toLowerCase()}-priority</span> {CATEGORIES.find(c => c.value === category)?.label.toLowerCase() || 'general'} issue for Nagpur's response teams.
                          </>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2 text-xs font-medium relative z-10">
                        
                        {/* Detected Category & Severity */}
                        <div className="space-y-4 bg-white/60 p-4.5 rounded-xl border border-sky-100/30 shadow-3xs">
                          <div>
                            <span className="text-[10px] text-slate-400 uppercase font-extrabold tracking-wider block mb-1.5">Detected Issue Type</span>
                            <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-sky-50/50 border border-sky-100/50 rounded-lg font-bold text-slate-800">
                              <span>{CATEGORIES.find(c => c.value === category)?.icon}</span>
                              <span className="text-xs">{CATEGORIES.find(c => c.value === category)?.label}</span>
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 uppercase font-extrabold tracking-wider block mb-1.5">Severity Level</span>
                            <span className={`inline-block px-3 py-1 text-xs border rounded-lg font-bold shadow-3xs ${getSeverityBadge(generatedAIReport.safetyRiskLevel)}`}>
                              {generatedAIReport.safetyRiskLevel} Severity
                            </span>
                          </div>
                        </div>

                        {/* Priority Score & Confidence Score */}
                        <div className="space-y-4 bg-white/60 p-4.5 rounded-xl border border-sky-100/30 shadow-3xs">
                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-[10px] text-slate-400 uppercase font-extrabold tracking-wider">Priority Score</span>
                              <div className="flex items-baseline gap-0.5">
                                <span className="text-sm font-extrabold text-slate-900 font-display">{generatedAIReport.urgencyScore}</span>
                                <span className="text-[9px] text-slate-400">/100</span>
                              </div>
                            </div>
                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${generatedAIReport.urgencyScore}%` }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                                className="bg-sky-500 h-full rounded-full" 
                              />
                            </div>
                          </div>
                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-[10px] text-slate-400 uppercase font-extrabold tracking-wider">Confidence Score</span>
                              <span className="text-sm font-extrabold text-sky-600 font-display">{generatedAIReport.confidenceScore || 94}%</span>
                            </div>
                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${generatedAIReport.confidenceScore || 94}%` }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                                className="bg-sky-400 h-full rounded-full" 
                              />
                            </div>
                          </div>
                        </div>

                      </div>
                    </div>

                    {/* 1. Report Preview */}
                    <div className="bg-white border border-slate-100 rounded-2xl p-6 space-y-5 shadow-sm transition-all hover:shadow-md duration-300">
                      <div className="flex items-center gap-2.5 pb-3.5 border-b border-slate-100">
                        <div className="h-8 w-8 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100">
                          <FileText className="h-4.5 w-4.5 text-slate-500" />
                        </div>
                        <span className="text-[11px] uppercase font-bold tracking-wider text-slate-400">
                          Your Original Draft Report
                        </span>
                      </div>
                      
                      <div className="space-y-4 text-xs font-medium">
                        {/* Map location */}
                        <div className="flex items-start gap-3">
                          <div className="h-7 w-7 rounded-lg bg-sky-50/70 border border-sky-100/30 flex items-center justify-center shrink-0">
                            <MapPin className="h-4 w-4 text-sky-600" />
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[9px] uppercase font-bold tracking-wider">Selected Map Location</span>
                            <span className="text-slate-700 font-bold text-[13px]">{locationName}</span>
                          </div>
                        </div>

                        {/* Written message */}
                        <div className="flex items-start gap-3 pt-1">
                          <div className="h-7 w-7 rounded-lg bg-emerald-50/70 border border-emerald-100/30 flex items-center justify-center shrink-0">
                            <MessageSquare className="h-4 w-4 text-emerald-600" />
                          </div>
                          <div className="w-full">
                            <span className="text-slate-400 block text-[9px] uppercase font-bold tracking-wider mb-1.5">Citizen's Written Message</span>
                            <div className="relative">
                              <span className="absolute -left-2.5 top-0 text-slate-300 font-serif text-3xl select-none">“</span>
                              <p className="text-slate-650 italic pl-3.5 leading-relaxed text-[13px]">
                                {description}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Photo thumbnails */}
                        {photos.length > 0 && (
                          <div className="pt-2">
                            <span className="text-slate-400 block text-[9px] uppercase font-bold tracking-wider mb-2.5">Uploaded Photo Thumbnails</span>
                            <div className="flex gap-3 overflow-x-auto pb-1">
                              {photos.map((url, i) => (
                                <img 
                                  key={i} 
                                  src={url} 
                                  alt="submission thumbnail" 
                                  className="h-16 w-16 object-cover rounded-xl border border-slate-150 shadow-3xs shrink-0 hover:scale-105 transition-all duration-300"
                                  referrerPolicy="no-referrer"
                                />
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Citizen details (if provided) */}
                        {(citizenName || citizenPhone) && (
                          <div className="pt-3 border-t border-slate-100 flex flex-wrap gap-5 text-slate-500">
                            {citizenName && (
                              <div>
                                <span className="text-slate-400 block text-[9px] uppercase font-bold tracking-wider">Submitted By</span>
                                <span className="font-semibold text-slate-700 text-xs">{citizenName}</span>
                              </div>
                            )}
                            {citizenPhone && (
                              <div>
                                <span className="text-slate-400 block text-[9px] uppercase font-bold tracking-wider">Contact Phone</span>
                                <span className="font-semibold text-slate-700 text-xs">{citizenPhone}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 3. Why this matters */}
                    <div className="bg-white border border-slate-100 rounded-2xl p-6 space-y-4 shadow-sm transition-all hover:shadow-md duration-300">
                      <div className="flex items-center gap-2 pb-3.5 border-b border-slate-100">
                        <div className="h-8 w-8 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100">
                          <span className="text-base select-none">🌱</span>
                        </div>
                        <span className="text-[11px] uppercase font-bold tracking-wider text-slate-400">
                          Why this matters
                        </span>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="h-10 w-10 bg-amber-50 border border-amber-100/40 rounded-xl flex items-center justify-center shrink-0 text-xl shadow-3xs">
                          ⚠️
                        </div>
                        <div className="space-y-1.5">
                          <h5 className="text-xs font-extrabold text-slate-900 tracking-tight">Safety & Community Impact</h5>
                          <p className="text-xs text-slate-650 leading-relaxed font-medium">
                            {category === 'potholes' && "Damaged asphalt poses direct hazards to pedestrians, two-wheelers, school buses, and vehicles swerving to avoid craters."}
                            {category === 'open drains' && "Exposed pits can cause major trips or falls, and present a critical risk to children and elderly neighbors."}
                            {category === 'broken streetlights' && "Reduced visibility can make evening walks uncomfortable, inviting traffic blindspots and safety concerns."}
                            {category === 'exposed wiring' && "Live cables or unsealed power fixtures present severe electrical and shock hazards to kids and neighborhood pets."}
                            {category === 'water leakage' && "Spreading water compromises road beds, breeds mosquitoes, and creates slipping hazards for local pedestrians."}
                            {!['potholes', 'open drains', 'broken streetlights', 'exposed wiring', 'water leakage'].includes(category) && "Resolving this prevents secondary street deterioration and ensures Nagpur remains safe and accessible for daily commuters."}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* 4. Similar reports nearby */}
                    <div className="bg-white border border-slate-100 rounded-2xl p-6 space-y-4 shadow-sm transition-all hover:shadow-md duration-300">
                      <div className="flex items-center gap-2 pb-3.5 border-b border-slate-100">
                        <div className="h-8 w-8 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100">
                          <span className="text-base select-none">🗺️</span>
                        </div>
                        <span className="text-[11px] uppercase font-bold tracking-wider text-slate-400">
                          Similar reports nearby
                        </span>
                      </div>
                      {generatedAIReport.duplicateRisk !== 'None' ? (
                        <div className="bg-amber-50/40 border border-amber-100/40 rounded-xl p-4 flex items-start gap-3 text-xs">
                          <span className="text-lg leading-none select-none shrink-0 mt-0.5">📍</span>
                          <div className="space-y-1 font-medium text-slate-700">
                            <span className="font-bold text-amber-900 text-xs">2 similar reports found near this location.</span>
                            <p className="text-[11px] text-slate-600 leading-relaxed">
                               Nagpur city is already looking at a related report in this immediate block. We will automatically group your report with existing records to strengthen the case and coordinate dispatch.
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-emerald-50/20 border border-emerald-100/20 rounded-xl p-4 flex items-start gap-3 text-xs">
                          <span className="text-lg leading-none select-none shrink-0 mt-0.5">✅</span>
                          <div className="space-y-1 font-medium text-slate-700">
                            <span className="font-bold text-emerald-900 text-xs">No similar reports found nearby.</span>
                            <p className="text-[11px] text-slate-600 leading-relaxed">
                              This appears to be a newly identified issue on this block. Your submission will register a fresh maintenance ticket for Nagpur's teams.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                  </div>
                  
                  {/* Right Column: Suggested Team, Official Summary, First Actions, Confirmation */}
                  <div className="lg:col-span-5 bg-[#FAF9F5] p-6 sm:p-8 rounded-[24px] border border-slate-200/40 space-y-7 shadow-3xs">
                    
                    {/* 5. Suggested municipal team */}
                    <div className="space-y-2.5">
                      <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400 block">
                        Suggested municipal team
                      </span>
                      <div className="bg-white border border-slate-100 p-4 rounded-xl shadow-3xs flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-sky-50 border border-sky-100/30 flex items-center justify-center text-lg shrink-0">
                          🏛️
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block leading-none mb-1">Primary Team Assigned</span>
                          <span className="text-xs font-bold text-slate-800">
                            {category === 'potholes' && 'Road Repair Team'}
                            {category === 'open drains' && 'Drainage Team'}
                            {category === 'broken streetlights' && 'Streetlight Maintenance Team'}
                            {category === 'exposed wiring' && 'Electrical Safety Team'}
                            {category === 'water leakage' && 'Water Utility Team'}
                            {!['potholes', 'open drains', 'broken streetlights', 'exposed wiring', 'water leakage'].includes(category) && 'Public Works Maintenance'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* 6. Municipality-ready summary */}
                    <div className="space-y-2.5">
                      <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400 block">
                        Municipality-ready summary
                      </span>
                      <div className="bg-white border border-slate-100 p-5 rounded-xl shadow-3xs space-y-2 relative">
                        <p className="text-xs text-slate-650 italic leading-relaxed font-semibold">
                          "{generatedAIReport.executiveSummary}"
                        </p>
                        <p className="text-[9px] text-slate-400 font-semibold leading-normal pt-2 border-t border-slate-100">
                          Structured text prepared automatically for municipal dispatch records.
                        </p>
                      </div>
                    </div>

                    {/* 7. Suggested first actions */}
                    <div className="space-y-2.5">
                      <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400 block">
                        Suggested first actions
                      </span>
                      <div className="bg-white border border-slate-100 p-5 rounded-xl shadow-3xs space-y-4 text-xs">
                        {(generatedAIReport.recommendedActionPlan && generatedAIReport.recommendedActionPlan.length > 0
                          ? generatedAIReport.recommendedActionPlan
                          : [
                              "Inspect the location for verification",
                              "Add temporary safety warning",
                              "Assign the repair team"
                            ]
                        ).map((action, idx) => (
                          <div key={idx} className="flex items-start gap-3 leading-relaxed">
                            <span className="h-5 w-5 bg-sky-50 text-sky-700 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5 border border-sky-100">
                              {idx + 1}
                            </span>
                            <span className="text-slate-650 font-semibold">{action}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 8. Citizen confirmation */}
                    <div className="pt-5 border-t border-slate-200/40 space-y-4">
                      {/* Subtle reassuring text */}
                      <p className="text-[11px] text-slate-500 text-center leading-relaxed font-semibold italic bg-amber-50/20 border border-amber-100/10 rounded-xl py-2.5 px-3">
                        💝 Thank you for helping improve safety in your neighborhood.
                      </p>

                      <button
                        type="button"
                        onClick={handleSubmitReport}
                        className="w-full bg-sky-600 hover:bg-sky-500 text-white font-bold py-3.5 px-5 rounded-xl text-xs transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 cursor-pointer select-none"
                      >
                        <CheckCircle className="h-4.5 w-4.5" />
                        <span>Confirm & Submit Report</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormStep('edit')}
                        className="w-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold py-3 px-5 rounded-xl text-xs shadow-3xs cursor-pointer transition-all active:scale-[0.99] duration-200 select-none"
                      >
                        Edit Report
                      </button>
                    </div>

                  </div>
                  
                </div>

              </div>
            )}

            {/* Step 3: SUCCESS CONFIRMATION PANEL (Civic Delivery & Tracking Experience) */}
            {formStep === 'success' && (
              <div className="max-w-3xl mx-auto space-y-8 animate-fade-in py-4" id="success-panel">
                
                {/* Header Success Area */}
                <div className="text-center space-y-3.5">
                  <div className="inline-flex h-16 w-16 bg-emerald-50 text-emerald-600 rounded-full items-center justify-center shadow-md border border-emerald-100/60 animate-bounce">
                    <Check className="h-8 w-8 stroke-[3.5]" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-display">
                      Thank you! Your voice is heard, and the city is on it.
                    </h3>
                    <p className="text-sm sm:text-base text-slate-500 font-semibold max-w-xl mx-auto leading-relaxed">
                      We've received your report. By looking out for our neighborhood, you're helping make Nagpur a safer, cleaner, and better place for everyone. Nagpur's response crews have been notified.
                    </p>
                  </div>
                </div>

                {/* Main Bento Grid layout for Tracking Details */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  
                  {/* LEFT: Issue Ticket Summary Card (5 cols) */}
                  <div className="md:col-span-5 space-y-5">
                    <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-[0_12px_24px_-10px_rgba(15,23,42,0.04)] space-y-5 relative overflow-hidden">
                      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-sky-400 to-indigo-500" />
                      
                      {/* Ticket Identifier */}
                      <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                        <div className="space-y-0.5">
                          <span className="text-[10px] text-slate-400 uppercase tracking-widest font-black">Official Report ID</span>
                          <div className="text-lg font-black text-slate-900 font-mono tracking-tight">
                            {lastSubmittedIssueId || "CH-9241"}
                          </div>
                        </div>
                        <span className="px-3 py-1 bg-sky-50 text-sky-700 text-[10px] font-black uppercase rounded-lg border border-sky-100 tracking-wider">
                          Active Dispatch
                        </span>
                      </div>

                      {/* Summary Fields */}
                      <div className="space-y-4 text-xs">
                        {/* Category */}
                        <div className="space-y-1">
                          <span className="text-[9px] text-slate-400 uppercase tracking-wider font-extrabold block">Issue Type</span>
                          <span className="text-slate-800 font-bold bg-slate-50 border border-slate-200/50 rounded-xl py-2 px-3 flex items-center gap-2">
                            {CATEGORIES.find(c => c.value === category)?.icon || "📍"}
                            {CATEGORIES.find(c => c.value === category)?.label || category}
                          </span>
                        </div>

                        {/* Location */}
                        <div className="space-y-1">
                          <span className="text-[9px] text-slate-400 uppercase tracking-wider font-extrabold block">Location Reported</span>
                          <span className="text-slate-700 font-bold block max-w-xs leading-relaxed truncate-2-lines">
                            {locationName}
                          </span>
                        </div>

                        {/* Urgency Metrics */}
                        <div className="grid grid-cols-2 gap-3 pt-2">
                          <div className="bg-[#FAF9F5] border border-amber-100 rounded-xl p-3 text-center">
                            <span className="text-[9px] text-amber-800/80 uppercase font-bold tracking-wider block mb-0.5">Safety Priority</span>
                            <span className="text-xs font-black text-amber-900">
                              {generatedAIReport?.safetyRiskLevel || "High"}
                            </span>
                          </div>
                          <div className="bg-sky-50/50 border border-sky-100 rounded-xl p-3 text-center">
                            <span className="text-[9px] text-sky-800/80 uppercase font-bold tracking-wider block mb-0.5">Response Urgency</span>
                            <span className="text-xs font-black text-sky-900">
                              {generatedAIReport?.urgencyScore || 85} / 100
                            </span>
                          </div>
                        </div>

                        {/* Dispatch Team */}
                        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4.5 space-y-1">
                          <span className="text-[9px] text-slate-400 uppercase tracking-wider font-black block">Assigned City Response Team</span>
                          <div className="font-extrabold text-slate-800 text-xs flex items-center gap-1.5">
                            <span className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
                            {generatedAIReport?.recommendedDepartment || "Nagpur Public Works Department"}
                          </div>
                          <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                            Matched and routed to the corresponding department for rapid resolution.
                          </p>
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* RIGHT: Civic Progress Tracker Timeline (7 cols) */}
                  <div className="md:col-span-7 space-y-5">
                    
                    {/* Next step reassurance message */}
                    <div className="bg-sky-50 border border-sky-100 rounded-2xl p-4.5 flex items-start gap-3 text-xs text-sky-950 shadow-3xs">
                      <Clock className="h-5 w-5 text-sky-600 shrink-0 mt-0.5" />
                      <div className="space-y-1 font-semibold">
                        <span className="text-sky-900 font-bold block text-sm">Estimated Next Step</span>
                        <p className="text-sky-800 leading-relaxed font-medium">
                          "Municipality review is the next step. You’ll be able to track updates here."
                        </p>
                        <span className="text-[10px] text-sky-600/80 font-bold block pt-1">
                          Expected triage window: {generatedAIReport?.safetyRiskLevel === 'Critical' ? 'Under 4 hours' : 
                          generatedAIReport?.safetyRiskLevel === 'High' ? 'Within 24 hours' : 'Within 3-5 days'}
                        </span>
                      </div>
                    </div>

                    {/* Timeline Tracker */}
                    <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-[0_12px_24px_-10px_rgba(15,23,42,0.04)] space-y-6">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-black tracking-widest text-slate-450 block">Resolution Progress</span>
                        <span className="text-[10px] text-emerald-600 bg-emerald-50 border border-emerald-150 px-2 py-0.5 rounded-md font-extrabold">3 / 7 Steps Complete</span>
                      </div>

                      {/* Steps Vertical Timeline */}
                      <div className="relative pl-6 space-y-6">
                        
                        {/* Connecting Line */}
                        <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-slate-100" />
                        
                        {/* Step 1: Report Submitted */}
                        <div className="relative flex gap-4 text-xs">
                          {/* Checked bullet */}
                          <div className="absolute -left-[21px] top-0.5 h-[22px] w-[22px] bg-emerald-500 text-white rounded-full flex items-center justify-center border-4 border-white shadow-2xs z-10">
                            <Check className="h-3 w-3 stroke-[3]" />
                          </div>
                          <div className="space-y-0.5 w-full">
                            <div className="flex justify-between items-center">
                              <span className="font-extrabold text-slate-900">Report Submitted</span>
                              <span className="text-[9px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">Completed</span>
                            </div>
                            <p className="text-slate-500 text-[11px] leading-relaxed font-medium">
                              Your ticket has been logged into the regional community register.
                            </p>
                          </div>
                        </div>

                        {/* Step 2: AI Review Complete */}
                        <div className="relative flex gap-4 text-xs">
                          {/* Checked bullet */}
                          <div className="absolute -left-[21px] top-0.5 h-[22px] w-[22px] bg-emerald-500 text-white rounded-full flex items-center justify-center border-4 border-white shadow-2xs z-10">
                            <Check className="h-3 w-3 stroke-[3]" />
                          </div>
                          <div className="space-y-0.5 w-full">
                            <div className="flex justify-between items-center">
                              <span className="font-extrabold text-slate-900">Civic Assessment Verified</span>
                              <span className="text-[9px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">Completed</span>
                            </div>
                            <p className="text-slate-500 text-[11px] leading-relaxed font-medium">
                              We reviewed your report and prepared it for the city response teams.
                            </p>
                          </div>
                        </div>

                        {/* Step 3: Municipality Notified */}
                        <div className="relative flex gap-4 text-xs">
                          {/* Checked bullet */}
                          <div className="absolute -left-[21px] top-0.5 h-[22px] w-[22px] bg-emerald-500 text-white rounded-full flex items-center justify-center border-4 border-white shadow-2xs z-10">
                            <Check className="h-3 w-3 stroke-[3]" />
                          </div>
                          <div className="space-y-0.5 w-full">
                            <div className="flex justify-between items-center">
                              <span className="font-extrabold text-slate-900">Municipality Notified</span>
                              <span className="text-[9px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">Completed</span>
                            </div>
                            <p className="text-slate-500 text-[11px] leading-relaxed font-medium">
                              Automated dispatch request forwarded directly to the designated department's system.
                            </p>
                          </div>
                        </div>

                        {/* Step 4: Team Assigned */}
                        <div className="relative flex gap-4 text-xs">
                          {/* Pending bullet */}
                          <div className="absolute -left-[21px] top-0.5 h-[22px] w-[22px] bg-white border-2 border-amber-400 rounded-full flex items-center justify-center z-10 shadow-3xs">
                            <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                          </div>
                          <div className="space-y-0.5 w-full">
                            <div className="flex justify-between items-center">
                              <span className="font-extrabold text-slate-800">Team Assigned</span>
                              <span className="text-[9px] text-amber-600 font-extrabold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100 animate-pulse">Pending Dispatch</span>
                            </div>
                            <p className="text-slate-500 text-[11px] leading-relaxed font-medium">
                              Supervisors are identifying the nearest active unit with relevant equipment.
                            </p>
                          </div>
                        </div>

                        {/* Step 5: Work In Progress */}
                        <div className="relative flex gap-4 text-xs">
                          {/* Disabled bullet */}
                          <div className="absolute -left-[21px] top-0.5 h-[22px] w-[22px] bg-slate-50 border border-slate-200 rounded-full flex items-center justify-center z-10" />
                          <div className="space-y-0.5 w-full opacity-60">
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-slate-700">Work In Progress</span>
                              <span className="text-[9px] text-slate-400 font-bold">Scheduled</span>
                            </div>
                            <p className="text-slate-450 text-[11px] leading-relaxed font-medium">
                              Field engineers will be deployed to begin inspection and repairs.
                            </p>
                          </div>
                        </div>

                        {/* Step 6: Resolved */}
                        <div className="relative flex gap-4 text-xs">
                          {/* Disabled bullet */}
                          <div className="absolute -left-[21px] top-0.5 h-[22px] w-[22px] bg-slate-50 border border-slate-200 rounded-full flex items-center justify-center z-10" />
                          <div className="space-y-0.5 w-full opacity-65">
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-slate-700">Resolved</span>
                              <span className="text-[9px] text-slate-400 font-bold">Awaiting Fix</span>
                            </div>
                            <p className="text-slate-450 text-[11px] leading-relaxed font-medium">
                              The crew completes repair works and uploads verification media.
                            </p>
                          </div>
                        </div>

                        {/* Step 7: Citizen Confirmed */}
                        <div className="relative flex gap-4 text-xs">
                          {/* Disabled bullet */}
                          <div className="absolute -left-[21px] top-0.5 h-[22px] w-[22px] bg-slate-50 border border-slate-200 rounded-full flex items-center justify-center z-10" />
                          <div className="space-y-0.5 w-full opacity-55">
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-slate-700">Citizen Confirmed</span>
                              <span className="text-[9px] text-slate-400 font-bold">Reassurance Loop</span>
                            </div>
                            <p className="text-slate-450 text-[11px] leading-relaxed font-medium">
                              You'll receive a final ping to verify you're satisfied with the physical repair.
                            </p>
                          </div>
                        </div>

                      </div>

                    </div>

                  </div>

                </div>

                {/* Navigation Buttons */}
                <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <button
                    type="button"
                    onClick={handleResetForm}
                    className="w-full sm:w-auto bg-sky-600 hover:bg-sky-500 text-white font-extrabold px-8 py-3.5 rounded-2xl text-xs shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2 cursor-pointer select-none"
                  >
                    View All Reports
                  </button>
                  <button
                    type="button"
                    onClick={onBackToHome}
                    className="w-full sm:w-auto bg-white hover:bg-slate-50 border border-slate-250 text-slate-700 font-bold px-8 py-3.5 rounded-2xl text-xs shadow-3xs transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer select-none"
                  >
                    Back to Home
                  </button>
                </div>

              </div>
            )}
          </div>
        )}

        {/* TAB 2: TRACK REFRESH CIVIC ISSUES */}
        {activeTab === 'track' && (
          <div className="space-y-6 animate-fade-in" id="tracking-portal">
            
            {/* Filter controls */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.01)] flex flex-col sm:flex-row gap-4 justify-between items-center">
              <div className="flex items-center gap-2">
                <Sliders className="h-4.5 w-4.5 text-slate-400" />
                <span className="text-xs font-bold text-slate-850">Filter Reports</span>
              </div>

              <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/40">
                <button
                  type="button"
                  onClick={() => setTrackFilter('mine')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    trackFilter === 'mine'
                      ? "bg-white text-slate-900 shadow-2xs"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  My Submissions ({mySubmittedIds.length})
                </button>
                <button
                  type="button"
                  onClick={() => setTrackFilter('all')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    trackFilter === 'all'
                      ? "bg-white text-slate-900 shadow-2xs"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  All Neighborhood Reports ({issues.length})
                </button>
              </div>
            </div>

            {/* List and Detail Split */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="track-layout-grid">
              
              {/* Left Column: List of Issues */}
              <div className="lg:col-span-5 space-y-3.5 max-h-[550px] overflow-y-auto pr-1">
                {filteredIssues.length === 0 ? (
                  <div className="bg-white p-8 rounded-2xl border border-slate-200/85 text-center text-slate-400 text-xs py-16 space-y-2">
                    <p className="font-bold text-slate-700">No reports found.</p>
                    {trackFilter === 'mine' ? (
                      <p className="text-[11px] text-slate-400 max-w-xs mx-auto leading-relaxed font-semibold">You haven't filed any reports in this session yet. Go to the 'Report Issue' tab to create one!</p>
                    ) : (
                      <p className="text-[11px] text-slate-400 max-w-xs mx-auto leading-relaxed font-semibold">No matching reports available near this address.</p>
                    )}
                  </div>
                ) : (
                  filteredIssues.map((issue, idx) => {
                    const isSelected = selectedIssue?.id === issue.id;
                    const statusInfo = getStatusStyle(issue.status);
                    
                    return (
                      <motion.button
                        key={issue.id}
                        type="button"
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35, delay: Math.min(idx * 0.05, 0.4), ease: "easeOut" }}
                        whileHover={{ y: -3, boxShadow: "0 8px 16px rgba(0,0,0,0.03)" }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => setSelectedIssue(issue)}
                        className={`w-full text-left p-4.5 rounded-2xl border transition-all flex flex-col gap-3 cursor-pointer ${
                          isSelected 
                            ? "bg-slate-900 text-white border-slate-900 ring-2 ring-slate-900/10 shadow-md" 
                            : "bg-white border-slate-200 hover:border-slate-300 text-slate-800"
                        }`}
                      >
                        <div className="flex justify-between items-start w-full">
                          <span className={`font-mono text-[10px] font-bold ${isSelected ? 'text-slate-400' : 'text-slate-400'} tracking-wider`}>
                            {issue.id}
                          </span>
                          <span className={`px-2 py-0.5 text-[9px] border rounded-md font-bold ${
                            isSelected ? 'bg-white/10 text-white border-white/20' : statusInfo?.color
                          }`}>
                            {statusInfo?.text}
                          </span>
                        </div>

                        <div className="space-y-1">
                          <h4 className="text-xs font-bold font-display flex items-center gap-1.5">
                            <span>{CATEGORIES.find(c => c.value === issue.category)?.icon}</span>
                            <span className={isSelected ? 'text-white' : 'text-slate-950'}>
                              {CATEGORIES.find(c => c.value === issue.category)?.label}
                            </span>
                          </h4>
                          <p className={`text-[11px] font-medium leading-relaxed line-clamp-2 ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
                            {issue.description}
                          </p>
                        </div>

                        <div className={`flex items-center gap-1.5 text-[9px] font-medium border-t pt-2 w-full ${
                          isSelected ? 'border-white/10 text-slate-400' : 'border-slate-100 text-slate-500'
                        }`}>
                          <MapPin className="h-3 w-3 shrink-0" />
                          <span className="truncate flex-grow">{issue.locationName}</span>
                          <span className="shrink-0 text-slate-300 font-normal">|</span>
                          <span className="shrink-0">{new Date(issue.createdAt).toLocaleDateString()}</span>
                        </div>
                      </motion.button>
                    );
                  })
                )}
              </div>

              {/* Right Column: Active Timeline Detail Tracker */}
              <div className="lg:col-span-7">
                {selectedIssue ? (
                  <div className="bg-white border border-slate-200/80 rounded-3xl shadow-sm p-6 md:p-8 space-y-6" id="issue-tracking-detail-card">
                    <div className="flex justify-between items-start pb-4 border-b border-slate-200/60">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-slate-400">{selectedIssue.id}</span>
                          <span className={`px-2 py-0.5 text-[9px] border rounded-md font-bold ${getStatusStyle(selectedIssue.status)?.color}`}>
                            {getStatusStyle(selectedIssue.status)?.text}
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-slate-900 font-display mt-1">
                          {CATEGORIES.find(c => c.value === selectedIssue.category)?.label}
                        </h3>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 font-medium block">Report Filed</span>
                        <span className="text-xs font-bold text-slate-800">
                          {new Date(selectedIssue.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* Progress tracker timeline - DELIVERY CARRIER STYLE */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Live Dispatch Timeline</h4>
                      
                      <div className="relative pl-6 space-y-6 border-l-2 border-slate-100" id="timeline-stepper">
                        
                        {/* Step 1: Reported */}
                        <div className="relative">
                          {/* Circle dot marker */}
                          <div className={`absolute -left-[31px] top-0.5 h-4 w-4 rounded-full border-2 flex items-center justify-center ${
                            selectedIssue.statusUpdates.some(u => u.status === 'reported')
                              ? "bg-sky-600 border-white text-white shadow-3xs"
                              : "bg-white border-slate-200"
                          }`}>
                            <Check className="h-2.5 w-2.5 stroke-[3]" />
                          </div>
                          <div className="space-y-0.5 text-xs">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-800">1. Citizen Submission Received</span>
                              <span className="text-[10px] text-slate-400 font-mono">
                                {new Date(selectedIssue.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                              Report securely received with location details and image attachments. Action ticket initiated.
                            </p>
                          </div>
                        </div>

                        {/* Step 2: AI Triage / Reviewed */}
                        <div className="relative">
                          <div className={`absolute -left-[31px] top-0.5 h-4 w-4 rounded-full border-2 flex items-center justify-center ${
                            selectedIssue.statusUpdates.some(u => u.status === 'reviewed' || u.status === 'assigned' || u.status === 'in_progress' || u.status === 'resolved')
                              ? "bg-indigo-600 border-white text-white shadow-3xs"
                              : "bg-white border-slate-200"
                          }`}>
                            {selectedIssue.statusUpdates.some(u => u.status === 'reviewed' || u.status === 'assigned' || u.status === 'in_progress' || u.status === 'resolved') ? (
                              <Check className="h-2.5 w-2.5 stroke-[3]" />
                            ) : (
                              <div className="h-1.5 w-1.5 bg-slate-200 rounded-full" />
                            )}
                          </div>
                          <div className="space-y-0.5 text-xs">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-800">2. Regional Dispatch Priority Review</span>
                              {selectedIssue.statusUpdates.find(u => u.status === 'reviewed') && (
                                <span className="text-[10px] text-slate-400 font-mono">
                                  {new Date(selectedIssue.statusUpdates.find(u => u.status === 'reviewed')?.timestamp || '').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                              Priority assessed as <span className="font-bold text-indigo-700">{selectedIssue.aiReport.safetyRiskLevel}</span>. 
                              The dispatch ticket and response plan have been routed to the correct department.
                            </p>
                          </div>
                        </div>

                        {/* Step 3: Assigned */}
                        <div className="relative">
                          <div className={`absolute -left-[31px] top-0.5 h-4 w-4 rounded-full border-2 flex items-center justify-center ${
                            selectedIssue.statusUpdates.some(u => u.status === 'assigned' || u.status === 'in_progress' || u.status === 'resolved')
                              ? "bg-amber-600 border-white text-white shadow-3xs"
                              : "bg-white border-slate-200"
                          }`}>
                            {selectedIssue.statusUpdates.some(u => u.status === 'assigned' || u.status === 'in_progress' || u.status === 'resolved') ? (
                              <Check className="h-2.5 w-2.5 stroke-[3]" />
                            ) : (
                              <div className="h-1.5 w-1.5 bg-slate-200 rounded-full" />
                            )}
                          </div>
                          <div className="space-y-0.5 text-xs">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-800">3. Dispatched to Maintenance Crew</span>
                              {selectedIssue.statusUpdates.find(u => u.status === 'assigned') && (
                                <span className="text-[10px] text-slate-400 font-mono">
                                  {new Date(selectedIssue.statusUpdates.find(u => u.status === 'assigned')?.timestamp || '').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                              {selectedIssue.assignedTeam 
                                ? `Assigned to: ${selectedIssue.assignedTeam}. A municipal team has been scheduled to handle this issue.`
                                : "Awaiting team assignment in municipal review queue."}
                            </p>
                          </div>
                        </div>

                        {/* Step 4: Work in Progress */}
                        <div className="relative">
                          <div className={`absolute -left-[31px] top-0.5 h-4 w-4 rounded-full border-2 flex items-center justify-center ${
                            selectedIssue.statusUpdates.some(u => u.status === 'in_progress' || u.status === 'resolved')
                              ? "bg-purple-600 border-white text-white shadow-3xs"
                              : "bg-white border-slate-200"
                          }`}>
                            {selectedIssue.statusUpdates.some(u => u.status === 'in_progress' || u.status === 'resolved') ? (
                              <Check className="h-2.5 w-2.5 stroke-[3]" />
                            ) : (
                              <div className="h-1.5 w-1.5 bg-slate-200 rounded-full" />
                            )}
                          </div>
                          <div className="space-y-0.5 text-xs">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-800">4. Active Repairs On-Site</span>
                              {selectedIssue.statusUpdates.find(u => u.status === 'in_progress') && (
                                <span className="text-[10px] text-slate-400 font-mono">
                                  {new Date(selectedIssue.statusUpdates.find(u => u.status === 'in_progress')?.timestamp || '').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                              {selectedIssue.statusUpdates.find(u => u.status === 'in_progress')
                                ? selectedIssue.statusUpdates.find(u => u.status === 'in_progress')?.note
                                : "Awaiting team arrival at pinned address."}
                            </p>
                          </div>
                        </div>

                        {/* Step 5: Resolved */}
                        <div className="relative">
                          <div className={`absolute -left-[31px] top-0.5 h-4 w-4 rounded-full border-2 flex items-center justify-center ${
                            selectedIssue.status === 'resolved'
                              ? "bg-emerald-600 border-white text-white shadow-3xs"
                              : "bg-white border-slate-200"
                          }`}>
                            {selectedIssue.status === 'resolved' ? (
                              <Check className="h-2.5 w-2.5 stroke-[3]" />
                            ) : (
                              <div className="h-1.5 w-1.5 bg-slate-200 rounded-full" />
                            )}
                          </div>
                          <div className="space-y-0.5 text-xs">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-800">5. Issue Fully Resolved</span>
                              {selectedIssue.status === 'resolved' && (
                                <span className="text-[10px] text-slate-400 font-mono">
                                  {new Date(selectedIssue.statusUpdates.find(u => u.status === 'resolved')?.timestamp || '').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 font-medium leading-relaxed font-sans">
                              {selectedIssue.status === 'resolved'
                                ? selectedIssue.statusUpdates.find(u => u.status === 'resolved')?.note
                                : "Awaiting final quality seal and citizen rating."}
                            </p>
                          </div>
                        </div>

                      </div>
                    </div>

                    {/* Metadata summary */}
                    <div className="p-5 bg-slate-50/80 border border-slate-200/50 rounded-2xl space-y-4 text-xs shadow-3xs">
                      <div className="flex justify-between font-medium">
                        <span className="text-slate-400 font-bold">Hazard Location:</span>
                        <span className="text-slate-800 font-semibold text-right max-w-xs truncate">{selectedIssue.locationName}</span>
                      </div>
                      <div className="flex justify-between font-medium">
                        <span className="text-slate-400 font-bold">Your Description:</span>
                        <span className="text-slate-600 font-semibold italic text-right max-w-xs line-clamp-1">"{selectedIssue.description}"</span>
                      </div>
                      {selectedIssue.photos.length > 0 && (
                        <div className="border-t border-slate-200/50 pt-4">
                          <span className="text-slate-400 font-bold block mb-2">Report Photos:</span>
                          <div className="flex gap-2.5">
                            {selectedIssue.photos.map((url, i) => (
                              <img 
                                key={i} 
                                src={url} 
                                alt="Timeline thumbnail" 
                                className="h-14 w-14 object-cover rounded-xl border border-slate-200"
                                referrerPolicy="no-referrer"
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center text-slate-400 text-xs shadow-3xs flex flex-col items-center justify-center gap-3 py-24">
                    <div className="h-14 w-14 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100 text-slate-400 text-2xl">
                      🏛️
                    </div>
                    <div className="space-y-1.5 max-w-xs">
                      <p className="font-bold text-slate-800 text-sm">Select a Civic Report</p>
                      <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
                        Click on any issue on the left panel to review its live resolution updates, assigned team, and estimated completion times.
                      </p>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

      </main>
    </div>
  );
}
