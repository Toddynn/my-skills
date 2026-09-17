import type { NextConfig } from 'next';
import path from 'node:path';

const nextConfig: NextConfig = {
	output: 'standalone',
	outputFileTracingIncludes: {
		'/**': ['./node_modules/@swc/helpers/esm/**'],
	},
	turbopack: {
		root: path.join(__dirname, '..'),
	},
};

export default nextConfig;
