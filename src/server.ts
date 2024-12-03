import dotenv from 'dotenv';
import express from 'express';
import type { Request, Response } from 'express';
import { OpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { z } from "zod";
import { StructuredOutputParser, OutputFixingParser } from 'langchain/output_parsers';
import { PromptTemplate } from 'langchain/prompts';
import { ChatOpenAI } from 'langchain_openai';

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
  model = new OpenAI({ temperature: 0, openAIApiKey: apiKey, modelName: 'gpt-3.5-turbo' });
  // let response = await model.invoke(new HumanMessage("Hello world!"));
} else {
  console.error('OPENAI_API_KEY is not configured.');
}

// TODO: Define the parser for the structured output
const parser = PydanticOutputParser(pydantic_object=model);

// TODO: Get the format instructions from the parser
const prompt = ChatPromptTemplate.from_messages(
  [
      (
          "system",
          "Answer the user query. Wrap the output in `json` tags\n{format_instructions}",
      ),
      ("human", "{query}"),
  ]
).partial(format_instructions=parser.get_format_instructions())

// TODO: Define the prompt template

const promptTemplate = new PromptTemplate({
  template: 'Summarize the following text using bullet points:\n{content}',
  inputVariables: ['content'],
});

const formatPrompt = async (text: string): Promise<string> => {
  return await promptTemplate.format({ content: text });
};



// Create a prompt function that takes the user input and passes it through the call method
const promptFunc = async (input: string) => {
        // TODO: Format the prompt with the user input

        const formattedPrompt = await formatPrompt(input) ;
        // TODO: Call the model with the formatted prompt
        try {
          if (model) {
          const yyy = await model.invoke(input);
        // TODO: return the JSON response
          return JSON.stringify(yyy)}
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
