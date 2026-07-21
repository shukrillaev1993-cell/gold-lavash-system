import UIKit
import WebKit

/// Обёртка (WKWebView) над веб-системой GOLD LAVASH.
/// Открывает мобильную версию системы (?mobile=1). Начиная с iOS 14.5
/// WKWebView сам показывает системный выбор камеры/галереи для
/// <input type="file" capture="environment"> — отдельный код для этого
/// не нужен (в отличие от Android). Нужно только разрешение в Info.plist
/// (см. IOS_SETUP.md — NSCameraUsageDescription и NSPhotoLibraryUsageDescription).
final class ViewController: UIViewController, WKNavigationDelegate, WKUIDelegate {

    // Стабильный адрес рабочего деплоя. При редеплое на тот же
    // -i deployment id (clasp deploy -i AKfycby...) этот адрес не меняется.
    private let appURLString =
        "https://script.google.com/macros/s/AKfycbyfKu_QKGUOu00GeXmNwie5VTPTgXO6M2wKORUrVfwMR2zvkePfi9nqiVC34BoFAj_G/exec"

    private var webView: WKWebView!
    private let activityIndicator = UIActivityIndicatorView(style: .large)
    private let offlineView = UIView()
    private let brandDark = UIColor(red: 0x12/255, green: 0x12/255, blue: 0x12/255, alpha: 1)
    private let brandGold = UIColor(red: 0xF9/255, green: 0xA8/255, blue: 0x25/255, alpha: 1)

    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = brandDark

        let config = WKWebViewConfiguration()
        config.allowsInlineMediaPlayback = true

        webView = WKWebView(frame: view.bounds, configuration: config)
        webView.autoresizingMask = [.flexibleWidth, .flexibleHeight]
        webView.navigationDelegate = self
        webView.uiDelegate = self
        webView.scrollView.bounces = true
        view.addSubview(webView)

        // Свайп-обновление перезагружает страницу целиком, а сессия входа
        // хранится только в памяти открытой страницы (не сохраняется) —
        // после такой перезагрузки система разлогинивает пользователя.
        // Поэтому жест не подключаем.

        activityIndicator.color = brandGold
        activityIndicator.center = view.center
        activityIndicator.autoresizingMask = [
            .flexibleLeftMargin, .flexibleRightMargin, .flexibleTopMargin, .flexibleBottomMargin
        ]
        view.addSubview(activityIndicator)

        setupOfflineView()
        loadApp()
    }

    private func setupOfflineView() {
        offlineView.frame = view.bounds
        offlineView.autoresizingMask = [.flexibleWidth, .flexibleHeight]
        offlineView.backgroundColor = brandDark
        offlineView.isHidden = true
        view.addSubview(offlineView)

        let label = UILabel()
        label.text = "Нет подключения к интернету"
        label.textColor = .white
        label.font = .boldSystemFont(ofSize: 16)
        label.textAlignment = .center
        label.translatesAutoresizingMaskIntoConstraints = false

        let retryButton = UIButton(type: .system)
        retryButton.setTitle("Повторить", for: .normal)
        retryButton.setTitleColor(brandGold, for: .normal)
        retryButton.addTarget(self, action: #selector(loadApp), for: .touchUpInside)
        retryButton.translatesAutoresizingMaskIntoConstraints = false

        offlineView.addSubview(label)
        offlineView.addSubview(retryButton)

        NSLayoutConstraint.activate([
            label.centerXAnchor.constraint(equalTo: offlineView.centerXAnchor),
            label.centerYAnchor.constraint(equalTo: offlineView.centerYAnchor, constant: -20),
            retryButton.centerXAnchor.constraint(equalTo: offlineView.centerXAnchor),
            retryButton.topAnchor.constraint(equalTo: label.bottomAnchor, constant: 16)
        ])
    }

    @objc private func loadApp() {
        offlineView.isHidden = true
        webView.isHidden = false
        activityIndicator.startAnimating()
        guard let url = URL(string: appURLString) else { return }
        webView.load(URLRequest(url: url))
    }

    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        activityIndicator.stopAnimating()
    }

    func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
        showOffline()
    }

    func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) {
        showOffline()
    }

    private func showOffline() {
        activityIndicator.stopAnimating()
        offlineView.isHidden = false
        webView.isHidden = true
    }

    // window.open()/target="_blank" (страницы "Карточка ОС", "Фото ОС",
    // "Печать наклеек") без этого метода WKWebView просто ничего не делает.
    // Открываем адрес на отдельном модальном экране, а не в этом же
    // webView — иначе страница логина перезаписывает уже вошедшую в
    // систему сессию, и вернуться в основное приложение было нечем.
    func webView(
        _ webView: WKWebView,
        createWebViewWith configuration: WKWebViewConfiguration,
        for navigationAction: WKNavigationAction,
        windowFeatures: WKWindowFeatures
    ) -> WKWebView? {
        if navigationAction.targetFrame == nil, let url = navigationAction.request.url {
            let popup = PopupViewController(url: url)
            popup.modalPresentationStyle = .fullScreen
            present(popup, animated: true)
        }
        return nil
    }

    // Без этих трёх методов confirm()/alert()/prompt() из веб-страницы
    // (подтверждения удаления, списания, выхода и т.д. — их в системе много)
    // не показываются вообще, и связанная с ними кнопка выглядит "нерабочей".
    func webView(
        _ webView: WKWebView,
        runJavaScriptAlertPanelWithMessage message: String,
        initiatedByFrame frame: WKFrameInfo,
        completionHandler: @escaping () -> Void
    ) {
        let alert = UIAlertController(title: nil, message: message, preferredStyle: .alert)
        alert.addAction(UIAlertAction(title: "OK", style: .default) { _ in completionHandler() })
        present(alert, animated: true)
    }

    func webView(
        _ webView: WKWebView,
        runJavaScriptConfirmPanelWithMessage message: String,
        initiatedByFrame frame: WKFrameInfo,
        completionHandler: @escaping (Bool) -> Void
    ) {
        let alert = UIAlertController(title: nil, message: message, preferredStyle: .alert)
        alert.addAction(UIAlertAction(title: "Отмена", style: .cancel) { _ in completionHandler(false) })
        alert.addAction(UIAlertAction(title: "OK", style: .default) { _ in completionHandler(true) })
        present(alert, animated: true)
    }

    func webView(
        _ webView: WKWebView,
        runJavaScriptTextInputPanelWithPrompt prompt: String,
        defaultText: String?,
        initiatedByFrame frame: WKFrameInfo,
        completionHandler: @escaping (String?) -> Void
    ) {
        let alert = UIAlertController(title: nil, message: prompt, preferredStyle: .alert)
        alert.addTextField { $0.text = defaultText }
        alert.addAction(UIAlertAction(title: "Отмена", style: .cancel) { _ in completionHandler(nil) })
        alert.addAction(UIAlertAction(title: "OK", style: .default) { _ in
            completionHandler(alert.textFields?.first?.text)
        })
        present(alert, animated: true)
    }
}
