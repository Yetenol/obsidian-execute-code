import { Setting } from "obsidian";
export default (tab, containerEl) => {
    containerEl.createEl('h3', { text: 'Python Settings' });
    new Setting(containerEl)
        .setName('Embed Python Plots')
        .addToggle(toggle => toggle
        .setValue(tab.plugin.settings.pythonEmbedPlots)
        .onChange(async (value) => {
        tab.plugin.settings.pythonEmbedPlots = value;
        console.log(value ? 'Embedding Plots into Notes.' : "Not embedding Plots into Notes.");
        await tab.plugin.saveSettings();
    }));
    new Setting(containerEl)
        .setName('Python path')
        .setDesc('The path to your Python installation.')
        .addText(text => text
        .setValue(tab.plugin.settings.pythonPath)
        .onChange(async (value) => {
        const sanitized = tab.sanitizePath(value);
        tab.plugin.settings.pythonPath = sanitized;
        console.log('Python path set to: ' + sanitized);
        await tab.plugin.saveSettings();
    }));
    new Setting(containerEl)
        .setName('Python arguments')
        .addText(text => text
        .setValue(tab.plugin.settings.pythonArgs)
        .onChange(async (value) => {
        tab.plugin.settings.pythonArgs = value;
        console.log('Python args set to: ' + value);
        await tab.plugin.saveSettings();
    }));
    new Setting(containerEl)
        .setName("Run Python blocks in Notebook Mode")
        .addToggle((toggle) => toggle
        .setValue(tab.plugin.settings.pythonInteractive)
        .onChange(async (value) => {
        tab.plugin.settings.pythonInteractive = value;
        await tab.plugin.saveSettings();
    }));
    tab.makeInjectSetting(containerEl, "python");
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFrZVB5dGhvblNldHRpbmdzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsibWFrZVB5dGhvblNldHRpbmdzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFHbkMsZUFBZSxDQUFDLEdBQWdCLEVBQUUsV0FBd0IsRUFBRSxFQUFFO0lBQzFELFdBQVcsQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLEVBQUUsSUFBSSxFQUFFLGlCQUFpQixFQUFFLENBQUMsQ0FBQztJQUN4RCxJQUFJLE9BQU8sQ0FBQyxXQUFXLENBQUM7U0FDbkIsT0FBTyxDQUFDLG9CQUFvQixDQUFDO1NBQzdCLFNBQVMsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLE1BQU07U0FDdEIsUUFBUSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLGdCQUFnQixDQUFDO1NBQzlDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLEVBQUU7UUFDdEIsR0FBRyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsZ0JBQWdCLEdBQUcsS0FBSyxDQUFDO1FBQzdDLE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyw2QkFBNkIsQ0FBQyxDQUFDLENBQUMsaUNBQWlDLENBQUMsQ0FBQztRQUN2RixNQUFNLEdBQUcsQ0FBQyxNQUFNLENBQUMsWUFBWSxFQUFFLENBQUM7SUFDcEMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNaLElBQUksT0FBTyxDQUFDLFdBQVcsQ0FBQztTQUNuQixPQUFPLENBQUMsYUFBYSxDQUFDO1NBQ3RCLE9BQU8sQ0FBQyx1Q0FBdUMsQ0FBQztTQUNoRCxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJO1NBQ2hCLFFBQVEsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUM7U0FDeEMsUUFBUSxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsRUFBRTtRQUN0QixNQUFNLFNBQVMsR0FBRyxHQUFHLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQzFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLFVBQVUsR0FBRyxTQUFTLENBQUM7UUFDM0MsT0FBTyxDQUFDLEdBQUcsQ0FBQyxzQkFBc0IsR0FBRyxTQUFTLENBQUMsQ0FBQztRQUNoRCxNQUFNLEdBQUcsQ0FBQyxNQUFNLENBQUMsWUFBWSxFQUFFLENBQUM7SUFDcEMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNaLElBQUksT0FBTyxDQUFDLFdBQVcsQ0FBQztTQUNuQixPQUFPLENBQUMsa0JBQWtCLENBQUM7U0FDM0IsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSTtTQUNoQixRQUFRLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDO1NBQ3hDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLEVBQUU7UUFDdEIsR0FBRyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsVUFBVSxHQUFHLEtBQUssQ0FBQztRQUN2QyxPQUFPLENBQUMsR0FBRyxDQUFDLHNCQUFzQixHQUFHLEtBQUssQ0FBQyxDQUFDO1FBQzVDLE1BQU0sR0FBRyxDQUFDLE1BQU0sQ0FBQyxZQUFZLEVBQUUsQ0FBQztJQUNwQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ1osSUFBSSxPQUFPLENBQUMsV0FBVyxDQUFDO1NBQ25CLE9BQU8sQ0FBQyxvQ0FBb0MsQ0FBQztTQUM3QyxTQUFTLENBQUMsQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLE1BQU07U0FDeEIsUUFBUSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLGlCQUFpQixDQUFDO1NBQy9DLFFBQVEsQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLEVBQUU7UUFDdEIsR0FBRyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsaUJBQWlCLEdBQUcsS0FBSyxDQUFDO1FBQzlDLE1BQU0sR0FBRyxDQUFDLE1BQU0sQ0FBQyxZQUFZLEVBQUUsQ0FBQztJQUNwQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ1osR0FBRyxDQUFDLGlCQUFpQixDQUFDLFdBQVcsRUFBRSxRQUFRLENBQUMsQ0FBQztBQUNqRCxDQUFDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBTZXR0aW5nIH0gZnJvbSBcIm9ic2lkaWFuXCI7XHJcbmltcG9ydCB7IFNldHRpbmdzVGFiIH0gZnJvbSBcIi4uL1NldHRpbmdzVGFiXCI7XHJcblxyXG5leHBvcnQgZGVmYXVsdCAodGFiOiBTZXR0aW5nc1RhYiwgY29udGFpbmVyRWw6IEhUTUxFbGVtZW50KSA9PiB7XHJcbiAgICBjb250YWluZXJFbC5jcmVhdGVFbCgnaDMnLCB7IHRleHQ6ICdQeXRob24gU2V0dGluZ3MnIH0pO1xyXG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXHJcbiAgICAgICAgLnNldE5hbWUoJ0VtYmVkIFB5dGhvbiBQbG90cycpXHJcbiAgICAgICAgLmFkZFRvZ2dsZSh0b2dnbGUgPT4gdG9nZ2xlXHJcbiAgICAgICAgICAgIC5zZXRWYWx1ZSh0YWIucGx1Z2luLnNldHRpbmdzLnB5dGhvbkVtYmVkUGxvdHMpXHJcbiAgICAgICAgICAgIC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcclxuICAgICAgICAgICAgICAgIHRhYi5wbHVnaW4uc2V0dGluZ3MucHl0aG9uRW1iZWRQbG90cyA9IHZhbHVlO1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2codmFsdWUgPyAnRW1iZWRkaW5nIFBsb3RzIGludG8gTm90ZXMuJyA6IFwiTm90IGVtYmVkZGluZyBQbG90cyBpbnRvIE5vdGVzLlwiKTtcclxuICAgICAgICAgICAgICAgIGF3YWl0IHRhYi5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XHJcbiAgICAgICAgICAgIH0pKTtcclxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxyXG4gICAgICAgIC5zZXROYW1lKCdQeXRob24gcGF0aCcpXHJcbiAgICAgICAgLnNldERlc2MoJ1RoZSBwYXRoIHRvIHlvdXIgUHl0aG9uIGluc3RhbGxhdGlvbi4nKVxyXG4gICAgICAgIC5hZGRUZXh0KHRleHQgPT4gdGV4dFxyXG4gICAgICAgICAgICAuc2V0VmFsdWUodGFiLnBsdWdpbi5zZXR0aW5ncy5weXRob25QYXRoKVxyXG4gICAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBzYW5pdGl6ZWQgPSB0YWIuc2FuaXRpemVQYXRoKHZhbHVlKTtcclxuICAgICAgICAgICAgICAgIHRhYi5wbHVnaW4uc2V0dGluZ3MucHl0aG9uUGF0aCA9IHNhbml0aXplZDtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdQeXRob24gcGF0aCBzZXQgdG86ICcgKyBzYW5pdGl6ZWQpO1xyXG4gICAgICAgICAgICAgICAgYXdhaXQgdGFiLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcclxuICAgICAgICAgICAgfSkpO1xyXG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXHJcbiAgICAgICAgLnNldE5hbWUoJ1B5dGhvbiBhcmd1bWVudHMnKVxyXG4gICAgICAgIC5hZGRUZXh0KHRleHQgPT4gdGV4dFxyXG4gICAgICAgICAgICAuc2V0VmFsdWUodGFiLnBsdWdpbi5zZXR0aW5ncy5weXRob25BcmdzKVxyXG4gICAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0YWIucGx1Z2luLnNldHRpbmdzLnB5dGhvbkFyZ3MgPSB2YWx1ZTtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdQeXRob24gYXJncyBzZXQgdG86ICcgKyB2YWx1ZSk7XHJcbiAgICAgICAgICAgICAgICBhd2FpdCB0YWIucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xyXG4gICAgICAgICAgICB9KSk7XHJcbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcclxuICAgICAgICAuc2V0TmFtZShcIlJ1biBQeXRob24gYmxvY2tzIGluIE5vdGVib29rIE1vZGVcIilcclxuICAgICAgICAuYWRkVG9nZ2xlKCh0b2dnbGUpID0+IHRvZ2dsZVxyXG4gICAgICAgICAgICAuc2V0VmFsdWUodGFiLnBsdWdpbi5zZXR0aW5ncy5weXRob25JbnRlcmFjdGl2ZSlcclxuICAgICAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGFiLnBsdWdpbi5zZXR0aW5ncy5weXRob25JbnRlcmFjdGl2ZSA9IHZhbHVlO1xyXG4gICAgICAgICAgICAgICAgYXdhaXQgdGFiLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcclxuICAgICAgICAgICAgfSkpO1xyXG4gICAgdGFiLm1ha2VJbmplY3RTZXR0aW5nKGNvbnRhaW5lckVsLCBcInB5dGhvblwiKTtcclxufSJdfQ==