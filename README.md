# AI-Bind

A lightweight JavaScript library that makes it easy to bind AI models to HTML elements for dynamic content generation.

## Features

-   🔌 Simple HTML integration
-   🤖 Support for multiple AI providers (Gemini, OpenAI, Anthropic)
-   🔄 Dynamic content updates
-   🎯 Context-aware prompts
-   ⚡ Lightweight and fast

## AIBind Example CodePen

[![Edit ai-bind](https://codepen.io/nibodh11228844/pen/GggQzmPk)

## Installation

### Option 1: CDN

```html
<script src="https://cdn.jsdelivr.net/gh/nibodhdaware/ai-bind@main/dist/ai-binder.min.js"></script>
```

### Option 2: NPM

```bash
npm install ai-bind
```

## Usage

### CDN Usage

```html
<script>
    window.AiBinderConfig = {
        apiKey: "YOUR_API_KEY", // Required
        provider: "gemini", // Optional: "gemini" (default), "openai", "anthropic"
        model: "gemini-2.0-flash", // Optional: model name based on provider
        systemPrompt: "You are a helpful assistant.", // Optional: system prompt
    };
</script>

<p data-prompt="Generate a welcome message for {name} who is a {role}.">
    Loading...
</p>

<script>
    const binder = AiBinder.init();
    const context = { name: "John", role: "developer" };
    const elements = document.querySelectorAll("[data-prompt]");
    elements.forEach((element) => {
        binder.bind(context).process(element);
    });
</script>
```

### NPM Usage

```javascript
import { AiBinder } from "ai-bind";

// Initialize the binder
const binder = new AiBinder({
    apiKey: "YOUR_API_KEY",
    model: "gemini-2.0-flash",
    systemPrompt: "You are a helpful assistant.",
});

// Process elements
const context = { name: "John", role: "developer" };
const elements = document.querySelectorAll("[data-prompt]");
elements.forEach((element) => {
    binder.bind(context).process(element);
});
```

### ESM Usage

```javascript
import { AiBinder } from "ai-bind/dist/ai-binder.esm.js";
```

### CommonJS Usage

```javascript
const { AiBinder } = require("ai-bind/dist/ai-binder.cjs.js");
```

## Quick Start

### 1. Include the Library

Add the script to your HTML file:

```html
<script src="https://cdn.jsdelivr.net/gh/nibodhdaware/ai-bind@main/dist/ai-binder.min.js"></script>
```

### 2. Configure the AI Provider

Set up your configuration before initializing the library:

```html
<script>
    window.AiBinderConfig = {
        apiKey: "YOUR_API_KEY", // Required
        provider: "gemini", // Optional: "gemini" (default), "openai", "anthropic"
        model: "gemini-2.0-flash", // Optional: model name based on provider
        systemPrompt: "You are a helpful assistant.", // Optional: system prompt
    };
</script>
```

### 3. Create HTML Elements with Prompts

Add elements with `data-prompt` attributes:

```html
<p data-prompt="Generate a welcome message for {name} who is a {role}.">
    Loading...
</p>
```

### 4. Initialize and Use

```html
<script>
    // Initialize the binder
    const binder = AiBinder.init();

    // Define your context
    const context = {
        name: "John",
        role: "developer",
    };

    // Process all prompts
    function processAllPrompts(context) {
        const promptElements = document.querySelectorAll("[data-prompt]");
        promptElements.forEach((element) => {
            binder.bind(context).process(element);
        });
    }

    // Initial processing
    processAllPrompts(context);
</script>
```

## Complete Example

Here's a complete example showing all features:

```html
<!DOCTYPE html>
<html>
    <head>
        <title>AI-Bind Demo</title>
        <script src="https://cdn.jsdelivr.net/gh/nibodhdaware/ai-bind@main/dist/ai-binder.min.js"></script>
    </head>
    <body>
        <!-- Basic Usage -->
        <p data-prompt="Generate a welcome message for {name} who is a {role}.">
            Loading...
        </p>

        <!-- Multiple Placeholders -->
        <p
            data-prompt="Create a description for {product} that costs ${price}."
        >
            Loading...
        </p>

        <!-- Dynamic Update -->
        <p data-prompt="Current time is {time} and weather is {weather}.">
            Loading...
        </p>
        <button onclick="updateContent()">Update Content</button>

        <script>
            // Configuration
            window.AiBinderConfig = {
                apiKey: "YOUR_API_KEY",
                systemPrompt:
                    "You are a helpful assistant. Keep responses concise.",
                model: "gemini-2.0-flash",
            };

            // Context
            const context = {
                name: "John",
                role: "developer",
                product: "Smartphone",
                price: "999",
                time: new Date().toLocaleTimeString(),
                weather: "sunny",
            };

            // Initialize
            const binder = AiBinder.init();

            // Process all prompts
            function processAllPrompts(context) {
                const promptElements =
                    document.querySelectorAll("[data-prompt]");
                promptElements.forEach((element) => {
                    binder.bind(context).process(element);
                });
            }

            // Update function
            function updateContent() {
                const newContext = {
                    ...context,
                    time: new Date().toLocaleTimeString(),
                    weather: Math.random() > 0.5 ? "sunny" : "rainy",
                };
                processAllPrompts(newContext);
            }

            // Initial processing
            processAllPrompts(context);
        </script>
    </body>
</html>
```

## Configuration Options

| Option       | Type   | Required | Default            | Description                                  |
| ------------ | ------ | -------- | ------------------ | -------------------------------------------- |
| apiKey       | string | Yes      | -                  | Your AI provider API key                     |
| provider     | string | No       | "gemini"           | AI provider: "gemini", "openai", "anthropic" |
| model        | string | No       | "gemini-2.0-flash" | Model name based on provider                 |
| systemPrompt | string | No       | -                  | System prompt for the AI model               |

## Supported AI Providers

### Gemini

-   Default provider
-   Models: "gemini-2.0-flash", "gemini-pro"
-   API Key: Google AI Studio API key

### OpenAI

-   Provider: "openai"
-   Models: "gpt-3.5-turbo", "gpt-4"
-   API Key: OpenAI API key

### Anthropic

-   Provider: "anthropic"
-   Models: "claude-3-opus", "claude-3-sonnet"
-   API Key: Anthropic API key

## Best Practices

1. **Error Handling**: Always include error handling in your prompts
2. **Context Updates**: Use the context object to update dynamic content
3. **System Prompts**: Use system prompts to guide the AI's behavior
4. **Placeholders**: Use descriptive placeholder names in your prompts
5. **Loading States**: Show loading states while content is being generated

## License

MIT License - Feel free to use this library in your projects!

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
