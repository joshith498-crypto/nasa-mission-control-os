// QuantumOS - Shared Utilities & Notifications

const NotificationLog = [];

function showGlobalAlert(message) {
    const popup = document.getElementById('system-popup');
    const text = document.getElementById('popup-text');
    const closeBtn = document.getElementById('close-popup');

    NotificationLog.unshift({ message, time: new Date() });
    if (NotificationLog.length > 8) NotificationLog.pop();
    if (typeof renderMissionControlNotifs === 'function') renderMissionControlNotifs();

    if (!popup || !text) return;

    text.textContent = message;
    popup.style.display = 'block';
    popup.classList.add('notif-in');
    setTimeout(() => popup.classList.remove('notif-in'), 300);

    if (closeBtn) {
        closeBtn.onclick = () => popup.style.display = 'none';
    }
    clearTimeout(window._alertTimer);
    window._alertTimer = setTimeout(() => { popup.style.display = 'none'; }, 5000);
}

function clamp(v, min, max) { 
    return Math.max(min, Math.min(max, v)); 
}

function hexToRgba(hex, alpha) {
    const h = hex.replace('#', '');
    const r = parseInt(h.substring(0, 2), 16);
    const g = parseInt(h.substring(2, 4), 16);
    const b = parseInt(h.substring(4, 6), 16);
    return `rgba(${r},${g},${b},${alpha})`;
}
