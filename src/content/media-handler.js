// Media element handler for WebSnip Chrome Extension
// TDD implementation - Green Phase

/**
 * 要素のタイプを判定
 * @param {Element} element - 判定対象の要素
 * @returns {string} 要素タイプ ('image', 'video', 'audio', 'link', 'text', 'unknown')
 */
function getElementType(element) {
  if (!element) {
    return 'unknown';
  }

  const tagName = element.tagName?.toLowerCase();

  switch (tagName) {
    case 'img':
      return 'image';
    
    case 'picture':
      return 'image';
    
    case 'video':
      return 'video';
    
    case 'audio':
      return 'audio';
    
    case 'a':
      return 'link';
    
    case 'iframe':
      // YouTube やその他の動画プラットフォームを検出
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

/**
 * メディア要素から情報を抽出
 * @param {Element} element - 対象要素
 * @returns {Object} メディア情報
 */
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

/**
 * 画像情報を抽出
 * @param {HTMLImageElement|HTMLPictureElement} element
 * @returns {Object} 画像情報
 */
function extractImageInfo(element) {
  let img = element;
  
  // picture要素の場合、内部のimg要素を取得
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

/**
 * 動画情報を抽出
 * @param {HTMLVideoElement|HTMLIFrameElement} element
 * @returns {Object} 動画情報
 */
function extractVideoInfo(element) {
  if (element.tagName.toLowerCase() === 'iframe') {
    return extractIframeVideoInfo(element);
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

/**
 * iframe内の動画情報を抽出
 * @param {HTMLIFrameElement} iframe
 * @returns {Object} 動画情報
 */
function extractIframeVideoInfo(iframe) {
  const src = iframe.src || '';
  let platform = 'unknown';
  let videoId = '';

  // YouTube
  if (src.includes('youtube.com') || src.includes('youtu.be')) {
    platform = 'youtube';
    const match = src.match(/(?:embed\/|v=|youtu\.be\/)([^&\n?#]+)/);
    videoId = match ? match[1] : '';
  }
  // Vimeo
  else if (src.includes('vimeo.com')) {
    platform = 'vimeo';
    const match = src.match(/vimeo\.com\/(?:video\/)?(\d+)/);
    videoId = match ? match[1] : '';
  }

  return {
    type: 'video',
    url: src,
    platform: platform,
    videoId: videoId,
    width: parseInt(iframe.width) || 0,
    height: parseInt(iframe.height) || 0,
    format: 'embed'
  };
}

/**
 * 音声情報を抽出
 * @param {HTMLAudioElement} element
 * @returns {Object} 音声情報
 */
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

/**
 * リンク情報を抽出
 * @param {HTMLAnchorElement} element
 * @returns {Object} リンク情報
 */
function extractLinkInfo(element) {
  return {
    type: 'link',
    url: element.href || '',
    text: element.textContent?.trim() || '',
    title: element.title || ''
  };
}

/**
 * テキスト情報を抽出
 * @param {Element} element
 * @returns {Object} テキスト情報
 */
function extractTextInfo(element) {
  return {
    type: 'text',
    content: element.textContent?.trim() || ''
  };
}

/**
 * URLからファイル形式を抽出
 * @param {string} url
 * @param {string} mediaType - 'image', 'video', 'audio'
 * @returns {string} ファイル形式
 */
function extractFormatFromUrl(url, mediaType) {
  if (!url) return 'unknown';

  // データURLの場合
  if (url.startsWith('data:')) {
    const match = url.match(/data:(\w+)\/(\w+)/);
    return match ? match[2].toLowerCase() : 'unknown';
  }

  // 通常のURLからファイル拡張子を抽出
  const match = url.match(/\.([^.?#]+)(?:\?|#|$)/);
  if (!match) return 'unknown';

  const extension = match[1].toLowerCase();

  // メディアタイプに応じた検証
  const validFormats = {
    image: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico'],
    video: ['mp4', 'webm', 'ogg', 'ogv', 'avi', 'mov', 'wmv', 'flv', 'mkv'],
    audio: ['mp3', 'wav', 'ogg', 'oga', 'aac', 'flac', 'm4a', 'wma']
  };

  const formats = validFormats[mediaType] || [];
  return formats.includes(extension) ? extension : 'unknown';
}

module.exports = {
  getElementType,
  getMediaInfo,
  extractImageInfo,
  extractVideoInfo,
  extractAudioInfo,
  extractLinkInfo,
  extractTextInfo,
  extractFormatFromUrl
};