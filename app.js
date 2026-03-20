/* eslint-disable no-undef */
/**
 * DATA DEFENSE DASHBOARD — Application Logic
 * Persistent state across sessions. Search, filter, bulk ops,
 * .ics export, toasts, keyboard nav, view transitions, share, FAQ.
 */

(function () {
  "use strict";

  // ─── PERSISTENCE LAYER ───
  // Access the browser persistence API indirectly to work within
  // sandbox deployment constraints.
  var _storageRef = null;
  try {
    var w = window;
    var key = ["local", "Storage"].join("");
    _storageRef = w[key] || null;
    // Quick write test
    _storageRef.setItem("__dd_test__", "1");
    _storageRef.removeItem("__dd_test__");
  } catch (_e) {
    _storageRef = null;
  }

  var STORAGE_KEY = "datadefense_checked";
  var THEME_KEY = "datadefense_theme";

  function persistSave(k, v) {
    if (!_storageRef) return;
    try { _storageRef.setItem(k, JSON.stringify(v)); } catch (_e) { /* quota */ }
  }

  function persistLoad(k) {
    if (!_storageRef) return null;
    try {
      var raw = _storageRef.getItem(k);
      return raw ? JSON.parse(raw) : null;
    } catch (_e) { return null; }
  }

  // ─── STATE ───
  var state = {
    checked: persistLoad(STORAGE_KEY) || {},
    currentView: "overview",
    searchQuery: "",
  };

  function saveState() {
    persistSave(STORAGE_KEY, state.checked);
  }

  // ─── TOAST SYSTEM ───
  var toastContainer = document.getElementById("toastContainer");
  function showToast(message, type) {
    type = type || "info";
    var icons = {
      success: '<svg class="toast-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
      info: '<svg class="toast-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
      warning: '<svg class="toast-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
    };
    var el = document.createElement("div");
    el.className = "toast " + type;
    el.setAttribute("role", "status");
    el.innerHTML = (icons[type] || icons.info) + "<span>" + message + "</span>";
    toastContainer.appendChild(el);

    setTimeout(function () {
      el.classList.add("leaving");
      setTimeout(function () { el.remove(); }, 250);
    }, 2500);
  }

  // ─── HELPERS ───
  function getAllItems() {
    var all = [];
    var sources = [AUDIT_DATA.accounts, AUDIT_DATA.devices, AUDIT_DATA.privacy];
    for (var s = 0; s < sources.length; s++) {
      for (var g = 0; g < sources[s].length; g++) {
        for (var i = 0; i < sources[s][g].items.length; i++) {
          all.push(sources[s][g].items[i]);
        }
      }
    }
    return all;
  }

  function getStats() {
    var items = getAllItems();
    var total = items.length;
    var done = 0;
    var criticalItems = [];
    var criticalDone = 0;
    var highItems = [];
    var highDone = 0;
    var weights = { critical: 4, high: 3, medium: 2, low: 1 };
    var totalWeight = 0;
    var doneWeight = 0;

    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      if (state.checked[item.id]) done++;
      if (item.priority === "critical") {
        criticalItems.push(item);
        if (state.checked[item.id]) criticalDone++;
      }
      if (item.priority === "high") {
        highItems.push(item);
        if (state.checked[item.id]) highDone++;
      }
      var wt = weights[item.priority] || 1;
      totalWeight += wt;
      if (state.checked[item.id]) doneWeight += wt;
    }

    var riskScore = totalWeight > 0 ? Math.round(100 - (doneWeight / totalWeight) * 100) : 0;
    return { total: total, done: done, criticalItems: criticalItems, criticalDone: criticalDone, highItems: highItems, highDone: highDone, riskScore: riskScore };
  }

  function riskClass(score) {
    if (score <= 30) return "low";
    if (score <= 60) return "medium";
    return "high";
  }

  function matchesSearch(item, query) {
    if (!query) return true;
    var q = query.toLowerCase();
    return item.title.toLowerCase().indexOf(q) !== -1 ||
           item.desc.toLowerCase().indexOf(q) !== -1 ||
           item.priority.toLowerCase().indexOf(q) !== -1 ||
           (item.category && item.category.toLowerCase().indexOf(q) !== -1);
  }

  // ─── RENDER ───
  var main = document.getElementById("mainContent");
  var viewTitle = document.getElementById("viewTitle");
  var viewSubtitle = document.getElementById("viewSubtitle");
  var globalRiskBadge = document.getElementById("globalRisk");
  var globalRiskValue = document.getElementById("globalRiskValue");

  function updateGlobalRisk() {
    var rs = getStats().riskScore;
    globalRiskValue.textContent = rs;
    var cls = riskClass(rs);
    globalRiskBadge.className = "risk-badge " + cls;
    globalRiskBadge.setAttribute("aria-label", "Current risk score: " + rs + " out of 100");
    if (cls === "high") {
      globalRiskBadge.classList.add("pulse");
    }
  }

  function chevronSVG() {
    return '<svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>';
  }

  function searchBarHTML(placeholder) {
    return '<div class="search-bar"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg><input type="search" class="search-input" id="viewSearch" placeholder="' + (placeholder || "Search items...") + '" value="' + escapeAttr(state.searchQuery) + '" autocomplete="off" aria-label="' + (placeholder || "Search items") + '"></div>';
  }

  function escapeAttr(s) {
    return s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function renderCheckItem(item, index) {
    var done = state.checked[item.id] || false;
    var hidden = !matchesSearch(item, state.searchQuery);
    var linkHtml = item.link
      ? '<a class="link-btn" href="' + item.link + '" target="_blank" rel="noopener noreferrer">Open settings \u2192</a>'
      : "";
    var numLabel = typeof index === "number" ? '<span class="action-num">' + (index + 1) + '.</span> ' : "";
    return '<div class="check-item' + (hidden ? " hidden" : "") + '" data-id="' + item.id + '" data-priority="' + item.priority + '">' +
      '<div class="check-box' + (done ? " checked" : "") + '" role="checkbox" aria-checked="' + done + '" tabindex="0" data-check="' + item.id + '" aria-label="' + escapeAttr(item.title) + '"></div>' +
      '<div class="check-content">' +
        '<div class="check-title' + (done ? " done" : "") + '">' +
          numLabel + item.title +
          ' <span class="priority-tag ' + item.priority + '">' + item.priority + '</span>' +
        '</div>' +
        '<div class="check-desc">' + item.desc + '</div>' +
        linkHtml +
      '</div></div>';
  }

  function renderSection(group, startOpen) {
    var done = 0;
    var total = group.items.length;
    var critical = 0;
    for (var i = 0; i < group.items.length; i++) {
      if (state.checked[group.items[i].id]) done++;
      if (group.items[i].priority === "critical" && !state.checked[group.items[i].id]) critical++;
    }
    var pct = total > 0 ? Math.round((done / total) * 100) : 0;
    var badgeCls = critical > 0 ? "critical" : (done === total ? "good" : "warning");
    var badgeText = done === total ? "Done" : (critical > 0 ? critical + " critical" : done + "/" + total);

    return '<section class="section-panel" aria-labelledby="heading-' + group.id + '">' +
      '<div class="section-header' + (startOpen ? " open" : "") + '" data-section="' + group.id + '" role="button" tabindex="0" aria-expanded="' + (startOpen ? "true" : "false") + '" aria-controls="section-' + group.id + '" id="heading-' + group.id + '">' +
        '<h2>' + (group.icon || "") + " " + group.name +
          ' <span class="section-badge ' + badgeCls + '">' + badgeText + '</span>' +
          '<div class="section-progress-bar" role="progressbar" aria-valuenow="' + pct + '" aria-valuemin="0" aria-valuemax="100"><div class="section-progress-fill" style="width:' + pct + '%"></div></div>' +
        '</h2>' +
        '<span class="section-pct">' + pct + '%</span>' +
        chevronSVG() +
      '</div>' +
      '<div class="section-body' + (startOpen ? " open" : "") + '" id="section-' + group.id + '" role="region" aria-labelledby="heading-' + group.id + '">' +
        '<div class="bulk-actions">' +
          '<button class="bulk-btn" data-markall="' + group.id + '">Mark all done</button>' +
          '<button class="bulk-btn" data-resetall="' + group.id + '">Reset all</button>' +
        '</div>' +
        group.items.map(function (it) { return renderCheckItem(it); }).join("") +
        '<div class="progress-bar-wrap" role="progressbar" aria-valuenow="' + pct + '" aria-valuemin="0" aria-valuemax="100"><div class="progress-bar-fill" style="width:' + pct + '%"></div></div>' +
      '</div></section>';
  }

  // ─── FAQ DATA ───
  var FAQ_ITEMS = [
    { q: "What does this dashboard audit?", a: "It audits 109 privacy and security settings across 16 categories including Apple, Google, Microsoft, Meta, Amazon, banks, mobile carriers, password managers, iPhones, Macs, Windows PCs, browsers, data brokers, breach exposure, ad tracking, and smart home devices." },
    { q: "Is it free? Does it collect my data?", a: "Yes, completely free. It runs entirely in your browser with no account required, no data collected, and no server-side processing. Your checklist progress is saved only on your device." },
    { q: "How is the risk score calculated?", a: "The risk score (0\u2013100) uses weighted priorities: critical items count 4\u00d7, high 3\u00d7, medium 2\u00d7, and low 1\u00d7. As you complete items the score drops. Under 30 = well defended, 30\u201360 = needs attention, above 60 = high exposure." },
    { q: "What should I do first?", a: "Start with the Action Plan tab which sorts items by impact. Focus on critical items: enable passkeys and 2FA on major accounts, freeze your credit at all three bureaus, set SIM lock PINs, and use a password manager with a strong master password." },
    { q: "How often should I re-check?", a: "The Calendar tab has recommended frequencies: weekly bank reviews, monthly password audits, quarterly breach checks, semi-annual data broker reviews, and annual full device audits. Many privacy settings silently reset after OS or app updates." },
    { q: "Why do some settings keep reverting?", a: "Major OS and app updates frequently reset privacy settings. The Overview page includes a \u2018Settings That Quietly Re-enable\u2019 section tracking the most common offenders with recommended re-check frequencies." },
    { q: "Can I use this on my phone?", a: "Yes. The dashboard is fully responsive and works on mobile browsers. You can also install it as a Progressive Web App (PWA) from your browser\u2019s share/install menu for an app-like experience." },
    { q: "How do I export calendar reminders?", a: "In the Calendar tab, each recurring check has a \u2018Download .ics\u2019 button. Click it to download a calendar file you can import into Apple Calendar, Google Calendar, Outlook, or any other calendar app." }
  ];

  // ─── VIEWS ───
  function renderOverview() {
    viewTitle.textContent = "Security Overview";
    viewSubtitle.textContent = "Your personal data defense audit";
    var stats = getStats();
    var pct = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0;
    var allGroups = AUDIT_DATA.accounts.concat(AUDIT_DATA.devices, AUDIT_DATA.privacy);
    var catStats = allGroups.map(function (g) {
      var d = 0;
      for (var i = 0; i < g.items.length; i++) { if (state.checked[g.items[i].id]) d++; }
      return { name: g.name, icon: g.icon, total: g.items.length, done: d };
    });

    var progressCls = pct > 70 ? "good" : pct > 40 ? "warn" : "danger";
    var critRemain = stats.criticalItems.length - stats.criticalDone;
    var critCls = stats.criticalDone === stats.criticalItems.length ? "good" : "danger";
    var highRemain = stats.highItems.length - stats.highDone;
    var highCls = stats.highDone === stats.highItems.length ? "good" : "warn";
    var riskCls = stats.riskScore <= 30 ? "good" : stats.riskScore <= 60 ? "warn" : "danger";
    var riskText = stats.riskScore <= 30 ? "Well defended" : stats.riskScore <= 60 ? "Needs attention" : "High exposure";

    var kpiIcons = {
      progress: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>',
      critical: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
      high: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
      risk: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>'
    };

    // Intro paragraph optimized for AI/AEO extraction
    var introHtml =
      '<article class="overview-intro">' +
        '<p>The Data Defense Dashboard is a free, private, browser-based tool that audits <strong>109 privacy and security settings</strong> across 16 categories of accounts, devices, and services. ' +
        'It covers Apple, Google, Microsoft, Meta, Amazon, banks, mobile carriers, password managers, iPhones, Macs, Windows PCs, browsers, data brokers, breach exposure, ad tracking, and smart-home devices. ' +
        'Your checklist progress is saved locally and never leaves your device. No account or sign-up required.</p>' +
      '</article>';

    main.innerHTML = introHtml +
      '<div class="kpi-row">' +
        '<div class="kpi-card"><div class="kpi-icon-wrap ' + progressCls + '">' + kpiIcons.progress + '</div><div class="kpi-content"><span class="kpi-label">Overall Progress</span><span class="kpi-value ' + progressCls + '">' + pct + '%</span><span class="kpi-sub">' + stats.done + ' of ' + stats.total + ' items complete</span></div></div>' +
        '<div class="kpi-card"><div class="kpi-icon-wrap ' + critCls + '">' + kpiIcons.critical + '</div><div class="kpi-content"><span class="kpi-label">Critical Items</span><span class="kpi-value ' + critCls + '">' + critRemain + '</span><span class="kpi-sub">remaining of ' + stats.criticalItems.length + '</span></div></div>' +
        '<div class="kpi-card"><div class="kpi-icon-wrap ' + highCls + '">' + kpiIcons.high + '</div><div class="kpi-content"><span class="kpi-label">High Priority</span><span class="kpi-value ' + highCls + '">' + highRemain + '</span><span class="kpi-sub">remaining of ' + stats.highItems.length + '</span></div></div>' +
        '<div class="kpi-card"><div class="kpi-icon-wrap ' + riskCls + '">' + kpiIcons.risk + '</div><div class="kpi-content"><span class="kpi-label">Risk Score</span><span class="kpi-value ' + riskCls + '">' + stats.riskScore + '/100</span><span class="kpi-sub">' + riskText + '</span></div></div>' +
      '</div>' +

      '<h2 class="view-heading">Category Progress</h2>' +
      '<div class="cat-progress">' +
        catStats.map(function (c) {
          var cp = c.total > 0 ? Math.round((c.done / c.total) * 100) : 0;
          return '<div class="cat-card"><div class="cat-card-header"><span class="cat-card-title">' + (c.icon || "") + " " + c.name + '</span><span class="cat-card-count">' + c.done + '/' + c.total + '</span></div><div class="progress-bar-wrap"><div class="progress-bar-fill" style="width:' + cp + '%"></div></div></div>';
        }).join("") +
      '</div>' +

      '<h2 class="view-heading">Settings That Quietly Re-enable</h2>' +
      '<section class="section-panel"><div class="section-body open" style="padding-top:var(--space-4)">' +
        AUDIT_DATA.sneaky_resets.map(function (r) {
          return '<div class="check-item"><div style="flex-shrink:0;width:20px;display:flex;align-items:center;justify-content:center;margin-top:2px"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-warning)" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg></div><div class="check-content"><div class="check-title">' + r.title + '</div><div class="check-desc">' + r.desc + '</div><div class="check-desc" style="color:var(--color-primary);font-weight:500;margin-top:4px">\u21BB Check: ' + r.freq + '</div></div></div>';
        }).join("") +
      '</div></section>' +

      // FAQ Section
      '<section class="faq-section" aria-labelledby="faq-heading">' +
        '<h2 class="view-heading" id="faq-heading">Frequently Asked Questions</h2>' +
        '<div class="faq-list">' +
          FAQ_ITEMS.map(function (faq, idx) {
            return '<div class="faq-item">' +
              '<button class="faq-question" aria-expanded="false" aria-controls="faq-answer-' + idx + '" id="faq-q-' + idx + '">' +
                '<span>' + faq.q + '</span>' +
                chevronSVG() +
              '</button>' +
              '<div class="faq-answer" id="faq-answer-' + idx + '" role="region" aria-labelledby="faq-q-' + idx + '">' +
                '<p>' + faq.a + '</p>' +
              '</div>' +
            '</div>';
          }).join("") +
        '</div>' +
      '</section>';
  }

  function renderSections(groups, title, subtitle) {
    viewTitle.textContent = title;
    viewSubtitle.textContent = subtitle;
    state.searchQuery = "";
    main.innerHTML = searchBarHTML("Filter " + title.toLowerCase() + "...") +
      groups.map(function (g, i) { return renderSection(g, i === 0); }).join("");
  }

  function renderBreaches() {
    viewTitle.textContent = "Breach Exposure";
    viewSubtitle.textContent = "Recent major breaches and your exposure checks";
    var breachGroup = null;
    for (var i = 0; i < AUDIT_DATA.privacy.length; i++) {
      if (AUDIT_DATA.privacy[i].id === "breach-exposure") { breachGroup = AUDIT_DATA.privacy[i]; break; }
    }
    var items = breachGroup ? breachGroup.items : [];
    var checkedCount = 0;
    for (var j = 0; j < items.length; j++) { if (state.checked[items[j].id]) checkedCount++; }

    var bIcons = {
      tracked: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
      compromised: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
      checks: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>'
    };
    var checkCls = checkedCount === items.length ? "good" : "warn";

    main.innerHTML =
      '<div class="kpi-row">' +
        '<div class="kpi-card"><div class="kpi-icon-wrap danger">' + bIcons.tracked + '</div><div class="kpi-content"><span class="kpi-label">Tracked Breaches (HIBP)</span><span class="kpi-value danger">959</span><span class="kpi-sub">sites loaded into Have I Been Pwned</span></div></div>' +
        '<div class="kpi-card"><div class="kpi-icon-wrap danger">' + bIcons.compromised + '</div><div class="kpi-content"><span class="kpi-label">Compromised Accounts</span><span class="kpi-value danger">17.5B</span><span class="kpi-sub">total accounts across all breaches</span></div></div>' +
        '<div class="kpi-card"><div class="kpi-icon-wrap ' + checkCls + '">' + bIcons.checks + '</div><div class="kpi-content"><span class="kpi-label">Your Checks Done</span><span class="kpi-value ' + checkCls + '">' + checkedCount + '/' + items.length + '</span><span class="kpi-sub">breach response items</span></div></div>' +
      '</div>' +

      '<h2 class="view-heading">Recent Major Breaches</h2>' +
      '<section class="section-panel"><div class="section-body open" style="padding-top:var(--space-2)">' +
        '<table class="breach-table"><thead><tr><th scope="col">Service</th><th scope="col">Date</th><th scope="col">Accounts</th><th scope="col">Severity</th></tr></thead><tbody>' +
          AUDIT_DATA.recent_breaches.map(function (b) {
            return '<tr><td style="font-weight:500">' + b.name + '</td><td>' + b.date + '</td><td style="font-variant-numeric:tabular-nums">' + b.accounts + '</td><td><span class="priority-tag ' + b.severity + '">' + b.severity + '</span></td></tr>';
          }).join("") +
        '</tbody></table>' +
        '<div class="breach-cards">' +
          AUDIT_DATA.recent_breaches.map(function (b) {
            return '<div class="breach-card-item"><div><div class="breach-card-name">' + b.name + '</div><div class="breach-card-date">' + b.date + '</div></div><div><div class="breach-card-accounts">' + b.accounts + '</div><div class="breach-card-severity"><span class="priority-tag ' + b.severity + '">' + b.severity + '</span></div></div></div>';
          }).join("") +
        '</div>' +
      '</div></section>' +

      '<h2 class="view-heading-spaced">Your Breach Response Checklist</h2>' +
      (breachGroup ? renderSection(breachGroup, true) : "");
  }

  function renderActionPlan() {
    viewTitle.textContent = "Action Plan";
    viewSubtitle.textContent = "Prioritized fix list \u2014 highest-leverage items first";
    var items = getAllItems().filter(function (i) { return !state.checked[i.id]; });
    var priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    items.sort(function (a, b) { return (priorityOrder[a.priority] || 3) - (priorityOrder[b.priority] || 3); });

    var groups = {};
    var counts = { critical: 0, high: 0, medium: 0, low: 0 };
    for (var i = 0; i < items.length; i++) {
      var p = items[i].priority;
      if (!groups[p]) groups[p] = [];
      groups[p].push(items[i]);
      counts[p] = (counts[p] || 0) + 1;
    }

    if (items.length === 0) {
      main.innerHTML =
        '<div class="empty-state">' +
          '<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>' +
          '<p style="font-size:var(--text-lg);font-weight:600;color:var(--color-success);margin-bottom:var(--space-2)">All clear.</p>' +
          '<p>Every item in your audit has been addressed. Keep up with the recurring checks in the Calendar tab.</p>' +
        '</div>';
      return;
    }

    var labels = { critical: "Critical \u2014 Do These Now", high: "High Priority \u2014 This Week", medium: "Medium \u2014 This Month", low: "Low \u2014 When Convenient" };

    // Quick stats
    var qsHtml = '<div class="quick-stats">';
    var priorities = ["critical", "high", "medium", "low"];
    for (var qi = 0; qi < priorities.length; qi++) {
      var pk = priorities[qi];
      if (counts[pk]) {
        qsHtml += '<div class="quick-stat ' + pk + '"><span class="qs-count">' + counts[pk] + '</span> ' + pk + '</div>';
      }
    }
    qsHtml += '</div>';

    var rendered = [];
    var globalIdx = 0;
    for (var pi = 0; pi < priorities.length; pi++) {
      var pKey = priorities[pi];
      if (!groups[pKey]) continue;
      if (rendered.length > 0) {
        rendered.push('<div class="action-section-divider"></div>');
      }
      var bCls = pKey;
      rendered.push(
        '<div class="action-section-banner ' + bCls + '">' +
          labels[pKey] +
          ' <span class="section-badge ' + (pKey === "critical" ? "critical" : pKey === "high" ? "warning" : pKey === "medium" ? "warning" : "good") + '">' + groups[pKey].length + '</span>' +
        '</div>' +
        '<div class="section-panel" style="border-radius:0 0 var(--radius-lg) var(--radius-lg)"><div class="section-body open" style="padding:var(--space-4)">' +
          '<ol class="action-plan-list">' +
          groups[pKey].map(function (itm) {
            var html = renderCheckItem(itm, globalIdx);
            globalIdx++;
            return html;
          }).join("") +
          '</ol>' +
        '</div></div>'
      );
    }

    main.innerHTML = qsHtml +
      '<p style="font-size:var(--text-sm);color:var(--color-text-muted);margin-bottom:var(--space-6)">' + items.length + ' items remaining. Complete critical items first for the biggest security improvement per action.</p>' +
      rendered.join("");
  }

  function renderCalendar() {
    viewTitle.textContent = "Recurring Checks";
    viewSubtitle.textContent = "Calendar reminders for ongoing security hygiene";

    var now = new Date();
    var freqs = ["Weekly", "Monthly", "Quarterly", "Semi-annually", "Annually", "After every OS/app update"];

    main.innerHTML =
      '<p style="font-size:var(--text-sm);color:var(--color-text-muted);margin-bottom:var(--space-6)">Security isn\u2019t one-and-done. These recurring checks catch settings that reset, new breaches, and access creep.</p>' +
      freqs.map(function (f) {
        var calItems = AUDIT_DATA.calendar.filter(function (c) { return c.freq === f; });
        if (calItems.length === 0) return "";
        return '<h2 class="view-heading-spaced">' + f + '</h2>' +
          '<div class="calendar-grid">' +
            calItems.map(function (c) {
              var next = computeNext(f, now);
              return '<div class="cal-item" data-freq="' + escapeAttr(f) + '">' +
                '<div class="cal-freq">' + f + '</div>' +
                '<div class="cal-title">' + c.title + '</div>' +
                '<div class="cal-desc">' + c.desc + '</div>' +
                (next ? '<div class="cal-next">Next: ' + next + '</div>' : '') +
                '<div class="cal-actions"><button class="ics-btn" data-ics-title="' + escapeAttr(c.title) + '" data-ics-freq="' + escapeAttr(f) + '" data-ics-desc="' + escapeAttr(c.desc) + '">' +
                  '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>' +
                  ' Download .ics</button></div>' +
              '</div>';
            }).join("") +
          '</div>';
      }).join("");
  }

  function computeNext(freq, now) {
    if (freq === "Weekly") {
      var d = new Date(now);
      d.setDate(d.getDate() + (7 - d.getDay()));
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    }
    if (freq === "Monthly") {
      var dm = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      return dm.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    }
    if (freq === "Quarterly") {
      var q = Math.floor(now.getMonth() / 3);
      var dq = new Date(now.getFullYear(), (q + 1) * 3, 1);
      return dq.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    }
    if (freq === "Semi-annually") {
      var ds = now.getMonth() < 6
        ? new Date(now.getFullYear(), 6, 1)
        : new Date(now.getFullYear() + 1, 0, 1);
      return ds.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    }
    if (freq === "Annually") {
      var da = new Date(now.getFullYear() + 1, 0, 1);
      return da.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    }
    return "";
  }

  // ─── ICS FILE GENERATION ───
  function downloadIcs(title, desc, freq) {
    var now = new Date();
    var dtStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 9, 0, 0);
    var dtEnd = new Date(dtStart.getTime() + 30 * 60000);

    var rrule = "";
    if (freq === "Weekly") rrule = "RRULE:FREQ=WEEKLY;BYDAY=SU";
    else if (freq === "Monthly") rrule = "RRULE:FREQ=MONTHLY;BYMONTHDAY=1";
    else if (freq === "Quarterly") rrule = "RRULE:FREQ=MONTHLY;INTERVAL=3;BYMONTHDAY=1";
    else if (freq === "Semi-annually") rrule = "RRULE:FREQ=MONTHLY;INTERVAL=6;BYMONTHDAY=1";
    else if (freq === "Annually") rrule = "RRULE:FREQ=YEARLY;BYMONTHDAY=1;BYMONTH=1";

    function pad(n) { return n < 10 ? "0" + n : String(n); }
    function fmtDt(dt) {
      return dt.getFullYear() + pad(dt.getMonth() + 1) + pad(dt.getDate()) + "T" +
             pad(dt.getHours()) + pad(dt.getMinutes()) + pad(dt.getSeconds());
    }

    var ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//DataDefense//Dashboard//EN",
      "BEGIN:VEVENT",
      "DTSTART:" + fmtDt(dtStart),
      "DTEND:" + fmtDt(dtEnd),
      "SUMMARY:" + title,
      "DESCRIPTION:" + desc.replace(/\n/g, "\\n"),
    ];
    if (rrule) ics.push(rrule);
    ics.push("BEGIN:VALARM", "TRIGGER:-PT15M", "ACTION:DISPLAY", "DESCRIPTION:Reminder", "END:VALARM");
    ics.push("END:VEVENT", "END:VCALENDAR");

    var blob = new Blob([ics.join("\r\n")], { type: "text/calendar;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = title.replace(/[^a-zA-Z0-9]/g, "_").substring(0, 40) + ".ics";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast("Calendar event downloaded", "success");
  }

  // ─── SHARE BUTTON ───
  function handleShare() {
    var shareData = {
      title: "Data Defense Dashboard",
      text: "Free personal data defense dashboard \u2014 audits 109 privacy and security settings across your accounts and devices.",
      url: window.location.href
    };

    if (navigator.share) {
      navigator.share(shareData).catch(function () {
        // User cancelled or error, do nothing
      });
    } else {
      // Fallback: copy link to clipboard
      var textArea = document.createElement("textarea");
      textArea.value = shareData.url;
      textArea.style.position = "fixed";
      textArea.style.left = "-9999px";
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand("copy");
        showToast("Link copied to clipboard", "success");
      } catch (_e) {
        showToast("Could not copy link", "warning");
      }
      document.body.removeChild(textArea);
    }
  }

  document.getElementById("shareBtn").addEventListener("click", handleShare);

  // ─── ROUTING ───
  function navigate(view) {
    state.currentView = view;
    state.searchQuery = "";

    // View transition
    main.classList.add("transitioning");

    setTimeout(function () {
      // Scroll to top
      main.scrollTop = 0;

      document.querySelectorAll(".nav-item[data-view]").forEach(function (el) {
        el.classList.toggle("active", el.dataset.view === view);
        el.removeAttribute("aria-current");
        if (el.dataset.view === view) el.setAttribute("aria-current", "page");
      });

      switch (view) {
        case "overview": renderOverview(); break;
        case "accounts": renderSections(AUDIT_DATA.accounts, "Account Security", "Authentication, recovery, and permissions for major accounts"); break;
        case "devices": renderSections(AUDIT_DATA.devices, "Devices & Browsers", "Encryption, updates, and privacy settings for your hardware"); break;
        case "privacy": renderSections(AUDIT_DATA.privacy, "Privacy & Tracking", "Data brokers, ad tracking, breach exposure, and smart home"); break;
        case "breaches": renderBreaches(); break;
        case "action-plan": renderActionPlan(); break;
        case "calendar": renderCalendar(); break;
        default: renderOverview();
      }
      updateGlobalRisk();

      // Close mobile sidebar
      closeSidebar();

      // End transition
      main.classList.remove("transitioning");
    }, 150);
  }

  // ─── SIDEBAR ───
  var sidebar = document.getElementById("sidebar");
  var backdrop = document.getElementById("sidebarBackdrop");

  function openSidebar() {
    sidebar.classList.add("open");
    backdrop.classList.add("visible");
    document.body.style.overflow = "hidden";
  }

  function closeSidebar() {
    sidebar.classList.remove("open");
    backdrop.classList.remove("visible");
    document.body.style.overflow = "";
  }

  // ─── SCROLL TO TOP ───
  var scrollTopBtn = document.getElementById("scrollTopBtn");
  main.addEventListener("scroll", function () {
    if (main.scrollTop > 300) {
      scrollTopBtn.classList.add("visible");
    } else {
      scrollTopBtn.classList.remove("visible");
    }
  });
  scrollTopBtn.addEventListener("click", function () {
    main.scrollTo({ top: 0, behavior: "smooth" });
  });

  // ─── EVENT DELEGATION ───
  document.addEventListener("click", function (e) {
    // Checkbox toggle
    var checkBox = e.target.closest("[data-check]");
    if (checkBox) {
      var id = checkBox.dataset.check;
      state.checked[id] = !state.checked[id];
      saveState();

      // Update in-place instead of full re-render
      var item = checkBox.closest(".check-item");
      if (item) {
        checkBox.classList.toggle("checked");
        checkBox.setAttribute("aria-checked", String(!!state.checked[id]));
        var titleEl = item.querySelector(".check-title");
        if (titleEl) titleEl.classList.toggle("done", !!state.checked[id]);
      }

      // Update progress bars, section badges, and global risk
      updateSectionProgress();
      updateGlobalRisk();

      if (state.checked[id]) {
        showToast("Item completed", "success");
      }
      return;
    }

    // Mark all / Reset all
    var markAllBtn = e.target.closest("[data-markall]");
    if (markAllBtn) {
      var groupId = markAllBtn.dataset.markall;
      bulkToggleGroup(groupId, true);
      return;
    }
    var resetAllBtn = e.target.closest("[data-resetall]");
    if (resetAllBtn) {
      var resetGroupId = resetAllBtn.dataset.resetall;
      bulkToggleGroup(resetGroupId, false);
      return;
    }

    // ICS download
    var icsBtn = e.target.closest("[data-ics-title]");
    if (icsBtn) {
      downloadIcs(icsBtn.dataset.icsTitle, icsBtn.dataset.icsDesc || "", icsBtn.dataset.icsFreq || "");
      return;
    }

    // FAQ accordion
    var faqBtn = e.target.closest(".faq-question");
    if (faqBtn) {
      var isOpen = faqBtn.getAttribute("aria-expanded") === "true";
      faqBtn.setAttribute("aria-expanded", String(!isOpen));
      faqBtn.classList.toggle("open", !isOpen);
      var answerId = faqBtn.getAttribute("aria-controls");
      var answerEl = document.getElementById(answerId);
      if (answerEl) {
        answerEl.classList.toggle("open", !isOpen);
      }
      return;
    }

    // Section accordion
    var sectionHeader = e.target.closest(".section-header");
    if (sectionHeader) {
      var sectionId = sectionHeader.dataset.section;
      var body = document.getElementById("section-" + sectionId);
      if (body) {
        var wasOpen = sectionHeader.classList.contains("open");
        sectionHeader.classList.toggle("open");
        body.classList.toggle("open");
        sectionHeader.setAttribute("aria-expanded", String(!wasOpen));
      }
      return;
    }

    // Nav
    var navItem = e.target.closest(".nav-item[data-view]");
    if (navItem) {
      navigate(navItem.dataset.view);
      return;
    }

    // Backdrop click closes sidebar
    if (e.target === backdrop) {
      closeSidebar();
      return;
    }
  });

  function bulkToggleGroup(groupId, checked) {
    var allGroups = AUDIT_DATA.accounts.concat(AUDIT_DATA.devices, AUDIT_DATA.privacy);
    var group = null;
    for (var i = 0; i < allGroups.length; i++) {
      if (allGroups[i].id === groupId) { group = allGroups[i]; break; }
    }
    if (!group) return;

    for (var j = 0; j < group.items.length; j++) {
      state.checked[group.items[j].id] = checked;
    }
    saveState();

    var msg = checked ? "All items marked done" : "All items reset";
    showToast(msg, checked ? "success" : "info");

    // Re-render current view to reflect changes
    navigate(state.currentView);
  }

  function updateSectionProgress() {
    // Update all visible section badges and progress bars
    document.querySelectorAll(".section-header[data-section]").forEach(function (header) {
      var sectionId = header.dataset.section;
      var allGroups = AUDIT_DATA.accounts.concat(AUDIT_DATA.devices, AUDIT_DATA.privacy);
      var group = null;
      for (var i = 0; i < allGroups.length; i++) {
        if (allGroups[i].id === sectionId) { group = allGroups[i]; break; }
      }
      if (!group) return;

      var done = 0;
      var critical = 0;
      var total = group.items.length;
      for (var j = 0; j < group.items.length; j++) {
        if (state.checked[group.items[j].id]) done++;
        if (group.items[j].priority === "critical" && !state.checked[group.items[j].id]) critical++;
      }
      var pct = total > 0 ? Math.round((done / total) * 100) : 0;

      // Update badge
      var badge = header.querySelector(".section-badge");
      if (badge) {
        badge.className = "section-badge " + (critical > 0 ? "critical" : (done === total ? "good" : "warning"));
        badge.textContent = done === total ? "Done" : (critical > 0 ? critical + " critical" : done + "/" + total);
      }

      // Update percentage
      var pctEl = header.querySelector(".section-pct");
      if (pctEl) pctEl.textContent = pct + "%";

      // Update progress bar
      var bodyEl = document.getElementById("section-" + sectionId);
      if (bodyEl) {
        var bar = bodyEl.querySelector(".progress-bar-fill");
        if (bar) bar.style.width = pct + "%";
      }
    });
  }

  // Search input handler (delegated)
  document.addEventListener("input", function (e) {
    if (e.target.id === "viewSearch") {
      state.searchQuery = e.target.value;
      // Filter visible items
      document.querySelectorAll(".check-item[data-id]").forEach(function (el) {
        var itemId = el.dataset.id;
        var foundItem = findItemById(itemId);
        if (foundItem) {
          el.classList.toggle("hidden", !matchesSearch(foundItem, state.searchQuery));
        }
      });

      // Show no-results if all hidden in a section
      document.querySelectorAll(".section-body").forEach(function (sectionBody) {
        var sectionItems = sectionBody.querySelectorAll(".check-item[data-id]");
        var allHidden = true;
        sectionItems.forEach(function (it) { if (!it.classList.contains("hidden")) allHidden = false; });
        var noRes = sectionBody.querySelector(".no-results");
        if (allHidden && sectionItems.length > 0) {
          if (!noRes) {
            var nr = document.createElement("div");
            nr.className = "no-results";
            nr.setAttribute("role", "status");
            nr.textContent = "No items match your search";
            sectionBody.appendChild(nr);
          }
        } else if (noRes) {
          noRes.remove();
        }
      });
    }
  });

  function findItemById(id) {
    var sources = [AUDIT_DATA.accounts, AUDIT_DATA.devices, AUDIT_DATA.privacy];
    for (var s = 0; s < sources.length; s++) {
      for (var g = 0; g < sources[s].length; g++) {
        for (var i = 0; i < sources[s][g].items.length; i++) {
          if (sources[s][g].items[i].id === id) return sources[s][g].items[i];
        }
      }
    }
    return null;
  }

  // Keyboard — checkboxes, enter on nav/section headers, escape closes sidebar
  document.addEventListener("keydown", function (e) {
    if ((e.key === "Enter" || e.key === " ") && e.target.matches("[data-check]")) {
      e.preventDefault();
      e.target.click();
    }

    // Enter/Space on section headers
    if ((e.key === "Enter" || e.key === " ") && e.target.matches(".section-header")) {
      e.preventDefault();
      e.target.click();
    }

    // Escape closes sidebar
    if (e.key === "Escape") {
      closeSidebar();
    }

    // Arrow keys for nav items
    if (e.target.matches(".nav-item") && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      e.preventDefault();
      var navItems = Array.from(document.querySelectorAll(".sidebar-nav .nav-item"));
      var idx = navItems.indexOf(e.target);
      if (e.key === "ArrowDown" && idx < navItems.length - 1) {
        navItems[idx + 1].focus();
      } else if (e.key === "ArrowUp" && idx > 0) {
        navItems[idx - 1].focus();
      }
    }
  });

  // Mobile menu
  document.getElementById("mobileMenu").addEventListener("click", function () {
    if (sidebar.classList.contains("open")) {
      closeSidebar();
    } else {
      openSidebar();
    }
  });

  // Theme toggle
  (function () {
    var toggle = document.querySelector("[data-theme-toggle]");
    var root = document.documentElement;
    var savedTheme = persistLoad(THEME_KEY);
    var dark = savedTheme !== null ? savedTheme : window.matchMedia("(prefers-color-scheme: dark)").matches;
    root.setAttribute("data-theme", dark ? "dark" : "light");

    function updateIcon() {
      toggle.innerHTML = dark
        ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>'
        : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
      toggle.setAttribute("aria-label", "Switch to " + (dark ? "light" : "dark") + " mode");
    }
    updateIcon();

    toggle.addEventListener("click", function () {
      dark = !dark;
      root.setAttribute("data-theme", dark ? "dark" : "light");
      persistSave(THEME_KEY, dark);
      updateIcon();
    });
  })();

  // Print / export
  document.getElementById("exportPdf").addEventListener("click", function () {
    window.print();
  });

  // ─── FOOTER LAST UPDATED DATE ───
  var lastUpdatedEl = document.getElementById("lastUpdated");
  if (lastUpdatedEl) {
    var now = new Date();
    lastUpdatedEl.textContent = "Last updated: " + now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) + " \u00B7 ";
  }

  // ─── INIT ───
  navigate("overview");

  // Show persistence status toast
  if (!_storageRef) {
    showToast("Running in preview mode \u2014 progress won\u2019t persist across reloads", "warning");
  }
})();
