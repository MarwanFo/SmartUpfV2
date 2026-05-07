import { Injectable, BadRequestException } from '@nestjs/common';
import { GeminiService } from '../ai/gemini.service';
const pdf = require('pdf-parse');

@Injectable()
export class QcmService {
  constructor(private geminiService: GeminiService) {}

  async generateFromPdf(file: Express.Multer.File, options: { difficulty: string, count: number, language: string }) {
    try {
      // 1. Extract text from PDF
      const data = await pdf(file.buffer);
      const text = data.text;

      if (!text || text.length < 100) {
        throw new BadRequestException("Le PDF semble vide ou illisible.");
      }

      // 2. Prepare AI Prompt
      const prompt = `
        You are an expert academic examiner. 
        Based on the following course content, generate a Multiple Choice Quiz (QCM).

        COURSE CONTENT:
        ${text.substring(0, 30000)} // Limit to 30k chars for safety

        PARAMETERS:
        - Difficulty: ${options.difficulty}
        - Number of Questions: ${options.count}
        - Language: ${options.language}

        RULES:
        - Each question must have 4 options.
        - Exactly one option must be correct.
        - Provide an explanation for the correct answer.

        FORMAT: Return ONLY a JSON object:
        {
          "title": "Quiz Title",
          "questions": [
            {
              "question": "string",
              "options": ["A", "B", "C", "D"],
              "correctIndex": number (0-3),
              "explanation": "string"
            }
          ]
        }
      `;

      // 3. Generate with Gemini
      const result = await this.geminiService.generateJson<any>(prompt);
      return result;
    } catch (error) {
      console.error('[QcmService] Generation error:', error);
      throw error;
    }
  }
}
