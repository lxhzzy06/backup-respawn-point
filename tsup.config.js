import { defineConfig } from 'tsup';

export default defineConfig({
	entry: ['src/main.ts'],
	outDir: 'scripts',
	format: 'esm',
	target: 'es2020',
	clean: false,
	noExternal: ['bedrock-vanilla-data-inline'],
	outExtension() {
		return { js: '.js' };
	},
	watch: 'src'
});
