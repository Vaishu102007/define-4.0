// PWA Registration & Mobile Install Banner Handler
(function () {
  'use strict';

  // Register service worker if supported
  if ('serviceWorker' in navigator && (window.location.protocol === 'https:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          console.log('[PWA] ServiceWorker registered with scope:', reg.scope);
        })
        .catch((err) => {
          console.warn('[PWA] ServiceWorker registration skipped/failed:', err);
        });
    });
  }

  let deferredPrompt = null;

  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent immediate browser prompt
    e.preventDefault();
    deferredPrompt = e;

    // Show custom install banner if not already dismissed
    if (!localStorage.getItem('nimad_pwa_dismissed')) {
      showInstallPrompt();
    }
  });

  function showInstallPrompt() {
    if (document.getElementById('pwa-install-banner')) return;

    const banner = document.createElement('div');
    banner.id = 'pwa-install-banner';
    banner.innerHTML = `
      <div style="position:fixed;bottom:80px;left:50%;transform:translateX(-50%);z-index:9998;max-width:92%;width:380px;background:#17171a;border:1px solid #3f3f46;border-radius:12px;padding:12px 16px;box-shadow:0 12px 30px rgba(0,0,0,0.8);display:flex;align-items:center;gap:12px;backdrop-filter:blur(12px);">
        <img src="/assets/icon-192.png" alt="Nimad" style="width:40px;height:40px;border-radius:8px;border:1px solid #27272a;" />
        <div style="flex:1;min-width:0;">
          <div style="font-size:0.85rem;font-weight:700;color:#ffffff;line-height:1.2;">Install Nimad App</div>
          <div style="font-size:0.72rem;color:#a1a1aa;">Add to home screen for fast fullscreen meetings</div>
        </div>
        <div style="display:flex;gap:6px;">
          <button id="pwa-install-btn" style="background:#ffffff;color:#000000;font-weight:700;font-size:0.75rem;padding:6px 12px;border:none;border-radius:6px;cursor:pointer;">Install</button>
          <button id="pwa-dismiss-btn" style="background:transparent;color:#71717a;border:none;font-size:1rem;cursor:pointer;padding:4px;">✕</button>
        </div>
      </div>
    `;

    document.body.appendChild(banner);

    const installBtn = banner.querySelector('#pwa-install-btn');
    const dismissBtn = banner.querySelector('#pwa-dismiss-btn');

    if (installBtn) {
      installBtn.addEventListener('click', async () => {
        if (deferredPrompt) {
          deferredPrompt.prompt();
          const { outcome } = await deferredPrompt.userChoice;
          console.log('[PWA] User response to install:', outcome);
          deferredPrompt = null;
        }
        banner.remove();
      });
    }

    if (dismissBtn) {
      dismissBtn.addEventListener('click', () => {
        localStorage.setItem('nimad_pwa_dismissed', 'true');
        banner.remove();
      });
    }
  }

  // Detect iOS standalone mode
  const isIos = /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());
  const isInStandaloneMode = ('standalone' in window.navigator) && (window.navigator.standalone);

  if (isIos && !isInStandaloneMode && !localStorage.getItem('nimad_ios_pwa_dismissed')) {
    window.addEventListener('load', () => {
      // Small prompt for iOS Safari users
      setTimeout(() => {
        const iosBanner = document.createElement('div');
        iosBanner.id = 'ios-install-banner';
        iosBanner.innerHTML = `
          <div style="position:fixed;bottom:75px;left:50%;transform:translateX(-50%);z-index:9998;max-width:92%;width:360px;background:#18181b;border:1px solid #27272a;border-radius:12px;padding:10px 14px;box-shadow:0 8px 24px rgba(0,0,0,0.8);display:flex;align-items:center;gap:10px;font-size:0.75rem;color:#e4e4e7;">
            <span>📱 Tap <strong>Share</strong> then <strong>'Add to Home Screen'</strong> for the full mobile app experience.</span>
            <button onclick="localStorage.setItem('nimad_ios_pwa_dismissed','true');this.closest('#ios-install-banner').remove();" style="background:transparent;border:none;color:#71717a;font-size:1.1rem;cursor:pointer;">✕</button>
          </div>
        `;
        document.body.appendChild(iosBanner);
      }, 3000);
    });
  }
})();
