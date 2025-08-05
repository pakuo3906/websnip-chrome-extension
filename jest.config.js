module.exports = {
  // テスト環境: jsdom (ブラウザ環境をシミュレート)
  testEnvironment: 'jsdom',
  
  // セットアップファイル
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  
  // テストファイルのパターン
  testMatch: [
    '**/tests/**/*.test.js',
    '**/__tests__/**/*.js'
  ],
  
  // カバレッジ対象ファイル
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/manifest.json'
  ],
  
  // カバレッジ閾値
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  
  // カバレッジレポート形式
  coverageReporters: [
    'text',
    'lcov',
    'html'
  ],
  
  // モジュール解決
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  
  // グローバル変数
  globals: {
    chrome: {}
  }
};