chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "start") {
      // Query the active tab to inject the content script
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.id) {
          // Execute the content script's start function
          chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            files: ['contentScript.js'],  // Inject content script if not already
          }, () => {
            // Send message to content script to start the connection process
            chrome.tabs.sendMessage(tabs[0].id, { action: "startAutoConnect" });
          });
        }
      });
    } else if (message.action === "stop") {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.id) {
          // Send message to content script to stop the connection process
          chrome.tabs.sendMessage(tabs[0].id, { action: "stopAutoConnect" });
        }
      });
    }
  });
  