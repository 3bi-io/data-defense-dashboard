/**
 * DATA DEFENSE DASHBOARD — Comprehensive Audit Data
 * Every item: { id, title, desc, link?, priority: critical|high|medium|low, category }
 * State managed in-memory (no persistent storage due to sandbox).
 */

const AUDIT_DATA = {
  /* ─── ACCOUNT SECURITY ─── */
  accounts: [
    {
      id: "apple",
      name: "Apple / iCloud",
      icon: "🍎",
      items: [
        { id: "apple-passkey", title: "Enable passkey sign-in for Apple ID", desc: "Apple supports passkeys natively since iOS 16. Go to Settings → [Your Name] → Sign-In & Security → Passkeys. This replaces passwords with phishing-resistant biometric auth.", link: "https://support.apple.com/en-us/102195", priority: "critical", category: "passkey" },
        { id: "apple-2fa", title: "Verify Apple ID two-factor authentication is ON", desc: "Settings → [Your Name] → Sign-In & Security → Two-Factor Authentication. Ensure it shows 'On' — not just SMS, but also trusted devices.", link: "https://support.apple.com/en-us/HT204915", priority: "critical", category: "mfa" },
        { id: "apple-recovery-key", title: "Generate and store Apple Recovery Key", desc: "Settings → [Your Name] → Sign-In & Security → Account Recovery → Recovery Key. Write it down and store in a fireproof safe or safety deposit box. Without this, losing access to trusted devices = permanent lockout.", link: "https://support.apple.com/en-us/HT208072", priority: "high", category: "recovery" },
        { id: "apple-recovery-contacts", title: "Set up Apple Account Recovery Contacts", desc: "Add 1-2 trusted people who can help you regain access. Settings → [Your Name] → Sign-In & Security → Account Recovery → Recovery Contact.", link: "https://support.apple.com/en-us/HT212513", priority: "high", category: "recovery" },
        { id: "apple-legacy-contact", title: "Designate a Legacy Contact", desc: "Settings → [Your Name] → Sign-In & Security → Legacy Contact. Lets a trusted person access your account data if you pass away.", link: "https://support.apple.com/en-us/HT212360", priority: "medium", category: "recovery" },
        { id: "apple-app-passwords", title: "Audit app-specific passwords", desc: "appleid.apple.com → Sign-In and Security → App-Specific Passwords. Revoke any you don't recognize or no longer use.", link: "https://appleid.apple.com", priority: "medium", category: "permissions" },
        { id: "apple-devices", title: "Review trusted devices list", desc: "Settings → [Your Name] → scroll to device list. Remove any device you no longer own or recognize.", priority: "high", category: "permissions" },
        { id: "apple-mail-privacy", title: "Enable Mail Privacy Protection", desc: "Settings → Mail → Privacy Protection → Protect Mail Activity ON. Blocks tracking pixels and hides your IP from senders.", priority: "medium", category: "tracking" },
        { id: "apple-stolen-device", title: "Enable Stolen Device Protection", desc: "Settings → Face ID & Passcode → Stolen Device Protection → Turn On. Consider setting to 'Always' instead of just 'Away from Familiar Locations'. Prevents thieves from changing your Apple ID password even with your passcode.", link: "https://support.apple.com/en-us/HT212510", priority: "critical", category: "mfa" },
      ]
    },
    {
      id: "google",
      name: "Google",
      icon: "🔍",
      items: [
        { id: "google-passkey", title: "Set up passkey for Google Account", desc: "Go to myaccount.google.com → Security → Passkeys. Google supports passkeys across all platforms. This is the strongest available auth for your Google account.", link: "https://myaccount.google.com/signinoptions/passkeys", priority: "critical", category: "passkey" },
        { id: "google-2sv", title: "Upgrade to Advanced Protection Program", desc: "For highest-risk users: google.com/advancedprotection. Requires security keys and blocks most third-party app access. At minimum, ensure 2-Step Verification is ON with an authenticator app (not just SMS).", link: "https://landing.google.com/advancedprotection/", priority: "high", category: "mfa" },
        { id: "google-recovery", title: "Update recovery phone and email", desc: "myaccount.google.com → Security → Ways we can verify it's you. Ensure your recovery phone and email are current and that you control both.", link: "https://myaccount.google.com/security", priority: "high", category: "recovery" },
        { id: "google-app-access", title: "Revoke third-party app access", desc: "myaccount.google.com → Security → Third-party apps with account access. Remove any app you don't actively use — each one is an attack surface.", link: "https://myaccount.google.com/permissions", priority: "high", category: "permissions" },
        { id: "google-ad-personalization", title: "Turn off Ad personalization", desc: "myaccount.google.com → Data & privacy → Ad Settings → Turn off ad personalization. Also visit adssettings.google.com to manage partner ad settings.", link: "https://adssettings.google.com", priority: "medium", category: "tracking" },
        { id: "google-location-history", title: "Disable Location History / Timeline", desc: "myaccount.google.com → Data & privacy → Location History → Turn off. As of 2025, Google stores Timeline data on-device by default, but cloud backup may still be enabled. Check Google Maps → Profile → Timeline → cloud icon.", link: "https://myaccount.google.com/activitycontrols", priority: "high", category: "tracking" },
        { id: "google-web-activity", title: "Set Web & App Activity to auto-delete at 3 months", desc: "myaccount.google.com → Data & privacy → Web & App Activity → Auto-delete → 3 months. This covers Search, Maps, Assistant, and Chrome sync activity.", link: "https://myaccount.google.com/activitycontrols", priority: "medium", category: "tracking" },
        { id: "google-youtube-history", title: "Set YouTube History to auto-delete at 3 months", desc: "myaccount.google.com → Data & privacy → YouTube History → Auto-delete → 3 months.", priority: "medium", category: "tracking" },
        { id: "google-security-checkup", title: "Run Google Security Checkup", desc: "myaccount.google.com/security-checkup — walks through all active sessions, recent security events, and connected devices. Do this quarterly.", link: "https://myaccount.google.com/security-checkup", priority: "high", category: "permissions" },
        { id: "google-inactive", title: "Set Inactive Account Manager", desc: "myaccount.google.com → Data & privacy → Inactive Account Manager. Choose what happens to your account after 3-18 months of inactivity — notify contacts and/or delete.", link: "https://myaccount.google.com/inactive", priority: "low", category: "recovery" },
      ]
    },
    {
      id: "microsoft",
      name: "Microsoft",
      icon: "🪟",
      items: [
        { id: "ms-passkey", title: "Enable passkey for Microsoft Account", desc: "account.microsoft.com → Security → Advanced Security Options → Add a new way to sign in → Use a passkey. Microsoft now enforces MFA on all admin portals as of February 2026.", link: "https://account.microsoft.com/security", priority: "critical", category: "passkey" },
        { id: "ms-passwordless", title: "Go fully passwordless", desc: "account.microsoft.com → Security → Advanced Security Options → Passwordless Account. Once enabled, your password is removed entirely — sign in only via passkey, Authenticator app, or security key.", link: "https://support.microsoft.com/en-us/account-billing/how-to-go-passwordless-with-your-microsoft-account", priority: "high", category: "mfa" },
        { id: "ms-recovery-code", title: "Generate and save recovery code", desc: "account.microsoft.com → Security → Advanced Security Options → Recovery Code → Generate. Store offline.", priority: "high", category: "recovery" },
        { id: "ms-app-permissions", title: "Audit app and service permissions", desc: "account.microsoft.com → Privacy → App Access. Review which apps have access to your Microsoft data.", link: "https://account.microsoft.com/privacy", priority: "medium", category: "permissions" },
        { id: "ms-ad-settings", title: "Opt out of personalized ads", desc: "account.microsoft.com → Privacy → Advertising preferences → Turn OFF 'See personalized ads in your browser' and 'See personalized ads wherever I use my Microsoft account'.", link: "https://account.microsoft.com/privacy/ad-settings", priority: "medium", category: "tracking" },
        { id: "ms-activity-history", title: "Clear and disable activity history", desc: "account.microsoft.com → Privacy → Activity history → Clear. Also in Windows: Settings → Privacy & Security → Activity history → uncheck 'Store my activity history on this device'.", priority: "medium", category: "tracking" },
        { id: "ms-privacy-dashboard", title: "Run Microsoft Privacy Dashboard audit", desc: "account.microsoft.com/privacy/activity-history — review browsing, search, location, voice, and media activity. Delete categories you don't want retained.", link: "https://account.microsoft.com/privacy", priority: "medium", category: "tracking" },
      ]
    },
    {
      id: "meta",
      name: "Meta (Facebook / Instagram / WhatsApp)",
      icon: "📘",
      items: [
        { id: "meta-passkey", title: "Set up passkey for Facebook", desc: "Facebook → Settings → Accounts Center → Password and Security → Passkeys. Also available for Instagram through the same Accounts Center.", link: "https://accountscenter.facebook.com/password_and_security/", priority: "critical", category: "passkey" },
        { id: "meta-2fa", title: "Enable 2FA with authenticator app (not SMS)", desc: "Settings → Accounts Center → Password and Security → Two-Factor Authentication. Choose Authenticator App over SMS.", priority: "critical", category: "mfa" },
        { id: "meta-login-alerts", title: "Turn on login alerts", desc: "Settings → Accounts Center → Password and Security → Login alerts. Get notified when someone logs into your account from an unrecognized device.", priority: "high", category: "mfa" },
        { id: "meta-app-permissions", title: "Remove unnecessary connected apps", desc: "Settings → Accounts Center → Connected Experiences. Remove any app, website, or game you don't actively use. These can access your profile data.", priority: "high", category: "permissions" },
        { id: "meta-off-activity", title: "Clear and disconnect Off-Facebook Activity", desc: "Settings → Your Information → Off-Facebook Activity → Clear History → Disconnect Future Activity. This stops Meta from linking your browsing/purchase data from partner sites.", link: "https://www.facebook.com/off_facebook_activity/", priority: "high", category: "tracking" },
        { id: "meta-ad-prefs", title: "Limit ad targeting data", desc: "Settings → Accounts Center → Ad Preferences → Ad Settings. Turn off 'Data about your activity from partners', 'Ads shown off of Meta', and review 'Ad Topics' to remove sensitive categories.", priority: "medium", category: "tracking" },
        { id: "meta-face-recognition", title: "Disable face recognition (if available)", desc: "Settings → Privacy → Face Recognition → Off. Meta paused this for most users but it may re-enable. Check after every major app update.", priority: "medium", category: "tracking" },
        { id: "meta-location", title: "Disable location history and precise location", desc: "In Facebook & Instagram app settings, disable Location Services or set to 'While Using'. Disable Location History in app settings.", priority: "medium", category: "tracking" },
      ]
    },
    {
      id: "amazon",
      name: "Amazon",
      icon: "📦",
      items: [
        { id: "amz-passkey", title: "Enable passkey for Amazon", desc: "amazon.com → Account → Login & Security → Passkey → Set Up. Amazon supports passkeys as of late 2024.", link: "https://www.amazon.com/gp/css/homepage.html", priority: "critical", category: "passkey" },
        { id: "amz-2fa", title: "Enable Two-Step Verification", desc: "Amazon → Account → Login & Security → Two-Step Verification → Edit → Enable. Use an authenticator app, not SMS.", link: "https://www.amazon.com/a/settings/approval", priority: "critical", category: "mfa" },
        { id: "amz-devices", title: "Deregister old/unknown devices", desc: "Amazon → Account → Content and Devices → Devices. Remove Kindles, Fire TVs, Echo devices, and apps you no longer use.", priority: "medium", category: "permissions" },
        { id: "amz-alexa-privacy", title: "Delete Alexa voice history and disable saving", desc: "Amazon → Account → Alexa Privacy → Review Voice History → Delete All. Then: Manage Your Alexa Data → Choose how long to save → Don't save recordings.", link: "https://www.amazon.com/alexa-privacy/apd/myad", priority: "high", category: "tracking" },
        { id: "amz-ad-prefs", title: "Opt out of interest-based ads", desc: "amazon.com/adprefs → Do Not Show Interest-Based Ads. Note: this only controls ads served by Amazon's network, not marketplace recommendations.", link: "https://www.amazon.com/adprefs", priority: "medium", category: "tracking" },
        { id: "amz-browsing-history", title: "Turn off browsing history", desc: "Amazon → Account → Browsing History → Manage History → Turn Off. This prevents Amazon from using your browsing for recommendations.", priority: "low", category: "tracking" },
      ]
    },
    {
      id: "banks",
      name: "Banks & Financial",
      icon: "🏦",
      items: [
        { id: "bank-mfa", title: "Enable strongest MFA on all bank accounts", desc: "Log into each bank and enable MFA. Prefer authenticator app or passkey. If only SMS is available, enable it — any MFA beats none. Check: Chase, BoA, Wells Fargo, credit unions, investment accounts (Schwab, Fidelity, Robinhood, Coinbase).", priority: "critical", category: "mfa" },
        { id: "bank-alerts", title: "Set up transaction and login alerts", desc: "Enable push/email/SMS alerts for: any login, transactions over $0 (yes, zero — catch small test charges), international transactions, address or phone changes, new payee additions.", priority: "critical", category: "mfa" },
        { id: "bank-credit-freeze", title: "Freeze credit at all three bureaus + secondary", desc: "Freeze your credit file at Equifax, Experian, TransUnion, Innovis, ChexSystems, and NCTUE. Freezes are free and prevent new accounts from being opened. Temporarily lift when you need credit.", link: "https://www.usa.gov/credit-freeze", priority: "critical", category: "recovery" },
        { id: "bank-pin-verbal", title: "Set verbal/phone PINs on all accounts", desc: "Call each bank and set a verbal password or phone PIN. This prevents social engineering attacks where someone calls pretending to be you.", priority: "high", category: "mfa" },
        { id: "bank-statements", title: "Switch to paperless and review monthly", desc: "Enable paperless statements to reduce mail-based identity theft. Set a monthly calendar reminder to review all account activity.", priority: "medium", category: "permissions" },
        { id: "bank-beneficiaries", title: "Review account beneficiaries and authorized users", desc: "Check that beneficiary designations are current and that no unknown authorized users exist on your accounts.", priority: "medium", category: "recovery" },
      ]
    },
    {
      id: "carriers",
      name: "Mobile Carrier (T-Mobile, AT&T, Verizon)",
      icon: "📱",
      items: [
        { id: "carrier-sim-lock", title: "Set SIM lock / Port-out PIN", desc: "Call your carrier or use their app to add a PORT-OUT PIN or Number Transfer PIN. This prevents SIM-swap attacks. T-Mobile: Account → Security → SIM Protection. AT&T: Account → Security → Extra Security. Verizon: Account → Security → Number Lock.", priority: "critical", category: "mfa" },
        { id: "carrier-account-pin", title: "Set a strong account PIN (not last 4 SSN)", desc: "Change your account PIN to something that is NOT your last 4 SSN digits or birthday. Use a random 6-8 digit PIN and store it in your password manager.", priority: "critical", category: "mfa" },
        { id: "carrier-auth-users", title: "Review authorized account users", desc: "Check who is listed as an authorized user on your carrier account. Remove anyone who shouldn't be there.", priority: "high", category: "permissions" },
        { id: "carrier-cpni", title: "Restrict CPNI (Customer Proprietary Network Information)", desc: "Contact your carrier and request that CPNI sharing be restricted. This prevents your call/usage data from being shared with marketing partners.", priority: "medium", category: "tracking" },
      ]
    },
    {
      id: "password-manager",
      name: "Password Manager",
      icon: "🔐",
      items: [
        { id: "pm-use", title: "Use a dedicated password manager", desc: "If you're not already using one: 1Password, Bitwarden, or Dashlane. Generate unique 20+ character passwords for every account. Never reuse passwords.", priority: "critical", category: "mfa" },
        { id: "pm-master", title: "Ensure master password is strong and unique", desc: "Your master password should be a 5-6 word passphrase (e.g., 'correct-horse-battery-staple-quantum'). It should exist NOWHERE else. Consider writing it down and storing in a physical safe.", priority: "critical", category: "mfa" },
        { id: "pm-2fa", title: "Enable 2FA on password manager itself", desc: "Your password manager IS the keys to the kingdom. Enable the strongest MFA available — security key or authenticator app. Never SMS.", priority: "critical", category: "mfa" },
        { id: "pm-emergency-kit", title: "Print and secure Emergency Kit / Recovery", desc: "1Password: Print Emergency Kit. Bitwarden: Export recovery code. Store in fireproof safe or safety deposit box. Test recovery annually.", priority: "high", category: "recovery" },
        { id: "pm-audit-reuse", title: "Run password health audit", desc: "Most password managers have a 'Watchtower' or 'Security Report' feature. Run it: fix all reused, weak, or breached passwords. Target: 0 reused passwords.", priority: "high", category: "mfa" },
        { id: "pm-share-audit", title: "Review shared vaults and items", desc: "If using family or team sharing, audit who has access to what. Remove sharing for items that no longer need to be shared.", priority: "medium", category: "permissions" },
      ]
    },
  ],

  /* ─── DEVICES & BROWSERS ─── */
  devices: [
    {
      id: "iphone",
      name: "iPhone / iPad",
      icon: "📱",
      items: [
        { id: "ios-update", title: "Update to latest iOS version", desc: "Settings → General → Software Update. iOS updates often contain critical security patches. Enable Automatic Updates for both iOS and Security Responses.", priority: "critical", category: "mfa" },
        { id: "ios-lockdown", title: "Consider Lockdown Mode for high-risk scenarios", desc: "Settings → Privacy & Security → Lockdown Mode. Restricts message attachments, web browsing, and incoming connections. Overkill for most people, but valuable if you're a target.", link: "https://support.apple.com/en-us/HT212650", priority: "low", category: "mfa" },
        { id: "ios-tracking", title: "Disable Allow Apps to Request to Track", desc: "Settings → Privacy & Security → Tracking → OFF 'Allow Apps to Request to Track'. This blanket-denies all app tracking requests.", priority: "high", category: "tracking" },
        { id: "ios-location-apps", title: "Audit per-app location permissions — eliminate 'Always'", desc: "Settings → Privacy & Security → Location Services. Review EVERY app. Change 'Always' to 'While Using' or 'Never'. Very few apps legitimately need 'Always'. WARNING: These settings can revert after iOS updates.", priority: "high", category: "tracking" },
        { id: "ios-precise-location", title: "Disable Precise Location for most apps", desc: "In each app's location setting, toggle off 'Precise Location'. Most apps work fine with approximate location. Only maps/navigation truly need precise.", priority: "medium", category: "tracking" },
        { id: "ios-analytics", title: "Disable Analytics & Improvements", desc: "Settings → Privacy & Security → Analytics & Improvements → Turn ALL toggles OFF. This sends diagnostic data to Apple and third-party developers.", priority: "medium", category: "tracking" },
        { id: "ios-apple-ads", title: "Turn off Personalized Ads", desc: "Settings → Privacy & Security → Apple Advertising → Personalized Ads OFF.", priority: "medium", category: "tracking" },
        { id: "ios-significant-locations", title: "Disable Significant Locations", desc: "Settings → Privacy & Security → Location Services → System Services → Significant Locations → OFF, then Clear History.", priority: "high", category: "tracking" },
        { id: "ios-contacts-full", title: "Audit Contacts access — prefer 'Limited'", desc: "Settings → Privacy & Security → Contacts. Any app with 'Full Access' can read your entire contact list. Switch to 'Limited Access' and select only needed contacts.", priority: "medium", category: "permissions" },
        { id: "ios-photos-limited", title: "Set Photos access to 'Limited' per-app", desc: "Settings → Privacy & Security → Photos. Switch apps from 'Full Access' to 'Limited Access'. You can select specific photos to share rather than your entire library.", priority: "medium", category: "permissions" },
        { id: "ios-app-privacy-report", title: "Enable App Privacy Report", desc: "Settings → Privacy & Security → App Privacy Report → Turn On. Shows which apps access your data and which domains they contact.", priority: "medium", category: "tracking" },
        { id: "ios-face-id-mask", title: "Disable Face ID with mask (unless needed)", desc: "Settings → Face ID & Passcode → Face ID with a Mask OFF. This reduces biometric security somewhat. Keep ON only if you regularly wear a mask.", priority: "low", category: "mfa" },
      ]
    },
    {
      id: "mac",
      name: "Mac / macOS",
      icon: "💻",
      items: [
        { id: "mac-filevault", title: "Enable FileVault disk encryption", desc: "System Settings → Privacy & Security → FileVault → Turn On. Encrypts your entire disk. Store the recovery key in your password manager AND printed offline.", priority: "critical", category: "mfa" },
        { id: "mac-firewall", title: "Enable Firewall", desc: "System Settings → Network → Firewall → Turn On. Consider enabling 'Stealth Mode' under Options for additional protection.", priority: "high", category: "mfa" },
        { id: "mac-login-items", title: "Audit Login Items and background processes", desc: "System Settings → General → Login Items & Extensions. Remove anything you don't recognize. Pay attention to items from Google, Microsoft, and Adobe that auto-add themselves.", priority: "medium", category: "permissions" },
        { id: "mac-full-disk", title: "Review Full Disk Access permissions", desc: "System Settings → Privacy & Security → Full Disk Access. Only your antivirus and backup tool should be here. Remove anything else.", priority: "high", category: "permissions" },
        { id: "mac-auto-update", title: "Enable automatic security updates", desc: "System Settings → General → Software Update → Automatic Updates → ensure all toggles ON, especially 'Install Security Responses and system files'.", priority: "high", category: "mfa" },
      ]
    },
    {
      id: "windows",
      name: "Windows PC",
      icon: "🖥️",
      items: [
        { id: "win-bitlocker", title: "Enable BitLocker / Device Encryption", desc: "Settings → Privacy & Security → Device encryption → Turn on. Or search 'BitLocker' in Start. Save recovery key to Microsoft account AND print offline copy.", priority: "critical", category: "mfa" },
        { id: "win-hello", title: "Set up Windows Hello (PIN + biometric)", desc: "Settings → Accounts → Sign-in options → Windows Hello. Use fingerprint or face recognition plus a PIN. This is more secure than a password for local sign-in.", priority: "high", category: "mfa" },
        { id: "win-updates", title: "Enable automatic Windows updates", desc: "Settings → Windows Update → ensure automatic updates enabled. Security patches are critical.", priority: "critical", category: "mfa" },
        { id: "win-diagnostic", title: "Minimize diagnostic data collection", desc: "Settings → Privacy & Security → Diagnostics & feedback → Send optional diagnostic data OFF. Clear diagnostic data.", priority: "medium", category: "tracking" },
        { id: "win-ad-id", title: "Disable advertising ID", desc: "Settings → Privacy & Security → General → Let apps show me personalized ads by using my advertising ID → OFF.", priority: "medium", category: "tracking" },
        { id: "win-activity-history", title: "Disable Activity History", desc: "Settings → Privacy & Security → Activity History → Clear history and uncheck 'Store my activity history on this device'.", priority: "medium", category: "tracking" },
        { id: "win-find-device", title: "Enable Find My Device", desc: "Settings → Privacy & Security → Find My Device → Turn on. Helps locate, lock, or wipe a lost device.", priority: "medium", category: "recovery" },
      ]
    },
    {
      id: "browsers",
      name: "Browsers (Chrome, Firefox, Safari, Edge)",
      icon: "🌐",
      items: [
        { id: "br-password-save", title: "Disable built-in browser password saving", desc: "Use your dedicated password manager instead. Chrome: Settings → Passwords → Offer to save → OFF. Firefox: Settings → Passwords → OFF. Edge: Settings → Passwords → OFF. Safari: Settings → Passwords → AutoFill → OFF.", priority: "high", category: "mfa" },
        { id: "br-third-party-cookies", title: "Block third-party cookies", desc: "Chrome: Settings → Privacy → Third-party cookies → Block. Firefox: Settings → Privacy → Enhanced Tracking Protection → Strict. Safari: blocks by default via ITP.", priority: "high", category: "tracking" },
        { id: "br-extensions", title: "Audit and minimize browser extensions", desc: "Each extension is an attack surface. Remove any you haven't used in 30 days. Recommended keeps: password manager, uBlock Origin, and that's it for most people.", priority: "high", category: "permissions" },
        { id: "br-safe-browsing", title: "Enable Enhanced Safe Browsing (Chrome)", desc: "Chrome: Settings → Privacy and Security → Safe Browsing → Enhanced protection. Firefox: Security → Block dangerous content (enabled by default).", priority: "medium", category: "mfa" },
        { id: "br-https-only", title: "Enable HTTPS-Only mode", desc: "Chrome: Settings → Privacy → Security → Always use secure connections. Firefox: Settings → Privacy → HTTPS-Only Mode → Enable in all windows.", priority: "medium", category: "mfa" },
        { id: "br-do-not-track", title: "Send 'Do Not Track' / GPC signals", desc: "Enable Global Privacy Control (GPC) in your browser or via an extension like Privacy Badger. Under CCPA, GPC signals are legally binding opt-out requests.", priority: "medium", category: "tracking" },
      ]
    },
  ],

  /* ─── PRIVACY & TRACKING ─── */
  privacy: [
    {
      id: "data-brokers",
      name: "Data Broker Opt-Outs",
      icon: "🕵️",
      items: [
        { id: "db-spokeo", title: "Opt out of Spokeo", desc: "Go to spokeo.com/optout — enter your listing URL. You'll need to find your profile first by searching your name.", link: "https://www.spokeo.com/optout", priority: "high", category: "tracking" },
        { id: "db-whitepages", title: "Opt out of Whitepages / BeenVerified / PeopleFinder", desc: "Each has a separate opt-out form. Whitepages: whitepages.com/suppression-requests. BeenVerified: beenverified.com/app/optout/search. PeopleFinder: peoplefinder.com/optout.", link: "https://www.whitepages.com/suppression-requests", priority: "high", category: "tracking" },
        { id: "db-intelius", title: "Opt out of Intelius / TruthFinder / Instant Checkmate", desc: "These are owned by the same parent company. Use their individual opt-out forms. Some require photo ID upload.", priority: "high", category: "tracking" },
        { id: "db-acxiom", title: "Opt out of Acxiom (data marketing giant)", desc: "isapps.acxiom.com/optout/optout.aspx — Acxiom is one of the largest data brokers. Opt out of their consumer data marketing.", link: "https://isapps.acxiom.com/optout/optout.aspx", priority: "high", category: "tracking" },
        { id: "db-california-drop", title: "Use California DELETE Act (DROP) when available", desc: "Beginning August 2026, California's Delete Request and Opt-Out Platform (DROP) will let you send a single deletion request to ALL registered data brokers at once. Bookmark: privacy.ca.gov/data-brokers", link: "https://privacy.ca.gov/data-brokers/", priority: "medium", category: "tracking" },
        { id: "db-removal-service", title: "Consider a data removal service for automation", desc: "Services like DeleteMe, Optery, or Kanary automate removal requests across 100-500+ brokers and re-check periodically. Brokers re-add you constantly, so automation is practically necessary.", priority: "medium", category: "tracking" },
        { id: "db-google-results", title: "Request removal of personal info from Google Search", desc: "Use Google's removal tool to request that results showing your personal contact info, financial details, or doxxing info be removed from Search results.", link: "https://support.google.com/websearch/troubleshooter/9685456", priority: "medium", category: "tracking" },
      ]
    },
    {
      id: "breach-exposure",
      name: "Breach Exposure",
      icon: "💥",
      items: [
        { id: "hibp-check", title: "Check Have I Been Pwned for your email(s)", desc: "Go to haveibeenpwned.com and enter every email address you use. As of March 2026, HIBP tracks 959 breached sites and 17.5 billion compromised accounts. Change passwords for ANY breached service.", link: "https://haveibeenpwned.com", priority: "critical", category: "mfa" },
        { id: "hibp-notify", title: "Subscribe to breach notifications", desc: "On haveibeenpwned.com, click 'Notify me' and enter your email. You'll get alerted if your email appears in future breaches.", link: "https://haveibeenpwned.com/NotifyMe", priority: "high", category: "mfa" },
        { id: "hibp-phone", title: "Check phone number exposure", desc: "haveibeenpwned.com supports phone number searches. Enter your number in international format (+1...).", link: "https://haveibeenpwned.com", priority: "medium", category: "mfa" },
        { id: "breach-dark-web", title: "Check dark web monitoring from your password manager", desc: "1Password Watchtower, Bitwarden Reports, or Dashlane Dark Web Monitoring all scan for your credentials on dark web dumps. Run a scan now.", priority: "high", category: "mfa" },
        { id: "breach-change-pw", title: "Change all breached passwords to unique 20+ char", desc: "For every breach found, change the password to a unique random 20+ character string generated by your password manager. Check that MFA is enabled on each.", priority: "critical", category: "mfa" },
      ]
    },
    {
      id: "ad-tracking",
      name: "Ad Tracking & Cross-Platform",
      icon: "🎯",
      items: [
        { id: "ad-limit-ios", title: "Limit Ad Tracking on iOS", desc: "Settings → Privacy & Security → Apple Advertising → Personalized Ads OFF. Also: Settings → Privacy → Tracking → deny all.", priority: "high", category: "tracking" },
        { id: "ad-limit-android", title: "Opt out on Android / reset Advertising ID", desc: "Settings → Privacy → Ads → Delete advertising ID. On newer Android (13+), opt out of ad personalization.", priority: "high", category: "tracking" },
        { id: "ad-nai-optout", title: "Run NAI opt-out tool", desc: "Network Advertising Initiative opt-out: optout.networkadvertising.org. Opts you out of behavioral ads from 100+ ad networks.", link: "https://optout.networkadvertising.org", priority: "medium", category: "tracking" },
        { id: "ad-daa-optout", title: "Run DAA opt-out tool", desc: "Digital Advertising Alliance: optout.aboutads.info. Opts out of targeted ads from participating companies.", link: "https://optout.aboutads.info", priority: "medium", category: "tracking" },
        { id: "ad-gpc", title: "Enable Global Privacy Control in browsers", desc: "GPC is a standardized privacy signal. Under CCPA, it's a legally binding opt-out. Enable in Firefox (built-in), or install Privacy Badger / DuckDuckGo extension.", priority: "medium", category: "tracking" },
      ]
    },
    {
      id: "smart-home",
      name: "Smart Home & IoT",
      icon: "🏠",
      items: [
        { id: "sh-router-pw", title: "Change default router admin password", desc: "Access your router admin panel (usually 192.168.1.1 or via the manufacturer app). Change the admin password to a strong unique one. Update WiFi password if it hasn't been changed.", priority: "critical", category: "mfa" },
        { id: "sh-router-firmware", title: "Update router firmware", desc: "Check manufacturer's site or app for firmware updates. Many routers have known vulnerabilities that patches fix. Enable automatic updates if supported.", priority: "high", category: "mfa" },
        { id: "sh-guest-network", title: "Put IoT devices on a separate/guest network", desc: "Create a guest WiFi network for smart home devices (cameras, lights, plugs). This isolates them from your computers and phones if compromised.", priority: "high", category: "mfa" },
        { id: "sh-camera-audit", title: "Audit smart camera access and recordings", desc: "Review who has access to Ring, Nest, Wyze, etc. cameras. Check if cloud recording is enabled and who it's shared with. Consider local-only recording.", priority: "high", category: "permissions" },
        { id: "sh-voice-assistant", title: "Audit voice assistant data", desc: "Alexa: Amazon → Alexa Privacy → Review and delete voice history. Google Home: myactivity.google.com → filter by Voice & Audio. HomeKit: mostly on-device. Delete stored recordings.", priority: "medium", category: "tracking" },
        { id: "sh-default-passwords", title: "Change default passwords on ALL IoT devices", desc: "Smart cameras, baby monitors, printers, NAS drives, etc. Many ship with well-known default credentials. Change them all.", priority: "critical", category: "mfa" },
      ]
    },
  ],

  /* ─── SETTINGS THAT QUIETLY RE-ENABLE ─── */
  sneaky_resets: [
    { id: "reset-ios-location", title: "iOS: Location permissions revert to 'Always' after major updates", desc: "After upgrading iOS (e.g., iOS 25 → iOS 26), some apps re-request or reset location to 'Always'. Check after every major update.", freq: "After every iOS update" },
    { id: "reset-ios-analytics", title: "iOS: Analytics & Improvements re-enable after updates", desc: "Apple's diagnostics toggles have been reported to reset to ON after major iOS updates. Re-check Settings → Privacy → Analytics.", freq: "After every iOS update" },
    { id: "reset-win-diagnostic", title: "Windows: Diagnostic data resets after feature updates", desc: "Windows feature updates (e.g., 24H2) can re-enable optional diagnostic data sharing. Re-check Settings → Privacy → Diagnostics.", freq: "After every Windows update" },
    { id: "reset-win-ad-id", title: "Windows: Advertising ID can re-enable after updates", desc: "Check Settings → Privacy → General → Advertising ID after every major Windows update.", freq: "After every Windows update" },
    { id: "reset-google-web-activity", title: "Google: Web & App Activity auto-delete resets", desc: "If you set auto-delete to 3 months, verify the setting persists at myaccount.google.com/activitycontrols. New Google features may introduce separate activity tracking.", freq: "Quarterly" },
    { id: "reset-meta-off-activity", title: "Meta: Off-Facebook Activity reconnects after app updates", desc: "Major Facebook app updates can re-enable Off-Facebook Activity tracking. Re-disconnect in Settings → Off-Facebook Activity.", freq: "After every app update" },
    { id: "reset-alexa-recordings", title: "Alexa: Voice recording settings can reset", desc: "After Alexa app updates or new Echo setup, verify Alexa Privacy settings still show 'Don't save recordings'.", freq: "Quarterly" },
    { id: "reset-chrome-cookies", title: "Chrome: Cookie settings may change with browser updates", desc: "Chrome cookie policies are actively changing. Verify third-party cookie blocking after every major Chrome version update.", freq: "After every Chrome update" },
  ],

  /* ─── RECURRING CHECKS CALENDAR ─── */
  calendar: [
    { freq: "Weekly", title: "Review bank and credit card transactions", desc: "Quick scan of all account activity for unauthorized charges. Check every account, including ones you rarely use." },
    { freq: "Monthly", title: "Run password manager security audit", desc: "Check Watchtower/Security Report for new breaches, weak passwords, and reused credentials. Fix any flagged items immediately." },
    { freq: "Monthly", title: "Review app permissions on phone", desc: "Settings → Privacy → review Location, Camera, Microphone, Contacts, Photos. Remove access for apps you haven't used." },
    { freq: "Quarterly", title: "Run Have I Been Pwned check on all emails", desc: "Check haveibeenpwned.com with every email address you use. Change passwords for any new breaches." },
    { freq: "Quarterly", title: "Run Google Security Checkup", desc: "myaccount.google.com/security-checkup — review active sessions, connected apps, recent events." },
    { freq: "Quarterly", title: "Review and revoke third-party app access", desc: "Check Google, Apple, Microsoft, Facebook, and GitHub OAuth grants. Remove apps you no longer use." },
    { freq: "Quarterly", title: "Verify 'sneaky reset' settings haven't reverted", desc: "Re-check all items in the 'Settings That Reset' section of this dashboard. Especially important after OS or app updates." },
    { freq: "Semi-annually", title: "Check data broker listings", desc: "Search your name on Spokeo, Whitepages, BeenVerified, and FastPeopleSearch. Re-submit opt-out requests for any new listings. Brokers re-add you." },
    { freq: "Semi-annually", title: "Review credit reports from all 3 bureaus", desc: "annualcreditreport.com — check Equifax, Experian, TransUnion. Look for accounts you didn't open. Verify your credit is still frozen." },
    { freq: "Semi-annually", title: "Test account recovery flows", desc: "Verify you can still access your recovery keys, codes, and contacts. Test recovery for your password manager, Apple ID, and Google account." },
    { freq: "Annually", title: "Full device audit and cleanup", desc: "Factory-reset and donate/recycle old devices. Audit all active devices on Apple, Google, and Microsoft accounts. Remove deregistered ones." },
    { freq: "Annually", title: "Update emergency contacts and legacy access", desc: "Review Apple Legacy Contact, Google Inactive Account Manager, password manager emergency access. Ensure designees are still appropriate." },
    { freq: "After every OS/app update", title: "Re-check privacy settings that reset", desc: "iOS location permissions, analytics toggles, Windows diagnostic data, Meta Off-Facebook Activity. See 'Settings That Reset' section." },
  ],

  /* ─── RECENT MAJOR BREACHES (for context) ─── */
  recent_breaches: [
    { name: "Under Armour", date: "Nov 2025", accounts: "72.7M", severity: "high" },
    { name: "SoundCloud", date: "Dec 2025", accounts: "29.8M", severity: "high" },
    { name: "Canadian Tire", date: "Oct 2025", accounts: "38.3M", severity: "high" },
    { name: "Prosper", date: "Sep 2025", accounts: "17.6M", severity: "high" },
    { name: "Instagram", date: "Jan 2026", accounts: "6.2M", severity: "medium" },
    { name: "Panera Bread", date: "Jan 2026", accounts: "5.1M", severity: "medium" },
    { name: "Betterment", date: "Jan 2026", accounts: "1.4M", severity: "medium" },
    { name: "Substack", date: "Oct 2025", accounts: "663K", severity: "medium" },
    { name: "Synthient Stealer Logs", date: "Apr 2025", accounts: "183M", severity: "critical" },
    { name: "Synthient Credential Stuffing", date: "Apr 2025", accounts: "2B", severity: "critical" },
  ]
};
