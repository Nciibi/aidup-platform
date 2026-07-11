package com.aidup.app.models.campaign

import com.google.gson.annotations.SerializedName

data class Category(
    @SerializedName("_id")
    val _id: String,
    @SerializedName("name")
    val name: String? = null,
    @SerializedName("discription") // Matching backend typo "discription"
    val description: String? = null
)
