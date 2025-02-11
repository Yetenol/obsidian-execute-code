import ReplExecutor from "./ReplExecutor.js";
export default class RExecutor extends ReplExecutor {
    constructor(settings, file) {
        //use empty array for empty string, instead of [""]
        const args = settings.RArgs ? settings.RArgs.split(" ") : [];
        let conArgName = `notebook_connection_${Math.random().toString(16).substring(2)}`;
        // This is the R repl. 
        // It's coded by itself because Rscript has no REPL, and adding an additional dep on R would be lazy.
        //It doesn't handle printing by itself because of the need to print the sigil, so
        //   it's really more of a REL.
        args.unshift(`-e`, 
        /*R*/
        `${conArgName}=file("stdin", "r"); while(1) { eval(parse(text=tail(readLines(con = ${conArgName}, n=1)))) }`);
        super(settings, settings.RPath, args, file, "r");
    }
    /**
     * Writes a single newline to ensure that the stdin is set up correctly.
     */
    async setup() {
        console.log("setup");
        //this.process.stdin.write("\n");
    }
    wrapCode(code, finishSigil) {
        return `tryCatch({
			cat(sprintf("%s", 
				eval(parse(text = ${JSON.stringify(code)} ))
			))
		},
		error = function(e){
			cat(sprintf("%s", e), file=stderr())
		}, 
		finally = {
			cat(${JSON.stringify(finishSigil)});
			flush.console()
		})`.replace(/\r?\n/g, "") +
            "\n";
    }
    removePrompts(output, source) {
        return output;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUkV4ZWN1dG9yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiUkV4ZWN1dG9yLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUlBLE9BQU8sWUFBWSxNQUFNLG1CQUFtQixDQUFDO0FBRzdDLE1BQU0sQ0FBQyxPQUFPLE9BQU8sU0FBVSxTQUFRLFlBQVk7SUFJbEQsWUFBWSxRQUEwQixFQUFFLElBQVk7UUFDbkQsbURBQW1EO1FBQ25ELE1BQU0sSUFBSSxHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7UUFFN0QsSUFBSSxVQUFVLEdBQUcsdUJBQXVCLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7UUFFbEYsdUJBQXVCO1FBQ3ZCLHFHQUFxRztRQUNyRyxpRkFBaUY7UUFDakYsK0JBQStCO1FBQy9CLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSTtRQUNoQixLQUFLO1FBQ0wsR0FBRyxVQUFVLHdFQUF3RSxVQUFVLGFBQWEsQ0FDNUcsQ0FBQTtRQUdELEtBQUssQ0FBQyxRQUFRLEVBQUUsUUFBUSxDQUFDLEtBQUssRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQ2xELENBQUM7SUFFRDs7T0FFRztJQUNILEtBQUssQ0FBQyxLQUFLO1FBQ1YsT0FBTyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUNyQixpQ0FBaUM7SUFDbEMsQ0FBQztJQUVELFFBQVEsQ0FBQyxJQUFZLEVBQUUsV0FBbUI7UUFDekMsT0FBTzs7d0JBRWUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUM7Ozs7Ozs7U0FPbkMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUM7O0tBRS9CLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxFQUFFLENBQUM7WUFDeEIsSUFBSSxDQUFDO0lBQ1AsQ0FBQztJQUVELGFBQWEsQ0FBQyxNQUFjLEVBQUUsTUFBMkI7UUFDeEQsT0FBTyxNQUFNLENBQUM7SUFDZixDQUFDO0NBRUQiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0NoaWxkUHJvY2Vzc1dpdGhvdXROdWxsU3RyZWFtcywgc3Bhd259IGZyb20gXCJjaGlsZF9wcm9jZXNzXCI7XHJcbmltcG9ydCB7T3V0cHV0dGVyfSBmcm9tIFwic3JjL291dHB1dC9PdXRwdXR0ZXJcIjtcclxuaW1wb3J0IHtFeGVjdXRvclNldHRpbmdzfSBmcm9tIFwic3JjL3NldHRpbmdzL1NldHRpbmdzXCI7XHJcbmltcG9ydCBBc3luY0V4ZWN1dG9yIGZyb20gXCIuL0FzeW5jRXhlY3V0b3JcIjtcclxuaW1wb3J0IFJlcGxFeGVjdXRvciBmcm9tIFwiLi9SZXBsRXhlY3V0b3IuanNcIjtcclxuXHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBSRXhlY3V0b3IgZXh0ZW5kcyBSZXBsRXhlY3V0b3Ige1xyXG5cclxuXHRwcm9jZXNzOiBDaGlsZFByb2Nlc3NXaXRob3V0TnVsbFN0cmVhbXNcclxuXHJcblx0Y29uc3RydWN0b3Ioc2V0dGluZ3M6IEV4ZWN1dG9yU2V0dGluZ3MsIGZpbGU6IHN0cmluZykge1xyXG5cdFx0Ly91c2UgZW1wdHkgYXJyYXkgZm9yIGVtcHR5IHN0cmluZywgaW5zdGVhZCBvZiBbXCJcIl1cclxuXHRcdGNvbnN0IGFyZ3MgPSBzZXR0aW5ncy5SQXJncyA/IHNldHRpbmdzLlJBcmdzLnNwbGl0KFwiIFwiKSA6IFtdO1xyXG5cdFx0XHJcblx0XHRsZXQgY29uQXJnTmFtZSA9IGBub3RlYm9va19jb25uZWN0aW9uXyR7TWF0aC5yYW5kb20oKS50b1N0cmluZygxNikuc3Vic3RyaW5nKDIpfWA7XHJcblxyXG5cdFx0Ly8gVGhpcyBpcyB0aGUgUiByZXBsLiBcclxuXHRcdC8vIEl0J3MgY29kZWQgYnkgaXRzZWxmIGJlY2F1c2UgUnNjcmlwdCBoYXMgbm8gUkVQTCwgYW5kIGFkZGluZyBhbiBhZGRpdGlvbmFsIGRlcCBvbiBSIHdvdWxkIGJlIGxhenkuXHJcblx0XHQvL0l0IGRvZXNuJ3QgaGFuZGxlIHByaW50aW5nIGJ5IGl0c2VsZiBiZWNhdXNlIG9mIHRoZSBuZWVkIHRvIHByaW50IHRoZSBzaWdpbCwgc29cclxuXHRcdC8vICAgaXQncyByZWFsbHkgbW9yZSBvZiBhIFJFTC5cclxuXHRcdGFyZ3MudW5zaGlmdChgLWVgLCBcclxuXHRcdFx0LypSKi9cclxuXHRcdFx0YCR7Y29uQXJnTmFtZX09ZmlsZShcInN0ZGluXCIsIFwiclwiKTsgd2hpbGUoMSkgeyBldmFsKHBhcnNlKHRleHQ9dGFpbChyZWFkTGluZXMoY29uID0gJHtjb25BcmdOYW1lfSwgbj0xKSkpKSB9YFxyXG5cdFx0KVxyXG5cdFx0XHJcblxyXG5cdFx0c3VwZXIoc2V0dGluZ3MsIHNldHRpbmdzLlJQYXRoLCBhcmdzLCBmaWxlLCBcInJcIik7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBXcml0ZXMgYSBzaW5nbGUgbmV3bGluZSB0byBlbnN1cmUgdGhhdCB0aGUgc3RkaW4gaXMgc2V0IHVwIGNvcnJlY3RseS5cclxuXHQgKi9cclxuXHRhc3luYyBzZXR1cCgpIHtcclxuXHRcdGNvbnNvbGUubG9nKFwic2V0dXBcIik7XHJcblx0XHQvL3RoaXMucHJvY2Vzcy5zdGRpbi53cml0ZShcIlxcblwiKTtcclxuXHR9XHJcblx0XHJcblx0d3JhcENvZGUoY29kZTogc3RyaW5nLCBmaW5pc2hTaWdpbDogc3RyaW5nKTogc3RyaW5nIHtcdFx0XHJcblx0XHRyZXR1cm4gYHRyeUNhdGNoKHtcclxuXHRcdFx0Y2F0KHNwcmludGYoXCIlc1wiLCBcclxuXHRcdFx0XHRldmFsKHBhcnNlKHRleHQgPSAke0pTT04uc3RyaW5naWZ5KGNvZGUpfSApKVxyXG5cdFx0XHQpKVxyXG5cdFx0fSxcclxuXHRcdGVycm9yID0gZnVuY3Rpb24oZSl7XHJcblx0XHRcdGNhdChzcHJpbnRmKFwiJXNcIiwgZSksIGZpbGU9c3RkZXJyKCkpXHJcblx0XHR9LCBcclxuXHRcdGZpbmFsbHkgPSB7XHJcblx0XHRcdGNhdCgke0pTT04uc3RyaW5naWZ5KGZpbmlzaFNpZ2lsKX0pO1xyXG5cdFx0XHRmbHVzaC5jb25zb2xlKClcclxuXHRcdH0pYC5yZXBsYWNlKC9cXHI/XFxuL2csIFwiXCIpICtcclxuXHRcdFx0XCJcXG5cIjtcclxuXHR9XHJcblx0XHJcblx0cmVtb3ZlUHJvbXB0cyhvdXRwdXQ6IHN0cmluZywgc291cmNlOiBcInN0ZG91dFwiIHwgXCJzdGRlcnJcIik6IHN0cmluZyB7XHJcblx0XHRyZXR1cm4gb3V0cHV0O1xyXG5cdH1cclxuXHJcbn1cclxuIl19