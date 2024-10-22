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

// Function to introduce delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Function to get a random delay between 5 and 10 seconds (5000 to 10000 ms)
const getRandomDelay = () => {
  return Math.floor(Math.random() * (10000 - 5000 + 1)) + 5000; // 5000 to 10000 ms
};

/**
 * This function automates the process of sending connection requests on a webpage (likely LinkedIn). 
 * It continuously scans for "Connect" buttons, clicks them, and follows up by clicking the 
 * "Send without a note" button to send the connection request.
 * 
 * - If the autoConnecting flag is false, the function exits without doing anything.
 * - The function first retrieves all buttons on the page and filters them to find ones with the text "Connect".
 * - If no "Connect" buttons are found, the function stops.
 * - Otherwise, it clicks the first "Connect" button, waits for 1 second, and then looks for the "Send without a note" button.
 * - If the "Send without a note" button is found, it clicks it, updates the invite count, and stores it using Chrome's storage sync.
 * - A random delay between 5 and 10 seconds is used to simulate more human-like interaction before recursively running the function again.
 * 
 * This method ensures that connection requests are sent in a controlled and automated manner while avoiding overly fast actions that may trigger anti-bot measures.
 */
const connectPeople = async () => {
  if (!autoConnecting) return;

  const buttons = document.querySelectorAll("button");
  const connectButtons = Array.from(buttons).filter(button => button.innerText === "Connect");

  if (connectButtons.length === 0) {
    return;
  }
  connectButtons[0].click();

  // Wait for the "Send without a note" button to appear and click it after 1 second
  await delay(1000);
  const sendNowButton = document.querySelector("button[aria-label='Send without a note']");
  if (sendNowButton) {
    sendNowButton.click();
    updateInviteCount();
    chrome.storage.sync.set({ inviteCount });
  }

  const randomDelay = getRandomDelay();
  await delay(randomDelay);

  connectPeople();
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
