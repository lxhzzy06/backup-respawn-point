const useMinecraftPreview = false;
const bpfoldername = 'brp_bp';
const rpfoldername = 'brp_rp';

import { defineConfig, build as tsbuild } from 'tsup';
import gulp from 'gulp';
import os from 'os';
import minimist from 'minimist';
import zip from 'gulp-zip';
import { deleteSync } from 'del';
const mcdir =
	os.homedir() +
	(useMinecraftPreview
		? '/AppData/Local/Packages/Microsoft.MinecraftWindowsBeta_8wekyb3d8bbwe/LocalState/games/com.mojang/'
		: '/AppData/Local/Packages/Microsoft.MinecraftUWP_8wekyb3d8bbwe/LocalState/games/com.mojang/');
const argv = minimist(process.argv.slice(2));

const config = defineConfig({
	entry: ['src/main.ts'],
	outDir: `${mcdir}/development_behavior_packs/${bpfoldername}/scripts`,
	format: 'esm',
	target: 'es2020',
	clean: false,
	noExternal: ['@minecraft/math', 'wgpu-matrix', 'bedrock-vanilla-data-inline'],
	outExtension() {
		return { js: '.js' };
	},
	watch: argv.w ? 'src' : undefined
});

function deploy_behavior_packs() {
	console.log("Behavior deploying to '" + mcdir + 'development_behavior_packs/' + bpfoldername + "'");
	return gulp.src(`pack/${bpfoldername}/**/*`, { encoding: false }).pipe(gulp.dest(mcdir + 'development_behavior_packs/' + bpfoldername));
}

function deploy_resource_packs() {
	console.log("Resource deploying to '" + mcdir + 'development_resource_packs/' + rpfoldername + "'");
	return gulp.src(`pack/${rpfoldername}/**/*`, { encoding: false }).pipe(gulp.dest(mcdir + 'development_resource_packs/' + rpfoldername));
}

async function main() {
	await tsbuild(config);
	if (argv.d) {
		await deploy();
	}
}

export async function build() {
	deleteSync('target/**/*', { force: true });
	gulp.src('pack/**/*', { encoding: false }).pipe(gulp.dest('target'));
	config.outDir = `target/${bpfoldername}/scripts`;
	config.minify = true;
	config.treeshake = true;
	await tsbuild(config);
	gulp.src('target/**/*', { encoding: false }).pipe(zip('backup-respawn-point.mcaddon')).pipe(gulp.dest('target'));
}

export const deploy = gulp.series(gulp.parallel(deploy_behavior_packs, deploy_resource_packs));
export default main;
