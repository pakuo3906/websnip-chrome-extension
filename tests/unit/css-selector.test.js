// CSS Selector generation tests
// TDD approach: Red -> Green -> Refactor

import { generateCSSSelector } from '../../src/content/utils.js';

describe('CSS Selector Generation', () => {
  beforeEach(() => {
    // DOMを初期化
    document.body.innerHTML = '';
  });

  describe('Basic element detection', () => {
    test('should return "unknown" for null element', () => {
      expect(generateCSSSelector(null)).toBe('unknown');
    });

    test('should return "unknown" for text node', () => {
      const textNode = document.createTextNode('test');
      expect(generateCSSSelector(textNode)).toBe('unknown');
    });

    test('should generate selector for simple element', () => {
      const div = document.createElement('div');
      document.body.appendChild(div);
      
      const selector = generateCSSSelector(div);
      expect(selector).toBeValidCSSSelector();
      expect(selector).toBe('html > body > div');
    });
  });

  describe('Complex hierarchy', () => {
    test('should handle nested elements', () => {
      const article = document.createElement('article');
      const section = document.createElement('section');
      const p = document.createElement('p');
      
      article.appendChild(section);
      section.appendChild(p);
      document.body.appendChild(article);
      
      const selector = generateCSSSelector(p);
      expect(selector).toBe('html > body > article > section > p');
    });

    test('should add nth-of-type for multiple same elements', () => {
      const div1 = document.createElement('div');
      const div2 = document.createElement('div');
      const div3 = document.createElement('div');
      
      document.body.appendChild(div1);
      document.body.appendChild(div2);
      document.body.appendChild(div3);
      
      expect(generateCSSSelector(div1)).toBe('html > body > div:nth-of-type(1)');
      expect(generateCSSSelector(div2)).toBe('html > body > div:nth-of-type(2)');
      expect(generateCSSSelector(div3)).toBe('html > body > div:nth-of-type(3)');
    });

    test('should handle mixed elements without nth-of-type for unique tags', () => {
      const article = document.createElement('article');
      const div = document.createElement('div');
      const span = document.createElement('span');
      
      article.appendChild(div);
      article.appendChild(span);
      document.body.appendChild(article);
      
      expect(generateCSSSelector(div)).toBe('html > body > article > div');
      expect(generateCSSSelector(span)).toBe('html > body > article > span');
    });
  });

  describe('Edge cases', () => {
    test('should handle elements without parent', () => {
      const div = document.createElement('div');
      // divをDOMに追加しない（parentElementがnull）
      
      const selector = generateCSSSelector(div);
      expect(selector).toBe('div');
    });

    test('should handle deeply nested structure', () => {
      let current = document.body;
      const tags = ['article', 'section', 'div', 'p', 'span'];
      
      for (const tag of tags) {
        const element = document.createElement(tag);
        current.appendChild(element);
        current = element;
      }
      
      const selector = generateCSSSelector(current);
      expect(selector).toBe('html > body > article > section > div > p > span');
    });

    test('should handle case insensitive tag names', () => {
      const div = document.createElement('div');
      document.body.appendChild(div);
      
      // DOMのtagNameは通常大文字で返されるが、小文字で処理されることを確認
      const selector = generateCSSSelector(div);
      expect(selector).toMatch(/div$/); // 最後がdiv（小文字）で終わる
    });
  });
});