package com.aidup.app.models.campaign

data class Campaign(
    val _id: String,
    val title: String? = null,
    val description: String? = null,
    val category: CategoryInfo? = null, // Changed from String? to CategoryInfo?
    val goal_amount: Double = 0.0,
    val raised_amount: Double? = null,
    val images: List<String>? = null,
    val status: String? = null,
    val organizer_id: OrganizerInfo? = null,
    val paiment_methods: List<PaymentMethod>? = null,

    // ── New fields from backend ──────────────────────
    val banner: String? = null,           // hero image URL
    val story: String? = null,            // full story text
    val goals: List<String>? = null,      // ["Install 2 boreholes ($12k)", ...]
    val donors_count: Int? = null,        // number of donors
    val days_left: Int? = null,           // days remaining
    val impact: String? = null,           // "2.4k+" people impacted
    val organizer_name: String? = null,   // organizer display name
    val organizer_photo: String? = null,  // organizer avatar URL
    val top_donors: List<Donor>? = null   // list of top donors
)

data class Donor(
    val name: String? = null,
    val photo: String? = null,
    val amount: Double? = null,
    val time: String? = null  // e.g. "2 hours ago", "Yesterday"
)

data class OrganizerInfo(
    val _id: String,
    val username: String? = null, // Changed from name: String? to username: String?
    val photo: String? = null
)

// Add these to match list response if not already available in CampaignModels.kt
data class CategoryInfo(
    val _id: String? = null,
    val name: String? = null
)

data class PaymentMethod(
    val method_type: String? = null,
    val details: String? = null
)

data class CampaignListResponse(
    val success: Boolean,
    val campains: List<Campaign>?
)

data class CampaignResponse(
    val success: Boolean,
    val campain: Campaign?
)
