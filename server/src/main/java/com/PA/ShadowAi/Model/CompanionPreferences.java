package com.PA.ShadowAi.Model;

import jakarta.persistence.*;

@Entity
@Table(name = "companionPreferances")
public class CompanionPreferences {

    @Column(name = "voiceName", nullable = false)
    private String voiceName;

    @Column(name = "systemInstruction", length = 500)
    private String systemInstruction;

    @Column(name = "userName", nullable = false, length = 100)
    private String userName;

    @Column(name = "autoSpeak")
    private boolean autoSpeak;

    public CompanionPreferences() {
    }

    public CompanionPreferences(String voiceName, String systemInstruction, String userName, boolean autoSpeak) {
        this.autoSpeak = autoSpeak;
        this.systemInstruction = systemInstruction;
        this.userName = userName;
        this.voiceName = voiceName;
    }

    public String getVoiceName() {
        return voiceName;
    }

    public void setVoiceName(String voiceName) {
        this.voiceName = voiceName;
    }

    public String getSystemInstruction() {
        return systemInstruction;
    }

    public void setSystemInstruction(String systemInstruction) {
        this.systemInstruction = systemInstruction;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public boolean isAutoSpeak() {
        return autoSpeak;
    }

    public void setAutoSpeak(boolean autoSpeak) {
        this.autoSpeak = autoSpeak;
    }

}
