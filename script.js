/* =========================================
   EVA EARNING - SEPARATE AUTH + WITHDRAW SYSTEM
========================================= */

const API = "/api";

// Current User State
let currentUser = JSON.parse(localStorage.getItem("user")) || null;
let wallet = 0, reward = 0, ads = 5, watched = 0, plan = "FREE PLAN";

// SPLASH SCREEN
const splash = document.getElementById("splash");
const app = document.getElementById("app");

window.addEventListener("load", () => {
    setTimeout(() => {
        if (splash) splash.style.opacity = "0";
        setTimeout(() => {
            if (splash) splash.style.display = "none";
            if (app) app.classList.remove("hidden");
            loadUser();
        }, 500);
    }, 1500);
});

// UI ELEMENTS
const walletText = document.getElementById("wallet");
const rewardText = document.getElementById("todayReward");
const adsLeft = document.getElementById("adsLeft");
const adsWatched = document.getElementById("adsWatched");
const profileName = document.getElementById("profileName");
const profileEmail = document.getElementById("profileEmail");
const profileWallet = document.getElementById("profileWallet");
const profileRewards = document.getElementById("profileRewards");
const profileAds = document.getElementById("profileAds");
const profilePlan = document.getElementById("profilePlan");

function updateUI() {
    if (walletText) walletText.innerHTML = "PKR " + wallet;
    if (rewardText) rewardText.innerHTML = reward;
    if (adsLeft) adsLeft.innerHTML = ads;
    if (adsWatched) adsWatched.innerHTML = watched;

    if (currentUser) {
        if (profileName) profileName.innerHTML = currentUser.name || "User";
        if (profileEmail) profileEmail.innerHTML = currentUser.phone || "N/A";
        if (profileWallet) profileWallet.innerHTML = "PKR " + wallet;
        if (profileRewards) profileRewards.innerHTML = "PKR " + reward;
        if (profileAds) profileAds.innerHTML = watched;
        if (profilePlan) profilePlan.innerHTML = plan;
    } else {
        if (profileName) profileName.innerHTML = "Guest User";
        if (profileEmail) profileEmail.innerHTML = "Login Required";
    }
}

function loadUser() {
    if (!currentUser) { updateUI(); return; }
    wallet = currentUser.wallet || 0;
    reward = currentUser.reward || 0;
    ads = currentUser.ads !== undefined ? currentUser.ads : 5;
    watched = currentUser.watchedAds || 0;
    plan = currentUser.plan || "FREE PLAN";
    updateUI();
}

async function saveUser() {
    if (!currentUser) return;
    currentUser.wallet = wallet;
    currentUser.reward = reward;
    currentUser.ads = ads;
    currentUser.watchedAds = watched;
    currentUser.plan = plan;

    localStorage.setItem("user", JSON.stringify(currentUser));

    try {
        await fetch("/api/update-user", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                phone: currentUser.phone,
                wallet, reward, ads, watchedAds: watched, plan
            })
        });
    } catch (e) { console.log("Save Sync Error", e); }
}

// MODALS CONTROL (SEPARATE LOGIN & REGISTER)
const loginModal = document.getElementById("loginModal");
const registerModal = document.getElementById("registerModal");
const loginBtn = document.getElementById("loginBtn");

const closeLoginModal = document.getElementById("closeLoginModal");
const closeRegisterModal = document.getElementById("closeRegisterModal");

const openRegisterLink = document.getElementById("openRegisterLink");
const openLoginLink = document.getElementById("openLoginLink");

if (loginBtn) loginBtn.onclick = () => loginModal && loginModal.classList.add("show");
if (closeLoginModal) closeLoginModal.onclick = () => loginModal && loginModal.classList.remove("show");
if (closeRegisterModal) closeRegisterModal.onclick = () => registerModal && registerModal.classList.remove("show");

if (openRegisterLink) {
    openRegisterLink.onclick = (e) => {
        e.preventDefault();
        if (loginModal) loginModal.classList.remove("show");
        if (registerModal) registerModal.classList.add("show");
    };
}

if (openLoginLink) {
    openLoginLink.onclick = (e) => {
        e.preventDefault();
        if (registerModal) registerModal.classList.remove("show");
        if (loginModal) loginModal.classList.add("show");
    };
}

// LOGIN SUBMIT
const loginSubmit = document.getElementById("loginSubmit");
if (loginSubmit) {
    loginSubmit.onclick = async () => {
        const phoneEl = document.getElementById("loginPhone");
        const passEl = document.getElementById("loginPassword");

        if (!phoneEl || !passEl) {
            showToast("⚠ Login Form Input Error");
            return;
        }

        const phone = phoneEl.value.trim();
        const password = passEl.value.trim();

        if (!phone || !password) {
            showToast("⚠ Phone & Password Required");
            return;
        }

        try {
            const res = await fetch("/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ phone, password })
            });
            const data = await res.json();

            if (data.success) {
                currentUser = data.user;
                localStorage.setItem("user", JSON.stringify(currentUser));
                if (loginModal) loginModal.classList.remove("show");
                loadUser();
                showToast("✅ Login Successful");
                loadWithdrawHistory();
            } else {
                showToast("❌ " + (data.message || "Invalid Login Details"));
            }
        } catch (e) {
            showToast("❌ Server Error");
        }
    };
}

// REGISTER SUBMIT
const registerSubmit = document.getElementById("registerSubmit");
if (registerSubmit) {
    registerSubmit.onclick = async () => {
        const nameEl = document.getElementById("registerName");
        const phoneEl = document.getElementById("registerPhone");
        const passEl = document.getElementById("registerPassword");

        if (!nameEl || !phoneEl || !passEl) {
            showToast("⚠ Register Form Input Error");
            return;
        }

        const name = nameEl.value.trim();
        const phone = phoneEl.value.trim();
        const password = passEl.value.trim();

        if (!name || !phone || !password) {
            showToast("⚠ Fill All Fields");
            return;
        }

        try {
            const res = await fetch("/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, phone, password })
            });
            const data = await res.json();

            if (data.success) {
                currentUser = data.user;
                localStorage.setItem("user", JSON.stringify(currentUser));
                if (registerModal) registerModal.classList.remove("show");
                loadUser();
                showToast("✅ Account Created Successfully!");
            } else {
                showToast("❌ " + (data.message || "Registration Failed"));
            }
        } catch (e) {
            showToast("❌ Server Error");
        }
    };
}

// WITHDRAW SYSTEM (FULLY ROBUST WITH DUAL-ID FALLBACK)
const withdrawBtn = document.getElementById("withdrawBtn");
if (withdrawBtn) {
    withdrawBtn.onclick = async () => {
        if (!currentUser) {
            showToast("⚠ Please Login First");
            if (loginModal) loginModal.classList.add("show");
            return;
        }

        // Supporting multiple possible HTML Element IDs
        const methodEl = document.getElementById("withdrawMethod") || document.getElementById("method");
        const nameEl = document.getElementById("accountName") || document.getElementById("withdrawName");
        const phoneEl = document.getElementById("accountNumber") || document.getElementById("withdrawPhone");
        const amountEl = document.getElementById("withdrawAmount");

        if (!methodEl || !nameEl || !phoneEl || !amountEl) {
            alert("❌ HTML Form Error: Inputs Missing in DOM!");
            return;
        }

        const method = methodEl.value;
        const name = nameEl.value.trim();
        const number = phoneEl.value.trim();
        const amount = Number(amountEl.value);

        if (!name || !number || !amount) {
            showToast("⚠ Fill All Details");
            return;
        }

        if (amount < 50) {
            showToast("⚠ Minimum Withdraw PKR 50");
            return;
        }

        if (wallet < amount) {
            showToast("❌ Insufficient Balance");
            return;
        }

        // IP Fetching with 2-second Timeout
        let userIp = "127.0.0.1";
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 2000);
            let ipRes = await fetch("https://api.ipify.org?format=json", { signal: controller.signal });
            let ipData = await ipRes.json();
            userIp = ipData.ip;
            clearTimeout(timeoutId);
        } catch (e) { 
            console.log("IP Fetch Error/Timeout", e); 
        }

        try {
            const response = await fetch("/api/withdraw", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: "REQ_" + Date.now(),
                    registeredPhone: currentUser.phone || "Guest",
                    method: method,
                    accountName: name,
                    accountNumber: number,
                    amount: amount,
                    userIp: userIp,
                    date: new Date().toLocaleString()
                })
            });

            const data = await response.json();

            if (data.success) {
                wallet -= amount;
                saveUser();
                updateUI();
                nameEl.value = "";
                phoneEl.value = "";
                amountEl.value = "";
                
                const wModal = document.getElementById("withdrawModal");
                if (wModal) wModal.style.display = "none";

                showToast("✅ Withdraw Request Sent");
                loadWithdrawHistory();
            } else {
                showToast("❌ " + (data.message || data.error || "Withdraw Failed"));
            }
        } catch (err) {
            showToast("❌ Server Connection Error");
        }
    };
}

// WATCH ADS SYSTEM
const watchBtn = document.getElementById("watchAd");
const timer = document.getElementById("timer");

if (watchBtn) {
    watchBtn.onclick = () => {
        if (!currentUser) {
            showToast("⚠ Please Login First");
            if (loginModal) loginModal.classList.add("show");
            return;
        }
        if (ads <= 0) {
            showToast("❌ No Ads Remaining Today");
            return;
        }

        watchBtn.disabled = true;
        let seconds = 15;
        if (timer) timer.innerHTML = "⏳ " + seconds + "s";

        const countdown = setInterval(() => {
            seconds--;
            if (timer) timer.innerHTML = "⏳ " + seconds + "s";

            if (seconds <= 0) {
                clearInterval(countdown);
                wallet += 100;
                reward += 100;
                ads--;
                watched++;
                saveUser();
                updateUI();
                if (timer) timer.innerHTML = "🎉 PKR 100 Added";
                showToast("✅ Reward Added");
                watchBtn.disabled = false;
            }
        }, 1000);
    };
}

// NAVIGATION & UTILS
const navItems = document.querySelectorAll(".navItem");
const pages = document.querySelectorAll(".page");

navItems.forEach(button => {
    button.onclick = () => {
        const target = button.dataset.page;
        pages.forEach(p => p.classList.remove("active"));
        const selected = document.getElementById(target);
        if (selected) selected.classList.add("active");
        navItems.forEach(item => item.classList.remove("active"));
        button.classList.add("active");
    };
});

function showToast(message) {
    const oldToast = document.querySelector(".evaToast");
    if (oldToast) oldToast.remove();

    const toast = document.createElement("div");
    toast.className = "evaToast";
    toast.innerHTML = message;
    document.body.appendChild(toast);

    setTimeout(() => toast.classList.add("show"), 100);
    setTimeout(() => {
        toast.classList.remove("show");
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
    logoutBtn.onclick = () => {
        localStorage.removeItem("user");
        currentUser = null;
        wallet = 0; reward = 0; ads = 5; watched = 0; plan = "FREE PLAN";
        updateUI();
        showToast("👋 Logged Out");
    };
}

async function loadWithdrawHistory() {
    if (!currentUser) return;
    try {
        const response = await fetch(`/api/withdraw-history?phone=${currentUser.phone}`);
        const data = await response.json();
        const historyBox = document.getElementById("withdrawHistory");
        if (!historyBox) return;

        if (!data.success || !data.withdraws || data.withdraws.length === 0) {
            historyBox.innerHTML = `<div class="emptyHistory" style="padding:15px; text-align:center; color:#94a3b8;">No Withdraw History</div>`;
            return;
        }

        historyBox.innerHTML = "";
        data.withdraws.forEach(item => {
            let statusColor = item.status === 'Approved' ? '#10B981' : (item.status === 'Rejected' ? '#EF4444' : '#F59E0B');
            historyBox.innerHTML += `
                <div class="historyCard" style="background:#1e293b; padding:12px; margin-bottom:8px; border-radius:8px; display:flex; justify-content:space-between; align-items:center;">
                    <div>
                        <b>${item.method}</b>
                        <p style="font-size:12px; color:#94a3b8;">${item.accountName} (${item.accountNumber})</p>
                    </div>
                    <div style="text-align:right;">
                        <h4 style="color:#10b981; margin:0;">PKR ${item.amount}</h4>
                        <span style="color:${statusColor}; font-weight:bold; font-size:12px;">${item.status || 'Pending'}</span>
                    </div>
                </div>`;
        });
    } catch (e) { console.log("History Error", e); }
}

window.onclick = (event) => {
    if (event.target === loginModal) loginModal.classList.remove("show");
    if (event.target === registerModal) registerModal.classList.remove("show");
};

window.addEventListener("load", () => {
    if (currentUser) loadWithdrawHistory();
});
