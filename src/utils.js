import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Jimp } from "jimp";

dotenv.config();

const API_KEY = process.env.API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const analyzeImage = async (imageBuffer, dictOfVars) => {
  try {
    if (!imageBuffer || imageBuffer.length === 0) {
      throw new Error("Invalid or empty image buffer");
    }
    const dictOfVarsStr = JSON.stringify(dictOfVars);

    const prompt = `
      You have been given an image with some mathematical expressions, equations, or graphical problems, and you need to solve them.
      Note: Use the PEMDAS rule for solving mathematical expressions. PEMDAS stands for the Priority Order: Parentheses, Exponents, Multiplication and Division (from left to right), Addition and Subtraction (from left to right).
      You can have five types of equations/expressions in this image, and only one case shall apply each time:

      1. Simple mathematical expressions like 2 + 2, 3 * 4, etc.: In this case, solve and return the answer in the format of a list [{'expr': given expression, 'result': calculated answer}].
      2. Set of Equations like x^2 + 2x + 1 = 0, 3y + 4x = 0: In this case, solve for the given variables, returning a comma-separated list [{'expr': 'x', 'result': calculated answer, 'assign': true}].
      3. Assigning values to variables like x = 4, y = 5, z = 6: Assign values and return them in the format [{'expr': 'x', 'result': value, 'assign': true}].
      4. Graphical Math problems: Analyze graphical word problems and return [{'expr': given expression, 'result': calculated answer}].
      5. Abstract Concepts from drawings: Detect abstract concepts (e.g., love, hate, patriotism) and return [{'expr': description, 'result': concept}].

      Use the following dictionary of user-assigned variables to substitute values: ${dictOfVarsStr}.
      Please return the answer as a JSON-parsable list of dictionaries.
    `;

    const response = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: "image/png",
          data: imageBuffer.toString("base64"),
        },
      },
    ]);

    const responseText = response.response.candidates[0]?.content || "";
    let answers = [];

    if (typeof responseText === "object" && responseText !== "undefined") {
      try {
        const jsonString = responseText.parts[0].text.replace(/'/g, '"');
        answers = JSON.parse(jsonString);
      } catch (error) {
        console.error("Error parsing response text:", error);
      }
    } else {
      console.error("Invalid response received:", responseText);
    }

    answers = answers.map((answer) => ({
      ...answer,
      assign: answer.assign || false,
    }));

    return answers;
  } catch (error) {
    console.error("Error in analyzing image:", error);
    return [];
  }
};

export default analyzeImage;
