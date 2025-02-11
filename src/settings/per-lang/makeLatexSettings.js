import { Setting } from "obsidian";
import { DEFAULT_SETTINGS } from "../Settings";
import { updateBodyClass } from "src/transforms/LatexTransformer";
import { parse } from "src/output/RegExpUtilities";
export default (tab, containerEl) => {
    const s = tab.plugin.settings;
    const linkTexDistributions = "Distributed through <a href='https://miktex.org/'>MiKTeX</a> or <a href='https://www.tug.org/texlive/'>TeX Live</a>.";
    const linkInkscape = "Download <a href='https://inkscape.org/'>Inkscape</a>.";
    containerEl.createEl('h3', { text: 'LaTeX Settings' });
    containerEl.createEl('h4', { text: 'Code injection' });
    new Setting(containerEl)
        .setName('Default document class')
        .addText(text => text
        .setPlaceholder('disabled')
        .setValue(s.latexDocumentclass)
        .onChange(async (value) => {
        const sanitized = value.trim();
        s.latexDocumentclass = sanitized;
        console.log(`Default documentclass set to: ${sanitized}`);
        await tab.plugin.saveSettings();
    }))
        .descEl.innerHTML = `Inject ${selectableText('\\documentclass{}')} if no class is specified. The document class macro is always moved to the very top of code blocks.
            Set empty to disable, default is ${selectableText(DEFAULT_SETTINGS.latexDocumentclass, true)}.`;
    new Setting(containerEl)
        .setName('Adopt fonts')
        .addDropdown(dropdown => dropdown
        .addOptions({ '': 'Disabled', system: "Use system default", obsidian: 'Same as Obsidian' })
        .setValue(s.latexAdaptFont)
        .onChange(async (value) => {
        s.latexAdaptFont = value;
        console.log(value ? `Now using ${value} fonts.` : 'Now keeping default fonts.');
        await tab.plugin.saveSettings();
    }))
        .descEl.innerHTML = `Inject fontspec ${selectableText('\\setmainfont{}')}, ${selectableText('\\setsansfont{}')}, ${selectableText('\\setmonofont{}')} to the top of code blocks. 
            Ignores fonts that can not be loaded by CSS. Skipped if PdfLaTeX is used. Default is ${DEFAULT_SETTINGS.latexAdaptFont === "" ? 'disabled' : DEFAULT_SETTINGS.latexAdaptFont}.`;
    tab.makeInjectSetting(containerEl, "latex");
    containerEl.createEl('h4', { text: 'LaTeX Compiler' });
    new Setting(containerEl)
        .setName('Compiler path')
        .addText(text => text
        .setPlaceholder(`Example: ${DEFAULT_SETTINGS.latexCompilerPath}`)
        .setValue(s.latexCompilerPath)
        .onChange(async (value) => {
        const sanitized = tab.sanitizePath(value);
        s.latexCompilerPath = sanitized;
        console.log(`latex compiler path set to: ${sanitized}`);
        await tab.plugin.saveSettings();
    }))
        .descEl.innerHTML = `The path to your LuaLaTeX installation. Or use PdfLaTeX, XeLaTeX. ${linkTexDistributions}`;
    new Setting(containerEl.createDiv())
        .setName('Compiler arguments')
        .addText(text => text
        .setValue(s.latexCompilerArgs)
        .onChange(async (value) => {
        const sanitized = value.trim();
        s.latexCompilerArgs = sanitized;
        console.log(`LaTeX args set to: ${sanitized}`);
        await tab.plugin.saveSettings();
    }))
        .descEl.innerHTML = `${selectableText('-shell-escape')} Allow LaTeX packages to execute external programs. 
            Default is ${selectableText(DEFAULT_SETTINGS.latexCompilerArgs)}.`;
    containerEl.createEl('h4', { text: 'Post-processing' });
    new Setting(containerEl)
        .setName('Crop to content')
        .addToggle(toggle => toggle
        .setValue(s.latexDoCrop)
        .onChange(async (value) => {
        s.latexDoCrop = value;
        showSubSettings(requiresCrop, value);
        console.log(value ? 'Now cropping pdf to content.' : "Now keeping entire page.");
        await tab.plugin.saveSettings();
    }))
        .descEl.innerHTML = `Crop PDF to visible content area with pdfcrop. Default is ${DEFAULT_SETTINGS.latexDoCrop ? 'on' : 'off'}.`;
    const requiresCrop = containerEl.createDiv();
    showSubSettings(requiresCrop, s.latexDoCrop);
    new Setting(requiresCrop.createDiv())
        .setName('Pdfcrop path')
        .addText(text => text
        .setPlaceholder(`Example: ${DEFAULT_SETTINGS.latexCropPath}`)
        .setValue(s.latexCropPath)
        .onChange(async (value) => {
        const sanitized = tab.sanitizePath(value);
        s.latexCropPath = sanitized;
        console.log(`latex compiler path set to: ${sanitized}`);
        await tab.plugin.saveSettings();
    }))
        .descEl.innerHTML = `The path to your pdfcrop installation. ${linkTexDistributions}`;
    new Setting(requiresCrop.createDiv())
        .setName('Pdfcrop arguments')
        .addText(text => text
        .setPlaceholder("Example: --margins 10")
        .setValue(s.latexCropArgs)
        .onChange(async (value) => {
        const sanitized = value.trim();
        s.latexCropArgs = sanitized;
        console.log(`LaTeX args set to: ${sanitized}`);
        await tab.plugin.saveSettings();
    }))
        .descEl.innerHTML = `${selectableText('--margins 10')} Whitespace in all directions. ${selectableText('--margins "left top right bottom"')} Specify margins. 
            Default is ${selectableText(DEFAULT_SETTINGS.latexCropArgs)}.`;
    new Setting(requiresCrop.createDiv())
        .setName('Disable page number')
        .addToggle(toggle => toggle
        .setValue(s.latexCropNoPagenum)
        .onChange(async (value) => {
        s.latexCropNoPagenum = value;
        console.log(value ? 'Now disabling page number for cropping.' : "Now keeping page number for cropping.");
        await tab.plugin.saveSettings();
    }))
        .descEl.innerHTML = `Inject ${selectableText('\\pagestyle{empty}')} to reduce the height of the content. 
            Default is ${DEFAULT_SETTINGS.latexCropNoPagenum ? 'on' : 'off'}.`;
    new Setting(requiresCrop.createDiv())
        .setName('Exclude standalone')
        .addToggle(toggle => toggle
        .setValue(s.latexCropNoStandalone)
        .onChange(async (value) => {
        s.latexCropNoStandalone = value;
        console.log(value ? 'Now excluding standalone for cropping.' : "Now including standalone for cropping.");
        await tab.plugin.saveSettings();
    }))
        .descEl.innerHTML = `Skip if document class ${selectableText('standalone')} is used, because it is already cropped. 
            Default is ${DEFAULT_SETTINGS.latexCropNoStandalone ? 'on' : 'off'}.`;
    new Setting(containerEl)
        .setName('Save PDF')
        .addToggle(toggle => toggle
        .setValue(s.latexSavePdf)
        .onChange(async (value) => {
        s.latexSavePdf = value;
        console.log(value ? 'Now saving PDFs.' : "Now discarding PDFs.");
        await tab.plugin.saveSettings();
    }))
        .descEl.innerHTML = `Save the generated PDF as attachment. Default is ${DEFAULT_SETTINGS.latexSavePdf ? 'on' : 'off'}.`;
    new Setting(containerEl)
        .setName('Convert to SVG')
        .addDropdown(dropdown => dropdown
        .addOptions({ '': 'Disabled', poppler: 'Poppler: draw fonts perfectly', inkscape: 'Inkscape: keep text editable' })
        .setValue(s.latexSaveSvg)
        .onChange(async (value) => {
        s.latexSaveSvg = value;
        showSubSettings(requiresSvg, value === 'poppler');
        showSubSettings(requiresInkscape, value === 'inkscape');
        console.log(value === "" ? 'Now discarding SVGs.' : `Svg converter set to: ${value}`);
        await tab.plugin.saveSettings();
    }))
        .descEl.innerHTML = `Convert the PDF to SVG and save it as attachment. Background is transparant. 
            Default is ${DEFAULT_SETTINGS.latexSaveSvg === "" ? 'disabled' : DEFAULT_SETTINGS.latexSaveSvg}.`;
    const requiresSvg = containerEl.createDiv();
    showSubSettings(requiresSvg, s.latexSaveSvg === 'poppler');
    new Setting(requiresSvg.createDiv())
        .setName('SVG converter path')
        .addText(text => text
        .setPlaceholder(`Example: ${DEFAULT_SETTINGS.latexSvgPath}`)
        .setValue(s.latexSvgPath)
        .onChange(async (value) => {
        const sanitized = tab.sanitizePath(value);
        s.latexSvgPath = sanitized;
        console.log(`Pdftocairo path for svg set to: ${sanitized}`);
        await tab.plugin.saveSettings();
    }))
        .descEl.innerHTML = `The path to your pdftocairo installation. ${linkTexDistributions}`;
    new Setting(requiresSvg.createDiv())
        .setName('SVG converter arguments')
        .addText(text => text
        .setValue(s.latexSvgArgs)
        .onChange(async (value) => {
        const sanitized = value.trim();
        s.latexSvgArgs = sanitized;
        console.log(`Pdftocairo args for svg set to: ${sanitized}`);
        await tab.plugin.saveSettings();
    }))
        .descEl.innerHTML = `Default is ${selectableText(DEFAULT_SETTINGS.latexSvgArgs)}.`;
    const requiresInkscape = containerEl.createDiv();
    showSubSettings(requiresInkscape, s.latexSaveSvg === 'inkscape');
    new Setting(requiresInkscape.createDiv())
        .setName('Inkscape path')
        .addText(text => text
        .setPlaceholder(`Example: ${DEFAULT_SETTINGS.latexInkscapePath}`)
        .setValue(s.latexInkscapePath)
        .onChange(async (value) => {
        const sanitized = tab.sanitizePath(value);
        s.latexInkscapePath = sanitized;
        console.log(`latex compiler path set to: ${sanitized}`);
        await tab.plugin.saveSettings();
    }))
        .descEl.innerHTML = `The path to your Inkscape installation. ${linkInkscape}`;
    new Setting(requiresInkscape.createDiv())
        .setName('Inkscape arguments')
        .addText(text => text
        .setValue(s.latexInkscapeArgs)
        .onChange(async (value) => {
        const sanitized = value.trim();
        s.latexInkscapeArgs = sanitized;
        console.log(`LaTeX args set to: ${sanitized}`);
        await tab.plugin.saveSettings();
    }))
        .descEl.innerHTML = `${selectableText('--pdf-font-strategy=draw-missing|substitute|keep|…')} How fonts are parsed in the internal PDF importer. 
            Default is ${selectableText(DEFAULT_SETTINGS.latexInkscapeArgs)}.`;
    new Setting(containerEl)
        .setName('Convert to PNG')
        .addToggle(toggle => toggle
        .setValue(s.latexSavePng)
        .onChange(async (value) => {
        s.latexSavePng = value;
        showSubSettings(requiresPng, value);
        console.log(value ? 'Now generation PNGs.' : "Now discarding PNGs.");
        await tab.plugin.saveSettings();
    }))
        .descEl.innerHTML = `Convert the PDF to PNG and save it as attachment. Default is ${DEFAULT_SETTINGS.latexSavePng ? 'on' : 'off'}.`;
    const requiresPng = containerEl.createDiv();
    showSubSettings(requiresPng, s.latexSavePng);
    new Setting(requiresPng.createDiv())
        .setName('PNG converter path')
        .addText(text => text
        .setPlaceholder(`Example: ${DEFAULT_SETTINGS.latexPngPath}`)
        .setValue(s.latexPngPath)
        .onChange(async (value) => {
        const sanitized = tab.sanitizePath(value);
        s.latexPngPath = sanitized;
        console.log(`Pdftocairo args for png set to: ${sanitized}`);
        await tab.plugin.saveSettings();
    }))
        .descEl.innerHTML = `The path to your pdftocairo installation. ${linkTexDistributions}`;
    new Setting(requiresPng.createDiv())
        .setName('PNG converter arguments')
        .addText(text => text
        .setValue(s.latexPngArgs)
        .onChange(async (value) => {
        const sanitized = value.trim();
        s.latexPngArgs = sanitized;
        console.log(`Pdftocairo args for png set to: ${sanitized}`);
        await tab.plugin.saveSettings();
    }))
        .descEl.innerHTML = `${selectableText('-transp')} Transparent background. ${selectableText('-gray')} Grayscale. ${selectableText('-mono')} Monochrome. 
            ${selectableText('-f int')} Page to save. Default is ${selectableText(DEFAULT_SETTINGS.latexPngArgs)}.`;
    containerEl.createEl('h4', { text: 'Appearance' });
    new Setting(containerEl)
        .setName('Output embeddings')
        .addToggle(toggle => toggle
        .setValue(s.latexOutputEmbeddings)
        .onChange(async (value) => {
        s.latexOutputEmbeddings = value;
        console.log(value ? 'Now embedding figures.' : `Now linking figures.`);
        await tab.plugin.saveSettings();
    }))
        .descEl.innerHTML = `When running a LaTeX code block, show embeddings of saved figures. Default is ${DEFAULT_SETTINGS.latexOutputEmbeddings ? 'on' : 'off'}.`;
    new Setting(containerEl)
        .setName('Center SVGs')
        .addToggle(toggle => toggle
        .setValue(s.latexCenterFigures)
        .onChange(async (value) => {
        s.latexCenterFigures = value;
        console.log(value ? 'Now centering SVGs.' : `Now left aligning SVGs.`);
        updateBodyClass('center-latex-figures', value);
        await tab.plugin.saveSettings();
    }))
        .descEl.innerHTML = `Horizontally align SVGs whose filename starts with ${selectableText('figure')}. 
            Default is ${DEFAULT_SETTINGS.latexCenterFigures ? 'on' : 'off'}.`;
    new Setting(containerEl)
        .setName('Invert SVGs in dark mode')
        .addToggle(toggle => toggle
        .setValue(s.latexInvertFigures)
        .onChange(async (value) => {
        s.latexInvertFigures = value;
        console.log(value ? 'Now inverting SVGs.' : `Now not inverting SVGs.`);
        updateBodyClass('invert-latex-figures', value);
        await tab.plugin.saveSettings();
    }))
        .descEl.innerHTML = `If dark mode is enabled, invert the color of SVGs whose filename starts with ${selectableText('figure')}. 
            Default is ${DEFAULT_SETTINGS.latexInvertFigures ? 'on' : 'off'}.`;
    containerEl.createEl('h4', { text: 'Troubleshooting' });
    const maxFigures = containerEl.createDiv();
    new Setting(maxFigures)
        .setName('Keep last n unnamed figures')
        .addText(text => text
        .setPlaceholder('unlimited')
        .setValue(s.latexMaxFigures === Infinity ? "" : `${s.latexMaxFigures}`)
        .onChange(async (value) => {
        const numValue = value === "" ? Infinity : Number(value);
        const isValid = isIntegerOrInfinity(numValue) && numValue > 0;
        updateTextColor(maxFigures, isValid);
        if (isValid) {
            s.latexMaxFigures = numValue;
            console.log(`max number of figures set to: ${numValue}`);
            await tab.plugin.saveSettings();
        }
    }))
        .descEl.innerHTML = `Generated attachments receive an increasing index. To prevent too many files from piling up, jump back to zero after <i>n</i> executions. 
            Set empty for unlimited. Default is ${selectableText(DEFAULT_SETTINGS.latexMaxFigures.toString(), true)}.`;
    maxFigures.querySelector('input').type = "number";
    const captureFigureName = containerEl.createDiv();
    new Setting(captureFigureName)
        .setName('Capture figure name')
        .addText(text => text
        .setPlaceholder('/regex/')
        .setValue(`${s.latexFigureTitlePattern}`)
        .onChange(async (value) => {
        const pattern = parse(value);
        const isValid = pattern != undefined;
        updateTextColor(captureFigureName, isValid);
        if (isValid) {
            s.latexFigureTitlePattern = pattern.toString();
            console.log('capture figure name pattern set to: ' + pattern);
            await tab.plugin.saveSettings();
        }
    }))
        .descEl.innerHTML = `Search LaTeX code block for ${selectableText('\\title{…}')} to retrieve the figure name: 
            ${selectableText(/[^\n][^%`]*/.source)} Ignore comments after % symbol. ${selectableText(/(?<name>.*?)/.source)} Capture group for figure name.
            Default is ${selectableText(DEFAULT_SETTINGS.latexFigureTitlePattern)}.`;
    new Setting(containerEl)
        .setName('Filter output')
        .addToggle(toggle => toggle
        .setValue(s.latexDoFilter)
        .onChange(async (value) => {
        s.latexDoFilter = value;
        showSubSettings(requiresTexfot, value);
        console.log(value ? 'Now filtering latex stdout with texfot.' : 'Now showing full latex stdout.');
        await tab.plugin.saveSettings();
    }))
        .descEl.innerHTML = `Filtering stdout to relevant messages with texfot. Default is ${DEFAULT_SETTINGS.latexKeepLog ? 'on' : 'off'}.`;
    const requiresTexfot = containerEl.createDiv();
    showSubSettings(requiresTexfot, s.latexDoFilter);
    new Setting(requiresTexfot.createDiv())
        .setName('Texfot path')
        .addText(text => text
        .setPlaceholder(`Example: ${DEFAULT_SETTINGS.latexTexfotPath}`)
        .setValue(s.latexTexfotPath)
        .onChange(async (value) => {
        const sanitized = tab.sanitizePath(value);
        s.latexTexfotPath = sanitized;
        console.log(`texfot path set to: ${sanitized}`);
        await tab.plugin.saveSettings();
    }))
        .descEl.innerHTML = `The path to your texfot installation. ${linkTexDistributions}`;
    new Setting(requiresTexfot.createDiv())
        .setName('Texfot arguments')
        .addText(text => text
        .setPlaceholder(`Example: ${DEFAULT_SETTINGS.latexTexfotArgs}`)
        .setValue(s.latexTexfotArgs)
        .onChange(async (value) => {
        const sanitized = value.trim();
        s.latexTexfotArgs = sanitized;
        console.log(`texfot arguments set to: ${sanitized}`);
        await tab.plugin.saveSettings();
    }))
        .descEl.innerHTML = `${selectableText('--accept regex')}, ${selectableText('--ignore regex')} Filter lines in the TeX output matching RegExp. 
            Default is ${selectableText(DEFAULT_SETTINGS.latexTexfotArgs)}.`;
    new Setting(containerEl)
        .setName('Keep log')
        .addToggle(toggle => toggle
        .setValue(s.latexKeepLog)
        .onChange(async (value) => {
        s.latexKeepLog = value;
        console.log(value ? 'Now preserving latex build folder.' : "Now clearing latex build folder.");
        await tab.plugin.saveSettings();
    }))
        .descEl.innerHTML = `Prevent deletion of temporary build folder. Default is ${DEFAULT_SETTINGS.latexKeepLog ? 'on' : 'off'}.`;
    new Setting(containerEl)
        .setName('Run subprocesses in shell')
        .addToggle(toggle => toggle
        .setValue(s.latexSubprocessesUseShell)
        .onChange(async (value) => {
        s.latexSubprocessesUseShell = value;
        console.log(value ? 'Now running subprocesses in shell.' : 'Now running subprocesses directly.');
        await tab.plugin.saveSettings();
    }))
        .descEl.innerHTML = `Run compilation and conversion tools in shell environment. Default is ${DEFAULT_SETTINGS.latexSubprocessesUseShell ? 'on' : 'off'}.`;
};
function showSubSettings(settingsDiv, doShow) {
    settingsDiv.setAttr('style', doShow ? 'display: block' : 'display: none');
}
function updateTextColor(containerEl, isValid) {
    const inputEl = containerEl.querySelector('input');
    inputEl.style.color = isValid ? '' : 'red';
}
function isIntegerOrInfinity(value) {
    return Number.isInteger(value) || value === Infinity;
}
function selectableText(text, noMonospace) {
    if (noMonospace)
        return `<span class='selectable-description-text'>${text}</span>`;
    const escapedAngleBrackets = text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return `<span><code class='selectable-description-text'>${escapedAngleBrackets}</code></span>`;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFrZUxhdGV4U2V0dGluZ3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJtYWtlTGF0ZXhTZXR0aW5ncy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sVUFBVSxDQUFDO0FBRW5DLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLGFBQWEsQ0FBQztBQUMvQyxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0saUNBQWlDLENBQUM7QUFDbEUsT0FBTyxFQUFFLEtBQUssRUFBRSxNQUFNLDRCQUE0QixDQUFDO0FBRW5ELGVBQWUsQ0FBQyxHQUFnQixFQUFFLFdBQXdCLEVBQUUsRUFBRTtJQUMxRCxNQUFNLENBQUMsR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQztJQUM5QixNQUFNLG9CQUFvQixHQUFHLHNIQUFzSCxDQUFDO0lBQ3BKLE1BQU0sWUFBWSxHQUFHLHdEQUF3RCxDQUFDO0lBQzlFLFdBQVcsQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLEVBQUUsSUFBSSxFQUFFLGdCQUFnQixFQUFFLENBQUMsQ0FBQztJQUV2RCxXQUFXLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxFQUFFLElBQUksRUFBRSxnQkFBZ0IsRUFBRSxDQUFDLENBQUM7SUFDdkQsSUFBSSxPQUFPLENBQUMsV0FBVyxDQUFDO1NBQ25CLE9BQU8sQ0FBQyx3QkFBd0IsQ0FBQztTQUNqQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJO1NBQ2hCLGNBQWMsQ0FBQyxVQUFVLENBQUM7U0FDMUIsUUFBUSxDQUFDLENBQUMsQ0FBQyxrQkFBa0IsQ0FBQztTQUM5QixRQUFRLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxFQUFFO1FBQ3RCLE1BQU0sU0FBUyxHQUFHLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQTtRQUM5QixDQUFDLENBQUMsa0JBQWtCLEdBQUcsU0FBUyxDQUFDO1FBQ2pDLE9BQU8sQ0FBQyxH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QUFXO1FBQUUsT0FBTyw2Q0FBNkMsSUFBSSxTQUFTLENBQUM7SUFFbkYsTUFBTSxvQkFBb0IsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxDQUFDO0lBQzlFLE9BQU8sbURBQW1ELG9CQUFvQixnQkFBZ0IsQ0FBQztBQUNuRyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgU2V0dGluZyB9IGZyb20gXCJvYnNpZGlhblwiO1xyXG5pbXBvcnQgeyBTZXR0aW5nc1RhYiB9IGZyb20gXCIuLi9TZXR0aW5nc1RhYlwiO1xyXG5pbXBvcnQgeyBERUZBVUxUX1NFVFRJTkdTIH0gZnJvbSBcIi4uL1NldHRpbmdzXCI7XHJcbmltcG9ydCB7IHVwZGF0ZUJvZHlDbGFzcyB9IGZyb20gXCJzcmMvdHJhbnNmb3Jtcy9MYXRleFRyYW5zZm9ybWVyXCI7XHJcbmltcG9ydCB7IHBhcnNlIH0gZnJvbSBcInNyYy9vdXRwdXQvUmVnRXhwVXRpbGl0aWVzXCI7XHJcblxyXG5leHBvcnQgZGVmYXVsdCAodGFiOiBTZXR0aW5nc1RhYiwgY29udGFpbmVyRWw6IEhUTUxFbGVtZW50KSA9PiB7XHJcbiAgICBjb25zdCBzID0gdGFiLnBsdWdpbi5zZXR0aW5ncztcclxuICAgIGNvbnN0IGxpbmtUZXhEaXN0cmlidXRpb25zID0gXCJEaXN0cmlidXRlZCB0aHJvdWdoIDxhIGhyZWY9J2h0dHBzOi8vbWlrdGV4Lm9yZy8nPk1pS1RlWDwvYT4gb3IgPGEgaHJlZj0naHR0cHM6Ly93d3cudHVnLm9yZy90ZXhsaXZlLyc+VGVYIExpdmU8L2E+LlwiO1xyXG4gICAgY29uc3QgbGlua0lua3NjYXBlID0gXCJEb3dubG9hZCA8YSBocmVmPSdodHRwczovL2lua3NjYXBlLm9yZy8nPklua3NjYXBlPC9hPi5cIjtcclxuICAgIGNvbnRhaW5lckVsLmNyZWF0ZUVsKCdoMycsIHsgdGV4dDogJ0xhVGVYIFNldHRpbmdzJyB9KTtcclxuXHJcbiAgICBjb250YWluZXJFbC5jcmVhdGVFbCgnaDQnLCB7IHRleHQ6ICdDb2RlIGluamVjdGlvbicgfSk7XHJcbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcclxuICAgICAgICAuc2V0TmFtZSgnRGVmYXVsdCBkb2N1bWVudCBjbGFzcycpXHJcbiAgICAgICAgLmFkZFRleHQodGV4dCA9PiB0ZXh0XHJcbiAgICAgICAgICAgIC5zZXRQbGFjZWhvbGRlcignZGlzYWJsZWQnKVxyXG4gICAgICAgICAgICAuc2V0VmFsdWUocy5sYXRleERvY3VtZW50Y2xhc3MpXHJcbiAgICAgICAgICAgIC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHNhbml0aXplZCA9IHZhbHVlLnRyaW0oKVxyXG4gICAgICAgICAgICAgICAgcy5sYXRleERvY3VtZW50Y2xhc3MgPSBzYW5pdGl6ZWQ7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgRGVmYXVsdCBkb2N1bWVudGNsYXNzIHNldCB0bzogJHtzYW5pdGl6ZWR9YCk7XHJcbiAgICAgICAgICAgICAgICBhd2FpdCB0YWIucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xyXG4gICAgICAgICAgICB9KSlcclxuICAgICAgICAuZGVzY0VsLmlubmVySFRNTCA9IGBJbmplY3QgJHtzZWxlY3RhYmxlVGV4dCgnXFxcXGRvY3VtZW50Y2xhc3N7fScpfSBpZiBubyBjbGFzcyBpcyBzcGVjaWZpZWQuIFRoZSBkb2N1bWVudCBjbGFzcyBtYWNybyBpcyBhbHdheXMgbW92ZWQgdG8gdGhlIHZlcnkgdG9wIG9mIGNvZGUgYmxvY2tzLlxyXG4gICAgICAgICAgICBTZXQgZW1wdHkgdG8gZGlzYWJsZSwgZGVmYXVsdCBpcyAke3NlbGVjdGFibGVUZXh0KERFRkFVTFRfU0VUVElOR1MubGF0ZXhEb2N1bWVudGNsYXNzLCB0cnVlKX0uYDtcclxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxyXG4gICAgICAgIC5zZXROYW1lKCdBZG9wdCBmb250cycpXHJcbiAgICAgICAgLmFkZERyb3Bkb3duKGRyb3Bkb3duID0+IGRyb3Bkb3duXHJcbiAgICAgICAgICAgIC5hZGRPcHRpb25zKHsgJyc6ICdEaXNhYmxlZCcsIHN5c3RlbTogXCJVc2Ugc3lzdGVtIGRlZmF1bHRcIiwgb2JzaWRpYW46ICdTYW1lIGFzIE9ic2lkaWFuJyB9KVxyXG4gICAgICAgICAgICAuc2V0VmFsdWUocy5sYXRleEFkYXB0Rm9udClcclxuICAgICAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZTogdHlwZW9mIHMubGF0ZXhBZGFwdEZvbnQpID0+IHtcclxuICAgICAgICAgICAgICAgIHMubGF0ZXhBZGFwdEZvbnQgPSB2YWx1ZTtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHZhbHVlID8gYE5vdyB1c2luZyAke3ZhbHVlfSBmb250cy5gIDogJ05vdyBrZWVwaW5nIGRlZmF1bHQgZm9udHMuJyk7XHJcbiAgICAgICAgICAgICAgICBhd2FpdCB0YWIucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xyXG4gICAgICAgICAgICB9KSlcclxuICAgICAgICAuZGVzY0VsLmlubmVySFRNTCA9IGBJbmplY3QgZm9udHNwZWMgJHtzZWxlY3RhYmxlVGV4dCgnXFxcXHNldG1haW5mb250e30nKX0sICR7c2VsZWN0YWJsZVRleHQoJ1xcXFxzZXRzYW5zZm9udHt9Jyl9LCAke3NlbGVjdGFibGVUZXh0KCdcXFxcc2V0bW9ub2ZvbnR7fScpfSB0byB0aGUgdG9wIG9mIGNvZGUgYmxvY2tzLiBcclxuICAgICAgICAgICAgSWdub3JlcyBmb250cyB0aGF0IGNhbiBub3QgYmUgbG9hZGVkIGJ5IENTUy4gU2tpcHBlZCBpZiBQZGZMYVRlWCBpcyB1c2VkLiBEZWZhdWx0IGlzICR7REVGQVVMVF9TRVRUSU5HUy5sYXRleEFkYXB0Rm9udCA9PT0gXCJcIiA/ICdkaXNhYmxlZCcgOiBERUZBVUxUX1NFVFRJTkdTLmxhdGV4QWRhcHRGb250fS5gO1xyXG4gICAgdGFiLm1ha2VJbmplY3RTZXR0aW5nKGNvbnRhaW5lckVsLCBcImxhdGV4XCIpO1xyXG5cclxuXHJcbiAgICBjb250YWluZXJFbC5jcmVhdGVFbCgnaDQnLCB7IHRleHQ6ICdMYVRlWCBDb21waWxlcicgfSk7XHJcbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcclxuICAgICAgICAuc2V0TmFtZSgnQ29tcGlsZXIgcGF0aCcpXHJcbiAgICAgICAgLmFkZFRleHQodGV4dCA9PiB0ZXh0XHJcbiAgICAgICAgICAgIC5zZXRQbGFjZWhvbGRlcihgRXhhbXBsZTogJHtERUZBVUxUX1NFVFRJTkdTLmxhdGV4Q29tcGlsZXJQYXRofWApXHJcbiAgICAgICAgICAgIC5zZXRWYWx1ZShzLmxhdGV4Q29tcGlsZXJQYXRoKVxyXG4gICAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBzYW5pdGl6ZWQgPSB0YWIuc2FuaXRpemVQYXRoKHZhbHVlKTtcclxuICAgICAgICAgICAgICAgIHMubGF0ZXhDb21waWxlclBhdGggPSBzYW5pdGl6ZWQ7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgbGF0ZXggY29tcGlsZXIgcGF0aCBzZXQgdG86ICR7c2FuaXRpemVkfWApO1xyXG4gICAgICAgICAgICAgICAgYXdhaXQgdGFiLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcclxuICAgICAgICAgICAgfSkpXHJcbiAgICAgICAgLmRlc2NFbC5pbm5lckhUTUwgPSBgVGhlIHBhdGggdG8geW91ciBMdWFMYVRlWCBpbnN0YWxsYXRpb24uIE9yIHVzZSBQZGZMYVRlWCwgWGVMYVRlWC4gJHtsaW5rVGV4RGlzdHJpYnV0aW9uc31gO1xyXG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwuY3JlYXRlRGl2KCkpXHJcbiAgICAgICAgLnNldE5hbWUoJ0NvbXBpbGVyIGFyZ3VtZW50cycpXHJcbiAgICAgICAgLmFkZFRleHQodGV4dCA9PiB0ZXh0XHJcbiAgICAgICAgICAgIC5zZXRWYWx1ZShzLmxhdGV4Q29tcGlsZXJBcmdzKVxyXG4gICAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBzYW5pdGl6ZWQgPSB2YWx1ZS50cmltKCk7XHJcbiAgICAgICAgICAgICAgICBzLmxhdGV4Q29tcGlsZXJBcmdzID0gc2FuaXRpemVkO1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYExhVGVYIGFyZ3Mgc2V0IHRvOiAke3Nhbml0aXplZH1gKTtcclxuICAgICAgICAgICAgICAgIGF3YWl0IHRhYi5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XHJcbiAgICAgICAgICAgIH0pKVxyXG4gICAgICAgIC5kZXNjRWwuaW5uZXJIVE1MID0gYCR7c2VsZWN0YWJsZVRleHQoJy1zaGVsbC1lc2NhcGUnKX0gQWxsb3cgTGFUZVggcGFja2FnZXMgdG8gZXhlY3V0ZSBleHRlcm5hbCBwcm9ncmFtcy4gXHJcbiAgICAgICAgICAgIERlZmF1bHQgaXMgJHtzZWxlY3RhYmxlVGV4dChERUZBVUxUX1NFVFRJTkdTLmxhdGV4Q29tcGlsZXJBcmdzKX0uYDtcclxuXHJcblxyXG4gICAgY29udGFpbmVyRWwuY3JlYXRlRWwoJ2g0JywgeyB0ZXh0OiAnUG9zdC1wcm9jZXNzaW5nJyB9KTtcclxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxyXG4gICAgICAgIC5zZXROYW1lKCdDcm9wIHRvIGNvbnRlbnQnKVxyXG4gICAgICAgIC5hZGRUb2dnbGUodG9nZ2xlID0+IHRvZ2dsZVxyXG4gICAgICAgICAgICAuc2V0VmFsdWUocy5sYXRleERvQ3JvcClcclxuICAgICAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgcy5sYXRleERvQ3JvcCA9IHZhbHVlO1xyXG4gICAgICAgICAgICAgICAgc2hvd1N1YlNldHRpbmdzKHJlcXVpcmVzQ3JvcCwgdmFsdWUpXHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyh2YWx1ZSA/ICdOb3cgY3JvcHBpbmcgcGRmIHRvIGNvbnRlbnQuJyA6IFwiTm93IGtlZXBpbmcgZW50aXJlIHBhZ2UuXCIpO1xyXG4gICAgICAgICAgICAgICAgYXdhaXQgdGFiLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcclxuICAgICAgICAgICAgfSkpXHJcbiAgICAgICAgLmRlc2NFbC5pbm5lckhUTUwgPSBgQ3JvcCBQREYgdG8gdmlzaWJsZSBjb250ZW50IGFyZWEgd2l0aCBwZGZjcm9wLiBEZWZhdWx0IGlzICR7REVGQVVMVF9TRVRUSU5HUy5sYXRleERvQ3JvcCA/ICdvbicgOiAnb2ZmJ30uYDtcclxuICAgIGNvbnN0IHJlcXVpcmVzQ3JvcCA9IGNvbnRhaW5lckVsLmNyZWF0ZURpdigpO1xyXG4gICAgc2hvd1N1YlNldHRpbmdzKHJlcXVpcmVzQ3JvcCwgcy5sYXRleERvQ3JvcCk7XHJcbiAgICBuZXcgU2V0dGluZyhyZXF1aXJlc0Nyb3AuY3JlYXRlRGl2KCkpXHJcbiAgICAgICAgLnNldE5hbWUoJ1BkZmNyb3AgcGF0aCcpXHJcbiAgICAgICAgLmFkZFRleHQodGV4dCA9PiB0ZXh0XHJcbiAgICAgICAgICAgIC5zZXRQbGFjZWhvbGRlcihgRXhhbXBsZTogJHtERUZBVUxUX1NFVFRJTkdTLmxhdGV4Q3JvcFBhdGh9YClcclxuICAgICAgICAgICAgLnNldFZhbHVlKHMubGF0ZXhDcm9wUGF0aClcclxuICAgICAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgY29uc3Qgc2FuaXRpemVkID0gdGFiLnNhbml0aXplUGF0aCh2YWx1ZSk7XHJcbiAgICAgICAgICAgICAgICBzLmxhdGV4Q3JvcFBhdGggPSBzYW5pdGl6ZWQ7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgbGF0ZXggY29tcGlsZXIgcGF0aCBzZXQgdG86ICR7c2FuaXRpemVkfWApO1xyXG4gICAgICAgICAgICAgICAgYXdhaXQgdGFiLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcclxuICAgICAgICAgICAgfSkpXHJcbiAgICAgICAgLmRlc2NFbC5pbm5lckhUTUwgPSBgVGhlIHBhdGggdG8geW91ciBwZGZjcm9wIGluc3RhbGxhdGlvbi4gJHtsaW5rVGV4RGlzdHJpYnV0aW9uc31gO1xyXG4gICAgbmV3IFNldHRpbmcocmVxdWlyZXNDcm9wLmNyZWF0ZURpdigpKVxyXG4gICAgICAgIC5zZXROYW1lKCdQZGZjcm9wIGFyZ3VtZW50cycpXHJcbiAgICAgICAgLmFkZFRleHQodGV4dCA9PiB0ZXh0XHJcbiAgICAgICAgICAgIC5zZXRQbGFjZWhvbGRlcihcIkV4YW1wbGU6IC0tbWFyZ2lucyAxMFwiKVxyXG4gICAgICAgICAgICAuc2V0VmFsdWUocy5sYXRleENyb3BBcmdzKVxyXG4gICAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBzYW5pdGl6ZWQgPSB2YWx1ZS50cmltKCk7XHJcbiAgICAgICAgICAgICAgICBzLmxhdGV4Q3JvcEFyZ3MgPSBzYW5pdGl6ZWQ7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgTGFUZVggYXJncyBzZXQgdG86ICR7c2FuaXRpemVkfWApO1xyXG4gICAgICAgICAgICAgICAgYXdhaXQgdGFiLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcclxuICAgICAgICAgICAgfSkpXHJcbiAgICAgICAgLmRlc2NFbC5pbm5lckhUTUwgPSBgJHtzZWxlY3RhYmxlVGV4dCgnLS1tYXJnaW5zIDEwJyl9IFdoaXRlc3BhY2UgaW4gYWxsIGRpcmVjdGlvbnMuICR7c2VsZWN0YWJsZVRleHQoJy0tbWFyZ2lucyBcImxlZnQgdG9wIHJpZ2h0IGJvdHRvbVwiJyl9IFNwZWNpZnkgbWFyZ2lucy4gXHJcbiAgICAgICAgICAgIERlZmF1bHQgaXMgJHtzZWxlY3RhYmxlVGV4dChERUZBVUxUX1NFVFRJTkdTLmxhdGV4Q3JvcEFyZ3MpfS5gO1xyXG4gICAgbmV3IFNldHRpbmcocmVxdWlyZXNDcm9wLmNyZWF0ZURpdigpKVxyXG4gICAgICAgIC5zZXROYW1lKCdEaXNhYmxlIHBhZ2UgbnVtYmVyJylcclxuICAgICAgICAuYWRkVG9nZ2xlKHRvZ2dsZSA9PiB0b2dnbGVcclxuICAgICAgICAgICAgLnNldFZhbHVlKHMubGF0ZXhDcm9wTm9QYWdlbnVtKVxyXG4gICAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBzLmxhdGV4Q3JvcE5vUGFnZW51bSA9IHZhbHVlO1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2codmFsdWUgPyAnTm93IGRpc2FibGluZyBwYWdlIG51bWJlciBmb3IgY3JvcHBpbmcuJyA6IFwiTm93IGtlZXBpbmcgcGFnZSBudW1iZXIgZm9yIGNyb3BwaW5nLlwiKTtcclxuICAgICAgICAgICAgICAgIGF3YWl0IHRhYi5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XHJcbiAgICAgICAgICAgIH0pKVxyXG4gICAgICAgIC5kZXNjRWwuaW5uZXJIVE1MID0gYEluamVjdCAke3NlbGVjdGFibGVUZXh0KCdcXFxccGFnZXN0eWxle2VtcHR5fScpfSB0byByZWR1Y2UgdGhlIGhlaWdodCBvZiB0aGUgY29udGVudC4gXHJcbiAgICAgICAgICAgIERlZmF1bHQgaXMgJHtERUZBVUxUX1NFVFRJTkdTLmxhdGV4Q3JvcE5vUGFnZW51bSA/ICdvbicgOiAnb2ZmJ30uYDtcclxuICAgIG5ldyBTZXR0aW5nKHJlcXVpcmVzQ3JvcC5jcmVhdGVEaXYoKSlcclxuICAgICAgICAuc2V0TmFtZSgnRXhjbHVkZSBzdGFuZGFsb25lJylcclxuICAgICAgICAuYWRkVG9nZ2xlKHRvZ2dsZSA9PiB0b2dnbGVcclxuICAgICAgICAgICAgLnNldFZhbHVlKHMubGF0ZXhDcm9wTm9TdGFuZGFsb25lKVxyXG4gICAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBzLmxhdGV4Q3JvcE5vU3RhbmRhbG9uZSA9IHZhbHVlO1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2codmFsdWUgPyAnTm93IGV4Y2x1ZGluZyBzdGFuZGFsb25lIGZvciBjcm9wcGluZy4nIDogXCJOb3cgaW5jbHVkaW5nIHN0YW5kYWxvbmUgZm9yIGNyb3BwaW5nLlwiKTtcclxuICAgICAgICAgICAgICAgIGF3YWl0IHRhYi5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XHJcbiAgICAgICAgICAgIH0pKVxyXG4gICAgICAgIC5kZXNjRWwuaW5uZXJIVE1MID0gYFNraXAgaWYgZG9jdW1lbnQgY2xhc3MgJHtzZWxlY3RhYmxlVGV4dCgnc3RhbmRhbG9uZScpfSBpcyB1c2VkLCBiZWNhdXNlIGl0IGlzIGFscmVhZHkgY3JvcHBlZC4gXHJcbiAgICAgICAgICAgIERlZmF1bHQgaXMgJHtERUZBVUxUX1NFVFRJTkdTLmxhdGV4Q3JvcE5vU3RhbmRhbG9uZSA/ICdvbicgOiAnb2ZmJ30uYDtcclxuXHJcbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcclxuICAgICAgICAuc2V0TmFtZSgnU2F2ZSBQREYnKVxyXG4gICAgICAgIC5hZGRUb2dnbGUodG9nZ2xlID0+IHRvZ2dsZVxyXG4gICAgICAgICAgICAuc2V0VmFsdWUocy5sYXRleFNhdmVQZGYpXHJcbiAgICAgICAgICAgIC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcclxuICAgICAgICAgICAgICAgIHMubGF0ZXhTYXZlUGRmID0gdmFsdWU7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyh2YWx1ZSA/ICdOb3cgc2F2aW5nIFBERnMuJyA6IFwiTm93IGRpc2NhcmRpbmcgUERGcy5cIik7XHJcbiAgICAgICAgICAgICAgICBhd2FpdCB0YWIucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xyXG4gICAgICAgICAgICB9KSlcclxuICAgICAgICAuZGVzY0VsLmlubmVySFRNTCA9IGBTYXZlIHRoZSBnZW5lcmF0ZWQgUERGIGFzIGF0dGFjaG1lbnQuIERlZmF1bHQgaXMgJHtERUZBVUxUX1NFVFRJTkdTLmxhdGV4U2F2ZVBkZiA/ICdvbicgOiAnb2ZmJ30uYDtcclxuXHJcbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcclxuICAgICAgICAuc2V0TmFtZSgnQ29udmVydCB0byBTVkcnKVxyXG4gICAgICAgIC5hZGREcm9wZG93bihkcm9wZG93biA9PiBkcm9wZG93blxyXG4gICAgICAgICAgICAuYWRkT3B0aW9ucyh7ICcnOiAnRGlzYWJsZWQnLCBwb3BwbGVyOiAnUG9wcGxlcjogZHJhdyBmb250cyBwZXJmZWN0bHknLCBpbmtzY2FwZTogJ0lua3NjYXBlOiBrZWVwIHRleHQgZWRpdGFibGUnIH0pXHJcbiAgICAgICAgICAgIC5zZXRWYWx1ZShzLmxhdGV4U2F2ZVN2ZylcclxuICAgICAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZTogdHlwZW9mIHMubGF0ZXhTYXZlU3ZnKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBzLmxhdGV4U2F2ZVN2ZyA9IHZhbHVlO1xyXG4gICAgICAgICAgICAgICAgc2hvd1N1YlNldHRpbmdzKHJlcXVpcmVzU3ZnLCB2YWx1ZSA9PT0gJ3BvcHBsZXInKVxyXG4gICAgICAgICAgICAgICAgc2hvd1N1YlNldHRpbmdzKHJlcXVpcmVzSW5rc2NhcGUsIHZhbHVlID09PSAnaW5rc2NhcGUnKVxyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2codmFsdWUgPT09IFwiXCIgPyAnTm93IGRpc2NhcmRpbmcgU1ZHcy4nIDogYFN2ZyBjb252ZXJ0ZXIgc2V0IHRvOiAke3ZhbHVlfWApO1xyXG4gICAgICAgICAgICAgICAgYXdhaXQgdGFiLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcclxuICAgICAgICAgICAgfSkpXHJcbiAgICAgICAgLmRlc2NFbC5pbm5lckhUTUwgPSBgQ29udmVydCB0aGUgUERGIHRvIFNWRyBhbmQgc2F2ZSBpdCBhcyBhdHRhY2htZW50LiBCYWNrZ3JvdW5kIGlzIHRyYW5zcGFyYW50LiBcclxuICAgICAgICAgICAgRGVmYXVsdCBpcyAke0RFRkFVTFRfU0VUVElOR1MubGF0ZXhTYXZlU3ZnID09PSBcIlwiID8gJ2Rpc2FibGVkJyA6IERFRkFVTFRfU0VUVElOR1MubGF0ZXhTYXZlU3ZnfS5gO1xyXG4gICAgY29uc3QgcmVxdWlyZXNTdmcgPSBjb250YWluZXJFbC5jcmVhdGVEaXYoKTtcclxuICAgIHNob3dTdWJTZXR0aW5ncyhyZXF1aXJlc1N2Zywgcy5sYXRleFNhdmVTdmcgPT09ICdwb3BwbGVyJylcclxuICAgIG5ldyBTZXR0aW5nKHJlcXVpcmVzU3ZnLmNyZWF0ZURpdigpKVxyXG4gICAgICAgIC5zZXROYW1lKCdTVkcgY29udmVydGVyIHBhdGgnKVxyXG4gICAgICAgIC5hZGRUZXh0KHRleHQgPT4gdGV4dFxyXG4gICAgICAgICAgICAuc2V0UGxhY2Vob2xkZXIoYEV4YW1wbGU6ICR7REVGQVVMVF9TRVRUSU5HUy5sYXRleFN2Z1BhdGh9YClcclxuICAgICAgICAgICAgLnNldFZhbHVlKHMubGF0ZXhTdmdQYXRoKVxyXG4gICAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBzYW5pdGl6ZWQgPSB0YWIuc2FuaXRpemVQYXRoKHZhbHVlKTtcclxuICAgICAgICAgICAgICAgIHMubGF0ZXhTdmdQYXRoID0gc2FuaXRpemVkO1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYFBkZnRvY2Fpcm8gcGF0aCBmb3Igc3ZnIHNldCB0bzogJHtzYW5pdGl6ZWR9YCk7XHJcbiAgICAgICAgICAgICAgICBhd2FpdCB0YWIucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xyXG4gICAgICAgICAgICB9KSlcclxuICAgICAgICAuZGVzY0VsLmlubmVySFRNTCA9IGBUaGUgcGF0aCB0byB5b3VyIHBkZnRvY2Fpcm8gaW5zdGFsbGF0aW9uLiAke2xpbmtUZXhEaXN0cmlidXRpb25zfWA7XHJcbiAgICBuZXcgU2V0dGluZyhyZXF1aXJlc1N2Zy5jcmVhdGVEaXYoKSlcclxuICAgICAgICAuc2V0TmFtZSgnU1ZHIGNvbnZlcnRlciBhcmd1bWVudHMnKVxyXG4gICAgICAgIC5hZGRUZXh0KHRleHQgPT4gdGV4dFxyXG4gICAgICAgICAgICAuc2V0VmFsdWUocy5sYXRleFN2Z0FyZ3MpXHJcbiAgICAgICAgICAgIC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHNhbml0aXplZCA9IHZhbHVlLnRyaW0oKTtcclxuICAgICAgICAgICAgICAgIHMubGF0ZXhTdmdBcmdzID0gc2FuaXRpemVkO1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYFBkZnRvY2Fpcm8gYXJncyBmb3Igc3ZnIHNldCB0bzogJHtzYW5pdGl6ZWR9YCk7XHJcbiAgICAgICAgICAgICAgICBhd2FpdCB0YWIucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xyXG4gICAgICAgICAgICB9KSlcclxuICAgICAgICAuZGVzY0VsLmlubmVySFRNTCA9IGBEZWZhdWx0IGlzICR7c2VsZWN0YWJsZVRleHQoREVGQVVMVF9TRVRUSU5HUy5sYXRleFN2Z0FyZ3MpfS5gO1xyXG4gICAgY29uc3QgcmVxdWlyZXNJbmtzY2FwZSA9IGNvbnRhaW5lckVsLmNyZWF0ZURpdigpO1xyXG4gICAgc2hvd1N1YlNldHRpbmdzKHJlcXVpcmVzSW5rc2NhcGUsIHMubGF0ZXhTYXZlU3ZnID09PSAnaW5rc2NhcGUnKVxyXG4gICAgbmV3IFNldHRpbmcocmVxdWlyZXNJbmtzY2FwZS5jcmVhdGVEaXYoKSlcclxuICAgICAgICAuc2V0TmFtZSgnSW5rc2NhcGUgcGF0aCcpXHJcbiAgICAgICAgLmFkZFRleHQodGV4dCA9PiB0ZXh0XHJcbiAgICAgICAgICAgIC5zZXRQbGFjZWhvbGRlcihgRXhhbXBsZTogJHtERUZBVUxUX1NFVFRJTkdTLmxhdGV4SW5rc2NhcGVQYXRofWApXHJcbiAgICAgICAgICAgIC5zZXRWYWx1ZShzLmxhdGV4SW5rc2NhcGVQYXRoKVxyXG4gICAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBzYW5pdGl6ZWQgPSB0YWIuc2FuaXRpemVQYXRoKHZhbHVlKTtcclxuICAgICAgICAgICAgICAgIHMubGF0ZXhJbmtzY2FwZVBhdGggPSBzYW5pdGl6ZWQ7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgbGF0ZXggY29tcGlsZXIgcGF0aCBzZXQgdG86ICR7c2FuaXRpemVkfWApO1xyXG4gICAgICAgICAgICAgICAgYXdhaXQgdGFiLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcclxuICAgICAgICAgICAgfSkpXHJcbiAgICAgICAgLmRlc2NFbC5pbm5lckhUTUwgPSBgVGhlIHBhdGggdG8geW91ciBJbmtzY2FwZSBpbnN0YWxsYXRpb24uICR7bGlua0lua3NjYXBlfWA7XHJcbiAgICBuZXcgU2V0dGluZyhyZXF1aXJlc0lua3NjYXBlLmNyZWF0ZURpdigpKVxyXG4gICAgICAgIC5zZXROYW1lKCdJbmtzY2FwZSBhcmd1bWVudHMnKVxyXG4gICAgICAgIC5hZGRUZXh0KHRleHQgPT4gdGV4dFxyXG4gICAgICAgICAgICAuc2V0VmFsdWUocy5sYXRleElua3NjYXBlQXJncylcclxuICAgICAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgY29uc3Qgc2FuaXRpemVkID0gdmFsdWUudHJpbSgpO1xyXG4gICAgICAgICAgICAgICAgcy5sYXRleElua3NjYXBlQXJncyA9IHNhbml0aXplZDtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBMYVRlWCBhcmdzIHNldCB0bzogJHtzYW5pdGl6ZWR9YCk7XHJcbiAgICAgICAgICAgICAgICBhd2FpdCB0YWIucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xyXG4gICAgICAgICAgICB9KSlcclxuICAgICAgICAuZGVzY0VsLmlubmVySFRNTCA9IGAke3NlbGVjdGFibGVUZXh0KCctLXBkZi1mb250LXN0cmF0ZWd5PWRyYXctbWlzc2luZ3xzdWJzdGl0dXRlfGtlZXB84oCmJyl9IEhvdyBmb250cyBhcmUgcGFyc2VkIGluIHRoZSBpbnRlcm5hbCBQREYgaW1wb3J0ZXIuIFxyXG4gICAgICAgICAgICBEZWZhdWx0IGlzICR7c2VsZWN0YWJsZVRleHQoREVGQVVMVF9TRVRUSU5HUy5sYXRleElua3NjYXBlQXJncyl9LmA7XHJcblxyXG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXHJcbiAgICAgICAgLnNldE5hbWUoJ0NvbnZlcnQgdG8gUE5HJylcclxuICAgICAgICAuYWRkVG9nZ2xlKHRvZ2dsZSA9PiB0b2dnbGVcclxuICAgICAgICAgICAgLnNldFZhbHVlKHMubGF0ZXhTYXZlUG5nKVxyXG4gICAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBzLmxhdGV4U2F2ZVBuZyA9IHZhbHVlO1xyXG4gICAgICAgICAgICAgICAgc2hvd1N1YlNldHRpbmdzKHJlcXVpcmVzUG5nLCB2YWx1ZSlcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHZhbHVlID8gJ05vdyBnZW5lcmF0aW9uIFBOR3MuJyA6IFwiTm93IGRpc2NhcmRpbmcgUE5Hcy5cIik7XHJcbiAgICAgICAgICAgICAgICBhd2FpdCB0YWIucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xyXG4gICAgICAgICAgICB9KSlcclxuICAgICAgICAuZGVzY0VsLmlubmVySFRNTCA9IGBDb252ZXJ0IHRoZSBQREYgdG8gUE5HIGFuZCBzYXZlIGl0IGFzIGF0dGFjaG1lbnQuIERlZmF1bHQgaXMgJHtERUZBVUxUX1NFVFRJTkdTLmxhdGV4U2F2ZVBuZyA/ICdvbicgOiAnb2ZmJ30uYDtcclxuICAgIGNvbnN0IHJlcXVpcmVzUG5nID0gY29udGFpbmVyRWwuY3JlYXRlRGl2KCk7XHJcbiAgICBzaG93U3ViU2V0dGluZ3MocmVxdWlyZXNQbmcsIHMubGF0ZXhTYXZlUG5nKTtcclxuICAgIG5ldyBTZXR0aW5nKHJlcXVpcmVzUG5nLmNyZWF0ZURpdigpKVxyXG4gICAgICAgIC5zZXROYW1lKCdQTkcgY29udmVydGVyIHBhdGgnKVxyXG4gICAgICAgIC5hZGRUZXh0KHRleHQgPT4gdGV4dFxyXG4gICAgICAgICAgICAuc2V0UGxhY2Vob2xkZXIoYEV4YW1wbGU6ICR7REVGQVVMVF9TRVRUSU5HUy5sYXRleFBuZ1BhdGh9YClcclxuICAgICAgICAgICAgLnNldFZhbHVlKHMubGF0ZXhQbmdQYXRoKVxyXG4gICAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBzYW5pdGl6ZWQgPSB0YWIuc2FuaXRpemVQYXRoKHZhbHVlKTtcclxuICAgICAgICAgICAgICAgIHMubGF0ZXhQbmdQYXRoID0gc2FuaXRpemVkO1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYFBkZnRvY2Fpcm8gYXJncyBmb3IgcG5nIHNldCB0bzogJHtzYW5pdGl6ZWR9YCk7XHJcbiAgICAgICAgICAgICAgICBhd2FpdCB0YWIucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xyXG4gICAgICAgICAgICB9KSlcclxuICAgICAgICAuZGVzY0VsLmlubmVySFRNTCA9IGBUaGUgcGF0aCB0byB5b3VyIHBkZnRvY2Fpcm8gaW5zdGFsbGF0aW9uLiAke2xpbmtUZXhEaXN0cmlidXRpb25zfWA7XHJcbiAgICBuZXcgU2V0dGluZyhyZXF1aXJlc1BuZy5jcmVhdGVEaXYoKSlcclxuICAgICAgICAuc2V0TmFtZSgnUE5HIGNvbnZlcnRlciBhcmd1bWVudHMnKVxyXG4gICAgICAgIC5hZGRUZXh0KHRleHQgPT4gdGV4dFxyXG4gICAgICAgICAgICAuc2V0VmFsdWUocy5sYXRleFBuZ0FyZ3MpXHJcbiAgICAgICAgICAgIC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHNhbml0aXplZCA9IHZhbHVlLnRyaW0oKTtcclxuICAgICAgICAgICAgICAgIHMubGF0ZXhQbmdBcmdzID0gc2FuaXRpemVkO1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYFBkZnRvY2Fpcm8gYXJncyBmb3IgcG5nIHNldCB0bzogJHtzYW5pdGl6ZWR9YCk7XHJcbiAgICAgICAgICAgICAgICBhd2FpdCB0YWIucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xyXG4gICAgICAgICAgICB9KSlcclxuICAgICAgICAuZGVzY0VsLmlubmVySFRNTCA9IGAke3NlbGVjdGFibGVUZXh0KCctdHJhbnNwJyl9IFRyYW5zcGFyZW50IGJhY2tncm91bmQuICR7c2VsZWN0YWJsZVRleHQoJy1ncmF5Jyl9IEdyYXlzY2FsZS4gJHtzZWxlY3RhYmxlVGV4dCgnLW1vbm8nKX0gTW9ub2Nocm9tZS4gXHJcbiAgICAgICAgICAgICR7c2VsZWN0YWJsZVRleHQoJy1mIGludCcpfSBQYWdlIHRvIHNhdmUuIERlZmF1bHQgaXMgJHtzZWxlY3RhYmxlVGV4dChERUZBVUxUX1NFVFRJTkdTLmxhdGV4UG5nQXJncyl9LmA7XHJcblxyXG4gICAgY29udGFpbmVyRWwuY3JlYXRlRWwoJ2g0JywgeyB0ZXh0OiAnQXBwZWFyYW5jZScgfSk7XHJcbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcclxuICAgICAgICAuc2V0TmFtZSgnT3V0cHV0IGVtYmVkZGluZ3MnKVxyXG4gICAgICAgIC5hZGRUb2dnbGUodG9nZ2xlID0+IHRvZ2dsZVxyXG4gICAgICAgICAgICAuc2V0VmFsdWUocy5sYXRleE91dHB1dEVtYmVkZGluZ3MpXHJcbiAgICAgICAgICAgIC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcclxuICAgICAgICAgICAgICAgIHMubGF0ZXhPdXRwdXRFbWJlZGRpbmdzID0gdmFsdWU7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyh2YWx1ZSA/ICdOb3cgZW1iZWRkaW5nIGZpZ3VyZXMuJyA6IGBOb3cgbGlua2luZyBmaWd1cmVzLmApXHJcbiAgICAgICAgICAgICAgICBhd2FpdCB0YWIucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xyXG4gICAgICAgICAgICB9KSlcclxuICAgICAgICAuZGVzY0VsLmlubmVySFRNTCA9IGBXaGVuIHJ1bm5pbmcgYSBMYVRlWCBjb2RlIGJsb2NrLCBzaG93IGVtYmVkZGluZ3Mgb2Ygc2F2ZWQgZmlndXJlcy4gRGVmYXVsdCBpcyAke0RFRkFVTFRfU0VUVElOR1MubGF0ZXhPdXRwdXRFbWJlZGRpbmdzID8gJ29uJyA6ICdvZmYnfS5gO1xyXG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXHJcbiAgICAgICAgLnNldE5hbWUoJ0NlbnRlciBTVkdzJylcclxuICAgICAgICAuYWRkVG9nZ2xlKHRvZ2dsZSA9PiB0b2dnbGVcclxuICAgICAgICAgICAgLnNldFZhbHVlKHMubGF0ZXhDZW50ZXJGaWd1cmVzKVxyXG4gICAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBzLmxhdGV4Q2VudGVyRmlndXJlcyA9IHZhbHVlO1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2codmFsdWUgPyAnTm93IGNlbnRlcmluZyBTVkdzLicgOiBgTm93IGxlZnQgYWxpZ25pbmcgU1ZHcy5gKVxyXG4gICAgICAgICAgICAgICAgdXBkYXRlQm9keUNsYXNzKCdjZW50ZXItbGF0ZXgtZmlndXJlcycsIHZhbHVlKTtcclxuICAgICAgICAgICAgICAgIGF3YWl0IHRhYi5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XHJcbiAgICAgICAgICAgIH0pKVxyXG4gICAgICAgIC5kZXNjRWwuaW5uZXJIVE1MID0gYEhvcml6b250YWxseSBhbGlnbiBTVkdzIHdob3NlIGZpbGVuYW1lIHN0YXJ0cyB3aXRoICR7c2VsZWN0YWJsZVRleHQoJ2ZpZ3VyZScpfS4gXHJcbiAgICAgICAgICAgIERlZmF1bHQgaXMgJHtERUZBVUxUX1NFVFRJTkdTLmxhdGV4Q2VudGVyRmlndXJlcyA/ICdvbicgOiAnb2ZmJ30uYDtcclxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxyXG4gICAgICAgIC5zZXROYW1lKCdJbnZlcnQgU1ZHcyBpbiBkYXJrIG1vZGUnKVxyXG4gICAgICAgIC5hZGRUb2dnbGUodG9nZ2xlID0+IHRvZ2dsZVxyXG4gICAgICAgICAgICAuc2V0VmFsdWUocy5sYXRleEludmVydEZpZ3VyZXMpXHJcbiAgICAgICAgICAgIC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcclxuICAgICAgICAgICAgICAgIHMubGF0ZXhJbnZlcnRGaWd1cmVzID0gdmFsdWU7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyh2YWx1ZSA/ICdOb3cgaW52ZXJ0aW5nIFNWR3MuJyA6IGBOb3cgbm90IGludmVydGluZyBTVkdzLmApXHJcbiAgICAgICAgICAgICAgICB1cGRhdGVCb2R5Q2xhc3MoJ2ludmVydC1sYXRleC1maWd1cmVzJywgdmFsdWUpO1xyXG4gICAgICAgICAgICAgICAgYXdhaXQgdGFiLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcclxuICAgICAgICAgICAgfSkpXHJcbiAgICAgICAgLmRlc2NFbC5pbm5lckhUTUwgPSBgSWYgZGFyayBtb2RlIGlzIGVuYWJsZWQsIGludmVydCB0aGUgY29sb3Igb2YgU1ZHcyB3aG9zZSBmaWxlbmFtZSBzdGFydHMgd2l0aCAke3NlbGVjdGFibGVUZXh0KCdmaWd1cmUnKX0uIFxyXG4gICAgICAgICAgICBEZWZhdWx0IGlzICR7REVGQVVMVF9TRVRUSU5HUy5sYXRleEludmVydEZpZ3VyZXMgPyAnb24nIDogJ29mZid9LmA7XHJcblxyXG4gICAgY29udGFpbmVyRWwuY3JlYXRlRWwoJ2g0JywgeyB0ZXh0OiAnVHJvdWJsZXNob290aW5nJyB9KTtcclxuICAgIGNvbnN0IG1heEZpZ3VyZXMgPSBjb250YWluZXJFbC5jcmVhdGVEaXYoKTtcclxuICAgIG5ldyBTZXR0aW5nKG1heEZpZ3VyZXMpXHJcbiAgICAgICAgLnNldE5hbWUoJ0tlZXAgbGFzdCBuIHVubmFtZWQgZmlndXJlcycpXHJcbiAgICAgICAgLmFkZFRleHQodGV4dCA9PiB0ZXh0XHJcbiAgICAgICAgICAgIC5zZXRQbGFjZWhvbGRlcigndW5saW1pdGVkJylcclxuICAgICAgICAgICAgLnNldFZhbHVlKHMubGF0ZXhNYXhGaWd1cmVzID09PSBJbmZpbml0eSA/IFwiXCIgOiBgJHtzLmxhdGV4TWF4RmlndXJlc31gKVxyXG4gICAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBudW1WYWx1ZSA9IHZhbHVlID09PSBcIlwiID8gSW5maW5pdHkgOiBOdW1iZXIodmFsdWUpO1xyXG4gICAgICAgICAgICAgICAgY29uc3QgaXNWYWxpZCA9IGlzSW50ZWdlck9ySW5maW5pdHkobnVtVmFsdWUpICYmIG51bVZhbHVlID4gMDtcclxuICAgICAgICAgICAgICAgIHVwZGF0ZVRleHRDb2xvcihtYXhGaWd1cmVzLCBpc1ZhbGlkKTtcclxuICAgICAgICAgICAgICAgIGlmIChpc1ZhbGlkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcy5sYXRleE1heEZpZ3VyZXMgPSBudW1WYWx1ZTtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgbWF4IG51bWJlciBvZiBmaWd1cmVzIHNldCB0bzogJHtudW1WYWx1ZX1gKTtcclxuICAgICAgICAgICAgICAgICAgICBhd2FpdCB0YWIucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KSlcclxuICAgICAgICAuZGVzY0VsLmlubmVySFRNTCA9IGBHZW5lcmF0ZWQgYXR0YWNobWVudHMgcmVjZWl2ZSBhbiBpbmNyZWFzaW5nIGluZGV4LiBUbyBwcmV2ZW50IHRvbyBtYW55IGZpbGVzIGZyb20gcGlsaW5nIHVwLCBqdW1wIGJhY2sgdG8gemVybyBhZnRlciA8aT5uPC9pPiBleGVjdXRpb25zLiBcclxuICAgICAgICAgICAgU2V0IGVtcHR5IGZvciB1bmxpbWl0ZWQuIERlZmF1bHQgaXMgJHtzZWxlY3RhYmxlVGV4dChERUZBVUxUX1NFVFRJTkdTLmxhdGV4TWF4RmlndXJlcy50b1N0cmluZygpLCB0cnVlKX0uYDtcclxuICAgIG1heEZpZ3VyZXMucXVlcnlTZWxlY3RvcignaW5wdXQnKS50eXBlID0gXCJudW1iZXJcIjtcclxuICAgIGNvbnN0IGNhcHR1cmVGaWd1cmVOYW1lID0gY29udGFpbmVyRWwuY3JlYXRlRGl2KCk7XHJcbiAgICBuZXcgU2V0dGluZyhjYXB0dXJlRmlndXJlTmFtZSlcclxuICAgICAgICAuc2V0TmFtZSgnQ2FwdHVyZSBmaWd1cmUgbmFtZScpXHJcbiAgICAgICAgLmFkZFRleHQodGV4dCA9PiB0ZXh0XHJcbiAgICAgICAgICAgIC5zZXRQbGFjZWhvbGRlcignL3JlZ2V4LycpXHJcbiAgICAgICAgICAgIC5zZXRWYWx1ZShgJHtzLmxhdGV4RmlndXJlVGl0bGVQYXR0ZXJufWApXHJcbiAgICAgICAgICAgIC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHBhdHRlcm4gPSBwYXJzZSh2YWx1ZSk7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBpc1ZhbGlkID0gcGF0dGVybiAhPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgICAgICAgICB1cGRhdGVUZXh0Q29sb3IoY2FwdHVyZUZpZ3VyZU5hbWUsIGlzVmFsaWQpO1xyXG4gICAgICAgICAgICAgICAgaWYgKGlzVmFsaWQpIHtcclxuICAgICAgICAgICAgICAgICAgICBzLmxhdGV4RmlndXJlVGl0bGVQYXR0ZXJuID0gcGF0dGVybi50b1N0cmluZygpO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdjYXB0dXJlIGZpZ3VyZSBuYW1lIHBhdHRlcm4gc2V0IHRvOiAnICsgcGF0dGVybik7XHJcbiAgICAgICAgICAgICAgICAgICAgYXdhaXQgdGFiLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSkpXHJcbiAgICAgICAgLmRlc2NFbC5pbm5lckhUTUwgPSBgU2VhcmNoIExhVGVYIGNvZGUgYmxvY2sgZm9yICR7c2VsZWN0YWJsZVRleHQoJ1xcXFx0aXRsZXvigKZ9Jyl9IHRvIHJldHJpZXZlIHRoZSBmaWd1cmUgbmFtZTogXHJcbiAgICAgICAgICAgICR7c2VsZWN0YWJsZVRleHQoL1teXFxuXVteJWBdKi8uc291cmNlKX0gSWdub3JlIGNvbW1lbnRzIGFmdGVyICUgc3ltYm9sLiAke3NlbGVjdGFibGVUZXh0KC8oPzxuYW1lPi4qPykvLnNvdXJjZSl9IENhcHR1cmUgZ3JvdXAgZm9yIGZpZ3VyZSBuYW1lLlxyXG4gICAgICAgICAgICBEZWZhdWx0IGlzICR7c2VsZWN0YWJsZVRleHQoREVGQVVMVF9TRVRUSU5HUy5sYXRleEZpZ3VyZVRpdGxlUGF0dGVybil9LmA7XHJcbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcclxuICAgICAgICAuc2V0TmFtZSgnRmlsdGVyIG91dHB1dCcpXHJcbiAgICAgICAgLmFkZFRvZ2dsZSh0b2dnbGUgPT4gdG9nZ2xlXHJcbiAgICAgICAgICAgIC5zZXRWYWx1ZShzLmxhdGV4RG9GaWx0ZXIpXHJcbiAgICAgICAgICAgIC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcclxuICAgICAgICAgICAgICAgIHMubGF0ZXhEb0ZpbHRlciA9IHZhbHVlO1xyXG4gICAgICAgICAgICAgICAgc2hvd1N1YlNldHRpbmdzKHJlcXVpcmVzVGV4Zm90LCB2YWx1ZSk7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyh2YWx1ZSA/ICdOb3cgZmlsdGVyaW5nIGxhdGV4IHN0ZG91dCB3aXRoIHRleGZvdC4nIDogJ05vdyBzaG93aW5nIGZ1bGwgbGF0ZXggc3Rkb3V0LicpO1xyXG4gICAgICAgICAgICAgICAgYXdhaXQgdGFiLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcclxuICAgICAgICAgICAgfSkpXHJcbiAgICAgICAgLmRlc2NFbC5pbm5lckhUTUwgPSBgRmlsdGVyaW5nIHN0ZG91dCB0byByZWxldmFudCBtZXNzYWdlcyB3aXRoIHRleGZvdC4gRGVmYXVsdCBpcyAke0RFRkFVTFRfU0VUVElOR1MubGF0ZXhLZWVwTG9nID8gJ29uJyA6ICdvZmYnfS5gXHJcbiAgICBjb25zdCByZXF1aXJlc1RleGZvdCA9IGNvbnRhaW5lckVsLmNyZWF0ZURpdigpO1xyXG4gICAgc2hvd1N1YlNldHRpbmdzKHJlcXVpcmVzVGV4Zm90LCBzLmxhdGV4RG9GaWx0ZXIpO1xyXG4gICAgbmV3IFNldHRpbmcocmVxdWlyZXNUZXhmb3QuY3JlYXRlRGl2KCkpXHJcbiAgICAgICAgLnNldE5hbWUoJ1RleGZvdCBwYXRoJylcclxuICAgICAgICAuYWRkVGV4dCh0ZXh0ID0+IHRleHRcclxuICAgICAgICAgICAgLnNldFBsYWNlaG9sZGVyKGBFeGFtcGxlOiAke0RFRkFVTFRfU0VUVElOR1MubGF0ZXhUZXhmb3RQYXRofWApXHJcbiAgICAgICAgICAgIC5zZXRWYWx1ZShzLmxhdGV4VGV4Zm90UGF0aClcclxuICAgICAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgY29uc3Qgc2FuaXRpemVkID0gdGFiLnNhbml0aXplUGF0aCh2YWx1ZSk7XHJcbiAgICAgICAgICAgICAgICBzLmxhdGV4VGV4Zm90UGF0aCA9IHNhbml0aXplZDtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGB0ZXhmb3QgcGF0aCBzZXQgdG86ICR7c2FuaXRpemVkfWApO1xyXG4gICAgICAgICAgICAgICAgYXdhaXQgdGFiLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcclxuICAgICAgICAgICAgfSkpXHJcbiAgICAgICAgLmRlc2NFbC5pbm5lckhUTUwgPSBgVGhlIHBhdGggdG8geW91ciB0ZXhmb3QgaW5zdGFsbGF0aW9uLiAke2xpbmtUZXhEaXN0cmlidXRpb25zfWA7XHJcbiAgICBuZXcgU2V0dGluZyhyZXF1aXJlc1RleGZvdC5jcmVhdGVEaXYoKSlcclxuICAgICAgICAuc2V0TmFtZSgnVGV4Zm90IGFyZ3VtZW50cycpXHJcbiAgICAgICAgLmFkZFRleHQodGV4dCA9PiB0ZXh0XHJcbiAgICAgICAgICAgIC5zZXRQbGFjZWhvbGRlcihgRXhhbXBsZTogJHtERUZBVUxUX1NFVFRJTkdTLmxhdGV4VGV4Zm90QXJnc31gKVxyXG4gICAgICAgICAgICAuc2V0VmFsdWUocy5sYXRleFRleGZvdEFyZ3MpXHJcbiAgICAgICAgICAgIC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHNhbml0aXplZCA9IHZhbHVlLnRyaW0oKTtcclxuICAgICAgICAgICAgICAgIHMubGF0ZXhUZXhmb3RBcmdzID0gc2FuaXRpemVkO1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYHRleGZvdCBhcmd1bWVudHMgc2V0IHRvOiAke3Nhbml0aXplZH1gKTtcclxuICAgICAgICAgICAgICAgIGF3YWl0IHRhYi5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XHJcbiAgICAgICAgICAgIH0pKVxyXG4gICAgICAgIC5kZXNjRWwuaW5uZXJIVE1MID0gYCR7c2VsZWN0YWJsZVRleHQoJy0tYWNjZXB0IHJlZ2V4Jyl9LCAke3NlbGVjdGFibGVUZXh0KCctLWlnbm9yZSByZWdleCcpfSBGaWx0ZXIgbGluZXMgaW4gdGhlIFRlWCBvdXRwdXQgbWF0Y2hpbmcgUmVnRXhwLiBcclxuICAgICAgICAgICAgRGVmYXVsdCBpcyAke3NlbGVjdGFibGVUZXh0KERFRkFVTFRfU0VUVElOR1MubGF0ZXhUZXhmb3RBcmdzKX0uYDtcclxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxyXG4gICAgICAgIC5zZXROYW1lKCdLZWVwIGxvZycpXHJcbiAgICAgICAgLmFkZFRvZ2dsZSh0b2dnbGUgPT4gdG9nZ2xlXHJcbiAgICAgICAgICAgIC5zZXRWYWx1ZShzLmxhdGV4S2VlcExvZylcclxuICAgICAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgcy5sYXRleEtlZXBMb2cgPSB2YWx1ZTtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHZhbHVlID8gJ05vdyBwcmVzZXJ2aW5nIGxhdGV4IGJ1aWxkIGZvbGRlci4nIDogXCJOb3cgY2xlYXJpbmcgbGF0ZXggYnVpbGQgZm9sZGVyLlwiKTtcclxuICAgICAgICAgICAgICAgIGF3YWl0IHRhYi5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XHJcbiAgICAgICAgICAgIH0pKVxyXG4gICAgICAgIC5kZXNjRWwuaW5uZXJIVE1MID0gYFByZXZlbnQgZGVsZXRpb24gb2YgdGVtcG9yYXJ5IGJ1aWxkIGZvbGRlci4gRGVmYXVsdCBpcyAke0RFRkFVTFRfU0VUVElOR1MubGF0ZXhLZWVwTG9nID8gJ29uJyA6ICdvZmYnfS5gO1xyXG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXHJcbiAgICAgICAgLnNldE5hbWUoJ1J1biBzdWJwcm9jZXNzZXMgaW4gc2hlbGwnKVxyXG4gICAgICAgIC5hZGRUb2dnbGUodG9nZ2xlID0+IHRvZ2dsZVxyXG4gICAgICAgICAgICAuc2V0VmFsdWUocy5sYXRleFN1YnByb2Nlc3Nlc1VzZVNoZWxsKVxyXG4gICAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBzLmxhdGV4U3VicHJvY2Vzc2VzVXNlU2hlbGwgPSB2YWx1ZTtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHZhbHVlID8gJ05vdyBydW5uaW5nIHN1YnByb2Nlc3NlcyBpbiBzaGVsbC4nIDogJ05vdyBydW5uaW5nIHN1YnByb2Nlc3NlcyBkaXJlY3RseS4nKTtcclxuICAgICAgICAgICAgICAgIGF3YWl0IHRhYi5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XHJcbiAgICAgICAgICAgIH0pKVxyXG4gICAgICAgIC5kZXNjRWwuaW5uZXJIVE1MID0gYFJ1biBjb21waWxhdGlvbiBhbmQgY29udmVyc2lvbiB0b29scyBpbiBzaGVsbCBlbnZpcm9ubWVudC4gRGVmYXVsdCBpcyAke0RFRkFVTFRfU0VUVElOR1MubGF0ZXhTdWJwcm9jZXNzZXNVc2VTaGVsbCA/ICdvbicgOiAnb2ZmJ30uYDtcclxufVxyXG5cclxuZnVuY3Rpb24gc2hvd1N1YlNldHRpbmdzKHNldHRpbmdzRGl2OiBIVE1MRGl2RWxlbWVudCwgZG9TaG93OiBib29sZWFuKSB7XHJcbiAgICBzZXR0aW5nc0Rpdi5zZXRBdHRyKCdzdHlsZScsIGRvU2hvdyA/ICdkaXNwbGF5OiBibG9jaycgOiAnZGlzcGxheTogbm9uZScpO1xyXG59XHJcblxyXG5mdW5jdGlvbiB1cGRhdGVUZXh0Q29sb3IoY29udGFpbmVyRWw6IEhUTUxFbGVtZW50LCBpc1ZhbGlkOiBib29sZWFuKSB7XHJcbiAgICBjb25zdCBpbnB1dEVsID0gY29udGFpbmVyRWwucXVlcnlTZWxlY3RvcignaW5wdXQnKSBhcyBIVE1MSW5wdXRFbGVtZW50O1xyXG4gICAgaW5wdXRFbC5zdHlsZS5jb2xvciA9IGlzVmFsaWQgPyAnJyA6ICdyZWQnO1xyXG59XHJcblxyXG5mdW5jdGlvbiBpc0ludGVnZXJPckluZmluaXR5KHZhbHVlOiBudW1iZXIpOiBib29sZWFuIHtcclxuICAgIHJldHVybiBOdW1iZXIuaXNJbnRlZ2VyKHZhbHVlKSB8fCB2YWx1ZSA9PT0gSW5maW5pdHk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHNlbGVjdGFibGVUZXh0KHRleHQ6IHN0cmluZywgbm9Nb25vc3BhY2U/OiBib29sZWFuKSB7XHJcbiAgICBpZiAobm9Nb25vc3BhY2UpIHJldHVybiBgPHNwYW4gY2xhc3M9J3NlbGVjdGFibGUtZGVzY3JpcHRpb24tdGV4dCc+JHt0ZXh0fTwvc3Bhbj5gO1xyXG5cclxuICAgIGNvbnN0IGVzY2FwZWRBbmdsZUJyYWNrZXRzID0gdGV4dC5yZXBsYWNlKC88L2csICcmbHQ7JykucmVwbGFjZSgvPi9nLCAnJmd0OycpO1xyXG4gICAgcmV0dXJuIGA8c3Bhbj48Y29kZSBjbGFzcz0nc2VsZWN0YWJsZS1kZXNjcmlwdGlvbi10ZXh0Jz4ke2VzY2FwZWRBbmdsZUJyYWNrZXRzfTwvY29kZT48L3NwYW4+YDtcclxufSJdfQ==