/*
 * Adds functions that parse source code for magic commands and transpile them to the target language.
 *
 * List of Magic Commands:
 * - `@show(ImagePath)`: Displays an image at the given path in the note.
 * - `@show(ImagePath, Width, Height)`: Displays an image at the given path in the note.
 * - `@show(ImagePath, Width, Height, Alignment)`: Displays an image at the given path in the note.
 * - `@vault`: Inserts the vault path as string.
 * - `@note`: Inserts the note path as string.
 * - `@title`: Inserts the note title as string.
 * - `@theme`: Inserts the color theme; either `"light"` or `"dark"`. For use with images, inline plots, and `@html()`.
 */

import * as os from "os";
import { Platform } from 'obsidian';
import { SEPARATOR, TOGGLE_HTML_SIGIL } from "src/output/Outputter";
import { ExecutorSettings } from "src/settings/Settings";

// Regex for all languages.
const SHOW_REGEX = /@show\(["'](?<path>[^<>?*=!\n#()\[\]{}]+)["'](,\s*(?<width>\d+[\w%]+),?\s*(?<height>\d+[\w%]+))?(,\s*(?<align>left|center|right))?\)/g;
const HTML_REGEX = /@html\((?<html>[^)]+)\)/g;
const MARKDOWN_REGEX = /@print_markdown\((?<markdown>[^)]+)\)/g;
const VAULT_REGEX = /@vault/g
const VAULT_PATH_REGEX = /@vault_path/g
const VAULT_URL_REGEX = /@vault_url/g
const CURRENT_NOTE_REGEX = /@note/g;
const CURRENT_NOTE_PATH_REGEX = /@note_path/g;
const CURRENT_NOTE_URL_REGEX = /@note_url/g;
const NOTE_TITLE_REGEX = /@title/g;
const COLOR_THEME_REGEX = /@theme/g;

// Regex that are only used by one language.
const PYTHON_PLOT_REGEX = /^(plt|matplotlib.pyplot|pyplot)\.show\(\)/gm;
const R_PLOT_REGEX = /^plot\(.*\)/gm;
const OCTAVE_PLOT_REGEX = /^plot\s*\(.*\);/gm;
const MAXIMA_PLOT_REGEX = /^plot2d\s*\(.*\[.+\]\)\s*[$;]/gm;

/**
 * Parses the source code for the @vault command and replaces it with the vault path.
 *
 * @param source The source code to parse.
 * @param vaultPath The path of the vault.
 * @returns The transformed source code.
 */
export function expandVaultPath(source: string, vaultPath: string): string {
	source = source.replace(VAULT_PATH_REGEX, `"${vaultPath.replace(/\\/g, "/")}"`);
	source = source.replace(VAULT_URL_REGEX, `"${Platform.resourcePathPrefix + vaultPath.replace(/\\/g, "/")}"`);
	source = source.replace(VAULT_REGEX, `"${Platform.resourcePathPrefix + vaultPath.replace(/\\/g, "/")}"`);

	return source;
}


/**
 * Parses the source code for the @note command and replaces it with the note path.
 *
 * @param source The source code to parse.
 * @param notePath The path of the vault.
 * @returns The transformed source code.
 */
export function expandNotePath(source: string, notePath: string): string {
	source = source.replace(CURRENT_NOTE_PATH_REGEX, `"${notePath.replace(/\\/g, "/")}"`);
	source = source.replace(CURRENT_NOTE_URL_REGEX, `"${Platform.resourcePathPrefix + notePath.replace(/\\/g, "/")}"`);
	source = source.replace(CURRENT_NOTE_REGEX, `"${Platform.resourcePathPrefix + notePath.replace(/\\/g, "/")}"`);

	return source;
}


/**
 * Parses the source code for the @title command and replaces it with the vault path.
 *
 * @param source The source code to parse.
 * @param noteTitle The path of the vault.
 * @returns The transformed source code.
 */
export function expandNoteTitle(source: string, noteTitle: string): string {
	let t = "";
	if (noteTitle.contains("."))
		t = noteTitle.split(".").slice(0, -1).join(".");

	return source.replace(NOTE_TITLE_REGEX, `"${t}"`);
}

/**
 * Parses the source code for the @theme command and replaces it with the colour theme.
 *
 * @param source The source code to parse.
 * @param noteTitle The current colour theme.
 * @returns The transformed source code.
 */
export function expandColorTheme(source: string, theme: string): string {
	return source.replace(COLOR_THEME_REGEX, `"${theme}"`);
}

/**
 * Add the @show command to python. @show is only supported in python and javascript.
 *
 * @param source The source code to parse.
 * @returns The transformed source code.
 */
export function expandPython(source: string, settings: ExecutorSettings): string {
	if (settings.pythonEmbedPlots) {
		source = expandPythonPlots(source, TOGGLE_HTML_SIGIL);
	}
	source = expandPythonShowImage(source);
	source = expandPythonHtmlMacro(source);
	source = expandPythonMarkdown(source);
	return source;
}


/**
 * Add the @show command to javascript. @show is only supported in python and javascript.
 *
 * @param source The source code to parse.
 * @returns The transformed source code.
 */
export function expandJS(source: string): string {
	source = expandJsShowImage(source);
	source = expandJsHtmlMacro(source);
	return source;
}


/**
 * Parses some python code and changes it to display plots in the note instead of opening a new window.
 * Only supports normal plots generated with the `plt.show(...)` function.
 *
 * @param source The source code to parse.
 * @param toggleHtmlSigil The meta-command to allow and disallow HTML
 * @returns The transformed source code.
 */
export function expandPythonPlots(source: string, toggleHtmlSigil: string): string {
	const showPlot = `import io; import sys; __obsidian_execute_code_temp_pyplot_var__=io.BytesIO(); plt.plot(); plt.savefig(__obsidian_execute_code_temp_pyplot_var__, format='svg'); plt.close(); sys.stdout.write(${JSON.stringify(toggleHtmlSigil)}); sys.stdout.flush(); sys.stdout.buffer.write(__obsidian_execute_code_temp_pyplot_var__.getvalue()); sys.stdout.flush(); sys.stdout.write(${JSON.stringify(toggleHtmlSigil)}); sys.stdout.flush()`;
	return source.replace(PYTHON_PLOT_REGEX, showPlot);
}


/**
 * Parses some R code and changes it to display plots in the note instead of opening a new window.
 * Only supports normal plots generated with the `plot(...)` function.
 *
 * @param source The source code to parse.
 * @returns The transformed source code.
 */
export function expandRPlots(source: string): string {
	const matches = source.matchAll(R_PLOT_REGEX);
	for (const match of matches) {
		const tempFile = `${os.tmpdir()}/temp_${Date.now()}.png`.replace(/\\/g, "/");
		const substitute = `png("${tempFile}"); ${match[0]}; dev.off(); cat('${TOGGLE_HTML_SIGIL}<img src="${Platform.resourcePathPrefix + tempFile}" align="center">${TOGGLE_HTML_SIGIL}')`;

		source = source.replace(match[0], substitute);
	}

	return source;
}


/**
 * Parses the PYTHON code for the @show command and replaces it with the image.
 * @param source The source code to parse.
 */
function expandPythonShowImage(source: string): string {
	const matches = source.matchAll(SHOW_REGEX);
	for (const match of matches) {
		const imagePath = match.groups.path;
		const width = match.groups.width;
		const height = match.groups.height;
		const alignment = match.groups.align;

		const image = expandShowImage(imagePath.replace(/\\/g, "\\\\"), width, height, alignment);
		source = source.replace(match[0], "print(\'" + TOGGLE_HTML_SIGIL + image + TOGGLE_HTML_SIGIL + "\')");
	}

	return source;
}

/**
 * Parses the PYTHON code for the @html command and surrounds it with the toggle-escaoe token.
 * @param source 
 */
function expandPythonHtmlMacro(source: string): string {
	const matches = source.matchAll(HTML_REGEX);
	for (const match of matches) {
		const html = match.groups.html;
		const toggle = JSON.stringify(TOGGLE_HTML_SIGIL);
		const separate = JSON.stringify(SEPARATOR);
		source = source.replace(match[0], `print(${toggle} + "print_html" + ${separate} + ${html} + ${toggle})`);
	}
	return source;
}

function expandPythonMarkdown(source: string): string {
	const matches = source.matchAll(MARKDOWN_REGEX);
	for (const match of matches) {
		const markdown = match.groups.markdown;
		const toggle = JSON.stringify(TOGGLE_HTML_SIGIL);
		const separate = JSON.stringify(SEPARATOR);
		source = source.replace(match[0], `print(${toggle} + "print_markdown" + ${separate} + ${markdown} + ${toggle})`);
	}
	return source;
}


/**
 * Parses the JAVASCRIPT code for the @show command and replaces it with the image.
 * @param source The source code to parse.
 */
function expandJsShowImage(source: string): string {
	const matches = source.matchAll(SHOW_REGEX);
	for (const match of matches) {
		const imagePath = match.groups.path;
		const width = match.groups.width;
		const height = match.groups.height;
		const alignment = match.groups.align;

		const image = expandShowImage(imagePath.replace(/\\/g, "\\\\"), width, height, alignment);

		source = source.replace(match[0], "console.log(\'" + TOGGLE_HTML_SIGIL + image + TOGGLE_HTML_SIGIL + "\')");
		console.log(source);
	}

	return source;
}

function expandJsHtmlMacro(source: string): string {
	const matches = source.matchAll(HTML_REGEX);
	for (const match of matches) {
		const html = match.groups.html;

		const toggle = JSON.stringify(TOGGLE_HTML_SIGIL);

		source = source.replace(match[0], `console.log(${toggle}); console.log(${html}); console.log(${toggle})`)
	}
	return source;
}


/**
 * Builds the image string that is used to display the image in the note based on the configurations for
 * height, width and alignment.
 *
 * @param imagePath The path to the image.
 * @param width The image width.
 * @param height The image height.
 * @param alignment The image alignment.
 */
function expandShowImage(imagePath: string, width: string = "0", height: string = "0", alignment: string = "center"): string {
	if (imagePath.contains("+")) {
		let splittedPath = imagePath.replace(/['"]/g, "").split("+");
		splittedPath = splittedPath.map(element => element.trim())
		imagePath = splittedPath.join("");
	}

	if (width == "0" || height == "0")
		return `<img src="${imagePath}" align="${alignment}" alt="Image found at path ${imagePath}." />`;

	return `<img src="${imagePath}" width="${width}" height="${height}" align="${alignment}" alt="Image found at path ${imagePath}." />`;
}

export function expandOctavePlot(source: string): string {
	const matches = source.matchAll(OCTAVE_PLOT_REGEX);
	for (const match of matches) {
		const tempFile = `${os.tmpdir()}/temp_${Date.now()}.png`.replace(/\\/g, "/");
		const substitute = `${match[0]}; print -dpng ${tempFile}; disp('${TOGGLE_HTML_SIGIL}<img src="${Platform.resourcePathPrefix + tempFile}" align="center">${TOGGLE_HTML_SIGIL}');`;

		source = source.replace(match[0], substitute);
	}

	return source;
}

export function expandMaximaPlot(source: string): string {
	const matches = source.matchAll(MAXIMA_PLOT_REGEX);
	for (const match of matches) {
		const tempFile = `${os.tmpdir()}/temp_${Date.now()}.png`.replace(/\\/g, "/");
		const updated_plot_call = match[0].substring(0, match[0].lastIndexOf(')')) + `, [png_file, "${tempFile}"])`;
		const substitute = `${updated_plot_call}; print ('${TOGGLE_HTML_SIGIL}<img src="${Platform.resourcePathPrefix + tempFile}" align="center">${TOGGLE_HTML_SIGIL}');`;

		source = source.replace(match[0], substitute);
	}

	return source;
}

