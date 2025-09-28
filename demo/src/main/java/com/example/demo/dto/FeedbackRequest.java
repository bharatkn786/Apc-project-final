
package com.example.demo.dto;

public class FeedbackRequest {
    private Boolean isFullySolved;
    private Integer satisfactionRating;
    private String feedback;
    private Boolean wouldRecommend;

    // Constructors, getters, setters...
    public FeedbackRequest() {}

    public Boolean getIsFullySolved() { return isFullySolved; }
    public void setIsFullySolved(Boolean isFullySolved) { this.isFullySolved = isFullySolved; }

    public Integer getSatisfactionRating() { return satisfactionRating; }
    public void setSatisfactionRating(Integer satisfactionRating) { this.satisfactionRating = satisfactionRating; }

    public String getFeedback() { return feedback; }
    public void setFeedback(String feedback) { this.feedback = feedback; }

    public Boolean getWouldRecommend() { return wouldRecommend; }
    public void setWouldRecommend(Boolean wouldRecommend) { this.wouldRecommend = wouldRecommend; }
}