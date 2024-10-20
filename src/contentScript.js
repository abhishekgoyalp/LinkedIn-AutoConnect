let autoConnecting = false;
let inviteCount = 0;
let timeoutId = null; // Store the timeout ID

function startAutoConnect() {
  autoConnecting = true;
  connectPeople();
}

function stopAutoConnect() {
  autoConnecting = false;
  clearTimeout(timeoutId); // Clear existing timeout when stopping
}

function connectPeople() {
  if (!autoConnecting) return;

  // Find and click "Connect" buttons
  const buttons = document.querySelectorAll("button");

  buttons.forEach((button) => {
    if (button.innerText === "Connect") {
      button.click();

      setTimeout(() => {
        const sendNowButton = document.querySelector("button[aria-label='Send without a note']");
        if (sendNowButton) {
          sendNowButton.click();
          updateInviteCount();
          chrome.storage.sync.set({ inviteCount });
        }
      }, 1000);
    }
  });

  // Retry every 3 seconds and store the timeout ID
  timeoutId = setTimeout(connectPeople, 3000);
}

// Function to update the invite count and save it in Chrome storage
function updateInviteCount() {
  inviteCount++; // Increment invite count

  // Save the updated invite count to Chrome storage
  chrome.storage.sync.set({ inviteCount }, () => {
    console.log(`Invite count updated to: ${inviteCount}`);
    // Send a message to the popup to update the UI
    chrome.runtime.sendMessage({ action: "updateInviteCount", inviteCount });
  });
}

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((message) => {
  if (message.action === "startAutoConnect") {
    startAutoConnect();
  } else if (message.action === "stopAutoConnect") {
    stopAutoConnect();
  }
});

// Reset the invite count to zero on page unload
window.addEventListener('beforeunload', () => {
  inviteCount = 0; // Reset invite count to zero
  chrome.storage.sync.set({ inviteCount }); // Save zero count to storage
});

// Initialize the invite count from storage when the content script loads
chrome.storage.sync.get(["inviteCount"], (result) => {
  inviteCount = result.inviteCount || 0;
});
