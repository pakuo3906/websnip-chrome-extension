// Clipboard functionality tests
// TDD for copy operations and fallback mechanisms

const { copyToClipboard, showNotification } = require('../../src/content/utils.js');

describe('Clipboard Operations', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    jest.clearAllMocks();
    
    // DOM操作系メソッドのモック
    document.createElement = jest.fn().mockImplementation((tag) => {
      const element = { 
        tagName: tag.toUpperCase(),
        style: {},
        appendChild: jest.fn(),
        removeChild: jest.fn(),
        select: jest.fn(),
        setAttribute: jest.fn(),
        textContent: ''
      };
      // textareaの場合、valueプロパティを追加
      if (tag === 'textarea') {
        element.value = '';
      }
      return element;
    });
    
    document.body.appendChild = jest.fn();
    document.body.removeChild = jest.fn();
    
    // execCommandのモック
    document.execCommand = jest.fn();
  });

  describe('copyToClipboard', () => {
    test('should use modern clipboard API when available', async () => {
      const testText = 'Test clipboard content';
      
      // Modern clipboard API success
      navigator.clipboard.writeText = jest.fn().mockResolvedValue(undefined);
      
      const result = await copyToClipboard(testText);
      
      expect(result).toBe(true);
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(testText);
    });

    test('should fallback to execCommand when clipboard API fails', async () => {
      const testText = 'Test fallback content';
      
      // Modern clipboard API fails
      navigator.clipboard.writeText = jest.fn().mockRejectedValue(new Error('Clipboard API not available'));
      
      // execCommand succeeds
      document.execCommand = jest.fn().mockReturnValue(true);
      
      const result = await copyToClipboard(testText);
      
      expect(result).toBe(true);
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(testText);
      expect(document.createElement).toHaveBeenCalledWith('textarea');
      expect(document.execCommand).toHaveBeenCalledWith('copy');
    });

    test('should return false when both methods fail', async () => {
      const testText = 'Test failure content';
      
      // Modern clipboard API fails
      navigator.clipboard.writeText = jest.fn().mockRejectedValue(new Error('Clipboard API not available'));
      
      // execCommand also fails
      document.execCommand = jest.fn().mockImplementation(() => {
        throw new Error('execCommand failed');
      });
      
      const result = await copyToClipboard(testText);
      
      expect(result).toBe(false);
    });

    test('should properly set textarea value in fallback', async () => {
      const testText = 'Test textarea content';
      
      navigator.clipboard.writeText = jest.fn().mockRejectedValue(new Error('API unavailable'));
      
      const mockTextArea = {
        value: '',
        select: jest.fn(),
        style: {}
      };
      document.createElement = jest.fn().mockReturnValue(mockTextArea);
      document.execCommand = jest.fn().mockReturnValue(true);
      
      await copyToClipboard(testText);
      
      expect(mockTextArea.value).toBe(testText);
      expect(mockTextArea.select).toHaveBeenCalled();
    });
  });

  describe('showNotification', () => {
    test('should create notification element with correct styling', () => {
      const message = 'Test notification';
      const mockElement = {
        style: { cssText: '' },
        textContent: '',
        parentNode: null
      };
      
      document.createElement = jest.fn().mockReturnValue(mockElement);
      
      showNotification(message, 'success');
      
      expect(document.createElement).toHaveBeenCalledWith('div');
      expect(mockElement.textContent).toBe(message);
      expect(mockElement.style.cssText).toContain('#4CAF50'); // success color
      expect(document.body.appendChild).toHaveBeenCalledWith(mockElement);
    });

    test('should use different colors for different notification types', () => {
      const mockElement = { style: { cssText: '' }, textContent: '' };
      document.createElement = jest.fn().mockReturnValue(mockElement);
      
      // Test success
      showNotification('Success', 'success');
      expect(mockElement.style.cssText).toContain('#4CAF50');
      
      // Test error
      showNotification('Error', 'error');
      expect(mockElement.style.cssText).toContain('#f44336');
      
      // Test info (default)
      showNotification('Info', 'info');
      expect(mockElement.style.cssText).toContain('#2196F3');
    });

    test('should default to info type when no type specified', () => {
      const mockElement = { style: { cssText: '' }, textContent: '' };
      document.createElement = jest.fn().mockReturnValue(mockElement);
      
      showNotification('Default notification');
      expect(mockElement.style.cssText).toContain('#2196F3'); // info color
    });

    test('should set up auto-removal timer', () => {
      jest.useFakeTimers();
      jest.spyOn(global, 'setTimeout');
      
      const mockElement = {
        style: { cssText: '' },
        textContent: '',
        parentNode: { removeChild: jest.fn() }
      };
      document.createElement = jest.fn().mockReturnValue(mockElement);
      
      showNotification('Test message');
      
      // タイマーが設定されていることを確認
      expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 3000);
      
      // 3秒後に削除されることを確認
      jest.advanceTimersByTime(3000);
      expect(mockElement.parentNode.removeChild).toHaveBeenCalledWith(mockElement);
      
      jest.useRealTimers();
    });
  });
});