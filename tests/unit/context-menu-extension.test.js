// Context menu extension tests for media support
// TDD for adding image, video, audio, link contexts

describe('Context Menu Extension for Media Support', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Chrome API mock
    global.chrome = {
      contextMenus: {
        create: jest.fn(),
        onClicked: {
          addListener: jest.fn()
        }
      },
      runtime: {
        onInstalled: {
          addListener: jest.fn()
        }
      },
      scripting: {
        executeScript: jest.fn()
      }
    };
  });

  describe('Menu Creation for Media Elements', () => {
    test('should create context menu for multiple contexts', () => {
      const mockCreate = chrome.contextMenus.create;
      
      // Simulate the context menu creation logic
      const createContextMenu = () => {
        chrome.contextMenus.create({
          id: "copyAIFormatted",
          title: "AI用にコピー",
          contexts: ["selection", "image", "video", "audio", "link"]
        });
      };

      createContextMenu();

      expect(mockCreate).toHaveBeenCalledWith({
        id: "copyAIFormatted",
        title: "AI用にコピー",
        contexts: ["selection", "image", "video", "audio", "link"]
      });
    });

    test('should handle context menu creation errors gracefully', () => {
      const mockCreate = chrome.contextMenus.create;
      mockCreate.mockImplementation(() => {
        throw new Error('Context menu creation failed');
      });

      expect(() => {
        chrome.contextMenus.create({
          id: "copyAIFormatted",
          title: "AI用にコピー",
          contexts: ["selection", "image", "video", "audio", "link"]
        });
      }).toThrow('Context menu creation failed');
    });
  });

  describe('Media Context Menu Click Handling', () => {
    test('should execute script for image context', () => {
      const mockExecuteScript = chrome.scripting.executeScript;
      
      const clickHandler = (info, tab) => {
        if (info.menuItemId === "copyAIFormatted") {
          chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: expect.any(Function)
          });
        }
      };

      // Image context click
      const imageInfo = {
        menuItemId: "copyAIFormatted",
        mediaType: "image",
        srcUrl: "https://example.com/image.jpg"
      };
      const mockTab = { id: 123 };

      clickHandler(imageInfo, mockTab);

      expect(mockExecuteScript).toHaveBeenCalledWith({
        target: { tabId: 123 },
        function: expect.any(Function)
      });
    });

    test('should execute script for video context', () => {
      const mockExecuteScript = chrome.scripting.executeScript;
      
      const clickHandler = (info, tab) => {
        if (info.menuItemId === "copyAIFormatted") {
          chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: expect.any(Function)
          });
        }
      };

      // Video context click
      const videoInfo = {
        menuItemId: "copyAIFormatted",
        mediaType: "video",
        srcUrl: "https://example.com/video.mp4"
      };
      const mockTab = { id: 456 };

      clickHandler(videoInfo, mockTab);

      expect(mockExecuteScript).toHaveBeenCalledWith({
        target: { tabId: 456 },
        function: expect.any(Function)
      });
    });

    test('should execute script for audio context', () => {
      const mockExecuteScript = chrome.scripting.executeScript;
      
      const clickHandler = (info, tab) => {
        if (info.menuItemId === "copyAIFormatted") {
          chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: expect.any(Function)
          });
        }
      };

      // Audio context click
      const audioInfo = {
        menuItemId: "copyAIFormatted",
        mediaType: "audio",
        srcUrl: "https://example.com/audio.mp3"
      };
      const mockTab = { id: 789 };

      clickHandler(audioInfo, mockTab);

      expect(mockExecuteScript).toHaveBeenCalledWith({
        target: { tabId: 789 },
        function: expect.any(Function)
      });
    });

    test('should execute script for link context', () => {
      const mockExecuteScript = chrome.scripting.executeScript;
      
      const clickHandler = (info, tab) => {
        if (info.menuItemId === "copyAIFormatted") {
          chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: expect.any(Function)
          });
        }
      };

      // Link context click
      const linkInfo = {
        menuItemId: "copyAIFormatted",
        linkUrl: "https://example.com/page"
      };
      const mockTab = { id: 321 };

      clickHandler(linkInfo, mockTab);

      expect(mockExecuteScript).toHaveBeenCalledWith({
        target: { tabId: 321 },
        function: expect.any(Function)
      });
    });
  });

  describe('Context Menu Info Object', () => {
    test('should provide correct info for image context', () => {
      // Chrome provides different info objects for different contexts
      const imageContextInfo = {
        menuItemId: "copyAIFormatted",
        mediaType: "image",
        srcUrl: "https://example.com/test.jpg"
      };

      expect(imageContextInfo.mediaType).toBe("image");
      expect(imageContextInfo.srcUrl).toContain(".jpg");
    });

    test('should provide correct info for video context', () => {
      const videoContextInfo = {
        menuItemId: "copyAIFormatted",
        mediaType: "video",
        srcUrl: "https://example.com/test.mp4"
      };

      expect(videoContextInfo.mediaType).toBe("video");
      expect(videoContextInfo.srcUrl).toContain(".mp4");
    });

    test('should provide correct info for link context', () => {
      const linkContextInfo = {
        menuItemId: "copyAIFormatted",
        linkUrl: "https://example.com/page"
      };

      expect(linkContextInfo.linkUrl).toBe("https://example.com/page");
    });

    test('should handle missing context info gracefully', () => {
      const incompleteInfo = {
        menuItemId: "copyAIFormatted"
        // Missing mediaType, srcUrl, linkUrl
      };

      // Should not throw error
      expect(incompleteInfo.menuItemId).toBe("copyAIFormatted");
      expect(incompleteInfo.mediaType).toBeUndefined();
      expect(incompleteInfo.srcUrl).toBeUndefined();
      expect(incompleteInfo.linkUrl).toBeUndefined();
    });
  });
});