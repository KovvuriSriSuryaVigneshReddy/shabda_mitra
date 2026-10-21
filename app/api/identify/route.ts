import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface IdentificationResponse {
  englishName: string;
  hindiName: string;
  descriptionEn: string;
  descriptionHi: string;
}

export async function POST(request: NextRequest) {
  try {
    const { imageBase64 } = await request.json();

    if (!imageBase64) {
      return NextResponse.json(
        { error: "No image provided" },
        { status: 400 }
      );
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: "API key not configured" },
        { status: 500 }
      );
    }

    const response = await client.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1024,
      system: `You are an expert object identification assistant. Analyze the image and identify the primary object in view.
Return your response as valid JSON with exactly these fields:
- englishName: The name of the object in English (just the name, no description)
- hindiName: The name of the object in Hindi using Devanagari script
- descriptionEn: A single sentence description in English
- descriptionHi: A single sentence description in Hindi

Respond with ONLY the JSON object, no additional text or markdown.`,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: "image/jpeg",
                data: imageBase64,
              },
            },
            {
              type: "text",
              text: "Identify the primary object in this image and provide the response in the specified JSON format.",
            },
          ],
        },
      ],
    });

    const content = response.content[0];
    if (content.type !== "text") {
      throw new Error("Unexpected response type from Claude");
    }

    const result: IdentificationResponse = JSON.parse(content.text);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error identifying object:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to identify object",
      },
      { status: 500 }
    );
  }
}
