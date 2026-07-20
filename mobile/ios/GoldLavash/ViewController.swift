import UIKit
import WebKit

/// Обёртка (WKWebView) над веб-системой GOLD LAVASH.
/// Открывает мобильную версию системы (?mobile=1). Начиная с iOS 14.5
/// WKWebView сам показывает системный выбор камеры/галереи для
/// <input type="file" capture="environment"> — отдельный код для этого
/// не нужен (в отличие от Android). Нужно только разрешение в Info.plist
/// (см. IOS_SETUP.md — NSCameraUsageDescription и NSPhotoLibraryUsageDescription).
final class ViewController: UIViewController, WKNavigationDelegate {

    // Стабильный адрес рабочего деплоя. При редеплое на тот же
    // -i deployment id (clasp deploy -i AKfycby...) этот адрес не меняется.
    private let appURLString =
        "https://script.google.com/macros/s/AKfycbyfKu_QKGUOu00GeXmNwie5VTPTgXO6M2wKORUrVfwMR2zvkePfi9nqiVC34BoFAj_G/exec?mobile=1"

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
        webView.scrollView.bounces = true
        view.addSubview(webView)

        let refreshControl = UIRefreshControl()
        refreshControl.tintColor = brandGold
        refreshControl.addTarget(self, action: #selector(handlePullToRefresh), for: .valueChanged)
        webView.scrollView.refreshControl = refreshControl

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

    @objc private func handlePullToRefresh() {
        loadApp()
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
        webView.scrollView.refreshControl?.endRefreshing()
    }

    func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
        showOffline()
    }

    func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) {
        showOffline()
    }

    private func showOffline() {
        activityIndicator.stopAnimating()
        webView.scrollView.refreshControl?.endRefreshing()
        offlineView.isHidden = false
        webView.isHidden = true
    }
}
