import fs from "fs";
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import * as admin from 'firebase-admin';
import firebaseConfig from "./firebase-applet-config.json";

dotenv.config();

let dbAdmin: admin.firestore.Firestore | null = null;
try {
  const serviceAccountStr = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  const dbId = firebaseConfig.firestoreDatabaseId || "(default)";
  if (serviceAccountStr) {
    admin.initializeApp({
      credential: admin.credential.cert(JSON.parse(serviceAccountStr)),
      projectId: firebaseConfig.projectId
    });
  } else {
    admin.initializeApp({ projectId: firebaseConfig.projectId });
  }
  dbAdmin = admin.firestore();
  dbAdmin.settings({ databaseId: dbId });
  console.log("Firebase Admin initialized successfully.");
} catch (e) {
  console.error("Firebase Admin initialization failed:", e);
}

const app = express();
const PORT = 3000;

app.use(express.json());

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

const FALLBACK_ENCOUNTERS = [
  {
    prompt: "저는 학교에 (____).",
    translation: "I (____) to school.",
    type: "grammar",
    cards: [
      { id: 0, text: "가요", classification: "verb", translation: "go" },
      { id: 1, text: "먹어요", classification: "verb", translation: "eat" },
      { id: 2, text: "와요", classification: "verb", translation: "come" },
      { id: 3, text: "해요", classification: "verb", translation: "do" }
    ],
    correct_answer_id: 0
  },
  {
    prompt: "내일 친구를 (____).",
    translation: "I (____) my friend tomorrow.",
    type: "verb",
    cards: [
      { id: 0, text: "만나요", classification: "verb", translation: "meet" },
      { id: 1, text: "만났어요", classification: "verb", translation: "met" },
      { id: 2, text: "만날 거예요", classification: "verb", translation: "will meet" },
      { id: 3, text: "만나고 싶어요", classification: "verb", translation: "want to meet" }
    ],
    correct_answer_id: 2
  },
  {
      prompt: "사과가 (____).",
      translation: "The apple is (____).",
      type: "adjective",
      cards: [
        { id: 0, text: "맛있어요", classification: "adjective", translation: "delicious" },
        { id: 1, text: "크요", classification: "adjective", translation: "big" },
        { id: 2, text: "박아요", classification: "adjective", translation: "small" },
        { id: 3, text: "비싸요", classification: "adjective", translation: "expensive" }
      ],
      correct_answer_id: 0
  }
];

// Serve Config
app.get("/api/config", (req, res) => {
  try {
    const rawConfig = fs.readFileSync(path.join(process.cwd(), 'src/data/config.json'), 'utf8');
    res.json(JSON.parse(rawConfig));
  } catch (error) {
    res.status(500).json({ error: "Config not found" });
  }
});

let cachedQuestions: any[] | null = null;
function shuffle(array: any[]) {
  for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
  }
}
function getQuestions() {
    if (!cachedQuestions) {
        try {
            const rawQuestions = fs.readFileSync(path.join(process.cwd(), 'src/data/questions.json'), 'utf8');
            cachedQuestions = JSON.parse(rawQuestions);
            shuffle(cachedQuestions!);
        } catch (e) {
            console.log("Could not load local questions.json, falling back to empty.");
            cachedQuestions = [];
        }
    }
    return cachedQuestions;
}

// AI Function 7: Progress Stats
app.get("/api/progress-stats", (req, res) => {
    try {
        const questions = getQuestions();
        const stats: Record<number, number> = {};
        questions.forEach((q: any) => {
            stats[q.level] = (stats[q.level] || 0) + 1;
        });
        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: "Failed to load stats" });
    }
});

// AI Function 9: All Questions
app.get("/api/all-questions", (req, res) => {
    try {
        res.json(getQuestions());
    } catch (error) {
        res.status(500).json({ error: "Failed to load questions" });
    }
});

app.post("/api/encounter", async (req, res) => {
  const { currentLevel, mode, excludeId, masteredIds, recentQuestionIds } = req.body;
  const levelDescription = currentLevel <= 2 
    ? "TOPIK I (Beginner). Focus on survival Korean, daily schedules, shopping, ordering food."
    : "TOPIK II (Intermediate/Advanced). Levels 3-6. Focus on social issues, professional/abstract topics, news, research topics.";
    
  const isVocab = mode === 'vocab';
  const targetType = isVocab ? 'vocabulary' : 'grammar';

  try {
        const localQuestions = getQuestions() || [];
        const localLevelQuestions = localQuestions.filter((q: any) => q.level === currentLevel && q.type === targetType);
        
        let dbQuestions: any[] = [];
        if (dbAdmin) {
            try {
                const snapshot = await dbAdmin.collection('cachedExercises')
                    .where('level', '==', currentLevel)
                    .where('type', '==', targetType)
                    .get();
                dbQuestions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            } catch (err) {
                console.error("Failed to fetch from db:", err);
            }
        }
        
        const allQuestionsForLevel = [...localLevelQuestions, ...dbQuestions];
        const normalizedMasteredIds = (masteredIds || []).map((id: any) => id.toString());
        
        const normalizedRecentIds = (recentQuestionIds || []).map((id: any) => id.toString());
        const unmastered = allQuestionsForLevel.filter((q: any) => 
            q.id !== excludeId && !normalizedMasteredIds.includes(q.id.toString()) && !normalizedRecentIds.includes(q.id.toString())
        );

        let selected = null;

        if (unmastered.length < 5 || dbQuestions.length < 20 || Math.random() < 0.2) {
            try {
                console.log("Low stock of unmastered questions. Generating a new one using Flash Lite...");
                const promptTopic = isVocab ? "a Korean vocabulary word" : "a Korean grammar point";
                const response = await ai.models.generateContent({
                    model: "gemini-2.5-flash",
                    contents: `Generate a TOPIK ${currentLevel} ${promptTopic} multiple-choice question.\n${levelDescription}\nReturn JSON matching the schema.`,
                    config: {
                        systemInstruction: "You are an expert TOPIK examiner. Create a single, high-quality fill-in-the-blank question. The blank must be represented exactly as '___' (three underscores). Generate 4 options (1 correct, 3 plausible distractors). Set 'correct_answer_id' to the 0-based index of the correct option.",
                        responseMimeType: "application/json",
                        responseSchema: {
                            type: Type.OBJECT,
                            properties: {
                                prompt: { type: Type.STRING },
                                translation: { type: Type.STRING },
                                cards: {
                                    type: Type.ARRAY,
                                    items: {
                                        type: Type.OBJECT,
                                        properties: {
                                            text: { type: Type.STRING },
                                            translation: { type: Type.STRING },
                                            type: { type: Type.STRING }
                                        },
                                        required: ["text", "translation", "type"]
                                    }
                                },
                                correct_answer_id: { type: Type.NUMBER }
                            },
                            required: ["prompt", "translation", "cards", "correct_answer_id"]
                        }
                    }
                });
                
                const generatedText = response.text || "{}";
                let generatedQ = JSON.parse(generatedText);
                
                generatedQ = {
                    ...generatedQ,
                    level: currentLevel,
                    type: targetType,
                    cards: generatedQ.cards.map((c: any) => ({ ...c, type: 'Option' }))
                };

                if (dbAdmin) {
                    const docRef = await dbAdmin.collection('cachedExercises').add(generatedQ);
                    generatedQ.id = docRef.id;
                    console.log(`Saved new AI-generated question to DB pool with ID: ${generatedQ.id}`);
                } else {
                    generatedQ.id = `q_ai_${Date.now()}`;
                }

                selected = generatedQ;
            } catch (err) {
                console.error("AI Generation failed, falling back to existing pool:", err);
            }
        }

        if (!selected) {
            const masteredButDifferent = allQuestionsForLevel.filter((q: any) => 
                q.id !== excludeId && normalizedMasteredIds.includes(q.id.toString())
            );
            
            if (unmastered.length > 0) {
                selected = unmastered[Math.floor(Math.random() * unmastered.length)];
            } else if (masteredButDifferent.length > 0) {
                console.log(`Level ${currentLevel} ${targetType} fully mastered. Re-introducing older content.`);
                selected = masteredButDifferent[Math.floor(Math.random() * masteredButDifferent.length)];
            } else if (allQuestionsForLevel.length > 0) {
                selected = allQuestionsForLevel[Math.floor(Math.random() * allQuestionsForLevel.length)];
            } else if (localQuestions.length > 0) {
                console.log("No questions left for this specific level/type group, picking any random question.");
                selected = localQuestions[Math.floor(Math.random() * localQuestions.length)];
            }
        }

        if (selected) {
            const result = JSON.parse(JSON.stringify(selected));
            if (!result.translation) {
                result.translation = result.prompt_en || "DECRYPT_ERROR: Translation missing.";
            }
            if (result.prompt_en && !result.translation) {
                result.translation = result.prompt_en;
            }
            if (result.cards && Array.isArray(result.cards)) {
                result.cards = result.cards.map((c: any, index: number) => ({
                    ...c,
                    id: c.id !== undefined ? c.id : index,
                    translation: c.translation || c.text_en || "DECRYPT_ERROR: Metadata missing from local node."
                }));
            }
            res.json(result);
        } else {
            res.json(FALLBACK_ENCOUNTERS[0]);
        }
    } catch (e) {
        console.error("Encounter generation error:", e);
        res.status(500).json({ error: "Failed to load encounter" });
    }
});

// AI Function 2: Answer Evaluation & Feedback
app.post("/api/evaluate", async (req, res) => {
  const { userInput, prompt, correctAnswer } = req.body;
  try {
    const isCorrect = userInput === correctAnswer;
    const result = {
        is_correct: isCorrect,
        terminal_log: isCorrect 
            ? "BYPASS_SUCCESS: Local validation confirmed syntax integrity."
            : `BYPASS_FAILED: Syntax error. Local sensors indicate expected value was "${correctAnswer}".`
    };
    res.json(result);
  } catch (error: any) {
    console.error("Error evaluating answer:", error);
    res.status(500).json({ error: "Evaluation failed" });
  }
});

// AI Function 3: Proficiency Tracking (The Level-Up)
app.post("/api/proficiency", async (req, res) => {
  const { history } = req.body; // Array of { success: boolean, difficulty: number }
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `The user is currently at TOPIK Level ${history[history.length - 1]?.difficulty || 1}. Analyze their last 10 Encounters: ${JSON.stringify(history)}. Determine if their internal proficiency rating should increase, decrease, or stay the same. Only increase if they have consistently succeeded at the current level. Only decrease if they have consistently failed at the current level.`,
      config: {
        systemInstruction: "Return a JSON object updating their current estimated TOPIK Level (1-6).",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            newLevel: { type: Type.NUMBER }
          },
          required: ["newLevel"]
        }
      },
    });

    const result = JSON.parse(response.text || "{}");
    res.json(result);
  } catch (error: any) {
    console.error("Error tracking proficiency:", error);
    res.json({ newLevel: null }); // Don't change if AI fails
  }
});

// AI Function 5: Writing Practice (TOPIK II)
app.post("/api/writing", async (req, res) => {
    const { currentLevel, topicType } = req.body;
    try {
        let promptGuide = "";
        if (topicType === 'question_51') {
            promptGuide = "Generate a TOPIK II Question 51 (Public notice, message, email, or letter) writing task. It must be a short practical text in Korean containing two blanks marked as '(ㄱ)' and '(ㄴ)'. Use formal polite form (-습니다/ㅂ니다). Return hints and sample correct phrases for each blank.";
        } else if (topicType === 'question_52') {
            promptGuide = "Generate a TOPIK II Question 52 (Expository or explanatory paragraph) writing task. It must be a short paragraph in Korean on general knowledge, custom, or science containing two blanks marked as '(ㄱ)' and '(ㄴ)'. Use plain written form (-ㄴ다/인다). Return hints and sample correct phrases for each blank.";
        } else if (topicType === 'question_53') {
            promptGuide = "Generate a TOPIK II Question 53 data analysis task. Provide a clear Korean chart title, axis labels, dynamic data values, and 2-3 additional items of info (such as 원인: reasons, 전망: outlook/prospects) in Korean. The main prompt instructs the candidate to write a descriptive essay based on the chart in 200-300 characters.";
        } else {
            promptGuide = "Generate a TOPIK II Question 54 persuasive essay task. Provide an essay topic title and 3 clear guiding bullet points in Korean. The main prompt instructs the candidate to write a structured persuasive essay in 600-700 characters.";
        }

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Generate a TOPIK II ${currentLevel > 4 ? 'Advanced' : 'Intermediate'} level writing practice task for: ${topicType}.
            Follow this directive: ${promptGuide}`,
            config: {
                systemInstruction: "You are an expert TOPIK Writing examiner. Generate highly authentic questions. Return a JSON object with: 'title' (Korean name of the task/topic), 'prompt' (the full paragraph containing '(ㄱ)' and '(ㄴ)' for Q51/Q52, or instructions for Q53/Q54), 'translation' (detailed explanation/translation in English), 'expected_features' (a list of key structures or grammar forms), and optional structured fields depending on the task type (blanks for Q51/Q52; chart_data for Q53). Ensure all strings are correctly escaped and strictly follow the schema structure.",
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING },
                        prompt: { type: Type.STRING },
                        translation: { type: Type.STRING },
                        expected_features: { type: Type.ARRAY, items: { type: Type.STRING } },
                        blanks: {
                            type: Type.OBJECT,
                            properties: {
                                ㄱ: {
                                    type: Type.OBJECT,
                                    properties: {
                                        hint: { type: Type.STRING },
                                        correct_phrases: { type: Type.ARRAY, items: { type: Type.STRING } }
                                    },
                                    required: ["hint", "correct_phrases"]
                                },
                                ㄴ: {
                                    type: Type.OBJECT,
                                    properties: {
                                        hint: { type: Type.STRING },
                                        correct_phrases: { type: Type.ARRAY, items: { type: Type.STRING } }
                                    },
                                    required: ["hint", "correct_phrases"]
                                }
                            }
                        },
                        chart_data: {
                            type: Type.OBJECT,
                            properties: {
                                chart_type: { type: Type.STRING, description: "Must be 'bar', 'line', 'pie', or 'compare_bar'" },
                                chart_title: { type: Type.STRING },
                                x_label: { type: Type.STRING },
                                y_label: { type: Type.STRING },
                                items: {
                                    type: Type.ARRAY,
                                    items: {
                                        type: Type.OBJECT,
                                        properties: {
                                            label: { type: Type.STRING },
                                            value: { type: Type.NUMBER },
                                            secondary_value: { type: Type.NUMBER }
                                        },
                                        required: ["label", "value"]
                                    }
                                },
                                additional_info: { type: Type.ARRAY, items: { type: Type.STRING } }
                            },
                            required: ["chart_type", "chart_title", "x_label", "y_label", "items"]
                        }
                    },
                    required: ["title", "prompt", "translation", "expected_features"]
                }
            }
        });
        res.json(JSON.parse(response.text || "{}"));
    } catch (error) {
        console.error("Error generating writing task:", error);
        res.status(500).json({ error: "Failed to generate writing task" });
    }
});

// AI Function 6: Writing Evaluation
app.post("/api/evaluate_writing", async (req, res) => {
    const { userInput, prompt, expectedFeatures } = req.body;
    try {
        let userText = "";
        if (typeof userInput === 'object' && userInput !== null) {
            userText = `Blank (ㄱ) Answer: "${userInput.ㄱ || ''}"\nBlank (ㄴ) Answer: "${userInput.ㄴ || ''}"`;
        } else {
            userText = userInput;
        }

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `The user wrote the following response to the prompt:\n\n[PROMPT]\n${prompt}\n\n[USER ANSWER]\n${userText}\n\nExpected features/vocabulary intended for this level: ${JSON.stringify(expectedFeatures)}`,
            config: {
                systemInstruction: "You are an expert TOPIK Writing examiner. Evaluate the text based on grammar, spelling, coherence, and use of expected features. For Question 51 and 52 (blanks ㄱ and ㄴ), each blank is worth 5 points (total 10 points), so grade accordingly and provide constructive feedback for each blank. For Question 53 and 54, grade on a standard 0-100 scale based on the content richness and grammar. Return a JSON object with: 'score' (number 0-100), 'feedback' (A specific, constructive critique in English highlighting strengths and errors), and 'corrections' (Suggested rewrites for problematic sentences).",
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        score: { type: Type.NUMBER },
                        feedback: { type: Type.STRING },
                        corrections: { type: Type.ARRAY, items: { type: Type.STRING } }
                    },
                    required: ["score", "feedback", "corrections"]
                }
            }
        });
        res.json(JSON.parse(response.text || "{}"));
    } catch (error) {
        console.error("Error evaluating writing:", error);
        res.status(500).json({ error: "Failed to evaluate writing" });
    }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
