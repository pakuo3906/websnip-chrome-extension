// Chrome Extension: WebSnip
// Background service worker for handling context menus and text processing

// Create context menu when extension is installed
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "copyAIFormatted",
    title: "AI用にコピー",
    contexts: ["selection"]
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "copyAIFormatted") {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: () => {
        // All code must be in this single function due to Chrome extension limitations
        try {
          const selection = window.getSelection();
          const selectedText = selection.toString().trim();
          
          if (!selectedText) {
            alert("テキストが選択されていません。");
            return;
          }

          // Get the selected element and generate CSS selector
          const range = selection.getRangeAt(0);
          const selectedElement = range.commonAncestorContainer.nodeType === Node.TEXT_NODE
            ? range.commonAncestorContainer.parentElement
            : range.commonAncestorContainer;

          // Generate CSS selector path for an element
          function generateCSSSelector(element) {
            if (!element || element.nodeType !== Node.ELEMENT_NODE) {
              return "unknown";
            }

            const path = [];
            let current = element;

            while (current && current.nodeType === Node.ELEMENT_NODE && current.tagName.toLowerCase() !== 'html') {
              const tagName = current.tagName.toLowerCase();
              
              // Get siblings with the same tag name
              const parent = current.parentElement;
              if (parent) {
                const siblings = Array.from(parent.children).filter(child => 
                  child.tagName.toLowerCase() === tagName
                );
                
                if (siblings.length > 1) {
                  const index = siblings.indexOf(current) + 1;
                  path.unshift(`${tagName}:nth-of-type(${index})`);
                } else {
                  path.unshift(tagName);
                }
              } else {
                path.unshift(tagName);
              }
              
              current = current.parentElement;
            }

            // Add html at the beginning if we reached it
            if (current && current.tagName.toLowerCase() === 'html') {
              path.unshift('html');
            }

            return path.join(' > ');
          }

          // Format the collected data
          function formatForAI(selectedText, url, selector) {
            return `選択テキスト：
${selectedText}

ページURL：
${url}

構造的な位置：
${selector}

指示：`;
          }

          // Show notification to user
          function showNotification(message, type = "info") {
            // Create notification element
            const notification = document.createElement('div');
            notification.style.cssText = `
              position: fixed;
              top: 20px;
              right: 20px;
              padding: 12px 24px;
              background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
              color: white;
              border-radius: 4px;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              font-size: 14px;
              box-shadow: 0 4px 12px rgba(0,0,0,0.2);
              z-index: 10001;
              max-width: 350px;
              word-wrap: break-word;
            `;
            notification.textContent = message;
            
            document.body.appendChild(notification);
            
            // Remove notification after 3 seconds
            setTimeout(() => {
              if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
              }
            }, 3000);
          }

          const cssSelector = generateCSSSelector(selectedElement);
          const currentUrl = window.location.href;

          // Format as Markdown
          const markdownOutput = formatForAI(selectedText, currentUrl, cssSelector);

          // Copy to clipboard
          navigator.clipboard.writeText(markdownOutput).then(() => {
            // Show success notification
            showNotification("AI用フォーマットでコピーしました！", "success");
            console.log("Copied to clipboard for AI:", markdownOutput);
          }).catch((error) => {
            console.error("Failed to copy to clipboard:", error);
            showNotification("クリップボードへのコピーに失敗しました。", "error");
            
            // Fallback: try using the older execCommand method
            try {
              const textArea = document.createElement('textarea');
              textArea.value = markdownOutput;
              document.body.appendChild(textArea);
              textArea.select();
              document.execCommand('copy');
              document.body.removeChild(textArea);
              showNotification("代替方法でコピーしました。", "success");
            } catch (fallbackError) {
              console.error("Fallback copy also failed:", fallbackError);
              alert("コピーに失敗しました。HTTPSサイトで試してください。");
            }
          });

        } catch (error) {
          console.error("Error in main function:", error);
          alert("エラーが発生しました: " + error.message);
        }
      }
    });
  }
});