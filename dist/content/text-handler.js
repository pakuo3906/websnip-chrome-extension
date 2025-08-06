// Text selection handler for WebSnip Chrome Extension
import { getSelectionInfo, formatForAI, copyToClipboard, showNotification } from './utils.js';

/**
 * テキスト選択時のメイン処理
 * Chrome拡張のexecuteScriptから呼び出される関数
 */
export async function handleTextSelection() {
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