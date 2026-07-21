package uz.goldlavash.app

import android.Manifest
import android.app.AlertDialog
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.net.ConnectivityManager
import android.net.Uri
import android.net.http.SslError
import android.os.Bundle
import android.os.Message
import android.provider.MediaStore
import android.view.View
import android.webkit.JsPromptResult
import android.webkit.JsResult
import android.webkit.PermissionRequest
import android.webkit.SslErrorHandler
import android.webkit.ValueCallback
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.Button
import android.widget.EditText
import android.widget.LinearLayout
import android.widget.ProgressBar
import androidx.activity.result.ActivityResultLauncher
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.core.content.FileProvider
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout
import java.io.File
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

/**
 * Обёртка (WebView) над веб-системой GOLD LAVASH.
 * Открывает мобильную версию системы (?mobile=1) и даёт нативный доступ
 * к камере телефона для полей вида <input type="file" capture="environment">
 * (загрузка фото ОС, инвентаризация и т.д.) — обычный WebView без этого
 * кода камеру не откроет, а покажет только выбор файла из галереи.
 */
class MainActivity : AppCompatActivity() {

    private lateinit var webView: WebView
    private lateinit var swipeRefresh: SwipeRefreshLayout
    private lateinit var progressBar: ProgressBar
    private lateinit var offlineView: LinearLayout

    private var filePathCallback: ValueCallback<Array<Uri>>? = null
    private var pendingCameraUri: Uri? = null

    private val cameraPermissionLauncher: ActivityResultLauncher<String> =
        registerForActivityResult(ActivityResultContracts.RequestPermission()) { granted ->
            if (granted) launchFileChooserIntents(lastAcceptTypes, lastAllowMultiple)
            else launchFileChooserIntents(lastAcceptTypes, lastAllowMultiple, includeCamera = false)
        }

    private var lastAcceptTypes: Array<String> = arrayOf("image/*")
    private var lastAllowMultiple: Boolean = false

    private val fileChooserLauncher: ActivityResultLauncher<Intent> =
        registerForActivityResult(ActivityResultContracts.StartActivityForResult()) { result ->
            var resultUris: Array<Uri>? = null
            if (result.resultCode == RESULT_OK) {
                val data = result.data
                if (data == null || data.data == null && data.clipData == null) {
                    // Снято на камеру — результата в data нет, файл лежит по pendingCameraUri
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
        setContentView(R.layout.activity_main)

        webView = findViewById(R.id.webView)
        swipeRefresh = findViewById(R.id.swipeRefresh)
        progressBar = findViewById(R.id.progressBar)
        offlineView = findViewById(R.id.offlineView)

        findViewById<Button>(R.id.retryButton).setOnClickListener { loadApp() }
        // Свайп-обновление перезагружает страницу целиком, а сессия входа
        // хранится только в памяти открытой страницы (не в localStorage) —
        // после такой перезагрузки система разлогинивает пользователя.
        // Поэтому жест отключаем; сам SwipeRefreshLayout оставляем только
        // как контейнер layout'а.
        swipeRefresh.isEnabled = false

        setupWebView()
        loadApp()
    }

    private fun setupWebView() {
        val s: WebSettings = webView.settings
        s.javaScriptEnabled = true
        s.domStorageEnabled = true
        s.databaseEnabled = true
        s.mediaPlaybackRequiresUserGesture = false
        s.cacheMode = WebSettings.LOAD_DEFAULT
        // Позволяем щипком увеличивать мелкие кнопки/текст (сама страница
        // рассчитана на десктоп, не на телефон) — кнопки зума скрыты,
        // остаётся только жест "щипок".
        s.setSupportZoom(true)
        s.builtInZoomControls = true
        s.displayZoomControls = false
        s.setSupportMultipleWindows(true)

        webView.webViewClient = object : WebViewClient() {
            override fun onPageFinished(view: WebView?, url: String?) {
                super.onPageFinished(view, url)
                progressBar.visibility = View.GONE
                swipeRefresh.isRefreshing = false
            }

            override fun onReceivedSslError(view: WebView?, handler: SslErrorHandler?, error: SslError?) {
                // Google-домены — доверенный HTTPS, ошибок сертификата тут не бывает.
                // Отклоняем по умолчанию (безопасное поведение), ничего не переопределяем.
                super.onReceivedSslError(view, handler, error)
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
                        this@MainActivity, Manifest.permission.CAMERA
                    ) != PackageManager.PERMISSION_GRANTED
                ) {
                    cameraPermissionLauncher.launch(Manifest.permission.CAMERA)
                } else {
                    launchFileChooserIntents(lastAcceptTypes, allowMultiple, includeCamera = wantsCamera)
                }
                return true
            }

            override fun onPermissionRequest(request: PermissionRequest?) {
                // JS getUserMedia() не используется в системе (фото идёт через
                // input[type=file][capture]) — отклоняем на всякий случай.
                request?.deny()
            }

            // Обычный WebView молча игнорирует window.open()/target=_blank —
            // именно так открываются страницы "Карточка ОС", "Фото", "Печать
            // наклеек". Перехватываем адрес и грузим его в том же WebView.
            override fun onCreateWindow(
                view: WebView?,
                isDialog: Boolean,
                isUserGesture: Boolean,
                resultMsg: Message?
            ): Boolean {
                val transport = resultMsg?.obj as? WebView.WebViewTransport
                val popupWebView = WebView(this@MainActivity)
                popupWebView.webViewClient = object : WebViewClient() {
                    override fun shouldOverrideUrlLoading(
                        v: WebView?,
                        request: WebResourceRequest?
                    ): Boolean {
                        request?.url?.let { webView.loadUrl(it.toString()) }
                        return true
                    }
                }
                transport?.webView = popupWebView
                resultMsg?.sendToTarget()
                return true
            }

            // Без этих трёх переопределений confirm()/alert()/prompt() из
            // веб-страницы (их в системе много — подтверждения удаления,
            // списания, выхода и т.д.) не показываются вообще, и связанная
            // с ними кнопка выглядит "нерабочей".
            override fun onJsAlert(
                view: WebView?, url: String?, message: String?, result: JsResult?
            ): Boolean {
                AlertDialog.Builder(this@MainActivity)
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
                AlertDialog.Builder(this@MainActivity)
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
                val input = EditText(this@MainActivity)
                input.setText(defaultValue)
                AlertDialog.Builder(this@MainActivity)
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
        val photoUri = FileProvider.getUriForFile(
            this, "$packageName.fileprovider", photoFile
        )
        pendingCameraUri = photoUri
        captureIntent.putExtra(MediaStore.EXTRA_OUTPUT, photoUri)
        captureIntent.addFlags(Intent.FLAG_GRANT_WRITE_URI_PERMISSION)
        return captureIntent
    }

    private fun loadApp() {
        if (isOnline()) {
            offlineView.visibility = View.GONE
            progressBar.visibility = View.VISIBLE
            webView.visibility = View.VISIBLE
            webView.loadUrl(getString(R.string.app_url))
        } else {
            offlineView.visibility = View.VISIBLE
            webView.visibility = View.GONE
            swipeRefresh.isRefreshing = false
        }
    }

    private fun isOnline(): Boolean {
        val cm = getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager
        val network = cm.activeNetwork ?: return false
        val capabilities = cm.getNetworkCapabilities(network) ?: return false
        return capabilities.hasCapability(android.net.NetworkCapabilities.NET_CAPABILITY_INTERNET)
    }

    override fun onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack()
        } else {
            super.onBackPressed()
        }
    }
}
