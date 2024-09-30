var isTranslationEnabled = false; // Mặc định là tắt
let eventListenerAttached = false;
let translationDiv = null;
function displayToggleMessage(isTranslationEnabled) {
  let messageDiv = document.getElementById('toggle-message');
  if (!messageDiv) {
    messageDiv = document.createElement('div');
    messageDiv.id = 'toggle-message';
    document.body.appendChild(messageDiv);
    messageDiv.style.position = 'fixed';
    messageDiv.style.bottom = '20px';
    messageDiv.style.right = '20px';
    messageDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    messageDiv.style.color = 'white';
    messageDiv.style.padding = '10px';
    messageDiv.style.borderRadius = '5px';
    messageDiv.style.zIndex = '1000';
    messageDiv.style.maxWidth = '200px';
    messageDiv.style.wordWrap = 'break-word';
  }

  messageDiv.textContent = isTranslationEnabled ? "Dịch đã bật" : "Dịch đã tắt";
  setTimeout(() => {
    messageDiv.remove();
  }, 2000);
  if (!isTranslationEnabled) {
    setTimeout(() => {
      translationDiv.remove();
    }, 2000);
    chrome.runtime.sendMessage({ action: "stop" });
  } else {
    chrome.runtime.sendMessage({ action: "continue" });
  }
}
const stopActivity = () => {
  clearInterval(myInterval); 
};
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "stop") {
      stopActivity();
  } else if (message.action === "continue") {
      myInterval = setInterval(() => {
        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
          chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            func: attachSelectionListener,
            args: [isTranslationEnabled]
          });
        });
      }, 1000);
  }
});

chrome.commands.onCommand.addListener((command) => {
  console.log("Lệnh nhận được:", command); // Debug
  if (command === "toggle-enable-disable") {
    console.log("Đã bật/tắt dịch"); // Debug
    isTranslationEnabled = !isTranslationEnabled;
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        func: displayToggleMessage,
        args: [isTranslationEnabled]
      });
    });
  }
});


chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (isTranslationEnabled && changeInfo.status === 'complete') {
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      func: attachSelectionListener,
      args: [isTranslationEnabled]
    });
  }
});

chrome.tabs.onActivated.addListener(activeInfo => {
  if (isTranslationEnabled) {
    chrome.scripting.executeScript({
      target: { tabId: activeInfo.tabId },
      func: attachSelectionListener,
      args: [isTranslationEnabled]
    });
  }
});

function attachSelectionListener(isTranslationEnabled) {
  translationDiv = document.getElementById('translation-box');
  if (!translationDiv) {
    translationDiv = document.createElement('div');
    translationDiv.id = 'translation-box';
    document.body.appendChild(translationDiv);
    translationDiv.style.position = 'fixed';
    translationDiv.style.bottom = '10px';
    translationDiv.style.right = '10px';
    translationDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.75)';
    translationDiv.style.color = 'white';
    translationDiv.style.padding = '10px';
    translationDiv.style.borderRadius = '5px';
    translationDiv.style.zIndex = '1000';
    translationDiv.style.maxWidth = '300px';
    translationDiv.style.wordWrap = 'break-word';
  }

  document.addEventListener('mouseup', async () => {
    const selection = window.getSelection().toString().trim();
    
    if (selection.length > 0) {
      console.log('Đoạn văn bản được chọn:', selection); // Debug
      try {
        const response = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=vi&dt=t&q=${encodeURIComponent(selection)}`);
        const translation = await response.json();
        const translatedText = translation[0][0][0];
        
        console.log('Bản dịch:', translatedText); // Debug
        translationDiv.textContent = `Dịch: ${translatedText}`;
      } catch (error) {
        console.error('Lỗi khi dịch:', error); 
        translationDiv.textContent = 'Lỗi khi dịch văn bản.';
      }
    }
  });
}
