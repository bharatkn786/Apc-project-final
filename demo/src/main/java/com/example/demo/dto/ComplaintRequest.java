package com.example.demo.dto;

public class ComplaintRequest {
    private String title;
    private String description;
    private String category;
    private String subcategory;
    private String location;
    private String contactNumber;

    // Default constructor
    public ComplaintRequest() {}

    // Constructor with all fields
    public ComplaintRequest(String title, String description, String category, String subcategory, String location, String contactNumber) {
        this.title = title;
        this.description = description;
        this.category = category;
        this.subcategory = subcategory;
        this.location = location;
        this.contactNumber = contactNumber;
    }

    // Getters and Setters
    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getSubcategory() {
        return subcategory;
    }

    public void setSubcategory(String subcategory) {
        this.subcategory = subcategory;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getContactNumber() {
        return contactNumber;
    }

    public void setContactNumber(String contactNumber) {
        this.contactNumber = contactNumber;
    }

    @Override
    public String toString() {
        return "ComplaintRequest{" +
                "title='" + title + '\'' +
                ", description='" + description + '\'' +
                ", category='" + category + '\'' +
                ", subcategory='" + subcategory + '\'' +
                ", location='" + location + '\'' +
                ", contactNumber='" + contactNumber + '\'' +
                '}';
    }
}