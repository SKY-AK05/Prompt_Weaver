// content.js

// This function checks if the current website is a supported platform
// and sends a message to the background script to open the side panel.
const checkForSupportedWebsite = () => {
  const supportedHosts = ['chat.openai.com', 'claude.ai', 'gemini.google.com'];
  const currentHost = window.location.hostname;

  if (supportedHosts.includes(currentHost)) {
    console.log('PromptWeaver: Supported website detected. Requesting to open side panel.');
    // Send a message to the background script to open the side panel.
    chrome.runtime.sendMessage({ type: 'openSidePanel' });
  }
};

// Run the check when the content script is first injected.
checkForSupportedWebsite();
