package uz.goldlavash.app

import android.Manifest
import android.app.AlertDialog
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Bundle
import android.os.Message
import android.provider.MediaStore
import android.view.View
import android.webkit.JsPromptResult
import android.webkit.JsResult
import android.webkit.PermissionRequest
import android.webkit.ValueCallback
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.Button
import android.widget.EditText
import android.widget.ProgressBar
import androidx.activity.result.ActivityResultLauncher
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.core.content.FileProvider
import java.io.File
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

/**
 * Отдельный экран для страниц, которые открываются через window.open()
 * из основного WebView (Карточка ОС, Фото ОС, Печать наклеек).
 * Открывается ПОВЕРХ MainActivity, а не внутри его WebView — так сессия
 * входа в главном приложении не теряется, и есть явная кнопка "Назад".
 */
class PopupActivity : AppCompatActivity() {

    companion object {
        const val EXTRA_URL = "url"
    }

    private lateinit var webView: WebView
    private lateinit var progressBar: ProgressBar

    private var filePathCallback: ValueCallback<Array<Uri>>? = null
    private var pendingCameraUri: Uri? = null
    private var lastAcceptTypes: Array<String> = arrayOf("image/*")
    private var lastAllowMultiple: Boolean = false

    private val cameraPermissionLauncher: ActivityResultLauncher<String> =
        registerForActivityResult(ActivityResultContracts.RequestPermission()) { granted ->
            if (granted) launchFileChooserIntents(lastAcceptTypes, lastAllowMultiple)
            else launchFileChooserIntents(lastAcceptTypes, lastAllowMultiple, includeCamera = false)
        }

    private val fileChooserLauncher: ActivityResultLauncher<Intent> =
        registerForActivityResult(ActivityResultContracts.StartActivityForResult()) { result ->
            var resultUris: Array<Uri>? = null
            if (result.resultCode == RESULT_OK) {
                val data = result.data
                if (data == null || data.data == null && data.clipData == null) {
                    pendingCameraUri?.let { resultUris = arrayOf(it) }
                } else {
                    val clip = data.clipData
                    if (clip != null) {
                        resultUris = Array(clip.itemCount) { i -> clip.getItemAt(i).uri }
                    } else if (data.data != null) {
                        resultUris = arrayOf(data.data!!)
                    }
                }
            }
            filePathCallback?.onReceiveValue(resultUris)
            filePathCallback = null
            pendingCameraUri = null
        }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_popup)

        webView = findViewById(R.id.popupWebView)
        progressBar = findViewById(R.id.popupProgressBar)
        findViewById<Button>(R.id.popupBackButton).setOnClickListener { finish() }

        setupWebView()

        val url = intent.getStringExtra(EXTRA_URL)
        if (url != null) webView.loadUrl(url) else finish()
    }

    private fun setupWebView() {
        val s: WebSettings = webView.settings
        s.javaScriptEnabled = true
        s.domStorageEnabled = true
        s.setSupportZoom(true)
        s.builtInZoomControls = true
        s.displayZoomControls = false

        webView.webViewClient = object : WebViewClient() {
            override fun onPageFinished(view: WebView?, url: String?) {
                super.onPageFinished(view, url)
                progressBar.visibility = View.GONE
            }
        }

        webView.webChromeClient = object : WebChromeClient() {
            override fun onShowFileChooser(
                view: WebView?,
                callback: ValueCallback<Array<Uri>>?,
                params: FileChooserParams?
            ): Boolean {
                filePathCallback?.onReceiveValue(null)
                filePathCallback = callback

                val acceptTypes = params?.acceptTypes?.filter { it.isNotBlank() }?.toTypedArray()
                    ?: arrayOf("image/*")
                val allowMultiple = params?.mode == FileChooserParams.MODE_OPEN_MULTIPLE
                lastAcceptTypes = if (acceptTypes.isEmpty()) arrayOf("image/*") else acceptTypes
                lastAllowMultiple = allowMultiple

                val wantsCamera = params?.isCaptureEnabled == true ||
                    lastAcceptTypes.any { it.startsWith("image") }

                if (wantsCamera && ContextCompat.checkSelfPermission(
                        this@PopupActivity, Manifest.permission.CAMERA
                    ) != PackageManager.PERMISSION_GRANTED
                ) {
                    cameraPermissionLauncher.launch(Manifest.permission.CAMERA)
                } else {
                    launchFileChooserIntents(lastAcceptTypes, allowMultiple, includeCamera = wantsCamera)
                }
                return true
            }

            override fun onPermissionRequest(request: PermissionRequest?) {
                request?.deny()
            }

            override fun onJsAlert(
                view: WebView?, url: String?, message: String?, result: JsResult?
            ): Boolean {
                AlertDialog.Builder(this@PopupActivity)
                    .setMessage(message)
                    .setPositiveButton("OK") { _, _ -> result?.confirm() }
                    .setOnCancelListener { result?.cancel() }
                    .setCancelable(false)
                    .show()
                return true
            }

            override fun onJsConfirm(
                view: WebView?, url: String?, message: String?, result: JsResult?
            ): Boolean {
                AlertDialog.Builder(this@PopupActivity)
                    .setMessage(message)
                    .setPositiveButton("OK") { _, _ -> result?.confirm() }
                    .setNegativeButton("Отмена") { _, _ -> result?.cancel() }
                    .setOnCancelListener { result?.cancel() }
                    .setCancelable(false)
                    .show()
                return true
            }

            override fun onJsPrompt(
                view: WebView?,
                url: String?,
                message: String?,
                defaultValue: String?,
                result: JsPromptResult?
            ): Boolean {
                val input = EditText(this@PopupActivity)
                input.setText(defaultValue)
                AlertDialog.Builder(this@PopupActivity)
                    .setMessage(message)
                    .setView(input)
                    .setPositiveButton("OK") { _, _ -> result?.confirm(input.text.toString()) }
                    .setNegativeButton("Отмена") { _, _ -> result?.cancel() }
                    .setOnCancelListener { result?.cancel() }
                    .setCancelable(false)
                    .show()
                return true
            }
        }
    }

    private fun launchFileChooserIntents(
        acceptTypes: Array<String>,
        allowMultiple: Boolean,
        includeCamera: Boolean = true
    ) {
        val mimeType = acceptTypes.firstOrNull { it.contains("/") } ?: "image/*"

        val contentIntent = Intent(Intent.ACTION_GET_CONTENT).apply {
            addCategory(Intent.CATEGORY_OPENABLE)
            type = mimeType
            putExtra(Intent.EXTRA_ALLOW_MULTIPLE, allowMultiple)
        }

        val intentsToShow = mutableListOf<Intent>()
        if (includeCamera) {
            createCameraCaptureIntent()?.let { intentsToShow.add(it) }
        }

        val chooser = Intent.createChooser(contentIntent, "Выберите фото")
        if (intentsToShow.isNotEmpty()) {
            chooser.putExtra(Intent.EXTRA_INITIAL_INTENTS, intentsToShow.toTypedArray())
        }
        fileChooserLauncher.launch(chooser)
    }

    private fun createCameraCaptureIntent(): Intent? {
        val captureIntent = Intent(MediaStore.ACTION_IMAGE_CAPTURE)
        if (captureIntent.resolveActivity(packageManager) == null) return null

        val timeStamp = SimpleDateFormat("yyyyMMdd_HHmmss", Locale.US).format(Date())
        val imagesDir = (getExternalFilesDir("images") ?: filesDir).apply { mkdirs() }
        val photoFile = File.createTempFile("OS_${timeStamp}_", ".jpg", imagesDir)
        val photoUri = FileProvider.getUriForFile(this, "$packageName.fileprovider", photoFile)
        pendingCameraUri = photoUri
        captureIntent.putExtra(MediaStore.EXTRA_OUTPUT, photoUri)
        captureIntent.addFlags(Intent.FLAG_GRANT_WRITE_URI_PERMISSION)
        return captureIntent
    }

    override fun onBackPressed() {
        if (webView.canGoBack()) webView.goBack() else super.onBackPressed()
    }
}
