// Chrome Extension: WebSnip
// Background service worker with media support (images, videos, audio, links)

// Create context menu when extension is installed
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "copyAIFormatted",
    title: "AI用にコピー",
    contexts: ["selection", "image", "video", "audio", "link"]
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "copyAIFormatted") {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      // 全機能をインライン実装（Chrome拡張の制限のため）
      function: () => {
        // === Video Site Detection Functions ===
        
        function isVideoSite() {
          const hostname = window.location.hostname.toLowerCase();
          const videoSiteDomains = [
            'youtube.com', 'youtu.be',
            'nicovideo.jp', 'abema.tv', 'tver.jp', 'gyao.yahoo.co.jp',
            'netflix.com', 'primevideo.com', 'amazon.com', 'amazon.co.jp',
            'hulu.com', 'hulu.jp', 'disneyplus.com',
            'vimeo.com', 'dailymotion.com', 'tiktok.com', 'twitch.tv',
            'bilibili.com'
          ];
          
          return videoSiteDomains.some(domain => hostname.includes(domain));
        }
        
        function isVideoLink(element) {
          const link = element.closest('a');
          if (!link || !link.href) return false;
          
          const videoUrlPatterns = [
            // YouTube系
            /youtube\.com\/watch\?v=/,
            /youtu\.be\//,
            /youtube\.com\/shorts\//,
            
            // 日本の動画サイト
            /nicovideo\.jp\/watch\//,
            /abema\.tv\/channels\//,
            /abema\.tv\/video\//,
            /tver\.jp\/episode\//,
            /gyao\.yahoo\.co\.jp\/player\//,
            
            // 海外配信サービス
            /netflix\.com\/watch\//,
            /netflix\.com\/title\//,
            /amazon\.(com|co\.jp)\/gp\/video\//,
            /primevideo\.com\//,
            /hulu\.(com|jp)\/watch\//,
            /disneyplus\.com\/video\//,
            
            // その他動画サイト
            /vimeo\.com\/\d+/,
            /dailymotion\.com\/video\//,
            /tiktok\.com\/@[\w.]+\/video\/\d+/,
            /twitch\.tv\/videos\//,
            /bilibili\.com\/video\//,
          ];
          
          return videoUrlPatterns.some(pattern => pattern.test(link.href));
        }
        
        function getVideoUrl(element) {
          const link = element.closest('a');
          if (link && isVideoLink(element)) {
            return link.href;
          }
          return window.location.href;
        }
        
        function shouldLimitTextSelection(element) {
          return isVideoSite() || isVideoLink(element);
        }
        
        function limitTextLength(text, maxLength = 500) {
          if (!text || text.length <= maxLength) return text;
          return text.substring(0, maxLength) + '...（省略）';
        }
        
        // === Utility Functions ===
        
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

        // === Media Detection Functions ===
        
        function getElementType(element) {
          if (!element) {
            return 'unknown';
          }

          const tagName = element.tagName?.toLowerCase();

          switch (tagName) {
            case 'img':
            case 'picture':
              return 'image';
            case 'video':
              return 'video';
            case 'audio':
              return 'audio';
            case 'a':
              return 'link';
            case 'iframe':
              const src = element.src || '';
              if (src.includes('youtube.com') || src.includes('youtu.be') || 
                  src.includes('vimeo.com') || src.includes('dailymotion.com')) {
                return 'video';
              }
              return 'link';
            default:
              return 'text';
          }
        }

        function extractFormatFromUrl(url, mediaType) {
          if (!url) return 'unknown';

          if (url.startsWith('data:')) {
            const match = url.match(/data:(\w+)\/(\w+)/);
            return match ? match[2].toLowerCase() : 'unknown';
          }

          const match = url.match(/\.([^.?#]+)(?:\?|#|$)/);
          if (!match) return 'unknown';

          const extension = match[1].toLowerCase();
          const validFormats = {
            image: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico'],
            video: ['mp4', 'webm', 'ogg', 'ogv', 'avi', 'mov', 'wmv', 'flv', 'mkv'],
            audio: ['mp3', 'wav', 'ogg', 'oga', 'aac', 'flac', 'm4a', 'wma']
          };

          const formats = validFormats[mediaType] || [];
          return formats.includes(extension) ? extension : 'unknown';
        }

        function getMediaInfo(element) {
          if (!element) {
            return { type: 'unknown' };
          }

          const elementType = getElementType(element);

          switch (elementType) {
            case 'image':
              return extractImageInfo(element);
            case 'video':
              return extractVideoInfo(element);
            case 'audio':
              return extractAudioInfo(element);
            case 'link':
              return extractLinkInfo(element);
            case 'text':
              return extractTextInfo(element);
            default:
              return { type: 'unknown' };
          }
        }

        function extractImageInfo(element) {
          let img = element;
          
          if (element.tagName.toLowerCase() === 'picture') {
            img = element.querySelector('img');
            if (!img) {
              return { type: 'image', url: '', alt: '', width: 0, height: 0, format: 'unknown' };
            }
          }

          const src = img.src || img.currentSrc || '';
          const format = extractFormatFromUrl(src, 'image');

          return {
            type: 'image',
            url: src,
            alt: img.alt || '',
            width: img.width || img.naturalWidth || 0,
            height: img.height || img.naturalHeight || 0,
            format: format
          };
        }

        function extractVideoInfo(element) {
          if (element.tagName.toLowerCase() === 'iframe') {
            const src = element.src || '';
            let platform = 'unknown';
            let videoId = '';

            if (src.includes('youtube.com') || src.includes('youtu.be')) {
              platform = 'youtube';
              const match = src.match(/(?:embed\/|v=|youtu\.be\/)([^&\n?#]+)/);
              videoId = match ? match[1] : '';
            } else if (src.includes('vimeo.com')) {
              platform = 'vimeo';
              const match = src.match(/vimeo\.com\/(?:video\/)?(\d+)/);
              videoId = match ? match[1] : '';
            }

            return {
              type: 'video',
              url: src,
              platform: platform,
              videoId: videoId,
              width: parseInt(element.width) || 0,
              height: parseInt(element.height) || 0,
              format: 'embed'
            };
          }

          const src = element.src || element.currentSrc || '';
          const format = extractFormatFromUrl(src, 'video');

          return {
            type: 'video',
            url: src,
            poster: element.poster || '',
            duration: element.duration || 0,
            width: element.videoWidth || element.width || 0,
            height: element.videoHeight || element.height || 0,
            format: format
          };
        }

        function extractAudioInfo(element) {
          const src = element.src || element.currentSrc || '';
          const format = extractFormatFromUrl(src, 'audio');
          const duration = element.duration;

          return {
            type: 'audio',
            url: src,
            duration: isNaN(duration) ? 'unknown' : duration,
            format: format
          };
        }

        function extractLinkInfo(element) {
          return {
            type: 'link',
            url: element.href || '',
            text: element.textContent?.trim() || '',
            title: element.title || ''
          };
        }

        function extractTextInfo(element) {
          return {
            type: 'text',
            content: element.textContent?.trim() || ''
          };
        }

        // === Formatting Functions ===
        
        function formatDuration(duration) {
          if (duration === 'unknown' || duration === null || duration === undefined || 
              isNaN(duration) || duration < 0) {
            return '不明';
          }

          const totalSeconds = Math.floor(duration);
          const hours = Math.floor(totalSeconds / 3600);
          const minutes = Math.floor((totalSeconds % 3600) / 60);
          const seconds = totalSeconds % 60;

          if (hours > 0) {
            return `${hours}時間${minutes}分${seconds}秒`;
          } else {
            return `${minutes}分${seconds}秒`;
          }
        }

        function formatSize(width, height) {
          if (!width || !height || width === 0 || height === 0) {
            return '不明';
          }
          return `${width}x${height}`;
        }

        function formatMediaForAI(mediaInfo, pageUrl, cssSelector) {
          if (!mediaInfo || !mediaInfo.type) {
            return `要素タイプ: 不明\n\nページURL:\n${pageUrl}\n\n構造的な位置:\n${cssSelector}\n\n指示:`;
          }

          switch (mediaInfo.type) {
            case 'image':
              const alt = mediaInfo.alt || '(なし)';
              const size = formatSize(mediaInfo.width, mediaInfo.height);
              const format = mediaInfo.format === 'unknown' ? '不明' : mediaInfo.format;
              
              return `要素タイプ: 画像\n\n要素情報:\n- URL: ${mediaInfo.url}\n- 説明: ${alt}\n- サイズ: ${size}\n- 形式: ${format}\n\nページURL:\n${pageUrl}\n\n構造的な位置:\n${cssSelector}\n\n指示:`;
            
            case 'video':
              let videoDetails = `- URL: ${mediaInfo.url}`;
              
              if (mediaInfo.platform) {
                const platformName = mediaInfo.platform === 'youtube' ? 'YouTube' : 
                                    mediaInfo.platform === 'vimeo' ? 'Vimeo' : mediaInfo.platform;
                videoDetails += `\n- プラットフォーム: ${platformName}`;
                
                if (mediaInfo.videoId) {
                  videoDetails += `\n- 動画ID: ${mediaInfo.videoId}`;
                }
              }
              
              if (mediaInfo.poster) {
                videoDetails += `\n- ポスター: ${mediaInfo.poster}`;
              }
              
              if (mediaInfo.duration !== undefined && mediaInfo.duration !== 0) {
                const duration = formatDuration(mediaInfo.duration);
                videoDetails += `\n- 長さ: ${duration}`;
              }
              
              const videoSize = formatSize(mediaInfo.width, mediaInfo.height);
              videoDetails += `\n- サイズ: ${videoSize}`;
              
              const videoFormat = mediaInfo.format === 'unknown' ? '不明' : mediaInfo.format;
              videoDetails += `\n- 形式: ${videoFormat}`;

              return `要素タイプ: 動画\n\n要素情報:\n${videoDetails}\n\nページURL:\n${pageUrl}\n\n構造的な位置:\n${cssSelector}\n\n指示:`;
            
            case 'audio':
              let audioDetails = `- URL: ${mediaInfo.url}`;
              
              if (mediaInfo.duration !== undefined && mediaInfo.duration !== 'unknown') {
                const duration = formatDuration(mediaInfo.duration);
                audioDetails += `\n- 長さ: ${duration}`;
              }
              
              const audioFormat = mediaInfo.format === 'unknown' ? '不明' : mediaInfo.format;
              audioDetails += `\n- 形式: ${audioFormat}`;

              return `要素タイプ: 音声\n\n要素情報:\n${audioDetails}\n\nページURL:\n${pageUrl}\n\n構造的な位置:\n${cssSelector}\n\n指示:`;
            
            case 'link':
              const text = mediaInfo.text || '(なし)';
              const title = mediaInfo.title || '(なし)';

              return `要素タイプ: リンク\n\n要素情報:\n- URL: ${mediaInfo.url}\n- テキスト: ${text}\n- タイトル: ${title}\n\nページURL:\n${pageUrl}\n\n構造的な位置:\n${cssSelector}\n\n指示:`;
            
            case 'text':
              return `選択テキスト:\n${mediaInfo.content}\n\nページURL:\n${pageUrl}\n\n構造的な位置:\n${cssSelector}\n\n指示:`;
            
            default:
              return `要素タイプ: 不明\n\nページURL:\n${pageUrl}\n\n構造的な位置:\n${cssSelector}\n\n指示:`;
          }
        }

        // === Clipboard and Notification Functions ===
        
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

        // === Main Handler ===
        
        async function handleElementAction() {
          try {
            let targetElement = null;
            let mediaInfo = null;

            // 選択されたテキストがある場合
            const selection = window.getSelection();
            let selectedText = selection.toString().trim();
            
            if (selectedText) {
              const range = selection.getRangeAt(0);
              targetElement = range.commonAncestorContainer.nodeType === Node.TEXT_NODE
                ? range.commonAncestorContainer.parentElement
                : range.commonAncestorContainer;
              
              // 動画サイトではテキスト選択を制限
              if (shouldLimitTextSelection(targetElement)) {
                selectedText = limitTextLength(selectedText);
              }
              
              mediaInfo = {
                type: 'text',
                content: selectedText
              };
            } else {
              // 右クリックされた要素を検出（近似）
              // 注：executeScriptでは正確な右クリック対象を取得できないため、
              // 最近の要素イベントやhoverされた要素を推測
              const hovered = document.querySelectorAll(':hover');
              targetElement = hovered[hovered.length - 1];
              
              if (targetElement) {
                mediaInfo = getMediaInfo(targetElement);
              }
            }

            if (!targetElement || !mediaInfo) {
              alert("要素を検出できませんでした。テキストを選択するか、画像・動画・リンクを右クリックしてください。");
              return;
            }

            const cssSelector = generateCSSSelector(targetElement);
            const currentUrl = getVideoUrl(targetElement);
            const formattedOutput = formatMediaForAI(mediaInfo, currentUrl, cssSelector);

            const copySuccess = await copyToClipboard(formattedOutput);
            
            if (copySuccess) {
              showNotification("AI用フォーマットでコピーしました！", "success");
              console.log("Copied to clipboard for AI:", formattedOutput);
            } else {
              showNotification("クリップボードへのコピーに失敗しました。", "error");
              alert("コピーに失敗しました。HTTPSサイトで試してください。");
            }

          } catch (error) {
            console.error("Error in handleElementAction:", error);
            showNotification("エラーが発生しました。", "error");
            alert("エラーが発生しました: " + error.message);
          }
        }

        // 実行
        handleElementAction();
      }
    });
  }
});