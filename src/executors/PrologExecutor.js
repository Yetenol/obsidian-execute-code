// @ts-ignore
import * as prolog from "tau-prolog";
import Executor from "./Executor";
import { Notice } from "obsidian";
export default class PrologExecutor extends Executor {
    constructor(settings, file) {
        super(file, "prolog");
        this.runQueries = true;
        this.maxPrologAnswers = settings.maxPrologAnswers;
    }
    async run(code, outputter, cmd, cmdArgs, ext) {
        const prologCode = code.split(/\n+%+\s*query\n+/);
        if (prologCode.length < 2)
            return; // no query found
        //Prolog does not support input
        outputter.closeInput();
        outputter.clear();
        this.runPrologCode(prologCode[0], prologCode[1], outputter);
    }
    async stop() {
        this.runQueries = false;
        this.emit("close");
    }
    /**
     * Executes a string with prolog code using the TauProlog interpreter.
     * All queries must be below a line containing only '% queries'.
     *
     * @param facts Contains the facts.
     * @param queries Contains the queries.
     * @param out The {@link Outputter} that should be used to display the output of the code.
     */
    runPrologCode(facts, queries, out) {
        new Notice("Running...");
        const session = prolog.create();
        session.consult(facts, {
            success: () => {
                session.query(queries, {
                    success: async (goal) => {
                        console.debug(`Prolog goal: ${goal}`);
                        let answersLeft = true;
                        let counter = 0;
                        while (answersLeft && counter < this.maxPrologAnswers) {
                            await session.answer({
                                success: function (answer) {
                                    new Notice("Done!");
                                    console.debug(`Prolog result: ${session.format_answer(answer)}`);
                                    out.write(session.format_answer(answer) + "\n");
                                    out.closeInput();
                                },
                                fail: function () {
                                    /* No more answers */
                                    answersLeft = false;
                                },
                                error: function (err) {
                                    new Notice("Error!");
                                    console.error(err);
                                    answersLeft = false;
                                    out.writeErr(`Error while executing code: ${err}`);
                                    out.closeInput();
                                },
                                limit: function () {
                                    answersLeft = false;
                                }
                            });
                            counter++;
                        }
                    },
                    error: (err) => {
                        new Notice("Error!");
                        out.writeErr("Query failed.\n");
                        out.writeErr(err.toString());
                    }
                });
            },
            error: (err) => {
                out.writeErr("Adding facts failed.\n");
                out.writeErr(err.toString());
            }
        });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUHJvbG9nRXhlY3V0b3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJQcm9sb2dFeGVjdXRvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxhQUFhO0FBQ2IsT0FBTyxLQUFLLE1BQU0sTUFBTSxZQUFZLENBQUM7QUFFckMsT0FBTyxRQUFRLE1BQU0sWUFBWSxDQUFDO0FBQ2xDLE9BQU8sRUFBQyxNQUFNLEVBQUMsTUFBTSxVQUFVLENBQUM7QUFHaEMsTUFBTSxDQUFDLE9BQU8sT0FBTyxjQUFlLFNBQVEsUUFBUTtJQUtuRCxZQUFZLFFBQTBCLEVBQUUsSUFBWTtRQUNuRCxLQUFLLENBQUMsSUFBSSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBQ3RCLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDO1FBQ3ZCLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxRQUFRLENBQUMsZ0JBQWdCLENBQUM7SUFDbkQsQ0FBQztJQUVELEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBWSxFQUFFLFNBQW9CLEVBQUUsR0FBVyxFQUFFLE9BQWUsRUFBRSxHQUFXO1FBQ3RGLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsa0JBQWtCLENBQUMsQ0FBQztRQUVsRCxJQUFJLFVBQVUsQ0FBQyxNQUFNLEdBQUcsQ0FBQztZQUFFLE9BQU8sQ0FBQyxpQkFBaUI7UUFFcEQsK0JBQStCO1FBQy9CLFNBQVMsQ0FBQyxVQUFVLEVBQUUsQ0FBQztRQUN2QixTQUFTLENBQUMsS0FBSyxFQUFFLENBQUM7UUFFbEIsSUFBSSxDQUFDLGFBQWEsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLEVBQUUsVUFBVSxDQUFDLENBQUMsQ0FBQyxFQUFFLFNBQVMsQ0FBQyxDQUFDO0lBQzdELENBQUM7SUFFRCxLQUFLLENBQUMsSUFBSTtRQUNULElBQUksQ0FBQyxVQUFVLEdBQUcsS0FBSyxDQUFDO1FBQ3hCLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDcEIsQ0FBQztJQUVEOzs7Ozs7O09BT0c7SUFDSyxhQUFhLENBQUMsS0FBYSxFQUFFLE9BQWUsRUFBRSxHQUFjO1FBQ25FLElBQUksTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQ3pCLE1BQU0sT0FBTyxHQUFHLE1BQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUNoQyxPQUFPLENBQUMsT0FBTyxDQUFDLEtBQUssRUFDbEI7WUFDRCxPQUFPLEVBQUUsR0FBRyxFQUFFO2dCQUNiLE9BQU8sQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUNsQjtvQkFDRCxPQUFPLEVBQUUsS0FBSyxFQUFFLElBQVMsRUFBRSxFQUFFO3dCQUM1QixPQUFPLENBQUMsS0FBSyxDQUFDLGdCQUFnQixJQUFJLEVBQUUsQ0FBQyxDQUFBO3dCQUNyQyxJQUFJLFdBQVcsR0FBRyxJQUFJLENBQUM7d0JBQ3ZCLElBQUksT0FBTyxHQUFHLENBQUMsQ0FBQzt3QkFFaEIsT0FBTyxXQUFXLElBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsRUFBRTs0QkFDdEQsTUFBTSxPQUFPLENBQUMsTUFBTSxDQUFDO2dDQUNwQixPQUFPLEVBQUUsVUFBVSxNQUFXO29DQUM3QixJQUFJLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQztvQ0FDcEIsT0FBTyxDQUFDLEtBQUssQ0FBQyxrQkFBa0IsT0FBTyxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUM7b0NBQ2pFLEdBQUcsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQztvQ0FDaEQsR0FBRyxDQUFDLFVBQVUsRUFBRSxDQUFDO2dDQUNsQixDQUFDO2dDQUNELElBQUksRUFBRTtvQ0FDTCxxQkFBcUI7b0NBQ3JCLFdBQVcsR0FBRyxLQUFLLENBQUM7Z0NBQ3JCLENBQUM7Z0NBQ0QsS0FBSyxFQUFFLFVBQVUsR0FBUTtvQ0FDeEIsSUFBSSxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUM7b0NBQ3JCLE9BQU8sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7b0NBQ25CLFdBQVcsR0FBRyxLQUFLLENBQUM7b0NBQ3BCLEdBQUcsQ0FBQyxRQUFRLENBQUMsK0JBQStCLEdBQUcsRUFBRSxDQUFDLENBQUM7b0NBQ25ELEdBQUcsQ0FBQyxVQUFVLEVBQUUsQ0FBQztnQ0FDbEIsQ0FBQztnQ0FDRCxLQUFLLEVBQUU7b0NBQ04sV0FBVyxHQUFHLEtBQUssQ0FBQztnQ0FDckIsQ0FBQzs2QkFDRCxDQUFDLENBQUM7NEJBQ0gsT0FBTyxFQUFFLENBQUM7eUJBQ1Y7b0JBQ0YsQ0FBQztvQkFDRCxLQUFLLEVBQUUsQ0FBQyxHQUFRLEVBQUUsRUFBRTt3QkFDbkIsSUFBSSxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUM7d0JBQ3JCLEdBQUcsQ0FBQyxRQUFRLENBQUMsaUJBQWlCLENBQUMsQ0FBQTt3QkFDL0IsR0FBRyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztvQkFDOUIsQ0FBQztpQkFDRCxDQUNELENBQUE7WUFDRixDQUFDO1lBQ0QsS0FBSyxFQUFFLENBQUMsR0FBUSxFQUFFLEVBQUU7Z0JBQ25CLEdBQUcsQ0FBQyxRQUFRLENBQUMsd0JBQXdCLENBQUMsQ0FBQTtnQkFDdEMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztZQUM5QixDQUFDO1NBQ0QsQ0FDRCxDQUFDO0lBQ0gsQ0FBQztDQUVEIiwic291cmNlc0NvbnRlbnQiOlsiLy8gQHRzLWlnbm9yZVxyXG5pbXBvcnQgKiBhcyBwcm9sb2cgZnJvbSBcInRhdS1wcm9sb2dcIjtcclxuaW1wb3J0IHtPdXRwdXR0ZXJ9IGZyb20gXCJzcmMvb3V0cHV0L091dHB1dHRlclwiO1xyXG5pbXBvcnQgRXhlY3V0b3IgZnJvbSBcIi4vRXhlY3V0b3JcIjtcclxuaW1wb3J0IHtOb3RpY2V9IGZyb20gXCJvYnNpZGlhblwiO1xyXG5pbXBvcnQge0V4ZWN1dG9yU2V0dGluZ3N9IGZyb20gXCJzcmMvc2V0dGluZ3MvU2V0dGluZ3NcIjtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFByb2xvZ0V4ZWN1dG9yIGV4dGVuZHMgRXhlY3V0b3Ige1xyXG5cclxuXHRydW5RdWVyaWVzOiBib29sZWFuO1xyXG5cdG1heFByb2xvZ0Fuc3dlcnM6IG51bWJlcjtcclxuXHJcblx0Y29uc3RydWN0b3Ioc2V0dGluZ3M6IEV4ZWN1dG9yU2V0dGluZ3MsIGZpbGU6IHN0cmluZykge1xyXG5cdFx0c3VwZXIoZmlsZSwgXCJwcm9sb2dcIik7XHJcblx0XHR0aGlzLnJ1blF1ZXJpZXMgPSB0cnVlO1xyXG5cdFx0dGhpcy5tYXhQcm9sb2dBbnN3ZXJzID0gc2V0dGluZ3MubWF4UHJvbG9nQW5zd2VycztcclxuXHR9XHJcblxyXG5cdGFzeW5jIHJ1bihjb2RlOiBzdHJpbmcsIG91dHB1dHRlcjogT3V0cHV0dGVyLCBjbWQ6IHN0cmluZywgY21kQXJnczogc3RyaW5nLCBleHQ6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xyXG5cdFx0Y29uc3QgcHJvbG9nQ29kZSA9IGNvZGUuc3BsaXQoL1xcbislK1xccypxdWVyeVxcbisvKTtcclxuXHJcblx0XHRpZiAocHJvbG9nQ29kZS5sZW5ndGggPCAyKSByZXR1cm47XHQvLyBubyBxdWVyeSBmb3VuZFxyXG5cclxuXHRcdC8vUHJvbG9nIGRvZXMgbm90IHN1cHBvcnQgaW5wdXRcclxuXHRcdG91dHB1dHRlci5jbG9zZUlucHV0KCk7XHJcblx0XHRvdXRwdXR0ZXIuY2xlYXIoKTtcclxuXHJcblx0XHR0aGlzLnJ1blByb2xvZ0NvZGUocHJvbG9nQ29kZVswXSwgcHJvbG9nQ29kZVsxXSwgb3V0cHV0dGVyKTtcclxuXHR9XHJcblxyXG5cdGFzeW5jIHN0b3AoKSB7XHJcblx0XHR0aGlzLnJ1blF1ZXJpZXMgPSBmYWxzZTtcclxuXHRcdHRoaXMuZW1pdChcImNsb3NlXCIpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogRXhlY3V0ZXMgYSBzdHJpbmcgd2l0aCBwcm9sb2cgY29kZSB1c2luZyB0aGUgVGF1UHJvbG9nIGludGVycHJldGVyLlxyXG5cdCAqIEFsbCBxdWVyaWVzIG11c3QgYmUgYmVsb3cgYSBsaW5lIGNvbnRhaW5pbmcgb25seSAnJSBxdWVyaWVzJy5cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSBmYWN0cyBDb250YWlucyB0aGUgZmFjdHMuXHJcblx0ICogQHBhcmFtIHF1ZXJpZXMgQ29udGFpbnMgdGhlIHF1ZXJpZXMuXHJcblx0ICogQHBhcmFtIG91dCBUaGUge0BsaW5rIE91dHB1dHRlcn0gdGhhdCBzaG91bGQgYmUgdXNlZCB0byBkaXNwbGF5IHRoZSBvdXRwdXQgb2YgdGhlIGNvZGUuXHJcblx0ICovXHJcblx0cHJpdmF0ZSBydW5Qcm9sb2dDb2RlKGZhY3RzOiBzdHJpbmcsIHF1ZXJpZXM6IHN0cmluZywgb3V0OiBPdXRwdXR0ZXIpIHtcclxuXHRcdG5ldyBOb3RpY2UoXCJSdW5uaW5nLi4uXCIpO1xyXG5cdFx0Y29uc3Qgc2Vzc2lvbiA9IHByb2xvZy5jcmVhdGUoKTtcclxuXHRcdHNlc3Npb24uY29uc3VsdChmYWN0c1xyXG5cdFx0XHQsIHtcclxuXHRcdFx0XHRzdWNjZXNzOiAoKSA9PiB7XHJcblx0XHRcdFx0XHRzZXNzaW9uLnF1ZXJ5KHF1ZXJpZXNcclxuXHRcdFx0XHRcdFx0LCB7XHJcblx0XHRcdFx0XHRcdFx0c3VjY2VzczogYXN5bmMgKGdvYWw6IGFueSkgPT4ge1xyXG5cdFx0XHRcdFx0XHRcdFx0Y29uc29sZS5kZWJ1ZyhgUHJvbG9nIGdvYWw6ICR7Z29hbH1gKVxyXG5cdFx0XHRcdFx0XHRcdFx0bGV0IGFuc3dlcnNMZWZ0ID0gdHJ1ZTtcclxuXHRcdFx0XHRcdFx0XHRcdGxldCBjb3VudGVyID0gMDtcclxuXHJcblx0XHRcdFx0XHRcdFx0XHR3aGlsZSAoYW5zd2Vyc0xlZnQgJiYgY291bnRlciA8IHRoaXMubWF4UHJvbG9nQW5zd2Vycykge1xyXG5cdFx0XHRcdFx0XHRcdFx0XHRhd2FpdCBzZXNzaW9uLmFuc3dlcih7XHJcblx0XHRcdFx0XHRcdFx0XHRcdFx0c3VjY2VzczogZnVuY3Rpb24gKGFuc3dlcjogYW55KSB7XHJcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRuZXcgTm90aWNlKFwiRG9uZSFcIik7XHJcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRjb25zb2xlLmRlYnVnKGBQcm9sb2cgcmVzdWx0OiAke3Nlc3Npb24uZm9ybWF0X2Fuc3dlcihhbnN3ZXIpfWApO1xyXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0b3V0LndyaXRlKHNlc3Npb24uZm9ybWF0X2Fuc3dlcihhbnN3ZXIpICsgXCJcXG5cIik7XHJcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRvdXQuY2xvc2VJbnB1dCgpO1xyXG5cdFx0XHRcdFx0XHRcdFx0XHRcdH0sXHJcblx0XHRcdFx0XHRcdFx0XHRcdFx0ZmFpbDogZnVuY3Rpb24gKCkge1xyXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0LyogTm8gbW9yZSBhbnN3ZXJzICovXHJcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRhbnN3ZXJzTGVmdCA9IGZhbHNlO1xyXG5cdFx0XHRcdFx0XHRcdFx0XHRcdH0sXHJcblx0XHRcdFx0XHRcdFx0XHRcdFx0ZXJyb3I6IGZ1bmN0aW9uIChlcnI6IGFueSkge1xyXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0bmV3IE5vdGljZShcIkVycm9yIVwiKTtcclxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdGNvbnNvbGUuZXJyb3IoZXJyKTtcclxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdGFuc3dlcnNMZWZ0ID0gZmFsc2U7XHJcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRvdXQud3JpdGVFcnIoYEVycm9yIHdoaWxlIGV4ZWN1dGluZyBjb2RlOiAke2Vycn1gKTtcclxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdG91dC5jbG9zZUlucHV0KCk7XHJcblx0XHRcdFx0XHRcdFx0XHRcdFx0fSxcclxuXHRcdFx0XHRcdFx0XHRcdFx0XHRsaW1pdDogZnVuY3Rpb24gKCkge1xyXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0YW5zd2Vyc0xlZnQgPSBmYWxzZTtcclxuXHRcdFx0XHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdFx0XHRcdH0pO1xyXG5cdFx0XHRcdFx0XHRcdFx0XHRjb3VudGVyKys7XHJcblx0XHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdFx0fSxcclxuXHRcdFx0XHRcdFx0XHRlcnJvcjogKGVycjogYW55KSA9PiB7XHJcblx0XHRcdFx0XHRcdFx0XHRuZXcgTm90aWNlKFwiRXJyb3IhXCIpO1xyXG5cdFx0XHRcdFx0XHRcdFx0b3V0LndyaXRlRXJyKFwiUXVlcnkgZmFpbGVkLlxcblwiKVxyXG5cdFx0XHRcdFx0XHRcdFx0b3V0LndyaXRlRXJyKGVyci50b1N0cmluZygpKTtcclxuXHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdClcclxuXHRcdFx0XHR9LFxyXG5cdFx0XHRcdGVycm9yOiAoZXJyOiBhbnkpID0+IHtcclxuXHRcdFx0XHRcdG91dC53cml0ZUVycihcIkFkZGluZyBmYWN0cyBmYWlsZWQuXFxuXCIpXHJcblx0XHRcdFx0XHRvdXQud3JpdGVFcnIoZXJyLnRvU3RyaW5nKCkpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0KTtcclxuXHR9XHJcblxyXG59XHJcbiJdfQ==