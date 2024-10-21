let autoConnecting = false;
let inviteCount = 0;
let timeoutId = null;

/**
 * This method is trigger on start connecting action
 */
const startAutoConnect = () => {
  autoConnecting = true;
  connectPeople();
}

/**
 * This method is trigger on stop connecting action
 */
const stopAutoConnect = () => {
  autoConnecting = false;
  clearTimeout(timeoutId);
}

/**
 * This function implements the original businees logic to send invites. It will search for all the buttons
 * using querySelectorAll and filtering all the Connect button and click on them.
 * After clicking Connect button it will open a model for selecting note, it will click on the 
 * send without a note button and finally, increase the update inviteCount by +1
 */
const connectPeople = () => {
  if (!autoConnecting) return;

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

  timeoutId = setTimeout(connectPeople, 3000);
}

/**
 * This function is responsible for incrementing the invite count by 1 and sync it in chrome
 * storage. Send message to update it on UI
 */
function updateInviteCount() {
  inviteCount++;

  chrome.storage.sync.set({ inviteCount }, () => {
    console.log(`Invite count updated to: ${inviteCount}`);
    chrome.runtime.sendMessage({ action: "updateInviteCount", inviteCount });
  });
}

/**
 * Listen for messages from the background script
 */
chrome.runtime.onMessage.addListener((message) => {
  if (message.action === "startAutoConnect") {
    startAutoConnect();
  } else if (message.action === "stopAutoConnect") {
    stopAutoConnect();
  }
});

/**
 * Reset the invite count to zero on page unload
 */
window.addEventListener('beforeunload', () => {
  inviteCount = 0;
  autoConnecting = false;
  chrome.storage.sync.set({ inviteCount, autoConnecting });

});

/**
 * Initialize the invite count from storage when the content script loads
 */
chrome.storage.sync.get(["inviteCount"], (result) => {
  inviteCount = result.inviteCount || 0;
});
