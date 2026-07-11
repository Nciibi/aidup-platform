package com.aidup.app.navigation

sealed class Screen(val route: String) {
    object Onboarding        : Screen("onboarding")
    object Login             : Screen("login_screen")
    object Register          : Screen("register_screen")
    object AllCampaigns      : Screen("all_campaigns")
    object HomeFeed          : Screen("home_feed")
    object Search            : Screen("search_screen")
    object Profile           : Screen("profile")
    object OrganizerDashboard: Screen("organizer_dashboard")
    object QRLogin           : Screen("qr_login")
    object OTPVerification   : Screen("otp_verification")
    object CreateTab         : Screen("create_tab")
    object DonationEvidence  : Screen("donation_evidence/{campaignId}/{donatorId}") {fun createRoute(campaignId: String, donatorId: String) ="donation_evidence/$campaignId/$donatorId"}
    object EditProfile       : Screen("edit_profile")
    object Details           : Screen("details_screen/{itemId}") {fun createRoute(itemId: String) = "details_screen/$itemId"}
}