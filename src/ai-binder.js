import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";

export class AiBinder {
    constructor(config) {
        this.apiKey = config.apiKey;
        this.systemPrompt = config.systemPrompt;
        this.model = config.model;

        // Detect provider based on model name and API key
        this.provider = this.detectProvider();

        // Initialize the appropriate client based on detected provider
        switch (this.provider) {
            case "gemini":
                this.genAI = new GoogleGenerativeAI(this.apiKey);
                this.modelInstance = this.genAI.getGenerativeModel({
                    model: this.model,
                });
                break;
            case "openai":
                this.client = new OpenAI({
                    apiKey: this.apiKey,
                    defaultQuery: { "api-version": "2023-05-15" },
                    defaultHeaders: { "api-key": this.apiKey },
                });
                break;
            case "anthropic":
                this.client = new Anthropic({
                    apiKey: this.apiKey,
                    defaultHeaders: { "anthropic-version": "2023-06-01" },
                });
                break;
            default:
                throw new Error(`Unsupported model: ${this.model}`);
        }
    }

    detectProvider() {
        // Check model name patterns
        if (this.model.startsWith("gemini")) {
            return "gemini";
        } else if (this.model.startsWith("gpt")) {
            return "openai";
        } else if (this.model.startsWith("claude")) {
            return "anthropic";
        }

        // If model name doesn't match, try API key format
        if (this.apiKey.startsWith("sk-")) {
            return "openai";
        } else if (this.apiKey.startsWith("sk-ant-")) {
            return "anthropic";
        } else if (this.apiKey.startsWith("AIza")) {
            return "gemini";
        }

        throw new Error(
            `Could not determine provider for model: ${this.model}`,
        );
    }

    bind(context) {
        this.context = context;
        return this;
    }

    async process(element) {
        try {
            const prompt = element.getAttribute("data-prompt");
            if (!prompt) {
                throw new Error("No prompt found on element");
            }

            // Replace placeholders in the prompt with context values
            let processedPrompt = prompt;
            for (const [key, value] of Object.entries(this.context)) {
                processedPrompt = processedPrompt.replace(
                    new RegExp(`{${key}}`, "g"),
                    value,
                );
            }

            let text;
            // Generate content based on provider and model
            switch (this.provider) {
                case "gemini":
                    const result = await this.modelInstance.generateContent(
                        this.systemPrompt
                            ? `System Prompt: ${this.systemPrompt}\n\n${processedPrompt}`
                            : processedPrompt,
                    );
                    const response = await result.response;
                    text = response.text();
                    break;
                case "openai":
                    const completion =
                        await this.client.chat.completions.create({
                            model: this.model,
                            messages: [
                                ...(this.systemPrompt
                                    ? [
                                          {
                                              role: "system",
                                              content: this.systemPrompt,
                                          },
                                      ]
                                    : []),
                                { role: "user", content: processedPrompt },
                            ],
                            temperature: 0.7,
                            max_tokens: 1000,
                        });
                    text = completion.choices[0].message.content;
                    break;
                case "anthropic":
                    const message = await this.client.messages.create({
                        model: this.model,
                        max_tokens: 1000,
                        temperature: 0.7,
                        messages: [
                            {
                                role: "user",
                                content: this.systemPrompt
                                    ? `${this.systemPrompt}\n\n${processedPrompt}`
                                    : processedPrompt,
                            },
                        ],
                    });
                    text = message.content[0].text;
                    break;
            }

            // Update the element with the generated content
            element.textContent = text;
        } catch (error) {
            console.error("Error generating content:", error);
            element.textContent = "Error: " + error.message;
            throw error;
        }
    }
}

// Initialize AiBinder
export function init(apiKey, systemPrompt, model) {
    // Get configuration from various sources
    const config = {
        apiKey:
            apiKey ||
            document.body.getAttribute("data-ai-binder-api-key") ||
            window.AiBinderConfig?.apiKey,
        systemPrompt:
            systemPrompt ||
            document.body.getAttribute("data-ai-binder-prompt") ||
            window.AiBinderConfig?.systemPrompt,
        model:
            model ||
            document.body.getAttribute("data-ai-binder-model") ||
            window.AiBinderConfig?.model,
    };

    // If model is missing, show error in console
    if (!config.model) {
        console.error(
            `%cModel is required for AiBinder. You can add it in one of these ways:

1. Add it to the body tag:
   <body data-ai-binder-model="gemini-2.0-flash">

2. Set it in the global config:
   window.AiBinderConfig = { model: "gemini-2.0-flash" };

3. Pass it to the init function:
   AiBinder.init("your-api-key", "your-prompt", "gemini-2.0-flash");

Please add a model and refresh the page.`,
            "color: #ff6b6b; font-weight: bold;",
        );
        return null;
    }

    console.log("Initializing AiBinder with config:", config);

    // Create AiBinder instance
    const binder = new AiBinder(config);

    // Automatically process all elements with data-prompt attribute
    const promptElements = document.querySelectorAll("[data-prompt]");
    if (promptElements.length > 0) {
        // Create a default context if none is provided
        const defaultContext = {
            time: new Date().toLocaleTimeString(),
            date: new Date().toLocaleDateString(),
            // Add more default context variables as needed
        };

        promptElements.forEach((element) => {
            // Set loading state
            if (!element.textContent) {
                element.textContent = "Loading...";
            }

            // Process the element with default context
            binder.bind(defaultContext).process(element);
        });
    }

    return binder;
}

// Export the init function
window.AiBinder = { init };
