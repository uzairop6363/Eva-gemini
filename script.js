/* =========================================
   EVA EARNING - FULL INTEGRATED SCRIPT
   PART 1 / 10: APP BASE & USER SYSTEM
========================================= */

const API = "/api";

// Current User
let currentUser = JSON.parse(localStorage.getItem("user")) || null;

// App Data
let wallet = 0;
let reward = 0;
let ads = 5;
let watched = 0;
let plan = "FREE PLAN";

// =========================
// SPLASH SCREEN
// =========================

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
    }, 1000);
});

// =========================
// UI ELEMENTS
// =========================

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

// =========================
// UPDATE UI
// =========================

function updateUI() {
    if (walletText) walletText.innerHTML = "PKR " + wallet;
    if (rewardText) rewardText.innerHTML = reward;
    if (adsLeft) adsLeft.innerHTML = ads;
    if (adsWatched) adsWatched.innerHTML = watched;

    if (currentUser) {
        if (profileName) profileName.innerHTML = currentUser.name || "User";
        if (profileEmail) profileEmail.innerHTML = currentUser.phone || currentUser.userPhone || "";
        if (profileWallet) profileWallet.innerHTML = "PKR " + wallet;
        if (profileRewards) profileRewards.innerHTML = "PKR " + reward;
        if (profileAds) profileAds.innerHTML = watched;
        if (profilePlan) profilePlan.innerHTML = currentUser.plan || plan;
    } else {
        if (profileName) profileName.innerHTML = "Guest User";
        if (profileEmail) profileEmail.innerHTML = "Login Required";
    }
}

// =========================
// LOAD USER
// =========================

function loadUser() {
    if (!currentUser) {
        updateUI();
        return;
    }

    wallet = Number(currentUser.wallet) || 0;
    reward = Number(currentUser.reward) || 0;
    ads = currentUser.ads !== undefined ? currentUser.ads : 5;
    watched = currentUser.watchedAds || 0;
    plan = currentUser.plan || "FREE PLAN";

    updateUI();
}

// =========================
// SAVE USER
// =========================

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
                phone: currentUser.phone || currentUser.userPhone,
                userPhone: currentUser.phone || currentUser.userPhone,
                registeredPhone: currentUser.phone || currentUser.userPhone,
                wallet: wallet,
                reward: reward,
                ads: ads,
                watchedAds: watched,
                plan: plan,
                lastWithdrawDate: currentUser.lastWithdrawDate || ""
            })
        });
    } catch (error) {
        console.log("Update User Error", error);
    }
}

loadUser();
console.log("Eva Earning Part 1 Loaded");

/* =========================================
   PART 2 / 10: LOGIN & REGISTER SYSTEM
========================================= */

const loginBtn = document.getElementById("loginBtn");
const loginModal = document.getElementById("loginModal");
const loginSubmit = document.getElementById("loginSubmit");
const closeModal = document.querySelector(".closeModal");

if (loginBtn) {
    loginBtn.onclick = () => {
        if (loginModal) loginModal.classList.add("show");
    };
}

if (closeModal) {
    closeModal.onclick = () => {
        if (loginModal) loginModal.classList.remove("show");
    };
}

let isRegisterMode = false;

document.addEventListener("click", (e) => {
    if (e.target && (e.target.innerText.includes("Create Account") || e.target.id === "createAccLink")) {
        e.preventDefault();
        isRegisterMode = true;
        
        let nameField = document.getElementById("userName");
        if (!nameField) {
            const inputsContainer = document.querySelector("#loginModal input")?.parentElement || document.querySelector("#loginModal .modal-body");
            if (inputsContainer) {
                nameField = document.createElement("input");
                nameField.type = "text";
                nameField.id = "userName";
                nameField.placeholder = "Enter Full Name";
                nameField.style.cssText = "width:100%; padding:12px; margin-bottom:10px; border-radius:8px; border:1px solid #ccc;";
                inputsContainer.insertBefore(nameField, inputsContainer.firstChild);
            }
        } else {
            nameField.style.display = "block";
        }

        const modalTitle = document.querySelector("#loginModal h2, #loginModal h3, .modal-title");
        if (modalTitle) modalTitle.innerText = "Register Account";
        if (loginSubmit) loginSubmit.innerText = "Create Account";
        e.target.innerText = "Already have an account? Login";
        e.target.id = "loginAccLink";
    } 
    else if (e.target && (e.target.innerText.includes("Already have an account") || e.target.id === "loginAccLink")) {
        e.preventDefault();
        isRegisterMode = false;
        
        const nameField = document.getElementById("userName");
        if (nameField) nameField.style.display = "none";

        const modalTitle = document.querySelector("#loginModal h2, #loginModal h3, .modal-title");
        if (modalTitle) modalTitle.innerText = "Login";
        if (loginSubmit) loginSubmit.innerText = "Login";
        e.target.innerText = "Create Account";
        e.target.id = "createAccLink";
    }
});

if (loginSubmit) {
    loginSubmit.onclick = async () => {
        const allInputs = document.querySelectorAll("#loginModal input");
        let name = "", phone = "", password = "";

        allInputs.forEach(input => {
            const val = input.value.trim();
            if (input.type === "password" || input.placeholder.toLowerCase().includes("password")) {
                password = val;
            } else if (input.id === "userName" || input.placeholder.toLowerCase().includes("name")) {
                name = val;
            } else if (input.type === "tel" || input.type === "number" || input.type === "text" || input.placeholder.toLowerCase().includes("mobile") || input.placeholder.toLowerCase().includes("phone") || input.id === "userEmail") {
                if (!phone) phone = val;
            }
        });

        if (!phone || !password) {
            showToast("⚠ Phone & Password Required");
            return;
        }

        try {
            if (isRegisterMode) {
                if (!name) {
                    showToast("⚠ Full Name Required");
                    return;
                }
                const registerResponse = await fetch("/api/register", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name, phone, password })
                });

                const registerData = await registerResponse.json();

                if (registerData.success) {
                    showToast("✅ Account Created Successfully");
                    currentUser = registerData.user || { name, phone, userPhone: phone, registeredPhone: phone, wallet: 0, reward: 0, ads: 5, watchedAds: 0, plan: "FREE PLAN" };
                    if (!currentUser.phone) currentUser.phone = phone;
                    if (!currentUser.userPhone) currentUser.userPhone = phone;
                    localStorage.setItem("user", JSON.stringify(currentUser));
                    if (loginModal) loginModal.classList.remove("show");
                    loadUser();
                } else {
                    showToast(registerData.message || "❌ Registration Failed");
                }
            } else {
                const loginResponse = await fetch("/api/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ phone, password })
                });

                const loginData = await loginResponse.json();

                if (loginData.success) {
                    currentUser = loginData.user;
                    if (!currentUser.phone) currentUser.phone = phone;
                    if (!currentUser.userPhone) currentUser.userPhone = phone;
                    if (!currentUser.registeredPhone) currentUser.registeredPhone = phone;
                    
                    localStorage.setItem("user", JSON.stringify(currentUser));
                    if (loginModal) loginModal.classList.remove("show");
                    loadUser();
                    showToast("✅ Login Successful");
                } else {
                    showToast(loginData.message || "❌ Invalid Credentials");
                }
            }
        } catch (error) {
            console.log(error);
            showToast("❌ Server Connection Error");
        }
    };
}

console.log("Eva Earning Part 2 Loaded");

/* =========================================
   PART 3 / 10: TOAST, LOGOUT & NAVIGATION
========================================= */

function showToast(message) {
    const oldToast = document.querySelector(".evaToast");
    if (oldToast) oldToast.remove();

    const toast = document.createElement("div");
    toast.className = "evaToast";
    toast.innerHTML = message;
    document.body.appendChild(toast);

    setTimeout(() => { toast.classList.add("show"); }, 100);
    setTimeout(() => {
        toast.classList.remove("show");
        setTimeout(() => { toast.remove(); }, 300);
    }, 3000);
}

const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
    logoutBtn.onclick = () => {
        localStorage.removeItem("user");
        currentUser = null;
        wallet = 0;
        reward = 0;
        ads = 5;
        watched = 0;
        plan = "FREE PLAN";
        updateUI();
        showToast("👋 Logged Out");
    };
}

const navItems = document.querySelectorAll(".navItem");
const pages = document.querySelectorAll(".page");

navItems.forEach(button => {
    button.onclick = () => {
        const target = button.dataset.page;
        pages.forEach(page => { page.classList.remove("active"); });

        const selectedPage = document.getElementById(target);
        if (selectedPage) selectedPage.classList.add("active");

        navItems.forEach(item => { item.classList.remove("active"); });
        button.classList.add("active");
    };
});

window.onclick = (event) => {
    if (event.target === loginModal) {
        loginModal.classList.remove("show");
    }
};

console.log("Eva Earning Part 3 Loaded");

/* =========================================
   PART 4 / 10: WATCH AD REWARD SYSTEM
========================================= */

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

console.log("Eva Earning Part 4 Loaded");

/* =========================================
   PART 5 / 10: WITHDRAW SYSTEM (STRICT FREE PLAN & DAILY LIMIT)
========================================= */

const withdrawBtn = document.getElementById("withdrawBtn");

if (withdrawBtn) {
    withdrawBtn.onclick = async () => {
        const activeUserPhone = currentUser ? (currentUser.phone || currentUser.userPhone || currentUser.registeredPhone) : null;

        // 1. Strict Login Check
        if (!currentUser || !activeUserPhone) {
            showToast("⚠ Please Login First to Withdraw");
            if (loginModal) loginModal.classList.add("show");
            return;
        }

        const methodInput = document.getElementById("method") || document.querySelector("select");
        const withdrawName = document.getElementById("withdrawName") || document.querySelector("input[placeholder*='Title']");
        const withdrawPhone = document.getElementById("withdrawPhone") || document.querySelector("input[placeholder*='Number']");
        const withdrawAmount = document.getElementById("withdrawAmount") || document.querySelector("input[type='number']");

        const method = methodInput ? methodInput.value : "EasyPaisa";
        const name = withdrawName ? withdrawName.value.trim() : "";
        const number = withdrawPhone ? withdrawPhone.value.trim() : "";
        const amount = withdrawAmount ? Number(withdrawAmount.value) : 0;

        // 2. Form Input Validations
        if (!name || !number || !amount || isNaN(amount)) {
            showToast("⚠ Fill All Withdrawal Details");
            return;
        }

        if (amount <= 0) {
            showToast("⚠ Invalid Amount");
            return;
        }

        const currentPlan = (currentUser.plan || plan || "FREE PLAN").toUpperCase();
        const todayDate = new Date().toDateString();

        // 3. FREE PLAN CHECKS
        if (currentPlan.includes("FREE")) {
            // Check if user already withdrew today
            if (currentUser.lastWithdrawDate === todayDate) {
                showToast("⚠ Daily limit reached! Try again tomorrow");
                return;
            }

            // Check if amount exceeds 50 PKR
            if (amount > 50) {
                showToast("⚠ Daily limit 50 free plan");
                return;
            }
        }

        // 4. Wallet Balance Check
        if (wallet < amount) {
            showToast("❌ Insufficient Wallet Balance");
            return;
        }

        // Formatted Date for Admin Panel
        const now = new Date();
        const formattedDate = now.toLocaleDateString('en-GB') + ", " + now.toLocaleTimeString();

        try {
            const response = await fetch("/api/withdraw", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    phone: activeUserPhone,
                    userPhone: activeUserPhone,
                    registeredPhone: activeUserPhone,
                    user: activeUserPhone,
                    accountName: name,
                    name: name,
                    accountNumber: number,
                    number: number,
                    method: method,
                    amount: amount,
                    date: formattedDate,
                    timestamp: Date.now()
                })
            });

            const data = await response.json();

            if (data.success) {
                wallet -= amount;

                // Save last withdraw date
                currentUser.lastWithdrawDate = todayDate;

                saveUser();
                updateUI();

                if (withdrawName) withdrawName.value = "";
                if (withdrawPhone) withdrawPhone.value = "";
                if (withdrawAmount) withdrawAmount.value = "";

                showToast("✅ Withdraw Request Sent Successfully");
            } else {
                showToast(data.message || "Withdraw Failed");
            }
        } catch (error) {
            console.log(error);
            showToast("❌ Server Error");
        }
    };
}

console.log("Eva Earning Part 5 Loaded");

/* =========================================
   PART 6 / 10: VIP PLAN ACTIVATION & MODAL
========================================= */

const BANK_DETAILS = {
    bankName: "Telenor Microfinance Bank",
    accountTitle: "Shehroz Shehroz",
    accountNumber: "PK88TMFB0000000037817113"
};

document.addEventListener("click", (e) => {
    const btn = e.target.closest(".buyVip, .activate-btn, [data-plan]");
    if (btn) {
        e.preventDefault();

        if (!currentUser) {
            showToast("⚠ Please Login First");
            if (loginModal) loginModal.classList.add("show");
            return;
        }

        const selectedPlan = btn.dataset.plan || btn.getAttribute("data-plan") || "VIP 1";
        let selectedPrice = btn.dataset.price || btn.getAttribute("data-price");

        if (!selectedPrice) {
            const card = btn.closest(".planCard") || btn.closest(".card") || btn.parentElement;
            if (card) {
                const text = card.innerText;
                if (text.includes("3,000") || text.includes("3000")) selectedPrice = "3,000";
                else if (text.includes("5,000") || text.includes("5000")) selectedPrice = "5,000";
                else if (text.includes("10,000") || text.includes("10000")) selectedPrice = "10,000";
                else selectedPrice = "2,000";
            } else {
                selectedPrice = "2,000";
            }
        }

        openVipModal(selectedPlan, selectedPrice);
    }
});

function openVipModal(planName, amount) {
    let vipModal = document.getElementById("vipPaymentModal");
    if (vipModal) vipModal.remove();

    vipModal = document.createElement("div");
    vipModal.id = "vipPaymentModal";
    vipModal.className = "modal show";
    vipModal.style.cssText = "display:flex; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); z-index:9999; align-items:center; justify-content:center;";
    
    vipModal.innerHTML = `
        <div style="background:#1e293b; color:#fff; padding:25px; border-radius:16px; width:90%; max-width:380px; box-shadow:0 10px 25px rgba(0,0,0,0.5); font-family:sans-serif; text-align:left;">
            <h3 style="margin-top:0; color:#38bdf8; text-align:center;">💎 Plan Activation</h3>
            
            <div style="background:#0f172a; padding:12px; border-radius:10px; margin-bottom:15px; border:1px solid #334155;">
                <p style="margin:4px 0; font-size:15px;">Selected Plan: <b style="color:#facc15;">${planName}</b></p>
                <p style="margin:4px 0; font-size:15px;">Amount Required: <b style="color:#4ade80;">PKR ${amount}</b></p>
            </div>

            <div style="background:#0f172a; padding:12px; border-radius:10px; border:1px solid #334155;">
                <h4 style="margin:0 0 8px 0; color:#38bdf8; font-size:14px;">Bank Account Details:</h4>
                <p style="margin:4px 0; font-size:13px;"><b>Bank Name:</b> <span>${BANK_DETAILS.bankName}</span></p>
                <p style="margin:4px 0; font-size:13px;"><b>Account Title:</b> <span>${BANK_DETAILS.accountTitle}</span></p>
                <p style="margin:4px 0; font-size:13px;"><b>Account / IBAN:</b><br><span style="color:#38bdf8; font-weight:bold; word-break:break-all;">${BANK_DETAILS.accountNumber}</span></p>
            </div>

            <div style="margin-top:15px; background:#1e1b4b; padding:10px; border-radius:8px; border:1px solid #6366f1;">
                <p style="margin:0; font-size:13px; color:#e0e7ff; text-align:center; font-weight:bold;">
                    Send PKR ${amount} to this account to activate your plan.
                </p>
            </div>

            <button id="closeVipModalBtn" style="width:100%; padding:12px; margin-top:15px; background:#0052ff; color:#fff; border:none; border-radius:8px; font-weight:bold; cursor:pointer;">Close</button>
        </div>
    `;
    document.body.appendChild(vipModal);
    
    document.getElementById("closeVipModalBtn").onclick = () => {
        vipModal.remove();
    };
}

// Balance Show/Hide
const toggleBalance = document.getElementById("toggleBalance");
let balanceVisible = true;

if (toggleBalance) {
    toggleBalance.onclick = () => {
        balanceVisible = !balanceVisible;
        if (walletText) {
            walletText.innerHTML = balanceVisible ? "PKR " + wallet : "PKR ****";
        }
    };
}

// Dark Mode Toggle
const themeBtn = document.getElementById("themeBtn");
if (themeBtn) {
    themeBtn.onclick = () => {
        document.body.classList.toggle("darkMode");
    };
}

console.log("Eva Earning Part 6 Loaded");

/* =========================================
   PART 7 / 10: WITHDRAW ACTIVITY & HISTORY
========================================= */

const activityNames = ["Ahmad", "Zaka", "Ali", "Hamza", "Usman", "Ayesha", "Sara", "Fatima"];

function startActivity() {
    const activity = document.getElementById("activityText");
    if (!activity) return;

    activity.innerHTML = "Ahmad Withdraw PKR 1500";

    setInterval(() => {
        const name = activityNames[Math.floor(Math.random() * activityNames.length)];
        const amounts = [900, 1500, 3000, 5000, 9000];
        const amount = amounts[Math.floor(Math.random() * amounts.length)];

        activity.innerHTML = `${name} Withdraw PKR ${amount}`;
    }, 4000);
}

startActivity();

async function loadWithdrawHistory() {
    if (!currentUser) return;
    const phone = currentUser.phone || currentUser.userPhone || currentUser.registeredPhone;
    if (!phone) return;

    try {
        const response = await fetch(`/api/withdraw-history?phone=${phone}`);
        const data = await response.json();
        const historyBox = document.getElementById("withdrawHistory");

        if (!historyBox) return;

        if (!data.success || !data.withdraws || data.withdraws.length === 0) {
            historyBox.innerHTML = `<div class="emptyHistory">No Withdraw History</div>`;
            return;
        }

        historyBox.innerHTML = "";
        data.withdraws.forEach(item => {
            historyBox.innerHTML += `
                <div class="historyCard">
                    <div>
                        <b>${item.method}</b>
                        <p>${item.name || item.accountName || ""}</p>
                    </div>
                    <div>
                        <h3>PKR ${item.amount}</h3>
                        <span>${item.status || "Pending"}</span>
                    </div>
                </div>
            `;
        });
    } catch (error) {
        console.log("History Error", error);
    }
}

console.log("Eva Earning Part 7 Loaded");

/* =========================================
   PART 8 / 10: PROFILE & SESSION MANAGEMENT
========================================= */

function refreshProfile() {
    if (!currentUser) return;

    if (profileName) profileName.innerHTML = currentUser.name || "User";
    if (profileEmail) profileEmail.innerHTML = currentUser.phone || currentUser.userPhone || "";
    if (profileWallet) profileWallet.innerHTML = "PKR " + wallet;
    if (profileRewards) profileRewards.innerHTML = "PKR " + reward;
    if (profileAds) profileAds.innerHTML = watched;
    if (profilePlan) profilePlan.innerHTML = currentUser.plan || plan;
}

function afterLogin() {
    loadUser();
    refreshProfile();
    loadWithdrawHistory();
    updateUI();
}

window.addEventListener("load", () => {
    if (currentUser) {
        afterLogin();
    } else {
        updateUI();
    }
});

console.log("Eva Earning Part 8 Loaded");

/* =========================================
   PART 9 / 10: SECURITY & ERROR HANDLING
========================================= */

function checkSession() {
    if (!currentUser) return;
    const savedUser = localStorage.getItem("user");
    if (!savedUser) {
        currentUser = null;
        updateUI();
    }
}

setInterval(() => { checkSession(); }, 30000);

window.addEventListener("offline", () => { showToast("⚠ Internet Connection Lost"); });
window.addEventListener("online", () => { showToast("✅ Internet Connected"); });

console.log("Eva Earning Part 9 Loaded");

/* =========================================
   PART 10 / 10: APP INITIALIZATION
========================================= */

document.addEventListener("DOMContentLoaded", () => {
    updateUI();

    if (currentUser) {
        loadUser();
        refreshProfile();
        loadWithdrawHistory();
    }

    console.log("🚀 Eva Earning App Ready");
});

console.log("✅ Eva Earning Complete Script Loaded");
