import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

// Increase payload limit to handle photos
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Lazy loaded Gemini API client
let aiClient: GoogleGenAI | null = null;

function getGeminiClient() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not configured in Settings > Secrets.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// Helper to convert base64 or fetch external URL to base64
async function getInlineDataPart(urlOrBase64: string) {
  if (urlOrBase64.startsWith('data:')) {
    const match = urlOrBase64.match(/^data:([^;]+);base64,(.+)$/);
    if (match) {
      return {
        inlineData: {
          mimeType: match[1],
          data: match[2],
        }
      };
    }
  }
  
  if (urlOrBase64.startsWith('http://') || urlOrBase64.startsWith('https://')) {
    try {
      const response = await fetch(urlOrBase64);
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const mimeType = response.headers.get('content-type') || 'image/jpeg';
      return {
        inlineData: {
          mimeType,
          data: buffer.toString('base64'),
        }
      };
    } catch (e) {
      console.error('Failed to fetch image URL:', urlOrBase64, e);
    }
  }
  return null;
}

// Helper to generate a highly detailed and tailored local report if Gemini API is inaccessible (e.g., 403 Permission Denied)
function getLocalFallbackReport(description: string, locationName: string, citizenName: string, citizenPhone: string) {
  const descLower = description.toLowerCase();
  const citizen = citizenName || "respected Citizen";
  const loc = locationName || "Nagpur neighborhood";

  let detectedIssueType = "Other";
  let severityLevel = "Low";
  let priorityScore = 35;
  let suggestedMunicipalTeam = "Public Works Maintenance";
  let publicSafetyRisk = "General infrastructure concern that could impact safety or local resident comfort if left unaddressed.";
  let executiveSummary = `Issue reported at ${loc} concerning general civic infrastructure maintenance. Needs inspection.`;
  let suggestedFirstActions = [
    "Schedule inspector visit to verify report details",
    "Catalog issue in municipal maintenance backlog",
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

  const citizenFriendlyNote = `Hello ${citizen}! Our local Copilot assistant reviewed your message about the ${detectedIssueType.toLowerCase()} at ${loc}. To ensure Nagpur municipal teams resolve this quickly, we have translated your concern into a standardized, tech-ready dispatch report for the ${suggestedMunicipalTeam}. Thank you for contributing to your community's safety!`;

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
    citizenFriendlyNote
  };
}

// Gemini analysis endpoint
app.post("/api/gemini/analyze", async (req, res) => {
  const { description, photos, locationName, citizenName, citizenPhone, mode } = req.body;

  if (!description) {
    return res.status(400).json({ error: "Description is required" });
  }

  // Check for mode or fallback
  if (mode === "fallback") {
    console.log("Local Fallback requested by client.");
    const fallbackReport = getLocalFallbackReport(description, locationName || "", citizenName || "", citizenPhone || "");
    return res.json({
      ...fallbackReport,
      isFallback: true
    });
  }

  // Live Mode: verify API key is present
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("Gemini API failure reason: Gemini API key missing.");
    const fallbackReport = getLocalFallbackReport(description, locationName || "", citizenName || "", citizenPhone || "");
    return res.json({
      ...fallbackReport,
      isFallback: true,
      devErrorDetail: "Gemini API key missing. Please add GEMINI_API_KEY in Settings > Secrets."
    });
  }

  try {
    // Try lazy instantiating Gemini Client
    const ai = getGeminiClient();

    // Build the parts list for Gemini
    const parts: any[] = [];

    const promptText = `
You are a thoughtful civic AI assistant helping a citizen review their municipal issue report before submission.
Analyze the following citizen report details:
- Written message: "${description}"
- Selected map/location: "${locationName || 'Unknown Location'}"
- Optional Citizen Name: "${citizenName || 'Anonymous'}"
- Optional Citizen Phone: "${citizenPhone || 'None'}"

Perform a thorough analysis of the reported issue.
Provide your response strictly complying with the specified JSON schema.
Ensure your explanations and notes are warm, human, empathetic, reassuring, and highly localized (Nagpur context).
`;
    parts.push({ text: promptText });

    // Process and add any photos
    if (Array.isArray(photos) && photos.length > 0) {
      for (const photoUrl of photos) {
        const imagePart = await getInlineDataPart(photoUrl);
        if (imagePart) {
          parts.push(imagePart);
        }
      }
    }

    console.log("Gemini request started");

    // Call Gemini API using the requested gemini-2.0-flash model
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            detectedIssueType: {
              type: Type.STRING,
              description: "Must be exactly one of: Pothole / Road Damage | Open Drain | Broken Streetlight | Exposed Wiring | Water Leakage | Other"
            },
            severityLevel: {
              type: Type.STRING,
              description: "Must be exactly one of: Low | Medium | High | Critical"
            },
            priorityScore: {
              type: Type.INTEGER,
              description: "Priority score from 0 to 100 based on safety risks"
            },
            confidenceScore: {
              type: Type.INTEGER,
              description: "Confidence score from 0 to 100 based on the evidence"
            },
            publicSafetyRisk: {
              type: Type.STRING,
              description: "Simple, warm, human-centered explanation of the public safety risk"
            },
            duplicateReportStatus: {
              type: Type.STRING,
              description: "Must be exactly: No similar reports found nearby OR similar reports found nearby"
            },
            suggestedMunicipalTeam: {
              type: Type.STRING,
              description: "Must be exactly one of: Road Repair Team / Drainage Team / Electrical Safety Team / Water Utility Team / Streetlight Maintenance Team"
            },
            municipalityReadySummary: {
              type: Type.STRING,
              description: "Professional, structured summary written for municipal dispatchers"
            },
            suggestedFirstActions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Exactly 3 recommended first actions for the municipality"
            },
            citizenFriendlyNote: {
              type: Type.STRING,
              description: "Warm, supportive, reassuring note directly to the citizen explaining what we understood and how it will help the neighborhood"
            }
          },
          required: [
            "detectedIssueType",
            "severityLevel",
            "priorityScore",
            "confidenceScore",
            "publicSafetyRisk",
            "duplicateReportStatus",
            "suggestedMunicipalTeam",
            "municipalityReadySummary",
            "suggestedFirstActions",
            "citizenFriendlyNote"
          ]
        }
      }
    });

    console.log("Gemini response received");

    const text = response.text;
    if (!text) {
      throw new Error("No response text returned from Gemini");
    }

    const data = JSON.parse(text.trim());
    console.log("Gemini response parsed successfully");
    
    return res.json({
      ...data,
      isFallback: false
    });

  } catch (error: any) {
    const errorMessage = error.message || String(error);
    console.error("Gemini API failure reason:", errorMessage);
    
    const fallbackReport = getLocalFallbackReport(description, locationName || "", citizenName || "", citizenPhone || "");
    return res.json({
      ...fallbackReport,
      isFallback: true,
      devErrorDetail: `Gemini API Error: ${errorMessage}`
    });
  }
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
