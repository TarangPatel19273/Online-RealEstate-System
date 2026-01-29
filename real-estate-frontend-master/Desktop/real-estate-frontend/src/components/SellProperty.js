import { useState } from "react";
import axios from "axios";

function SellProperty() {
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState([]);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("title", title);
    formData.append("price", price);
    formData.append("location", location);
    formData.append("description", description);

    for (let i = 0; i < images.length; i++) {
      formData.append("images", images[i]);
    }

    try {
      axios.post(
  "http://localhost:8080/api/properties/upload",
  formData,
  {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  }
);


      setMessage("Property uploaded successfully ✅");

    } catch (err) {
      setMessage("Upload failed ❌");
    }
  };

  return (
    <div style={{ width: "500px", margin: "40px auto" }}>
      <h2>Upload Property</h2>

      <form onSubmit={handleSubmit}>
        <input
          placeholder="Property Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <input
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
        />

        <input
          placeholder="Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          required
        />

        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />

        <input
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => setImages(e.target.files)}
          required
        />

        <button type="submit">Upload Property</button>
      </form>

      {message && <p>{message}</p>}
    </div>
  );
}

export default SellProperty;
