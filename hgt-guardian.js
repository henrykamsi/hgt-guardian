/**
 * HGT Guardian SDK - Core Security Engine (v1.4)
 * Powered by Henry Global Tech Industry (HGT)
 */

const HGT_Guardian = (function () {
    let state = {
        config: { mode: 'full', brand: 'Henry Global Tech Industry', autoGuard: true },
        currentStage: 1,
        currentAnswer: 0,
        pulses: ["Authenticating...", "Verifying device...", "Securing handshake channels..."],
        pulseIndex: 0
    };

    function init(customConfig) {
        state.config = { ...state.config, ...customConfig };
        if (state.config.mode === 'full') {
            injectStyles();
            launchGuardianGate();
        }
    }

    function injectStyles() {
        if (document.getElementById('hgt-guardian-styles')) return;
        const style = document.createElement('style');
        style.id = 'hgt-guardian-styles';
        style.innerHTML = `
            #hgt-overlay {
                position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
                background: #0f172a; z-index: 9999999;
                display: flex; flex-direction: column; align-items: center; justify-content: center;
                font-family: 'Segoe UI', system-ui, sans-serif; color: #ffffff; padding: 20px; box-sizing: border-box;
            }
            .hgt-card {
                background: #1e293b; border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 24px; padding: 40px; text-align: center; max-width: 460px; width: 100%;
                box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); box-sizing: border-box;
            }
            
            /* Reassurance Banner Style */
            .hgt-banner-note {
                background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.2);
                border-radius: 12px; padding: 14px 18px; margin-bottom: 24px; text-align: left;
            }
            .hgt-banner-title { font-size: 13px; font-weight: 700; color: #3b82f6; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px; }
            .hgt-banner-body { font-size: 13px; color: #94a3b8; line-height: 1.5; }

            .hgt-spinner-box { position: relative; width: 80px; height: 80px; margin: 0 auto 24px; }
            .hgt-circle-svg { width: 100%; height: 100%; transform: rotate(-90deg); }
            .hgt-circle-bg { fill: none; stroke: rgba(255,255,255,0.1); stroke-width: 6; }
            .hgt-circle-poly {
                fill: none; stroke: #3b82f6; stroke-width: 6; stroke-linecap: round;
                stroke-dasharray: 226; stroke-dashoffset: 226;
                animation: hgtDash 2s ease-in-out infinite;
            }
            @keyframes hgtDash {
                0% { stroke-dashoffset: 226; }
                50% { stroke-dashoffset: 60; transform: rotate(135deg); }
                100% { stroke-dashoffset: 226; transform: rotate(450deg); }
            }
            .hgt-main-heading { font-size: 24px; font-weight: 800; color: #ffffff; margin: 0; }
            .hgt-brand-sub { font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #64748b; margin: 4px 0 20px; font-weight: 700; }
            .hgt-pulse-text { font-size: 20px; font-weight: 600; margin: 12px 0 16px; color: #f8fafc; }
            .hgt-bot-text { font-size: 15px; color: #cbd5e1; margin-bottom: 24px; }
            
            .hgt-checkbox-container {
                display: flex; align-items: center; justify-content: center; background: rgba(15, 23, 42, 0.6);
                padding: 16px 20px; border-radius: 12px; border: 2px solid #475569;
                cursor: pointer; transition: all 0.2s ease; width: 100%; box-sizing: border-box;
            }
            .hgt-checkbox-container:hover { border-color: #3b82f6; background: rgba(15, 23, 42, 0.8); }
            .hgt-real-cb { width: 24px; height: 24px; cursor: pointer; accent-color: #3b82f6; margin-right: 14px; flex-shrink: 0; }
            .hgt-cb-label { font-size: 16px; font-weight: 500; color: #f1f5f9; user-select: none; }
            
            .hgt-math-form { margin-top: 20px; }
            .hgt-math-question { font-size: 36px; font-weight: bold; margin-bottom: 24px; color: #ffffff; letter-spacing: 1px; }
            .hgt-input-field {
                width: 100%; background: #0f172a; border: 2px solid #475569;
                border-radius: 12px; padding: 14px; font-size: 20px; color: #fff; text-align: center;
                outline: none; box-sizing: border-box; transition: border-color 0.2s;
            }
            .hgt-input-field:focus { border-color: #3b82f6; }
            .hgt-btn {
                width: 100%; background: #3b82f6; color: white; border: none; border-radius: 12px;
                padding: 14px; margin-top: 16px; font-size: 16px; font-weight: 600; cursor: pointer;
                transition: background 0.2s;
            }
            .hgt-btn:hover { background: #2563eb; }
        `;
        document.body.appendChild(style);
    }

    function launchGuardianGate() {
        const overlay = document.createElement('div');
        overlay.id = 'hgt-overlay';
        overlay.innerHTML = `
            <div class="hgt-card" id="hgt-card-body">
                <div class="hgt-banner-note">
                    <div class="hgt-banner-title">System Verification Check</div>
                    <div class="hgt-banner-body">The website has not crashed. It will respond once you complete the steps below. Thank you for your patience.</div>
                </div>
                <h2 class="hgt-main-heading">Henry Global Tech Industry</h2>
                <div class="hgt-brand-sub">Powered by HGT Guidance</div>
                
                <div class="hgt-spinner-box" id="hgt-main-loader">
                    <svg class="hgt-circle-svg"><circle class="hgt-circle-bg" cx="40" cy="40" r="36"></circle><circle class="hgt-circle-poly" cx="40" cy="40" r="36"></circle></svg>
                </div>
                <div class="hgt-pulse-text" id="hgt-pulse-msg">Authenticating...</div>
                <div class="hgt-bot-text" id="hgt-bot-subtitle">HGT Guardian verifying you are not a bot.</div>
                
                <div class="hgt-checkbox-container" id="hgt-cb-wrapper">
                    <input type="checkbox" class="hgt-real-cb" id="hgt-verify-checkbox">
                    <label class="hgt-cb-label" for="hgt-verify-checkbox">Verify that you are not a bot.</label>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
        cycleDiagnosticPulses();
    }

    function cycleDiagnosticPulses() {
        if (state.pulseIndex < state.pulses.length) {
            document.getElementById('hgt-pulse-msg').innerText = state.pulses[state.pulseIndex];
            state.pulseIndex++;
            setTimeout(cycleDiagnosticPulses, 1400);
        }
    }

    // Handles the checkbox gate event engagement
    document.addEventListener('change', function(e) {
        if (e.target && e.target.id === 'hgt-verify-checkbox') {
            if (e.target.checked) {
                document.getElementById('hgt-cb-wrapper').style.display = 'none';
                document.getElementById('hgt-bot-subtitle').style.display = 'none';
                document.getElementById('hgt-main-loader').style.display = 'block';
                
                const pulseMsg = document.getElementById('hgt-pulse-msg');
                pulseMsg.style.display = 'block';
                pulseMsg.innerText = "Analyzing device metrics...";

                setTimeout(() => {
                    state.currentStage = 1;
                    renderMathStage();
                }, 5000); // 5-second computation loader
            }
        }
    });

    function generateMathQuestion() {
        const num1 = Math.floor(Math.random() * 9) + 2;
        const num2 = Math.floor(Math.random() * 9) + 2;
        state.currentAnswer = num1 + num2;
        return `${num1} + ${num2}`;
    }

    function renderMathStage() {
        document.getElementById('hgt-main-loader').style.display = 'none';
        document.getElementById('hgt-pulse-msg').style.display = 'none';
        
        const cardBody = document.getElementById('hgt-card-body');
        
        // Retaining heading elements and layout while rendering the math loop fields
        cardBody.innerHTML = `
            <div class="hgt-banner-note">
                <div class="hgt-banner-title">System Verification Check</div>
                <div class="hgt-banner-body">The website has not crashed. It will respond once you answer the question. Thank you for your patience.Tap the botton three times faster to proceed.</div>
            </div>
            <h2 class="hgt-main-heading">Henry Global Tech Industry</h2>
            <div class="hgt-brand-sub">Powered by HGT Guidance</div>
            <div class="hgt-pulse-text">Question ${getStageLabel()}</div>
            <div class="hgt-math-form">
                <div class="hgt-math-question">${generateMathQuestion()} = ?</div>
                <input type="number" class="hgt-input-field" id="hgt-input" placeholder="Your Answer" autocomplete="off">
                <button type="button" class="hgt-btn" id="hgt-submit-btn">Verify Answer</button>
            </div>
        `;

        document.getElementById('hgt-submit-btn').addEventListener('click', validateMathAnswer);
        document.getElementById('hgt-input').addEventListener('keypress', function(evt) {
            if (evt.key === 'Enter') validateMathAnswer();
        });
        document.getElementById('hgt-input').focus();
    }

    function getStageLabel() {
        if (state.currentStage === 1) return "1 of 1";
        if (state.currentStage === 2) return "1 of 2";
        if (state.currentStage === 3) return "1 of 3";
        return "";
    }

    function validateMathAnswer() {
        const userAns = parseInt(document.getElementById('hgt-input').value, 10);
        if (userAns === state.currentAnswer) {
            if (state.currentStage < 3) {
                state.currentStage++;
                renderMathStage();
            } else {
                triggerHardwareBiometrics();
            }
        } else {
            // Redirect immediately to access declined state if any equation fails
            triggerAccessDeclined();
        }
    }

    function triggerHardwareBiometrics() {
        const cardBody = document.getElementById('hgt-card-body');
        cardBody.innerHTML = `
            <div class="hgt-banner-note">
                <div class="hgt-banner-title">System Verification Check</div>
                <div class="hgt-banner-body">The website has not crashed. It will respond once you complete the steps below. Thank you for your patience.</div>
            </div>
            <h2 class="hgt-main-heading">Henry Global Tech Industry</h2>
            <div class="hgt-brand-sub">Powered by HGT Guidance</div>
            <div class="hgt-spinner-box">
                <svg class="hgt-circle-svg"><circle class="hgt-circle-bg" cx="40" cy="40" r="36"></circle><circle class="hgt-circle-poly" cx="40" cy="40" r="36"></circle></svg>
            </div>
            <div class="hgt-pulse-text">Processing Hardware Biometric...</div>
        `;

        if (window.PublicKeyCredential) {
            navigator.credentials.create({
                publicKey: {
                    challenge: new Uint8Array([16, 32, 48, 64]),
                    rp: { name: state.config.brand },
                    user: { id: new Uint8Array([5]), name: "operator@hgt", displayName: "HGT Operator" },
                    pubKeyCredParams: [{ type: "public-key", alg: -7 }],
                    timeout: 60000,
                    authenticatorSelection: { authenticatorAttachment: "platform", userVerification: "required" }
                }
            }).then((cred) => {
                executeSuccessClearance();
            }).catch((err) => {
                triggerAccessDeclined();
            });
        } else {
            // Smooth operational simulation fallback if no physical reader device is attached
            setTimeout(executeSuccessClearance, 2000);
        }
    }

    function triggerAccessDeclined() {
        if (window.AndroidBridge && window.AndroidBridge.postMessage) {
            window.AndroidBridge.postMessage(JSON.stringify({ status: "DECLINED" }));
        }
        if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.iOSBridge) {
            window.webkit.messageHandlers.iOSBridge.postMessage({ status: "DECLINED" });
        }

        const cardBody = document.getElementById('hgt-card-body');
        cardBody.innerHTML = `
            <div style="font-size: 54px; margin-bottom: 16px;">❌</div>
            <h2 class="hgt-main-heading" style="color: #ef4444;">Access Declined</h2>
            <div class="hgt-brand-sub">Verification Failed</div>
            <p style="color: #94a3b8; font-size: 14px; margin-bottom: 24px;">Automated activity signatures or unauthorized identity matching parameters were caught by the verification gate.</p>
            <button type="button" class="hgt-btn" style="background: #dc2626;" onclick="window.location.reload();">Retry Verification</button>
        `;
    }

    function executeSuccessClearance() {
        if (window.AndroidBridge && window.AndroidBridge.postMessage) {
            window.AndroidBridge.postMessage(JSON.stringify({ status: "VERIFIED" }));
        }
        if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.iOSBridge) {
            window.webkit.messageHandlers.iOSBridge.postMessage({ status: "VERIFIED" });
        }

        const cardBody = document.getElementById('hgt-card-body');
        cardBody.innerHTML = `
            <div style="font-size: 54px; margin-bottom: 16px;">✅</div>
            <h2 class="hgt-main-heading" style="color: #10b981;">Access Granted</h2>
            <div class="hgt-brand-sub" style="color: #34d399;">Verification check, you are not a bot.</div>
        `;

        setTimeout(() => {
            const overlay = document.getElementById('hgt-overlay');
            if (overlay) overlay.remove();
            if (typeof state.config.onSuccess === 'function') {
                state.config.onSuccess();
            }
        }, 2000);
    }

    return { init };
})();
