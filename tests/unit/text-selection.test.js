// Text selection functionality tests
// TDD approach for selection detection and formatting

const { getSelectionInfo, formatForAI } = require('../../src/content/utils.js');

describe('Text Selection', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    jest.clearAllMocks();
  });

  describe('getSelectionInfo', () => {
    test('should return null when no text is selected', () => {
      // Mock empty selection
      window.getSelection = jest.fn(() => ({
        toString: () => '',
        getRangeAt: jest.fn()
      }));

      const result = getSelectionInfo();
      expect(result).toBeNull();
    });

    test('should return null when only whitespace is selected', () => {
      window.getSelection = jest.fn(() => ({
        toString: () => '   \n\t   ',
        getRangeAt: jest.fn()
      }));

      const result = getSelectionInfo();
      expect(result).toBeNull();
    });

    test('should return selection info for valid text selection', () => {
      const p = document.createElement('p');
      p.textContent = 'Test paragraph content';
      document.body.appendChild(p);

      window.getSelection = jest.fn(() => ({
        toString: () => 'Test paragraph',
        getRangeAt: () => ({
          commonAncestorContainer: {
            nodeType: Node.TEXT_NODE,
            parentElement: p
          }
        })
      }));

      const result = getSelectionInfo();
      
      expect(result).not.toBeNull();
      expect(result.text).toBe('Test paragraph');
      expect(result.element).toBe(p);
      expect(result.cssSelector).toBe('html > body > p');
    });

    test('should handle element node as commonAncestorContainer', () => {
      const div = document.createElement('div');
      div.innerHTML = '<p>First paragraph</p><p>Second paragraph</p>';
      document.body.appendChild(div);

      window.getSelection = jest.fn(() => ({
        toString: () => 'selected text across paragraphs',
        getRangeAt: () => ({
          commonAncestorContainer: div // Element node directly
        })
      }));

      const result = getSelectionInfo();
      
      expect(result).not.toBeNull();
      expect(result.element).toBe(div);
      expect(result.cssSelector).toBe('html > body > div');
    });
  });

  describe('formatForAI', () => {
    test('should format text correctly for AI', () => {
      const selectedText = 'This is selected text';
      const url = 'https://example.com/page';
      const selector = 'html > body > article > p:nth-of-type(2)';

      const result = formatForAI(selectedText, url, selector);

      expect(result).toBe(`選択テキスト：
This is selected text

ページURL：
https://example.com/page

構造的な位置：
html > body > article > p:nth-of-type(2)

指示：`);
    });

    test('should handle empty strings gracefully', () => {
      const result = formatForAI('', '', '');
      
      expect(result).toContain('選択テキスト：\n');
      expect(result).toContain('ページURL：\n');
      expect(result).toContain('構造的な位置：\n');
      expect(result).toContain('指示：');
    });

    test('should handle multiline text', () => {
      const multilineText = `First line
Second line
Third line`;
      const url = 'https://example.com';
      const selector = 'html > body > pre';

      const result = formatForAI(multilineText, url, selector);
      
      expect(result).toContain(multilineText);
      expect(result.split('\n').length).toBeGreaterThan(5); // 複数行が保持される
    });

    test('should handle special characters in URL', () => {
      const selectedText = 'test';
      const url = 'https://example.com/path?query=value&other=test#section';
      const selector = 'html > body > div';

      const result = formatForAI(selectedText, url, selector);
      
      expect(result).toContain(url);
    });
  });
});