
/**
 * This method is listen message for Popup.js. This method will query the active tab to inject 
 * the content script and send message action to content script to start/stop the process
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "start") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          files: ['contentScript.js'],
        }, () => {
          chrome.tabs.sendMessage(tabs[0].id, { action: "startAutoConnect" });
        });
      }
    });
  } else if (message.action === "stop") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, { action: "stopAutoConnect" });
      }
    });
  }
});
