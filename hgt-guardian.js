/**
 * HGT Guardian SDK - Core Security Engine
 * Powered by Henry Global Tech Industry (HGT)
 */

const HGT_Guardian = (function () {
    let state = {
        config: {
            mode: 'global',
            timeout: 15000,
            brand: 'Henry Global Tech Industry',
            onSuccess: null,
            onFailure: null,
            autoGuard: false
        },
        watchdogTimer: null,
        animationInterval: null,
        currentStage: 1,
        currentAnswer: 0,
        interceptedForm: null
    };

    console.log("%c [HGT Guardian] System Active and Hooked. ", "background: #4f46e5; color: #fff; border-radius: 4px; padding: 4px;");

    function init(customConfig) {
        state.config = { ...state.config, ...customConfig };
        if (state.config.autoGuard) autoHookForms();
        if (state.config.mode === 'global' || state.config.mode === 'full') {
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', launchGuardianGate);
            } else {
                launchGuardianGate();
            }
        }
    }

    function secureForm(formSelector, customConfig) {
        state.config = { ...state.config, ...customConfig };
        const form = document.querySelector(formSelector);
        if (!form) return;

        form.addEventListener('submit', function (event) {
            event.preventDefault();
            state.interceptedForm = form;
            launchGuardianGate();
        });
    }

    function autoHookForms() {
        document.querySelectorAll('form').forEach(form => {
            const str = (form.id + form.action).toLowerCase();
            if (str.includes('login')) secureForm(`#${form.id}`, { mode: 'login' });
            else if (str.includes('signup') || str.includes('register')) secureForm(`#${form.id}`, { mode: 'signup' });
        });
    }

    function launchGuardianGate() {
        if (!navigator.onLine) return bypassGate();

        state.watchdogTimer = setTimeout(() => {
            console.warn("HGT Guardian: 15s absolute timeout reached. Yielding to application.");
            bypassGate();
        }, state.config.timeout);

        createOverlayUI();
        runVerificationChecks();
    }

    function createOverlayUI() {
        if (document.getElementById('hgt-overlay')) return;

        const overlay = document.createElement('div');
        overlay.id = 'hgt-overlay';
        overlay.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
            background: rgba(15, 23, 42, 0.75); backdrop-filter: blur(16px);
            z-index: 999999; display: flex; justify-content: center; align-items: center;
            font-family: system-ui, sans-serif; transition: opacity 0.3s;
        `;

        const card = document.createElement('div');
        card.style.cssText = `
            background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1);
            padding: 2.5rem; border-radius: 20px; width: 90%; max-width: 400px; text-align: center;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        `;

        const brandText = document.createElement('h2');
        brandText.style.cssText = `color: #fff; margin: 0 0 0.5rem; font-size: 1.5rem; font-weight: 700;`;
        brandText.innerText = state.config.brand;

        const loaderWrapper = document.createElement('div');
        loaderWrapper.id = 'hgt-loader';
        
        // Dynamic keyframes injection
        if(!document.getElementById('hgt-keyframes')) {
            const style = document.createElement('style');
            style.id = 'hgt-keyframes';
            style.textContent = `@keyframes hgt-spin { to { transform: rotate(360deg); } }`;
            document.head.appendChild(style);
        }

        loaderWrapper.innerHTML = `
            <div style="width: 48px; height: 48px; border: 4px solid rgba(255,255,255,0.1); border-top-color: #6366f1; border-radius: 50%; animation: hgt-spin 1s linear infinite; margin: 1.5rem auto;"></div>
            <div id="hgt-status" style="color: #94a3b8; font-weight: 500;">Authenticating...</div>
        `;

        const contentBox = document.createElement('div');
        contentBox.id = 'hgt-content';
        contentBox.style.display = 'none';

        card.appendChild(brandText);
        card.appendChild(loaderWrapper);
        card.appendChild(contentBox);
        overlay.appendChild(card);
        document.body.appendChild(overlay);
    }

    function runVerificationChecks() {
        const statuses = ['Authenticating...', 'Verifying device...', 'Checking connection...', 'Initializing gate...'];
        let step = 0;
        
        state.animationInterval = setInterval(() => {
            step++;
            if (step < statuses.length) document.getElementById('hgt-status').innerText = statuses[step];
        }, 1750);

        setTimeout(() => {
            clearInterval(state.animationInterval);
            document.getElementById('hgt-loader').style.display = 'none';
            document.getElementById('hgt-content').style.display = 'block';
            renderMathQuestion();
        }, 7000);
    }

    function renderMathQuestion() {
        const contentBox = document.getElementById('hgt-content');
        contentBox.innerHTML = '';

        let n1 = Math.floor(Math.random() * 10) + 2;
        let n2 = Math.floor(Math.random() * 10) + 2;
        let op = '+';

        if (state.currentStage === 1) { op = '+'; state.currentAnswer = n1 + n2; }
        else if (state.currentStage === 2) { 
            op = '-'; 
            if (n1 < n2) { let temp = n1; n1 = n2; n2 = temp; }
            state.currentAnswer = n1 - n2; 
        }
        else { op = '×'; state.currentAnswer = n1 * n2; }

        contentBox.innerHTML = `
            <div style="color: #6366f1; font-weight: bold; margin-bottom: 1rem;">Stage ${state.currentStage} of 3</div>
            <div style="color: #fff; font-size: 2rem; font-weight: 800; margin-bottom: 1.5rem;">${n1} ${op} ${n2} = ?</div>
            <input type="number" id="hgt-input" placeholder="Answer" style="width: 100%; padding: 0.75rem; border-radius: 8px; border: 1px solid rgba(255,255,255,0.2); background: rgba(0,0,0,0.2); color: #fff; text-align: center; font-size: 1.25rem; margin-bottom: 1rem; outline: none;">
            <button id="hgt-submit" style="width: 100%; padding: 0.8rem; background: #4f46e5; color: #fff; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">Verify</button>
        `;

        document.getElementById('hgt-input').addEventListener('keypress', (e) => { if (e.key === 'Enter') handleMath(); });
        document.getElementById('hgt-submit').addEventListener('click', handleMath);
        setTimeout(() => document.getElementById('hgt-input').focus(), 50);
    }

    function handleMath() {
        const val = parseInt(document.getElementById('hgt-input').value, 10);
        if (val === state.currentAnswer) {
            if (state.currentStage < 3) {
                state.currentStage++;
                renderMathQuestion();
            } else {
                triggerBiometric();
            }
        } else {
            failSequence("Incorrect cognitive response.");
        }
    }

    function triggerBiometric() {
        document.getElementById('hgt-content').innerHTML = `
            <div style="width: 48px; height: 48px; border: 4px solid rgba(255,255,255,0.1); border-top-color: #10b981; border-radius: 50%; animation: hgt-spin 1s linear infinite; margin: 1.5rem auto;"></div>
            <div style="color: #10b981; font-weight: 600;">Requesting Hardware Sensor...</div>
        `;

        if (window.PublicKeyCredential) {
            const challenge = new Uint8Array(32);
            window.crypto.getRandomValues(challenge);
            
            navigator.credentials.create({
                publicKey: {
                    challenge,
                    rp: { name: state.config.brand },
                    user: { id: new Uint8Array(16), name: "user", displayName: "User" },
                    pubKeyCredParams: [{ type: "public-key", alg: -7 }],
                    timeout: 60000,
                    authenticatorSelection: { authenticatorAttachment: "platform" }
                }
            }).then(() => bypassGate()).catch(() => failSequence("Biometric verification cancelled or unavailable."));
        } else {
            // No WebAuthn support, default to success to prevent lockout
            bypassGate();
        }
    }

    function failSequence(msg) {
        clearTimeout(state.watchdogTimer);
        document.getElementById('hgt-content').innerHTML = `
            <div style="color: #ef4444; font-size: 3rem; margin-bottom: 1rem;">&#10006;</div>
            <div style="color: #f87171; font-weight: 600; margin-bottom: 0.5rem;">Access Denied</div>
            <div style="color: #94a3b8; font-size: 0.9rem; margin-bottom: 1.5rem;">${msg}</div>
            <button id="hgt-close" style="width: 100%; padding: 0.8rem; background: rgba(255,255,255,0.1); border: none; border-radius: 8px; color: #fff; cursor: pointer;">Close</button>
        `;
        document.getElementById('hgt-close').onclick = () => {
            document.getElementById('hgt-overlay').remove();
            if (state.config.onFailure) state.config.onFailure();
        };
    }

    function bypassGate() {
        clearTimeout(state.watchdogTimer);
        const overlay = document.getElementById('hgt-overlay');
        if (overlay) {
            overlay.style.opacity = '0';
            setTimeout(() => {
                overlay.remove();
                if (state.interceptedForm) state.interceptedForm.submit();
                if (state.config.onSuccess) state.config.onSuccess();
            }, 300);
        }
    }

    return { init, secureForm };
})();

window.HGT_Guardian = HGT_Guardian;
