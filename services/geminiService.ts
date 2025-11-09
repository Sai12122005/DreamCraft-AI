import { GoogleGenAI, Type, Part } from "@google/genai";
import { GeneratedApp } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateApp = async (
    prompt: string,
    frontend: string,
    backend: string,
    database: string,
    file: { mimeType: string, data: string } | null,
): Promise<GeneratedApp> => {
    console.log("Generating app with prompt:", { prompt, frontend, backend, database, file: !!file });

    const getStackPrompt = () => {
        if (frontend === 'React') return 'Generate a single, self-contained "index.html" file. This file MUST use React and ReactDOM from CDN links in a <script> tag. All JavaScript code, including React components, MUST be within a single <script type="text/babel"> block. Use the Babel Standalone CDN to transpile JSX in the browser. The application should be a simple "Hello World" or a basic version of the user\'s prompt that is renderable in this single file.';
        if (frontend === 'React Native') return 'Generate a sample component for a React Native application named App.js. Include a basic explanation of how to run it.';
        if (frontend === 'HTML/CSS/JS') return 'Generate a single, self-contained "index.html" file for a simple to-do list application, including all necessary HTML, CSS, and JavaScript within that one file.';
        if (backend === 'Java (Spring Boot)') return 'Generate the structure for a minimal Spring Boot REST API with a "Hello World" endpoint. Include a pom.xml and a main application file.';
        if (backend === 'Python (Flask)') return 'Generate a minimal Python Flask "Hello World" application in a single app.py file. Include a requirements.txt file.';
        return `Tech Stack: Frontend - ${frontend}, Backend - ${backend}, Database - ${database}.`;
    };

    const coreInstruction = `
        You are an expert full-stack software architect. Your task is to generate a complete, runnable, and well-structured application based on the user's request.
        
        **User Idea:** "${prompt}"

        **Instructions:**
        1.  **Analyze the Request:** Understand the core features the user wants.
        2.  **Select Technology:** Use the specified technology stack to generate the code.
        3.  **Generate Files:** Create a complete set of files required for the application to run.
        4.  **CRITICAL - Create an Entrypoint:** You MUST generate a primary 'index.html' file. This file should be the main entry point for the application preview. If the project is a backend API, the 'index.html' should provide a simple API documentation or a "Welcome" message. The app preview will fail without it.
        5.  **Be Complete:** Ensure all code is complete and functional. Do not use placeholder comments like "// your code here".
        6.  **Provide Explanations:** For each file, provide a clear and concise explanation of its purpose and code.
        7.  **Format Output:** Return the entire response as a single, valid JSON object that adheres to the provided schema.

        **Technology-Specific Guidance:**
        ${getStackPrompt()}
    `;


    const contents: { parts: Part[] } = { parts: [] };

    contents.parts.push({ text: coreInstruction });

    if (file) {
        contents.parts.push({
            inlineData: {
                mimeType: file.mimeType,
                data: file.data,
            },
        });
        // Prepend instruction to use the image
        contents.parts.unshift({ text: "Use the attached image as a reference or inspiration for the application's design or content." });
    }

    const response = await ai.models.generateContent({
        model: "gemini-2.5-pro",
        contents: contents,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    summary: { type: Type.STRING },
                    architecture: { type: Type.STRING },
                    folderStructure: { type: Type.STRING },
                    files: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                name: { type: Type.STRING },
                                code: { type: Type.STRING },
                                explanation: { type: Type.STRING },
                            },
                            required: ['name', 'code', 'explanation']
                        }
                    },
                    deployment: { type: Type.STRING }
                },
                required: ['summary', 'architecture', 'folderStructure', 'files', 'deployment']
            },
        }
    });

    const jsonStr = response.text.trim();
    return JSON.parse(jsonStr);
};


export const refineApp = async (
    refinementPrompt: string,
    existingApp: GeneratedApp,
): Promise<GeneratedApp> => {
    console.log("Refining app with prompt:", refinementPrompt);

    const refinementInstruction = `
        You are an expert full-stack software architect. You have already generated an application.
        The user wants to refine it with the following instruction: "${refinementPrompt}"

        Here is the code for the existing files you previously generated:
        ${JSON.stringify(existingApp.files, null, 2)}

        **Instructions:**
        1.  **Analyze the Refinement:** Understand the change the user wants.
        2.  **Apply the Change:** Modify the existing code to incorporate the user's request.
        3.  **Return ALL Files:** You MUST return the complete, updated set of all application files. Do not only return the changed files.
        4.  **Maintain Structure:** Keep the same file names and folder structure unless the request specifically asks to change them.
        5.  **Ensure 'index.html':** The 'index.html' file must remain the main entry point.
        6.  **Be Complete:** Ensure all code is complete and functional.
        7.  **Format Output:** Return the entire response as a single, valid JSON object that adheres to the provided schema.
    `;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-pro",
        contents: { parts: [{ text: refinementInstruction }] },
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    summary: { type: Type.STRING },
                    architecture: { type: Type.STRING },
                    folderStructure: { type: Type.STRING },
                    files: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                name: { type: Type.STRING },
                                code: { type: Type.STRING },
                                explanation: { type: Type.STRING },
                            },
                            required: ['name', 'code', 'explanation']
                        }
                    },
                    deployment: { type: Type.STRING }
                },
                required: ['summary', 'architecture', 'folderStructure', 'files', 'deployment']
            },
        }
    });

    const jsonStr = response.text.trim();
    return JSON.parse(jsonStr);
};