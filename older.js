let isTranslationEnabled = false; // Mặc định ban đầu là tắt
let eventListenerAttached = false; // Theo dõi trạng thái lắng nghe sự kiện

// Hàm bật/tắt dịch
function toggleTranslation() {
  isTranslationEnabled = !isTranslationEnabled;
  console.log("Chức năng dịch đã " + (isTranslationEnabled ? "bật" : "tắt"));

  // Hiển thị thông báo trên màn hình về trạng thái bật/tắt
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      func: displayToggleMessage,
      args: [isTranslationEnabled]
    });

    // Khi tắt dịch, hủy bỏ event listener đã gắn trước đó
    if (!isTranslationEnabled && eventListenerAttached) {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        func: removeSelectionListener
      });
      eventListenerAttached = false;
    }
  });
}

// Hiển thị thông báo về trạng thái bật/tắt
function displayToggleMessage(isEnabled) {
  let messageDiv = document.getElementById('toggle-message');
  if (!messageDiv) {
    messageDiv = document.createElement('div');
    messageDiv.id = 'toggle-message';
    document.body.appendChild(messageDiv);

    // Thiết lập CSS cho hộp thông báo
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

  messageDiv.textContent = isEnabled ? "Dịch đã bật" : "Dịch đã tắt";

  // Tự động ẩn thông báo sau 2 giây
  setTimeout(() => {
    messageDiv.remove();
  }, 2000);
}

// Hàm hủy bỏ sự kiện lắng nghe chọn văn bản
function removeSelectionListener() {
  document.removeEventListener('mouseup', handleTextSelection);
  let translationDiv = document.getElementById('translation-box');
  if (translationDiv) {
    translationDiv.remove();  // Xóa hộp bản dịch khi tắt
  }
}

// Lắng nghe tổ hợp phím Ctrl+Shift+T để bật/tắt chức năng dịch
chrome.commands.onCommand.addListener((command) => {
  if (command === "toggle-enable-disable") {
    toggleTranslation();
  }
});

// Lắng nghe sự kiện khi tab được cập nhật hoặc kích hoạt, chỉ chạy nếu dịch đang bật
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && isTranslationEnabled && !eventListenerAttached) {
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      func: attachSelectionListener
    });
    eventListenerAttached = true;
  }
});

chrome.tabs.onActivated.addListener(activeInfo => {
  if (isTranslationEnabled && !eventListenerAttached) {
    chrome.scripting.executeScript({
      target: { tabId: activeInfo.tabId },
      func: attachSelectionListener
    });
    eventListenerAttached = true;
  }
});

// Hàm chính để xử lý việc dịch văn bản khi bôi đen
function attachSelectionListener() {
  document.addEventListener('mouseup', handleTextSelection);
  
  function handleTextSelection() {
    let translationDiv = document.getElementById('translation-box');

      translationDiv = document.createElement('div');
      translationDiv.id = 'translation-box';
      document.body.appendChild(translationDiv);

      // Thiết lập CSS cho hộp bản dịch
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

    const selection = window.getSelection().toString().trim();
    if (selection.length > 0) {
      fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=vi&dt=t&q=${encodeURIComponent(selection)}`)
        .then(response => response.json())
        .then(translation => {
          const translatedText = translation[0][0][0];
          translationDiv.textContent = `Dịch: ${translatedText}`;
        })
        .catch(error => {
          translationDiv.textContent = 'Lỗi khi dịch văn bản.';
          console.error('Lỗi khi dịch:', error);
        });
  }
}
