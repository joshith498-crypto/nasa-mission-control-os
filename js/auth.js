// QuantumOS - Authentication & User Session
const AUTH_KEY = 'qos_account_v1';

function getAccount() {
    const raw = localStorage.getItem(AUTH_KEY);
    if (!raw) return null;
    try { return JSON.parse(raw); } catch (e) { return null; }
}

function setupAuth() {
    const loginScreen = document.getElementById('login-screen');
    const signupCard = document.getElementById('signup-card');
    const signinCard = document.getElementById('signin-card');
    if (!loginScreen) { runBootSequence(); return; }

    const account = getAccount();

    if (account) {
        signupCard.style.display = 'none';
        signinCard.style.display = 'flex';
        document.getElementById('signin-avatar').textContent = account.avatar || '🧑‍🚀';
        document.getElementById('signin-name').textContent = `Welcome back, ${account.displayName}`;
        document.getElementById('signin-username').value = account.username;
    } else {
        signupCard.style.display = 'flex';
        signinCard.style.display = 'none';
    }

    // Signup avatar picker
    let selectedAvatar = '🧑‍🚀';
    document.querySelectorAll('#signup-avatar-picker .avatar-option').forEach(btn => {
        btn.onclick = () => {
            document.querySelectorAll('#signup-avatar-picker .avatar-option').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            selectedAvatar = btn.dataset.avatar;
        };
    });

    // Create account
    const signupSubmit = document.getElementById('signup-submit');
    if (signupSubmit) {
        signupSubmit.onclick = () => {
            const dn = document.getElementById('signup-name').value.trim();
            const un = document.getElementById('signup-username').value.trim();
            const p1 = document.getElementById('signup-password').value;
            const p2 = document.getElementById('signup-confirm').value;
            const err = document.getElementById('signup-error');

            if (!dn || !un || !p1) { err.textContent = 'Please fill all fields.'; return; }
            if (p1 !== p2) { err.textContent = 'Passwords do not match.'; return; }

            const newAcc = { username: un, password: p1, displayName: dn, avatar: selectedAvatar };
            localStorage.setItem(AUTH_KEY, JSON.stringify(newAcc));
            SystemState.userAccount = dn;
            loginScreen.style.display = 'none';
            runBootSequence();
        };
    }

    // Login
    const signinSubmit = document.getElementById('signin-submit');
    if (signinSubmit) {
        signinSubmit.onclick = () => {
            const un = document.getElementById('signin-username').value.trim();
            const pw = document.getElementById('signin-password').value;
            const err = document.getElementById('signin-error');
            const acc = getAccount();

            if (acc && acc.username === un && acc.password === pw) {
                SystemState.userAccount = acc.displayName;
                loginScreen.style.display = 'none';
                runBootSequence();
            } else {
                err.textContent = 'Invalid credentials.';
            }
        };
    }

    // Logout
    const logoutBtn = document.getElementById('cc-logout');
    if (logoutBtn) {
        logoutBtn.onclick = () => {
            location.reload();
        };
    }
}
