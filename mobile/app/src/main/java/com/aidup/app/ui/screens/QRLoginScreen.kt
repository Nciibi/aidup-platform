package com.aidup.app.ui.screens

import androidx.compose.animation.core.*
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.*
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.drawWithContent
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import android.Manifest
import android.util.Log
import androidx.camera.core.CameraSelector
import androidx.camera.core.ImageAnalysis
import androidx.camera.core.Preview
import androidx.camera.lifecycle.ProcessCameraProvider
import androidx.camera.view.PreviewView
import androidx.compose.ui.viewinterop.AndroidView
import androidx.core.content.ContextCompat
import androidx.lifecycle.compose.LocalLifecycleOwner
import com.google.accompanist.permissions.ExperimentalPermissionsApi
import com.google.accompanist.permissions.isGranted
import com.google.accompanist.permissions.rememberPermissionState
import androidx.lifecycle.viewmodel.compose.viewModel
import com.aidup.app.ui.viewmodels.QrUiState
import com.aidup.app.ui.viewmodels.QrViewModel
import com.aidup.app.utils.QrCodeAnalyzer
import kotlinx.coroutines.delay
import androidx.compose.ui.platform.LocalContext
import androidx.navigation.NavController
import com.aidup.app.navigation.Screen
import com.aidup.app.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class, ExperimentalPermissionsApi::class)
@Composable
fun QRLoginScreen(
    navController: NavController,
    viewModel: QrViewModel = viewModel()
) {
    val uiState = viewModel.uiState
    val cameraPermissionState = rememberPermissionState(Manifest.permission.CAMERA)

    LaunchedEffect(Unit) {
        if (!cameraPermissionState.status.isGranted) {
            cameraPermissionState.launchPermissionRequest()
        }
        viewModel.startScan()
    }

    Scaffold(
        containerColor = Background,
        topBar = {
            TopAppBar(
                title = { Text("Secure Login", style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.Bold)) },
                navigationIcon = {
                    IconButton(onClick = { navController.popBackStack() }) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back", tint = PrimaryContainer)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = Background)
            )
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(horizontal = 24.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Spacer(modifier = Modifier.height(16.dp))

            Text("Secure QR Login", style = MaterialTheme.typography.headlineMedium.copy(fontWeight = FontWeight.ExtraBold), color = OnSurface)
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                "Position the QR code shown on your PC browser within the square below to sign in instantly.",
                style = MaterialTheme.typography.bodyMedium,
                color = OnSurfaceVariant,
                textAlign = androidx.compose.ui.text.style.TextAlign.Center,
                modifier = Modifier.padding(horizontal = 16.dp)
            )

            Spacer(modifier = Modifier.height(32.dp))

            // Scanner box
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .aspectRatio(1f)
                    .clip(RoundedCornerShape(24.dp))
            ) {
                if (cameraPermissionState.status.isGranted) {
                    CameraPreview(onQrScanned = { result ->
                        viewModel.onQrScanned(result)
                    })
                } else {
                    Box(modifier = Modifier.fillMaxSize().background(Color.Black), contentAlignment = Alignment.Center) {
                        Text("Camera permission required", color = Color.White)
                    }
                }

                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(32.dp)
                        .background(Color.White.copy(alpha = 0.1f))
                        .border(2.dp, PrimaryContainer.copy(alpha = 0.2f), RoundedCornerShape(16.dp))
                ) {
                    val infiniteTransition = rememberInfiniteTransition(label = "scan")
                    val offsetY by infiniteTransition.animateFloat(
                        initialValue = 0f,
                        targetValue = 1f,
                        animationSpec = infiniteRepeatable(
                            animation = tween(2000, easing = LinearEasing),
                            repeatMode = RepeatMode.Restart
                        ),
                        label = "scanLine"
                    )

                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(2.dp)
                            .align(Alignment.TopCenter)
                            .graphicsLayer {
                                translationY = offsetY * (size.height - 2.dp.toPx())
                            }
                            .background(Brush.horizontalGradient(listOf(Color.Transparent, PrimaryContainer, Color.Transparent)))
                    )

                    val cornerModifier = Modifier.size(32.dp).border(BorderStroke(4.dp, PrimaryContainer))
                    Box(modifier = cornerModifier.align(Alignment.TopStart).offset(x = (-2).dp, y = (-2).dp))
                    Box(modifier = cornerModifier.align(Alignment.TopEnd).offset(x = 2.dp, y = (-2).dp))
                    Box(modifier = cornerModifier.align(Alignment.BottomStart).offset(x = (-2).dp, y = 2.dp))
                    Box(modifier = cornerModifier.align(Alignment.BottomEnd).offset(x = 2.dp, y = 2.dp))
                }
            }

            Spacer(modifier = Modifier.height(32.dp))

            // State feedback
            when (val state = uiState) {
                is QrUiState.Scanning -> {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.QrCodeScanner, contentDescription = null, tint = PrimaryContainer, modifier = Modifier.size(20.dp))
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("Scanning for code...", style = MaterialTheme.typography.labelLarge.copy(fontWeight = FontWeight.Medium), color = PrimaryContainer)
                    }
                }
                is QrUiState.Validating -> {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        CircularProgressIndicator(color = PrimaryContainer, modifier = Modifier.size(20.dp))
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("Validating...", style = MaterialTheme.typography.labelLarge.copy(fontWeight = FontWeight.Medium), color = PrimaryContainer)
                    }
                }
                is QrUiState.AwaitingApproval -> {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text("Login attempt detected", style = MaterialTheme.typography.titleMedium, color = OnSurface)
                        Spacer(modifier = Modifier.height(16.dp))
                        Button(
                            onClick = { viewModel.approveLogin(state.sessionId) },
                            colors = ButtonDefaults.buttonColors(containerColor = PrimaryContainer)
                        ) {
                            Text("Approve Login", color = OnPrimary)
                        }
                    }
                }
                is QrUiState.Approved -> {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.CheckCircle, contentDescription = null, tint = Secondary, modifier = Modifier.size(24.dp))
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("Login Approved! Redirecting...", style = MaterialTheme.typography.labelLarge, color = Secondary)
                    }
                    LaunchedEffect(Unit) {
                        delay(1500)
                        navController.popBackStack()
                    }
                }
                is QrUiState.Error -> {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(Icons.Default.Warning, contentDescription = null, tint = MaterialTheme.colorScheme.error, modifier = Modifier.size(20.dp))
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(state.message, style = MaterialTheme.typography.labelMedium, color = MaterialTheme.colorScheme.error)
                        }
                        Spacer(modifier = Modifier.height(8.dp))
                        TextButton(onClick = { viewModel.startScan() }) {
                            Text("Scan Again", color = Primary)
                        }
                    }
                }
                else -> {}
            }

            // ── Everything below pushed to bottom ─────────────────────────
            Spacer(modifier = Modifier.weight(1f))

            // Footer — kept, OTP link removed
            Surface(
                color = SurfaceContainerLow,
                shape = RoundedCornerShape(full),
                border = BorderStroke(1.dp, OutlineVariant.copy(alpha = 0.1f))
            ) {
                Row(
                    modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(Icons.Default.Lock, contentDescription = null, tint = Secondary, modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        "Encrypted & Secure Session",
                        style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.SemiBold),
                        color = OnSurfaceVariant
                    )
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.Center
            ) {
                Icon(Icons.Default.Token, contentDescription = null, tint = PrimaryContainer, modifier = Modifier.size(24.dp))
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    "AidUp",
                    style = MaterialTheme.typography.titleLarge.copy(
                        fontWeight = FontWeight.Black,
                        letterSpacing = (-1).sp
                    ),
                    color = PrimaryContainer
                )
            }

            Spacer(modifier = Modifier.height(24.dp))
        }
    }
}

@Composable
fun CameraPreview(onQrScanned: (String) -> Unit) {
    val context = LocalContext.current
    val lifecycleOwner = LocalLifecycleOwner.current

    AndroidView(
        factory = { ctx ->
            PreviewView(ctx).apply {
                val cameraProviderFuture = ProcessCameraProvider.getInstance(ctx)
                cameraProviderFuture.addListener({
                    val cameraProvider = cameraProviderFuture.get()
                    val preview = Preview.Builder().build().also {
                        it.setSurfaceProvider(surfaceProvider)
                    }
                    val imageAnalysis = ImageAnalysis.Builder()
                        .setBackpressureStrategy(ImageAnalysis.STRATEGY_KEEP_ONLY_LATEST)
                        .build()
                    imageAnalysis.setAnalyzer(
                        ContextCompat.getMainExecutor(ctx),
                        QrCodeAnalyzer { result -> onQrScanned(result) }
                    )
                    try {
                        cameraProvider.unbindAll()
                        cameraProvider.bindToLifecycle(
                            lifecycleOwner,
                            CameraSelector.DEFAULT_BACK_CAMERA,
                            preview,
                            imageAnalysis
                        )
                    } catch (exc: Exception) {
                        Log.e("CameraPreview", "Use case binding failed", exc)
                    }
                }, ContextCompat.getMainExecutor(ctx))
            }
        },
        modifier = Modifier.fillMaxSize()
    )
}