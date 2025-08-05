// Utility functions for WebSnip Chrome Extension
// 各機能を独立した関数として分離してテスト可能にする

/**
 * 要素のCSSセレクタパスを生成
 * @param {Element} element - 対象要素
 * @returns {string} CSS selector path
 */
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

/**
 * 選択されたテキストの情報を取得
 * @returns {Object|null} 選択情報またはnull
 */
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

/**
 * AI向けフォーマットでテキストを整形
 * @param {string} selectedText - 選択されたテキスト
 * @param {string} url - ページURL
 * @param {string} selector - CSSセレクタ
 * @returns {string} フォーマット済みテキスト
 */
function formatForAI(selectedText, url, selector) {
  return `選択テキスト：
${selectedText}

ページURL：
${url}

構造的な位置：
${selector}

指示：`;
}

/**
 * 通知を表示
 * @param {string} message - 通知メッセージ
 * @param {string} type - 通知タイプ ('success', 'error', 'info')
 */
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

/**
 * クリップボードにテキストをコピー
 * @param {string} text - コピーするテキスト
 * @returns {Promise<boolean>} コピー成功・失敗
 */
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error("Clipboard API failed:", error);
    
    // Fallback: try using the older execCommand method
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

module.exports = {
  generateCSSSelector,
  getSelectionInfo,
  formatForAI,
  showNotification,
  copyToClipboard
};