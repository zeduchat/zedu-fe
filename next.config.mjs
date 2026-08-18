/** @type {import('next').NextConfig} */

const isDev = process.env.NODE_ENV === "development";

const imageHostnames = [
  "images.unsplash.com",
  "images.stockcake.com",
  "s3-alpha-sig.figma.com",
  "media.staging.zedu.chat",
  "media.zedu.chat",
  "lh3.googleusercontent.com",
  "media.tifi.tv",
  "is1-ssl.mzstatic.com",
  "res.cloudinary.com",
  "i.imgur.com",
];

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
