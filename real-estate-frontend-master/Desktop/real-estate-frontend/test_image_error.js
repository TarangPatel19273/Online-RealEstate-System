const placeholder = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='150' height='150'%3E%3Crect fill='%23eee' width='150' height='150'/%3E%3Ctext fill='%23999' x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='14'%3ENo Image%3C/text%3E%3C/svg%3E";

const testObj = {
    src: "http://localhost:8080/api/properties/images/nonexistent",
    errorCount: 0
};

function onError(e) {
    e.target.errorCount++;
    if (e.target.errorCount > 10) throw new Error("Infinite loop");
    e.target.src = placeholder;
}

try {
    onError({target: testObj});
    onError({target: testObj}); 
    console.log("No infinite loop detected", testObj);
} catch (e) {
    console.log("Infinite loop detected", e);
}
