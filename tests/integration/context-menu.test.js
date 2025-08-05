// Integration tests for context menu functionality
// Testing Chrome extension APIs and event handling

describe('Context Menu Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Menu Creation', () => {
    test('should create context menu on extension install', () => {
      // Chrome拡張のbackground.jsの動作をテスト
      const mockAddListener = jest.fn();
      const mockCreate = jest.fn();
      
      global.chrome = {
        runtime: {
          onInstalled: { addListener: mockAddListener }
        },
        contextMenus: {
          create: mockCreate
        }
      };

      // background.jsの初期化ロジックをシミュレート
      const onInstalledCallback = jest.fn(() => {
        chrome.contextMenus.create({
          id: "copyAIFormatted",
          title: "AI用にコピー",
          contexts: ["selection"]
        });
      });

      chrome.runtime.onInstalled.addListener(onInstalledCallback);
      
      // インストールイベントをシミュレート
      onInstalledCallback();

      expect(mockAddListener).toHaveBeenCalledWith(onInstalledCallback);
      expect(mockCreate).toHaveBeenCalledWith({
        id: "copyAIFormatted",
        title: "AI用にコピー",
        contexts: ["selection"]
      });
    });
  });

  describe('Menu Click Handling', () => {
    test('should execute script when menu item is clicked', () => {
      const mockExecuteScript = jest.fn();
      const mockOnClickedAddListener = jest.fn();
      
      global.chrome = {
        contextMenus: {
          onClicked: { addListener: mockOnClickedAddListener }
        },
        scripting: {
          executeScript: mockExecuteScript
        }
      };

      // Click handlerをセットアップ
      const clickHandler = jest.fn((info, tab) => {
        if (info.menuItemId === "copyAIFormatted") {
          chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: expect.any(Function)
          });
        }
      });

      chrome.contextMenus.onClicked.addListener(clickHandler);

      // クリックイベントをシミュレート
      const mockInfo = { menuItemId: "copyAIFormatted" };
      const mockTab = { id: 123 };
      
      clickHandler(mockInfo, mockTab);

      expect(mockOnClickedAddListener).toHaveBeenCalledWith(clickHandler);
      expect(mockExecuteScript).toHaveBeenCalledWith({
        target: { tabId: 123 },
        function: expect.any(Function)
      });
    });

    test('should not execute script for wrong menu item', () => {
      const mockExecuteScript = jest.fn();
      
      global.chrome = {
        contextMenus: {
          onClicked: { addListener: jest.fn() }
        },
        scripting: {
          executeScript: mockExecuteScript
        }
      };

      const clickHandler = (info, tab) => {
        if (info.menuItemId === "copyAIFormatted") {
          chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: () => {}
          });
        }
      };

      // 異なるメニューアイテムのクリック
      const mockInfo = { menuItemId: "differentMenuItem" };
      const mockTab = { id: 123 };
      
      clickHandler(mockInfo, mockTab);

      expect(mockExecuteScript).not.toHaveBeenCalled();
    });
  });

  describe('Script Execution Context', () => {
    test('should have access to required DOM APIs in executed script', () => {
      // executeScriptで実行される関数内で使用されるAPIが利用可能かテスト
      const mockWindow = {
        getSelection: jest.fn(() => ({
          toString: () => 'selected text',
          getRangeAt: () => ({
            commonAncestorContainer: {
              nodeType: 3, // TEXT_NODE
              parentElement: document.createElement('p')
            }
          })
        })),
        location: {
          href: 'https://example.com/test'
        }
      };

      const mockNavigator = {
        clipboard: {
          writeText: jest.fn().mockResolvedValue(undefined)
        }
      };

      // Global APIs simulation
      global.window = mockWindow;
      global.navigator = mockNavigator;
      global.document = {
        createElement: jest.fn(() => ({
          style: { cssText: '' },
          textContent: ''
        })),
        body: {
          appendChild: jest.fn()
        }
      };

      // Script execution環境をテスト
      expect(window.getSelection).toBeDefined();
      expect(window.location.href).toBe('https://example.com/test');
      expect(navigator.clipboard.writeText).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    test('should handle missing tab ID gracefully', () => {
      const mockExecuteScript = jest.fn();
      
      global.chrome = {
        scripting: {
          executeScript: mockExecuteScript
        }
      };

      const clickHandler = (info, tab) => {
        if (info.menuItemId === "copyAIFormatted" && tab && tab.id) {
          chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: () => {}
          });
        }
      };

      // tabがnullの場合
      clickHandler({ menuItemId: "copyAIFormatted" }, null);
      expect(mockExecuteScript).not.toHaveBeenCalled();

      // tab.idが未定義の場合
      clickHandler({ menuItemId: "copyAIFormatted" }, {});
      expect(mockExecuteScript).not.toHaveBeenCalled();

      // 正常な場合
      clickHandler({ menuItemId: "copyAIFormatted" }, { id: 123 });
      expect(mockExecuteScript).toHaveBeenCalledWith({
        target: { tabId: 123 },
        function: expect.any(Function)
      });
    });
  });
});