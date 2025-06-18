// Listen for when the user clicks on the browser action (extension icon).
chrome.action.onClicked.addListener(async (tab) => {
  if (tab.id) {
    // Try to open the side panel with splash.html.
    // If already open, it might focus it.
    // If you want specific behavior like always opening splash.html vs. an existing panel,
    // more complex state management might be needed.
    try {
      await chrome.sidePanel.open({ 
          tabId: tab.id,
          // It will use the default_path from manifest which is now splash.html
      });
    } catch (error) {
        console.error("PromptWeaver: Error opening side panel:", error);
        // Attempt to set options and then open if open() directly failed
        // This can help if the panel was previously disabled for the tab.
        try {
            await chrome.sidePanel.setOptions({
                tabId: tab.id,
                path: 'splash.html', // Explicitly set path
                enabled: true
            });
            await chrome.sidePanel.open({ tabId: tab.id });
        } catch (e) {
            console.error("PromptWeaver: Failed to set options and open side panel:", e);
        }
    }
  } else {
    console.error("PromptWeaver: Could not get tab ID to open side panel.");
  }
});

// Optional: Listen for when a tab is updated to potentially set the side panel path
// This ensures that if the user navigates, the side panel can still be opened correctly.
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  // We only care if the tab is completely loaded
  if (changeInfo.status === 'complete' && tab.url) {
    try {
      // This ensures the side panel is "available" for this tab with the correct path
      // if it hadn't been set before or if it was disabled.
      await chrome.sidePanel.setOptions({
        tabId: tabId,
        path: 'splash.html',
        enabled: true // Ensure it's enabled for the tab
      });
    } catch (error) {
      // console.warn(`PromptWeaver: Could not set side panel options for tab ${tabId}: ${error.message}`);
      // This can happen on special pages like chrome:// URLs, so it's often not a critical error.
    }
  }
});
