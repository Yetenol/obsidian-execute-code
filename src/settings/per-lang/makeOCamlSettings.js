import { Setting } from "obsidian";
export default (tab, containerEl) => {
    containerEl.createEl('h3', { text: 'OCaml Settings' });
    new Setting(containerEl)
        .setName('ocaml path')
        .setDesc("Path to your ocaml installation")
        .addText(text => text
        .setValue(tab.plugin.settings.ocamlPath)
        .onChange(async (value) => {
        const sanitized = tab.sanitizePath(value);
        tab.plugin.settings.ocamlPath = sanitized;
        console.log('ocaml path set to: ' + sanitized);
        await tab.plugin.saveSettings();
    }));
    new Setting(containerEl)
        .setName('ocaml arguments')
        .addText(text => text
        .setValue(tab.plugin.settings.ocamlArgs)
        .onChange(async (value) => {
        tab.plugin.settings.ocamlArgs = value;
        console.log('ocaml args set to: ' + value);
        await tab.plugin.saveSettings();
    }));
    tab.makeInjectSetting(containerEl, "ocaml");
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFrZU9DYW1sU2V0dGluZ3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJtYWtlT0NhbWxTZXR0aW5ncy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sVUFBVSxDQUFDO0FBR25DLGVBQWUsQ0FBQyxHQUFnQixFQUFFLFdBQXdCLEVBQUUsRUFBRTtJQUMxRCxXQUFXLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxFQUFFLElBQUksRUFBRSxnQkFBZ0IsRUFBRSxDQUFDLENBQUM7SUFDdkQsSUFBSSxPQUFPLENBQUMsV0FBVyxDQUFDO1NBQ25CLE9BQU8sQ0FBQyxZQUFZLENBQUM7U0FDckIsT0FBTyxDQUFDLGlDQUFpQyxDQUFDO1NBQzFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUk7U0FDaEIsUUFBUSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQztTQUN2QyxRQUFRLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxFQUFFO1FBQ3RCLE1BQU0sU0FBUyxHQUFHLEdBQUcsQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDMUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQztRQUMxQyxPQUFPLENBQUMsR0FBRyxDQUFDLHFCQUFxQixHQUFHLFNBQVMsQ0FBQyxDQUFDO1FBQy9DLE1BQU0sR0FBRyxDQUFDLE1BQU0sQ0FBQyxZQUFZLEVBQUUsQ0FBQztJQUNwQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ1osSUFBSSxPQUFPLENBQUMsV0FBVyxDQUFDO1NBQ25CLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQztTQUMxQixPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJO1NBQ2hCLFFBQVEsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUM7U0FDdkMsUUFBUSxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsRUFBRTtRQUN0QixHQUFHLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFDO1FBQ3RDLE9BQU8sQ0FBQyxHQUFHLENBQUMscUJBQXFCLEdBQUcsS0FBSyxDQUFDLENBQUM7UUFDM0MsTUFBTSxHQUFHLENBQUMsTUFBTSxDQUFDLFlBQVksRUFBRSxDQUFDO0lBQ3BDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDWixHQUFHLENBQUMsaUJBQWlCLENBQUMsV0FBVyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0FBQ2hELENBQUMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFNldHRpbmcgfSBmcm9tIFwib2JzaWRpYW5cIjtcclxuaW1wb3J0IHsgU2V0dGluZ3NUYWIgfSBmcm9tIFwiLi4vU2V0dGluZ3NUYWJcIjtcclxuXHJcbmV4cG9ydCBkZWZhdWx0ICh0YWI6IFNldHRpbmdzVGFiLCBjb250YWluZXJFbDogSFRNTEVsZW1lbnQpID0+IHtcclxuICAgIGNvbnRhaW5lckVsLmNyZWF0ZUVsKCdoMycsIHsgdGV4dDogJ09DYW1sIFNldHRpbmdzJyB9KTtcclxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxyXG4gICAgICAgIC5zZXROYW1lKCdvY2FtbCBwYXRoJylcclxuICAgICAgICAuc2V0RGVzYyhcIlBhdGggdG8geW91ciBvY2FtbCBpbnN0YWxsYXRpb25cIilcclxuICAgICAgICAuYWRkVGV4dCh0ZXh0ID0+IHRleHRcclxuICAgICAgICAgICAgLnNldFZhbHVlKHRhYi5wbHVnaW4uc2V0dGluZ3Mub2NhbWxQYXRoKVxyXG4gICAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBzYW5pdGl6ZWQgPSB0YWIuc2FuaXRpemVQYXRoKHZhbHVlKTtcclxuICAgICAgICAgICAgICAgIHRhYi5wbHVnaW4uc2V0dGluZ3Mub2NhbWxQYXRoID0gc2FuaXRpemVkO1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ29jYW1sIHBhdGggc2V0IHRvOiAnICsgc2FuaXRpemVkKTtcclxuICAgICAgICAgICAgICAgIGF3YWl0IHRhYi5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XHJcbiAgICAgICAgICAgIH0pKTtcclxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxyXG4gICAgICAgIC5zZXROYW1lKCdvY2FtbCBhcmd1bWVudHMnKVxyXG4gICAgICAgIC5hZGRUZXh0KHRleHQgPT4gdGV4dFxyXG4gICAgICAgICAgICAuc2V0VmFsdWUodGFiLnBsdWdpbi5zZXR0aW5ncy5vY2FtbEFyZ3MpXHJcbiAgICAgICAgICAgIC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcclxuICAgICAgICAgICAgICAgIHRhYi5wbHVnaW4uc2V0dGluZ3Mub2NhbWxBcmdzID0gdmFsdWU7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnb2NhbWwgYXJncyBzZXQgdG86ICcgKyB2YWx1ZSk7XHJcbiAgICAgICAgICAgICAgICBhd2FpdCB0YWIucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xyXG4gICAgICAgICAgICB9KSk7XHJcbiAgICB0YWIubWFrZUluamVjdFNldHRpbmcoY29udGFpbmVyRWwsIFwib2NhbWxcIik7XHJcbn1cclxuIl19