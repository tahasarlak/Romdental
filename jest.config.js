module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom', // برای شبیه‌سازی مرورگر
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '\\.(css|less|scss)$': 'identity-obj-proxy', // برای مدیریت CSS Moduleها
  },
};