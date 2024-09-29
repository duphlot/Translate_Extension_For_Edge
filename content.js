window.isTranslationEnabled = true;

// Lấy trạng thái dịch từ storage
chrome.storage.local.get("isTranslationEnabled", (data) => {
  window.isTranslationEnabled = data.isTranslationEnabled !== undefined ? data.isTranslationEnabled : true;
});

document.addEventListener('mouseup', () => {
  if (window.isTranslationEnabled) {
    const selection = window.getSelection().toString();
    if (selection) {
      // Kiểm tra nếu đang ở trên trang hợp lệ
      const url = window.location.href;
      // Chỉ thực hiện nếu không ở trên các trang hệ thống hoặc New Tab
      if (!url.startsWith("chrome://") && !url.startsWith("edge://") && !url.includes("ntp.msn.com")) {
        fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(selection)}&langpair=en|vi`)
          .then(response => response.json())
          .then(data => {
            const translation = data.responseData.translatedText;
            alert(`Translation: ${translation}`);
          })
          .catch(error => console.error('Error:', error));
      }
    }
  }
});
