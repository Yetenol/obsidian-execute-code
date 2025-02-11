import { EventEmitter } from "events";
import NodeJSExecutor from "./executors/NodeJSExecutor";
import NonInteractiveCodeExecutor from "./executors/NonInteractiveCodeExecutor";
import PrologExecutor from "./executors/PrologExecutor";
import PythonExecutor from "./executors/python/PythonExecutor";
import CppExecutor from './executors/CppExecutor';
import RExecutor from "./executors/RExecutor.js";
import CExecutor from "./executors/CExecutor";
import FSharpExecutor from "./executors/FSharpExecutor";
import LatexExecutor from "./executors/LatexExecutor";
const interactiveExecutors = {
    "js": NodeJSExecutor,
    "python": PythonExecutor,
    "r": RExecutor
};
const nonInteractiveExecutors = {
    "prolog": PrologExecutor,
    "cpp": CppExecutor,
    "c": CExecutor,
    "fsharp": FSharpExecutor,
    "latex": LatexExecutor,
};
export default class ExecutorContainer extends EventEmitter {
    constructor(plugin) {
        super();
        this.executors = {};
        this.plugin = plugin;
        window.addEventListener("beforeunload", async () => {
            for (const executor of this) {
                executor.stop();
            }
        });
    }
    /**
     * Iterate through all executors
     */
    *[Symbol.iterator]() {
        for (const language in this.executors) {
            for (const file in this.executors[language]) {
                yield this.executors[language][file];
            }
        }
    }
    /**
     * Gets an executor for the given file and language. If the language in
     * question *may* be interactive, then the executor will be cached and re-returned
     * the same for subsequent calls with the same arguments.
     * If there isn't a cached executor, it will be created.
     *
     * @param file file to get an executor for
     * @param language language to get an executor for.
     * @param needsShell whether or not the language requires a shell
     */
    getExecutorFor(file, language, needsShell) {
        if (!this.executors[language])
            this.executors[language] = {};
        if (!this.executors[language][file])
            this.setExecutorInExecutorsObject(file, language, needsShell);
        return this.executors[language][file];
    }
    /**
     * Create an executor and put it into the `executors` dictionary.
     * @param file the file to associate the new executor with
     * @param language the language to associate the new executor with
     * @param needsShell whether or not the language requires a shell
     */
    setExecutorInExecutorsObject(file, language, needsShell) {
        const exe = this.createExecutorFor(file, language, needsShell);
        if (!(exe instanceof NonInteractiveCodeExecutor))
            this.emit("add", exe);
        exe.on("close", () => {
            delete this.executors[language][file];
        });
        this.executors[language][file] = exe;
    }
    /**
     * Creates an executor
     *
     * @param file the file to associate the new executor with
     * @param language the language to make an executor for
     * @param needsShell whether or not the language requires a shell
     * @returns a new executor associated with the given language and file
     */
    createExecutorFor(file, language, needsShell) {
        // Interactive language executor
        if (this.plugin.settings[`${language}Interactive`]) {
            if (!(language in interactiveExecutors))
                throw new Error(`Attempted to use interactive executor for '${language}' but no such executor exists`);
            return new interactiveExecutors[language](this.plugin.settings, file);
        }
        // Custom non-interactive language executor
        else if (language in nonInteractiveExecutors)
            return new nonInteractiveExecutors[language](this.plugin.settings, file);
        // Generic non-interactive language executor
        return new NonInteractiveCodeExecutor(this.plugin.settings, needsShell, file, language);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRXhlY3V0b3JDb250YWluZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJFeGVjdXRvckNvbnRhaW5lci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUMsWUFBWSxFQUFDLE1BQU0sUUFBUSxDQUFDO0FBRXBDLE9BQU8sY0FBYyxNQUFNLDRCQUE0QixDQUFDO0FBQ3hELE9BQU8sMEJBQTBCLE1BQU0sd0NBQXdDLENBQUM7QUFDaEYsT0FBTyxjQUFjLE1BQU0sNEJBQTRCLENBQUM7QUFDeEQsT0FBTyxjQUFjLE1BQU0sbUNBQW1DLENBQUM7QUFDL0QsT0FBTyxXQUFXLE1BQU0seUJBQXlCLENBQUM7QUFFbEQsT0FBTyxTQUFTLE1BQU0sMEJBQTBCLENBQUM7QUFDakQsT0FBTyxTQUFTLE1BQU0sdUJBQXVCLENBQUM7QUFDOUMsT0FBTyxjQUFjLE1BQU0sNEJBQTRCLENBQUM7QUFDeEQsT0FBTyxhQUFhLE1BQU0sMkJBQTJCLENBQUM7QUFFdEQsTUFBTSxvQkFBb0IsR0FBcUM7SUFDOUQsSUFBSSxFQUFFLGNBQWM7SUFDcEIsUUFBUSxFQUFFLGNBQWM7SUFDeEIsR0FBRyxFQUFFLFNBQVM7Q0FDZCxDQUFDO0FBRUYsTUFBTSx1QkFBdUIsR0FBcUM7SUFDakUsUUFBUSxFQUFFLGNBQWM7SUFDeEIsS0FBSyxFQUFFLFdBQVc7SUFDbEIsR0FBRyxFQUFFLFNBQVM7SUFDZCxRQUFRLEVBQUUsY0FBYztJQUN4QixPQUFPLEVBQUcsYUFBYTtDQUN2QixDQUFDO0FBRUYsTUFBTSxDQUFDLE9BQU8sT0FBTyxpQkFBa0IsU0FBUSxZQUFZO0lBSTFELFlBQVksTUFBeUI7UUFDcEMsS0FBSyxFQUFFLENBQUM7UUFKVCxjQUFTLEdBQTBELEVBQUUsQ0FBQTtRQUtwRSxJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztRQUVyQixNQUFNLENBQUMsZ0JBQWdCLENBQUMsY0FBYyxFQUFFLEtBQUssSUFBSSxFQUFFO1lBQ2xELEtBQUksTUFBTSxRQUFRLElBQUksSUFBSSxFQUFFO2dCQUMzQixRQUFRLENBQUMsSUFBSSxFQUFFLENBQUM7YUFDaEI7UUFDRixDQUFDLENBQUMsQ0FBQztJQUNKLENBQUM7SUFFRDs7T0FFRztJQUNILENBQUUsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDO1FBQ2xCLEtBQUssTUFBTSxRQUFRLElBQUksSUFBSSxDQUFDLFNBQVMsRUFBRTtZQUN0QyxLQUFLLE1BQU0sSUFBSSxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBc0IsQ0FBQyxFQUFFO2dCQUMxRCxNQUFNLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBc0IsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO2FBQ25EO1NBQ0Q7SUFDRixDQUFDO0lBRUQ7Ozs7Ozs7OztPQVNHO0lBQ0gsY0FBYyxDQUFDLElBQVksRUFBRSxRQUFvQixFQUFFLFVBQW1CO1FBQ3JFLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQztZQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLEdBQUcsRUFBRSxDQUFBO1FBQzVELElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxDQUFDLElBQUksQ0FBQztZQUFFLElBQUksQ0FBQyw0QkFBNEIsQ0FBQyxJQUFJLEVBQUUsUUFBUSxFQUFFLFVBQVUsQ0FBQyxDQUFDO1FBRW5HLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUN2QyxDQUFDO0lBRUQ7Ozs7O09BS0c7SUFDSyw0QkFBNEIsQ0FBQyxJQUFZLEVBQUUsUUFBb0IsRUFBRSxVQUFtQjtRQUMzRixNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRSxVQUFVLENBQUMsQ0FBQztRQUMvRCxJQUFJLENBQUMsQ0FBQyxHQUFHLFlBQVksMEJBQTBCLENBQUM7WUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUMsQ0FBQztRQUN4RSxHQUFHLENBQUMsRUFBRSxDQUFDLE9BQU8sRUFBRSxHQUFHLEVBQUU7WUFDcEIsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3ZDLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxHQUFHLENBQUM7SUFDdEMsQ0FBQztJQUVEOzs7Ozs7O09BT0c7SUFDSyxpQkFBaUIsQ0FBQyxJQUFZLEVBQUUsUUFBb0IsRUFBRSxVQUFtQjtRQUNoRixnQ0FBZ0M7UUFDaEMsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxHQUFHLFFBQVEsYUFBYSxDQUFDLEVBQUU7WUFDbkQsSUFBSSxDQUFDLENBQUMsUUFBUSxJQUFJLG9CQUFvQixDQUFDO2dCQUN0QyxNQUFNLElBQUksS0FBSyxDQUFDLDhDQUE4QyxRQUFRLCtCQUErQixDQUFDLENBQUM7WUFDeEcsT0FBTyxJQUFJLG9CQUFvQixDQUFDLFFBQVEsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxDQUFDO1NBQ3RFO1FBQ0QsMkNBQTJDO2FBQ3RDLElBQUksUUFBUSxJQUFJLHVCQUF1QjtZQUMzQyxPQUFPLElBQUksdUJBQXVCLENBQUMsUUFBUSxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDMUUsNENBQTRDO1FBQzVDLE9BQU8sSUFBSSwwQkFBMEIsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxVQUFVLEVBQUUsSUFBSSxFQUFFLFFBQVEsQ0FBQyxDQUFDO0lBQ3pGLENBQUM7Q0FDRCIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7RXZlbnRFbWl0dGVyfSBmcm9tIFwiZXZlbnRzXCI7XHJcbmltcG9ydCBFeGVjdXRvciBmcm9tIFwiLi9leGVjdXRvcnMvRXhlY3V0b3JcIjtcclxuaW1wb3J0IE5vZGVKU0V4ZWN1dG9yIGZyb20gXCIuL2V4ZWN1dG9ycy9Ob2RlSlNFeGVjdXRvclwiO1xyXG5pbXBvcnQgTm9uSW50ZXJhY3RpdmVDb2RlRXhlY3V0b3IgZnJvbSBcIi4vZXhlY3V0b3JzL05vbkludGVyYWN0aXZlQ29kZUV4ZWN1dG9yXCI7XHJcbmltcG9ydCBQcm9sb2dFeGVjdXRvciBmcm9tIFwiLi9leGVjdXRvcnMvUHJvbG9nRXhlY3V0b3JcIjtcclxuaW1wb3J0IFB5dGhvbkV4ZWN1dG9yIGZyb20gXCIuL2V4ZWN1dG9ycy9weXRob24vUHl0aG9uRXhlY3V0b3JcIjtcclxuaW1wb3J0IENwcEV4ZWN1dG9yIGZyb20gJy4vZXhlY3V0b3JzL0NwcEV4ZWN1dG9yJztcclxuaW1wb3J0IEV4ZWN1dGVDb2RlUGx1Z2luLCB7TGFuZ3VhZ2VJZH0gZnJvbSBcIi4vbWFpblwiO1xyXG5pbXBvcnQgUkV4ZWN1dG9yIGZyb20gXCIuL2V4ZWN1dG9ycy9SRXhlY3V0b3IuanNcIjtcclxuaW1wb3J0IENFeGVjdXRvciBmcm9tIFwiLi9leGVjdXRvcnMvQ0V4ZWN1dG9yXCI7XHJcbmltcG9ydCBGU2hhcnBFeGVjdXRvciBmcm9tIFwiLi9leGVjdXRvcnMvRlNoYXJwRXhlY3V0b3JcIjtcclxuaW1wb3J0IExhdGV4RXhlY3V0b3IgZnJvbSBcIi4vZXhlY3V0b3JzL0xhdGV4RXhlY3V0b3JcIjtcclxuXHJcbmNvbnN0IGludGVyYWN0aXZlRXhlY3V0b3JzOiBQYXJ0aWFsPFJlY29yZDxMYW5ndWFnZUlkLCBhbnk+PiA9IHtcclxuXHRcImpzXCI6IE5vZGVKU0V4ZWN1dG9yLFxyXG5cdFwicHl0aG9uXCI6IFB5dGhvbkV4ZWN1dG9yLFxyXG5cdFwiclwiOiBSRXhlY3V0b3JcclxufTtcclxuXHJcbmNvbnN0IG5vbkludGVyYWN0aXZlRXhlY3V0b3JzOiBQYXJ0aWFsPFJlY29yZDxMYW5ndWFnZUlkLCBhbnk+PiA9IHtcclxuXHRcInByb2xvZ1wiOiBQcm9sb2dFeGVjdXRvcixcclxuXHRcImNwcFwiOiBDcHBFeGVjdXRvcixcclxuXHRcImNcIjogQ0V4ZWN1dG9yLFxyXG5cdFwiZnNoYXJwXCI6IEZTaGFycEV4ZWN1dG9yLFxyXG5cdFwibGF0ZXhcIiA6IExhdGV4RXhlY3V0b3IsXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBFeGVjdXRvckNvbnRhaW5lciBleHRlbmRzIEV2ZW50RW1pdHRlciBpbXBsZW1lbnRzIEl0ZXJhYmxlPEV4ZWN1dG9yPiB7XHJcblx0ZXhlY3V0b3JzOiB7IFtrZXkgaW4gTGFuZ3VhZ2VJZF0/OiB7IFtrZXk6IHN0cmluZ106IEV4ZWN1dG9yIH0gfSA9IHt9XHJcblx0cGx1Z2luOiBFeGVjdXRlQ29kZVBsdWdpbjtcclxuXHJcblx0Y29uc3RydWN0b3IocGx1Z2luOiBFeGVjdXRlQ29kZVBsdWdpbikge1xyXG5cdFx0c3VwZXIoKTtcclxuXHRcdHRoaXMucGx1Z2luID0gcGx1Z2luO1xyXG5cdFx0XHJcblx0XHR3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcImJlZm9yZXVubG9hZFwiLCBhc3luYyAoKSA9PiB7XHJcblx0XHRcdGZvcihjb25zdCBleGVjdXRvciBvZiB0aGlzKSB7XHJcblx0XHRcdFx0ZXhlY3V0b3Iuc3RvcCgpO1xyXG5cdFx0XHR9XHJcblx0XHR9KTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEl0ZXJhdGUgdGhyb3VnaCBhbGwgZXhlY3V0b3JzXHJcblx0ICovXHJcblx0KiBbU3ltYm9sLml0ZXJhdG9yXSgpOiBJdGVyYXRvcjxFeGVjdXRvcj4ge1xyXG5cdFx0Zm9yIChjb25zdCBsYW5ndWFnZSBpbiB0aGlzLmV4ZWN1dG9ycykge1xyXG5cdFx0XHRmb3IgKGNvbnN0IGZpbGUgaW4gdGhpcy5leGVjdXRvcnNbbGFuZ3VhZ2UgYXMgTGFuZ3VhZ2VJZF0pIHtcclxuXHRcdFx0XHR5aWVsZCB0aGlzLmV4ZWN1dG9yc1tsYW5ndWFnZSBhcyBMYW5ndWFnZUlkXVtmaWxlXTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogR2V0cyBhbiBleGVjdXRvciBmb3IgdGhlIGdpdmVuIGZpbGUgYW5kIGxhbmd1YWdlLiBJZiB0aGUgbGFuZ3VhZ2UgaW5cclxuXHQgKiBxdWVzdGlvbiAqbWF5KiBiZSBpbnRlcmFjdGl2ZSwgdGhlbiB0aGUgZXhlY3V0b3Igd2lsbCBiZSBjYWNoZWQgYW5kIHJlLXJldHVybmVkXHJcblx0ICogdGhlIHNhbWUgZm9yIHN1YnNlcXVlbnQgY2FsbHMgd2l0aCB0aGUgc2FtZSBhcmd1bWVudHMuXHJcblx0ICogSWYgdGhlcmUgaXNuJ3QgYSBjYWNoZWQgZXhlY3V0b3IsIGl0IHdpbGwgYmUgY3JlYXRlZC5cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSBmaWxlIGZpbGUgdG8gZ2V0IGFuIGV4ZWN1dG9yIGZvclxyXG5cdCAqIEBwYXJhbSBsYW5ndWFnZSBsYW5ndWFnZSB0byBnZXQgYW4gZXhlY3V0b3IgZm9yLlxyXG5cdCAqIEBwYXJhbSBuZWVkc1NoZWxsIHdoZXRoZXIgb3Igbm90IHRoZSBsYW5ndWFnZSByZXF1aXJlcyBhIHNoZWxsXHJcblx0ICovXHJcblx0Z2V0RXhlY3V0b3JGb3IoZmlsZTogc3RyaW5nLCBsYW5ndWFnZTogTGFuZ3VhZ2VJZCwgbmVlZHNTaGVsbDogYm9vbGVhbikge1xyXG5cdFx0aWYgKCF0aGlzLmV4ZWN1dG9yc1tsYW5ndWFnZV0pIHRoaXMuZXhlY3V0b3JzW2xhbmd1YWdlXSA9IHt9XHJcblx0XHRpZiAoIXRoaXMuZXhlY3V0b3JzW2xhbmd1YWdlXVtmaWxlXSkgdGhpcy5zZXRFeGVjdXRvckluRXhlY3V0b3JzT2JqZWN0KGZpbGUsIGxhbmd1YWdlLCBuZWVkc1NoZWxsKTtcclxuXHJcblx0XHRyZXR1cm4gdGhpcy5leGVjdXRvcnNbbGFuZ3VhZ2VdW2ZpbGVdO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQ3JlYXRlIGFuIGV4ZWN1dG9yIGFuZCBwdXQgaXQgaW50byB0aGUgYGV4ZWN1dG9yc2AgZGljdGlvbmFyeS5cclxuXHQgKiBAcGFyYW0gZmlsZSB0aGUgZmlsZSB0byBhc3NvY2lhdGUgdGhlIG5ldyBleGVjdXRvciB3aXRoXHJcblx0ICogQHBhcmFtIGxhbmd1YWdlIHRoZSBsYW5ndWFnZSB0byBhc3NvY2lhdGUgdGhlIG5ldyBleGVjdXRvciB3aXRoXHJcblx0ICogQHBhcmFtIG5lZWRzU2hlbGwgd2hldGhlciBvciBub3QgdGhlIGxhbmd1YWdlIHJlcXVpcmVzIGEgc2hlbGxcclxuXHQgKi9cclxuXHRwcml2YXRlIHNldEV4ZWN1dG9ySW5FeGVjdXRvcnNPYmplY3QoZmlsZTogc3RyaW5nLCBsYW5ndWFnZTogTGFuZ3VhZ2VJZCwgbmVlZHNTaGVsbDogYm9vbGVhbikge1xyXG5cdFx0Y29uc3QgZXhlID0gdGhpcy5jcmVhdGVFeGVjdXRvckZvcihmaWxlLCBsYW5ndWFnZSwgbmVlZHNTaGVsbCk7XHJcblx0XHRpZiAoIShleGUgaW5zdGFuY2VvZiBOb25JbnRlcmFjdGl2ZUNvZGVFeGVjdXRvcikpIHRoaXMuZW1pdChcImFkZFwiLCBleGUpO1xyXG5cdFx0ZXhlLm9uKFwiY2xvc2VcIiwgKCkgPT4ge1xyXG5cdFx0XHRkZWxldGUgdGhpcy5leGVjdXRvcnNbbGFuZ3VhZ2VdW2ZpbGVdO1xyXG5cdFx0fSk7XHJcblxyXG5cdFx0dGhpcy5leGVjdXRvcnNbbGFuZ3VhZ2VdW2ZpbGVdID0gZXhlO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQ3JlYXRlcyBhbiBleGVjdXRvclxyXG5cdCAqXHJcblx0ICogQHBhcmFtIGZpbGUgdGhlIGZpbGUgdG8gYXNzb2NpYXRlIHRoZSBuZXcgZXhlY3V0b3Igd2l0aFxyXG5cdCAqIEBwYXJhbSBsYW5ndWFnZSB0aGUgbGFuZ3VhZ2UgdG8gbWFrZSBhbiBleGVjdXRvciBmb3JcclxuXHQgKiBAcGFyYW0gbmVlZHNTaGVsbCB3aGV0aGVyIG9yIG5vdCB0aGUgbGFuZ3VhZ2UgcmVxdWlyZXMgYSBzaGVsbFxyXG5cdCAqIEByZXR1cm5zIGEgbmV3IGV4ZWN1dG9yIGFzc29jaWF0ZWQgd2l0aCB0aGUgZ2l2ZW4gbGFuZ3VhZ2UgYW5kIGZpbGVcclxuXHQgKi9cclxuXHRwcml2YXRlIGNyZWF0ZUV4ZWN1dG9yRm9yKGZpbGU6IHN0cmluZywgbGFuZ3VhZ2U6IExhbmd1YWdlSWQsIG5lZWRzU2hlbGw6IGJvb2xlYW4pIHtcclxuXHRcdC8vIEludGVyYWN0aXZlIGxhbmd1YWdlIGV4ZWN1dG9yXHJcblx0XHRpZiAodGhpcy5wbHVnaW4uc2V0dGluZ3NbYCR7bGFuZ3VhZ2V9SW50ZXJhY3RpdmVgXSkge1xyXG5cdFx0XHRpZiAoIShsYW5ndWFnZSBpbiBpbnRlcmFjdGl2ZUV4ZWN1dG9ycykpXHJcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKGBBdHRlbXB0ZWQgdG8gdXNlIGludGVyYWN0aXZlIGV4ZWN1dG9yIGZvciAnJHtsYW5ndWFnZX0nIGJ1dCBubyBzdWNoIGV4ZWN1dG9yIGV4aXN0c2ApO1xyXG5cdFx0XHRyZXR1cm4gbmV3IGludGVyYWN0aXZlRXhlY3V0b3JzW2xhbmd1YWdlXSh0aGlzLnBsdWdpbi5zZXR0aW5ncywgZmlsZSk7XHJcblx0XHR9XHJcblx0XHQvLyBDdXN0b20gbm9uLWludGVyYWN0aXZlIGxhbmd1YWdlIGV4ZWN1dG9yXHJcblx0XHRlbHNlIGlmIChsYW5ndWFnZSBpbiBub25JbnRlcmFjdGl2ZUV4ZWN1dG9ycylcclxuXHRcdFx0cmV0dXJuIG5ldyBub25JbnRlcmFjdGl2ZUV4ZWN1dG9yc1tsYW5ndWFnZV0odGhpcy5wbHVnaW4uc2V0dGluZ3MsIGZpbGUpO1xyXG5cdFx0Ly8gR2VuZXJpYyBub24taW50ZXJhY3RpdmUgbGFuZ3VhZ2UgZXhlY3V0b3JcclxuXHRcdHJldHVybiBuZXcgTm9uSW50ZXJhY3RpdmVDb2RlRXhlY3V0b3IodGhpcy5wbHVnaW4uc2V0dGluZ3MsIG5lZWRzU2hlbGwsIGZpbGUsIGxhbmd1YWdlKTtcclxuXHR9XHJcbn1cclxuIl19