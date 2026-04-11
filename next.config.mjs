/** @type {import('next').NextConfig} */
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const nextConfig = {
  output: 'export',
  trailingSlash: true,
  turbopack: {
    root: __dirname,
  },
}

export default nextConfig
