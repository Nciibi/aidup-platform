package com.aidup.app.ui.screens

import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavController
import coil.compose.AsyncImage
import com.aidup.app.navigation.Screen
import com.aidup.app.ui.components.AidUpTopBar
import com.aidup.app.ui.theme.*
import com.aidup.app.ui.viewmodels.HomeFeedUiState
import com.aidup.app.ui.viewmodels.HomeFeedViewModel
import com.aidup.app.ui.viewmodels.SearchViewModel
import com.aidup.app.utils.NetworkUtils


// ─────────────────────────────────────────────────────────────────────────────
// Tab enum
// ─────────────────────────────────────────────────────────────────────────────
private enum class SearchTab { Campaigns, Donators, Organizers }

@Composable
fun SearchDiscoveryScreen(
    navController: NavController,
    isDarkMode: Boolean,
    onToggleDarkMode: () -> Unit,
    feedViewModel: HomeFeedViewModel = viewModel(),
    searchViewModel: SearchViewModel = viewModel()
) {
    var query by remember { mutableStateOf("") }
    var selectedTab by remember { mutableStateOf(SearchTab.Campaigns) }
    var selectedCategory by remember { mutableStateOf<String?>(null) }

    val feedState = feedViewModel.uiState
    val donators = searchViewModel.donators
    val organizers = searchViewModel.organizers

    // Trigger search when query or tab changes
    LaunchedEffect(query, selectedTab) {
        if (query.isNotBlank()) {
            when (selectedTab) {
                SearchTab.Donators   -> searchViewModel.searchDonators(query)
                SearchTab.Organizers -> searchViewModel.searchOrganizers(query)
                else                 -> Unit // campaigns filtered client-side
            }
        }
    }

    Scaffold(
        containerColor = MaterialTheme.colorScheme.background,
        topBar = {
            AidUpTopBar(
                isDarkMode = isDarkMode,
                onToggleDarkMode = onToggleDarkMode,
                onQrClick = { navController.navigate(Screen.QRLogin.route) }
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
        ) {
            // ── Search bar ────────────────────────────────────────────
            Spacer(modifier = Modifier.height(16.dp))
            TextField(
                value = query,
                onValueChange = { query = it },
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 24.dp),
                placeholder = {
                    Text(
                        "Search campaigns, people, or groups...",
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                },
                leadingIcon = {
                    Icon(Icons.Default.Search, contentDescription = null, tint = MaterialTheme.colorScheme.onSurfaceVariant)
                },
                trailingIcon = {
                    if (query.isNotEmpty()) {
                        IconButton(onClick = { query = "" }) {
                            Icon(Icons.Default.Close, contentDescription = "Clear", tint = MaterialTheme.colorScheme.onSurfaceVariant)
                        }
                    }
                },
                colors = TextFieldDefaults.colors(
                    focusedContainerColor = MaterialTheme.colorScheme.surfaceContainerHighest,
                    unfocusedContainerColor = MaterialTheme.colorScheme.surfaceContainerHighest,
                    focusedIndicatorColor = Color.Transparent,
                    unfocusedIndicatorColor = Color.Transparent,
                    focusedTextColor = MaterialTheme.colorScheme.onSurface,
                    unfocusedTextColor = MaterialTheme.colorScheme.onSurface
                ),
                shape = RoundedCornerShape(16.dp),
                singleLine = true
            )

            Spacer(modifier = Modifier.height(12.dp))

            // ── Category Chips ────────────────────────────────────────
            if (selectedTab == SearchTab.Campaigns && feedState is HomeFeedUiState.Success) {
                LazyRow(
                    contentPadding = PaddingValues(horizontal = 24.dp),
                    horizontalArrangement = Arrangement.spacedBy(10.dp),
                    modifier = Modifier.padding(vertical = 8.dp)
                ) {
                    item {
                        FilterChip(
                            selected = selectedCategory == null,
                            onClick = { selectedCategory = null },
                            label = { Text("All") },
                            colors = FilterChipDefaults.filterChipColors(
                                selectedContainerColor = MaterialTheme.colorScheme.primary,
                                selectedLabelColor = MaterialTheme.colorScheme.onPrimary
                            ),
                            shape = RoundedCornerShape(full)
                        )
                    }
                    items(feedState.categories) { category ->
                        val isSelected = selectedCategory == category.name
                        FilterChip(
                            selected = isSelected,
                            onClick = { selectedCategory = if (isSelected) null else category.name },
                            label = { 
                                Text((category.name ?: "Other").lowercase().replaceFirstChar { it.uppercase() }) 
                            },
                            leadingIcon = {
                                Icon(Icons.Default.Star, contentDescription = null, modifier = Modifier.size(16.dp))
                            },
                            colors = FilterChipDefaults.filterChipColors(
                                selectedContainerColor = MaterialTheme.colorScheme.primary,
                                selectedLabelColor = MaterialTheme.colorScheme.onPrimary
                            ),
                            shape = RoundedCornerShape(full)
                        )
                    }
                }
                Spacer(modifier = Modifier.height(8.dp))
            }

            // ── Tab switcher ──────────────────────────────────────────
            Surface(
                color = MaterialTheme.colorScheme.surfaceContainerLow,
                shape = RoundedCornerShape(16.dp),
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 24.dp)
            ) {
                Row(modifier = Modifier.padding(4.dp)) {
                    SearchTab.values().forEach { tab ->
                        val isSelected = tab == selectedTab
                        Surface(
                            modifier = Modifier.weight(1f),
                            shape = RoundedCornerShape(12.dp),
                            color = if (isSelected) MaterialTheme.colorScheme.primary else Color.Transparent,
                            onClick = { selectedTab = tab }
                        ) {
                            Text(
                                tab.name,
                                modifier = Modifier.padding(vertical = 10.dp),
                                style = MaterialTheme.typography.labelLarge.copy(
                                    fontWeight = FontWeight.SemiBold,
                                    color = if (isSelected) MaterialTheme.colorScheme.onPrimary else MaterialTheme.colorScheme.onSurfaceVariant
                                ),
                                textAlign = androidx.compose.ui.text.style.TextAlign.Center
                            )
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // ── Results ───────────────────────────────────────────────
            when (selectedTab) {

                SearchTab.Campaigns -> {
                    when (feedState) {
                        is HomeFeedUiState.Loading -> {
                            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                                CircularProgressIndicator(color = MaterialTheme.colorScheme.primary)
                            }
                        }
                        is HomeFeedUiState.Error -> {
                            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                                Text(feedState.message, color = MaterialTheme.colorScheme.error)
                            }
                        }
                        is HomeFeedUiState.Success -> {
                            val results = feedState.campaigns.filter {
                                (query.isBlank() || 
                                 (it.title?.contains(query, ignoreCase = true) == true ||
                                  it.description?.contains(query, ignoreCase = true) == true)) &&
                                (selectedCategory == null || it.category?.name?.equals(selectedCategory, ignoreCase = true) == true)
                            }
                            if (query.isBlank() && selectedCategory == null) {
                                EmptyState("Search for campaigns or select a category")
                            } else if (results.isEmpty()) {
                                EmptyState("No campaigns found")
                            } else {
                                LazyColumn(
                                    contentPadding = PaddingValues(bottom = 100.dp),
                                    verticalArrangement = Arrangement.spacedBy(8.dp)
                                ) {
                                    items(results) { campaign ->
                                        SearchResultRow(
                                            imageUrl = campaign.images?.firstOrNull(),
                                            title = campaign.title ?: "Untitled",
                                            subtitle = (campaign.category?.name ?: "Other").uppercase(),
                                            trailing = "$${(campaign.raised_amount ?: 0.0).toInt()} raised",
                                            onClick = {
                                                navController.navigate(
                                                    Screen.Details.createRoute(campaign._id)
                                                )
                                            }
                                        )
                                    }
                                }
                            }
                        }
                    }
                }

                SearchTab.Donators -> {
                    if (query.isBlank()) {
                        EmptyState("Search for donators above")
                    } else if (searchViewModel.isLoadingDonators) {
                        Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                            CircularProgressIndicator(color = MaterialTheme.colorScheme.primary)
                        }
                    } else if (donators.isEmpty()) {
                        EmptyState("No donators found for \"$query\"")
                    } else {
                        LazyColumn(
                            contentPadding = PaddingValues(bottom = 100.dp),
                            verticalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            items(donators) { donator ->
                                SearchResultRow(
                                    imageUrl = donator.photo,
                                    title = donator.name ?: donator.username ?: "Anonymous",
                                    subtitle = donator.bio ?: "Donator",
                                    trailing = null,
                                    onClick = {}
                                )
                            }
                        }
                    }
                }

                SearchTab.Organizers -> {
                    if (query.isBlank()) {
                        EmptyState("Search for organizers above")
                    } else if (searchViewModel.isLoadingOrganizers) {
                        Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                            CircularProgressIndicator(color = MaterialTheme.colorScheme.primary)
                        }
                    } else if (organizers.isEmpty()) {
                        EmptyState("No organizers found for \"$query\"")
                    } else {
                        LazyColumn(
                            contentPadding = PaddingValues(bottom = 100.dp),
                            verticalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            items(organizers) { organizer ->
                                SearchResultRow(
                                    imageUrl = organizer.photo,
                                    title = organizer.name ?: organizer.username ?: "Unknown",
                                    subtitle = organizer.bio ?: organizer.location ?: "Organizer",
                                    trailing = if (organizer.is_verified == true) "Verified" else null,
                                    trailingColor = MaterialTheme.colorScheme.secondary,
                                    onClick = {}
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Search result row — shared across all three tabs
// ─────────────────────────────────────────────────────────────────────────────

@Composable
private fun SearchResultRow(
    imageUrl: String?,
    title: String?,
    subtitle: String?,
    trailing: String?,
    trailingColor: Color = MaterialTheme.colorScheme.onSurfaceVariant,
    onClick: () -> Unit
) {
    Surface(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 24.dp),
        shape = RoundedCornerShape(16.dp),
        color = MaterialTheme.colorScheme.surfaceContainerLowest,
        onClick = onClick
    ) {
        Row(
            modifier = Modifier.padding(12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Avatar / thumbnail
            Surface(
                modifier = Modifier.size(56.dp),
                shape = RoundedCornerShape(12.dp),
                color = MaterialTheme.colorScheme.surfaceContainerHighest
            ) {
                if (imageUrl != null) {
                    AsyncImage(
                        model = NetworkUtils.getFullImageUrl(imageUrl),
                        contentDescription = null,
                        contentScale = ContentScale.Crop,
                        modifier = Modifier.fillMaxSize()
                    )
                } else {
                    Box(contentAlignment = Alignment.Center) {
                        Icon(
                            Icons.Default.Image,
                            contentDescription = null,
                            tint = MaterialTheme.colorScheme.onSurfaceVariant,
                            modifier = Modifier.size(24.dp)
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.width(14.dp))

            Column(modifier = Modifier.weight(1f)) {
                Text(
                    title ?: "Unknown",
                    style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold),
                    color = MaterialTheme.colorScheme.onSurface,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )
                Spacer(modifier = Modifier.height(2.dp))
                Text(
                    subtitle ?: "",
                    style = MaterialTheme.typography.labelSmall.copy(
                        fontWeight = FontWeight.Medium,
                        letterSpacing = 0.5.sp
                    ),
                    color = MaterialTheme.colorScheme.primary,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )
            }

            if (trailing != null) {
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    trailing,
                    style = MaterialTheme.typography.labelSmall.copy(
                        fontWeight = FontWeight.Bold,
                        color = trailingColor
                    )
                )
            }

            Spacer(modifier = Modifier.width(4.dp))
            Icon(
                Icons.Default.ChevronRight,
                contentDescription = null,
                tint = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.3f),
                modifier = Modifier.size(20.dp)
            )
        }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Empty state
// ─────────────────────────────────────────────────────────────────────────────

@Composable
private fun EmptyState(message: String) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .padding(top = 80.dp),
        contentAlignment = Alignment.Center
    ) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Icon(
                Icons.Default.Search,
                contentDescription = null,
                tint = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.3f),
                modifier = Modifier.size(48.dp)
            )
            Spacer(modifier = Modifier.height(16.dp))
            Text(
                message,
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
}
