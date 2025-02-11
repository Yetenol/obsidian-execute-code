import ReplExecutor from "./ReplExecutor.js";
export default class NodeJSExecutor extends ReplExecutor {
    constructor(settings, file) {
        const args = settings.nodeArgs ? settings.nodeArgs.split(" ") : [];
        args.unshift(`-e`, `require("repl").start({prompt: "", preview: false, ignoreUndefined: true}).on("exit", ()=>process.exit())`);
        super(settings, settings.nodePath, args, file, "js");
    }
    /**
     * Writes a single newline to ensure that the stdin is set up correctly.
     */
    async setup() {
        this.process.stdin.write("\n");
    }
    wrapCode(code, finishSigil) {
        return `try { eval(${JSON.stringify(code)}); }` +
            `catch(e) { console.error(e); }` +
            `finally { process.stdout.write(${JSON.stringify(finishSigil)}); }` +
            "\n";
    }
    removePrompts(output, source) {
        return output;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTm9kZUpTRXhlY3V0b3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJOb2RlSlNFeGVjdXRvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFFQSxPQUFPLFlBQVksTUFBTSxtQkFBbUIsQ0FBQztBQUc3QyxNQUFNLENBQUMsT0FBTyxPQUFPLGNBQWUsU0FBUSxZQUFZO0lBSXZELFlBQVksUUFBMEIsRUFBRSxJQUFZO1FBQ25ELE1BQU0sSUFBSSxHQUFHLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7UUFFbkUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsMkdBQTJHLENBQUMsQ0FBQztRQUVoSSxLQUFLLENBQUMsUUFBUSxFQUFFLFFBQVEsQ0FBQyxRQUFRLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztJQUN0RCxDQUFDO0lBRUQ7O09BRUc7SUFDSCxLQUFLLENBQUMsS0FBSztRQUNWLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNoQyxDQUFDO0lBRUQsUUFBUSxDQUFDLElBQVksRUFBRSxXQUFtQjtRQUN6QyxPQUFPLGNBQWMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsTUFBTTtZQUM5QyxnQ0FBZ0M7WUFDaEMsa0NBQWtDLElBQUksQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLE1BQU07WUFDbkUsSUFBSSxDQUFDO0lBQ1AsQ0FBQztJQUVELGFBQWEsQ0FBQyxNQUFjLEVBQUUsTUFBMkI7UUFDeEQsT0FBTyxNQUFNLENBQUM7SUFDZixDQUFDO0NBRUQiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0NoaWxkUHJvY2Vzc1dpdGhvdXROdWxsU3RyZWFtc30gZnJvbSBcImNoaWxkX3Byb2Nlc3NcIjtcclxuaW1wb3J0IHtFeGVjdXRvclNldHRpbmdzfSBmcm9tIFwic3JjL3NldHRpbmdzL1NldHRpbmdzXCI7XHJcbmltcG9ydCBSZXBsRXhlY3V0b3IgZnJvbSBcIi4vUmVwbEV4ZWN1dG9yLmpzXCI7XHJcblxyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTm9kZUpTRXhlY3V0b3IgZXh0ZW5kcyBSZXBsRXhlY3V0b3Ige1xyXG5cclxuXHRwcm9jZXNzOiBDaGlsZFByb2Nlc3NXaXRob3V0TnVsbFN0cmVhbXNcclxuXHJcblx0Y29uc3RydWN0b3Ioc2V0dGluZ3M6IEV4ZWN1dG9yU2V0dGluZ3MsIGZpbGU6IHN0cmluZykge1xyXG5cdFx0Y29uc3QgYXJncyA9IHNldHRpbmdzLm5vZGVBcmdzID8gc2V0dGluZ3Mubm9kZUFyZ3Muc3BsaXQoXCIgXCIpIDogW107XHJcblxyXG5cdFx0YXJncy51bnNoaWZ0KGAtZWAsIGByZXF1aXJlKFwicmVwbFwiKS5zdGFydCh7cHJvbXB0OiBcIlwiLCBwcmV2aWV3OiBmYWxzZSwgaWdub3JlVW5kZWZpbmVkOiB0cnVlfSkub24oXCJleGl0XCIsICgpPT5wcm9jZXNzLmV4aXQoKSlgKTtcclxuXHJcblx0XHRzdXBlcihzZXR0aW5ncywgc2V0dGluZ3Mubm9kZVBhdGgsIGFyZ3MsIGZpbGUsIFwianNcIik7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBXcml0ZXMgYSBzaW5nbGUgbmV3bGluZSB0byBlbnN1cmUgdGhhdCB0aGUgc3RkaW4gaXMgc2V0IHVwIGNvcnJlY3RseS5cclxuXHQgKi9cclxuXHRhc3luYyBzZXR1cCgpIHtcclxuXHRcdHRoaXMucHJvY2Vzcy5zdGRpbi53cml0ZShcIlxcblwiKTtcclxuXHR9XHJcblxyXG5cdHdyYXBDb2RlKGNvZGU6IHN0cmluZywgZmluaXNoU2lnaWw6IHN0cmluZyk6IHN0cmluZyB7XHJcblx0XHRyZXR1cm4gYHRyeSB7IGV2YWwoJHtKU09OLnN0cmluZ2lmeShjb2RlKX0pOyB9YCArXHJcblx0XHRcdGBjYXRjaChlKSB7IGNvbnNvbGUuZXJyb3IoZSk7IH1gICtcclxuXHRcdFx0YGZpbmFsbHkgeyBwcm9jZXNzLnN0ZG91dC53cml0ZSgke0pTT04uc3RyaW5naWZ5KGZpbmlzaFNpZ2lsKX0pOyB9YCArXHJcblx0XHRcdFwiXFxuXCI7XHJcblx0fVxyXG5cdFxyXG5cdHJlbW92ZVByb21wdHMob3V0cHV0OiBzdHJpbmcsIHNvdXJjZTogXCJzdGRvdXRcIiB8IFwic3RkZXJyXCIpOiBzdHJpbmcge1xyXG5cdFx0cmV0dXJuIG91dHB1dDtcclxuXHR9XHJcblxyXG59XHJcbiJdfQ==