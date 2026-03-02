package com.realestate.onlinerealestate.dto;

public class OtpRequest {

    private String email;
    private String otp;
    private boolean adminRecord;

    public OtpRequest() {
    }

    public String getEmail() {
        return email;
    }

    public String getOtp() {
        return otp;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setOtp(String otp) {
        this.otp = otp;
    }

    public boolean isAdminRecord() {
        return adminRecord;
    }

    public void setAdminRecord(boolean adminRecord) {
        this.adminRecord = adminRecord;
    }
}
