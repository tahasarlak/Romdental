/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.resolve.fallback = {
      fs: false, // غیرفعال کردن fs (معمولاً در مرورگر لازم نیست)
      stream: require.resolve('stream-browserify'), // پلی‌فیل برای stream
      zlib: require.resolve('browserify-zlib'), // پلی‌فیل برای zlib
    };
    return config;
  },
};

module.exports = nextConfig;