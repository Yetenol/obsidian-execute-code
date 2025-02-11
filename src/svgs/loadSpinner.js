import parseHTML from "./parseHTML";
const svg = parseHTML(`<svg width="10" height="10" viewBox="0 0 10 10" xmlns="http://www.w3.org/2000/svg">
        <style>@keyframes spinner_svv2{100%{transform:rotate(360deg)}}</style>
        <path d="M1 5 A 4 4 0 1 1 9 5" style="transform-origin: center; fill: none; stroke: currentColor; stroke-width: 0.5; animation:spinner_svv2 .75s infinite linear"/>
        </svg>`);
export default () => {
    return svg.cloneNode(true);
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9hZFNwaW5uZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJsb2FkU3Bpbm5lci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLFNBQVMsTUFBTSxhQUFhLENBQUM7QUFFcEMsTUFBTSxHQUFHLEdBQUcsU0FBUyxDQUFDOzs7ZUFHUCxDQUFDLENBQUM7QUFFakIsZUFBZSxHQUFHLEVBQUU7SUFDaEIsT0FBTyxHQUFHLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQy9CLENBQUMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBwYXJzZUhUTUwgZnJvbSBcIi4vcGFyc2VIVE1MXCI7XHJcblxyXG5jb25zdCBzdmcgPSBwYXJzZUhUTUwoYDxzdmcgd2lkdGg9XCIxMFwiIGhlaWdodD1cIjEwXCIgdmlld0JveD1cIjAgMCAxMCAxMFwiIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIj5cclxuICAgICAgICA8c3R5bGU+QGtleWZyYW1lcyBzcGlubmVyX3N2djJ7MTAwJXt0cmFuc2Zvcm06cm90YXRlKDM2MGRlZyl9fTwvc3R5bGU+XHJcbiAgICAgICAgPHBhdGggZD1cIk0xIDUgQSA0IDQgMCAxIDEgOSA1XCIgc3R5bGU9XCJ0cmFuc2Zvcm0tb3JpZ2luOiBjZW50ZXI7IGZpbGw6IG5vbmU7IHN0cm9rZTogY3VycmVudENvbG9yOyBzdHJva2Utd2lkdGg6IDAuNTsgYW5pbWF0aW9uOnNwaW5uZXJfc3Z2MiAuNzVzIGluZmluaXRlIGxpbmVhclwiLz5cclxuICAgICAgICA8L3N2Zz5gKTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0ICgpID0+IHtcclxuICAgIHJldHVybiBzdmcuY2xvbmVOb2RlKHRydWUpO1xyXG59Il19