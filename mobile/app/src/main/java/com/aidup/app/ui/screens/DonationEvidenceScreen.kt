package com.aidup.app.ui.screens

import android.Manifest
import android.content.Context
import android.net.Uri
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.content.FileProvider
import androidx.lifecycle.viewmodel.compose.viewModel
import coil.compose.AsyncImage
import com.aidup.app.ui.theme.*
import com.aidup.app.ui.viewmodels.CampaignDetailsUiState
import com.aidup.app.ui.viewmodels.CampaignDetailsViewModel
import com.aidup.app.ui.viewmodels.DonationViewModel
import com.aidup.app.ui.viewmodels.SubmitDonationUiState
import com.google.accompanist.permissions.ExperimentalPermissionsApi
import com.google.accompanist.permissions.isGranted
import com.google.accompanist.permissions.rememberPermissionState
import kotlinx.coroutines.launch
import java.io.File
import java.text.DecimalFormat
import androidx.navigation.NavController

// Represents one selected photo file
data class SelectedPhoto(
    val uri: Uri,
    val name: String,
    val sizeLabel: String
)

@OptIn(ExperimentalPermissionsApi::class)
@Composable
fun DonationEvidenceScreen(
    navController: NavController,
    campaignId: String?,
    donationViewModel: DonationViewModel = viewModel(),
    campaignViewModel: CampaignDetailsViewModel = viewModel()
) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    val snackbarHostState = remember { SnackbarHostState() }

    var selectedPhotos by remember { mutableStateOf<List<SelectedPhoto>>(emptyList()) }
    var description by remember { mutableStateOf("") }
    var selectedPaymentMethods by remember { mutableStateOf<List<String>>(emptyList()) }

    // Fetch campaign details to get available payment methods
    LaunchedEffect(campaignId) {
        if (campaignId != null) {
            campaignViewModel.loadCampaign(campaignId)
        }
    }

    // Monitor submission status
    val submitState = donationViewModel.submitUiState
    LaunchedEffect(submitState) {
        if (submitState is SubmitDonationUiState.Success) {
            snackbarHostState.showSnackbar("Donation submitted successfully!")
            navController.popBackStack()
            donationViewModel.resetSubmitState()
        } else if (submitState is SubmitDonationUiState.Error) {
            snackbarHostState.showSnackbar("Error: ${submitState.message}")
        }
    }

    // URI for camera capture — created before launching camera
    var cameraUri by remember { mutableStateOf<Uri?>(null) }

    val cameraPermission = rememberPermissionState(Manifest.permission.CAMERA)

    // Gallery picker — images only (image/*)
    val galleryLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.GetMultipleContents()
    ) { uris ->
        val newPhotos = uris
            .filter { uri ->
                // Extra guard: only accept image/* MIME types
                val mime = context.contentResolver.getType(uri) ?: ""
                mime.startsWith("image/")
            }
            .map { uri -> uri.toSelectedPhoto(context) }
        selectedPhotos = (selectedPhotos + newPhotos).distinctBy { it.uri }
    }

    // Camera capture
    val cameraLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.TakePicture()
    ) { success ->
        if (success) {
            cameraUri?.let { uri ->
                selectedPhotos = selectedPhotos + uri.toSelectedPhoto(context)
            }
        }
    }

    fun launchCamera() {
        if (cameraPermission.status.isGranted) {
            val photoFile = File.createTempFile(
                "evidence_${System.currentTimeMillis()}",
                ".jpg",
                context.cacheDir
            )
            val uri = FileProvider.getUriForFile(
                context,
                "${context.packageName}.provider",
                photoFile
            )
            cameraUri = uri
            cameraLauncher.launch(uri)
        } else {
            cameraPermission.launchPermissionRequest()
        }
    }

    Scaffold(
        containerColor = Surface,
        snackbarHost = { SnackbarHost(snackbarHostState) },
        topBar = {
            // ── Top bar ───────────────────────────────────────────────
            Surface(
                color = Surface,
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 12.dp, vertical = 12.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    IconButton(onClick = { navController.popBackStack() }) {
                        Icon(
                            Icons.AutoMirrored.Filled.ArrowBack,
                            contentDescription = "Back",
                            tint = Primary
                        )
                    }
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(
                        "Submit Proof of Donation",
                        style = MaterialTheme.typography.titleMedium.copy(
                            fontWeight = FontWeight.Bold,
                            color = OnSurface
                        )
                    )
                }
            }
        },
        bottomBar = {
            // ── Submit button ─────────────────────────────────────────
            val isSubmitting = submitState is SubmitDonationUiState.Submitting
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(Surface.copy(alpha = 0.9f))
                    .padding(horizontal = 24.dp, vertical = 16.dp)
            ) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(60.dp)
                        .clip(RoundedCornerShape(16.dp))
                        .background(
                            Brush.linearGradient(listOf(PrimaryContainer, Primary))
                        )
                        .clickable(enabled = !isSubmitting) {
                            if (selectedPhotos.isEmpty()) {
                                scope.launch {
                                    snackbarHostState.showSnackbar("Please add at least one photo")
                                }
                                return@clickable
                            }
                            if (selectedPaymentMethods.isEmpty()) {
                                scope.launch {
                                    snackbarHostState.showSnackbar("Please select at least one payment method")
                                }
                                return@clickable
                            }
                            if (campaignId != null) {
                                donationViewModel.submitEvidence(
                                    context = context,
                                    campaignId = campaignId,
                                    description = description,
                                    paymentMethods = selectedPaymentMethods,
                                    imageUris = selectedPhotos.map { it.uri }
                                )
                            }
                        },
                    contentAlignment = Alignment.Center
                ) {
                    if (isSubmitting) {
                        CircularProgressIndicator(
                            color = OnPrimary,
                            modifier = Modifier.size(24.dp),
                            strokeWidth = 2.dp
                        )
                    } else {
                        Text(
                            "Submit for Verification",
                            style = MaterialTheme.typography.titleMedium.copy(
                                fontWeight = FontWeight.Bold,
                                color = OnPrimary
                            )
                        )
                    }
                }
            }
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .verticalScroll(rememberScrollState())
                .padding(horizontal = 24.dp)
        ) {
            Spacer(modifier = Modifier.height(8.dp))

            // ── Header ────────────────────────────────────────────────
            Text(
                "Upload Evidence",
                style = MaterialTheme.typography.headlineMedium.copy(
                    fontWeight = FontWeight.ExtraBold,
                    color = OnSurface
                )
            )
            Spacer(modifier = Modifier.height(12.dp))
            Text(
                "Please provide a clear photo or screenshot of your donation receipt (e.g., bank transfer, wire confirmation) for our team to verify.",
                style = MaterialTheme.typography.bodyLarge.copy(
                    color = OnSurfaceVariant,
                    lineHeight = 26.sp
                )
            )

            Spacer(modifier = Modifier.height(28.dp))

            // ── Upload area ───────────────────────────────────────────
            Surface(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(20.dp),
                color = SurfaceContainerLow
            ) {
                Column(
                    modifier = Modifier.padding(28.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    // Camera icon circle
                    Surface(
                        modifier = Modifier.size(80.dp),
                        shape = CircleShape,
                        color = PrimaryFixed
                    ) {
                        Box(contentAlignment = Alignment.Center) {
                            Icon(
                                Icons.Default.CameraAlt,
                                contentDescription = null,
                                tint = Primary,
                                modifier = Modifier.size(36.dp)
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(24.dp))

                    // Take Photo button
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(56.dp)
                            .clip(RoundedCornerShape(14.dp))
                            .background(
                                Brush.linearGradient(listOf(PrimaryContainer, Primary))
                            )
                            .clickable { launchCamera() },
                        contentAlignment = Alignment.Center
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.Center
                        ) {
                            Icon(
                                Icons.Default.PhotoCamera,
                                contentDescription = null,
                                tint = OnPrimary,
                                modifier = Modifier.size(20.dp)
                            )
                            Spacer(modifier = Modifier.width(10.dp))
                            Text(
                                "Take Photo",
                                style = MaterialTheme.typography.titleSmall.copy(
                                    fontWeight = FontWeight.Bold,
                                    color = OnPrimary
                                )
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(12.dp))

                    // Upload from Gallery button
                    Surface(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(56.dp),
                        shape = RoundedCornerShape(14.dp),
                        color = SurfaceContainerHigh,
                        onClick = { galleryLauncher.launch("image/*") }
                    ) {
                        Row(
                            modifier = Modifier.fillMaxSize(),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.Center
                        ) {
                            Icon(
                                Icons.Default.GridView,
                                contentDescription = null,
                                tint = OnSurface,
                                modifier = Modifier.size(20.dp)
                            )
                            Spacer(modifier = Modifier.width(10.dp))
                            Text(
                                "Upload from Gallery",
                                style = MaterialTheme.typography.titleSmall.copy(
                                    fontWeight = FontWeight.Bold,
                                    color = OnSurface
                                )
                            )
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(28.dp))

            // ── Selected files ────────────────────────────────────────
            Text(
                "SELECTED FILES",
                style = MaterialTheme.typography.labelSmall.copy(
                    fontWeight = FontWeight.ExtraBold,
                    letterSpacing = 1.5.sp,
                    color = OnSurfaceVariant
                ),
                modifier = Modifier.padding(start = 4.dp, bottom = 12.dp)
            )

            if (selectedPhotos.isEmpty()) {
                Surface(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(14.dp),
                    color = SurfaceContainerLowest
                ) {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(24.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            "No files selected yet",
                            style = MaterialTheme.typography.bodyMedium,
                            color = OnSurfaceVariant
                        )
                    }
                }
            } else {
                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    selectedPhotos.forEach { photo ->
                        SelectedFileRow(
                            photo = photo,
                            onRemove = {
                                selectedPhotos = selectedPhotos.filter { it.uri != photo.uri }
                            }
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(28.dp))

            // ── Payment Method Selector ──────────────────────────────────
            Text(
                "SELECT PAYMENT METHOD(S)",
                style = MaterialTheme.typography.labelSmall.copy(
                    fontWeight = FontWeight.ExtraBold,
                    letterSpacing = 1.5.sp,
                    color = OnSurfaceVariant
                ),
                modifier = Modifier.padding(start = 4.dp, bottom = 12.dp)
            )

            val campaignState = campaignViewModel.uiState
            if (campaignState is CampaignDetailsUiState.Success) {
                val availableMethods = campaignState.campaign.paiment_methods?.mapNotNull { it.method_type } ?: emptyList()
                
                PaymentMethodSelector(
                    availableMethods = availableMethods,
                    selectedMethods = selectedPaymentMethods,
                    onMethodToggle = { method ->
                        selectedPaymentMethods = if (selectedPaymentMethods.contains(method)) {
                            selectedPaymentMethods - method
                        } else {
                            selectedPaymentMethods + method
                        }
                    }
                )
            } else if (campaignState is CampaignDetailsUiState.Loading) {
                LinearProgressIndicator(modifier = Modifier.fillMaxWidth())
            }

            Spacer(modifier = Modifier.height(28.dp))

            // ── Description ─────────────────────────────────────
            Text(
                "DESCRIPTION",
                style = MaterialTheme.typography.labelSmall.copy(
                    fontWeight = FontWeight.ExtraBold,
                    letterSpacing = 1.5.sp,
                    color = OnSurfaceVariant
                ),
                modifier = Modifier.padding(start = 4.dp, bottom = 12.dp)
            )

            Surface(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                color = SurfaceContainerHighest
            ) {
                TextField(
                    value = description,
                    onValueChange = { description = it },
                    modifier = Modifier
                        .fillMaxWidth()
                        .defaultMinSize(minHeight = 130.dp),
                    placeholder = {
                        Text(
                            "Add any additional details about your transaction...",
                            color = Outline
                        )
                    },
                    colors = TextFieldDefaults.colors(
                        focusedContainerColor = Color.Transparent,
                        unfocusedContainerColor = Color.Transparent,
                        focusedIndicatorColor = Color.Transparent,
                        unfocusedIndicatorColor = Color.Transparent,
                        focusedTextColor = OnSurface,
                        unfocusedTextColor = OnSurface
                    ),
                    maxLines = 6
                )
            }

            Spacer(modifier = Modifier.height(32.dp))
        }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Selected file row
// ─────────────────────────────────────────────────────────────────────────────

@Composable
private fun SelectedFileRow(photo: SelectedPhoto, onRemove: () -> Unit) {
    Surface(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(14.dp),
        color = SurfaceContainerLowest
    ) {
        Row(
            modifier = Modifier.padding(12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Thumbnail
            AsyncImage(
                model = photo.uri,
                contentDescription = null,
                contentScale = ContentScale.Crop,
                modifier = Modifier
                    .size(64.dp)
                    .clip(RoundedCornerShape(10.dp))
                    .background(SurfaceContainerHigh)
            )
            Spacer(modifier = Modifier.width(14.dp))
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    photo.name,
                    style = MaterialTheme.typography.labelLarge.copy(
                        fontWeight = FontWeight.SemiBold,
                        color = OnSurface
                    ),
                    maxLines = 1,
                    overflow = androidx.compose.ui.text.style.TextOverflow.Ellipsis
                )
                Spacer(modifier = Modifier.height(2.dp))
                Text(
                    "${photo.sizeLabel} • Ready to upload",
                    style = MaterialTheme.typography.labelSmall,
                    color = OnSurfaceVariant
                )
            }
            // Remove button
            IconButton(onClick = onRemove) {
                Icon(
                    Icons.Default.Close,
                    contentDescription = "Remove",
                    tint = OnSurfaceVariant,
                    modifier = Modifier.size(20.dp)
                )
            }
        }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper — Uri → SelectedPhoto
// ─────────────────────────────────────────────────────────────────────────────

private fun Uri.toSelectedPhoto(context: Context): SelectedPhoto {
    val cursor = context.contentResolver.query(this, null, null, null, null)
    var name = "photo_${System.currentTimeMillis()}.jpg"
    var size = 0L
    cursor?.use {
        if (it.moveToFirst()) {
            val nameIndex = it.getColumnIndex(android.provider.OpenableColumns.DISPLAY_NAME)
            val sizeIndex = it.getColumnIndex(android.provider.OpenableColumns.SIZE)
            if (nameIndex >= 0) name = it.getString(nameIndex) ?: name
            if (sizeIndex >= 0) size = it.getLong(sizeIndex)
        }
    }
    val sizeLabel = when {
        size >= 1_000_000 -> "${DecimalFormat("#.#").format(size / 1_000_000.0)} MB"
        size >= 1_000     -> "${DecimalFormat("#.#").format(size / 1_000.0)} KB"
        else              -> "$size B"
    }
    return SelectedPhoto(uri = this, name = name, sizeLabel = sizeLabel)
}

// ─────────────────────────────────────────────────────────────────────────────
// Payment method selector
// ─────────────────────────────────────────────────────────────────────────────

@OptIn(ExperimentalLayoutApi::class)
@Composable
private fun PaymentMethodSelector(
    availableMethods: List<String>,
    selectedMethods: List<String>,
    onMethodToggle: (String) -> Unit
) {
    FlowRow(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(8.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        availableMethods.forEach { method ->
            PaymentMethodChip(
                method = method,
                isSelected = selectedMethods.contains(method),
                onClick = { onMethodToggle(method) }
            )
        }
    }
}

@Composable
private fun PaymentMethodChip(
    method: String,
    isSelected: Boolean,
    onClick: () -> Unit
) {
    Surface(
        onClick = onClick,
        shape = RoundedCornerShape(12.dp),
        color = if (isSelected) Primary else SurfaceContainerHigh,
        border = if (isSelected) null else BorderStroke(1.dp, Outline.copy(alpha = 0.2f))
    ) {
        Row(
            modifier = Modifier.padding(horizontal = 16.dp, vertical = 10.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            if (isSelected) {
                Icon(
                    Icons.Default.Check,
                    contentDescription = null,
                    tint = OnPrimary,
                    modifier = Modifier.size(16.dp)
                )
                Spacer(modifier = Modifier.width(8.dp))
            }
            Text(
                method,
                style = MaterialTheme.typography.labelLarge.copy(
                    fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium
                ),
                color = if (isSelected) OnPrimary else OnSurface
            )
        }
    }
}