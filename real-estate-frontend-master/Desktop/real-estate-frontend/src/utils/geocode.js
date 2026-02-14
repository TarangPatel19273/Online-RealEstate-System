export const getCoordinates = async (address) => {
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`
        );

        if (!response.ok) {
            throw new Error("Network response was not ok");
        }

        const data = await response.json();

        if (data.length === 0) {
            console.warn("Address not found:", address);
            return null; // Return null instead of throwing to avoid breaking the flow
        }

        return {
            lat: parseFloat(data[0].lat), // Ensure number
            lon: parseFloat(data[0].lon), // Ensure number
        };
    } catch (error) {
        console.error("Geocoding error:", error);
        return null; // Return null on error
    }
};
