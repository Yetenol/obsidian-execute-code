import { Notice } from "obsidian";
import * as fs from "fs";
import * as child_process from "child_process";
import Executor from "./Executor";
import windowsPathToWsl from "../transforms/windowsPathToWsl.js";
export default class NonInteractiveCodeExecutor extends Executor {
    constructor(settings, usesShell, file, language) {
        super(file, language);
        this.resolveRun = undefined;
        this.settings = settings;
        this.usesShell = usesShell;
    }
    stop() {
        return Promise.resolve();
    }
    run(codeBlockContent, outputter, cmd, cmdArgs, ext) {
        // Resolve any currently running blocks
        if (this.resolveRun !== undefined)
            this.resolveRun();
        this.resolveRun = undefined;
        return new Promise((resolve, reject) => {
            const tempFileName = this.getTempFile(ext);
            fs.promises.writeFile(tempFileName, codeBlockContent).then(() => {
                const args = cmdArgs ? cmdArgs.split(" ") : [];
                if (this.isWSLEnabled()) {
                    args.unshift("-e", cmd);
                    cmd = "wsl";
                    args.push(windowsPathToWsl(tempFileName));
                }
                else {
                    args.push(tempFileName);
                }
                let child;
                // check if compiled by gcc
                if (cmd.endsWith("gcc") || cmd.endsWith("gcc.exe")) {
                    // remove .c from tempFileName and add .out for the compiled output and add output path to args
                    const tempFileNameWExe = tempFileName.slice(0, -2) + ".out";
                    args.push("-o", tempFileNameWExe);
                    // compile c file with gcc and handle possible output
                    const childGCC = child_process.spawn(cmd, args, { env: process.env, shell: this.usesShell });
                    this.handleChildOutput(childGCC, outputter, tempFileName);
                    childGCC.on('exit', (code) => {
                        if (code === 0) {
                            // executing the compiled file
                            child = child_process.spawn(tempFileNameWExe, { env: process.env, shell: this.usesShell });
                            this.handleChildOutput(child, outputter, tempFileNameWExe).then(() => {
                                this.tempFileId = undefined; // Reset the file id to use a new file next time
                            });
                        }
                    });
                }
                else {
                    child = child_process.spawn(cmd, args, { env: process.env, shell: this.usesShell });
                    this.handleChildOutput(child, outputter, tempFileName).then(() => {
                        this.tempFileId = undefined; // Reset the file id to use a new file next time
                    });
                }
                // We don't resolve the promise here - 'handleChildOutput' registers a listener
                // For when the child_process closes, and will resolve the promise there
                this.resolveRun = resolve;
            }).catch((err) => {
                this.notifyError(cmd, cmdArgs, tempFileName, err, outputter);
                resolve();
            });
        });
    }
    isWSLEnabled() {
        if (this.settings.wslMode) {
            return true;
        }
        if (this.language == 'shell' && this.settings.shellWSLMode) {
            return true;
        }
        return false;
    }
    /**
     * Handles the output of a child process and redirects stdout and stderr to the given {@link Outputter} element.
     * Removes the temporary file after the code execution. Creates a new Notice after the code execution.
     *
     * @param child The child process to handle.
     * @param outputter The {@link Outputter} that should be used to display the output of the code.
     * @param fileName The name of the temporary file that was created for the code execution.
     * @returns a promise that will resolve when the child proces finishes
     */
    async handleChildOutput(child, outputter, fileName) {
        outputter.clear();
        // Kill process on clear
        outputter.killBlock = () => {
            // Kill the process
            child.kill('SIGINT');
        };
        this.stdoutCb = (data) => {
            outputter.write(data.toString());
        };
        this.stderrCb = (data) => {
            outputter.writeErr(data.toString());
        };
        child.stdout.on('data', this.stdoutCb);
        child.stderr.on('data', this.stderrCb);
        outputter.on("data", (data) => {
            child.stdin.write(data);
        });
        child.on('close', (code) => {
            if (code !== 0)
                new Notice("Error!");
            // Resolve the run promise once finished running the code block
            if (this.resolveRun !== undefined)
                this.resolveRun();
            outputter.closeInput();
            if (fileName === undefined)
                return;
            fs.promises.rm(fileName)
                .catch((err) => {
                console.error("Error in 'Obsidian Execute Code' Plugin while removing file: " + err);
            });
        });
        child.on('error', (err) => {
            new Notice("Error!");
            outputter.writeErr(err.toString());
        });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTm9uSW50ZXJhY3RpdmVDb2RlRXhlY3V0b3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJOb25JbnRlcmFjdGl2ZUNvZGVFeGVjdXRvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUMsTUFBTSxFQUFDLE1BQU0sVUFBVSxDQUFDO0FBQ2hDLE9BQU8sS0FBSyxFQUFFLE1BQU0sSUFBSSxDQUFDO0FBQ3pCLE9BQU8sS0FBSyxhQUFhLE1BQU0sZUFBZSxDQUFDO0FBQy9DLE9BQU8sUUFBUSxNQUFNLFlBQVksQ0FBQztBQUlsQyxPQUFPLGdCQUFnQixNQUFNLG1DQUFtQyxDQUFDO0FBR2pFLE1BQU0sQ0FBQyxPQUFPLE9BQU8sMEJBQTJCLFNBQVEsUUFBUTtJQU8vRCxZQUFZLFFBQTBCLEVBQUUsU0FBa0IsRUFBRSxJQUFZLEVBQUUsUUFBb0I7UUFDN0YsS0FBSyxDQUFDLElBQUksRUFBRSxRQUFRLENBQUMsQ0FBQztRQUp2QixlQUFVLEdBQTBELFNBQVMsQ0FBQztRQU03RSxJQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQztRQUN6QixJQUFJLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQztJQUM1QixDQUFDO0lBRUQsSUFBSTtRQUNILE9BQU8sT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDO0lBQzFCLENBQUM7SUFFRCxHQUFHLENBQUMsZ0JBQXdCLEVBQUUsU0FBb0IsRUFBRSxHQUFXLEVBQUUsT0FBZSxFQUFFLEdBQVc7UUFDNUYsdUNBQXVDO1FBQ3ZDLElBQUksSUFBSSxDQUFDLFVBQVUsS0FBSyxTQUFTO1lBQ2hDLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztRQUNuQixJQUFJLENBQUMsVUFBVSxHQUFHLFNBQVMsQ0FBQztRQUU1QixPQUFPLElBQUksT0FBTyxDQUFPLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFO1lBQzVDLE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUM7WUFFM0MsRUFBRSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsWUFBWSxFQUFFLGdCQUFnQixDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRTtnQkFDL0QsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7Z0JBRS9DLElBQUksSUFBSSxDQUFDLFlBQVksRUFBRSxFQUFFO29CQUN4QixJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQztvQkFDeEIsR0FBRyxHQUFHLEtBQUssQ0FBQztvQkFDWixJQUFJLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUM7aUJBQzFDO3FCQUFNO29CQUNOLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7aUJBQ3hCO2dCQUdELElBQUksS0FBbUQsQ0FBQztnQkFFeEQsMkJBQTJCO2dCQUMzQixJQUFJLEdBQUcsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLElBQUksR0FBRyxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsRUFBRTtvQkFDbkQsK0ZBQStGO29CQUMvRixNQUFNLGdCQUFnQixHQUFXLFlBQVksQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDO29CQUNwRSxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO29CQUVsQyxxREFBcUQ7b0JBQ3JELE1BQU0sUUFBUSxHQUFHLGFBQWEsQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxFQUFDLEdBQUcsRUFBRSxPQUFPLENBQUMsR0FBRyxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsU0FBUyxFQUFDLENBQUMsQ0FBQztvQkFDM0YsSUFBSSxDQUFDLGlCQUFpQixDQUFDLFFBQVEsRUFBRSxTQUFTLEVBQUUsWUFBWSxDQUFDLENBQUM7b0JBQzFELFFBQVEsQ0FBQyxFQUFFLENBQUMsTUFBTSxFQUFFLENBQUMsSUFBSSxFQUFFLEVBQUU7d0JBQzVCLElBQUksSUFBSSxLQUFLLENBQUMsRUFBRTs0QkFDZiw4QkFBOEI7NEJBQzlCLEtBQUssR0FBRyxhQUFhLENBQUMsS0FBSyxDQUFDLGdCQUFnQixFQUFFLEVBQUUsR0FBRyxFQUFFLE9BQU8sQ0FBQyxHQUFHLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDOzRCQUMzRixJQUFJLENBQUMsaUJBQWlCLENBQUMsS0FBSyxFQUFFLFNBQVMsRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUU7Z0NBQ3BFLElBQUksQ0FBQyxVQUFVLEdBQUcsU0FBUyxDQUFDLENBQUMsZ0RBQWdEOzRCQUM5RSxDQUFDLENBQUMsQ0FBQzt5QkFDSDtvQkFDRixDQUFDLENBQUMsQ0FBQztpQkFDSDtxQkFBTTtvQkFDTixLQUFLLEdBQUcsYUFBYSxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLEVBQUUsR0FBRyxFQUFFLE9BQU8sQ0FBQyxHQUFHLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDO29CQUNwRixJQUFJLENBQUMsaUJBQWlCLENBQUMsS0FBSyxFQUFFLFNBQVMsRUFBRSxZQUFZLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFO3dCQUNoRSxJQUFJLENBQUMsVUFBVSxHQUFHLFNBQVMsQ0FBQyxDQUFDLGdEQUFnRDtvQkFDOUUsQ0FBQyxDQUFDLENBQUM7aUJBQ0g7Z0JBRUQsK0VBQStFO2dCQUMvRSx3RUFBd0U7Z0JBQ3hFLElBQUksQ0FBQyxVQUFVLEdBQUcsT0FBTyxDQUFDO1lBQzNCLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUFFO2dCQUNoQixJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsRUFBRSxPQUFPLEVBQUUsWUFBWSxFQUFFLEdBQUcsRUFBRSxTQUFTLENBQUMsQ0FBQztnQkFDN0QsT0FBTyxFQUFFLENBQUM7WUFDWCxDQUFDLENBQUMsQ0FBQztRQUNKLENBQUMsQ0FBQyxDQUFDO0lBQ0osQ0FBQztJQUVPLFlBQVk7UUFDbkIsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRTtZQUMxQixPQUFPLElBQUksQ0FBQztTQUNaO1FBRUQsSUFBSSxJQUFJLENBQUMsUUFBUSxJQUFJLE9BQU8sSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLFlBQVksRUFBRTtZQUMzRCxPQUFPLElBQUksQ0FBQztTQUNaO1FBRUQsT0FBTyxLQUFLLENBQUM7SUFDZCxDQUFDO0lBRUQ7Ozs7Ozs7O09BUUc7SUFDTyxLQUFLLENBQUMsaUJBQWlCLENBQUMsS0FBbUQsRUFBRSxTQUFvQixFQUFFLFFBQTRCO1FBQ3hJLFNBQVMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUVsQix3QkFBd0I7UUFDeEIsU0FBUyxDQUFDLFNBQVMsR0FBRyxHQUFHLEVBQUU7WUFDMUIsbUJBQW1CO1lBQ25CLEtBQUssQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDdEIsQ0FBQyxDQUFBO1FBRUQsSUFBSSxDQUFDLFFBQVEsR0FBRyxDQUFDLElBQUksRUFBRSxFQUFFO1lBQ3hCLFNBQVMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7UUFDbEMsQ0FBQyxDQUFDO1FBQ0YsSUFBSSxDQUFDLFFBQVEsR0FBRyxDQUFDLElBQUksRUFBRSxFQUFFO1lBQ3hCLFNBQVMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7UUFDckMsQ0FBQyxDQUFDO1FBRUYsS0FBSyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUN2QyxLQUFLLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBRXZDLFNBQVMsQ0FBQyxFQUFFLENBQUMsTUFBTSxFQUFFLENBQUMsSUFBWSxFQUFFLEVBQUU7WUFDckMsS0FBSyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDekIsQ0FBQyxDQUFDLENBQUM7UUFFSCxLQUFLLENBQUMsRUFBRSxDQUFDLE9BQU8sRUFBRSxDQUFDLElBQUksRUFBRSxFQUFFO1lBQzFCLElBQUksSUFBSSxLQUFLLENBQUM7Z0JBQ2IsSUFBSSxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUM7WUFFdEIsK0RBQStEO1lBQy9ELElBQUksSUFBSSxDQUFDLFVBQVUsS0FBSyxTQUFTO2dCQUNoQyxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7WUFFbkIsU0FBUyxDQUFDLFVBQVUsRUFBRSxDQUFDO1lBRXZCLElBQUksUUFBUSxLQUFLLFNBQVM7Z0JBQUUsT0FBTztZQUVuQyxFQUFFLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxRQUFRLENBQUM7aUJBQ3RCLEtBQUssQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUFFO2dCQUNkLE9BQU8sQ0FBQyxLQUFLLENBQUMsK0RBQStELEdBQUcsR0FBRyxDQUFDLENBQUM7WUFDdEYsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDLENBQUMsQ0FBQztRQUVILEtBQUssQ0FBQyxFQUFFLENBQUMsT0FBTyxFQUFFLENBQUMsR0FBRyxFQUFFLEVBQUU7WUFDekIsSUFBSSxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDckIsU0FBUyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztRQUNwQyxDQUFDLENBQUMsQ0FBQztJQUNKLENBQUM7Q0FDRCIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7Tm90aWNlfSBmcm9tIFwib2JzaWRpYW5cIjtcclxuaW1wb3J0ICogYXMgZnMgZnJvbSBcImZzXCI7XHJcbmltcG9ydCAqIGFzIGNoaWxkX3Byb2Nlc3MgZnJvbSBcImNoaWxkX3Byb2Nlc3NcIjtcclxuaW1wb3J0IEV4ZWN1dG9yIGZyb20gXCIuL0V4ZWN1dG9yXCI7XHJcbmltcG9ydCB7T3V0cHV0dGVyfSBmcm9tIFwic3JjL291dHB1dC9PdXRwdXR0ZXJcIjtcclxuaW1wb3J0IHtMYW5ndWFnZUlkfSBmcm9tIFwic3JjL21haW5cIjtcclxuaW1wb3J0IHsgRXhlY3V0b3JTZXR0aW5ncyB9IGZyb20gXCIuLi9zZXR0aW5ncy9TZXR0aW5ncy5qc1wiO1xyXG5pbXBvcnQgd2luZG93c1BhdGhUb1dzbCBmcm9tIFwiLi4vdHJhbnNmb3Jtcy93aW5kb3dzUGF0aFRvV3NsLmpzXCI7XHJcbmltcG9ydCB7IGVycm9yIH0gZnJvbSBcImNvbnNvbGVcIjtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE5vbkludGVyYWN0aXZlQ29kZUV4ZWN1dG9yIGV4dGVuZHMgRXhlY3V0b3Ige1xyXG5cdHVzZXNTaGVsbDogYm9vbGVhblxyXG5cdHN0ZG91dENiOiAoY2h1bms6IGFueSkgPT4gdm9pZFxyXG5cdHN0ZGVyckNiOiAoY2h1bms6IGFueSkgPT4gdm9pZFxyXG5cdHJlc29sdmVSdW46ICh2YWx1ZTogdm9pZCB8IFByb21pc2VMaWtlPHZvaWQ+KSA9PiB2b2lkIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xyXG5cdHNldHRpbmdzOiBFeGVjdXRvclNldHRpbmdzO1xyXG5cclxuXHRjb25zdHJ1Y3RvcihzZXR0aW5nczogRXhlY3V0b3JTZXR0aW5ncywgdXNlc1NoZWxsOiBib29sZWFuLCBmaWxlOiBzdHJpbmcsIGxhbmd1YWdlOiBMYW5ndWFnZUlkKSB7XHJcblx0XHRzdXBlcihmaWxlLCBsYW5ndWFnZSk7XHJcblxyXG5cdFx0dGhpcy5zZXR0aW5ncyA9IHNldHRpbmdzO1xyXG5cdFx0dGhpcy51c2VzU2hlbGwgPSB1c2VzU2hlbGw7XHJcblx0fVxyXG5cclxuXHRzdG9wKCk6IFByb21pc2U8dm9pZD4ge1xyXG5cdFx0cmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xyXG5cdH1cclxuXHJcblx0cnVuKGNvZGVCbG9ja0NvbnRlbnQ6IHN0cmluZywgb3V0cHV0dGVyOiBPdXRwdXR0ZXIsIGNtZDogc3RyaW5nLCBjbWRBcmdzOiBzdHJpbmcsIGV4dDogc3RyaW5nKSB7XHJcblx0XHQvLyBSZXNvbHZlIGFueSBjdXJyZW50bHkgcnVubmluZyBibG9ja3NcclxuXHRcdGlmICh0aGlzLnJlc29sdmVSdW4gIT09IHVuZGVmaW5lZClcclxuXHRcdFx0dGhpcy5yZXNvbHZlUnVuKCk7XHJcblx0XHR0aGlzLnJlc29sdmVSdW4gPSB1bmRlZmluZWQ7XHJcblxyXG5cdFx0cmV0dXJuIG5ldyBQcm9taXNlPHZvaWQ+KChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuXHRcdFx0Y29uc3QgdGVtcEZpbGVOYW1lID0gdGhpcy5nZXRUZW1wRmlsZShleHQpO1xyXG5cclxuXHRcdFx0ZnMucHJvbWlzZXMud3JpdGVGaWxlKHRlbXBGaWxlTmFtZSwgY29kZUJsb2NrQ29udGVudCkudGhlbigoKSA9PiB7XHJcblx0XHRcdFx0Y29uc3QgYXJncyA9IGNtZEFyZ3MgPyBjbWRBcmdzLnNwbGl0KFwiIFwiKSA6IFtdO1xyXG5cclxuXHRcdFx0XHRpZiAodGhpcy5pc1dTTEVuYWJsZWQoKSkge1xyXG5cdFx0XHRcdFx0YXJncy51bnNoaWZ0KFwiLWVcIiwgY21kKTtcclxuXHRcdFx0XHRcdGNtZCA9IFwid3NsXCI7XHJcblx0XHRcdFx0XHRhcmdzLnB1c2god2luZG93c1BhdGhUb1dzbCh0ZW1wRmlsZU5hbWUpKTtcclxuXHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0YXJncy5wdXNoKHRlbXBGaWxlTmFtZSk7XHJcblx0XHRcdFx0fVxyXG5cclxuXHJcblx0XHRcdFx0bGV0IGNoaWxkOiBjaGlsZF9wcm9jZXNzLkNoaWxkUHJvY2Vzc1dpdGhvdXROdWxsU3RyZWFtcztcclxuXHJcblx0XHRcdFx0Ly8gY2hlY2sgaWYgY29tcGlsZWQgYnkgZ2NjXHJcblx0XHRcdFx0aWYgKGNtZC5lbmRzV2l0aChcImdjY1wiKSB8fCBjbWQuZW5kc1dpdGgoXCJnY2MuZXhlXCIpKSB7XHJcblx0XHRcdFx0XHQvLyByZW1vdmUgLmMgZnJvbSB0ZW1wRmlsZU5hbWUgYW5kIGFkZCAub3V0IGZvciB0aGUgY29tcGlsZWQgb3V0cHV0IGFuZCBhZGQgb3V0cHV0IHBhdGggdG8gYXJnc1xyXG5cdFx0XHRcdFx0Y29uc3QgdGVtcEZpbGVOYW1lV0V4ZTogc3RyaW5nID0gdGVtcEZpbGVOYW1lLnNsaWNlKDAsIC0yKSArIFwiLm91dFwiO1xyXG5cdFx0XHRcdFx0YXJncy5wdXNoKFwiLW9cIiwgdGVtcEZpbGVOYW1lV0V4ZSk7XHJcblxyXG5cdFx0XHRcdFx0Ly8gY29tcGlsZSBjIGZpbGUgd2l0aCBnY2MgYW5kIGhhbmRsZSBwb3NzaWJsZSBvdXRwdXRcclxuXHRcdFx0XHRcdGNvbnN0IGNoaWxkR0NDID0gY2hpbGRfcHJvY2Vzcy5zcGF3bihjbWQsIGFyZ3MsIHtlbnY6IHByb2Nlc3MuZW52LCBzaGVsbDogdGhpcy51c2VzU2hlbGx9KTtcclxuXHRcdFx0XHRcdHRoaXMuaGFuZGxlQ2hpbGRPdXRwdXQoY2hpbGRHQ0MsIG91dHB1dHRlciwgdGVtcEZpbGVOYW1lKTtcclxuXHRcdFx0XHRcdGNoaWxkR0NDLm9uKCdleGl0JywgKGNvZGUpID0+IHtcclxuXHRcdFx0XHRcdFx0aWYgKGNvZGUgPT09IDApIHtcclxuXHRcdFx0XHRcdFx0XHQvLyBleGVjdXRpbmcgdGhlIGNvbXBpbGVkIGZpbGVcclxuXHRcdFx0XHRcdFx0XHRjaGlsZCA9IGNoaWxkX3Byb2Nlc3Muc3Bhd24odGVtcEZpbGVOYW1lV0V4ZSwgeyBlbnY6IHByb2Nlc3MuZW52LCBzaGVsbDogdGhpcy51c2VzU2hlbGwgfSk7XHJcblx0XHRcdFx0XHRcdFx0dGhpcy5oYW5kbGVDaGlsZE91dHB1dChjaGlsZCwgb3V0cHV0dGVyLCB0ZW1wRmlsZU5hbWVXRXhlKS50aGVuKCgpID0+IHtcclxuXHRcdFx0XHRcdFx0XHRcdHRoaXMudGVtcEZpbGVJZCA9IHVuZGVmaW5lZDsgLy8gUmVzZXQgdGhlIGZpbGUgaWQgdG8gdXNlIGEgbmV3IGZpbGUgbmV4dCB0aW1lXHJcblx0XHRcdFx0XHRcdFx0fSk7XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdH0pO1xyXG5cdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHRjaGlsZCA9IGNoaWxkX3Byb2Nlc3Muc3Bhd24oY21kLCBhcmdzLCB7IGVudjogcHJvY2Vzcy5lbnYsIHNoZWxsOiB0aGlzLnVzZXNTaGVsbCB9KTtcclxuXHRcdFx0XHRcdHRoaXMuaGFuZGxlQ2hpbGRPdXRwdXQoY2hpbGQsIG91dHB1dHRlciwgdGVtcEZpbGVOYW1lKS50aGVuKCgpID0+IHtcclxuXHRcdFx0XHRcdFx0dGhpcy50ZW1wRmlsZUlkID0gdW5kZWZpbmVkOyAvLyBSZXNldCB0aGUgZmlsZSBpZCB0byB1c2UgYSBuZXcgZmlsZSBuZXh0IHRpbWVcclxuXHRcdFx0XHRcdH0pO1xyXG5cdFx0XHRcdH1cdFx0XHRcdFxyXG5cclxuXHRcdFx0XHQvLyBXZSBkb24ndCByZXNvbHZlIHRoZSBwcm9taXNlIGhlcmUgLSAnaGFuZGxlQ2hpbGRPdXRwdXQnIHJlZ2lzdGVycyBhIGxpc3RlbmVyXHJcblx0XHRcdFx0Ly8gRm9yIHdoZW4gdGhlIGNoaWxkX3Byb2Nlc3MgY2xvc2VzLCBhbmQgd2lsbCByZXNvbHZlIHRoZSBwcm9taXNlIHRoZXJlXHJcblx0XHRcdFx0dGhpcy5yZXNvbHZlUnVuID0gcmVzb2x2ZTtcdFxyXG5cdFx0XHR9KS5jYXRjaCgoZXJyKSA9PiB7XHJcblx0XHRcdFx0dGhpcy5ub3RpZnlFcnJvcihjbWQsIGNtZEFyZ3MsIHRlbXBGaWxlTmFtZSwgZXJyLCBvdXRwdXR0ZXIpO1xyXG5cdFx0XHRcdHJlc29sdmUoKTtcclxuXHRcdFx0fSk7XHJcblx0XHR9KTtcclxuXHR9XHJcblxyXG5cdHByaXZhdGUgaXNXU0xFbmFibGVkKCk6IGJvb2xlYW4ge1xyXG5cdFx0aWYgKHRoaXMuc2V0dGluZ3Mud3NsTW9kZSkge1xyXG5cdFx0XHRyZXR1cm4gdHJ1ZTtcclxuXHRcdH1cclxuXHJcblx0XHRpZiAodGhpcy5sYW5ndWFnZSA9PSAnc2hlbGwnICYmIHRoaXMuc2V0dGluZ3Muc2hlbGxXU0xNb2RlKSB7XHJcblx0XHRcdHJldHVybiB0cnVlO1xyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiBmYWxzZTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEhhbmRsZXMgdGhlIG91dHB1dCBvZiBhIGNoaWxkIHByb2Nlc3MgYW5kIHJlZGlyZWN0cyBzdGRvdXQgYW5kIHN0ZGVyciB0byB0aGUgZ2l2ZW4ge0BsaW5rIE91dHB1dHRlcn0gZWxlbWVudC5cclxuXHQgKiBSZW1vdmVzIHRoZSB0ZW1wb3JhcnkgZmlsZSBhZnRlciB0aGUgY29kZSBleGVjdXRpb24uIENyZWF0ZXMgYSBuZXcgTm90aWNlIGFmdGVyIHRoZSBjb2RlIGV4ZWN1dGlvbi5cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSBjaGlsZCBUaGUgY2hpbGQgcHJvY2VzcyB0byBoYW5kbGUuXHJcblx0ICogQHBhcmFtIG91dHB1dHRlciBUaGUge0BsaW5rIE91dHB1dHRlcn0gdGhhdCBzaG91bGQgYmUgdXNlZCB0byBkaXNwbGF5IHRoZSBvdXRwdXQgb2YgdGhlIGNvZGUuXHJcblx0ICogQHBhcmFtIGZpbGVOYW1lIFRoZSBuYW1lIG9mIHRoZSB0ZW1wb3JhcnkgZmlsZSB0aGF0IHdhcyBjcmVhdGVkIGZvciB0aGUgY29kZSBleGVjdXRpb24uXHJcblx0ICogQHJldHVybnMgYSBwcm9taXNlIHRoYXQgd2lsbCByZXNvbHZlIHdoZW4gdGhlIGNoaWxkIHByb2NlcyBmaW5pc2hlc1xyXG5cdCAqL1xyXG5cdHByb3RlY3RlZCBhc3luYyBoYW5kbGVDaGlsZE91dHB1dChjaGlsZDogY2hpbGRfcHJvY2Vzcy5DaGlsZFByb2Nlc3NXaXRob3V0TnVsbFN0cmVhbXMsIG91dHB1dHRlcjogT3V0cHV0dGVyLCBmaWxlTmFtZTogc3RyaW5nIHwgdW5kZWZpbmVkKSB7XHJcblx0XHRvdXRwdXR0ZXIuY2xlYXIoKTtcclxuXHJcblx0XHQvLyBLaWxsIHByb2Nlc3Mgb24gY2xlYXJcclxuXHRcdG91dHB1dHRlci5raWxsQmxvY2sgPSAoKSA9PiB7XHJcblx0XHRcdC8vIEtpbGwgdGhlIHByb2Nlc3NcclxuXHRcdFx0Y2hpbGQua2lsbCgnU0lHSU5UJyk7XHJcblx0XHR9XHJcblxyXG5cdFx0dGhpcy5zdGRvdXRDYiA9IChkYXRhKSA9PiB7XHJcblx0XHRcdG91dHB1dHRlci53cml0ZShkYXRhLnRvU3RyaW5nKCkpO1xyXG5cdFx0fTtcclxuXHRcdHRoaXMuc3RkZXJyQ2IgPSAoZGF0YSkgPT4ge1xyXG5cdFx0XHRvdXRwdXR0ZXIud3JpdGVFcnIoZGF0YS50b1N0cmluZygpKTtcclxuXHRcdH07XHJcblxyXG5cdFx0Y2hpbGQuc3Rkb3V0Lm9uKCdkYXRhJywgdGhpcy5zdGRvdXRDYik7XHJcblx0XHRjaGlsZC5zdGRlcnIub24oJ2RhdGEnLCB0aGlzLnN0ZGVyckNiKTtcclxuXHJcblx0XHRvdXRwdXR0ZXIub24oXCJkYXRhXCIsIChkYXRhOiBzdHJpbmcpID0+IHtcclxuXHRcdFx0Y2hpbGQuc3RkaW4ud3JpdGUoZGF0YSk7XHJcblx0XHR9KTtcclxuXHJcblx0XHRjaGlsZC5vbignY2xvc2UnLCAoY29kZSkgPT4ge1xyXG5cdFx0XHRpZiAoY29kZSAhPT0gMClcclxuXHRcdFx0XHRuZXcgTm90aWNlKFwiRXJyb3IhXCIpO1xyXG5cclxuXHRcdFx0Ly8gUmVzb2x2ZSB0aGUgcnVuIHByb21pc2Ugb25jZSBmaW5pc2hlZCBydW5uaW5nIHRoZSBjb2RlIGJsb2NrXHJcblx0XHRcdGlmICh0aGlzLnJlc29sdmVSdW4gIT09IHVuZGVmaW5lZClcclxuXHRcdFx0XHR0aGlzLnJlc29sdmVSdW4oKTtcclxuXHJcblx0XHRcdG91dHB1dHRlci5jbG9zZUlucHV0KCk7XHJcblxyXG5cdFx0XHRpZiAoZmlsZU5hbWUgPT09IHVuZGVmaW5lZCkgcmV0dXJuO1xyXG5cclxuXHRcdFx0ZnMucHJvbWlzZXMucm0oZmlsZU5hbWUpXHJcblx0XHRcdFx0LmNhdGNoKChlcnIpID0+IHtcclxuXHRcdFx0XHRcdGNvbnNvbGUuZXJyb3IoXCJFcnJvciBpbiAnT2JzaWRpYW4gRXhlY3V0ZSBDb2RlJyBQbHVnaW4gd2hpbGUgcmVtb3ZpbmcgZmlsZTogXCIgKyBlcnIpO1xyXG5cdFx0XHRcdH0pO1xyXG5cdFx0fSk7XHJcblxyXG5cdFx0Y2hpbGQub24oJ2Vycm9yJywgKGVycikgPT4ge1xyXG5cdFx0XHRuZXcgTm90aWNlKFwiRXJyb3IhXCIpO1xyXG5cdFx0XHRvdXRwdXR0ZXIud3JpdGVFcnIoZXJyLnRvU3RyaW5nKCkpO1xyXG5cdFx0fSk7XHJcblx0fVxyXG59XHJcbiJdfQ==