// Media formatting tests for AI output
// TDD for formatting different media types

const { formatMediaForAI, formatDuration } = require('../../src/content/media-formatter.js');

describe('Media Formatting for AI', () => {
  describe('formatMediaForAI', () => {
    test('should format image information correctly', () => {
      const imageInfo = {
        type: 'image',
        url: 'https://example.com/photo.jpg',
        alt: 'Beautiful landscape',
        width: 1920,
        height: 1080,
        format: 'jpg'
      };
      const pageUrl = 'https://example.com/gallery';
      const cssSelector = 'html > body > main > img:nth-of-type(3)';

      const result = formatMediaForAI(imageInfo, pageUrl, cssSelector);

      expect(result).toContain('要素タイプ: 画像');
      expect(result).toContain('URL: https://example.com/photo.jpg');
      expect(result).toContain('説明: Beautiful landscape');
      expect(result).toContain('サイズ: 1920x1080');
      expect(result).toContain('形式: jpg');
      expect(result).toContain('ページURL:\nhttps://example.com/gallery');
      expect(result).toContain('構造的な位置:\nhtml > body > main > img:nth-of-type(3)');
      expect(result).toContain('指示:');
    });

    test('should format video information correctly', () => {
      const videoInfo = {
        type: 'video',
        url: 'https://example.com/movie.mp4',
        poster: 'https://example.com/poster.jpg',
        duration: 120,
        width: 1280,
        height: 720,
        format: 'mp4'
      };
      const pageUrl = 'https://example.com/videos';
      const cssSelector = 'html > body > video';

      const result = formatMediaForAI(videoInfo, pageUrl, cssSelector);

      expect(result).toContain('要素タイプ: 動画');
      expect(result).toContain('URL: https://example.com/movie.mp4');
      expect(result).toContain('ポスター: https://example.com/poster.jpg');
      expect(result).toContain('長さ: 2分0秒');
      expect(result).toContain('サイズ: 1280x720');
      expect(result).toContain('形式: mp4');
    });

    test('should format YouTube video correctly', () => {
      const youtubeInfo = {
        type: 'video',
        url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        platform: 'youtube',
        videoId: 'dQw4w9WgXcQ',
        width: 560,
        height: 315,
        format: 'embed'
      };
      const pageUrl = 'https://example.com/article';
      const cssSelector = 'html > body > iframe';

      const result = formatMediaForAI(youtubeInfo, pageUrl, cssSelector);

      expect(result).toContain('要素タイプ: 動画');
      expect(result).toContain('プラットフォーム: YouTube');
      expect(result).toContain('動画ID: dQw4w9WgXcQ');
      expect(result).toContain('形式: embed');
    });

    test('should format audio information correctly', () => {
      const audioInfo = {
        type: 'audio',
        url: 'https://example.com/song.mp3',
        duration: 180,
        format: 'mp3'
      };
      const pageUrl = 'https://example.com/music';
      const cssSelector = 'html > body > audio';

      const result = formatMediaForAI(audioInfo, pageUrl, cssSelector);

      expect(result).toContain('要素タイプ: 音声');
      expect(result).toContain('URL: https://example.com/song.mp3');
      expect(result).toContain('長さ: 3分0秒');
      expect(result).toContain('形式: mp3');
    });

    test('should format link information correctly', () => {
      const linkInfo = {
        type: 'link',
        url: 'https://example.com/article',
        text: 'Read more about this topic',
        title: 'Interesting article'
      };
      const pageUrl = 'https://example.com/news';
      const cssSelector = 'html > body > a:nth-of-type(5)';

      const result = formatMediaForAI(linkInfo, pageUrl, cssSelector);

      expect(result).toContain('要素タイプ: リンク');
      expect(result).toContain('URL: https://example.com/article');
      expect(result).toContain('テキスト: Read more about this topic');
      expect(result).toContain('タイトル: Interesting article');
    });

    test('should handle missing information gracefully', () => {
      const incompleteInfo = {
        type: 'image',
        url: 'https://example.com/image.png',
        alt: '',
        width: 0,
        height: 0,
        format: 'unknown'
      };
      const pageUrl = 'https://example.com';
      const cssSelector = 'html > body > img';

      const result = formatMediaForAI(incompleteInfo, pageUrl, cssSelector);

      expect(result).toContain('要素タイプ: 画像');
      expect(result).toContain('説明: (なし)');
      expect(result).toContain('サイズ: 不明');
      expect(result).toContain('形式: 不明');
    });

    test('should handle text content', () => {
      const textInfo = {
        type: 'text',
        content: 'Selected text content from the page'
      };
      const pageUrl = 'https://example.com/page';
      const cssSelector = 'html > body > p:nth-of-type(2)';

      const result = formatMediaForAI(textInfo, pageUrl, cssSelector);

      expect(result).toContain('選択テキスト:\nSelected text content from the page');
      expect(result).toContain('ページURL:\nhttps://example.com/page');
      expect(result).toContain('構造的な位置:\nhtml > body > p:nth-of-type(2)');
    });
  });

  describe('formatDuration', () => {
    test('should format seconds correctly', () => {
      expect(formatDuration(45)).toBe('0分45秒');
      expect(formatDuration(30)).toBe('0分30秒');
    });

    test('should format minutes and seconds correctly', () => {
      expect(formatDuration(90)).toBe('1分30秒');
      expect(formatDuration(120)).toBe('2分0秒');
      expect(formatDuration(185)).toBe('3分5秒');
    });

    test('should format hours, minutes and seconds correctly', () => {
      expect(formatDuration(3661)).toBe('1時間1分1秒');
      expect(formatDuration(3600)).toBe('1時間0分0秒');
      expect(formatDuration(7265)).toBe('2時間1分5秒');
    });

    test('should handle edge cases', () => {
      expect(formatDuration(0)).toBe('0分0秒');
      expect(formatDuration(NaN)).toBe('不明');
      expect(formatDuration(undefined)).toBe('不明');
      expect(formatDuration(null)).toBe('不明');
      expect(formatDuration('unknown')).toBe('不明');
    });

    test('should handle negative durations', () => {
      expect(formatDuration(-10)).toBe('不明');
      expect(formatDuration(-100)).toBe('不明');
    });

    test('should handle very large durations', () => {
      const longDuration = 25 * 3600 + 30 * 60 + 45; // 25 hours 30 minutes 45 seconds
      expect(formatDuration(longDuration)).toBe('25時間30分45秒');
    });
  });

  describe('Size formatting', () => {
    test('should format dimensions correctly in formatMediaForAI', () => {
      const testCases = [
        { width: 1920, height: 1080, expected: '1920x1080' },
        { width: 800, height: 600, expected: '800x600' },
        { width: 0, height: 0, expected: '不明' },
        { width: 1920, height: 0, expected: '不明' },
        { width: undefined, height: undefined, expected: '不明' }
      ];

      testCases.forEach(({ width, height, expected }) => {
        const mediaInfo = {
          type: 'image',
          url: 'test.jpg',
          width: width,
          height: height
        };

        const result = formatMediaForAI(mediaInfo, 'https://example.com', 'img');
        expect(result).toContain(`サイズ: ${expected}`);
      });
    });
  });
});