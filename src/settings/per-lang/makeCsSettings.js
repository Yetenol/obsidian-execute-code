import { Setting } from "obsidian";
export default (tab, containerEl) => {
    containerEl.createEl('h3', { text: 'CSharp Settings' });
    new Setting(containerEl)
        .setName('dotnet path')
        .addText(text => text
        .setValue(tab.plugin.settings.csPath)
        .onChange(async (value) => {
        const sanitized = tab.sanitizePath(value);
        tab.plugin.settings.csPath = sanitized;
        console.log('dotnet path set to: ' + sanitized);
        await tab.plugin.saveSettings();
    }));
    new Setting(containerEl)
        .setName('CSharp arguments')
        .addText(text => text
        .setValue(tab.plugin.settings.csArgs)
        .onChange(async (value) => {
        tab.plugin.settings.csArgs = value;
        console.log('CSharp args set to: ' + value);
        await tab.plugin.saveSettings();
    }));
    tab.makeInjectSetting(containerEl, "cs");
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFrZUNzU2V0dGluZ3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJtYWtlQ3NTZXR0aW5ncy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sVUFBVSxDQUFDO0FBR25DLGVBQWUsQ0FBQyxHQUFnQixFQUFFLFdBQXdCLEVBQUUsRUFBRTtJQUMxRCxXQUFXLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxFQUFFLElBQUksRUFBRSxpQkFBaUIsRUFBRSxDQUFDLENBQUM7SUFDeEQsSUFBSSxPQUFPLENBQUMsV0FBVyxDQUFDO1NBQ25CLE9BQU8sQ0FBQyxhQUFhLENBQUM7U0FDdEIsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSTtTQUNoQixRQUFRLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDO1NBQ3BDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLEVBQUU7UUFDdEIsTUFBTSxTQUFTLEdBQUcsR0FBRyxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUMxQyxHQUFHLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEdBQUcsU0FBUyxDQUFDO1FBQ3ZDLE9BQU8sQ0FBQyxHQUFHLENBQUMsc0JBQXNCLEdBQUcsU0FBUyxDQUFDLENBQUM7UUFDaEQsTUFBTSxHQUFHLENBQUMsTUFBTSxDQUFDLFlBQVksRUFBRSxDQUFDO0lBQ3BDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDWixJQUFJLE9BQU8sQ0FBQyxXQUFXLENBQUM7U0FDbkIsT0FBTyxDQUFDLGtCQUFrQixDQUFDO1NBQzNCLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUk7U0FDaEIsUUFBUSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQztTQUNwQyxRQUFRLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxFQUFFO1FBQ3RCLEdBQUcsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUM7UUFDbkMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxzQkFBc0IsR0FBRyxLQUFLLENBQUMsQ0FBQztRQUM1QyxNQUFNLEdBQUcsQ0FBQyxNQUFNLENBQUMsWUFBWSxFQUFFLENBQUM7SUFDcEMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNaLEdBQUcsQ0FBQyxpQkFBaUIsQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDN0MsQ0FBQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgU2V0dGluZyB9IGZyb20gXCJvYnNpZGlhblwiO1xyXG5pbXBvcnQgeyBTZXR0aW5nc1RhYiB9IGZyb20gXCIuLi9TZXR0aW5nc1RhYlwiO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgKHRhYjogU2V0dGluZ3NUYWIsIGNvbnRhaW5lckVsOiBIVE1MRWxlbWVudCkgPT4ge1xyXG4gICAgY29udGFpbmVyRWwuY3JlYXRlRWwoJ2gzJywgeyB0ZXh0OiAnQ1NoYXJwIFNldHRpbmdzJyB9KTtcclxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxyXG4gICAgICAgIC5zZXROYW1lKCdkb3RuZXQgcGF0aCcpXHJcbiAgICAgICAgLmFkZFRleHQodGV4dCA9PiB0ZXh0XHJcbiAgICAgICAgICAgIC5zZXRWYWx1ZSh0YWIucGx1Z2luLnNldHRpbmdzLmNzUGF0aClcclxuICAgICAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgY29uc3Qgc2FuaXRpemVkID0gdGFiLnNhbml0aXplUGF0aCh2YWx1ZSk7XHJcbiAgICAgICAgICAgICAgICB0YWIucGx1Z2luLnNldHRpbmdzLmNzUGF0aCA9IHNhbml0aXplZDtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdkb3RuZXQgcGF0aCBzZXQgdG86ICcgKyBzYW5pdGl6ZWQpO1xyXG4gICAgICAgICAgICAgICAgYXdhaXQgdGFiLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcclxuICAgICAgICAgICAgfSkpO1xyXG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXHJcbiAgICAgICAgLnNldE5hbWUoJ0NTaGFycCBhcmd1bWVudHMnKVxyXG4gICAgICAgIC5hZGRUZXh0KHRleHQgPT4gdGV4dFxyXG4gICAgICAgICAgICAuc2V0VmFsdWUodGFiLnBsdWdpbi5zZXR0aW5ncy5jc0FyZ3MpXHJcbiAgICAgICAgICAgIC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcclxuICAgICAgICAgICAgICAgIHRhYi5wbHVnaW4uc2V0dGluZ3MuY3NBcmdzID0gdmFsdWU7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnQ1NoYXJwIGFyZ3Mgc2V0IHRvOiAnICsgdmFsdWUpO1xyXG4gICAgICAgICAgICAgICAgYXdhaXQgdGFiLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcclxuICAgICAgICAgICAgfSkpO1xyXG4gICAgdGFiLm1ha2VJbmplY3RTZXR0aW5nKGNvbnRhaW5lckVsLCBcImNzXCIpO1xyXG59Il19