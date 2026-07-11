package com.aidup.app.models.campaign

import com.google.gson.annotations.SerializedName

/**
 * Matches the actual backend response from getPublicCampaignById.
 * The backend spreads campaign fields at the top level and adds
 * uniqueDonors + campainDonation alongside them.
 */
data class CampaignDetailResponse(
    val count: Int = 0,
    val _id: String,
    val title: String? = null,
    val description: String? = null,
    val story: String? = null,
    val goal: List<String>? = null,
    val goal_date: String? = null,       // ISO date e.g. "2026-06-01T00:00:00.000Z"
    val banner: String? = null,
    val category: CategoryInfo? = null,  // shared { _id, name }
    val goal_amount: Double = 0.0,
    val images: List<String>? = null,
    val videos: List<String>? = null,
    val paiment_methods: List<PaymentMethod>? = null,
    val organizer_id: OrganizerInfo? = null,  // shared { _id, username, photo }
    val uniqueDonors: List<String>? = null,
    val campainDonation: CampainDonationInfo? = null
)

/** Donation summary for a campaign */
data class CampainDonationInfo(
    val donated_amount: Double = 0.0,
    val donations: List<DonationDetail>? = null
)

/** Individual donation entry (populated with donator info) */
data class DonationDetail(
    val amount: Double = 0.0,
    val currency: String? = null,
    val status: String? = null,
    val submitted_date: String? = null,   // ISO date
    val donator_id: DonatorInfo? = null
)

/** Populated donator within a donation */
data class DonatorInfo(
    val _id: String? = null,
    val username: String? = null,
    val photo: String? = null
)
