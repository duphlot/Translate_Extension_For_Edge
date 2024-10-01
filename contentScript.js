// contentScript.js

function getSelectedText() {
    const selection = document.getSelection();
    return selection ? selection.toString() : '';
  }
  
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'translate') {
      const selectedText = getSelectedText();
      // Thực hiện logic dịch văn bản ở đây
      sendResponse({ translatedText: 'Bản dịch của bạn' });
    }
  });