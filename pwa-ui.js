let deferredPrompt;

// 1. CAPTURE THE PROMPT (Only happens once when PWA criteria met)
window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
    console.log("✅ PWA: Install prompt captured.");
    
    // Trigger the UI check to show the button if we are online
    if (typeof updateOnlineStatus === "function") updateOnlineStatus();
});

document.addEventListener("DOMContentLoaded", () => {
    const installBtn = document.getElementById("installBtn");
    const offlineBanner = document.getElementById("offlineBanner");
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;

    // 2. THE FIX: EVERYTHING INSIDE THE SAME SCOPE
    function updateOnlineStatus() {
    const isOnline = navigator.onLine;

    // BANNER: If offline, add .visible. If online, remove it.
    const offlineBanner = document.getElementById("offlineBanner");

    // if (offlineBanner) {
    //     if (!isOffline) {
    //         // Remove any "hidden" classes and add visible
    //         offlineBanner.classList.remove("show");
    //         // offlineBanner.classList.add("visible");
    //         console.log("Banner should be visible now");
    //         offlineBanner.style.display = "none";
    //     } else {
    //         offlineBanner.classList.add("show");
    //         // Optional: add hidden back if you use display:none
    //         // offlineBanner.classList.remove("visible"); 
    //         console.log("Banner should be hidden now");
    //         offlineBanner.style.display = "inline-block";
    //     }
    // }

if (offlineBanner) {
    if (!navigator.onLine) { // offline → show banner
        offlineBanner.classList.remove("hidden");
        offlineBanner.style.display = "block"; // or "inline-block" if you want
        console.log("Banner visible (offline)");
    } else { // online → hide banner
        offlineBanner.classList.add("hidden");
        offlineBanner.style.display = "none";
        console.log("Banner hidden (online)");
    }
}

    // BUTTON: Only show if Online AND we have the prompt
    if (installBtn) {
        if (isOnline && deferredPrompt && !isStandalone) {
            installBtn.classList.remove("hidden");
            installBtn.style.display = "inline-block";
        } else {
            installBtn.classList.add("hidden");
            installBtn.style.display = "none";
        }
    }
}


    // 3. LISTENERS
    window.addEventListener("online", updateOnlineStatus);
    window.addEventListener("offline", updateOnlineStatus);
    
    // Run immediately on load
    updateOnlineStatus();

    // 4. INSTALL ACTION
    installBtn?.addEventListener("click", async () => {
        if (!deferredPrompt) return;
        
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User response: ${outcome}`);
        
        deferredPrompt = null;
        updateOnlineStatus(); // Refresh UI
    });

    window.addEventListener("appinstalled", () => {
        deferredPrompt = null;
        updateOnlineStatus(); // Refresh UI
    });

    // Move the function to global scope so beforeinstallprompt can see it
    window.updateOnlineStatus = updateOnlineStatus;
});

// 5. SERVICE WORKER
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(() => {});
    });
}
