import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

@Injectable()
export class AiService {
  private openai: OpenAI;
  private model: string;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('NVIDIA_API_KEY');
    this.model = this.configService.get<string>('NVIDIA_MODEL') || 'meta/llama-3.1-70b-instruct';
    
    console.log(`[AiService] Initializing NVIDIA API with model: ${this.model}`);

    this.openai = new OpenAI({
      apiKey: apiKey || '',
      baseURL: 'https://integrate.api.nvidia.com/v1',
    });
  }

  async generateContent(prompt: string, retries = 5, delay = 5000): Promise<string> {
    for (let i = 0; i < retries; i++) {
      try {
        console.log(`[AiService] Sending request to NVIDIA API (Attempt ${i + 1}/${retries})...`);
        const completion = await this.openai.chat.completions.create({
          model: this.model,
          messages: [{ role: "user", content: prompt }],
          temperature: 0.2, // Low temperature for consistent logic
          max_tokens: 4000,
        }, { timeout: 60000 }); // Force a 60-second timeout!
        
        console.log(`[AiService] Successfully received response from NVIDIA API.`);
        return completion.choices[0]?.message?.content || '';
      } catch (error: any) {
        // If it's a 503 (High Demand) or 429 (Rate Limit), retry with backoff
        if ((error.status === 503 || error.status === 429) && i < retries - 1) {
          console.warn(`[AiService] NVIDIA API is busy. Retrying in ${delay / 1000}s... (Attempt ${i + 1}/${retries})`);
          await new Promise(res => setTimeout(res, delay));
          delay *= 1.5; // Exponential backoff: 5s → 7.5s → 11s → 17s → ...
          continue;
        }
        console.error('[AiService] Error generating content:', error);
        throw error;
      }
    }
    throw new Error('AI Service unavailable after multiple retries.');
  }

  async generateJson<T>(prompt: string): Promise<T> {
    const jsonPrompt = `${prompt}\n\nIMPORTANT: Return ONLY a valid JSON array or object. No markdown formatting, no triple backticks, no conversational text. START IMMEDIATELY WITH [ OR {`;
    const text = await this.generateContent(jsonPrompt);
    try {
      // Cleanup common AI garbage output
      const cleanJson = text.replace(/```json/gi, '').replace(/```/g, '').trim();
      return JSON.parse(cleanJson);
    } catch (error) {
      console.error('[AiService] Error parsing JSON response:', text);
      throw new Error('AI response was not a valid JSON.');
    }
  }
}