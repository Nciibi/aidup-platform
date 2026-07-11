package com.aidup.app.ui.screens

import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.pager.HorizontalPager
import androidx.compose.foundation.pager.rememberPagerState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.VolunteerActivism
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import coil.compose.AsyncImage
import com.aidup.app.navigation.Screen
import com.aidup.app.ui.theme.*
import kotlinx.coroutines.launch

data class OnboardingPageData(
    val title: String,
    val description: String,
    val imageUrl: String,
    val tag: String,
    val tagColor: Color,
    val tagTextColor: Color
)

val onboardingPagesList = listOf(
    OnboardingPageData(
        title = "Empower Causes",
        description = "Connect with grassroots organizations and local leaders making a real difference in their communities.",
        imageUrl = "https://lh3.googleusercontent.com/aida-public/AB6AXuDeVcmj2Fig827iI6B2RFZOJ-S6ErVJhFuep_nsOjGhgRXKN6OsZSr72ryv0yrxrP3cGUBI3eFkJFXazU41wpSqz2Eo42Me2Z4JXzyLSKGZlRGXXt64j-fUspgY_71y7VSVdUFUxPASPr6mYd-l69lGNrH_Me-VFeierNZ8Y5KfajF5XeQ7k7O5MwKgNxPtG3Txth6RllShaQWvtHjLJSg1GQnBmd82tFI0cO-WqNbpQ37PYzR45Li_eYJ_yunm8Dr7FMaH-d8GJ3A",
        tag = "Direct Action",
        tagColor = PrimaryContainer,
        tagTextColor = OnPrimaryContainer
    ),
    OnboardingPageData(
        title = "Track Your Impact",
        description = "See exactly where your contributions go with real-time updates and verifiable milestones.",
        imageUrl = "https://lh3.googleusercontent.com/aida-public/AB6AXuBGrMCiSEwkqpElxRB0_06Cbf3DeafQkc5k0m4R96y6vNhnKQAzq_0W3z6yvaiLYopILhsqecUi6BhzHnMIPfZbZWwjHO4h-MQBaPPCb7Ryb77X-0EVWODbAbzqIyOLE6GNrFNeol8_K0rtqvT-X5RnbfNu4p1DkMs8aEYo_EBWyTIZuPyMM6GrshUpy8eAiF_LkFoHBwZNjbck5KwQy1OwTLoHq0W57ihTEgdiBCbzVEkWRO6EtbfmVRV9V59WOBi-doPVLwA8wrw",
        tag = "Transparency",
        tagColor = PrimaryFixed,        // was SecondaryFixed — mapped to bright green
        tagTextColor = OnPrimaryFixed   // was OnSecondaryFixed
    ),
    OnboardingPageData(
        title = "Verified & Secure",
        description = "Every organization is rigorously vetted through our multi-step trust protocol for your peace of mind.",
        imageUrl = "https://lh3.googleusercontent.com/aida-public/AB6AXuDd9Q4km3nxJYzON64J_hy3FMzFMtqaB-IRKOkZoGZn3vTSRgFPFrR2CloHlAxYC6fa8l_VqtOrlOTH7qIDiHjrPV7ZqX7t43oN-cxPetZDgnwf0ev_k1AvvW56f35uo2b-Nahuo-5DaY19C46qyYdAq_5_IzSp_cxEG7hEd-qg6GH6SXr1txA6eOo5M1lO64bXa2ZznOk8Rb2hVYG3q5eJHV-K4FVma9Om34cFKE3D_AOgCj2SYGxQIp2SYgIw0sLWZ_Ofy26t6dM",
        tag = "Verified Partners",
        tagColor = TertiaryContainer,
        tagTextColor = OnTertiaryContainer
    )
)

@OptIn(ExperimentalFoundationApi::class)
@Composable
fun OnboardingScreen(navController: NavController) {
    val pagerState = rememberPagerState(pageCount = { onboardingPagesList.size })
    val scope = rememberCoroutineScope()

    Scaffold(
        containerColor = Background
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
        ) {
            // Header
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 24.dp, vertical = 20.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        Icons.Filled.VolunteerActivism,
                        contentDescription = null,
                        tint = Primary,
                        modifier = Modifier.size(28.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        "AidUp",
                        style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.ExtraBold)
                    )
                }
                TextButton(onClick = { navController.navigate(Screen.Login.route) }) {
                    Text(
                        "Skip",
                        style = MaterialTheme.typography.labelLarge.copy(fontWeight = FontWeight.Bold),
                        color = OnSurfaceVariant
                    )
                }
            }

            // Pager
            HorizontalPager(
                state = pagerState,
                modifier = Modifier.weight(1f)
            ) { index ->
                val page = onboardingPagesList[index]
                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .verticalScroll(rememberScrollState())
                        .padding(horizontal = 24.dp)
                        .padding(top = 8.dp, bottom = 280.dp), // bottom clears the footer
                    horizontalAlignment = Alignment.Start,
                    verticalArrangement = Arrangement.Top    // was Center — caused text to be hidden
                ) {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .aspectRatio(0.85f)
                            .clip(RoundedCornerShape(24.dp))
                            .background(SurfaceContainerLow)
                    ) {
                        AsyncImage(
                            model = page.imageUrl,
                            contentDescription = null,
                            modifier = Modifier.fillMaxSize(),
                            contentScale = ContentScale.Crop
                        )
                        Box(
                            modifier = Modifier
                                .fillMaxSize()
                                .background(
                                    Brush.verticalGradient(
                                        listOf(Color.Transparent, Color.Black.copy(alpha = 0.3f))
                                    )
                                )
                        )
                    }

                    Spacer(modifier = Modifier.height(32.dp))

                    Surface(color = page.tagColor, shape = RoundedCornerShape(full)) {
                        Text(
                            page.tag.uppercase(),
                            modifier = Modifier.padding(horizontal = 14.dp, vertical = 6.dp),
                            style = MaterialTheme.typography.labelSmall.copy(
                                fontWeight = FontWeight.ExtraBold,
                                letterSpacing = 1.sp
                            ),
                            color = page.tagTextColor
                        )
                    }

                    Spacer(modifier = Modifier.height(20.dp))

                    Text(
                        page.title,
                        style = MaterialTheme.typography.displayMedium.copy(lineHeight = 52.sp)
                    )

                    Spacer(modifier = Modifier.height(16.dp))

                    Text(
                        page.description,
                        style = MaterialTheme.typography.bodyLarge.copy(
                            lineHeight = 28.sp,
                            color = OnSurfaceVariant
                        )
                    )
                }
            }

            // Footer
            Column(modifier = Modifier.padding(24.dp)) {
                // Page indicators
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(bottom = 32.dp),
                    horizontalArrangement = Arrangement.Start,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    repeat(onboardingPagesList.size) { iteration ->
                        val color = if (pagerState.currentPage == iteration) Primary else SurfaceContainerHighest
                        val width = if (pagerState.currentPage == iteration) 32.dp else 8.dp
                        Box(
                            modifier = Modifier
                                .padding(4.dp)
                                .clip(CircleShape)
                                .background(color)
                                .width(width)
                                .height(6.dp)
                        )
                    }
                }

                Button(
                    onClick = {
                        if (pagerState.currentPage < onboardingPagesList.size - 1) {
                            scope.launch { pagerState.animateScrollToPage(pagerState.currentPage + 1) }
                        } else {
                            navController.navigate(Screen.Login.route)
                        }
                    },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(64.dp)
                        .background(
                            brush = Brush.linearGradient(
                                colors = listOf(Primary, PrimaryContainer)
                            ),
                            shape = RoundedCornerShape(full)
                        ),
                    colors = ButtonDefaults.buttonColors(containerColor = Color.Transparent)
                ) {
                    Text(
                        if (pagerState.currentPage == onboardingPagesList.size - 1) "Get Started" else "Continue",
                        style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold)
                    )
                }
            }
        }
    }
}