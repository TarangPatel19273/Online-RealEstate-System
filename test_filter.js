const properties = [
  {
    "id": 21,
    "title": "Spacious Apartment 1",
    "price": "25001",
    "location": "Pune, Koregaon Park",
    "type": "Rent",
    "category": "Residential"
  }
];

const activeTab = "Rent";

const filtered = properties.filter(property => {
    if (activeTab === "Buy") return property.type === "Sell";
    if (activeTab === "Rent") return property.type === "Rent";
    if (activeTab === "Commercial") return property.category === "Commercial";
    return true;
});

console.log(filtered.length);
