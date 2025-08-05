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
      // インライン関数として実装（Chrome拡張の制限のため）
      function: () => {
        // Utility functions (インライン実装)
        function generateCSSSelector(element) {
          if (!element || element.nodeType !== Node.ELEMENT_NODE) {
            return "unknown";
          }

          const path = [];
          let current = element;

          while (current && current.nodeType === Node.ELEMENT_NODE && current.tagName.toLowerCase() !== 'html') {
            const tagName = current.tagName.toLowerCase();
            
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

          if (current && current.tagName.toLowerCase() === 'html') {
            path.unshift('html');
          }

          return path.join(' > ');
        }

        function getSelectionInfo() {
          const selection = window.getSelection();
          const selectedText = selection.toString().trim();
          
          if (!selectedText) {
            return null;
          }

          const range = selection.getRangeAt(0);
          const selectedElement = range.commonAncestorContainer.nodeType === Node.TEXT_NODE
            ? range.commonAncestorContainer.parentElement
            : range.commonAncestorContainer;

          return {
            text: selectedText,
            element: selectedElement,
            cssSelector: generateCSSSelector(selectedElement)
          };
        }

        function formatForAI(selectedText, url, selector) {
          return `選択テキスト：
${selectedText}

ページURL：
${url}

構造的な位置：
${selector}

指示：`;
        }

        function showNotification(message, type = "info") {
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
          
          setTimeout(() => {
            if (notification.parentNode) {
              notification.parentNode.removeChild(notification);
            }
          }, 3000);
        }

        async function copyToClipboard(text) {
          try {
            await navigator.clipboard.writeText(text);
            return true;
          } catch (error) {
            console.error("Clipboard API failed:", error);
            
            try {
              const textArea = document.createElement('textarea');
              textArea.value = text;
              document.body.appendChild(textArea);
              textArea.select();
              document.execCommand('copy');
              document.body.removeChild(textArea);
              return true;
            } catch (fallbackError) {
              console.error("Fallback copy also failed:", fallbackError);
              return false;
            }
          }
        }

        // メイン処理
        async function handleTextSelection() {
          try {
            const selectionInfo = getSelectionInfo();
            
            if (!selectionInfo) {
              alert("テキストが選択されていません。");
              return;
            }

            const currentUrl = window.location.href;
            const markdownOutput = formatForAI(
              selectionInfo.text, 
              currentUrl, 
              selectionInfo.cssSelector
            );

            const copySuccess = await copyToClipboard(markdownOutput);
            
            if (copySuccess) {
              showNotification("AI用フォーマットでコピーしました！", "success");
              console.log("Copied to clipboard for AI:", markdownOutput);
            } else {
              showNotification("クリップボードへのコピーに失敗しました。", "error");
              alert("コピーに失敗しました。HTTPSサイトで試してください。");
            }

          } catch (error) {
            console.error("Error in handleTextSelection:", error);
            showNotification("エラーが発生しました。", "error");
            alert("エラーが発生しました: " + error.message);
          }
        }

        // 実行
        handleTextSelection();
      }
    });
  }
});