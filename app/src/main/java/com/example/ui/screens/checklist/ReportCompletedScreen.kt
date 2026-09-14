package com.example.ui.screens.checklist

import android.widget.Toast
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.CloudUpload
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.PictureAsPdf
import androidx.compose.material.icons.filled.Share
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.R
import com.example.ui.AppScreen
import com.example.ui.MainViewModel
import com.example.ui.theme.PmpiBlue
import com.example.ui.theme.PmpiBlueContainer
import com.example.ui.theme.PmpiBlueDark
import com.example.ui.theme.PmpiGreen
import com.example.ui.theme.PmpiGreenContainer
import com.example.ui.theme.PmpiOutline
import com.example.ui.theme.PmpiSurfaceVariant
import com.example.util.PdfOpener
import java.io.File

@Composable
fun ReportCompletedScreen(
    viewModel: MainViewModel,
    onNavigateHome: () -> Unit
) {
    val context = LocalContext.current
    val record by viewModel.lastCompletedRecord.collectAsState()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color.White)
            .verticalScroll(rememberScrollState())
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Spacer(modifier = Modifier.height(24.dp))

        // Success badge circle
        Box(
            modifier = Modifier
                .size(90.dp)
                .clip(CircleShape)
                .background(PmpiGreenContainer),
            contentAlignment = Alignment.Center
        ) {
            Icon(
                imageVector = Icons.Default.Check,
                contentDescription = null,
                tint = PmpiGreen,
                modifier = Modifier.size(54.dp)
            )
        }

        Spacer(modifier = Modifier.height(20.dp))

        Text(
            text = "RELATÓRIO FINALIZADO COM SUCESSO",
            fontSize = 20.sp,
            fontWeight = FontWeight.ExtraBold,
            color = PmpiBlueDark,
            textAlign = TextAlign.Center,
            letterSpacing = 0.5.sp,
            modifier = Modifier.testTag("report_success_title")
        )

        Spacer(modifier = Modifier.height(6.dp))

        Text(
            text = "O checklist foi gravado com segurança e o arquivo PDF oficial foi gerado.",
            fontSize = 13.sp,
            color = Color.Gray,
            textAlign = TextAlign.Center
        )

        Spacer(modifier = Modifier.height(24.dp))

        // Report details summary card
        if (record != null) {
            val rec = record!!
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .testTag("report_details_card"),
                shape = RoundedCornerShape(12.dp),
                colors = CardDefaults.cardColors(containerColor = PmpiSurfaceVariant),
                border = androidx.compose.foundation.BorderStroke(1.dp, PmpiOutline)
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    DetailRow(label = "Número do Relatório:", value = "Nº ${rec.reportNumber}")
                    DetailRow(label = "Viatura:", value = "${rec.vehiclePrefix} — ${rec.vehicleModel}")
                    DetailRow(label = "Placa:", value = rec.vehiclePlate)
                    DetailRow(label = "Unidade / Batalhão:", value = rec.unitName)
                    DetailRow(label = "Responsável:", value = "${rec.responsibleRank} ${rec.responsibleName}")
                    DetailRow(label = "Data e Hora da Finalização:", value = rec.completedDateFormatted, isHighlighted = true)
                }
            }
        }

        Spacer(modifier = Modifier.height(28.dp))

        // 4 Action Buttons
        Column(
            modifier = Modifier.fillMaxWidth(),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            // 1. COMPARTILHAR
            Button(
                onClick = {
                    record?.let {
                        val pdfFile = viewModel.ensurePdfFile(it)
                        PdfOpener.sharePdf(context, pdfFile)
                    }
                },
                colors = ButtonDefaults.buttonColors(containerColor = PmpiBlue),
                modifier = Modifier
                    .fillMaxWidth()
                    .height(52.dp)
                    .testTag("btn_share_pdf"),
                shape = RoundedCornerShape(10.dp)
            ) {
                Icon(imageVector = Icons.Default.Share, contentDescription = null, tint = Color.White)
                Spacer(modifier = Modifier.width(10.dp))
                Text("COMPARTILHAR PDF", fontSize = 14.sp, fontWeight = FontWeight.Bold, color = Color.White)
            }

            // 2. VISUALIZAR PDF
            OutlinedButton(
                onClick = {
                    record?.let {
                        val pdfFile = viewModel.ensurePdfFile(it)
                        PdfOpener.viewPdf(context, pdfFile)
                    }
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(52.dp)
                    .testTag("btn_view_pdf"),
                shape = RoundedCornerShape(10.dp),
                border = androidx.compose.foundation.BorderStroke(1.5.dp, PmpiBlue)
            ) {
                Icon(imageVector = Icons.Default.PictureAsPdf, contentDescription = null, tint = PmpiBlue)
                Spacer(modifier = Modifier.width(10.dp))
                Text("VISUALIZAR PDF", fontSize = 14.sp, fontWeight = FontWeight.Bold, color = PmpiBlue)
            }

            // 3. SALVAR NA NUVEM (Aviso amigável)
            OutlinedButton(
                onClick = {
                    Toast.makeText(
                        context,
                        "Função de armazenamento em nuvem disponível em atualização futura.",
                        Toast.LENGTH_LONG
                    ).show()
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(52.dp)
                    .testTag("btn_save_cloud"),
                shape = RoundedCornerShape(10.dp),
                border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF64748B))
            ) {
                Icon(imageVector = Icons.Default.CloudUpload, contentDescription = null, tint = Color(0xFF475569))
                Spacer(modifier = Modifier.width(10.dp))
                Text("SALVAR NA NUVEM", fontSize = 14.sp, fontWeight = FontWeight.SemiBold, color = Color(0xFF334155))
            }

            // 4. VOLTAR (Tela Inicial)
            TextButton(
                onClick = onNavigateHome,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(48.dp)
                    .testTag("btn_back_home")
            ) {
                Icon(imageVector = Icons.Default.Home, contentDescription = null, tint = PmpiBlue)
                Spacer(modifier = Modifier.width(8.dp))
                Text("VOLTAR À TELA INICIAL", fontSize = 14.sp, fontWeight = FontWeight.Bold, color = PmpiBlue)
            }
        }

        Spacer(modifier = Modifier.height(24.dp))
    }
}

@Composable
private fun DetailRow(
    label: String,
    value: String,
    isHighlighted: Boolean = false
) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(
            text = label,
            fontSize = 12.sp,
            color = Color(0xFF475569),
            fontWeight = FontWeight.Medium
        )
        Text(
            text = value,
            fontSize = 13.sp,
            fontWeight = if (isHighlighted) FontWeight.Bold else FontWeight.SemiBold,
            color = if (isHighlighted) PmpiBlueDark else Color(0xFF0F172A),
            textAlign = TextAlign.End
        )
    }
}
