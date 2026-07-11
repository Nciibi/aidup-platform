package com.aidup.app.models.organizer

import com.google.gson.annotations.SerializedName

data class OrganizerData(
    @SerializedName("_id")
    val id: String,
    val name: String,
    val username: String? = null,
    val bio: String? = null,
    val photo: String? = null,
    val location: String? = null,
    val website: String? = null,
    @SerializedName("phone_number")
    val phoneNumber: String? = null,
    val email: String? = null,
    val contactemail: String? = null,
    @SerializedName("is_verified")
    val isVerified: Boolean = false
)

data class OrganizerProfileResponse(
    @SerializedName("organizor")
    val organizer: OrganizerData?,
    val message: String? = null
)

data class OrganizerSituationResponse(
    @SerializedName("is_verified")
    val isVerified: Boolean,
    val status: String?
)

data class SubmitVerificationResponse(
    val success: Boolean,
    val message: String?
)
