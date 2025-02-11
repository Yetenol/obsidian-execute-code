import { Notice } from "obsidian";
import * as os from "os";
import * as path from "path";
import { EventEmitter } from "stream";
export default class Executor extends EventEmitter {
    constructor(file, language) {
        super();
        this.tempFileId = undefined;
        this.file = file;
        this.language = language;
    }
    /**
     * Creates new Notice that is displayed in the top right corner for a few seconds and contains an error message.
     * Additionally, the error is logged to the console and showed in the output panel ({@link Outputter}).
     *
     * @param cmd The command that was executed.
     * @param cmdArgs The arguments that were passed to the command.
     * @param tempFileName The name of the temporary file that contained the code.
     * @param err The error that was thrown.
     * @param outputter The outputter that should be used to display the error.
     * @param label A high-level, short label to show to the user
     * @protected
     */
    notifyError(cmd, cmdArgs, tempFileName, err, outputter, label = "Error while executing code") {
        const errorMSG = `Error while executing ${cmd} ${cmdArgs} ${tempFileName}: ${err}`;
        console.error(errorMSG);
        if (outputter)
            outputter.writeErr(errorMSG);
        new Notice(label);
    }
    /**
     * Creates a new unique file name for the given file extension. The file path is set to the temp path of the os.
     * The file name is the current timestamp: '/{temp_dir}/temp_{timestamp}.{file_extension}'
     * this.tempFileId will be updated, accessible to other methods
     * Once finished using this value, remember to set it to undefined to generate a new file
     *
     * @param ext The file extension. Should correspond to the language of the code.
     * @returns The temporary file path
     */
    getTempFile(ext) {
        if (this.tempFileId === undefined)
            this.tempFileId = Date.now().toString();
        return path.join(os.tmpdir(), `temp_${this.tempFileId}.${ext}`);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRXhlY3V0b3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJFeGVjdXRvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUMsTUFBTSxFQUFDLE1BQU0sVUFBVSxDQUFDO0FBRWhDLE9BQU8sS0FBSyxFQUFFLE1BQU0sSUFBSSxDQUFDO0FBQ3pCLE9BQU8sS0FBSyxJQUFJLE1BQU0sTUFBTSxDQUFDO0FBRTdCLE9BQU8sRUFBQyxZQUFZLEVBQUMsTUFBTSxRQUFRLENBQUM7QUFFcEMsTUFBTSxDQUFDLE9BQU8sT0FBZ0IsUUFBUyxTQUFRLFlBQVk7SUFLMUQsWUFBWSxJQUFZLEVBQUUsUUFBb0I7UUFDN0MsS0FBSyxFQUFFLENBQUM7UUFIVCxlQUFVLEdBQXVCLFNBQVMsQ0FBQztRQUkxQyxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztRQUNqQixJQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQztJQUMxQixDQUFDO0lBa0JEOzs7Ozs7Ozs7OztPQVdHO0lBQ08sV0FBVyxDQUFDLEdBQVcsRUFBRSxPQUFlLEVBQUUsWUFBb0IsRUFBRSxHQUFRLEVBQ2pGLFNBQWdDLEVBQUUsS0FBSyxHQUFHLDRCQUE0QjtRQUN0RSxNQUFNLFFBQVEsR0FBRyx5QkFBeUIsR0FBRyxJQUFJLE9BQU8sSUFBSSxZQUFZLEtBQUssR0FBRyxFQUFFLENBQUE7UUFDbEYsT0FBTyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUN4QixJQUFHLFNBQVM7WUFBRSxTQUFTLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQzNDLElBQUksTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ25CLENBQUM7SUFFRDs7Ozs7Ozs7T0FRRztJQUNPLFdBQVcsQ0FBQyxHQUFXO1FBQ2hDLElBQUksSUFBSSxDQUFDLFVBQVUsS0FBSyxTQUFTO1lBQ2hDLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQ3pDLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsTUFBTSxFQUFFLEVBQUUsUUFBUSxJQUFJLENBQUMsVUFBVSxJQUFJLEdBQUcsRUFBRSxDQUFDLENBQUM7SUFDakUsQ0FBQztDQUNEIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtOb3RpY2V9IGZyb20gXCJvYnNpZGlhblwiO1xyXG5pbXBvcnQge091dHB1dHRlcn0gZnJvbSBcInNyYy9vdXRwdXQvT3V0cHV0dGVyXCI7XHJcbmltcG9ydCAqIGFzIG9zIGZyb20gXCJvc1wiO1xyXG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gXCJwYXRoXCI7XHJcbmltcG9ydCB7TGFuZ3VhZ2VJZH0gZnJvbSBcInNyYy9tYWluXCI7XHJcbmltcG9ydCB7RXZlbnRFbWl0dGVyfSBmcm9tIFwic3RyZWFtXCI7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBhYnN0cmFjdCBjbGFzcyBFeGVjdXRvciBleHRlbmRzIEV2ZW50RW1pdHRlciB7XHJcblx0bGFuZ3VhZ2U6IExhbmd1YWdlSWQ7XHJcblx0ZmlsZTogc3RyaW5nO1xyXG5cdHRlbXBGaWxlSWQ6IHN0cmluZyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcclxuXHJcblx0Y29uc3RydWN0b3IoZmlsZTogc3RyaW5nLCBsYW5ndWFnZTogTGFuZ3VhZ2VJZCkge1xyXG5cdFx0c3VwZXIoKTtcclxuXHRcdHRoaXMuZmlsZSA9IGZpbGU7XHJcblx0XHR0aGlzLmxhbmd1YWdlID0gbGFuZ3VhZ2U7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBSdW4gdGhlIGdpdmVuIGBjb2RlYCBhbmQgYWRkIGFsbCBvdXRwdXQgdG8gdGhlIGBPdXRwdXR0ZXJgLiBSZXNvbHZlcyB0aGUgcHJvbWlzZSBvbmNlIHRoZSBjb2RlIGlzIGRvbmUgcnVubmluZy5cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSBjb2RlIGNvZGUgdG8gcnVuXHJcblx0ICogQHBhcmFtIG91dHB1dHRlciBvdXRwdXR0ZXIgdG8gdXNlIGZvciBzaG93aW5nIG91dHB1dCB0byB0aGUgdXNlclxyXG5cdCAqIEBwYXJhbSBjbWQgY29tbWFuZCB0byBydW4gKG5vdCB1c2VkIGJ5IGFsbCBleGVjdXRvcnMpXHJcblx0ICogQHBhcmFtIGNtZEFyZ3MgYXJndW1lbnRzIGZvciBjb21tYW5kIHRvIHJ1biAobm90IHVzZWQgYnkgYWxsIGV4ZWN1dG9ycylcclxuXHQgKiBAcGFyYW0gZXh0IGZpbGUgZXh0ZW5zaW9uIGZvciB0aGUgcHJvZ3JhbW1pbmcgbGFuZ3VhZ2UgKG5vdCB1c2VkIGJ5IGFsbCBleGVjdXRvcnMpXHJcblx0ICovXHJcblx0YWJzdHJhY3QgcnVuKGNvZGU6IHN0cmluZywgb3V0cHV0dGVyOiBPdXRwdXR0ZXIsIGNtZDogc3RyaW5nLCBjbWRBcmdzOiBzdHJpbmcsIGV4dDogc3RyaW5nKTogUHJvbWlzZTx2b2lkPlxyXG5cclxuXHQvKipcclxuXHQgKiBFeGl0IHRoZSBydW50aW1lIGZvciB0aGUgY29kZS5cclxuXHQgKi9cclxuXHRhYnN0cmFjdCBzdG9wKCk6IFByb21pc2U8dm9pZD5cclxuXHJcblx0LyoqXHJcblx0ICogQ3JlYXRlcyBuZXcgTm90aWNlIHRoYXQgaXMgZGlzcGxheWVkIGluIHRoZSB0b3AgcmlnaHQgY29ybmVyIGZvciBhIGZldyBzZWNvbmRzIGFuZCBjb250YWlucyBhbiBlcnJvciBtZXNzYWdlLlxyXG5cdCAqIEFkZGl0aW9uYWxseSwgdGhlIGVycm9yIGlzIGxvZ2dlZCB0byB0aGUgY29uc29sZSBhbmQgc2hvd2VkIGluIHRoZSBvdXRwdXQgcGFuZWwgKHtAbGluayBPdXRwdXR0ZXJ9KS5cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSBjbWQgVGhlIGNvbW1hbmQgdGhhdCB3YXMgZXhlY3V0ZWQuXHJcblx0ICogQHBhcmFtIGNtZEFyZ3MgVGhlIGFyZ3VtZW50cyB0aGF0IHdlcmUgcGFzc2VkIHRvIHRoZSBjb21tYW5kLlxyXG5cdCAqIEBwYXJhbSB0ZW1wRmlsZU5hbWUgVGhlIG5hbWUgb2YgdGhlIHRlbXBvcmFyeSBmaWxlIHRoYXQgY29udGFpbmVkIHRoZSBjb2RlLlxyXG5cdCAqIEBwYXJhbSBlcnIgVGhlIGVycm9yIHRoYXQgd2FzIHRocm93bi5cclxuXHQgKiBAcGFyYW0gb3V0cHV0dGVyIFRoZSBvdXRwdXR0ZXIgdGhhdCBzaG91bGQgYmUgdXNlZCB0byBkaXNwbGF5IHRoZSBlcnJvci5cclxuXHQgKiBAcGFyYW0gbGFiZWwgQSBoaWdoLWxldmVsLCBzaG9ydCBsYWJlbCB0byBzaG93IHRvIHRoZSB1c2VyIFxyXG5cdCAqIEBwcm90ZWN0ZWRcclxuXHQgKi9cclxuXHRwcm90ZWN0ZWQgbm90aWZ5RXJyb3IoY21kOiBzdHJpbmcsIGNtZEFyZ3M6IHN0cmluZywgdGVtcEZpbGVOYW1lOiBzdHJpbmcsIGVycjogYW55LFxyXG5cdFx0b3V0cHV0dGVyOiBPdXRwdXR0ZXIgfCB1bmRlZmluZWQsIGxhYmVsID0gXCJFcnJvciB3aGlsZSBleGVjdXRpbmcgY29kZVwiKSB7XHJcblx0XHRjb25zdCBlcnJvck1TRyA9IGBFcnJvciB3aGlsZSBleGVjdXRpbmcgJHtjbWR9ICR7Y21kQXJnc30gJHt0ZW1wRmlsZU5hbWV9OiAke2Vycn1gXHJcblx0XHRjb25zb2xlLmVycm9yKGVycm9yTVNHKTtcclxuXHRcdGlmKG91dHB1dHRlcikgb3V0cHV0dGVyLndyaXRlRXJyKGVycm9yTVNHKTtcclxuXHRcdG5ldyBOb3RpY2UobGFiZWwpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQ3JlYXRlcyBhIG5ldyB1bmlxdWUgZmlsZSBuYW1lIGZvciB0aGUgZ2l2ZW4gZmlsZSBleHRlbnNpb24uIFRoZSBmaWxlIHBhdGggaXMgc2V0IHRvIHRoZSB0ZW1wIHBhdGggb2YgdGhlIG9zLlxyXG5cdCAqIFRoZSBmaWxlIG5hbWUgaXMgdGhlIGN1cnJlbnQgdGltZXN0YW1wOiAnL3t0ZW1wX2Rpcn0vdGVtcF97dGltZXN0YW1wfS57ZmlsZV9leHRlbnNpb259J1xyXG5cdCAqIHRoaXMudGVtcEZpbGVJZCB3aWxsIGJlIHVwZGF0ZWQsIGFjY2Vzc2libGUgdG8gb3RoZXIgbWV0aG9kc1xyXG5cdCAqIE9uY2UgZmluaXNoZWQgdXNpbmcgdGhpcyB2YWx1ZSwgcmVtZW1iZXIgdG8gc2V0IGl0IHRvIHVuZGVmaW5lZCB0byBnZW5lcmF0ZSBhIG5ldyBmaWxlXHJcblx0ICpcclxuXHQgKiBAcGFyYW0gZXh0IFRoZSBmaWxlIGV4dGVuc2lvbi4gU2hvdWxkIGNvcnJlc3BvbmQgdG8gdGhlIGxhbmd1YWdlIG9mIHRoZSBjb2RlLlxyXG5cdCAqIEByZXR1cm5zIFRoZSB0ZW1wb3JhcnkgZmlsZSBwYXRoXHJcblx0ICovXHJcblx0cHJvdGVjdGVkIGdldFRlbXBGaWxlKGV4dDogc3RyaW5nKSB7XHJcblx0XHRpZiAodGhpcy50ZW1wRmlsZUlkID09PSB1bmRlZmluZWQpXHJcblx0XHRcdHRoaXMudGVtcEZpbGVJZCA9IERhdGUubm93KCkudG9TdHJpbmcoKTtcclxuXHRcdHJldHVybiBwYXRoLmpvaW4ob3MudG1wZGlyKCksIGB0ZW1wXyR7dGhpcy50ZW1wRmlsZUlkfS4ke2V4dH1gKTtcclxuXHR9XHJcbn1cclxuIl19