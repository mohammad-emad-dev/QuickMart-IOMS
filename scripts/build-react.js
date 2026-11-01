// Compiles React Error Boundary and components into a standalone browser bundle.
const path = require('node:path');
const esbuild = require('esbuild');

const root = path.resolve(__dirname, '..');

async function buildReact() {
    await esbuild.build({
        entryPoints: [path.join(root, 'src/components/index.js')],
        outfile: path.join(root, 'dist/js/error-boundary.min.js'),
        bundle: true,
        minify: true,
        sourcemap: false,
        format: 'iife',
        globalName: 'QuickMartReactModules',
        define: {
            'process.env.NODE_ENV': '"production"'
        },
        loader: {
            '.js': 'jsx',
            '.jsx': 'jsx'
        }
    });

    process.stdout.write('src/components/index.jsx -> dist/js/error-boundary.min.js (built with esbuild)\n');
}

if (require.main === module) {
    buildReact().catch((error) => {
        console.error('Failed to bundle React components:', error);
        process.exit(1);
    });
}

module.exports = {
    buildReact
};
