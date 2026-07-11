package com.aidup.app.models.search

data class DonatorSearchResult(
    val _id: String,
    val name: String? = null,
    val username: String? = null,
    val bio: String? = null,
    val photo: String? = null
)

data class OrganizerSearchResult(
    val _id: String,
    val name: String? = null,
    val username: String? = null,
    val bio: String? = null,
    val location: String? = null,
    val photo: String? = null,
    val is_verified: Boolean? = null
)
