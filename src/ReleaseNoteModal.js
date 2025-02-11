import { Component, MarkdownRenderer, Modal } from "obsidian";
export class ReleaseNoteModel extends Modal {
    constructor(app) {
        super(app);
        this.component = new Component();
    }
    onOpen() {
        let text = '# Release Note: Execute Code Plugin v2.0.0\n\n' +
            'We are happy to announce the release of version 2.0.0. This release brings a special change: You can now make ' +
            'the output of your code blocks persistent.' +
            'If enabled, the output of your code blocks will be saved in the markdown file and will also be exported to PDF.' +
            '\n\n\n' +
            'You can enable this in the settings. Be aware that this feature is still experimental and might not work as expected. ' +
            'Check the [github page](https://github.com/twibiral/obsidian-execute-code) for more information.' +
            '\n\n\n' +
            'Thank you for using the Execute Code Plugin! ' +
            '[Here you can find a detailed change log.](https://github.com/twibiral/obsidian-execute-code/blob/master/CHANGELOG.md)' +
            '\n\n\n' +
            'If you enjoy using the plugin, consider supporting the development via [PayPal](https://www.paypal.com/paypalme/timwibiral) or [Buy Me a Coffee](https://www.buymeacoffee.com/twibiral).';
        this.component.load();
        MarkdownRenderer.render(this.app, text, this.contentEl, this.app.workspace.getActiveFile().path, this.component);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVsZWFzZU5vdGVNb2RhbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIlJlbGVhc2VOb3RlTW9kYWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFNLFNBQVMsRUFBRSxnQkFBZ0IsRUFBRSxLQUFLLEVBQUMsTUFBTSxVQUFVLENBQUM7QUFFakUsTUFBTSxPQUFPLGdCQUFpQixTQUFRLEtBQUs7SUFHMUMsWUFBWSxHQUFRO1FBQ25CLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNYLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxTQUFTLEVBQUUsQ0FBQztJQUNsQyxDQUFDO0lBRUQsTUFBTTtRQUNMLElBQUksSUFBSSxHQUFJLGdEQUFnRDtZQUM1RCxnSEFBZ0g7WUFDaEgsNENBQTRDO1lBQzVDLGlIQUFpSDtZQUNqSCxRQUFRO1lBQ1Isd0hBQXdIO1lBQ3hILGtHQUFrRztZQUNsRyxRQUFRO1lBQ1IsK0NBQStDO1lBQy9DLHdIQUF3SDtZQUN4SCxRQUFRO1lBQ1IsMExBQTBMLENBQUE7UUFFMUwsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUN0QixnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxhQUFhLEVBQUUsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQ2xILENBQUM7Q0FDRCIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7QXBwLCBDb21wb25lbnQsIE1hcmtkb3duUmVuZGVyZXIsIE1vZGFsfSBmcm9tIFwib2JzaWRpYW5cIjtcclxuXHJcbmV4cG9ydCBjbGFzcyBSZWxlYXNlTm90ZU1vZGVsIGV4dGVuZHMgTW9kYWwge1xyXG5cdHByaXZhdGUgY29tcG9uZW50OiBDb21wb25lbnQ7XHJcblxyXG5cdGNvbnN0cnVjdG9yKGFwcDogQXBwKSB7XHJcblx0XHRzdXBlcihhcHApO1xyXG5cdFx0dGhpcy5jb21wb25lbnQgPSBuZXcgQ29tcG9uZW50KCk7XHJcblx0fVxyXG5cclxuXHRvbk9wZW4oKSB7XHJcblx0XHRsZXQgdGV4dCA9ICAnIyBSZWxlYXNlIE5vdGU6IEV4ZWN1dGUgQ29kZSBQbHVnaW4gdjIuMC4wXFxuXFxuJytcclxuXHRcdCdXZSBhcmUgaGFwcHkgdG8gYW5ub3VuY2UgdGhlIHJlbGVhc2Ugb2YgdmVyc2lvbiAyLjAuMC4gVGhpcyByZWxlYXNlIGJyaW5ncyBhIHNwZWNpYWwgY2hhbmdlOiBZb3UgY2FuIG5vdyBtYWtlICcgK1xyXG5cdFx0J3RoZSBvdXRwdXQgb2YgeW91ciBjb2RlIGJsb2NrcyBwZXJzaXN0ZW50LicgK1xyXG5cdFx0J0lmIGVuYWJsZWQsIHRoZSBvdXRwdXQgb2YgeW91ciBjb2RlIGJsb2NrcyB3aWxsIGJlIHNhdmVkIGluIHRoZSBtYXJrZG93biBmaWxlIGFuZCB3aWxsIGFsc28gYmUgZXhwb3J0ZWQgdG8gUERGLicgK1xyXG5cdFx0J1xcblxcblxcbicgK1xyXG5cdFx0J1lvdSBjYW4gZW5hYmxlIHRoaXMgaW4gdGhlIHNldHRpbmdzLiBCZSBhd2FyZSB0aGF0IHRoaXMgZmVhdHVyZSBpcyBzdGlsbCBleHBlcmltZW50YWwgYW5kIG1pZ2h0IG5vdCB3b3JrIGFzIGV4cGVjdGVkLiAnICtcclxuXHRcdCdDaGVjayB0aGUgW2dpdGh1YiBwYWdlXShodHRwczovL2dpdGh1Yi5jb20vdHdpYmlyYWwvb2JzaWRpYW4tZXhlY3V0ZS1jb2RlKSBmb3IgbW9yZSBpbmZvcm1hdGlvbi4nICtcclxuXHRcdCdcXG5cXG5cXG4nICtcclxuXHRcdCdUaGFuayB5b3UgZm9yIHVzaW5nIHRoZSBFeGVjdXRlIENvZGUgUGx1Z2luISAnICtcclxuXHRcdCdbSGVyZSB5b3UgY2FuIGZpbmQgYSBkZXRhaWxlZCBjaGFuZ2UgbG9nLl0oaHR0cHM6Ly9naXRodWIuY29tL3R3aWJpcmFsL29ic2lkaWFuLWV4ZWN1dGUtY29kZS9ibG9iL21hc3Rlci9DSEFOR0VMT0cubWQpJyArXHJcblx0XHQnXFxuXFxuXFxuJyArXHJcblx0XHQnSWYgeW91IGVuam95IHVzaW5nIHRoZSBwbHVnaW4sIGNvbnNpZGVyIHN1cHBvcnRpbmcgdGhlIGRldmVsb3BtZW50IHZpYSBbUGF5UGFsXShodHRwczovL3d3dy5wYXlwYWwuY29tL3BheXBhbG1lL3RpbXdpYmlyYWwpIG9yIFtCdXkgTWUgYSBDb2ZmZWVdKGh0dHBzOi8vd3d3LmJ1eW1lYWNvZmZlZS5jb20vdHdpYmlyYWwpLidcclxuXHJcblx0XHR0aGlzLmNvbXBvbmVudC5sb2FkKCk7XHJcblx0XHRNYXJrZG93blJlbmRlcmVyLnJlbmRlcih0aGlzLmFwcCwgdGV4dCwgdGhpcy5jb250ZW50RWwsIHRoaXMuYXBwLndvcmtzcGFjZS5nZXRBY3RpdmVGaWxlKCkucGF0aCwgdGhpcy5jb21wb25lbnQpO1xyXG5cdH1cclxufSJdfQ==