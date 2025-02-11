import NonInteractiveCodeExecutor from "./NonInteractiveCodeExecutor";
import * as fs from "fs";
import * as child_process from "child_process";
import windowsPathToWsl from "../transforms/windowsPathToWsl";
/**
 * This class is identical to NoneInteractiveCodeExecutor, except that it uses the PowerShell encoding setting.
 * This is necessary because PowerShell still uses windows-1252 as default encoding for legacy reasons.
 * In this implementation, we use latin-1 as default encoding, which is basically the same as windows-1252.
 * See https://stackoverflow.com/questions/62557890/reading-a-windows-1252-file-in-node-js
 * and https://learn.microsoft.com/en-us/powershell/scripting/dev-cross-plat/vscode/understanding-file-encoding?view=powershell-7.3
 */
export default class PowerShellOnWindowsExecutor extends NonInteractiveCodeExecutor {
    constructor(settings, file) {
        super(settings, true, file, "powershell");
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
            fs.promises.writeFile(tempFileName, codeBlockContent, this.settings.powershellEncoding).then(() => {
                const args = cmdArgs ? cmdArgs.split(" ") : [];
                if (this.settings.wslMode) {
                    args.unshift("-e", cmd);
                    cmd = "wsl";
                    args.push(windowsPathToWsl(tempFileName));
                }
                else {
                    args.push(tempFileName);
                }
                const child = child_process.spawn(cmd, args, { env: process.env, shell: this.usesShell });
                this.handleChildOutput(child, outputter, tempFileName).then(() => {
                    this.tempFileId = undefined; // Reset the file id to use a new file next time
                });
                // We don't resolve the promise here - 'handleChildOutput' registers a listener
                // For when the child_process closes, and will resolve the promise there
                this.resolveRun = resolve;
            }).catch((err) => {
                this.notifyError(cmd, cmdArgs, tempFileName, err, outputter);
                resolve();
            });
        });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUG93ZXJTaGVsbE9uV2luZG93c0V4ZWN1dG9yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiUG93ZXJTaGVsbE9uV2luZG93c0V4ZWN1dG9yLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sMEJBQTBCLE1BQU0sOEJBQThCLENBQUM7QUFFdEUsT0FBTyxLQUFLLEVBQUUsTUFBTSxJQUFJLENBQUM7QUFDekIsT0FBTyxLQUFLLGFBQWEsTUFBTSxlQUFlLENBQUM7QUFDL0MsT0FBTyxnQkFBZ0IsTUFBTSxnQ0FBZ0MsQ0FBQztBQU85RDs7Ozs7O0dBTUc7QUFDSCxNQUFNLENBQUMsT0FBTyxPQUFPLDJCQUE0QixTQUFRLDBCQUEwQjtJQUNsRixZQUFZLFFBQTBCLEVBQUUsSUFBWTtRQUNuRCxLQUFLLENBQUMsUUFBUSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsWUFBWSxDQUFDLENBQUM7SUFDM0MsQ0FBQztJQUVELElBQUk7UUFDSCxPQUFPLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQztJQUMxQixDQUFDO0lBRUQsR0FBRyxDQUFDLGdCQUF3QixFQUFFLFNBQW9CLEVBQUUsR0FBVyxFQUFFLE9BQWUsRUFBRSxHQUFXO1FBQzVGLHVDQUF1QztRQUN2QyxJQUFJLElBQUksQ0FBQyxVQUFVLEtBQUssU0FBUztZQUNoQyxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7UUFDbkIsSUFBSSxDQUFDLFVBQVUsR0FBRyxTQUFTLENBQUM7UUFFNUIsT0FBTyxJQUFJLE9BQU8sQ0FBTyxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRTtZQUM1QyxNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBRTNDLEVBQUUsQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLFlBQVksRUFBRSxnQkFBZ0IsRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLGtCQUFrQixDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRTtnQkFDakcsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7Z0JBRS9DLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUU7b0JBQzFCLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDO29CQUN4QixHQUFHLEdBQUcsS0FBSyxDQUFDO29CQUNaLElBQUksQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQztpQkFDMUM7cUJBQU07b0JBQ04sSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztpQkFDeEI7Z0JBRUQsTUFBTSxLQUFLLEdBQUcsYUFBYSxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLEVBQUMsR0FBRyxFQUFFLE9BQU8sQ0FBQyxHQUFHLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxTQUFTLEVBQUMsQ0FBQyxDQUFDO2dCQUV4RixJQUFJLENBQUMsaUJBQWlCLENBQUMsS0FBSyxFQUFFLFNBQVMsRUFBRSxZQUFZLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFO29CQUNoRSxJQUFJLENBQUMsVUFBVSxHQUFHLFNBQVMsQ0FBQyxDQUFDLGdEQUFnRDtnQkFDOUUsQ0FBQyxDQUFDLENBQUM7Z0JBRUgsK0VBQStFO2dCQUMvRSx3RUFBd0U7Z0JBQ3hFLElBQUksQ0FBQyxVQUFVLEdBQUcsT0FBTyxDQUFDO1lBQzNCLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUFFO2dCQUNoQixJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsRUFBRSxPQUFPLEVBQUUsWUFBWSxFQUFFLEdBQUcsRUFBRSxTQUFTLENBQUMsQ0FBQztnQkFDN0QsT0FBTyxFQUFFLENBQUM7WUFDWCxDQUFDLENBQUMsQ0FBQztRQUNKLENBQUMsQ0FBQyxDQUFDO0lBQ0osQ0FBQztDQUNEIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IE5vbkludGVyYWN0aXZlQ29kZUV4ZWN1dG9yIGZyb20gXCIuL05vbkludGVyYWN0aXZlQ29kZUV4ZWN1dG9yXCI7XHJcbmltcG9ydCB7T3V0cHV0dGVyfSBmcm9tIFwiLi4vb3V0cHV0L091dHB1dHRlclwiO1xyXG5pbXBvcnQgKiBhcyBmcyBmcm9tIFwiZnNcIjtcclxuaW1wb3J0ICogYXMgY2hpbGRfcHJvY2VzcyBmcm9tIFwiY2hpbGRfcHJvY2Vzc1wiO1xyXG5pbXBvcnQgd2luZG93c1BhdGhUb1dzbCBmcm9tIFwiLi4vdHJhbnNmb3Jtcy93aW5kb3dzUGF0aFRvV3NsXCI7XHJcbmltcG9ydCB7RXhlY3V0b3JTZXR0aW5nc30gZnJvbSBcIi4uL3NldHRpbmdzL1NldHRpbmdzXCI7XHJcbmltcG9ydCB7TGFuZ3VhZ2VJZH0gZnJvbSBcIi4uL21haW5cIjtcclxuaW1wb3J0IHtOb3RpY2V9IGZyb20gXCJvYnNpZGlhblwiO1xyXG5pbXBvcnQgRXhlY3V0b3IgZnJvbSBcIi4vRXhlY3V0b3JcIjtcclxuXHJcblxyXG4vKipcclxuICogVGhpcyBjbGFzcyBpcyBpZGVudGljYWwgdG8gTm9uZUludGVyYWN0aXZlQ29kZUV4ZWN1dG9yLCBleGNlcHQgdGhhdCBpdCB1c2VzIHRoZSBQb3dlclNoZWxsIGVuY29kaW5nIHNldHRpbmcuXHJcbiAqIFRoaXMgaXMgbmVjZXNzYXJ5IGJlY2F1c2UgUG93ZXJTaGVsbCBzdGlsbCB1c2VzIHdpbmRvd3MtMTI1MiBhcyBkZWZhdWx0IGVuY29kaW5nIGZvciBsZWdhY3kgcmVhc29ucy5cclxuICogSW4gdGhpcyBpbXBsZW1lbnRhdGlvbiwgd2UgdXNlIGxhdGluLTEgYXMgZGVmYXVsdCBlbmNvZGluZywgd2hpY2ggaXMgYmFzaWNhbGx5IHRoZSBzYW1lIGFzIHdpbmRvd3MtMTI1Mi5cclxuICogU2VlIGh0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzYyNTU3ODkwL3JlYWRpbmctYS13aW5kb3dzLTEyNTItZmlsZS1pbi1ub2RlLWpzXHJcbiAqIGFuZCBodHRwczovL2xlYXJuLm1pY3Jvc29mdC5jb20vZW4tdXMvcG93ZXJzaGVsbC9zY3JpcHRpbmcvZGV2LWNyb3NzLXBsYXQvdnNjb2RlL3VuZGVyc3RhbmRpbmctZmlsZS1lbmNvZGluZz92aWV3PXBvd2Vyc2hlbGwtNy4zXHJcbiAqL1xyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBQb3dlclNoZWxsT25XaW5kb3dzRXhlY3V0b3IgZXh0ZW5kcyBOb25JbnRlcmFjdGl2ZUNvZGVFeGVjdXRvciB7XHJcblx0Y29uc3RydWN0b3Ioc2V0dGluZ3M6IEV4ZWN1dG9yU2V0dGluZ3MsIGZpbGU6IHN0cmluZykge1xyXG5cdFx0c3VwZXIoc2V0dGluZ3MsIHRydWUsIGZpbGUsIFwicG93ZXJzaGVsbFwiKTtcclxuXHR9XHJcblxyXG5cdHN0b3AoKTogUHJvbWlzZTx2b2lkPiB7XHJcblx0XHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XHJcblx0fVxyXG5cclxuXHRydW4oY29kZUJsb2NrQ29udGVudDogc3RyaW5nLCBvdXRwdXR0ZXI6IE91dHB1dHRlciwgY21kOiBzdHJpbmcsIGNtZEFyZ3M6IHN0cmluZywgZXh0OiBzdHJpbmcpIHtcclxuXHRcdC8vIFJlc29sdmUgYW55IGN1cnJlbnRseSBydW5uaW5nIGJsb2Nrc1xyXG5cdFx0aWYgKHRoaXMucmVzb2x2ZVJ1biAhPT0gdW5kZWZpbmVkKVxyXG5cdFx0XHR0aGlzLnJlc29sdmVSdW4oKTtcclxuXHRcdHRoaXMucmVzb2x2ZVJ1biA9IHVuZGVmaW5lZDtcclxuXHJcblx0XHRyZXR1cm4gbmV3IFByb21pc2U8dm9pZD4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG5cdFx0XHRjb25zdCB0ZW1wRmlsZU5hbWUgPSB0aGlzLmdldFRlbXBGaWxlKGV4dCk7XHJcblxyXG5cdFx0XHRmcy5wcm9taXNlcy53cml0ZUZpbGUodGVtcEZpbGVOYW1lLCBjb2RlQmxvY2tDb250ZW50LCB0aGlzLnNldHRpbmdzLnBvd2Vyc2hlbGxFbmNvZGluZykudGhlbigoKSA9PiB7XHJcblx0XHRcdFx0Y29uc3QgYXJncyA9IGNtZEFyZ3MgPyBjbWRBcmdzLnNwbGl0KFwiIFwiKSA6IFtdO1xyXG5cclxuXHRcdFx0XHRpZiAodGhpcy5zZXR0aW5ncy53c2xNb2RlKSB7XHJcblx0XHRcdFx0XHRhcmdzLnVuc2hpZnQoXCItZVwiLCBjbWQpO1xyXG5cdFx0XHRcdFx0Y21kID0gXCJ3c2xcIjtcclxuXHRcdFx0XHRcdGFyZ3MucHVzaCh3aW5kb3dzUGF0aFRvV3NsKHRlbXBGaWxlTmFtZSkpO1xyXG5cdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHRhcmdzLnB1c2godGVtcEZpbGVOYW1lKTtcclxuXHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdGNvbnN0IGNoaWxkID0gY2hpbGRfcHJvY2Vzcy5zcGF3bihjbWQsIGFyZ3MsIHtlbnY6IHByb2Nlc3MuZW52LCBzaGVsbDogdGhpcy51c2VzU2hlbGx9KTtcclxuXHJcblx0XHRcdFx0dGhpcy5oYW5kbGVDaGlsZE91dHB1dChjaGlsZCwgb3V0cHV0dGVyLCB0ZW1wRmlsZU5hbWUpLnRoZW4oKCkgPT4ge1xyXG5cdFx0XHRcdFx0dGhpcy50ZW1wRmlsZUlkID0gdW5kZWZpbmVkOyAvLyBSZXNldCB0aGUgZmlsZSBpZCB0byB1c2UgYSBuZXcgZmlsZSBuZXh0IHRpbWVcclxuXHRcdFx0XHR9KTtcclxuXHJcblx0XHRcdFx0Ly8gV2UgZG9uJ3QgcmVzb2x2ZSB0aGUgcHJvbWlzZSBoZXJlIC0gJ2hhbmRsZUNoaWxkT3V0cHV0JyByZWdpc3RlcnMgYSBsaXN0ZW5lclxyXG5cdFx0XHRcdC8vIEZvciB3aGVuIHRoZSBjaGlsZF9wcm9jZXNzIGNsb3NlcywgYW5kIHdpbGwgcmVzb2x2ZSB0aGUgcHJvbWlzZSB0aGVyZVxyXG5cdFx0XHRcdHRoaXMucmVzb2x2ZVJ1biA9IHJlc29sdmU7XHJcblx0XHRcdH0pLmNhdGNoKChlcnIpID0+IHtcclxuXHRcdFx0XHR0aGlzLm5vdGlmeUVycm9yKGNtZCwgY21kQXJncywgdGVtcEZpbGVOYW1lLCBlcnIsIG91dHB1dHRlcik7XHJcblx0XHRcdFx0cmVzb2x2ZSgpO1xyXG5cdFx0XHR9KTtcclxuXHRcdH0pO1xyXG5cdH1cclxufVxyXG4iXX0=