const nextConfig = {
  reactStrictMode: true,
  outputFileTracingIncludes: {
    "/api/migrate": ["./prisma/**/*"],
  },
};
export default nextConfig;
