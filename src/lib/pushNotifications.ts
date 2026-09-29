// Push Notification utilities for CashPay

// VAPID public key - generated for this project
export const VAPID_PUBLIC_KEY = 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDkejvzB4BaHCnX5i0HXHPsS1oSJoGjKb8OE3i0vxnA0';

function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray.buffer as ArrayBuffer;
}

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn('Push notifications not supported');
    return null;
  }
  try {
    const reg = await navigator.serviceWorker.register('/sw.js');
    return reg;
  } catch (err) {
    console.error('Service worker registration failed:', err);
    return null;
  }
}

export async function requestNotificationPermission(): Promise<boolean> {
  try {
    if (!('Notification' in window)) return false;
    if (Notification.permission === 'granted') return true;
    if (Notification.permission === 'denied') return false;
    const result = await Notification.requestPermission();
    return result === 'granted';
  } catch {
    return false;
  }
}

export async function subscribeToPush(reg: ServiceWorkerRegistration): Promise<PushSubscription | null> {
  try {
    const existing = await reg.pushManager.getSubscription();
    if (existing) return existing;

    const subscription = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });
    return subscription;
  } catch (err) {
    console.error('Push subscription failed:', err);
    return null;
  }
}

export function saveSubscription(email: string, subscription: PushSubscription) {
  const subs = JSON.parse(localStorage.getItem('push_subscriptions') || '{}');
  subs[email] = JSON.stringify(subscription);
  localStorage.setItem('push_subscriptions', JSON.stringify(subs));
}

// Show a local browser notification (works without backend when tab is active)
export function showLocalNotification(title: string, body: string, icon = '/favicon.ico') {
  try {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;
    new Notification(title, { body, icon });
  } catch {
    // Ignore notification errors
  }
}

// Add a notification to in-app notification center
export function addInAppNotification(email: string, notification: {
  id: string;
  title: string;
  body: string;
  type: 'reward' | 'transaction' | 'info';
  read: boolean;
  time: string;
}) {
  const key = `notifications_${email}`;
  const existing = JSON.parse(localStorage.getItem(key) || '[]');
  existing.unshift(notification);
  // Keep only last 50
  localStorage.setItem(key, JSON.stringify(existing.slice(0, 50)));
}

export function getInAppNotifications(email: string) {
  return JSON.parse(localStorage.getItem(`notifications_${email}`) || '[]');
}

export function markAllRead(email: string) {
  const key = `notifications_${email}`;
  const existing = JSON.parse(localStorage.getItem(key) || '[]');
  const updated = existing.map((n: any) => ({ ...n, read: true }));
  localStorage.setItem(key, JSON.stringify(updated));
}

export function getUnreadCount(email: string): number {
  const notifications = getInAppNotifications(email);
  return notifications.filter((n: any) => !n.read).length;
}
