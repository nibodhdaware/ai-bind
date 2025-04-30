import { GoogleGenerativeAI } from "@google/generative-ai";
import { AiBinder } from "./ai-binder.js";

// Mock function to generate content
const mockGenerateContent = async (prompt) => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Generate mock responses based on the prompt content
    if (prompt.includes("welcome message")) {
        return `Welcome ${
            prompt.match(/for (.*?) who/)[1]
        }! We're excited to have you as our ${
            prompt.match(/is a (.*?)\./)[1]
        }.`;
    } else if (prompt.includes("description")) {
        const product = prompt.match(/for (.*?) that/)[1];
        const price = prompt.match(/costs \$(.*?) and/)[1];
        const color = prompt.match(/in (.*?)\./)[1];
        return `Check out our amazing ${color} ${product}, a premium choice at just $${price}. Perfect for those who demand excellence.`;
    } else if (prompt.includes("time")) {
        const time = prompt.match(/time is (.*?) and/)[1];
        const weather = prompt.match(/is (.*?)\./)[1];
        return `At ${time}, you'll be happy to know it's ${weather} outside. Perfect time to check our services!`;
    }
    return `Generated response for: ${prompt}`;
};

const AiBinder = {
    context: {},
    model: null,
    systemPrompt: null,

    // Initialize with API key and system prompt
    init: function (apiKey = null, systemPrompt = null) {
        // Get API key from various sources
        const resolvedApiKey =
            apiKey ||
            window.AiBinderConfig?.apiKey ||
            document.body.getAttribute("data-ai-binder-api-key");

        if (!resolvedApiKey) {
            console.error("API key is required");
            this._showConfigUI();
            return this;
        }

        try {
            const genAI = new GoogleGenerativeAI(resolvedApiKey);
            this.model = genAI.getGenerativeModel({
                model: "gemini-2.0-flash",
            });

            // Get system prompt from various sources
            this.systemPrompt =
                systemPrompt ||
                window.AiBinderConfig?.systemPrompt ||
                document.body.getAttribute("data-ai-binder-prompt");

            console.log(
                "AiBinder initialized with Gemini API (gemini-2.0-flash)",
            );
            if (this.systemPrompt) {
                console.log("Using system prompt:", this.systemPrompt);
            }
        } catch (error) {
            console.error("Error initializing Gemini API:", error);
        }
        return this;
    },

    // Show configuration UI if needed
    _showConfigUI: function () {
        const configHtml = `
            <div id="ai-binder-config" style="
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                background: #f5f5f5;
                padding: 20px;
                z-index: 1000;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            ">
                <h2 style="margin-top: 0;">AiBinder Configuration Required</h2>
                <div style="margin-bottom: 10px;">
                    <label for="ai-binder-api-key">Gemini API Key:</label>
                    <input type="password" id="ai-binder-api-key" style="width: 100%; padding: 8px; margin-top: 5px;" />
                </div>
                <div style="margin-bottom: 10px;">
                    <label for="ai-binder-system-prompt">System Prompt (Optional):</label>
                    <textarea id="ai-binder-system-prompt" style="width: 100%; padding: 8px; margin-top: 5px; height: 100px;"></textarea>
                    <div style="font-size: 0.9em; color: #666; margin-top: 5px;">
                        Example: "You are a casual and friendly assistant. Always respond in a single sentence. Use emojis when appropriate. Keep it light and fun!"
                    </div>
                </div>
                <button onclick="window.AiBinder._initializeFromUI()" style="
                    padding: 8px 16px;
                    background: #4CAF50;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                ">Initialize AiBinder</button>
            </div>
        `;

        document.body.insertAdjacentHTML("afterbegin", configHtml);
    },

    // Initialize from UI
    _initializeFromUI: function () {
        const apiKey = document.getElementById("ai-binder-api-key").value;
        const systemPrompt = document.getElementById(
            "ai-binder-system-prompt",
        ).value;

        if (!apiKey) {
            alert("Please enter your Gemini API key");
            return;
        }

        try {
            this.init(apiKey, systemPrompt).bind(this.context).process();

            // Remove config UI
            document.getElementById("ai-binder-config").remove();
        } catch (error) {
            console.error("Error initializing AiBinder:", error);
            alert("Error initializing AiBinder. Please check your API key.");
        }
    },

    // Set system prompt
    setSystemPrompt: function (prompt) {
        this.systemPrompt = prompt;
        return this;
    },

    // Bind context data to be used in prompts
    bind: function (data) {
        this.context = { ...this.context, ...data };
        return this;
    },

    // Process all elements with data-prompt attribute
    process: async function () {
        if (!this.model) {
            console.error(
                "AiBinder not initialized. Call AiBinder.init() first.",
            );
            return;
        }

        const elements = document.querySelectorAll("[data-prompt]");

        for (const element of elements) {
            try {
                element.textContent = "Generating...";
                const prompt = element.getAttribute("data-prompt");
                const processedPrompt = this._replacePlaceholders(prompt);

                // Combine system prompt with user prompt if available
                const fullPrompt = this.systemPrompt
                    ? `${this.systemPrompt}\n\nUser: ${processedPrompt}`
                    : processedPrompt;

                const result = await this.model.generateContent(fullPrompt);
                const response = await result.response;
                element.textContent = response.text();
            } catch (error) {
                console.error("Error generating content:", error);
                element.textContent =
                    "Error generating content. Please try again.";
            }
        }
    },

    // Replace placeholders in the prompt with context values
    _replacePlaceholders: function (prompt) {
        return prompt.replace(/\{([^}]+)\}/g, (match, key) => {
            return this.context[key] || match;
        });
    },
};

// Auto-process elements when the DOM is ready
document.addEventListener("DOMContentLoaded", () => {
    if (window.AiBinderConfig && window.AiBinderConfig.apiKey) {
        AiBinder.init(window.AiBinderConfig.apiKey).process();
    } else {
        console.error(
            "AiBinder API key not configured. Set window.AiBinderConfig.apiKey before loading the script.",
        );
    }
});

// Export for npm usage
export { AiBinder };

// For CDN usage, attach to window if in browser
if (typeof window !== "undefined") {
    window.AiBinder = {
        init: (apiKey, systemPrompt, model) => {
            const binder = new AiBinder({
                apiKey: apiKey || window.AiBinderConfig?.apiKey,
                systemPrompt:
                    systemPrompt || window.AiBinderConfig?.systemPrompt,
                model: model || window.AiBinderConfig?.model,
            });

            // Process all elements with data-prompt attribute
            const promptElements = document.querySelectorAll("[data-prompt]");
            if (promptElements.length > 0) {
                const defaultContext = {
                    time: new Date().toLocaleTimeString(),
                    date: new Date().toLocaleDateString(),
                };

                promptElements.forEach((element) => {
                    if (!element.textContent) {
                        element.textContent = "Loading...";
                    }
                    binder.bind(defaultContext).process(element);
                });
            }

            return binder;
        },
    };
}
