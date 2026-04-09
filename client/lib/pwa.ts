// Register Service Worker
export async function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    try {
      const registration = await navigator.serviceWorker.register("/sw.js", {
        scope: "/",
      });
      console.log("Service Worker registered:", registration);

      // Check for updates periodically
      setInterval(() => {
        registration.update();
      }, 60000); // Check every minute

      return registration;
    } catch (error) {
      console.error("Service Worker registration failed:", error);
    }
  }
}

// Request Notification Permission
export async function requestNotificationPermission() {
  if (!("Notification" in window)) {
    console.log("Browser does not support notifications");
    return false;
  }

  if (Notification.permission === "granted") {
    return true;
  }

  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission();
    return permission === "granted";
  }

  return false;
}

// Send a test notification
export async function sendNotification(title: string, options?: NotificationOptions) {
  if (!("Notification" in window) || Notification.permission !== "granted") {
    return;
  }

  if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
    // Send via service worker
    navigator.serviceWorker.controller.postMessage({
      type: "SHOW_NOTIFICATION",
      title,
      options,
    });
  } else {
    // Send directly
    new Notification(title, options);
  }
}

// Subscribe to push notifications
export async function subscribeToPushNotifications() {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    console.log("Push notifications not supported");
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: process.env.VITE_VAPID_PUBLIC_KEY,
    });
    console.log("Push subscription successful:", subscription);
    return subscription;
  } catch (error) {
    console.error("Failed to subscribe to push notifications:", error);
    return null;
  }
}

// Check if app is installed
export function isAppInstalled(): boolean {
  // Check if running in standalone mode (installed)
  if (window.matchMedia("(display-mode: standalone)").matches) {
    return true;
  }

  // Check for iOS
  if (
    (navigator as any).standalone === true ||
    (navigator as any).standalone === false
  ) {
    return (navigator as any).standalone === true;
  }

  return false;
}

// Request install prompt
export async function showInstallPrompt(): Promise<void> {
  // This will be set up in the component
  return Promise.resolve();
}

// Enable offline mode (store data locally)
export async function enableOfflineMode() {
  if (!("indexedDB" in window)) {
    console.log("IndexedDB not supported");
    return;
  }

  const request = indexedDB.open("restaurant-admin-db", 1);

  request.onerror = () => {
    console.error("IndexedDB error:", request.error);
  };

  request.onupgradeneeded = (event) => {
    const db = (event.target as IDBOpenDBRequest).result;

    // Create object stores for caching
    if (!db.objectStoreNames.contains("orders")) {
      db.createObjectStore("orders", { keyPath: "id" });
    }
    if (!db.objectStoreNames.contains("menu")) {
      db.createObjectStore("menu", { keyPath: "id" });
    }
    if (!db.objectStoreNames.contains("customers")) {
      db.createObjectStore("customers", { keyPath: "id" });
    }
  };

  request.onsuccess = () => {
    console.log("IndexedDB initialized for offline support");
  };
}

// Get offline data
export async function getOfflineData(storeName: string) {
  if (!("indexedDB" in window)) {
    return null;
  }

  return new Promise((resolve, reject) => {
    const request = indexedDB.open("restaurant-admin-db");

    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(storeName, "readonly");
      const objectStore = transaction.objectStore(storeName);
      const getAllRequest = objectStore.getAll();

      getAllRequest.onsuccess = () => {
        resolve(getAllRequest.result);
      };

      getAllRequest.onerror = () => {
        reject(getAllRequest.error);
      };
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

// Cache data offline
export async function cacheOfflineData(storeName: string, data: any) {
  if (!("indexedDB" in window)) {
    return;
  }

  return new Promise((resolve, reject) => {
    const request = indexedDB.open("restaurant-admin-db");

    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(storeName, "readwrite");
      const objectStore = transaction.objectStore(storeName);

      // Clear and re-add
      objectStore.clear();

      if (Array.isArray(data)) {
        data.forEach((item) => {
          objectStore.add(item);
        });
      } else {
        objectStore.add(data);
      }

      transaction.oncomplete = () => {
        resolve(true);
      };

      transaction.onerror = () => {
        reject(transaction.error);
      };
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}
