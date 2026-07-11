package com.aidup.app.models.profile

import com.google.gson.annotations.SerializedName

data class ApiResponse(
    val success: Boolean,
    val message: String
)

data class TotalAmountEntry(
    val _id: String?,
    val total_amount: Double
)

data class DonatorData(
    @SerializedName("_id")
    val id: String,
    val name: String,
    val username: String? = null,
    val bio: String? = null,
    val email: String,
    @SerializedName("phoneNumber")
    val phoneNumber: String? = null,
    val photo: String? = null,
    val role: String,
    val preferences: List<String>? = null,
    val createdAt: String? = null
)

data class DonatorProfileResponse(
    val donator: DonatorData?,
    val count: Int?,
    @SerializedName("total_amount")
    val totalAmount: List<TotalAmountEntry>? = null
)
