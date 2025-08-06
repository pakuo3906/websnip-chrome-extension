// Media formatter for AI-friendly output
// TDD Green Phase - Formatting media information for AI tools

/**
 * メディア情報をAI向けフォーマットで整形
 * @param {Object} mediaInfo - メディア情報オブジェクト
 * @param {string} pageUrl - ページURL
 * @param {string} cssSelector - CSS selector
 * @returns {string} フォーマット済みテキスト
 */
function formatMediaForAI(mediaInfo, pageUrl, cssSelector) {
  if (!mediaInfo || !mediaInfo.type) {
    return `要素タイプ: 不明

ページURL:
${pageUrl}

構造的な位置:
${cssSelector}

指示:`;
  }

  switch (mediaInfo.type) {
    case 'image':
      return formatImageForAI(mediaInfo, pageUrl, cssSelector);
    
    case 'video':
      return formatVideoForAI(mediaInfo, pageUrl, cssSelector);
    
    case 'audio':
      return formatAudioForAI(mediaInfo, pageUrl, cssSelector);
    
    case 'link':
      return formatLinkForAI(mediaInfo, pageUrl, cssSelector);
    
    case 'text':
      return formatTextForAI(mediaInfo, pageUrl, cssSelector);
    
    default:
      return formatUnknownForAI(mediaInfo, pageUrl, cssSelector);
  }
}

/**
 * 画像情報をフォーマット
 */
function formatImageForAI(imageInfo, pageUrl, cssSelector) {
  const alt = imageInfo.alt || '(なし)';
  const size = formatSize(imageInfo.width, imageInfo.height);
  const format = imageInfo.format === 'unknown' ? '不明' : imageInfo.format;

  return `要素タイプ: 画像

要素情報:
- URL: ${imageInfo.url}
- 説明: ${alt}
- サイズ: ${size}
- 形式: ${format}

ページURL:
${pageUrl}

構造的な位置:
${cssSelector}

指示:`;
}

/**
 * 動画情報をフォーマット
 */
function formatVideoForAI(videoInfo, pageUrl, cssSelector) {
  let videoDetails = `- URL: ${videoInfo.url}`;
  
  if (videoInfo.platform) {
    const platformName = videoInfo.platform === 'youtube' ? 'YouTube' : 
                        videoInfo.platform === 'vimeo' ? 'Vimeo' : videoInfo.platform;
    videoDetails += `\n- プラットフォーム: ${platformName}`;
    
    if (videoInfo.videoId) {
      videoDetails += `\n- 動画ID: ${videoInfo.videoId}`;
    }
  }
  
  if (videoInfo.poster) {
    videoDetails += `\n- ポスター: ${videoInfo.poster}`;
  }
  
  if (videoInfo.duration !== undefined && videoInfo.duration !== 0) {
    const duration = formatDuration(videoInfo.duration);
    videoDetails += `\n- 長さ: ${duration}`;
  }
  
  const size = formatSize(videoInfo.width, videoInfo.height);
  videoDetails += `\n- サイズ: ${size}`;
  
  const format = videoInfo.format === 'unknown' ? '不明' : videoInfo.format;
  videoDetails += `\n- 形式: ${format}`;

  return `要素タイプ: 動画

要素情報:
${videoDetails}

ページURL:
${pageUrl}

構造的な位置:
${cssSelector}

指示:`;
}

/**
 * 音声情報をフォーマット
 */
function formatAudioForAI(audioInfo, pageUrl, cssSelector) {
  let audioDetails = `- URL: ${audioInfo.url}`;
  
  if (audioInfo.duration !== undefined && audioInfo.duration !== 'unknown') {
    const duration = formatDuration(audioInfo.duration);
    audioDetails += `\n- 長さ: ${duration}`;
  }
  
  const format = audioInfo.format === 'unknown' ? '不明' : audioInfo.format;
  audioDetails += `\n- 形式: ${format}`;

  return `要素タイプ: 音声

要素情報:
${audioDetails}

ページURL:
${pageUrl}

構造的な位置:
${cssSelector}

指示:`;
}

/**
 * リンク情報をフォーマット
 */
function formatLinkForAI(linkInfo, pageUrl, cssSelector) {
  const text = linkInfo.text || '(なし)';
  const title = linkInfo.title || '(なし)';

  return `要素タイプ: リンク

要素情報:
- URL: ${linkInfo.url}
- テキスト: ${text}
- タイトル: ${title}

ページURL:
${pageUrl}

構造的な位置:
${cssSelector}

指示:`;
}

/**
 * テキスト情報をフォーマット（既存のテキスト選択機能との互換性）
 */
function formatTextForAI(textInfo, pageUrl, cssSelector) {
  return `選択テキスト:
${textInfo.content}

ページURL:
${pageUrl}

構造的な位置:
${cssSelector}

指示:`;
}

/**
 * 不明な要素をフォーマット
 */
function formatUnknownForAI(mediaInfo, pageUrl, cssSelector) {
  return `要素タイプ: 不明

ページURL:
${pageUrl}

構造的な位置:
${cssSelector}

指示:`;
}

/**
 * 時間を日本語形式でフォーマット
 * @param {number|string} duration - 秒数
 * @returns {string} フォーマット済み時間
 */
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

/**
 * サイズをフォーマット
 * @param {number} width - 幅
 * @param {number} height - 高さ
 * @returns {string} フォーマット済みサイズ
 */
function formatSize(width, height) {
  if (!width || !height || width === 0 || height === 0) {
    return '不明';
  }
  return `${width}x${height}`;
}

module.exports = {
  formatMediaForAI,
  formatDuration,
  formatSize
};