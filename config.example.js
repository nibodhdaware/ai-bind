// AI-Bind Configuration
// Copy this file to config.js and add your actual API keys
// NEVER commit config.js to version control!

window.AiBinderConfig = {
    // Your API key - get it from your AI provider
    apiKey: "YOUR_API_KEY_HERE",
    
    // Model configuration
    model: "gemini-2.0-flash", // or "gpt-4", "claude-3-sonnet", etc.
    
    // Optional: System prompt for your AI
    systemPrompt: "You are a helpful assistant.",
    
    // Optional: Provider (auto-detected if not specified)
    // provider: "gemini", // "gemini", "openai", "anthropic"
    
    // Optional: Additional settings
    maxTokens: 1000,
    temperature: 0.7,
    
    // Security settings
    enableSanitization: true,
    maxPromptLength: 5000,
    maxProcessedPromptLength: 10000
};

// Security note: This configuration will be loaded before the main library
// Make sure to keep your actual config.js file secure and never commit it!
