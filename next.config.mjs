/** @type {import('next').NextConfig} */

const isDev = process.env.NODE_ENV === "development";

function hostnameFromEnv(name) {
  const value = process.env[name];
  if (!value) return null;
  try {
    return new URL(value).hostname;
  } catch {
    return null;
  }
}

const imageHostnames = [
  "images.unsplash.com",
  "images.stockcake.com",
  "s3-alpha-sig.figma.com",
  hostnameFromEnv("NEXT_PUBLIC_MEDIA_STAGING_URL"),
  hostnameFromEnv("NEXT_PUBLIC_MEDIA_URL"),
  "lh3.googleusercontent.com",
  "media.tifi.tv",
  "is1-ssl.mzstatic.com",
  "res.cloudinary.com",
  "i.imgur.com",
].filter(Boolean);

const nextConfig = {
  reactStrictMode: false,
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: imageHostnames.map((hostname) => ({
      protocol: "https",
      hostname,
      port: "",
      pathname: "/**",
    })),
    unoptimized: true,
  },
  transpilePackages: ["lucide-react"],
  assetPrefix: isDev ? undefined : "/mainapp",
  compiler: {
    removeConsole: isDev ? false : true,
  },
};

export default nextConfig;
