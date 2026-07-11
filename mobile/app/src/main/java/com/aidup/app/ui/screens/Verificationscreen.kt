package com.aidup.app.ui.screens

import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.animation.*
import androidx.compose.animation.core.*
import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.drawBehind
import androidx.compose.ui.draw.rotate
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.*
import androidx.compose.ui.graphics.drawscope.drawIntoCanvas
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.aidup.app.ui.viewmodels.*

// ─── Root screen (routes between states) ─────────────────────────────────────
@Composable
fun CreateTabStateLoading() {
    Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
        CircularProgressIndicator(color = MaterialTheme.colorScheme.primary)
    }
}

@Composable
fun CreateTabScreen(
    navController: androidx.navigation.NavController,
    isDarkMode: Boolean = false,
    onToggleDarkMode: () -> Unit = {},
    viewModel: CreateTabViewModel = viewModel()
) {
    val state = viewModel.uiState
    val colors = MaterialTheme.colorScheme

    var rotating by remember { mutableStateOf(false) }
    val rotation by animateFloatAsState(
        targetValue = if (rotating) 360f else 0f,
        animationSpec = tween(500, easing = FastOutSlowInEasing),
        finishedListener = { rotating = false },
        label = "theme_rotation"
    )

    Column(modifier = Modifier.fillMaxSize().background(colors.background)) {
        // App Top Bar
        Surface(
            color = colors.background.copy(alpha = 0.92f),
            modifier = Modifier.fillMaxWidth()
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 24.dp, vertical = 16.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        Icons.Default.VolunteerActivism,
                        contentDescription = null,
                        tint = colors.primary,
                        modifier = Modifier.size(26.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        "AidUp",
                        style = MaterialTheme.typography.titleLarge.copy(
                            fontWeight = FontWeight.ExtraBold,
                            color = colors.primary
                        )
                    )
                }
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                    IconButton(onClick = { navController.navigate(com.aidup.app.navigation.Screen.QRLogin.route) }) {
                        Icon(Icons.Default.QrCodeScanner, contentDescription = "QR", tint = colors.primary, modifier = Modifier.size(22.dp))
                    }
                    IconButton(onClick = { rotating = true; onToggleDarkMode() }) {
                        Icon(
                            if (isDarkMode) Icons.Default.LightMode else Icons.Default.DarkMode,
                            contentDescription = "Toggle theme",
                            tint = colors.onSurfaceVariant,
                            modifier = Modifier.size(22.dp).rotate(rotation)
                        )
                    }
                }
            }
        }

        var showCampaignForm by androidx.compose.runtime.remember { androidx.compose.runtime.mutableStateOf(false) }
        
        if (showCampaignForm) {
            CampaignCreationScreen(onBack = { showCampaignForm = false })
        } else {
            AnimatedContent(
                targetState = state,
                transitionSpec = {
                    fadeIn(tween(400)) togetherWith fadeOut(tween(300))
                },
                label = "verification_state",
                modifier = Modifier.weight(1f)
            ) { current ->
                when (current) {
                    CreateTabState.LOADING  -> CreateTabStateLoading()
                    CreateTabState.FORM     -> VerificationFormScreen(onSuccess = { viewModel.checkSituation() })
                    CreateTabState.PENDING  -> PendingScreen()
                    CreateTabState.VERIFIED -> CampaignCreationIntroBlock(onStartCreate = { showCampaignForm = true })
                    CreateTabState.REJECTED -> RejectedScreen(timeLeft = viewModel.rejectionTimeLeft)
                }
            }
        }
    }
}

// ─── Step 1 — Verification Form ──────────────────────────────────────────────
@Composable
fun VerificationFormScreen(
    onSuccess: () -> Unit,
    viewModel: VerificationViewModel = viewModel()
) {
    val colors = MaterialTheme.colorScheme
    val filePicker = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.GetMultipleContents()
    ) { uris ->
        uris.forEach { viewModel.addImage(it) }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(colors.background)
            .verticalScroll(rememberScrollState())
            .padding(bottom = 32.dp)
    ) {
        // ── Editorial header ─────────────────────────────────────────────────
        Column(modifier = Modifier.padding(horizontal = 24.dp, vertical = 28.dp)) {
            Text(
                text = "STEP ONE: TRUST",
                fontSize = 10.sp,
                fontWeight = FontWeight.Bold,
                letterSpacing = 2.sp,
                color = colors.primary
            )
            Spacer(Modifier.height(8.dp))
            Text(
                text = "Verify your\norganizer\nidentity.",
                fontSize = 40.sp,
                fontWeight = FontWeight.ExtraBold,
                lineHeight = 44.sp,
                color = colors.onSurface,
                letterSpacing = (-0.5).sp
            )
            Spacer(Modifier.height(12.dp))
            Text(
                text = "To maintain the integrity of our humanitarian efforts, all campaign organizers must undergo a secure verification process before launching their first initiative.",
                fontSize = 14.sp,
                lineHeight = 22.sp,
                color = colors.onSurfaceVariant
            )
        }

        // ── Verification Roadmap card ─────────────────────────────────────────
        Column(
            modifier = Modifier
                .padding(horizontal = 16.dp)
                .clip(RoundedCornerShape(16.dp))
                .background(colors.surfaceContainerLow)
                .padding(24.dp)
        ) {
            // Card title
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(
                    imageVector = Icons.Outlined.FactCheck,
                    contentDescription = null,
                    tint = colors.primary,
                    modifier = Modifier.size(22.dp)
                )
                Spacer(Modifier.width(10.dp))
                Text(
                    "Verification Roadmap",
                    fontWeight = FontWeight.Bold,
                    fontSize = 17.sp,
                    color = colors.onSurface
                )
            }

            Spacer(Modifier.height(28.dp))

            // ── Timeline ──────────────────────────────────────────────────────
            Box {
                // Vertical connector line
                Box(
                    modifier = Modifier
                        .padding(start = 19.dp)
                        .width(2.dp)
                        .fillMaxHeight()
                        .background(colors.outlineVariant.copy(alpha = 0.3f))
                )

                Column(verticalArrangement = Arrangement.spacedBy(32.dp)) {

                    // Step 1 — Active
                    TimelineStep(
                        icon = Icons.Filled.Person,
                        iconTint = colors.onPrimary,
                        circleBg = colors.primary,
                        isActive = true,
                        title = "Identity Details",
                        subtitle = "Provide your legal information and contact details."
                    ) {
                        // Form card
                        Column(
                            modifier = Modifier
                                .clip(RoundedCornerShape(12.dp))
                                .background(colors.surfaceContainerLowest)
                                .drawBehind {
                                    // Left accent bar
                                    drawRect(
                                        color = Color(0xFFF97316),
                                        topLeft = Offset(0f, 0f),
                                        size = androidx.compose.ui.geometry.Size(6f, size.height)
                                    )
                                }
                                .padding(start = 18.dp, top = 16.dp, end = 16.dp, bottom = 16.dp)
                        ) {
                            AidUpTextField(
                                label = "FULL LEGAL NAME",
                                value = viewModel.name,
                                placeholder = "Johnathan Doe",
                                onValueChange = { viewModel.name = it }
                            )
                            Spacer(Modifier.height(12.dp))
                            AidUpTextField(
                                label = "PHONE NUMBER",
                                value = viewModel.phone,
                                placeholder = "+1 (555) 000-0000",
                                onValueChange = { viewModel.phone = it },
                                keyboardType = androidx.compose.ui.text.input.KeyboardType.Phone
                            )
                        }
                    }

                    // Step 2 — Document Upload
                    TimelineStep(
                        icon = Icons.Outlined.CloudUpload,
                        iconTint = colors.onSurfaceVariant,
                        circleBg = colors.surfaceContainerHighest,
                        isActive = true,
                        alpha = 1f,
                        title = "Document Upload",
                        subtitle = "Upload government-issued ID or organization credentials."
                    ) {
                        // Drop zone
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clip(RoundedCornerShape(12.dp))
                                .border(
                                    width = 2.dp,
                                    color = colors.outlineVariant.copy(alpha = 0.5f),
                                    shape = RoundedCornerShape(12.dp)
                                )
                                .background(colors.surfaceContainerLow.copy(alpha = 0.5f))
                                .clickable { filePicker.launch("image/*") }
                                .padding(vertical = 28.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                Icon(
                                    imageVector = Icons.Outlined.UploadFile,
                                    contentDescription = null,
                                    tint = colors.outlineVariant,
                                    modifier = Modifier.size(40.dp)
                                )
                                Spacer(Modifier.height(8.dp))
                                Text(
                                    if (viewModel.selectedImages.isEmpty()) "Tap to upload" else "${viewModel.selectedImages.size} file(s) selected",
                                    fontWeight = FontWeight.Medium,
                                    color = colors.onSurfaceVariant,
                                    fontSize = 14.sp
                                )
                                Text(
                                    "PDF, PNG, JPG (Max 5 files, 10MB)",
                                    fontSize = 11.sp,
                                    color = colors.onSurfaceVariant.copy(alpha = 0.6f)
                                )
                                if (viewModel.selectedImages.isNotEmpty()) {
                                    Spacer(Modifier.height(8.dp))
                                    viewModel.selectedImages.forEach { uri ->
                                        Text(
                                            "• ${uri.lastPathSegment ?: "image"}",
                                            fontSize = 11.sp,
                                            color = Color(0xFF006E2A),
                                            fontWeight = FontWeight.SemiBold
                                        )
                                    }
                                }
                            }
                        }
                    }

                    // Step 3 — Locked / Manual Review
                    TimelineStep(
                        icon = Icons.Outlined.VerifiedUser,
                        iconTint = colors.onSurfaceVariant,
                        circleBg = colors.surfaceContainerHighest,
                        isActive = false,
                        alpha = 0.4f,
                        title = "Manual Review",
                        subtitle = "Our team typically verifies accounts within 24–48 hours."
                    )
                }
            }

            Spacer(Modifier.height(32.dp))

            // ── Save & Continue button ────────────────────────────────────────
            val uiState = viewModel.uiState
            val buttonGradient = Brush.linearGradient(
                colors = listOf(colors.primaryContainer, Color(0xFF7C2D12)),
                start = Offset(0f, 0f),
                end = Offset(Float.POSITIVE_INFINITY, Float.POSITIVE_INFINITY)
            )
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(54.dp)
                    .clip(RoundedCornerShape(14.dp))
                    .background(buttonGradient)
                    .clickable(enabled = uiState != VerificationUiState.Loading) { 
                        viewModel.submitVerification(onSuccess) 
                    },
                contentAlignment = Alignment.Center
            ) {
                if (uiState == VerificationUiState.Loading) {
                    CircularProgressIndicator(color = Color.White, modifier = Modifier.size(24.dp))
                } else {
                    Text(
                        "Save & Continue",
                        color = Color.White,
                        fontWeight = FontWeight.Bold,
                        fontSize = 15.sp
                    )
                }
            }

            if (uiState is VerificationUiState.Error) {
                Spacer(Modifier.height(8.dp))
                Text(
                    text = uiState.message,
                    color = MaterialTheme.colorScheme.error,
                    fontSize = 12.sp,
                    textAlign = TextAlign.Center,
                    modifier = Modifier.fillMaxWidth()
                )
            }
        }

        Spacer(Modifier.height(24.dp))

        // ── Why Verify? sidebar card ──────────────────────────────────────────
        Column(
            modifier = Modifier
                .padding(horizontal = 16.dp)
                .clip(RoundedCornerShape(16.dp))
                .background(colors.surfaceContainerHighest)
                .padding(24.dp)
        ) {
            Text("Why Verify?", fontWeight = FontWeight.Bold, fontSize = 17.sp, color = colors.onSurface)
            Spacer(Modifier.height(8.dp))
            Text(
                "Verification ensures that every dollar raised on AidUp reaches the intended cause through accountable individuals and organizations.",
                fontSize = 13.sp,
                lineHeight = 20.sp,
                color = colors.onSurfaceVariant
            )
            Spacer(Modifier.height(16.dp))
            WhyVerifyItem("Increases donor trust by 85%")
            Spacer(Modifier.height(10.dp))
            WhyVerifyItem("Fraud prevention protection")
            Spacer(Modifier.height(10.dp))
            WhyVerifyItem("Instant fund withdrawal post-verification")
        }
    }
}

// ─── Step 2 — Pending Screen ──────────────────────────────────────────────────
@Composable
fun PendingScreen() {
    val colors = MaterialTheme.colorScheme
    val infiniteTransition = rememberInfiniteTransition(label = "pulse")

    // Zzz animation fractions
    val frac1 by infiniteTransition.animateFloat(initialValue = 0f, targetValue = 1f, animationSpec = infiniteRepeatable(tween(2000, delayMillis = 0, easing = LinearEasing), RepeatMode.Restart), label = "z1")
    val frac2 by infiniteTransition.animateFloat(initialValue = 0f, targetValue = 1f, animationSpec = infiniteRepeatable(tween(2000, delayMillis = 600, easing = LinearEasing), RepeatMode.Restart), label = "z2")
    val frac3 by infiniteTransition.animateFloat(initialValue = 0f, targetValue = 1f, animationSpec = infiniteRepeatable(tween(2000, delayMillis = 1200, easing = LinearEasing), RepeatMode.Restart), label = "z3")

    fun zAlpha(f: Float): Float = if (f < 0.2f) f / 0.2f else if (f > 0.8f) (1f - f) / 0.2f else 1f

    // Pole color
    val poleColor = colors.primary.copy(alpha = 0.25f)

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(colors.background)
            .verticalScroll(rememberScrollState()),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        // ── Koala on pole illustration with Zzz ──
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(250.dp)
                .offset(y = (-12).dp), // Negative offset to bridge with the Top Bar
            contentAlignment = Alignment.TopCenter
        ) {
            // Koala image — using original colors native to new image, full size
            androidx.compose.foundation.Image(
                painter = androidx.compose.ui.res.painterResource(id = com.aidup.app.R.drawable.koala_pending),
                contentDescription = "Pending Koala",
                modifier = Modifier.fillMaxSize(),
                alignment = Alignment.TopCenter,
                contentScale = androidx.compose.ui.layout.ContentScale.FillWidth
            )
            
            // Zzz floating text
            Text(
                "z",
                fontSize = 14.sp,
                color = colors.primaryContainer,
                fontWeight = FontWeight.Bold,
                modifier = Modifier
                    .align(Alignment.Center)
                    .absoluteOffset(x = 55.dp, y = (-50f - (frac1 * 30f)).dp)
                    .alpha(zAlpha(frac1))
            )
            Text(
                "z",
                fontSize = 18.sp,
                color = Color(0xFF7C2D12),
                fontWeight = FontWeight.Bold,
                modifier = Modifier
                    .align(Alignment.Center)
                    .absoluteOffset(x = 70.dp, y = (-65f - (frac2 * 35f)).dp)
                    .alpha(zAlpha(frac2))
            )
            Text(
                "Z",
                fontSize = 26.sp,
                color = colors.primary,
                fontWeight = FontWeight.Bold,
                modifier = Modifier
                    .align(Alignment.Center)
                    .absoluteOffset(x = 85.dp, y = (-80f - (frac3 * 40f)).dp)
                    .alpha(zAlpha(frac3))
            )
        }

        // ── Content with horizontal padding ──
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 32.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            // Title text moved up closer directly
            Text(
                "Your verification request is being reviewed, thank you for your patience!",
                fontWeight = FontWeight.ExtraBold,
                fontSize = 22.sp,
                color = colors.onSurface,
                letterSpacing = (-0.3).sp,
                lineHeight = 28.sp,
                textAlign = TextAlign.Center
            )

        Spacer(Modifier.height(16.dp))

        // ── Description ──
        Text(
            "Our safety team is currently validating your documentation. We typically finish reviews within 24 hours to ensure the highest standard of trust in our community.",
            fontSize = 14.sp,
            lineHeight = 22.sp,
            color = colors.onSurfaceVariant,
            textAlign = TextAlign.Center
        )

        Spacer(Modifier.height(36.dp))

        // ── Bottom info row: Security Level & Est. Time ──
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(16.dp))
                .background(colors.surfaceContainerLow)
                .padding(20.dp),
            horizontalArrangement = Arrangement.SpaceEvenly,
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Security Level
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Box(
                    modifier = Modifier
                        .size(36.dp)
                        .clip(CircleShape)
                        .background(Color(0xFF006E2A).copy(alpha = 0.12f)),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        Icons.Default.Shield,
                        contentDescription = null,
                        tint = Color(0xFF006E2A),
                        modifier = Modifier.size(20.dp)
                    )
                }
                Spacer(Modifier.height(8.dp))
                Text(
                    "SECURITY\nLEVEL",
                    fontSize = 9.sp,
                    fontWeight = FontWeight.Bold,
                    letterSpacing = 1.sp,
                    color = colors.onSurfaceVariant,
                    textAlign = TextAlign.Center,
                    lineHeight = 12.sp
                )
                Spacer(Modifier.height(4.dp))
                Text(
                    "Enhanced",
                    fontSize = 14.sp,
                    fontWeight = FontWeight.ExtraBold,
                    color = colors.onSurface
                )
            }

            // Divider
            Box(
                modifier = Modifier
                    .width(1.dp)
                    .height(60.dp)
                    .background(colors.outlineVariant.copy(alpha = 0.3f))
            )

            // Est. Time
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Box(
                    modifier = Modifier
                        .size(36.dp)
                        .clip(CircleShape)
                        .background(colors.primary.copy(alpha = 0.12f)),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        Icons.Default.Schedule,
                        contentDescription = null,
                        tint = colors.primary,
                        modifier = Modifier.size(20.dp)
                    )
                }
                Spacer(Modifier.height(8.dp))
                Text(
                    "EST. TIME",
                    fontSize = 9.sp,
                    fontWeight = FontWeight.Bold,
                    letterSpacing = 1.sp,
                    color = colors.onSurfaceVariant,
                    textAlign = TextAlign.Center
                )
                Spacer(Modifier.height(4.dp))
                Text(
                    "~4-8 Hours",
                    fontSize = 14.sp,
                    fontWeight = FontWeight.ExtraBold,
                    color = colors.onSurface
                )
            }
        }

            Spacer(Modifier.height(32.dp))
        }
    }
}

// ─── Step 3 — Campaign Creation Intro ─────────────────────────────────
@Composable
fun CampaignCreationIntroBlock(onStartCreate: () -> Unit) {
    val colors = MaterialTheme.colorScheme
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(colors.background),
        contentAlignment = Alignment.Center
    ) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Icon(
                imageVector = Icons.Outlined.AddCircleOutline,
                contentDescription = null,
                tint = colors.primary,
                modifier = Modifier.size(56.dp)
            )
            Spacer(Modifier.height(16.dp))
            Text(
                "Create a Campaign",
                fontWeight = FontWeight.ExtraBold,
                fontSize = 26.sp,
                color = colors.onSurface
            )
            Spacer(Modifier.height(8.dp))
            Text(
                "Your account is verified. Start your first humanitarian campaign.",
                fontSize = 14.sp,
                color = colors.onSurfaceVariant,
                textAlign = TextAlign.Center,
            )
            Spacer(Modifier.height(24.dp))
            Button(
                onClick = onStartCreate,
                shape = RoundedCornerShape(14.dp),
                colors = ButtonDefaults.buttonColors(containerColor = colors.primary),
                modifier = Modifier.fillMaxWidth(0.8f).height(54.dp)
            ) {
                Text("CREATE CAMPAIGN", fontWeight = FontWeight.Bold)
            }
        }
    }
}

@Composable
fun RejectedScreen(timeLeft: String) {
    val colors = MaterialTheme.colorScheme
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(colors.background)
            .padding(32.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Icon(
            imageVector = Icons.Default.Error,
            contentDescription = null,
            tint = colors.error,
            modifier = Modifier.size(64.dp)
        )
        Spacer(Modifier.height(24.dp))
        Text(
            "Account Rejected",
            fontWeight = FontWeight.ExtraBold,
            fontSize = 28.sp,
            color = colors.onSurface
        )
        Spacer(Modifier.height(12.dp))
        Text(
            "Your verification was rejected by our team. Please wait $timeLeft until you can try again.",
            fontSize = 14.sp,
            lineHeight = 22.sp,
            color = colors.onSurfaceVariant,
            textAlign = TextAlign.Center
        )
    }
}

// ─── Reusable: Timeline Step ──────────────────────────────────────────────────
@Composable
fun TimelineStep(
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    iconTint: Color,
    circleBg: Color,
    isActive: Boolean,
    alpha: Float = if (isActive) 1f else 0.4f,
    title: String,
    subtitle: String,
    content: (@Composable () -> Unit)? = null
) {
    val colors = MaterialTheme.colorScheme
    Row(
        modifier = Modifier.alpha(alpha),
        horizontalArrangement = Arrangement.spacedBy(16.dp),
        verticalAlignment = Alignment.Top
    ) {
        // Circle icon
        Box(
            modifier = Modifier
                .size(40.dp)
                .clip(CircleShape)
                .background(circleBg)
                .then(
                    if (isActive && circleBg == colors.primary) Modifier.drawBehind {
                        drawCircle(
                            color = Color(0xFFF97316).copy(alpha = 0.25f),
                            radius = size.minDimension / 1.4f
                        )
                    } else Modifier
                ),
            contentAlignment = Alignment.Center
        ) {
            Icon(icon, contentDescription = null, tint = iconTint, modifier = Modifier.size(20.dp))
        }

        Column(modifier = Modifier.weight(1f)) {
            Text(title, fontWeight = FontWeight.Bold, fontSize = 16.sp, color = colors.onSurface)
            Spacer(Modifier.height(2.dp))
            Text(subtitle, fontSize = 12.sp, color = colors.onSurfaceVariant, lineHeight = 18.sp)
            if (content != null) {
                Spacer(Modifier.height(12.dp))
                content()
            }
        }
    }
}

// ─── Reusable: AidUp text field ───────────────────────────────────────────────
@Composable
fun AidUpTextField(
    label: String,
    value: String,
    placeholder: String,
    onValueChange: (String) -> Unit,
    keyboardType: androidx.compose.ui.text.input.KeyboardType = androidx.compose.ui.text.input.KeyboardType.Text
) {
    val colors = MaterialTheme.colorScheme
    Column {
        Text(
            label,
            fontSize = 10.sp,
            fontWeight = FontWeight.Bold,
            letterSpacing = 1.2.sp,
            color = colors.onSurfaceVariant
        )
        Spacer(Modifier.height(6.dp))
        BasicTextField(
            value = value,
            onValueChange = onValueChange,
            keyboardOptions = KeyboardOptions(keyboardType = keyboardType),
            textStyle = androidx.compose.ui.text.TextStyle(
                color = colors.onSurface,
                fontSize = 14.sp
            ),
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(10.dp))
                .background(colors.surfaceContainerHighest)
                .padding(horizontal = 14.dp, vertical = 12.dp)
        ) { innerTextField ->
            Box {
                if (value.isEmpty()) {
                    Text(placeholder, fontSize = 14.sp, color = colors.onSurfaceVariant.copy(alpha = 0.5f))
                }
                innerTextField()
            }
        }
    }
}

// ─── Reusable: Why Verify item ────────────────────────────────────────────────
@Composable
fun WhyVerifyItem(text: String) {
    val colors = MaterialTheme.colorScheme
    Row(verticalAlignment = Alignment.CenterVertically) {
        Icon(
            imageVector = Icons.Filled.Verified,
            contentDescription = null,
            tint = Color(0xFF006E2A),
            modifier = Modifier.size(18.dp)
        )
        Spacer(Modifier.width(10.dp))
        Text(text, fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = colors.onSurface)
    }
}

// ─── Preview ──────────────────────────────────────────────────────────────────
@Preview(showBackground = true, widthDp = 390, heightDp = 844)
@Composable
fun PreviewVerificationForm() {
    MaterialTheme {
        VerificationFormScreen(onSuccess = {})
    }
}