import { addFontSpec } from './LatexFontHandler';
export let appInstance;
export let settingsInstance;
const DOCUMENT_CLASS = /^[^%]*(?<src>\\documentclass\s*(\[(?<options>[^\]]*?)\])?\s*{\s*(?<class>[^}]*?)\s*})/;
export function modifyLatexCode(latexSrc, settings) {
    const documentClass = captureDocumentClass(latexSrc);
    const injectSrc = ''
        + provideDocumentClass(documentClass === null || documentClass === void 0 ? void 0 : documentClass.class, settings.latexDocumentclass)
        + addFontSpec(settings)
        + disablePageNumberForCropping(settings);
    latexSrc = injectSrc + latexSrc;
    console.debug(`Injected LaTeX code:`, documentClass, injectSrc);
    latexSrc = moveDocumentClassToBeginning(latexSrc, documentClass);
    return latexSrc;
}
function disablePageNumberForCropping(settings) {
    return (settings.latexDoCrop && settings.latexCropNoPagenum)
        ? `\\pagestyle{empty}\n` : '';
}
function provideDocumentClass(currentClass, defaultClass) {
    return (currentClass || defaultClass === "") ? ''
        : `\\documentclass{${defaultClass}}\n`;
}
function moveDocumentClassToBeginning(latexSrc, documentClass) {
    return (!(documentClass === null || documentClass === void 0 ? void 0 : documentClass.src)) ? latexSrc
        : documentClass.src + '\n' + latexSrc.replace(documentClass.src, '');
}
function captureDocumentClass(latexSrc) {
    var _a, _b, _c;
    const match = latexSrc.match(DOCUMENT_CLASS);
    if (!match)
        return undefined;
    return { src: (_a = match.groups) === null || _a === void 0 ? void 0 : _a.src, class: (_b = match.groups) === null || _b === void 0 ? void 0 : _b.class, options: (_c = match.groups) === null || _c === void 0 ? void 0 : _c.options };
}
export function isStandaloneClass(latexSrc) {
    var _a;
    const className = (_a = captureDocumentClass(latexSrc)) === null || _a === void 0 ? void 0 : _a.class;
    return className === "standalone";
}
export function updateBodyClass(className, isActive) {
    if (isActive) {
        document.body.classList.add(className);
    }
    else {
        document.body.classList.remove(className);
    }
}
export function applyLatexBodyClasses(app, settings) {
    updateBodyClass('center-latex-figures', settings.latexCenterFigures);
    updateBodyClass('invert-latex-figures', settings.latexInvertFigures);
    appInstance = app;
    settingsInstance = settings;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTGF0ZXhUcmFuc2Zvcm1lci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIkxhdGV4VHJhbnNmb3JtZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBRUEsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLG9CQUFvQixDQUFDO0FBRWpELE1BQU0sQ0FBQyxJQUFJLFdBQWdCLENBQUM7QUFDNUIsTUFBTSxDQUFDLElBQUksZ0JBQWtDLENBQUM7QUFFOUMsTUFBTSxjQUFjLEdBQVcsdUZBQXVGLENBQUM7QUFPdkgsTUFBTSxVQUFVLGVBQWUsQ0FBQyxRQUFnQixFQUFFLFFBQTBCO0lBQ3hFLE1BQU0sYUFBYSxHQUFrQixvQkFBb0IsQ0FBQyxRQUFRLENBQUMsQ0FBQTtJQUNuRSxNQUFNLFNBQVMsR0FBRyxFQUFFO1VBQ2Qsb0JBQW9CLENBQUMsYUFBYSxhQUFiLGFBQWEsdUJBQWIsYUFBYSxDQUFFLEtBQUssRUFBRSxRQUFRLENBQUMsa0JBQWtCLENBQUM7VUFDdkUsV0FBVyxDQUFDLFFBQVEsQ0FBQztVQUNyQiw0QkFBNEIsQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUM3QyxRQUFRLEdBQUcsU0FBUyxHQUFHLFFBQVEsQ0FBQztJQUNoQyxPQUFPLENBQUMsS0FBSyxDQUFDLHNCQUFzQixFQUFFLGFBQWEsRUFBRSxTQUFTLENBQUMsQ0FBQztJQUVoRSxRQUFRLEdBQUcsNEJBQTRCLENBQUMsUUFBUSxFQUFFLGFBQWEsQ0FBQyxDQUFDO0lBQ2pFLE9BQU8sUUFBUSxDQUFDO0FBQ3BCLENBQUM7QUFFRCxTQUFTLDRCQUE0QixDQUFDLFFBQTBCO0lBQzVELE9BQU8sQ0FBQyxRQUFRLENBQUMsV0FBVyxJQUFJLFFBQVEsQ0FBQyxrQkFBa0IsQ0FBQztRQUN4RCxDQUFDLENBQUMsc0JBQXNCLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztBQUN0QyxDQUFDO0FBRUQsU0FBUyxvQkFBb0IsQ0FBQyxZQUFvQixFQUFFLFlBQW9CO0lBQ3BFLE9BQU8sQ0FBQyxZQUFZLElBQUksWUFBWSxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFO1FBQzdDLENBQUMsQ0FBQyxtQkFBbUIsWUFBWSxLQUFLLENBQUM7QUFDL0MsQ0FBQztBQUVELFNBQVMsNEJBQTRCLENBQUMsUUFBZ0IsRUFBRSxhQUE0QjtJQUNoRixPQUFPLENBQUMsQ0FBQyxDQUFBLGFBQWEsYUFBYixhQUFhLHVCQUFiLGFBQWEsQ0FBRSxHQUFHLENBQUEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRO1FBQ25DLENBQUMsQ0FBQyxhQUFhLENBQUMsR0FBRyxHQUFHLElBQUksR0FBRyxRQUFRLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLENBQUM7QUFDN0UsQ0FBQztBQUVELFNBQVMsb0JBQW9CLENBQUMsUUFBZ0I7O0lBQzFDLE1BQU0sS0FBSyxHQUFxQixRQUFRLENBQUMsS0FBSyxDQUFDLGNBQWMsQ0FBQyxDQUFDO0lBQy9ELElBQUksQ0FBQyxLQUFLO1FBQUUsT0FBTyxTQUFTLENBQUM7SUFDN0IsT0FBc0IsRUFBRSxHQUFHLEVBQUUsTUFBQSxLQUFLLENBQUMsTUFBTSwwQ0FBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLE1BQUEsS0FBSyxDQUFDLE1BQU0sMENBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxNQUFBLEtBQUssQ0FBQyxNQUFNLDBDQUFFLE9BQU8sRUFBRSxDQUFDO0FBQ2pILENBQUM7QUFFRCxNQUFNLFVBQVUsaUJBQWlCLENBQUMsUUFBZ0I7O0lBQzlDLE1BQU0sU0FBUyxHQUFHLE1BQUEsb0JBQW9CLENBQUMsUUFBUSxDQUFDLDBDQUFFLEtBQUssQ0FBQztJQUN4RCxPQUFPLFNBQVMsS0FBSyxZQUFZLENBQUM7QUFDdEMsQ0FBQztBQUVELE1BQU0sVUFBVSxlQUFlLENBQUMsU0FBaUIsRUFBRSxRQUFpQjtJQUNoRSxJQUFJLFFBQVEsRUFBRTtRQUNWLFFBQVEsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQztLQUMxQztTQUFNO1FBQ0gsUUFBUSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0tBQzdDO0FBQ0wsQ0FBQztBQUVELE1BQU0sVUFBVSxxQkFBcUIsQ0FBQyxHQUFRLEVBQUUsUUFBMEI7SUFDdEUsZUFBZSxDQUFDLHNCQUFzQixFQUFFLFFBQVEsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO0lBQ3JFLGVBQWUsQ0FBQyxzQkFBc0IsRUFBRSxRQUFRLENBQUMsa0JBQWtCLENBQUMsQ0FBQztJQUNyRSxXQUFXLEdBQUcsR0FBRyxDQUFDO0lBQ2xCLGdCQUFnQixHQUFHLFFBQVEsQ0FBQztBQUNoQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQXBwIH0gZnJvbSAnb2JzaWRpYW4nO1xyXG5pbXBvcnQgeyBFeGVjdXRvclNldHRpbmdzIH0gZnJvbSAnc3JjL3NldHRpbmdzL1NldHRpbmdzJztcclxuaW1wb3J0IHsgYWRkRm9udFNwZWMgfSBmcm9tICcuL0xhdGV4Rm9udEhhbmRsZXInO1xyXG5cclxuZXhwb3J0IGxldCBhcHBJbnN0YW5jZTogQXBwO1xyXG5leHBvcnQgbGV0IHNldHRpbmdzSW5zdGFuY2U6IEV4ZWN1dG9yU2V0dGluZ3M7XHJcblxyXG5jb25zdCBET0NVTUVOVF9DTEFTUzogUmVnRXhwID0gL15bXiVdKig/PHNyYz5cXFxcZG9jdW1lbnRjbGFzc1xccyooXFxbKD88b3B0aW9ucz5bXlxcXV0qPylcXF0pP1xccyp7XFxzKig/PGNsYXNzPltefV0qPylcXHMqfSkvO1xyXG5pbnRlcmZhY2UgRG9jdW1lbnRDbGFzcyB7XHJcbiAgICBzcmM6IHN0cmluZyxcclxuICAgIGNsYXNzOiBzdHJpbmcsXHJcbiAgICBvcHRpb25zOiBzdHJpbmcsXHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBtb2RpZnlMYXRleENvZGUobGF0ZXhTcmM6IHN0cmluZywgc2V0dGluZ3M6IEV4ZWN1dG9yU2V0dGluZ3MpOiBzdHJpbmcge1xyXG4gICAgY29uc3QgZG9jdW1lbnRDbGFzczogRG9jdW1lbnRDbGFzcyA9IGNhcHR1cmVEb2N1bWVudENsYXNzKGxhdGV4U3JjKVxyXG4gICAgY29uc3QgaW5qZWN0U3JjID0gJydcclxuICAgICAgICArIHByb3ZpZGVEb2N1bWVudENsYXNzKGRvY3VtZW50Q2xhc3M/LmNsYXNzLCBzZXR0aW5ncy5sYXRleERvY3VtZW50Y2xhc3MpXHJcbiAgICAgICAgKyBhZGRGb250U3BlYyhzZXR0aW5ncylcclxuICAgICAgICArIGRpc2FibGVQYWdlTnVtYmVyRm9yQ3JvcHBpbmcoc2V0dGluZ3MpO1xyXG4gICAgbGF0ZXhTcmMgPSBpbmplY3RTcmMgKyBsYXRleFNyYztcclxuICAgIGNvbnNvbGUuZGVidWcoYEluamVjdGVkIExhVGVYIGNvZGU6YCwgZG9jdW1lbnRDbGFzcywgaW5qZWN0U3JjKTtcclxuXHJcbiAgICBsYXRleFNyYyA9IG1vdmVEb2N1bWVudENsYXNzVG9CZWdpbm5pbmcobGF0ZXhTcmMsIGRvY3VtZW50Q2xhc3MpO1xyXG4gICAgcmV0dXJuIGxhdGV4U3JjO1xyXG59XHJcblxyXG5mdW5jdGlvbiBkaXNhYmxlUGFnZU51bWJlckZvckNyb3BwaW5nKHNldHRpbmdzOiBFeGVjdXRvclNldHRpbmdzKTogc3RyaW5nIHtcclxuICAgIHJldHVybiAoc2V0dGluZ3MubGF0ZXhEb0Nyb3AgJiYgc2V0dGluZ3MubGF0ZXhDcm9wTm9QYWdlbnVtKVxyXG4gICAgICAgID8gYFxcXFxwYWdlc3R5bGV7ZW1wdHl9XFxuYCA6ICcnO1xyXG59XHJcblxyXG5mdW5jdGlvbiBwcm92aWRlRG9jdW1lbnRDbGFzcyhjdXJyZW50Q2xhc3M6IHN0cmluZywgZGVmYXVsdENsYXNzOiBzdHJpbmcpOiBzdHJpbmcge1xyXG4gICAgcmV0dXJuIChjdXJyZW50Q2xhc3MgfHwgZGVmYXVsdENsYXNzID09PSBcIlwiKSA/ICcnXHJcbiAgICAgICAgOiBgXFxcXGRvY3VtZW50Y2xhc3N7JHtkZWZhdWx0Q2xhc3N9fVxcbmA7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIG1vdmVEb2N1bWVudENsYXNzVG9CZWdpbm5pbmcobGF0ZXhTcmM6IHN0cmluZywgZG9jdW1lbnRDbGFzczogRG9jdW1lbnRDbGFzcyk6IHN0cmluZyB7XHJcbiAgICByZXR1cm4gKCFkb2N1bWVudENsYXNzPy5zcmMpID8gbGF0ZXhTcmNcclxuICAgICAgICA6IGRvY3VtZW50Q2xhc3Muc3JjICsgJ1xcbicgKyBsYXRleFNyYy5yZXBsYWNlKGRvY3VtZW50Q2xhc3Muc3JjLCAnJyk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGNhcHR1cmVEb2N1bWVudENsYXNzKGxhdGV4U3JjOiBzdHJpbmcpOiBEb2N1bWVudENsYXNzIHwgdW5kZWZpbmVkIHtcclxuICAgIGNvbnN0IG1hdGNoOiBSZWdFeHBNYXRjaEFycmF5ID0gbGF0ZXhTcmMubWF0Y2goRE9DVU1FTlRfQ0xBU1MpO1xyXG4gICAgaWYgKCFtYXRjaCkgcmV0dXJuIHVuZGVmaW5lZDtcclxuICAgIHJldHVybiA8RG9jdW1lbnRDbGFzcz57IHNyYzogbWF0Y2guZ3JvdXBzPy5zcmMsIGNsYXNzOiBtYXRjaC5ncm91cHM/LmNsYXNzLCBvcHRpb25zOiBtYXRjaC5ncm91cHM/Lm9wdGlvbnMgfTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGlzU3RhbmRhbG9uZUNsYXNzKGxhdGV4U3JjOiBzdHJpbmcpOiBib29sZWFuIHtcclxuICAgIGNvbnN0IGNsYXNzTmFtZSA9IGNhcHR1cmVEb2N1bWVudENsYXNzKGxhdGV4U3JjKT8uY2xhc3M7XHJcbiAgICByZXR1cm4gY2xhc3NOYW1lID09PSBcInN0YW5kYWxvbmVcIjtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHVwZGF0ZUJvZHlDbGFzcyhjbGFzc05hbWU6IHN0cmluZywgaXNBY3RpdmU6IGJvb2xlYW4pIHtcclxuICAgIGlmIChpc0FjdGl2ZSkge1xyXG4gICAgICAgIGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LmFkZChjbGFzc05hbWUpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5yZW1vdmUoY2xhc3NOYW1lKTtcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGFwcGx5TGF0ZXhCb2R5Q2xhc3NlcyhhcHA6IEFwcCwgc2V0dGluZ3M6IEV4ZWN1dG9yU2V0dGluZ3MpIHtcclxuICAgIHVwZGF0ZUJvZHlDbGFzcygnY2VudGVyLWxhdGV4LWZpZ3VyZXMnLCBzZXR0aW5ncy5sYXRleENlbnRlckZpZ3VyZXMpO1xyXG4gICAgdXBkYXRlQm9keUNsYXNzKCdpbnZlcnQtbGF0ZXgtZmlndXJlcycsIHNldHRpbmdzLmxhdGV4SW52ZXJ0RmlndXJlcyk7XHJcbiAgICBhcHBJbnN0YW5jZSA9IGFwcDtcclxuICAgIHNldHRpbmdzSW5zdGFuY2UgPSBzZXR0aW5ncztcclxufVxyXG4iXX0=