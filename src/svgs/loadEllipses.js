import parseHTML from "./parseHTML";
const svg = parseHTML(`<svg width="10" height="10" viewBox="0 0 10 10" xmlns="http://www.w3.org/2000/svg">
    <style>
        @keyframes load_ellipse_anim{
	    0%{transform: translateY(0);}
	    25%{transform: translateY(-1.5px);}
	    100%{transform: translateY(0);}
        }
    </style>
    <circle cx="1.5" r="1" cy="5" style="fill:currentColor; animation: load_ellipse_anim 1.3s infinite ease-in-out 0.3s;"/>
    <circle cx="5" r="1" cy="5" style="fill:currentColor; animation: load_ellipse_anim 1.3s infinite ease-in-out 0.6s;"/>
    <circle cx="8.5" r="1" cy="5" style="fill:currentColor; animation: load_ellipse_anim 1.3s infinite ease-in-out 0.9s;"/>
</svg>`);
export default () => {
    return svg.cloneNode(true);
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9hZEVsbGlwc2VzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsibG9hZEVsbGlwc2VzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sU0FBUyxNQUFNLGFBQWEsQ0FBQztBQUVwQyxNQUFNLEdBQUcsR0FBRyxTQUFTLENBQUM7Ozs7Ozs7Ozs7O09BV2YsQ0FBQyxDQUFDO0FBRVQsZUFBZSxHQUFHLEVBQUU7SUFDaEIsT0FBTyxHQUFHLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQy9CLENBQUMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBwYXJzZUhUTUwgZnJvbSBcIi4vcGFyc2VIVE1MXCI7XHJcblxyXG5jb25zdCBzdmcgPSBwYXJzZUhUTUwoYDxzdmcgd2lkdGg9XCIxMFwiIGhlaWdodD1cIjEwXCIgdmlld0JveD1cIjAgMCAxMCAxMFwiIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIj5cclxuICAgIDxzdHlsZT5cclxuICAgICAgICBAa2V5ZnJhbWVzIGxvYWRfZWxsaXBzZV9hbmlte1xyXG5cdCAgICAwJXt0cmFuc2Zvcm06IHRyYW5zbGF0ZVkoMCk7fVxyXG5cdCAgICAyNSV7dHJhbnNmb3JtOiB0cmFuc2xhdGVZKC0xLjVweCk7fVxyXG5cdCAgICAxMDAle3RyYW5zZm9ybTogdHJhbnNsYXRlWSgwKTt9XHJcbiAgICAgICAgfVxyXG4gICAgPC9zdHlsZT5cclxuICAgIDxjaXJjbGUgY3g9XCIxLjVcIiByPVwiMVwiIGN5PVwiNVwiIHN0eWxlPVwiZmlsbDpjdXJyZW50Q29sb3I7IGFuaW1hdGlvbjogbG9hZF9lbGxpcHNlX2FuaW0gMS4zcyBpbmZpbml0ZSBlYXNlLWluLW91dCAwLjNzO1wiLz5cclxuICAgIDxjaXJjbGUgY3g9XCI1XCIgcj1cIjFcIiBjeT1cIjVcIiBzdHlsZT1cImZpbGw6Y3VycmVudENvbG9yOyBhbmltYXRpb246IGxvYWRfZWxsaXBzZV9hbmltIDEuM3MgaW5maW5pdGUgZWFzZS1pbi1vdXQgMC42cztcIi8+XHJcbiAgICA8Y2lyY2xlIGN4PVwiOC41XCIgcj1cIjFcIiBjeT1cIjVcIiBzdHlsZT1cImZpbGw6Y3VycmVudENvbG9yOyBhbmltYXRpb246IGxvYWRfZWxsaXBzZV9hbmltIDEuM3MgaW5maW5pdGUgZWFzZS1pbi1vdXQgMC45cztcIi8+XHJcbjwvc3ZnPmApO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgKCkgPT4ge1xyXG4gICAgcmV0dXJuIHN2Zy5jbG9uZU5vZGUodHJ1ZSk7XHJcbn0iXX0=