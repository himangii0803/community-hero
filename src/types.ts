/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type IssueCategory = 'potholes' | 'open drains' | 'broken streetlights' | 'exposed wiring' | 'water leakage';

export interface LocationCoords {
  lat: number;
  lng: number;
}

export type IssueStatus = 'reported' | 'reviewed' | 'assigned' | 'in_progress' | 'resolved';

export interface StatusUpdate {
  status: IssueStatus;
  timestamp: string;
  note: string;
}

export interface AIReport {
  executiveSummary: string;
  technicalDescription: string;
  safetyRiskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  urgencyScore: number; // 1-100
  duplicateRisk: 'None' | 'Low' | 'High';
  duplicateOfId?: string;
  fakeWarning: boolean;
  fakeWarningDetails?: string;
  estimatedCostRange?: string;
  recommendedActionPlan: string[];
  safetyRisk?: string;
  suggestedDepartment?: string;
  confidenceScore?: number;
}

export interface CivicIssue {
  id: string;
  category: IssueCategory;
  description: string;
  locationName: string;
  locationCoords: LocationCoords;
  photos: string[]; // Mocked image paths or data URLs
  createdAt: string;
  status: IssueStatus;
  statusUpdates: StatusUpdate[];
  citizenName?: string;
  citizenPhone?: string;
  aiReport: AIReport;
  assignedTeam?: string;
}

export interface MunicipalityUser {
  username: string;
  role: string;
  department: string;
}
