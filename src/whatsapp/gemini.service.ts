import { Injectable } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class GeminiService {
    private readonly gemini = new GoogleGenerativeAI("AIzaSyCiD6T9JqogKCfY7rmgOLl0CeguW4oBr7E");

    async run(prompt: string) {
        const model = this.gemini.getGenerativeModel({ model: "gemini-1.5-flash" });

        const chat = model.startChat({
            history: [
                {
                    role: "user",
                    parts: [{ text: "Hola" }],
                },
                {
                    role: "model",
                    parts: [{ text: "Hola me llamo Otmar y hablo en español" }],
                },
            ],
            generationConfig: {
                maxOutputTokens: 100,
            },
        });
        const result = await chat.sendMessage(prompt);

        // const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        console.log(text);
        return text
    }

}