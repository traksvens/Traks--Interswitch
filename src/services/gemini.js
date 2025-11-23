import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";

// Initialize Gemini
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export const analyzeSecurityReport = async (text) => {
  try {
    // 1. Use the Faster, Newer Model
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      // 2. CRITICAL: Disable Safety Filters so it can analyze "Crime" text without blocking
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
      ],
    });

    const prompt = `
      You are an AI Security Analyst for a Nigerian Safety App.
      Analyze this user report: "${text}"

      Return ONLY a JSON object with no markdown formatting.
      Fields:
      1. "incidentType": Choose strictly from ['Theft', 'Accident', 'Fire', 'Riot', 'Kidnapping', 'Traffic', 'Flooding', 'Harassment', 'Other'].
      2. "severity": Choose strictly from ['Low', 'Medium', 'High'].
      
      Rules:
      - If weapons, physical violence, or immediate danger are mentioned, severity is 'High'.
      - If it is just traffic or minor arguments, severity is 'Low'.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const textResponse = response.text();

    // Debug Log: See exactly what Gemini sent back in your console
    console.log("Gemini Raw Response:", textResponse);

    // Clean up markdown if present (```json ...)
    const cleanJson = textResponse.replace(/```json|```/g, "").trim();

    return JSON.parse(cleanJson);
  } catch (error) {
    console.error("Gemini Detailed Error:", error);
    // Fallback
    return { incidentType: "Other", severity: "Medium" };
  }
};
