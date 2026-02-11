
import { GoogleGenAI, Type } from "@google/genai";
import { Destination } from "../types";

// Always use new GoogleGenAI({ apiKey: process.env.API_KEY }) directly.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getDestinationAIOverview = async (destination: Destination, alternatives: Destination[]) => {
  const prompt = `
    Analyze the safety and sustainability of ${destination.name}, ${destination.country}.
    IMPORTANT: We use RAW real-world measurement units. Higher values are generally worse for human health and environmental stress.
    
    Current metrics: 
    - Air Quality: ${destination.metrics.airQualityAQI} AQI (0-50 Good, 51-100 Moderate, 151+ Unhealthy)
    - Water Quality: ${destination.metrics.waterPPM} PPM contaminants (<100 Excellent, 100-300 Moderate, >500 Poor)
    - Soil Quality: ${destination.metrics.soilPPM} PPM pollution
    - Noise Level: ${destination.metrics.noiseDB} dB (<50 Quiet, 50-70 Moderate, >85 Harmful)
    - Crowd Density: ${destination.metrics.crowdDensity} people per m² (<0.5 Comfortable, >2.0 Crowded)
    - Infrastructure Load: ${destination.metrics.infraLoad}% utilization

    Local Signals (Real-time community alerts):
    ${destination.localSignals.map(s => `- ${s}`).join('\n')}

    Provide an informative summary explaining what these specific numbers mean for a traveler's comfort and health. 
    Classify the safety status as one of: Recommended, Caution Advised, Risky, or Not Recommended.
    Suggest which of these alternatives might be better: ${alternatives.map(a => a.name).join(', ')}.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            risks: { 
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            signalAnalysis: { type: Type.STRING },
            recommendation: { type: Type.STRING },
            bestAlternative: { type: Type.STRING }
          },
          required: ["summary", "risks", "signalAnalysis", "recommendation", "bestAlternative"]
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini Error:", error);
    return null;
  }
};

export const getTripOptimizationInsight = async (destination: Destination, budget: number, travelers: number, duration: number) => {
  const prompt = `
    Destination: ${destination.name} (${destination.country})
    Safety Status: ${destination.status}.
    Metrics: AQI ${destination.metrics.airQualityAQI}, Noise ${destination.metrics.noiseDB}dB, Crowd Density ${destination.metrics.crowdDensity}/m².
    Parameters: ${travelers} travelers, ${duration} days, Total Budget: $${budget}
    
    Tasks:
    1. Estimate a detailed spending breakdown (Travel, Stay, Food, Transport, Activities).
    2. Provide an AI overview of what this trip will feel like given the raw environmental conditions (e.g., will it be noisy? is air health a concern?).
    3. Suggest an "Optimal Balanced Budget" for this specific trip.
    4. Categorize the experience (Budget, Standard, or Premium).
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            breakdown: {
              type: Type.OBJECT,
              properties: {
                travel: { type: Type.NUMBER },
                stay: { type: Type.NUMBER },
                food: { type: Type.NUMBER },
                transport: { type: Type.NUMBER },
                activities: { type: Type.NUMBER }
              },
              required: ["travel", "stay", "food", "transport", "activities"]
            },
            overview: { type: Type.STRING },
            balancedBudget: { type: Type.NUMBER },
            experienceTier: { type: Type.STRING, description: "Budget, Standard, or Premium" }
          },
          required: ["breakdown", "overview", "balancedBudget", "experienceTier"]
        }
      }
    });
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Optimization Error:", error);
    return null;
  }
};

export const getHonestPlaceAdvice = async (destinationName: string, destinationMetrics: any, status: string, context: string, userMessage: string) => {
  const prompt = `
    You are an AI Travel Advisor in 'EcoBalance' app. Mode: BRUTALLY HONEST.
    LOWER metrics are generally BETTER. Use real-world standards (AQI, dB, PPM).
    ${destinationName} Safety Status: ${status}.
    Metrics: ${JSON.stringify(destinationMetrics)}
    Context: ${context}
    
    User question: "${userMessage}"
    
    Explain exactly what the raw numbers mean. If AQI is 150, say the air is disgusting. If Noise is 90dB, say it's like living in a construction site.
    Answer as a practical, cynical but helpful local.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Honest AI Error:", error);
    return "I'm having trouble being honest right now.";
  }
};

export const analyzeWasteImage = async (base64Image: string) => {
  if (!base64Image) {
    return {
      weightKg: Math.random() * 5 + 1,
      qualityScore: Math.floor(Math.random() * 40) + 60,
      description: "Simulation: 3.2kg waste verified. Plastic and glass detected.",
      containsRecyclables: true
    };
  }

  const prompt = "Analyze this waste collection. Estimate the weight in kg, the segregation quality (0-100), and identify recyclables. Return JSON.";
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          { text: prompt },
          { inlineData: { mimeType: "image/jpeg", data: base64Image } }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            weightKg: { type: Type.NUMBER },
            qualityScore: { type: Type.NUMBER },
            description: { type: Type.STRING },
            containsRecyclables: { type: Type.BOOLEAN }
          },
          required: ["weightKg", "qualityScore", "description", "containsRecyclables"]
        }
      }
    });
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini Image Analysis Error:", error);
    return null;
  }
};
