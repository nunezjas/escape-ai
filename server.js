import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (!process.env.GEMINI_API_KEY) {
  console.error("GEMINI_API_KEY is missing from the .env file.");
  process.exit(1);
}

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const allowedActions = [
  "inspectBookshelf",
  "pullRedBook",
  "collectSilverKey",
  "inspectDesk",
  "openJournal",
  "discoverSecretPassage",
  "enterSecondRoom",
  "inspectLaboratory",
  "inspectWorkbench",
  "collectBlueVial",
  "inspectPedestal",
  "pourBlueVial",
  "readSymbols",
  "speakMoonlight",
  "escapeLaboratory",
  "askForHint",
  "checkInventory",
  "unknown",
];

app.get("/api/status", (request, response) => {
  response.json({
    online: true,
    aiEnabled: true,
  });
});

app.post("/api/interpret", async (request, response) => {
  try {
    const { command, currentRoom, gameState } = request.body;

    if (typeof command !== "string" || !command.trim()) {
      return response.status(400).json({
        error: "A command is required.",
      });
    }

    const prompt = `
You are the intent interpreter for a fantasy escape-room game.

Convert the player's message into exactly one available game action.

Current room: ${currentRoom}

Current game state:
${JSON.stringify(gameState, null, 2)}

Available actions:

ROOM 1
- inspectBookshelf: inspect, search, examine, or look around the library or bookshelf
- pullRedBook: pull, move, remove, touch, or interact with the red book
- collectSilverKey: take, grab, collect, or pick up the silver key
- inspectDesk: inspect, search, examine, or look at the desk
- openJournal: open, unlock, read, or use the key on the journal
- discoverSecretPassage: push, press, move, or interact with the third green book
- enterSecondRoom: enter or walk through the passage or tunnel

ROOM 2
- inspectLaboratory: inspect, search, examine, or look around the laboratory
- inspectWorkbench: inspect, search, examine, or look at the workbench or table
- collectBlueVial: take, grab, collect, or pick up the blue vial or moonlight potion
- inspectPedestal: inspect, search, examine, or look at the pedestal, basin, stone, or altar
- pourBlueVial: pour, empty, place, or use the blue vial, potion, moonlight, liquid, or light in the pedestal, basin, stone, or altar
- readSymbols: read, inspect, translate, or examine the symbols, runes, or inscription
- speakMoonlight: say, speak, answer, whisper, or declare moonlight
- escapeLaboratory: open the exit, open the final door, leave, flee, or escape

GENERAL
- askForHint: ask for help, guidance, or a hint
- checkInventory: inspect inventory or ask what items the player has
- unknown: the message cannot reasonably correspond to an action

Interpret meaning rather than exact wording.

Examples:
"Pour the light of the moon into the sleeping stone"
means pourBlueVial.

"Empty this glowing potion into that bowl"
means pourBlueVial.

"I think the red book looks suspicious"
means pullRedBook if the player is trying to interact with it, otherwise inspectBookshelf.

"Use my key on the diary"
means openJournal.

"Walk down the dark tunnel"
means enterSecondRoom.

Player message:
${command}
`;

    const result = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL || "gemini-3.5-flash",
      contents: prompt,
      config: {
        temperature: 0,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            action: {
              type: Type.STRING,
              enum: allowedActions,
            },
            confidence: {
              type: Type.NUMBER,
            },
            explanation: {
              type: Type.STRING,
            },
          },
          required: ["action", "confidence", "explanation"],
        },
      },
    });

    const interpretation = JSON.parse(result.text);

    if (!allowedActions.includes(interpretation.action)) {
      interpretation.action = "unknown";
    }

    response.json(interpretation);
  } catch (error) {
    console.error("Gemini interpretation error:", error);

    response.status(500).json({
      error: "The AI could not interpret that command.",
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`EscapeAI is running on port ${PORT}`);
});
