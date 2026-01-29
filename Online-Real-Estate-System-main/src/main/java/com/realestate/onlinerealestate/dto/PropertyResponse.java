package com.realestate.onlinerealestate.dto;

import java.util.List;

public class PropertyResponse {

	private Long id;
	private String title;
	private String price;
	private String location;
	private String description;
	private String type;
	private String category;
	private List<String> imageUrls;

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getTitle() {
		return title;
	}

	public void setTitle(String title) {
		this.title = title;
	}

	public String getPrice() {
		return price;
	}

	public void setPrice(String price) {
		this.price = price;
	}

	public String getLocation() {
		return location;
	}

	public void setLocation(String location) {
		this.location = location;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public String getType() {
		return type;
	}

	public void setType(String type) {
		this.type = type;
	}

	public String getCategory() {
		return category;
	}

	public void setCategory(String category) {
		this.category = category;
	}

	public List<String> getImageUrls() {
		return imageUrls;
	}

	public void setImageUrls(List<String> imageUrls) {
		this.imageUrls = imageUrls;
	}

	private Long userId;

	public Long getUserId() {
		return userId;
	}

	public void setUserId(Long userId) {
		this.userId = userId;
	}

	@Override
	public String toString() {
		return "PropertyResponse{" +
				"id=" + id +
				", title='" + title + '\'' +
				", price='" + price + '\'' +
				", location='" + location + '\'' +
				", description='" + description + '\'' +
				", type='" + type + '\'' +
				", category='" + category + '\'' +
				", imageUrls=" + imageUrls +
				", userId=" + userId +
				'}';
	}

}
