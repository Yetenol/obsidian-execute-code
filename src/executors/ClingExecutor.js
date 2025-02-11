import NonInteractiveCodeExecutor from './NonInteractiveCodeExecutor';
import * as child_process from "child_process";
export default class ClingExecutor extends NonInteractiveCodeExecutor {
    constructor(settings, file, language) {
        super(settings, false, file, language);
    }
    run(codeBlockContent, outputter, cmd, args, ext) {
        // Run code with a main block
        if (this.settings[`${this.language}UseMain`]) {
            // Generate a new temp file id and don't set to undefined to super.run() uses the same file id
            this.getTempFile(ext);
            // Cling expects the main function to have the same name as the file / the extension is only c when gcc is used
            let code;
            if (ext != "c") {
                code = codeBlockContent.replace(/main\(\)/g, `temp_${this.tempFileId}()`);
            }
            else {
                code = codeBlockContent;
            }
            return super.run(code, outputter, this.settings.clingPath, args, ext);
        }
        // Run code without a main block (cling only)
        return new Promise((resolve, reject) => {
            const childArgs = [...args.split(" "), ...codeBlockContent.split("\n")];
            const child = child_process.spawn(this.settings.clingPath, childArgs, { env: process.env, shell: this.usesShell });
            // Set resolve callback to resolve the promise in the child_process.on('close', ...) listener from super.handleChildOutput
            this.resolveRun = resolve;
            this.handleChildOutput(child, outputter, this.tempFileId);
        });
    }
    /**
     * Run parent NonInteractiveCodeExecutor handleChildOutput logic, but replace temporary main function name
     * In all outputs from stdout and stderr callbacks, from temp_<id>() to main() to produce understandable output
     */
    async handleChildOutput(child, outputter, fileName) {
        super.handleChildOutput(child, outputter, fileName);
        // Remove existing stdout and stderr callbacks
        child.stdout.removeListener("data", this.stdoutCb);
        child.stderr.removeListener("data", this.stderrCb);
        const fileId = this.tempFileId;
        // Replace temp_<id>() with main()
        const replaceTmpId = (data) => {
            return data.replace(new RegExp(`temp_${fileId}\\(\\)`, "g"), "main()");
        };
        // Set new stdout and stderr callbacks, the same as in the parent,
        // But replacing temp_<id>() with main()
        child.stdout.on("data", (data) => {
            this.stdoutCb(replaceTmpId(data.toString()));
        });
        child.stderr.on("data", (data) => {
            this.stderrCb(replaceTmpId(data.toString()));
        });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ2xpbmdFeGVjdXRvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIkNsaW5nRXhlY3V0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTywwQkFBMEIsTUFBTSw4QkFBOEIsQ0FBQztBQUN0RSxPQUFPLEtBQUssYUFBYSxNQUFNLGVBQWUsQ0FBQztBQUsvQyxNQUFNLENBQUMsT0FBTyxPQUFnQixhQUFjLFNBQVEsMEJBQTBCO0lBSTdFLFlBQVksUUFBMEIsRUFBRSxJQUFZLEVBQUUsUUFBcUI7UUFDMUUsS0FBSyxDQUFDLFFBQVEsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLFFBQVEsQ0FBQyxDQUFDO0lBQ3hDLENBQUM7SUFFUSxHQUFHLENBQUMsZ0JBQXdCLEVBQUUsU0FBb0IsRUFBRSxHQUFXLEVBQUUsSUFBWSxFQUFFLEdBQVc7UUFDbEcsNkJBQTZCO1FBQzdCLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLElBQUksQ0FBQyxRQUFRLFNBQVMsQ0FBQyxFQUFFO1lBQzdDLDhGQUE4RjtZQUM5RixJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ3RCLCtHQUErRztZQUMvRyxJQUFJLElBQVksQ0FBQztZQUNqQixJQUFJLEdBQUcsSUFBSSxHQUFHLEVBQUU7Z0JBQ2YsSUFBSSxHQUFHLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxXQUFXLEVBQUUsUUFBUSxJQUFJLENBQUMsVUFBVSxJQUFJLENBQUMsQ0FBQzthQUMxRTtpQkFBTTtnQkFDTixJQUFJLEdBQUcsZ0JBQWdCLENBQUM7YUFDeEI7WUFDRCxPQUFPLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLFNBQVMsRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsRUFBRSxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUM7U0FDdEU7UUFFRCw2Q0FBNkM7UUFDN0MsT0FBTyxJQUFJLE9BQU8sQ0FBTyxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRTtZQUM1QyxNQUFNLFNBQVMsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLGdCQUFnQixDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQ3hFLE1BQU0sS0FBSyxHQUFHLGFBQWEsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLEVBQUUsU0FBUyxFQUFFLEVBQUMsR0FBRyxFQUFFLE9BQU8sQ0FBQyxHQUFHLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxTQUFTLEVBQUMsQ0FBQyxDQUFDO1lBQ2pILDBIQUEwSDtZQUMxSCxJQUFJLENBQUMsVUFBVSxHQUFHLE9BQU8sQ0FBQztZQUMxQixJQUFJLENBQUMsaUJBQWlCLENBQUMsS0FBSyxFQUFFLFNBQVMsRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDM0QsQ0FBQyxDQUFDLENBQUM7SUFDSixDQUFDO0lBRUQ7OztPQUdHO0lBQ00sS0FBSyxDQUFDLGlCQUFpQixDQUFDLEtBQXFDLEVBQUUsU0FBb0IsRUFBRSxRQUFnQjtRQUM3RyxLQUFLLENBQUMsaUJBQWlCLENBQUMsS0FBSyxFQUFFLFNBQVMsRUFBRSxRQUFRLENBQUMsQ0FBQztRQUNwRCw4Q0FBOEM7UUFDOUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxjQUFjLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUNuRCxLQUFLLENBQUMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ25ELE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUM7UUFDL0Isa0NBQWtDO1FBQ2xDLE1BQU0sWUFBWSxHQUFHLENBQUMsSUFBWSxFQUFFLEVBQUU7WUFDckMsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksTUFBTSxDQUFDLFFBQVEsTUFBTSxRQUFRLEVBQUUsR0FBRyxDQUFDLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFDeEUsQ0FBQyxDQUFBO1FBQ0Qsa0VBQWtFO1FBQ2xFLHdDQUF3QztRQUN4QyxLQUFLLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxJQUFJLEVBQUUsRUFBRTtZQUNoQyxJQUFJLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQzlDLENBQUMsQ0FBQyxDQUFDO1FBQ0gsS0FBSyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsTUFBTSxFQUFFLENBQUMsSUFBSSxFQUFFLEVBQUU7WUFDaEMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUM5QyxDQUFDLENBQUMsQ0FBQztJQUNKLENBQUM7Q0FDRCIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBOb25JbnRlcmFjdGl2ZUNvZGVFeGVjdXRvciBmcm9tICcuL05vbkludGVyYWN0aXZlQ29kZUV4ZWN1dG9yJztcclxuaW1wb3J0ICogYXMgY2hpbGRfcHJvY2VzcyBmcm9tIFwiY2hpbGRfcHJvY2Vzc1wiO1xyXG5pbXBvcnQgdHlwZSB7Q2hpbGRQcm9jZXNzV2l0aG91dE51bGxTdHJlYW1zfSBmcm9tIFwiY2hpbGRfcHJvY2Vzc1wiO1xyXG5pbXBvcnQgdHlwZSB7T3V0cHV0dGVyfSBmcm9tIFwic3JjL291dHB1dC9PdXRwdXR0ZXJcIjtcclxuaW1wb3J0IHR5cGUge0V4ZWN1dG9yU2V0dGluZ3N9IGZyb20gXCJzcmMvc2V0dGluZ3MvU2V0dGluZ3NcIjtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGFic3RyYWN0IGNsYXNzIENsaW5nRXhlY3V0b3IgZXh0ZW5kcyBOb25JbnRlcmFjdGl2ZUNvZGVFeGVjdXRvciB7XHJcblx0XHJcblx0bGFuZ3VhZ2U6IFwiY3BwXCIgfCBcImNcIlxyXG5cclxuXHRjb25zdHJ1Y3RvcihzZXR0aW5nczogRXhlY3V0b3JTZXR0aW5ncywgZmlsZTogc3RyaW5nLCBsYW5ndWFnZTogXCJjXCIgfCBcImNwcFwiKSB7XHJcblx0XHRzdXBlcihzZXR0aW5ncywgZmFsc2UsIGZpbGUsIGxhbmd1YWdlKTtcclxuXHR9XHJcblxyXG5cdG92ZXJyaWRlIHJ1bihjb2RlQmxvY2tDb250ZW50OiBzdHJpbmcsIG91dHB1dHRlcjogT3V0cHV0dGVyLCBjbWQ6IHN0cmluZywgYXJnczogc3RyaW5nLCBleHQ6IHN0cmluZykge1xyXG5cdFx0Ly8gUnVuIGNvZGUgd2l0aCBhIG1haW4gYmxvY2tcclxuXHRcdGlmICh0aGlzLnNldHRpbmdzW2Ake3RoaXMubGFuZ3VhZ2V9VXNlTWFpbmBdKSB7XHJcblx0XHRcdC8vIEdlbmVyYXRlIGEgbmV3IHRlbXAgZmlsZSBpZCBhbmQgZG9uJ3Qgc2V0IHRvIHVuZGVmaW5lZCB0byBzdXBlci5ydW4oKSB1c2VzIHRoZSBzYW1lIGZpbGUgaWRcclxuXHRcdFx0dGhpcy5nZXRUZW1wRmlsZShleHQpO1xyXG5cdFx0XHQvLyBDbGluZyBleHBlY3RzIHRoZSBtYWluIGZ1bmN0aW9uIHRvIGhhdmUgdGhlIHNhbWUgbmFtZSBhcyB0aGUgZmlsZSAvIHRoZSBleHRlbnNpb24gaXMgb25seSBjIHdoZW4gZ2NjIGlzIHVzZWRcclxuXHRcdFx0bGV0IGNvZGU6IHN0cmluZztcclxuXHRcdFx0aWYgKGV4dCAhPSBcImNcIikge1xyXG5cdFx0XHRcdGNvZGUgPSBjb2RlQmxvY2tDb250ZW50LnJlcGxhY2UoL21haW5cXChcXCkvZywgYHRlbXBfJHt0aGlzLnRlbXBGaWxlSWR9KClgKTtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRjb2RlID0gY29kZUJsb2NrQ29udGVudDtcclxuXHRcdFx0fVxyXG5cdFx0XHRyZXR1cm4gc3VwZXIucnVuKGNvZGUsIG91dHB1dHRlciwgdGhpcy5zZXR0aW5ncy5jbGluZ1BhdGgsIGFyZ3MsIGV4dCk7XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gUnVuIGNvZGUgd2l0aG91dCBhIG1haW4gYmxvY2sgKGNsaW5nIG9ubHkpXHJcblx0XHRyZXR1cm4gbmV3IFByb21pc2U8dm9pZD4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG5cdFx0XHRjb25zdCBjaGlsZEFyZ3MgPSBbLi4uYXJncy5zcGxpdChcIiBcIiksIC4uLmNvZGVCbG9ja0NvbnRlbnQuc3BsaXQoXCJcXG5cIildO1xyXG5cdFx0XHRjb25zdCBjaGlsZCA9IGNoaWxkX3Byb2Nlc3Muc3Bhd24odGhpcy5zZXR0aW5ncy5jbGluZ1BhdGgsIGNoaWxkQXJncywge2VudjogcHJvY2Vzcy5lbnYsIHNoZWxsOiB0aGlzLnVzZXNTaGVsbH0pO1xyXG5cdFx0XHQvLyBTZXQgcmVzb2x2ZSBjYWxsYmFjayB0byByZXNvbHZlIHRoZSBwcm9taXNlIGluIHRoZSBjaGlsZF9wcm9jZXNzLm9uKCdjbG9zZScsIC4uLikgbGlzdGVuZXIgZnJvbSBzdXBlci5oYW5kbGVDaGlsZE91dHB1dFxyXG5cdFx0XHR0aGlzLnJlc29sdmVSdW4gPSByZXNvbHZlO1xyXG5cdFx0XHR0aGlzLmhhbmRsZUNoaWxkT3V0cHV0KGNoaWxkLCBvdXRwdXR0ZXIsIHRoaXMudGVtcEZpbGVJZCk7XHJcblx0XHR9KTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFJ1biBwYXJlbnQgTm9uSW50ZXJhY3RpdmVDb2RlRXhlY3V0b3IgaGFuZGxlQ2hpbGRPdXRwdXQgbG9naWMsIGJ1dCByZXBsYWNlIHRlbXBvcmFyeSBtYWluIGZ1bmN0aW9uIG5hbWVcclxuXHQgKiBJbiBhbGwgb3V0cHV0cyBmcm9tIHN0ZG91dCBhbmQgc3RkZXJyIGNhbGxiYWNrcywgZnJvbSB0ZW1wXzxpZD4oKSB0byBtYWluKCkgdG8gcHJvZHVjZSB1bmRlcnN0YW5kYWJsZSBvdXRwdXRcclxuXHQgKi9cclxuXHRvdmVycmlkZSBhc3luYyBoYW5kbGVDaGlsZE91dHB1dChjaGlsZDogQ2hpbGRQcm9jZXNzV2l0aG91dE51bGxTdHJlYW1zLCBvdXRwdXR0ZXI6IE91dHB1dHRlciwgZmlsZU5hbWU6IHN0cmluZykge1x0XHRcclxuXHRcdHN1cGVyLmhhbmRsZUNoaWxkT3V0cHV0KGNoaWxkLCBvdXRwdXR0ZXIsIGZpbGVOYW1lKTtcclxuXHRcdC8vIFJlbW92ZSBleGlzdGluZyBzdGRvdXQgYW5kIHN0ZGVyciBjYWxsYmFja3NcclxuXHRcdGNoaWxkLnN0ZG91dC5yZW1vdmVMaXN0ZW5lcihcImRhdGFcIiwgdGhpcy5zdGRvdXRDYik7XHJcblx0XHRjaGlsZC5zdGRlcnIucmVtb3ZlTGlzdGVuZXIoXCJkYXRhXCIsIHRoaXMuc3RkZXJyQ2IpO1xyXG5cdFx0Y29uc3QgZmlsZUlkID0gdGhpcy50ZW1wRmlsZUlkO1xyXG5cdFx0Ly8gUmVwbGFjZSB0ZW1wXzxpZD4oKSB3aXRoIG1haW4oKVxyXG5cdFx0Y29uc3QgcmVwbGFjZVRtcElkID0gKGRhdGE6IHN0cmluZykgPT4ge1xyXG5cdFx0XHRyZXR1cm4gZGF0YS5yZXBsYWNlKG5ldyBSZWdFeHAoYHRlbXBfJHtmaWxlSWR9XFxcXChcXFxcKWAsIFwiZ1wiKSwgXCJtYWluKClcIik7XHJcblx0XHR9XHJcblx0XHQvLyBTZXQgbmV3IHN0ZG91dCBhbmQgc3RkZXJyIGNhbGxiYWNrcywgdGhlIHNhbWUgYXMgaW4gdGhlIHBhcmVudCxcclxuXHRcdC8vIEJ1dCByZXBsYWNpbmcgdGVtcF88aWQ+KCkgd2l0aCBtYWluKClcclxuXHRcdGNoaWxkLnN0ZG91dC5vbihcImRhdGFcIiwgKGRhdGEpID0+IHtcclxuXHRcdFx0dGhpcy5zdGRvdXRDYihyZXBsYWNlVG1wSWQoZGF0YS50b1N0cmluZygpKSk7XHJcblx0XHR9KTtcclxuXHRcdGNoaWxkLnN0ZGVyci5vbihcImRhdGFcIiwgKGRhdGEpID0+IHtcclxuXHRcdFx0dGhpcy5zdGRlcnJDYihyZXBsYWNlVG1wSWQoZGF0YS50b1N0cmluZygpKSk7XHJcblx0XHR9KTtcclxuXHR9XHJcbn1cclxuIl19