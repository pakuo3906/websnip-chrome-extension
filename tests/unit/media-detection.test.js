// Media element detection tests (TDD - Red Phase)
// Testing image, video, audio, and link detection functionality

import { getElementType, getMediaInfo } from '../../src/content/media-handler.js';

describe('Media Element Detection', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  describe('getElementType', () => {
    test('should detect img elements', () => {
      const img = document.createElement('img');
      img.src = 'test.jpg';
      img.alt = 'Test image';
      
      expect(getElementType(img)).toBe('image');
    });

    test('should detect video elements', () => {
      const video = document.createElement('video');
      video.src = 'test.mp4';
      
      expect(getElementType(video)).toBe('video');
    });

    test('should detect audio elements', () => {
      const audio = document.createElement('audio');
      audio.src = 'test.mp3';
      
      expect(getElementType(audio)).toBe('audio');
    });

    test('should detect link elements', () => {
      const link = document.createElement('a');
      link.href = 'https://example.com';
      link.textContent = 'Test link';
      
      expect(getElementType(link)).toBe('link');
    });

    test('should detect text selection as text', () => {
      const p = document.createElement('p');
      p.textContent = 'Some text content';
      
      expect(getElementType(p)).toBe('text');
    });

    test('should handle null elements', () => {
      expect(getElementType(null)).toBe('unknown');
    });

    test('should handle undefined elements', () => {
      expect(getElementType(undefined)).toBe('unknown');
    });

    test('should detect picture elements as image', () => {
      const picture = document.createElement('picture');
      const img = document.createElement('img');
      picture.appendChild(img);
      
      expect(getElementType(picture)).toBe('image');
    });

    test('should detect iframe with video content as video', () => {
      const iframe = document.createElement('iframe');
      iframe.src = 'https://www.youtube.com/embed/dQw4w9WgXcQ';
      
      expect(getElementType(iframe)).toBe('video');
    });

    test('should detect iframe with non-video content as link', () => {
      const iframe = document.createElement('iframe');
      iframe.src = 'https://example.com/page';
      
      expect(getElementType(iframe)).toBe('link');
    });
  });

  describe('getMediaInfo', () => {
    describe('Image information extraction', () => {
      test('should extract basic image information', () => {
        const img = document.createElement('img');
        img.src = 'https://example.com/test.jpg';
        img.alt = 'Test image';
        img.width = 800;
        img.height = 600;
        
        const info = getMediaInfo(img);
        
        expect(info.type).toBe('image');
        expect(info.url).toBe('https://example.com/test.jpg');
        expect(info.alt).toBe('Test image');
        expect(info.width).toBe(800);
        expect(info.height).toBe(600);
      });

      test('should handle images without alt text', () => {
        const img = document.createElement('img');
        img.src = 'test.png';
        
        const info = getMediaInfo(img);
        
        expect(info.alt).toBe('');
      });

      test('should detect image file format from URL', () => {
        const extensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
        
        extensions.forEach(ext => {
          const img = document.createElement('img');
          img.src = `test.${ext}`;
          
          const info = getMediaInfo(img);
          expect(info.format).toBe(ext.toLowerCase());
        });
      });

      test('should handle images with data URLs', () => {
        const img = document.createElement('img');
        img.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';
        
        const info = getMediaInfo(img);
        
        expect(info.type).toBe('image');
        expect(info.format).toBe('png');
        expect(info.url).toContain('data:image');
      });
    });

    describe('Video information extraction', () => {
      test('should extract basic video information', () => {
        const video = document.createElement('video');
        video.src = 'https://example.com/test.mp4';
        video.poster = 'https://example.com/poster.jpg';
        video.duration = 120; // 2 minutes
        video.videoWidth = 1920;
        video.videoHeight = 1080;
        
        const info = getMediaInfo(video);
        
        expect(info.type).toBe('video');
        expect(info.url).toBe('https://example.com/test.mp4');
        expect(info.poster).toBe('https://example.com/poster.jpg');
        expect(info.duration).toBe(120);
        expect(info.width).toBe(1920);
        expect(info.height).toBe(1080);
      });

      test('should handle YouTube iframe embeds', () => {
        const iframe = document.createElement('iframe');
        iframe.src = 'https://www.youtube.com/embed/dQw4w9WgXcQ';
        iframe.width = 560;
        iframe.height = 315;
        
        const info = getMediaInfo(iframe);
        
        expect(info.type).toBe('video');
        expect(info.platform).toBe('youtube');
        expect(info.videoId).toBe('dQw4w9WgXcQ');
        expect(info.width).toBe(560);
        expect(info.height).toBe(315);
      });

      test('should detect video file format', () => {
        const formats = ['mp4', 'webm', 'ogg', 'avi', 'mov'];
        
        formats.forEach(format => {
          const video = document.createElement('video');
          video.src = `test.${format}`;
          
          const info = getMediaInfo(video);
          expect(info.format).toBe(format.toLowerCase());
        });
      });
    });

    describe('Audio information extraction', () => {
      test('should extract basic audio information', () => {
        const audio = document.createElement('audio');
        audio.src = 'https://example.com/test.mp3';
        audio.duration = 180; // 3 minutes
        
        const info = getMediaInfo(audio);
        
        expect(info.type).toBe('audio');
        expect(info.url).toBe('https://example.com/test.mp3');
        expect(info.duration).toBe(180);
        expect(info.format).toBe('mp3');
      });

      test('should handle audio without duration', () => {
        const audio = document.createElement('audio');
        audio.src = 'test.wav';
        // duration is NaN for unloaded audio
        
        const info = getMediaInfo(audio);
        
        expect(info.duration).toBe('unknown');
      });
    });

    describe('Link information extraction', () => {
      test('should extract basic link information', () => {
        const link = document.createElement('a');
        link.href = 'https://example.com/page';
        link.textContent = 'Example Link';
        link.title = 'Go to example page';
        
        const info = getMediaInfo(link);
        
        expect(info.type).toBe('link');
        expect(info.url).toBe('https://example.com/page');
        expect(info.text).toBe('Example Link');
        expect(info.title).toBe('Go to example page');
      });

      test('should handle links without title or text', () => {
        const link = document.createElement('a');
        link.href = 'https://example.com';
        
        const info = getMediaInfo(link);
        
        expect(info.text).toBe('');
        expect(info.title).toBe('');
      });
    });

    describe('Error handling', () => {
      test('should handle null elements gracefully', () => {
        expect(() => getMediaInfo(null)).not.toThrow();
        
        const info = getMediaInfo(null);
        expect(info.type).toBe('unknown');
      });

      test('should handle unsupported element types', () => {
        const div = document.createElement('div');
        div.textContent = 'Regular content';
        
        const info = getMediaInfo(div);
        
        expect(info.type).toBe('text');
        expect(info.content).toBe('Regular content');
      });
    });
  });
});