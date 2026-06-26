/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CivicIssue } from '../types';

export const INITIAL_MOCK_ISSUES: CivicIssue[] = [
  {
    id: "CH-8492",
    category: "exposed wiring",
    description: "Metal electrical junction box on the utility pole near the school crosswalk is broken open. There are exposed heavy copper wires hanging down at around 5 feet height. Children are running around. Very dangerous, especially when it rains.",
    locationName: "102 Oak Street (Opposite Oakridge Elementary)",
    locationCoords: { lat: 37.7749, lng: -122.4194 },
    photos: [
      "https://images.unsplash.com/photo-1544724569-5f546fd6f2b5?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1621905252507-b354bc25edac?auto=format&fit=crop&q=80&w=600"
    ],
    createdAt: "2026-06-24T06:15:00-07:00",
    status: "reported",
    statusUpdates: [
      {
        status: "reported",
        timestamp: "2026-06-24T06:15:00-07:00",
        note: "Issue reported by citizen. AI Triage flagged as CRITICAL safety risk."
      }
    ],
    citizenName: "Sarah Jenkins",
    citizenPhone: "555-0192",
    aiReport: {
      executiveSummary: "Exposed live high-voltage cables hanging at head-height near an elementary school crosswalk, creating an imminent electrocution hazard.",
      technicalDescription: "Failed lock mechanism on a pole-mounted secondary distribution box. Exposed conductor copper cores visible. Immediate grid de-energization and enclosure replacement required.",
      safetyRiskLevel: "Critical",
      urgencyScore: 98,
      duplicateRisk: "None",
      fakeWarning: false,
      estimatedCostRange: "$250 - $400",
      recommendedActionPlan: [
        "Coordinate with Grid Operator to isolate power on Grid Segment 14-B.",
        "Dispatch emergency electrical technician with hazard-marking tape.",
        "Install secure, tamper-proof weatherbox seal."
      ]
    }
  },
  {
    id: "CH-8420",
    category: "water leakage",
    description: "Water is bubbling up aggressively from under the asphalt on the corner of 4th Avenue and Pine street. The sidewalk is completely flooded and cars are splashing a lot of water. Looks like a major water main crack.",
    locationName: "Corner of 4th Ave & Pine St",
    locationCoords: { lat: 37.7833, lng: -122.4167 },
    photos: [
      "https://images.unsplash.com/photo-1542013936693-8848e574047e?auto=format&fit=crop&q=80&w=600"
    ],
    createdAt: "2026-06-23T14:30:00-07:00",
    status: "assigned",
    assignedTeam: "Water Utility Crew Alpha",
    statusUpdates: [
      {
        status: "reported",
        timestamp: "2026-06-23T14:30:00-07:00",
        note: "Report received."
      },
      {
        status: "reviewed",
        timestamp: "2026-06-23T16:00:00-07:00",
        note: "AI report verified. Severity approved as High. Water main break likely."
      },
      {
        status: "assigned",
        timestamp: "2026-06-23T17:15:00-07:00",
        note: "Assigned to Water Utility Crew Alpha. Slated for repair tomorrow morning."
      }
    ],
    citizenName: "David Chen",
    citizenPhone: "555-0143",
    aiReport: {
      executiveSummary: "Sub-surface pipeline burst causing pressurized clean water to erode the subgrade and flood the public roadway.",
      technicalDescription: "Indications of a fractured 6-inch ductile iron water main. Risk of subsurface sinkhole formation if left unchecked.",
      safetyRiskLevel: "High",
      urgencyScore: 82,
      duplicateRisk: "None",
      fakeWarning: false,
      estimatedCostRange: "$1,200 - $2,500",
      recommendedActionPlan: [
        "Locate main bypass valve and throttle supply to reduce pressure while maintaining minimum fire flow.",
        "Excavate the affected roadbed section.",
        "Clamp or replace the fractured pipe segment and backfill with compacted crushed rock."
      ]
    }
  },
  {
    id: "CH-8104",
    category: "potholes",
    description: "Extremely deep pothole in the left lane of the express bypass. Multiple cars are braking hard or violently swerving to avoid it. Already saw two vehicles with flat tires parked on the shoulder.",
    locationName: "Bypass Westbound, Mile Marker 12.4",
    locationCoords: { lat: 37.7699, lng: -122.4468 },
    photos: [
      "https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&q=80&w=600"
    ],
    createdAt: "2026-06-24T05:00:00-07:00",
    status: "in_progress",
    assignedTeam: "Road Patching Squad 2",
    statusUpdates: [
      {
        status: "reported",
        timestamp: "2026-06-24T05:00:00-07:00",
        note: "Reported via citizen app."
      },
      {
        status: "reviewed",
        timestamp: "2026-06-24T06:00:00-07:00",
        note: "AI Report validated. Urgency confirmed high due to highway speeds."
      },
      {
        status: "assigned",
        timestamp: "2026-06-24T06:30:00-07:00",
        note: "Assigned to Road Patching Squad 2 with high priority."
      },
      {
        status: "in_progress",
        timestamp: "2026-06-24T07:30:00-07:00",
        note: "Squad 2 is on site. Setting up dynamic traffic control arrows."
      }
    ],
    citizenName: "Marcus Brody",
    citizenPhone: "555-0177",
    aiReport: {
      executiveSummary: "Severe road fatigue creating a deep 8-inch pothole with sharp aggregate borders on a high-speed arterial roadway.",
      technicalDescription: "Localized binder course failure triggered by thermal cycles and heavy wheel loading. Creates immediate tire blowout and loss-of-control risks.",
      safetyRiskLevel: "High",
      urgencyScore: 89,
      duplicateRisk: "Low",
      fakeWarning: false,
      estimatedCostRange: "$300 - $500",
      recommendedActionPlan: [
        "Deploy a flashing arrow board trailer to close the left lane.",
        "Clean out water, loose stone, and soil from the pothole.",
        "Apply a high-performance polymer-modified hot asphalt mix, then compact with a mechanical vibrator."
      ]
    }
  },
  {
    id: "CH-8031",
    category: "broken streetlights",
    description: "Flickering street light on Elm Street, right outside number 54. It flickers bright and then goes completely pitch black for long stretches. This block is already very dark, and it makes walking home from the bus stop feel unsafe.",
    locationName: "54 Elm Street",
    locationCoords: { lat: 37.7599, lng: -122.4368 },
    photos: [],
    createdAt: "2026-06-22T21:40:00-07:00",
    status: "resolved",
    assignedTeam: "Municipal Lighting Crew 1",
    statusUpdates: [
      {
        status: "reported",
        timestamp: "2026-06-22T21:40:00-07:00",
        note: "Report submitted."
      },
      {
        status: "reviewed",
        timestamp: "2026-06-23T09:00:00-07:00",
        note: "Triage completed. Rated Medium urgency."
      },
      {
        status: "assigned",
        timestamp: "2026-06-23T11:00:00-07:00",
        note: "Assigned to Municipal Lighting Crew 1."
      },
      {
        status: "in_progress",
        timestamp: "2026-06-23T14:00:00-07:00",
        note: "Crew 1 replacing light ballast."
      },
      {
        status: "resolved",
        timestamp: "2026-06-23T15:30:00-07:00",
        note: "Ballast replaced and upgraded to 80W high-efficiency LED fixture. Streetlight verified fully operational."
      }
    ],
    citizenName: "Emily Watson",
    citizenPhone: "555-0112",
    aiReport: {
      executiveSummary: "Intermittent lighting outage due to a failing magnetic ballast in an aging metal halide streetlight fixture.",
      technicalDescription: "End-of-life ballast thermal cycling causing thermal shutdown, followed by automatic cooling re-strikes. Low visibility safety impact.",
      safetyRiskLevel: "Medium",
      urgencyScore: 48,
      duplicateRisk: "High",
      duplicateOfId: "CH-7998",
      fakeWarning: false,
      estimatedCostRange: "$150 - $220",
      recommendedActionPlan: [
        "De-energize circuit feed to pole #M-4420.",
        "Uninstall old core-and-coil ballast.",
        "Retrofit with a modern solid-state driver and high-lumen LED lamp assembly."
      ]
    }
  },
  {
    id: "CH-7911",
    category: "open drains",
    description: "Stormwater catch basin cover is completely missing on the curb of 12th Street. It leaves an enormous, deep concrete pit wide open right where people step off the sidewalk. Someone could break a leg easily.",
    locationName: "1420 12th Street",
    locationCoords: { lat: 37.7499, lng: -122.4268 },
    photos: [
      "https://images.unsplash.com/photo-1508873696983-2df519f0397e?auto=format&fit=crop&q=80&w=600"
    ],
    createdAt: "2026-06-24T02:10:00-07:00",
    status: "reviewed",
    statusUpdates: [
      {
        status: "reported",
        timestamp: "2026-06-24T02:10:00-07:00",
        note: "Report submitted."
      },
      {
        status: "reviewed",
        timestamp: "2026-06-24T07:00:00-07:00",
        note: "AI report verified. Critical grade hazard due to pedestrian collision/fall danger. Standard grid size matches Warehouse Box A."
      }
    ],
    citizenName: "Robert Lopez",
    citizenPhone: "555-0181",
    aiReport: {
      executiveSummary: "Missing storm drain heavy cast-iron grate, leaving a 4-foot deep shear drop-off directly adjacent to a pedestrian pathway.",
      technicalDescription: "Missing or stolen 24x24 inch heavy-duty storm sewer grate. Extreme pedestrian hazard, especially in low light conditions.",
      safetyRiskLevel: "Critical",
      urgencyScore: 92,
      duplicateRisk: "None",
      fakeWarning: false,
      estimatedCostRange: "$180 - $300",
      recommendedActionPlan: [
        "Place high-visibility safety barrier or emergency safety cone over the void.",
        "Measure catch basin collar dimensions for secure seating.",
        "Install a replacement hinged, lockable ductile iron pedestrian-safe grate."
      ]
    }
  },
  {
    id: "CH-5512",
    category: "potholes",
    description: "Broken road surface",
    locationName: "Maple Lane near mailbox",
    locationCoords: { lat: 37.7400, lng: -122.4200 },
    photos: [],
    createdAt: "2026-06-24T06:45:00-07:00",
    status: "reported",
    statusUpdates: [
      {
        status: "reported",
        timestamp: "2026-06-24T06:45:00-07:00",
        note: "Report submitted."
      }
    ],
    citizenName: "Anonymous Citizen",
    aiReport: {
      executiveSummary: "Slight asphalt crumbling on low-volume residential road. Report has very low descriptive detail.",
      technicalDescription: "Surface raveling with minimal depth. No significant structure failures noted. Non-critical.",
      safetyRiskLevel: "Low",
      urgencyScore: 18,
      duplicateRisk: "None",
      fakeWarning: true,
      fakeWarningDetails: "Weak report warning: Insufficient description text ('Broken road surface') and no photos provided. Quality score is extremely low. Recommend requesting user verification or merging with routine street sweeping checks.",
      estimatedCostRange: "$50 - $100",
      recommendedActionPlan: [
        "Schedule standard drive-by visual verification.",
        "Apply cold patch mix during next routine area sweep."
      ]
    }
  }
];

const LOCAL_STORAGE_KEY = "COMMUNITY_HERO_ISSUES";

export function getIssues(): CivicIssue[] {
  if (typeof window === "undefined") return INITIAL_MOCK_ISSUES;
  const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_MOCK_ISSUES));
    return INITIAL_MOCK_ISSUES;
  }
  try {
    return JSON.parse(stored);
  } catch (e) {
    console.error("Error reading issues from localStorage", e);
    return INITIAL_MOCK_ISSUES;
  }
}

export function saveIssues(issues: CivicIssue[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(issues));
}

export function addIssue(issue: CivicIssue): void {
  const current = getIssues();
  saveIssues([issue, ...current]);
}

export function updateIssue(id: string, updates: Partial<CivicIssue>): CivicIssue | null {
  const current = getIssues();
  let updatedIssue: CivicIssue | null = null;
  const nextIssues = current.map(issue => {
    if (issue.id === id) {
      updatedIssue = { ...issue, ...updates };
      return updatedIssue;
    }
    return issue;
  });
  saveIssues(nextIssues);
  return updatedIssue;
}

export function resetMockData(): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_MOCK_ISSUES));
}
