const axios = require('axios');
const API_BASE = 'http://localhost:8080';

async function test() {
    try {
        let remarks = "";
        const id = 1;
        const status = 'APPROVED';
        const token = "dummy"; // Token doesn't matter since it's permitAll
        const res = await axios.put(`${API_BASE}/api/admin/visits/${id}/status?status=${status}&remarks=${encodeURIComponent(remarks)}`, null, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log("Success:", res.data);
    } catch (error) {
        console.error("Error updating status:", error.response ? error.response.data : error.message);
    }
}
test();
