import Executor from "./Executor";
export default class AsyncExecutor extends Executor {
    constructor() {
        super(...arguments);
        this.runningTask = Promise.resolve();
    }
    /**
     * Add a job to the internal executor queue.
     * Callbacks are guaranteed  to only be called once, and to be called when there are no other tasks running.
     * A callback is interpreted the same as a promise: it must call the `resolve` or `reject` callbacks to complete the job.
     * The returned promise resolves when the job has completed.
     */
    async addJobToQueue(promiseCallback) {
        const previousJob = this.runningTask;
        this.runningTask = new Promise((resolve, reject) => {
            previousJob.finally(async () => {
                try {
                    await new Promise((innerResolve, innerReject) => {
                        this.once("close", () => innerResolve(undefined));
                        promiseCallback(innerResolve, innerReject);
                    });
                    resolve();
                }
                catch (e) {
                    reject(e);
                }
            });
        });
        return this.runningTask;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQXN5bmNFeGVjdXRvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIkFzeW5jRXhlY3V0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxRQUFRLE1BQU0sWUFBWSxDQUFDO0FBSWxDLE1BQU0sQ0FBQyxPQUFPLE9BQWdCLGFBQWMsU0FBUSxRQUFRO0lBQTVEOztRQUNTLGdCQUFXLEdBQWtCLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQztJQTZCeEQsQ0FBQztJQTFCQTs7Ozs7T0FLRztJQUNPLEtBQUssQ0FBQyxhQUFhLENBQUMsZUFBb0M7UUFDakUsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQztRQUVyQyxJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFO1lBQ2xELFdBQVcsQ0FBQyxPQUFPLENBQUMsS0FBSyxJQUFJLEVBQUU7Z0JBQzlCLElBQUk7b0JBQ0gsTUFBTSxJQUFJLE9BQU8sQ0FBQyxDQUFDLFlBQVksRUFBRSxXQUFXLEVBQUUsRUFBRTt3QkFDL0MsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsR0FBRyxFQUFFLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7d0JBQ2xELGVBQWUsQ0FBQyxZQUFZLEVBQUUsV0FBVyxDQUFDLENBQUM7b0JBQzVDLENBQUMsQ0FBQyxDQUFDO29CQUNILE9BQU8sRUFBRSxDQUFDO2lCQUNWO2dCQUFDLE9BQU8sQ0FBQyxFQUFFO29CQUNYLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztpQkFDVjtZQUVGLENBQUMsQ0FBQyxDQUFBO1FBQ0gsQ0FBQyxDQUFDLENBQUE7UUFFRixPQUFPLElBQUksQ0FBQyxXQUFXLENBQUM7SUFDekIsQ0FBQztDQUNEIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IEV4ZWN1dG9yIGZyb20gXCIuL0V4ZWN1dG9yXCI7XHJcblxyXG50eXBlIFByb21pc2VhYmxlQ2FsbGJhY2sgPSAocmVzb2x2ZTogKHJlc3VsdD86IGFueSkgPT4gdm9pZCwgcmVqZWN0OiAocmVhc29uPzogYW55KSA9PiB2b2lkKSA9PiB2b2lkXHJcblxyXG5leHBvcnQgZGVmYXVsdCBhYnN0cmFjdCBjbGFzcyBBc3luY0V4ZWN1dG9yIGV4dGVuZHMgRXhlY3V0b3Ige1xyXG5cdHByaXZhdGUgcnVubmluZ1Rhc2s6IFByb21pc2U8dm9pZD4gPSBQcm9taXNlLnJlc29sdmUoKTtcclxuXHJcblxyXG5cdC8qKlxyXG5cdCAqIEFkZCBhIGpvYiB0byB0aGUgaW50ZXJuYWwgZXhlY3V0b3IgcXVldWUuXHJcblx0ICogQ2FsbGJhY2tzIGFyZSBndWFyYW50ZWVkICB0byBvbmx5IGJlIGNhbGxlZCBvbmNlLCBhbmQgdG8gYmUgY2FsbGVkIHdoZW4gdGhlcmUgYXJlIG5vIG90aGVyIHRhc2tzIHJ1bm5pbmcuXHJcblx0ICogQSBjYWxsYmFjayBpcyBpbnRlcnByZXRlZCB0aGUgc2FtZSBhcyBhIHByb21pc2U6IGl0IG11c3QgY2FsbCB0aGUgYHJlc29sdmVgIG9yIGByZWplY3RgIGNhbGxiYWNrcyB0byBjb21wbGV0ZSB0aGUgam9iLlxyXG5cdCAqIFRoZSByZXR1cm5lZCBwcm9taXNlIHJlc29sdmVzIHdoZW4gdGhlIGpvYiBoYXMgY29tcGxldGVkLlxyXG5cdCAqL1xyXG5cdHByb3RlY3RlZCBhc3luYyBhZGRKb2JUb1F1ZXVlKHByb21pc2VDYWxsYmFjazogUHJvbWlzZWFibGVDYWxsYmFjayk6IFByb21pc2U8dm9pZD4ge1xyXG5cdFx0Y29uc3QgcHJldmlvdXNKb2IgPSB0aGlzLnJ1bm5pbmdUYXNrO1xyXG5cclxuXHRcdHRoaXMucnVubmluZ1Rhc2sgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcblx0XHRcdHByZXZpb3VzSm9iLmZpbmFsbHkoYXN5bmMgKCkgPT4ge1xyXG5cdFx0XHRcdHRyeSB7XHJcblx0XHRcdFx0XHRhd2FpdCBuZXcgUHJvbWlzZSgoaW5uZXJSZXNvbHZlLCBpbm5lclJlamVjdCkgPT4ge1xyXG5cdFx0XHRcdFx0XHR0aGlzLm9uY2UoXCJjbG9zZVwiLCAoKSA9PiBpbm5lclJlc29sdmUodW5kZWZpbmVkKSk7XHJcblx0XHRcdFx0XHRcdHByb21pc2VDYWxsYmFjayhpbm5lclJlc29sdmUsIGlubmVyUmVqZWN0KTtcclxuXHRcdFx0XHRcdH0pO1xyXG5cdFx0XHRcdFx0cmVzb2x2ZSgpO1xyXG5cdFx0XHRcdH0gY2F0Y2ggKGUpIHtcclxuXHRcdFx0XHRcdHJlamVjdChlKTtcclxuXHRcdFx0XHR9XHJcblxyXG5cdFx0XHR9KVxyXG5cdFx0fSlcclxuXHJcblx0XHRyZXR1cm4gdGhpcy5ydW5uaW5nVGFzaztcclxuXHR9XHJcbn1cclxuIl19