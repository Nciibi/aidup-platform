package com.aidup.app

import android.os.Bundle
import android.util.Log
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.sp
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import com.aidup.app.network.TokenManager
import com.aidup.app.navigation.Screen
import com.aidup.app.ui.screens.*
import com.aidup.app.ui.theme.*

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        TokenManager.init(this)
        setContent {
            var isDarkMode by remember { mutableStateOf(false) }
            AidUpTheme(darkTheme = isDarkMode) {
                val navController = rememberNavController()
                val navBackStackEntry by navController.currentBackStackEntryAsState()
                val currentRoute = navBackStackEntry?.destination?.route

                // Only show bottom bar on main tabs
                val donatorTabs = listOf(
                    Screen.HomeFeed.route,
                    Screen.Search.route,
                    Screen.AllCampaigns.route,
                    Screen.Profile.route
                )
                val organizerTabs = listOf(
                    Screen.OrganizerDashboard.route,
                    Screen.CreateTab.route,
                    Screen.Profile.route
                )

                val showBottomBar = currentRoute in (donatorTabs + organizerTabs)

                val isLoggedIn = TokenManager.isLoggedIn()
                val userRole = TokenManager.getUserRole()?.lowercase() ?: "donator"
                val isOrganizer = userRole == "organizer"

                val startDestination = if (isLoggedIn) {
                    if (isOrganizer) Screen.OrganizerDashboard.route else Screen.HomeFeed.route
                } else {
                    Screen.Onboarding.route
                }
                
                android.util.Log.d("MainActivity", "Session: $isLoggedIn, Role: $userRole, Start: $startDestination")

                Scaffold(
                    containerColor = MaterialTheme.colorScheme.background,
                    bottomBar = {
                        if (showBottomBar) {
                            NavigationBar(
                                containerColor = MaterialTheme.colorScheme.surface.copy(alpha = 0.95f)
                            ) {
                                if (isOrganizer) {
                                    // Organizer Tabs
                                    NavigationBarItem(
                                        selected = currentRoute == Screen.OrganizerDashboard.route,
                                        onClick = { navController.navigate(Screen.OrganizerDashboard.route) { launchSingleTop = true; restoreState = true } },
                                        icon = { Icon(Icons.Default.Dashboard, contentDescription = "Dashboard") },
                                        label = { Text("DASHBOARD", style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold, letterSpacing = 1.sp)) },
                                        colors = NavigationBarItemDefaults.colors(
                                            selectedIconColor = MaterialTheme.colorScheme.primary,
                                            selectedTextColor = MaterialTheme.colorScheme.primary,
                                            indicatorColor = MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.2f),
                                            unselectedIconColor = MaterialTheme.colorScheme.onSurfaceVariant,
                                            unselectedTextColor = MaterialTheme.colorScheme.onSurfaceVariant
                                        )
                                    )
                                    NavigationBarItem(
                                        selected = currentRoute == Screen.CreateTab.route,
                                        onClick = { navController.navigate(Screen.CreateTab.route) { launchSingleTop = true; restoreState = true } },
                                        icon = { Icon(Icons.Outlined.AddCircleOutline, contentDescription = "Create") },
                                        label = { Text("CREATE", style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold, letterSpacing = 1.sp)) },
                                        colors = NavigationBarItemDefaults.colors(
                                            selectedIconColor = MaterialTheme.colorScheme.primary,
                                            selectedTextColor = MaterialTheme.colorScheme.primary,
                                            indicatorColor = MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.2f),
                                            unselectedIconColor = MaterialTheme.colorScheme.onSurfaceVariant,
                                            unselectedTextColor = MaterialTheme.colorScheme.onSurfaceVariant
                                        )
                                    )
                                    NavigationBarItem(
                                        selected = currentRoute == Screen.Profile.route,
                                        onClick = { navController.navigate(Screen.Profile.route) { launchSingleTop = true; restoreState = true } },
                                        icon = { Icon(Icons.Default.Person, contentDescription = "Profile") },
                                        label = { Text("PROFILE", style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold, letterSpacing = 1.sp)) },
                                        colors = NavigationBarItemDefaults.colors(
                                            selectedIconColor = MaterialTheme.colorScheme.primary,
                                            selectedTextColor = MaterialTheme.colorScheme.primary,
                                            indicatorColor = MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.2f),
                                            unselectedIconColor = MaterialTheme.colorScheme.onSurfaceVariant,
                                            unselectedTextColor = MaterialTheme.colorScheme.onSurfaceVariant
                                        )
                                    )
                                } else {
                                    // Donator Tabs
                                    NavigationBarItem(
                                        selected = currentRoute == Screen.HomeFeed.route,
                                        onClick = { navController.navigate(Screen.HomeFeed.route) { launchSingleTop = true; restoreState = true } },
                                        icon = { Icon(Icons.Default.Home, contentDescription = "Home") },
                                        label = { Text("HOME", style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold, letterSpacing = 1.sp)) },
                                        colors = NavigationBarItemDefaults.colors(
                                            selectedIconColor = MaterialTheme.colorScheme.primary,
                                            selectedTextColor = MaterialTheme.colorScheme.primary,
                                            indicatorColor = MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.2f),
                                            unselectedIconColor = MaterialTheme.colorScheme.onSurfaceVariant,
                                            unselectedTextColor = MaterialTheme.colorScheme.onSurfaceVariant
                                        )
                                    )
                                    NavigationBarItem(
                                        selected = currentRoute == Screen.Search.route,
                                        onClick = { navController.navigate(Screen.Search.route) { launchSingleTop = true; restoreState = true } },
                                        icon = { Icon(Icons.Default.Search, contentDescription = "Search") },
                                        label = { Text("SEARCH", style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold, letterSpacing = 1.sp)) },
                                        colors = NavigationBarItemDefaults.colors(
                                            selectedIconColor = MaterialTheme.colorScheme.primary,
                                            selectedTextColor = MaterialTheme.colorScheme.primary,
                                            indicatorColor = MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.2f),
                                            unselectedIconColor = MaterialTheme.colorScheme.onSurfaceVariant,
                                            unselectedTextColor = MaterialTheme.colorScheme.onSurfaceVariant
                                        )
                                    )
                                    NavigationBarItem(
                                        selected = currentRoute == Screen.AllCampaigns.route,
                                        onClick = { navController.navigate(Screen.AllCampaigns.route) { launchSingleTop = true; restoreState = true } },
                                        icon = { Icon(Icons.Default.VolunteerActivism, contentDescription = "Activity") },
                                        label = { Text("ACTIVITY", style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold, letterSpacing = 1.sp)) },
                                        colors = NavigationBarItemDefaults.colors(
                                            selectedIconColor = MaterialTheme.colorScheme.primary,
                                            selectedTextColor = MaterialTheme.colorScheme.primary,
                                            indicatorColor = MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.2f),
                                            unselectedIconColor = MaterialTheme.colorScheme.onSurfaceVariant,
                                            unselectedTextColor = MaterialTheme.colorScheme.onSurfaceVariant
                                        )
                                    )
                                    NavigationBarItem(
                                        selected = currentRoute == Screen.Profile.route,
                                        onClick = { navController.navigate(Screen.Profile.route) { launchSingleTop = true; restoreState = true } },
                                        icon = { Icon(Icons.Default.Person, contentDescription = "Profile") },
                                        label = { Text("PROFILE", style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold, letterSpacing = 1.sp)) },
                                        colors = NavigationBarItemDefaults.colors(
                                            selectedIconColor = MaterialTheme.colorScheme.primary,
                                            selectedTextColor = MaterialTheme.colorScheme.primary,
                                            indicatorColor = MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.2f),
                                            unselectedIconColor = MaterialTheme.colorScheme.onSurfaceVariant,
                                            unselectedTextColor = MaterialTheme.colorScheme.onSurfaceVariant
                                        )
                                    )
                                }
                            }
                        }
                    }
                ) { innerPadding ->
                    NavHost(
                        navController = navController,
                        startDestination = startDestination,
                        modifier = Modifier.padding(innerPadding)
                    ) {
                        composable(Screen.Onboarding.route) {
                            OnboardingScreen(navController = navController)
                        }
                        composable(Screen.Login.route) {
                            LoginScreen(navController = navController)
                        }
                        composable(Screen.Register.route) {
                            RegisterScreen(navController = navController)
                        }
                        composable(Screen.HomeFeed.route) {
                            HomeFeedScreen(
                                navController = navController,
                                isDarkMode = isDarkMode,
                                onToggleDarkMode = { isDarkMode = !isDarkMode }
                            )
                        }
                        composable(Screen.DonationEvidence.route) { backStackEntry ->
                                val campaignId = backStackEntry.arguments?.getString("campaignId")
                                DonationEvidenceScreen(
                                    navController = navController,
                                    campaignId = campaignId
                                )
                            }
                        composable(Screen.AllCampaigns.route) {
                            AllCampaignsScreen(
                                navController = navController,
                                isDarkMode = isDarkMode,
                                onToggleDarkMode = { isDarkMode = !isDarkMode }
                            )
                        }
                        composable(Screen.Details.route) { backStackEntry ->
                            val itemId = backStackEntry.arguments?.getString("itemId")
                            DetailsScreen(navController = navController, itemId = itemId)
                        }
                        composable(Screen.Search.route) {
                            SearchDiscoveryScreen(
                                navController = navController,
                                isDarkMode = isDarkMode,
                                onToggleDarkMode = { isDarkMode = !isDarkMode }
                            )
                        }
                        composable(Screen.Profile.route) {
                            UserProfileScreen(
                                navController = navController,
                                isDarkMode = isDarkMode,
                                onToggleDarkMode = { isDarkMode = !isDarkMode }
                            )
                        }
                        composable(Screen.EditProfile.route) {
                            EditProfileScreen(navController = navController)
                        }
                        composable(Screen.OrganizerDashboard.route) {
                            OrganizerDashboardScreen(
                                navController = navController,
                                isDarkMode = isDarkMode,
                                onToggleDarkMode = { isDarkMode = !isDarkMode }
                            )
                        }
                        composable(Screen.QRLogin.route) {
                            QRLoginScreen(navController = navController)
                        }
                        composable(Screen.OTPVerification.route) {
                            OTPVerificationScreen(navController = navController)
                        }
                        composable(Screen.CreateTab.route) {
                            CreateTabScreen(
                                navController = navController,
                                isDarkMode = isDarkMode,
                                onToggleDarkMode = { isDarkMode = !isDarkMode }
                            )
                        }
                    }
                }
            }
        }
    }
}
