import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";

class AiBinder {
    constructor(apiKey, systemPrompt, model, provider = "gemini") {
        this.apiKey = apiKey;
        this.systemPrompt = systemPrompt;
        this.model = model;
        this.provider = provider;

        // Initialize the appropriate client based on provider
        switch (provider.toLowerCase()) {
            case "gemini":
                this.genAI = new GoogleGenerativeAI(this.apiKey);
                this.modelInstance = this.genAI.getGenerativeModel({
                    model: this.model,
                });
                break;
            case "openai":
                this.client = new OpenAI({
                    apiKey: this.apiKey,
                    // Add default configuration for OpenAI models
                    defaultQuery: { "api-version": "2023-05-15" },
                    defaultHeaders: { "api-key": this.apiKey },
                });
                break;
            case "anthropic":
                this.client = new Anthropic({
                    apiKey: this.apiKey,
                    // Add default configuration for Anthropic models
                    defaultHeaders: { "anthropic-version": "2023-06-01" },
                });
                break;
            default:
                throw new Error(`Unsupported provider: ${provider}`);
        }
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

            // Combine system prompt with the processed prompt
            const fullPrompt = `${this.systemPrompt}\n\n${processedPrompt}`;

            let text;
            // Generate content based on provider and model
            switch (this.provider.toLowerCase()) {
                case "gemini":
                    const result = await this.modelInstance.generateContent(
                        fullPrompt,
                    );
                    const response = await result.response;
                    text = response.text();
                    break;
                case "openai":
                    const completion =
                        await this.client.chat.completions.create({
                            model: this.model,
                            messages: [
                                { role: "system", content: this.systemPrompt },
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
                        messages: [{ role: "user", content: fullPrompt }],
                    });
                    text = message.content[0].text;
                    break;
            }

            // Update the element with the generated content
            element.textContent = text;
            element.classList.remove("loading");
        } catch (error) {
            console.error("Error generating content:", error);
            element.textContent = "Error: " + error.message;
            element.classList.remove("loading");
            element.classList.add("error");
            throw error;
        }
    }
}

// Initialize AiBinder with configuration from various sources
function init(apiKey, systemPrompt, model, provider) {
    // Get configuration from body attributes
    const bodyApiKey = document.body.getAttribute("data-ai-binder-api-key");
    const bodyPrompt = document.body.getAttribute("data-ai-binder-prompt");
    const bodyModel = document.body.getAttribute("data-ai-binder-model");
    const bodyProvider = document.body.getAttribute("data-ai-binder-provider");

    // Get configuration from global config object
    const configApiKey = window.AiBinderConfig?.apiKey;
    const configPrompt = window.AiBinderConfig?.systemPrompt;
    const configModel = window.AiBinderConfig?.model;
    const configProvider = window.AiBinderConfig?.provider;

    // Use the first available configuration in order of priority:
    // 1. Function arguments
    // 2. Body attributes
    // 3. Global config
    const finalApiKey = apiKey || bodyApiKey || configApiKey;
    const finalPrompt = systemPrompt || bodyPrompt || configPrompt;
    const finalModel = model || bodyModel || configModel;
    const finalProvider =
        provider || bodyProvider || configProvider || "gemini";

    // Log the configuration for debugging
    console.log("Configuration:", {
        apiKey: finalApiKey,
        prompt: finalPrompt,
        model: finalModel,
        provider: finalProvider,
    });

    if (!finalApiKey) {
        throw new Error(
            "API key is required. Please provide it through one of the configuration methods.",
        );
    }

    if (!finalPrompt) {
        throw new Error(
            "System prompt is required. Please provide it through one of the configuration methods.",
        );
    }

    // Create a new instance with the final configuration
    const binder = new AiBinder(
        finalApiKey,
        finalPrompt,
        finalModel,
        finalProvider,
    );

    // Store the configuration for future reference
    binder.config = {
        apiKey: finalApiKey,
        systemPrompt: finalPrompt,
        model: finalModel,
        provider: finalProvider,
    };

    return binder;
}

// Export the init function
window.AiBinder = { init };
