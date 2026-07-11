package com.aidup.app.models

data class AidItem(
    val id: String,
    val title: String,
    val description: String,
    val category: DonationCategory,
    val categoryName: String,
    val imageUrl: String,
    val raisedAmount: Double,
    val targetAmount: Double,
    val isFeatured: Boolean = false,
    val organizerName: String = "Sarah Jenkins"
)

data class ImpactStat(
    val value: String,
    val label: String
)

val sampleImpactStats = listOf(
    ImpactStat("1.2M+", "Total lives touched"),
    ImpactStat("142", "Global projects funded"),
    ImpactStat("89k", "Active donors")
)

val sampleAidItems = listOf(
    AidItem(
        id = "1",
        title = "Support Rural Libraries",
        description = "Providing books and digital resources to over 50 schools in remote regions.",
        category = DonationCategory.EDUCATION,
        categoryName = "Education",
        imageUrl = "https://lh3.googleusercontent.com/aida-public/AB6AXuBlyfaSAUdGBGhDOToRBCPsPGS1Uq9La0l2GLrpY6J0rKIy_lHsn48wCkwhUJ8Ez5ZH5hZs5PJOTDHclr2RrS6JvRHLykhWS5gMMUbSyuQZgGt0DP3aRbsoJceTi9mVb_0PlcW9A3LSRoQcrC1XTtiWa6W1Qy2jgjx7JaGSvEHGpgq6XpZlAVReXIfDbP5lqPXwffsTKli0fDH3nCobxyy3B2BpYKJiengHECmYWXyrGzlM6kMKZ0XLIPP2fTaB9mvkoVGA",
        raisedAmount = 12450.0,
        targetAmount = 18000.0,
        isFeatured = true
    ),
    AidItem(
        id = "2",
        title = "Clean Water Initiative",
        description = "Installing solar-powered filtration systems for communities in need.",
        category = DonationCategory.HEALTH,
        categoryName = "Health",
        imageUrl = "https://lh3.googleusercontent.com/aida-public/AB6AXuAXJJX6HzgSuqZmMV-qFg3c1TRFqernsGEkeG1PoO3C5oscpRSYlYKADLlo4Ne08tTlw2O7FqMP7QTrdUT7rY9pyPHZmPL0BULCDfsBoMhXhj0ntfV_CxgkehoRniA00avJ7Si8D3C9jGPGQtNHTVzsOvrVhtSsCsny9wSkOpuOFTvtIDC0nZXJp9cfJDzeC4dZPsu-acZ0FAE2-I00I_bpPvggJf8Z83mvhxDDbuQIEqf_VHRxKLziXec3PrYaqEwmQP49mE2bwWk",
        raisedAmount = 8200.0,
        targetAmount = 20000.0,
        isFeatured = true
    )
)
