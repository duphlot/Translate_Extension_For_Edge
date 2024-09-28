chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      func: attachSelectionListener
    });
  }
});

chrome.tabs.onActivated.addListener(activeInfo => {
  chrome.scripting.executeScript({
    target: { tabId: activeInfo.tabId },
    func: attachSelectionListener
  });
});

function attachSelectionListener() {
  // Tạo hoặc tìm `div` để hiển thị bản dịch
  let translationDiv = document.getElementById('translation-box');
  if (!translationDiv) {
    translationDiv = document.createElement('div');
    translationDiv.id = 'translation-box';
    document.body.appendChild(translationDiv);
    
    // CSS cơ bản để hộp bản dịch hiển thị đẹp mắt
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

  // Lắng nghe sự kiện chọn văn bản và dịch tự động
  document.addEventListener('mouseup', async () => {
    const selection = window.getSelection().toString().trim();
    
    if (selection.length > 0) {
      console.log('Đoạn văn bản được chọn:', selection); // Debug
      try {
        // Gửi yêu cầu dịch qua API Google Dịch
        const response = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=vi&dt=t&q=${encodeURIComponent(selection)}`);
        const translation = await response.json();
        const translatedText = translation[0][0][0];
        
        console.log('Bản dịch:', translatedText); // Debug

        // Hiển thị bản dịch lên màn hình
        translationDiv.textContent = `Dịch: ${translatedText}`;
      } catch (error) {
        console.error('Lỗi khi dịch:', error); // Debug lỗi
        translationDiv.textContent = 'Lỗi khi dịch văn bản.';
      }
    }
  });
}
