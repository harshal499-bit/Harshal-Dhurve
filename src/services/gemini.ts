import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function generateMemeCaptions(base64Image: string, mimeType: string): Promise<string[]> {
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image.split(",")[1] || base64Image,
              mimeType: mimeType,
            },
          },
          {
            text: "Analyze this image and suggest 5 funny, witty, or sarcastic meme captions. The captions should be short and suitable for a meme format. Return the result as a JSON array of strings.",
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING,
          },
        },
      },
    });

    const text = response.text;
    if (!text) return [];
    return JSON.parse(text);
  } catch (error) {
    console.error("Error generating captions:", error);
    return [
      "When the AI fails to generate a caption",
      "Error 404: Humor not found",
      "Me waiting for the API response",
      "Is this a meme yet?",
      "Just another day in the matrix"
    ];
  }
}
