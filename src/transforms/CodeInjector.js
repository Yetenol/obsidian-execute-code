import { MarkdownView, Notice } from "obsidian";
import { getCodeBlockLanguage, getLanguageAlias, transformMagicCommands } from './TransformCode';
import { getArgs } from "src/CodeBlockArgs";
/**
 * Inject code and run code transformations on a source code block
 */
export class CodeInjector {
    /**
     * @param app The current app handle (this.app from ExecuteCodePlugin).
     * @param settings The current app settings.
     * @param language The language of the code block e.g. python, js, cpp.
     */
    constructor(app, settings, language) {
        this.prependSrcCode = "";
        this.appendSrcCode = "";
        this.namedImportSrcCode = "";
        this.mainArgs = {};
        this.namedExports = {};
        this.app = app;
        this.settings = settings;
        this.language = language;
    }
    /**
     * Takes the source code of a code block and adds all relevant pre-/post-blocks and global code injections.
     *
     * @param srcCode The source code of the code block.
     * @returns The source code of a code block with all relevant pre/post blocks and global code injections.
     */
    async injectCode(srcCode) {
        const language = getLanguageAlias(this.language);
        // We need to get access to all code blocks on the page so we can grab the pre / post blocks above
        // Obsidian unloads code blocks not in view, so instead we load the raw document file and traverse line-by-line
        const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
        if (activeView === null)
            return srcCode;
        // Is await necessary here? Some object variables get changed in this call -> await probably necessary
        await this.parseFile(activeView.data, srcCode, language);
        const realLanguage = /[^-]*$/.exec(language)[0];
        const globalInject = this.settings[`${realLanguage}Inject`];
        let injectedCode = `${this.namedImportSrcCode}\n${srcCode}`;
        if (!this.mainArgs.ignore)
            injectedCode = `${globalInject}\n${this.prependSrcCode}\n${injectedCode}\n${this.appendSrcCode}`;
        else {
            // Handle single ignore
            if (!Array.isArray(this.mainArgs.ignore) && this.mainArgs.ignore !== "all")
                this.mainArgs.ignore = [this.mainArgs.ignore];
            if (this.mainArgs.ignore !== "all") {
                if (!this.mainArgs.ignore.contains("pre"))
                    injectedCode = `${this.prependSrcCode}\n${injectedCode}`;
                if (!this.mainArgs.ignore.contains("post"))
                    injectedCode = `${injectedCode}\n${this.appendSrcCode}`;
                if (!this.mainArgs.ignore.contains("global"))
                    injectedCode = `${globalInject}\n${injectedCode}`;
            }
        }
        return transformMagicCommands(this.app, injectedCode);
    }
    /**
     * Handles adding named imports to code blocks
     *
     * @param namedImports Populate prependable source code with named imports
     * @returns If an error occurred
     */
    async handleNamedImports(namedImports) {
        const handleNamedImport = (namedImport) => {
            // Named export doesn't exist
            if (!this.namedExports.hasOwnProperty(namedImport)) {
                new Notice(`Named export "${namedImport}" does not exist but was imported`);
                return true;
            }
            this.namedImportSrcCode += `${this.disable_print(this.namedExports[namedImport])}\n`;
            return false;
        };
        // Single import
        if (!Array.isArray(namedImports))
            return handleNamedImport(namedImports);
        // Multiple imports
        for (const namedImport of namedImports) {
            const err = handleNamedImport(namedImport);
            if (err)
                return true;
        }
        return false;
    }
    /**
     * Parse a markdown file
     *
     * @param fileContents The contents of the file to parse
     * @param srcCode The original source code of the code block being run
     * @param language The programming language of the code block being run
     * @returns
     */
    async parseFile(fileContents, srcCode, language) {
        let currentArgs = {};
        let insideCodeBlock = false;
        let isLanguageEqual = false;
        let currentLanguage = "";
        let currentCode = "";
        let currentFirstLine = "";
        for (const line of fileContents.split("\n")) {
            if (line.startsWith("```")) {
                // Reached end of code block
                if (insideCodeBlock) {
                    // Stop traversal once we've reached the code block being run
                    // Only do this for the original file the user is running
                    const srcCodeTrimmed = srcCode.trim();
                    const currentCodeTrimmed = currentCode.trim();
                    if (isLanguageEqual && srcCodeTrimmed.length === currentCodeTrimmed.length && srcCodeTrimmed === currentCodeTrimmed) {
                        this.mainArgs = getArgs(currentFirstLine);
                        // Get named imports
                        if (this.mainArgs.import) {
                            const err = this.handleNamedImports(this.mainArgs.import);
                            if (err)
                                return "";
                        }
                        break;
                    }
                    // Named export
                    if (currentArgs.label) {
                        // Export already exists
                        if (this.namedExports.hasOwnProperty(currentArgs.label)) {
                            new Notice(`Error: named export ${currentArgs.label} exported more than once`);
                            return "";
                        }
                        this.namedExports[currentArgs.label] = currentCode;
                    }
                    // Pre / post export
                    if (!Array.isArray(currentArgs.export))
                        currentArgs.export = [currentArgs.export];
                    if (currentArgs.export.contains("pre"))
                        this.prependSrcCode += `${this.disable_print(currentCode)}\n`;
                    if (currentArgs.export.contains("post"))
                        this.appendSrcCode += `${this.disable_print(currentCode)}\n`;
                    currentLanguage = "";
                    currentCode = "";
                    insideCodeBlock = false;
                    currentArgs = {};
                }
                // reached start of code block
                else {
                    currentLanguage = getCodeBlockLanguage(line);
                    // Don't check code blocks from a different language
                    isLanguageEqual = /[^-]*$/.exec(language)[0] === /[^-]*$/.exec(currentLanguage)[0];
                    if (isLanguageEqual) {
                        currentArgs = getArgs(line);
                        currentFirstLine = line;
                    }
                    insideCodeBlock = true;
                }
            }
            else if (insideCodeBlock && isLanguageEqual) {
                currentCode += `${line}\n`;
            }
        }
    }
    disable_print(code) {
        if (!this.settings.onlyCurrentBlock) {
            return code;
        }
        const pattern = /^print\s*(.*)/gm;
        // 使用正则表达式替换函数将符合条件的内容注释掉
        return code.replace(pattern, ' ');
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29kZUluamVjdG9yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiQ29kZUluamVjdG9yLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLE9BQU8sRUFBQyxZQUFZLEVBQUUsTUFBTSxFQUFDLE1BQU0sVUFBVSxDQUFDO0FBRTlDLE9BQU8sRUFBQyxvQkFBb0IsRUFBRSxnQkFBZ0IsRUFBRSxzQkFBc0IsRUFBQyxNQUFNLGlCQUFpQixDQUFDO0FBQy9GLE9BQU8sRUFBQyxPQUFPLEVBQUMsTUFBTSxtQkFBbUIsQ0FBQztBQUkxQzs7R0FFRztBQUNILE1BQU0sT0FBTyxZQUFZO0lBYXhCOzs7O09BSUc7SUFDSCxZQUFZLEdBQVEsRUFBRSxRQUEwQixFQUFFLFFBQW9CO1FBYjlELG1CQUFjLEdBQUcsRUFBRSxDQUFDO1FBQ3BCLGtCQUFhLEdBQUcsRUFBRSxDQUFDO1FBQ25CLHVCQUFrQixHQUFHLEVBQUUsQ0FBQztRQUV4QixhQUFRLEdBQWtCLEVBQUUsQ0FBQztRQUU3QixpQkFBWSxHQUEyQixFQUFFLENBQUM7UUFRakQsSUFBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUM7UUFDZixJQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQztRQUN6QixJQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQztJQUMxQixDQUFDO0lBRUQ7Ozs7O09BS0c7SUFDSSxLQUFLLENBQUMsVUFBVSxDQUFDLE9BQWU7UUFDdEMsTUFBTSxRQUFRLEdBQUcsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBRWpELGtHQUFrRztRQUNsRywrR0FBK0c7UUFDL0csTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsbUJBQW1CLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDeEUsSUFBSSxVQUFVLEtBQUssSUFBSTtZQUN0QixPQUFPLE9BQU8sQ0FBQztRQUVoQixzR0FBc0c7UUFDdEcsTUFBTSxJQUFJLENBQUMsU0FBUyxD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O3dCQUM1QixnQkFBZ0IsR0FBRyxJQUFJLENBQUM7cUJBQ3hCO29CQUNELGVBQWUsR0FBRyxJQUFJLENBQUM7aUJBQ3ZCO2FBQ0Q7aUJBQU0sSUFBSSxlQUFlLElBQUksZUFBZSxFQUFFO2dCQUM5QyxXQUFXLElBQUksR0FBRyxJQUFJLElBQUksQ0FBQzthQUMzQjtTQUNEO0lBQ0YsQ0FBQztJQUVPLGFBQWEsQ0FBQyxJQUFZO1FBQ2pDLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLGdCQUFnQixFQUFFO1lBQ3BDLE9BQU8sSUFBSSxDQUFDO1NBQ1o7UUFDRCxNQUFNLE9BQU8sR0FBVyxpQkFBaUIsQ0FBQztRQUMxQyx5QkFBeUI7UUFDekIsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxHQUFHLENBQUMsQ0FBQztJQUNuQyxDQUFDO0NBQ0QiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdHlwZSB7QXBwfSBmcm9tIFwib2JzaWRpYW5cIjtcclxuaW1wb3J0IHtNYXJrZG93blZpZXcsIE5vdGljZX0gZnJvbSBcIm9ic2lkaWFuXCI7XHJcbmltcG9ydCB7RXhlY3V0b3JTZXR0aW5nc30gZnJvbSBcInNyYy9zZXR0aW5ncy9TZXR0aW5nc1wiO1xyXG5pbXBvcnQge2dldENvZGVCbG9ja0xhbmd1YWdlLCBnZXRMYW5ndWFnZUFsaWFzLCB0cmFuc2Zvcm1NYWdpY0NvbW1hbmRzfSBmcm9tICcuL1RyYW5zZm9ybUNvZGUnO1xyXG5pbXBvcnQge2dldEFyZ3N9IGZyb20gXCJzcmMvQ29kZUJsb2NrQXJnc1wiO1xyXG5pbXBvcnQgdHlwZSB7TGFuZ3VhZ2VJZH0gZnJvbSBcInNyYy9tYWluXCI7XHJcbmltcG9ydCB0eXBlIHtDb2RlQmxvY2tBcmdzfSBmcm9tICcuLi9Db2RlQmxvY2tBcmdzJztcclxuXHJcbi8qKlxyXG4gKiBJbmplY3QgY29kZSBhbmQgcnVuIGNvZGUgdHJhbnNmb3JtYXRpb25zIG9uIGEgc291cmNlIGNvZGUgYmxvY2tcclxuICovXHJcbmV4cG9ydCBjbGFzcyBDb2RlSW5qZWN0b3Ige1xyXG5cdHByaXZhdGUgcmVhZG9ubHkgYXBwOiBBcHA7XHJcblx0cHJpdmF0ZSByZWFkb25seSBzZXR0aW5nczogRXhlY3V0b3JTZXR0aW5ncztcclxuXHRwcml2YXRlIHJlYWRvbmx5IGxhbmd1YWdlOiBMYW5ndWFnZUlkO1xyXG5cclxuXHRwcml2YXRlIHByZXBlbmRTcmNDb2RlID0gXCJcIjtcclxuXHRwcml2YXRlIGFwcGVuZFNyY0NvZGUgPSBcIlwiO1xyXG5cdHByaXZhdGUgbmFtZWRJbXBvcnRTcmNDb2RlID0gXCJcIjtcclxuXHJcblx0cHJpdmF0ZSBtYWluQXJnczogQ29kZUJsb2NrQXJncyA9IHt9O1xyXG5cclxuXHRwcml2YXRlIG5hbWVkRXhwb3J0czogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHt9O1xyXG5cclxuXHQvKipcclxuXHQgKiBAcGFyYW0gYXBwIFRoZSBjdXJyZW50IGFwcCBoYW5kbGUgKHRoaXMuYXBwIGZyb20gRXhlY3V0ZUNvZGVQbHVnaW4pLlxyXG5cdCAqIEBwYXJhbSBzZXR0aW5ncyBUaGUgY3VycmVudCBhcHAgc2V0dGluZ3MuXHJcblx0ICogQHBhcmFtIGxhbmd1YWdlIFRoZSBsYW5ndWFnZSBvZiB0aGUgY29kZSBibG9jayBlLmcuIHB5dGhvbiwganMsIGNwcC5cclxuXHQgKi9cclxuXHRjb25zdHJ1Y3RvcihhcHA6IEFwcCwgc2V0dGluZ3M6IEV4ZWN1dG9yU2V0dGluZ3MsIGxhbmd1YWdlOiBMYW5ndWFnZUlkKSB7XHJcblx0XHR0aGlzLmFwcCA9IGFwcDtcclxuXHRcdHRoaXMuc2V0dGluZ3MgPSBzZXR0aW5ncztcclxuXHRcdHRoaXMubGFuZ3VhZ2UgPSBsYW5ndWFnZTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFRha2VzIHRoZSBzb3VyY2UgY29kZSBvZiBhIGNvZGUgYmxvY2sgYW5kIGFkZHMgYWxsIHJlbGV2YW50IHByZS0vcG9zdC1ibG9ja3MgYW5kIGdsb2JhbCBjb2RlIGluamVjdGlvbnMuXHJcblx0ICpcclxuXHQgKiBAcGFyYW0gc3JjQ29kZSBUaGUgc291cmNlIGNvZGUgb2YgdGhlIGNvZGUgYmxvY2suXHJcblx0ICogQHJldHVybnMgVGhlIHNvdXJjZSBjb2RlIG9mIGEgY29kZSBibG9jayB3aXRoIGFsbCByZWxldmFudCBwcmUvcG9zdCBibG9ja3MgYW5kIGdsb2JhbCBjb2RlIGluamVjdGlvbnMuXHJcblx0ICovXHJcblx0cHVibGljIGFzeW5jIGluamVjdENvZGUoc3JjQ29kZTogc3RyaW5nKSB7XHJcblx0XHRjb25zdCBsYW5ndWFnZSA9IGdldExhbmd1YWdlQWxpYXModGhpcy5sYW5ndWFnZSk7XHJcblxyXG5cdFx0Ly8gV2UgbmVlZCB0byBnZXQgYWNjZXNzIHRvIGFsbCBjb2RlIGJsb2NrcyBvbiB0aGUgcGFnZSBzbyB3ZSBjYW4gZ3JhYiB0aGUgcHJlIC8gcG9zdCBibG9ja3MgYWJvdmVcclxuXHRcdC8vIE9ic2lkaWFuIHVubG9hZHMgY29kZSBibG9ja3Mgbm90IGluIHZpZXcsIHNvIGluc3RlYWQgd2UgbG9hZCB0aGUgcmF3IGRvY3VtZW50IGZpbGUgYW5kIHRyYXZlcnNlIGxpbmUtYnktbGluZVxyXG5cdFx0Y29uc3QgYWN0aXZlVmlldyA9IHRoaXMuYXBwLndvcmtzcGFjZS5nZXRBY3RpdmVWaWV3T2ZUeXBlKE1hcmtkb3duVmlldyk7XHJcblx0XHRpZiAoYWN0aXZlVmlldyA9PT0gbnVsbClcclxuXHRcdFx0cmV0dXJuIHNyY0NvZGU7XHJcblxyXG5cdFx0Ly8gSXMgYXdhaXQgbmVjZXNzYXJ5IGhlcmU/IFNvbWUgb2JqZWN0IHZhcmlhYmxlcyBnZXQgY2hhbmdlZCBpbiB0aGlzIGNhbGwgLT4gYXdhaXQgcHJvYmFibHkgbmVjZXNzYXJ5XHJcblx0XHRhd2FpdCB0aGlzLnBhcnNlRmlsZShhY3RpdmVWaWV3LmRhdGEsIHNyY0NvZGUsIGxhbmd1YWdlKTtcclxuXHJcblx0XHRjb25zdCByZWFsTGFuZ3VhZ2UgPSAvW14tXSokLy5leGVjKGxhbmd1YWdlKVswXTtcclxuXHRcdGNvbnN0IGdsb2JhbEluamVjdCA9IHRoaXMuc2V0dGluZ3NbYCR7cmVhbExhbmd1YWdlfUluamVjdGAgYXMga2V5b2YgRXhlY3V0b3JTZXR0aW5nc107XHJcblx0XHRsZXQgaW5qZWN0ZWRDb2RlID0gYCR7dGhpcy5uYW1lZEltcG9ydFNyY0NvZGV9XFxuJHtzcmNDb2RlfWA7XHJcblx0XHRpZiAoIXRoaXMubWFpbkFyZ3MuaWdub3JlKVxyXG5cdFx0XHRpbmplY3RlZENvZGUgPSBgJHtnbG9iYWxJbmplY3R9XFxuJHt0aGlzLnByZXBlbmRTcmNDb2RlfVxcbiR7aW5qZWN0ZWRDb2RlfVxcbiR7dGhpcy5hcHBlbmRTcmNDb2RlfWA7XHJcblx0XHRlbHNlIHtcclxuXHRcdFx0Ly8gSGFuZGxlIHNpbmdsZSBpZ25vcmVcclxuXHRcdFx0aWYgKCFBcnJheS5pc0FycmF5KHRoaXMubWFpbkFyZ3MuaWdub3JlKSAmJiB0aGlzLm1haW5BcmdzLmlnbm9yZSAhPT0gXCJhbGxcIilcclxuXHRcdFx0XHR0aGlzLm1haW5BcmdzLmlnbm9yZSA9IFt0aGlzLm1haW5BcmdzLmlnbm9yZV07XHJcblx0XHRcdGlmICh0aGlzLm1haW5BcmdzLmlnbm9yZSAhPT0gXCJhbGxcIikge1xyXG5cdFx0XHRcdGlmICghdGhpcy5tYWluQXJncy5pZ25vcmUuY29udGFpbnMoXCJwcmVcIikpXHJcblx0XHRcdFx0XHRpbmplY3RlZENvZGUgPSBgJHt0aGlzLnByZXBlbmRTcmNDb2RlfVxcbiR7aW5qZWN0ZWRDb2RlfWA7XHJcblx0XHRcdFx0aWYgKCF0aGlzLm1haW5BcmdzLmlnbm9yZS5jb250YWlucyhcInBvc3RcIikpXHJcblx0XHRcdFx0XHRpbmplY3RlZENvZGUgPSBgJHtpbmplY3RlZENvZGV9XFxuJHt0aGlzLmFwcGVuZFNyY0NvZGV9YDtcclxuXHRcdFx0XHRpZiAoIXRoaXMubWFpbkFyZ3MuaWdub3JlLmNvbnRhaW5zKFwiZ2xvYmFsXCIpKVxyXG5cdFx0XHRcdFx0aW5qZWN0ZWRDb2RlID0gYCR7Z2xvYmFsSW5qZWN0fVxcbiR7aW5qZWN0ZWRDb2RlfWA7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdHJldHVybiB0cmFuc2Zvcm1NYWdpY0NvbW1hbmRzKHRoaXMuYXBwLCBpbmplY3RlZENvZGUpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogSGFuZGxlcyBhZGRpbmcgbmFtZWQgaW1wb3J0cyB0byBjb2RlIGJsb2Nrc1xyXG5cdCAqXHJcblx0ICogQHBhcmFtIG5hbWVkSW1wb3J0cyBQb3B1bGF0ZSBwcmVwZW5kYWJsZSBzb3VyY2UgY29kZSB3aXRoIG5hbWVkIGltcG9ydHNcclxuXHQgKiBAcmV0dXJucyBJZiBhbiBlcnJvciBvY2N1cnJlZFxyXG5cdCAqL1xyXG5cdHByaXZhdGUgYXN5bmMgaGFuZGxlTmFtZWRJbXBvcnRzKG5hbWVkSW1wb3J0czogQ29kZUJsb2NrQXJnc1snaW1wb3J0J10pIHtcclxuXHRcdGNvbnN0IGhhbmRsZU5hbWVkSW1wb3J0ID0gKG5hbWVkSW1wb3J0OiBzdHJpbmcpID0+IHtcclxuXHRcdFx0Ly8gTmFtZWQgZXhwb3J0IGRvZXNuJ3QgZXhpc3RcclxuXHRcdFx0aWYgKCF0aGlzLm5hbWVkRXhwb3J0cy5oYXNPd25Qcm9wZXJ0eShuYW1lZEltcG9ydCkpIHtcclxuXHRcdFx0XHRuZXcgTm90aWNlKGBOYW1lZCBleHBvcnQgXCIke25hbWVkSW1wb3J0fVwiIGRvZXMgbm90IGV4aXN0IGJ1dCB3YXMgaW1wb3J0ZWRgKTtcclxuXHRcdFx0XHRyZXR1cm4gdHJ1ZTtcclxuXHRcdFx0fVxyXG5cdFx0XHR0aGlzLm5hbWVkSW1wb3J0U3JjQ29kZSArPSBgJHt0aGlzLmRpc2FibGVfcHJpbnQodGhpcy5uYW1lZEV4cG9ydHNbbmFtZWRJbXBvcnRdKX1cXG5gO1xyXG5cdFx0XHRyZXR1cm4gZmFsc2U7XHJcblx0XHR9O1xyXG5cdFx0Ly8gU2luZ2xlIGltcG9ydFxyXG5cdFx0aWYgKCFBcnJheS5pc0FycmF5KG5hbWVkSW1wb3J0cykpXHJcblx0XHRcdHJldHVybiBoYW5kbGVOYW1lZEltcG9ydChuYW1lZEltcG9ydHMpO1xyXG5cdFx0Ly8gTXVsdGlwbGUgaW1wb3J0c1xyXG5cdFx0Zm9yIChjb25zdCBuYW1lZEltcG9ydCBvZiBuYW1lZEltcG9ydHMpIHtcclxuXHRcdFx0Y29uc3QgZXJyID0gaGFuZGxlTmFtZWRJbXBvcnQobmFtZWRJbXBvcnQpO1xyXG5cdFx0XHRpZiAoZXJyKSByZXR1cm4gdHJ1ZTtcclxuXHRcdH1cclxuXHRcdHJldHVybiBmYWxzZTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFBhcnNlIGEgbWFya2Rvd24gZmlsZVxyXG5cdCAqXHJcblx0ICogQHBhcmFtIGZpbGVDb250ZW50cyBUaGUgY29udGVudHMgb2YgdGhlIGZpbGUgdG8gcGFyc2VcclxuXHQgKiBAcGFyYW0gc3JjQ29kZSBUaGUgb3JpZ2luYWwgc291cmNlIGNvZGUgb2YgdGhlIGNvZGUgYmxvY2sgYmVpbmcgcnVuXHJcblx0ICogQHBhcmFtIGxhbmd1YWdlIFRoZSBwcm9ncmFtbWluZyBsYW5ndWFnZSBvZiB0aGUgY29kZSBibG9jayBiZWluZyBydW5cclxuXHQgKiBAcmV0dXJuc1xyXG5cdCAqL1xyXG5cdHByaXZhdGUgYXN5bmMgcGFyc2VGaWxlKGZpbGVDb250ZW50czogc3RyaW5nLCBzcmNDb2RlOiBzdHJpbmcsIGxhbmd1YWdlOiBMYW5ndWFnZUlkKSB7XHJcblx0XHRsZXQgY3VycmVudEFyZ3M6IENvZGVCbG9ja0FyZ3MgPSB7fTtcclxuXHRcdGxldCBpbnNpZGVDb2RlQmxvY2sgPSBmYWxzZTtcclxuXHRcdGxldCBpc0xhbmd1YWdlRXF1YWwgPSBmYWxzZTtcclxuXHRcdGxldCBjdXJyZW50TGFuZ3VhZ2UgPSBcIlwiO1xyXG5cdFx0bGV0IGN1cnJlbnRDb2RlID0gXCJcIjtcclxuXHRcdGxldCBjdXJyZW50Rmlyc3RMaW5lID0gXCJcIjtcclxuXHJcblx0XHRmb3IgKGNvbnN0IGxpbmUgb2YgZmlsZUNvbnRlbnRzLnNwbGl0KFwiXFxuXCIpKSB7XHJcblx0XHRcdGlmIChsaW5lLnN0YXJ0c1dpdGgoXCJgYGBcIikpIHtcclxuXHRcdFx0XHQvLyBSZWFjaGVkIGVuZCBvZiBjb2RlIGJsb2NrXHJcblx0XHRcdFx0aWYgKGluc2lkZUNvZGVCbG9jaykge1xyXG5cdFx0XHRcdFx0Ly8gU3RvcCB0cmF2ZXJzYWwgb25jZSB3ZSd2ZSByZWFjaGVkIHRoZSBjb2RlIGJsb2NrIGJlaW5nIHJ1blxyXG5cdFx0XHRcdFx0Ly8gT25seSBkbyB0aGlzIGZvciB0aGUgb3JpZ2luYWwgZmlsZSB0aGUgdXNlciBpcyBydW5uaW5nXHJcblx0XHRcdFx0XHRjb25zdCBzcmNDb2RlVHJpbW1lZCA9IHNyY0NvZGUudHJpbSgpO1xyXG5cdFx0XHRcdFx0Y29uc3QgY3VycmVudENvZGVUcmltbWVkID0gY3VycmVudENvZGUudHJpbSgpO1xyXG5cdFx0XHRcdFx0aWYgKGlzTGFuZ3VhZ2VFcXVhbCAmJiBzcmNDb2RlVHJpbW1lZC5sZW5ndGggPT09IGN1cnJlbnRDb2RlVHJpbW1lZC5sZW5ndGggJiYgc3JjQ29kZVRyaW1tZWQgPT09IGN1cnJlbnRDb2RlVHJpbW1lZCkge1xyXG5cdFx0XHRcdFx0XHR0aGlzLm1haW5BcmdzID0gZ2V0QXJncyhjdXJyZW50Rmlyc3RMaW5lKTtcclxuXHRcdFx0XHRcdFx0Ly8gR2V0IG5hbWVkIGltcG9ydHNcclxuXHRcdFx0XHRcdFx0aWYgKHRoaXMubWFpbkFyZ3MuaW1wb3J0KSB7XHJcblx0XHRcdFx0XHRcdFx0Y29uc3QgZXJyID0gdGhpcy5oYW5kbGVOYW1lZEltcG9ydHModGhpcy5tYWluQXJncy5pbXBvcnQpO1xyXG5cdFx0XHRcdFx0XHRcdGlmIChlcnIpIHJldHVybiBcIlwiO1xyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0Ly8gTmFtZWQgZXhwb3J0XHJcblx0XHRcdFx0XHRpZiAoY3VycmVudEFyZ3MubGFiZWwpIHtcclxuXHRcdFx0XHRcdFx0Ly8gRXhwb3J0IGFscmVhZHkgZXhpc3RzXHJcblx0XHRcdFx0XHRcdGlmICh0aGlzLm5hbWVkRXhwb3J0cy5oYXNPd25Qcm9wZXJ0eShjdXJyZW50QXJncy5sYWJlbCkpIHtcclxuXHRcdFx0XHRcdFx0XHRuZXcgTm90aWNlKGBFcnJvcjogbmFtZWQgZXhwb3J0ICR7Y3VycmVudEFyZ3MubGFiZWx9IGV4cG9ydGVkIG1vcmUgdGhhbiBvbmNlYCk7XHJcblx0XHRcdFx0XHRcdFx0cmV0dXJuIFwiXCI7XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0dGhpcy5uYW1lZEV4cG9ydHNbY3VycmVudEFyZ3MubGFiZWxdID0gY3VycmVudENvZGU7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHQvLyBQcmUgLyBwb3N0IGV4cG9ydFxyXG5cdFx0XHRcdFx0aWYgKCFBcnJheS5pc0FycmF5KGN1cnJlbnRBcmdzLmV4cG9ydCkpXHJcblx0XHRcdFx0XHRcdGN1cnJlbnRBcmdzLmV4cG9ydCA9IFtjdXJyZW50QXJncy5leHBvcnRdO1xyXG5cdFx0XHRcdFx0aWYgKGN1cnJlbnRBcmdzLmV4cG9ydC5jb250YWlucyhcInByZVwiKSlcclxuXHRcdFx0XHRcdFx0dGhpcy5wcmVwZW5kU3JjQ29kZSArPSBgJHt0aGlzLmRpc2FibGVfcHJpbnQoY3VycmVudENvZGUpfVxcbmA7XHJcblx0XHRcdFx0XHRpZiAoY3VycmVudEFyZ3MuZXhwb3J0LmNvbnRhaW5zKFwicG9zdFwiKSlcclxuXHRcdFx0XHRcdFx0dGhpcy5hcHBlbmRTcmNDb2RlICs9IGAke3RoaXMuZGlzYWJsZV9wcmludChjdXJyZW50Q29kZSl9XFxuYDtcclxuXHRcdFx0XHRcdGN1cnJlbnRMYW5ndWFnZSA9IFwiXCI7XHJcblx0XHRcdFx0XHRjdXJyZW50Q29kZSA9IFwiXCI7XHJcblx0XHRcdFx0XHRpbnNpZGVDb2RlQmxvY2sgPSBmYWxzZTtcclxuXHRcdFx0XHRcdGN1cnJlbnRBcmdzID0ge307XHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHQvLyByZWFjaGVkIHN0YXJ0IG9mIGNvZGUgYmxvY2tcclxuXHRcdFx0XHRlbHNlIHtcclxuXHRcdFx0XHRcdGN1cnJlbnRMYW5ndWFnZSA9IGdldENvZGVCbG9ja0xhbmd1YWdlKGxpbmUpO1xyXG5cdFx0XHRcdFx0Ly8gRG9uJ3QgY2hlY2sgY29kZSBibG9ja3MgZnJvbSBhIGRpZmZlcmVudCBsYW5ndWFnZVxyXG5cdFx0XHRcdFx0aXNMYW5ndWFnZUVxdWFsID0gL1teLV0qJC8uZXhlYyhsYW5ndWFnZSlbMF0gPT09IC9bXi1dKiQvLmV4ZWMoY3VycmVudExhbmd1YWdlKVswXTtcclxuXHRcdFx0XHRcdGlmIChpc0xhbmd1YWdlRXF1YWwpIHtcclxuXHRcdFx0XHRcdFx0Y3VycmVudEFyZ3MgPSBnZXRBcmdzKGxpbmUpO1xyXG5cdFx0XHRcdFx0XHRjdXJyZW50Rmlyc3RMaW5lID0gbGluZTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdGluc2lkZUNvZGVCbG9jayA9IHRydWU7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9IGVsc2UgaWYgKGluc2lkZUNvZGVCbG9jayAmJiBpc0xhbmd1YWdlRXF1YWwpIHtcclxuXHRcdFx0XHRjdXJyZW50Q29kZSArPSBgJHtsaW5lfVxcbmA7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdHByaXZhdGUgZGlzYWJsZV9wcmludChjb2RlOiBTdHJpbmcpOiBTdHJpbmcge1xyXG5cdFx0aWYgKCF0aGlzLnNldHRpbmdzLm9ubHlDdXJyZW50QmxvY2spIHtcclxuXHRcdFx0cmV0dXJuIGNvZGU7XHJcblx0XHR9XHJcblx0XHRjb25zdCBwYXR0ZXJuOiBSZWdFeHAgPSAvXnByaW50XFxzKiguKikvZ207XHJcblx0XHQvLyDkvb/nlKjmraPliJnooajovr7lvI/mm7/mjaLlh73mlbDlsIbnrKblkIjmnaHku7bnmoTlhoXlrrnms6jph4rmjolcclxuXHRcdHJldHVybiBjb2RlLnJlcGxhY2UocGF0dGVybiwgJyAnKTtcclxuXHR9XHJcbn1cclxuIl19