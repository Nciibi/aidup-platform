package com.aidup.app.models.donation

import com.google.gson.annotations.SerializedName

data class PaymentMethod(
    @SerializedName("method_type")
    val methodType: String,
    val details: String? = null
)

data class CampaignSummary(
    val _id: String,
    val title: String
)

data class Donation(
    val _id: String,
    val campaign_id: CampaignSummary, // Populated object: { _id, title }
    val donator_id: String,
    val amount: Double,
    val currency: String? = "USD",
    @SerializedName("paiment_method")
    val paymentMethods: List<PaymentMethod>? = null,
    @SerializedName("evidance")
    val evidenceImages: List<String>? = null,
    val status: String,
    @SerializedName("submitted_date")
    val submittedDate: String? = null,
    val description: String? = ""
)

data class DonationListResponse(
    val success: Boolean,
    val message: String?,
    val data: List<Donation>?
)
