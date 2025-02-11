import { Setting } from "obsidian";
export default (tab, containerEl) => {
    containerEl.createEl('h3', { text: 'Octave Settings' });
    new Setting(containerEl)
        .setName('Octave path')
        .setDesc('The path to your Octave installation.')
        .addText(text => text
        .setValue(tab.plugin.settings.octavePath)
        .onChange(async (value) => {
        const sanitized = tab.sanitizePath(value);
        tab.plugin.settings.octavePath = sanitized;
        console.log('Octave path set to: ' + sanitized);
        await tab.plugin.saveSettings();
    }));
    new Setting(containerEl)
        .setName('Octave arguments')
        .addText(text => text
        .setValue(tab.plugin.settings.octaveArgs)
        .onChange(async (value) => {
        tab.plugin.settings.octaveArgs = value;
        console.log('Octave args set to: ' + value);
        await tab.plugin.saveSettings();
    }));
    tab.makeInjectSetting(containerEl, "octave");
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFrZU9jdGF2ZVNldHRpbmdzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsibWFrZU9jdGF2ZVNldHRpbmdzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFHbkMsZUFBZSxDQUFDLEdBQWdCLEVBQUUsV0FBd0IsRUFBRSxFQUFFO0lBQzFELFdBQVcsQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLEVBQUUsSUFBSSxFQUFFLGlCQUFpQixFQUFFLENBQUMsQ0FBQztJQUN4RCxJQUFJLE9BQU8sQ0FBQyxXQUFXLENBQUM7U0FDbkIsT0FBTyxDQUFDLGFBQWEsQ0FBQztTQUN0QixPQUFPLENBQUMsdUNBQXVDLENBQUM7U0FDaEQsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSTtTQUNoQixRQUFRLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDO1NBQ3hDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLEVBQUU7UUFDdEIsTUFBTSxTQUFTLEdBQUcsR0FBRyxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUMxQyxHQUFHLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxVQUFVLEdBQUcsU0FBUyxDQUFDO1FBQzNDLE9BQU8sQ0FBQyxHQUFHLENBQUMsc0JBQXNCLEdBQUcsU0FBUyxDQUFDLENBQUM7UUFDaEQsTUFBTSxHQUFHLENBQUMsTUFBTSxDQUFDLFlBQVksRUFBRSxDQUFDO0lBQ3BDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDWixJQUFJLE9BQU8sQ0FBQyxXQUFXLENBQUM7U0FDbkIsT0FBTyxDQUFDLGtCQUFrQixDQUFDO1NBQzNCLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUk7U0FDaEIsUUFBUSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQztTQUN4QyxRQUFRLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxFQUFFO1FBQ3RCLEdBQUcsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLFVBQVUsR0FBRyxLQUFLLENBQUM7UUFDdkMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxzQkFBc0IsR0FBRyxLQUFLLENBQUMsQ0FBQztRQUM1QyxNQUFNLEdBQUcsQ0FBQyxNQUFNLENBQUMsWUFBWSxFQUFFLENBQUM7SUFDcEMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNaLEdBQUcsQ0FBQyxpQkFBaUIsQ0FBQyxXQUFXLEVBQUUsUUFBUSxDQUFDLENBQUM7QUFDakQsQ0FBQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgU2V0dGluZyB9IGZyb20gXCJvYnNpZGlhblwiO1xyXG5pbXBvcnQgeyBTZXR0aW5nc1RhYiB9IGZyb20gXCIuLi9TZXR0aW5nc1RhYlwiO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgKHRhYjogU2V0dGluZ3NUYWIsIGNvbnRhaW5lckVsOiBIVE1MRWxlbWVudCkgPT4ge1xyXG4gICAgY29udGFpbmVyRWwuY3JlYXRlRWwoJ2gzJywgeyB0ZXh0OiAnT2N0YXZlIFNldHRpbmdzJyB9KTtcclxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxyXG4gICAgICAgIC5zZXROYW1lKCdPY3RhdmUgcGF0aCcpXHJcbiAgICAgICAgLnNldERlc2MoJ1RoZSBwYXRoIHRvIHlvdXIgT2N0YXZlIGluc3RhbGxhdGlvbi4nKVxyXG4gICAgICAgIC5hZGRUZXh0KHRleHQgPT4gdGV4dFxyXG4gICAgICAgICAgICAuc2V0VmFsdWUodGFiLnBsdWdpbi5zZXR0aW5ncy5vY3RhdmVQYXRoKVxyXG4gICAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBzYW5pdGl6ZWQgPSB0YWIuc2FuaXRpemVQYXRoKHZhbHVlKTtcclxuICAgICAgICAgICAgICAgIHRhYi5wbHVnaW4uc2V0dGluZ3Mub2N0YXZlUGF0aCA9IHNhbml0aXplZDtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdPY3RhdmUgcGF0aCBzZXQgdG86ICcgKyBzYW5pdGl6ZWQpO1xyXG4gICAgICAgICAgICAgICAgYXdhaXQgdGFiLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcclxuICAgICAgICAgICAgfSkpO1xyXG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXHJcbiAgICAgICAgLnNldE5hbWUoJ09jdGF2ZSBhcmd1bWVudHMnKVxyXG4gICAgICAgIC5hZGRUZXh0KHRleHQgPT4gdGV4dFxyXG4gICAgICAgICAgICAuc2V0VmFsdWUodGFiLnBsdWdpbi5zZXR0aW5ncy5vY3RhdmVBcmdzKVxyXG4gICAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0YWIucGx1Z2luLnNldHRpbmdzLm9jdGF2ZUFyZ3MgPSB2YWx1ZTtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdPY3RhdmUgYXJncyBzZXQgdG86ICcgKyB2YWx1ZSk7XHJcbiAgICAgICAgICAgICAgICBhd2FpdCB0YWIucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xyXG4gICAgICAgICAgICB9KSk7XHJcbiAgICB0YWIubWFrZUluamVjdFNldHRpbmcoY29udGFpbmVyRWwsIFwib2N0YXZlXCIpO1xyXG59XHJcbiJdfQ==