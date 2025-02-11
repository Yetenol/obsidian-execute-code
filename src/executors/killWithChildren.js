import { execSync } from "child_process";
export default (pid) => {
    if (process.platform === "win32") {
        execSync(`taskkill /pid ${pid} /T /F`);
    }
    else {
        try {
            execSync(`pkill -P ${pid}`);
        }
        catch (err) {
            // An error code of 1 signifies that no children were found to kill
            // In this case, ignore the error
            // Otherwise, re-throw it.
            if (err.status !== 1)
                throw err;
        }
        process.kill(pid);
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia2lsbFdpdGhDaGlsZHJlbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImtpbGxXaXRoQ2hpbGRyZW4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLGVBQWUsQ0FBQTtBQUV4QyxlQUFlLENBQUMsR0FBVyxFQUFFLEVBQUU7SUFDM0IsSUFBRyxPQUFPLENBQUMsUUFBUSxLQUFLLE9BQU8sRUFBRTtRQUM3QixRQUFRLENBQUMsaUJBQWlCLEdBQUcsUUFBUSxDQUFDLENBQUE7S0FDekM7U0FBTTtRQUNULElBQUk7WUFDRyxRQUFRLENBQUMsWUFBWSxHQUFHLEVBQUUsQ0FBQyxDQUFBO1NBQ2pDO1FBQUMsT0FBTSxHQUFHLEVBQUU7WUFDWixtRUFBbUU7WUFDbkUsaUNBQWlDO1lBQ2pDLDBCQUEwQjtZQUMxQixJQUFJLEdBQUcsQ0FBQyxNQUFNLEtBQUssQ0FBQztnQkFBRSxNQUFNLEdBQUcsQ0FBQztTQUNoQztRQUNLLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7S0FDckI7QUFDTCxDQUFDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBleGVjU3luYyB9IGZyb20gXCJjaGlsZF9wcm9jZXNzXCJcclxuXHJcbmV4cG9ydCBkZWZhdWx0IChwaWQ6IG51bWJlcikgPT4ge1xyXG4gICAgaWYocHJvY2Vzcy5wbGF0Zm9ybSA9PT0gXCJ3aW4zMlwiKSB7XHJcbiAgICAgICAgZXhlY1N5bmMoYHRhc2traWxsIC9waWQgJHtwaWR9IC9UIC9GYClcclxuICAgIH0gZWxzZSB7XHJcblx0XHR0cnkge1xyXG5cdCAgICAgICAgZXhlY1N5bmMoYHBraWxsIC1QICR7cGlkfWApXHJcblx0XHR9IGNhdGNoKGVycikge1xyXG5cdFx0XHQvLyBBbiBlcnJvciBjb2RlIG9mIDEgc2lnbmlmaWVzIHRoYXQgbm8gY2hpbGRyZW4gd2VyZSBmb3VuZCB0byBraWxsXHJcblx0XHRcdC8vIEluIHRoaXMgY2FzZSwgaWdub3JlIHRoZSBlcnJvclxyXG5cdFx0XHQvLyBPdGhlcndpc2UsIHJlLXRocm93IGl0LlxyXG5cdFx0XHRpZiAoZXJyLnN0YXR1cyAhPT0gMSkgdGhyb3cgZXJyO1xyXG5cdFx0fVxyXG4gICAgICAgIHByb2Nlc3Mua2lsbChwaWQpO1xyXG4gICAgfVxyXG59XHJcbiJdfQ==