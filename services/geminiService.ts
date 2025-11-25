import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY;

// Use 'gemini-2.5-flash-image' for both generation and editing as per instructions for "nano banana"
const MODEL_NAME = 'gemini-2.5-flash-image';

if (!apiKey) {
  console.error("API_KEY is missing from environment variables.");
}

const ai = new GoogleGenAI({ apiKey: apiKey || '' });

interface GenerateImageParams {
  prompt: string;
  imageBase64?: string;
  imageMimeType?: string;
}

export const generateOrEditImage = async ({ prompt, imageBase64, imageMimeType }: GenerateImageParams): Promise<string> => {
  try {
    const parts: any[] = [];

    // If we have an image, add it first (for editing)
    if (imageBase64 && imageMimeType) {
      parts.push({
        inlineData: {
          data: imageBase64,
          mimeType: imageMimeType,
        },
      });
    }

    // Add the text prompt
    parts.push({
      text: prompt,
    });

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: parts,
      },
    });

    // Iterate through parts to find the image
    const content = response.candidates?.[0]?.content;
    if (!content || !content.parts) {
      throw new Error("No content generated");
    }

    let generatedImageUrl = '';

    for (const part of content.parts) {
      if (part.inlineData && part.inlineData.data) {
        const mimeType = part.inlineData.mimeType || 'image/png';
        generatedImageUrl = `data:${mimeType};base64,${part.inlineData.data}`;
        break; // Found the image, stop looking
      }
    }

    if (!generatedImageUrl) {
      // Sometimes it might return text if it refuses or explains something
      const textPart = content.parts.find(p => p.text);
      if (textPart) {
        throw new Error(textPart.text || "Model returned text instead of an image.");
      }
      throw new Error("No image data found in response");
    }

    return generatedImageUrl;

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error(error.message || "Failed to generate image");
  }
};