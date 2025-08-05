// Jest test setup file
// Chrome拡張用のグローバル設定とモック

// Chrome APIのモック設定
global.chrome = {
  // Context Menus API
  contextMenus: {
    create: jest.fn(),
    onClicked: {
      addListener: jest.fn()
    }
  },
  
  // Runtime API
  runtime: {
    onInstalled: {
      addListener: jest.fn()
    }
  },
  
  // Scripting API
  scripting: {
    executeScript: jest.fn()
  },
  
  // Clipboard API (制限あり)
  // Note: 実際のクリップボード操作はE2Eテストで検証
};

// Navigator APIのモック
Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: jest.fn().mockResolvedValue(undefined)
  },
  writable: true
});

// Window.getSelection のモック
global.getSelection = jest.fn(() => ({
  toString: jest.fn(() => 'selected text'),
  getRangeAt: jest.fn(() => ({
    commonAncestorContainer: {
      nodeType: Node.TEXT_NODE,
      parentElement: document.createElement('p')
    }
  }))
}));

// Node constants (jsdomで不完全な場合のfallback)
if (typeof Node === 'undefined') {
  global.Node = {
    ELEMENT_NODE: 1,
    TEXT_NODE: 3
  };
}

// カスタムマッチャー
expect.extend({
  toBeValidCSSSelector(received) {
    const isValid = /^[a-zA-Z][\w-]*(\s*>\s*[a-zA-Z][\w-]*(\:nth-of-type\(\d+\))?)*$/.test(received);
    return {
      message: () => `expected ${received} to be a valid CSS selector`,
      pass: isValid
    };
  }
});

// テスト前の共通セットアップ
beforeEach(() => {
  // モックをクリア
  jest.clearAllMocks();
  
  // DOMをリセット
  document.body.innerHTML = '';
});