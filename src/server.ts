import dotenv from 'dotenv';
import express from 'express';
import type { Request, Response } from 'express';
import { OpenAI } from "@langchain/openai";
import { z } from "zod";
import { StructuredOutputParser } from 'langchain/output_parsers';
import { PromptTemplate } from '@langchain/core/prompts';

dotenv.config();

const port = process.env.PORT || 3001;
const apiKey = process.env.OPENAI_API_KEY;

// Check if the API key is defined
if (!apiKey) {
  console.error('OPENAI_API_KEY is not defined. Exiting...');
  process.exit(1);
}

const app = express();
app.use(express.json());

// TODO: Initialize the OpenAI model
let model:any ;
if (apiKey) {
  // Initialize the OpenAI model if the API key is provided
  model = new OpenAI({ temperature: 0, openAIApiKey: apiKey, modelName: 'GPT-4o mini' });
  
} else {
  console.error('OPENAI_API_KEY is not configured.');
}

// TODO: Define the parser for the structured output
const parser = StructuredOutputParser.fromNamesAndDescriptions({
  code: "TypeScript code that answers the user's question",
  explanation: 'detailed explanation of the example code provided',
});

// TODO: Get the format instructions from the parser

const formatInstructions = parser.getFormatInstructions();

// TODO: Define the prompt template
const promptTemplate = new PromptTemplate({
  template: "You are a programming expert and will answer the user’s coding questions as thoroughly as possible using TypeScript. If the question is unrelated to coding, do not answer.\n{format_instructions}\n{question}",
  inputVariables: ["question"],
  partialVariables: { format_instructions: formatInstructions }
});

// Create a prompt function that takes the user input and passes it through the call method
const promptFunc = async (input: string) => {
        // TODO: Format the prompt with the user input
        const formatPrompt = async (question: string): Promise<string> => {
          return await promptTemplate.format({ question });
        };
        
        // TODO: Call the model with the formatted prompt
        try {
          if (model) {
            const formattedPrompt = await formatPrompt(input); // Format the prompt
            const response = await model.invoke(formattedPrompt);
            // Return the JSON response
            
            return await parser.parse(response);
        }
          return 'No OpenAI API key provided. Unable to provide a response.';
        }
        // TODO: Catch any errors and log them to the console
        catch (err) {
          console.error(err);
          throw err;
        }
};

// Endpoint to handle request
app.post('/forecast', async (req: Request, res: Response): Promise<void> => {
  try {
    const location: string = req.body.location;
    if (!location) {
      res.status(400).json({
        error: 'Please provide a location in the request body.',
      });
    }
    const result: any = await promptFunc(location);
    res.json({ result });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error:', error.message);
    }
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
function PydanticOutputParser(arg0: any) {
  throw new Error('Function not implemented.');
}

