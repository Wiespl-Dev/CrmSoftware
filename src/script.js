/**
 * MedOT Pro — script.js
 * Full CRM logic: data, navigation, rendering, modals, search, export
 * Architecture: Single namespace `app` object + module pattern
 */

'use strict';

/* ═══════════════════════════════════════════════════════════════
   DATA LAYER
═══════════════════════════════════════════════════════════════ */
const DATA = {
  enquiries: [
    {
      id:'ENQ-2401', hospital:'Apollo Hospitals', city:'New Delhi',
      contact:'Dr. Ramesh Khanna', source:'Doctor',
      otType:'Modular OT', otCount:2, drawings:'yes',
      stage:'quotation', value:4850000, date:'2025-03-10',
      engineer:'Ajay Nair',
      boq:{ equip:2850000, civil:650000, electrical:550000, install:450000, amc:200000, transport:150000, contingency:100000 },
      approvals:{ tech:true, comm:false, mgmt:false },
      notes:'Site visit done 8 Mar. Laminar flow ceiling specs confirmed by client. Pending BOQ revision for AHU brand.'
    },
    {
      id:'ENQ-2402', hospital:'Fortis Healthcare', city:'Mumbai',
      contact:'Ar. Priya Sharma', source:'Architect',
      otType:'Laminar Flow OT', otCount:1, drawings:'no',
      stage:'awaiting', value:0, date:'2025-03-15',
      engineer:'Neha Gupta',
      boq:null, approvals:{ tech:false, comm:false, mgmt:false },
      notes:'Architect promised drawings within 2 weeks. Call scheduled 25 Mar.'
    },
    {
      id:'ENQ-2403', hospital:'Manipal Hospitals', city:'Bengaluru',
      contact:'Dr. Suresh Patel', source:'Doctor',
      otType:'OT Complex', otCount:3, drawings:'yes',
      stage:'approvals', value:9200000, date:'2025-03-05',
      engineer:'Ravi Menon',
      boq:{ equip:6200000, civil:1200000, electrical:800000, install:600000, amc:250000, transport:100000, contingency:50000 },
      approvals:{ tech:true, comm:false, mgmt:false },
      notes:'Rajan Mehta approved technical on 12 Mar. Sunita Iyer review pending.'
    },
    {
      id:'ENQ-2404', hospital:'Kokilaben Dhirubhai Ambani', city:'Mumbai',
      contact:'Dr. Anjali Mehta', source:'Doctor',
      otType:'Modular OT', otCount:2, drawings:'yes',
      stage:'won', value:5600000, date:'2025-02-28',
      engineer:'Priya Das',
      boq:{ equip:3200000, civil:800000, electrical:600000, install:500000, amc:300000, transport:150000, contingency:50000 },
      approvals:{ tech:true, comm:true, mgmt:true },
      notes:'PO received 5 Apr. Project kickoff meeting scheduled 12 Apr with hospital admin.'
    },
    {
      id:'ENQ-2405', hospital:'AIIMS Nagpur', city:'Nagpur',
      contact:'Admin Dept – Mr. Rathi', source:'Hospital Admin',
      otType:'ICU Setup', otCount:1, drawings:'no',
      stage:'enquiry', value:0, date:'2025-03-18',
      engineer:'Ajay Nair',
      boq:null, approvals:{ tech:false, comm:false, mgmt:false },
      notes:'Initial enquiry via phone. Budget not finalised. Govt tender likely. Follow-up set 22 Mar.'
    },
    {
      id:'ENQ-2406', hospital:'Wockhardt Hospital', city:'Nagpur',
      contact:'Dr. Deepak Joshi', source:'Referral',
      otType:'Cath Lab', otCount:1, drawings:'yes',
      stage:'sent', value:3200000, date:'2025-03-20',
      engineer:'Ravi Menon',
      boq:{ equip:2000000, civil:400000, electrical:350000, install:250000, amc:100000, transport:75000, contingency:25000 },
      approvals:{ tech:true, comm:true, mgmt:true },
      notes:'Quotation sent 22 Mar via email + formal letter. Client reviewing. Follow-up call 1 Apr.'
    },
    {
      id:'ENQ-2407', hospital:'Yashoda Hospitals', city:'Hyderabad',
      contact:'Ar. Meena Nair', source:'Architect',
      otType:'Modular OT', otCount:4, drawings:'yes',
      stage:'follow-up', value:7800000, date:'2025-02-15',
      engineer:'Neha Gupta',
      boq:{ equip:4800000, civil:1400000, electrical:900000, install:400000, amc:200000, transport:100000, contingency:0 },
      approvals:{ tech:false, comm:false, mgmt:false },
      notes:'Client requested 8% price reduction. Revising BOQ with alternative equipment brands. Deadline 10 Apr.'
    },
    {
      id:'ENQ-2408', hospital:'Aster Medcity', city:'Kochi',
      contact:'Dr. Thomas Varghese', source:'Doctor',
      otType:'OT Complex', otCount:5, drawings:'yes',
      stage:'quotation', value:14500000, date:'2025-04-01',
      engineer:'Sameer Joshi',
      boq:{ equip:9500000, civil:2200000, electrical:1200000, install:900000, amc:400000, transport:200000, contingency:100000 },
      approvals:{ tech:false, comm:false, mgmt:false },
      notes:'Largest project this quarter. Preliminary BOQ shared. Engineer site visit 5 Apr.'
    },
  ],

  stageConfig: {
    enquiry:    { label:'Enquiry Phase',        color:'#14B8A6', chipClass:'chip-teal',   funnelColor:'#134E4A' },
    awaiting:   { label:'Awaiting Drawings',    color:'#F59E0B', chipClass:'chip-amber',  funnelColor:'#78350F' },
    quotation:  { label:'Quotation Prep',       color:'#8B5CF6', chipClass:'chip-purple', funnelColor:'#4C1D95' },
    approvals:  { label:'Approvals',            color:'#3B82F6', chipClass:'chip-blue',   funnelColor:'#1E3A8A' },
    sent:       { label:'Sent to Client',       color:'#6B7280', chipClass:'chip-gray',   funnelColor:'#374151' },
    won:        { label:'Order Won',            color:'#10B981', chipClass:'chip-em',     funnelColor:'#065F46' },
    'follow-up':{ label:'Follow-up / Revise',   color:'#EF4444', chipClass:'chip-red',    funnelColor:'#7F1D1D' },
  },

  engineers: ['Ajay Nair','Neha Gupta','Ravi Menon','Priya Das','Sameer Joshi'],
  approverNames: { tech:'Rajan Mehta', comm:'Sunita Iyer', mgmt:'Vikram Shah' },
};

/* ═══════════════════════════════════════════════════════════════
   UTILS
═══════════════════════════════════════════════════════════════ */
const Utils = {
  formatINR(n) {
    if (!n || n === 0) return '₹0';
    const v = Number(n);
    if (v >= 10000000) return `₹${(v/10000000).toFixed(2)}Cr`;
    if (v >= 100000)   return `₹${(v/100000).toFixed(2)}L`;
    return '₹' + v.toLocaleString('en-IN');
  },
  formatINRFull(n) {
    if (!n) return '₹0';
    return '₹' + Number(n).toLocaleString('en-IN');
  },
  formatDate(d) {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' });
  },
  boqTotal(boq) {
    if (!boq) return 0;
    return Object.values(boq).reduce((a, b) => a + (Number(b) || 0), 0);
  },
  stageLabel(s) { return DATA.stageConfig[s]?.label || s; },
  stageChip(s, text) {
    const cfg = DATA.stageConfig[s] || {};
    const t   = text || cfg.label || s;
    return `<span class="chip ${cfg.chipClass || 'chip-gray'}">${t}</span>`;
  },
  drawingChip(d) {
    return d === 'yes'
      ? `<span class="chip chip-em">✓ Received</span>`
      : `<span class="chip chip-amber">⏳ Awaiting</span>`;
  },
  genId() {
    return 'ENQ-' + new Date().getFullYear() + String(DATA.enquiries.length + 201).slice(-3);
  },
  today() { return new Date().toISOString().slice(0, 10); },
};

/* ═══════════════════════════════════════════════════════════════
   TOAST SYSTEM
═══════════════════════════════════════════════════════════════ */
const Toast = {
  colors: { success:'#10B981', error:'#EF4444', info:'#3B82F6', warn:'#F59E0B' },
  icons:  { success:'fa-circle-check', error:'fa-circle-xmark', info:'fa-circle-info', warn:'fa-triangle-exclamation' },

  show(title, msg = '', type = 'success') {
    const container = document.getElementById('toastContainer');
    const el = document.createElement('div');
    el.className = 'toast';
    el.style.setProperty('--toast-col', this.colors[type] || this.colors.success);
    el.innerHTML = `
      <span class="toast-icon"><i class="fas ${this.icons[type] || this.icons.success}" style="color:${this.colors[type]}"></i></span>
      <div class="toast-body">
        <div class="toast-title">${title}</div>
        ${msg ? `<div class="toast-msg">${msg}</div>` : ''}
      </div>`;
    container.appendChild(el);
    setTimeout(() => {
      el.classList.add('out');
      setTimeout(() => el.remove(), 300);
    }, 3500);
  }
};

/* ═══════════════════════════════════════════════════════════════
   RENDER ENGINE
═══════════════════════════════════════════════════════════════ */
const Render = {

  /* ── DASHBOARD ─────────────────────────────────────────────── */
  dashboard() {
    const enq = DATA.enquiries;
    const won = enq.filter(e => e.stage === 'won');
    const active = enq.filter(e => !['won','follow-up'].includes(e.stage));
    const pipeline = enq.filter(e => !['won'].includes(e.stage)).reduce((s,e) => s+e.value,0);
    const wonVal   = won.reduce((s,e) => s+e.value, 0);
    const pending  = enq.filter(e => e.stage === 'approvals').length;

    // KPIs
    document.getElementById('kpiGrid').innerHTML = [
      { icon:'fa-inbox',          label:'Total Enquiries',   val: enq.length,          sub:`${active.length} active in pipeline`,  color:'#14B8A6', trend:'+2 this week', up:true },
      { icon:'fa-coins',          label:'Pipeline Value',    val: Utils.formatINR(pipeline), sub:'Across all active stages',        color:'#8B5CF6', trend:'₹'+Utils.formatINR(wonVal)+' won', up:true },
      { icon:'fa-trophy',         label:'Orders Won',        val: won.length,           sub:Utils.formatINR(wonVal)+' revenue',   color:'#10B981', trend:`${Math.round(won.length/enq.length*100)}% win rate`, up:true },
      { icon:'fa-hourglass-half', label:'Pending Approvals', val: pending,              sub:'Awaiting internal sign-off',          color:'#F59E0B', trend: pending > 0 ? 'Needs attention' : 'All clear', up: pending === 0 },
    ].map(k => `
      <div class="kpi-card" style="--kpi-color:${k.color}">
        <div class="kpi-icon"><i class="fas ${k.icon}"></i></div>
        <div class="kpi-label">${k.label}</div>
        <div class="kpi-value">${k.val}</div>
        <div class="kpi-sub">${k.sub}</div>
        <div class="kpi-trend ${k.up?'up':'down'}">
          <i class="fas fa-arrow-${k.up?'up-right':'down-right'}"></i> ${k.trend}
        </div>
      </div>`).join('');

    // Funnel
    const stages = ['enquiry','awaiting','quotation','approvals','sent','won'];
    const maxCount = Math.max(...stages.map(s => enq.filter(e => e.stage===s).length), 1);
    document.getElementById('funnelWrap').innerHTML = stages.map(s => {
      const cfg = DATA.stageConfig[s];
      const count = enq.filter(e => e.stage === s).length;
      const pct   = Math.max(8, Math.round((count / maxCount) * 100));
      return `
        <div class="funnel-row" onclick="app.nav('enquiries','${s}')" title="Filter by ${cfg.label}">
          <div class="funnel-lbl">${cfg.label}</div>
          <div class="funnel-bar">
            <div class="funnel-bar-fill" style="width:${pct}%; --funnel-color:${cfg.funnelColor}">
              <span>${count}</span>
            </div>
          </div>
          <div class="funnel-count">${count}</div>
        </div>`;
    }).join('');

    // Stage list
    document.getElementById('stageList').innerHTML = stages.map(s => {
      const cfg = DATA.stageConfig[s];
      const cnt = enq.filter(e => e.stage === s);
      const val = cnt.reduce((t,e) => t+e.value, 0);
      return `
        <div class="stage-row" onclick="app.nav('enquiries','${s}')">
          <div class="stage-dot" style="background:${cfg.color}"></div>
          <div class="stage-name">${cfg.label}</div>
          <div>
            <div class="stage-count">${cnt.length}</div>
            <div class="stage-val">${Utils.formatINR(val)}</div>
          </div>
        </div>`;
    }).join('');

    // Recent table
    this._fillTable(document.querySelector('#dashTable tbody'),
      enq.slice(0, 7),
      e => `<tr>
        <td class="enq-id">${e.id}</td>
        <td><span class="hospital-cell">${e.hospital}</span><span class="city-small">${e.city}</span></td>
        <td>${e.source}</td>
        <td class="mono">${Utils.formatINR(e.value)}</td>
        <td>${Utils.stageChip(e.stage)}</td>
        <td>${e.engineer}</td>
        <td><button class="btn btn-outline btn-sm" onclick="app.openDetail('${e.id}')">
          <i class="fas fa-arrow-up-right-from-square"></i> Open</button></td>
      </tr>`
    );

    // Sidebar stats
    document.querySelector('#ss-active .ss-val').textContent = active.length;
    document.querySelector('#ss-won .ss-val').textContent = won.length;
    document.querySelector('#ss-pipeline .ss-val').textContent = Utils.formatINR(pipeline);

    // Nav badges
    document.getElementById('nb-enquiries').textContent =
      enq.filter(e => ['enquiry','awaiting'].includes(e.stage)).length;
    document.getElementById('nb-approvals').textContent =
      enq.filter(e => e.stage === 'approvals').length;

    // Notif dot
    const notifDot = document.getElementById('notifDot');
    if (pending > 0) notifDot.classList.add('visible');
    else notifDot.classList.remove('visible');
  },

  /* ── ENQUIRIES ──────────────────────────────────────────────── */
  enquiries(filterStage = null) {
    let data = [...DATA.enquiries];

    // Sort
    const sort = document.getElementById('enqSortSelect')?.value || 'date-desc';
    if (sort === 'date-desc')   data.sort((a,b) => b.date.localeCompare(a.date));
    if (sort === 'date-asc')    data.sort((a,b) => a.date.localeCompare(b.date));
    if (sort === 'value-desc')  data.sort((a,b) => b.value - a.value);
    if (sort === 'stage')       data.sort((a,b) => a.stage.localeCompare(b.stage));

    if (filterStage) data = data.filter(e => e.stage === filterStage);

    // Filter pills
    const allStages = ['enquiry','awaiting','quotation','approvals','sent','won','follow-up'];
    document.getElementById('enqFilterPills').innerHTML =
      ['all', ...allStages].map(s => {
        const isAll    = s === 'all';
        const active   = filterStage === (isAll ? null : s) || (isAll && !filterStage) ? 'active' : '';
        const label    = isAll ? 'All' : DATA.stageConfig[s]?.label || s;
        const count    = isAll ? DATA.enquiries.length : DATA.enquiries.filter(e=>e.stage===s).length;
        return `<span class="filter-pill ${active}" onclick="app.nav('enquiries',${isAll?'null':`'${s}'`})">${label} <small style="opacity:.6">${count}</small></span>`;
      }).join('');

    this._fillTable(document.querySelector('#enqTable tbody'), data, e => `<tr>
      <td class="enq-id">${e.id}</td>
      <td><span class="hospital-cell">${e.hospital}</span><span class="city-small">${e.city}</span></td>
      <td>${e.contact}<span class="city-small">${e.source}</span></td>
      <td>${e.otType} <span class="city-small">${e.otCount} OT${e.otCount>1?'s':''}</span></td>
      <td>${Utils.drawingChip(e.drawings)}</td>
      <td>${Utils.stageChip(e.stage)}</td>
      <td class="mono val-strong">${Utils.formatINR(e.value)}</td>
      <td>${e.engineer}</td>
      <td class="mono" style="color:var(--tx-muted)">${Utils.formatDate(e.date)}</td>
      <td><button class="btn btn-primary btn-sm" onclick="app.openDetail('${e.id}')">
        <i class="fas fa-pen-to-square"></i> Edit</button></td>
    </tr>`);
  },

  /* ── QUOTATIONS ──────────────────────────────────────────────── */
  quotations() {
    const data = DATA.enquiries.filter(e => ['quotation','approvals','sent','won'].includes(e.stage));
    this._fillTable(document.querySelector('#quotTable tbody'), data, e => {
      const b = e.boq || {};
      const eq = b.equip || 0;
      const cv = (b.civil||0) + (b.electrical||0);
      const misc = (b.amc||0) + (b.transport||0) + (b.contingency||0) + (b.install||0);
      return `<tr>
        <td class="enq-id">${e.id}</td>
        <td><span class="hospital-cell">${e.hospital}</span></td>
        <td>${e.otType}</td>
        <td class="mono">${Utils.formatINR(eq)}</td>
        <td class="mono">${Utils.formatINR(cv)}</td>
        <td class="mono">${Utils.formatINR(misc)}</td>
        <td class="mono val-strong">${Utils.formatINR(e.value)}</td>
        <td>${Utils.stageChip(e.stage)}</td>
        <td>${e.engineer}</td>
        <td><button class="btn btn-primary btn-sm" onclick="app.openDetail('${e.id}')">
          <i class="fas fa-calculator"></i> BOQ</button></td>
      </tr>`;
    });
  },

  /* ── APPROVALS ───────────────────────────────────────────────── */
  approvals() {
    const allAppr = DATA.enquiries.filter(e => e.stage === 'approvals');
    const counts  = { tech:0, comm:0, mgmt:0 };
    allAppr.forEach(e => {
      if (e.approvals?.tech) counts.tech++;
      if (e.approvals?.comm) counts.comm++;
      if (e.approvals?.mgmt) counts.mgmt++;
    });
    const n = allAppr.length || 1;

    document.getElementById('approvalCardsRow').innerHTML = [
      { key:'tech', emoji:'🔧', title:'Technical', color:'#3B82F6', ac:'--bl-500' },
      { key:'comm', emoji:'💰', title:'Commercial', color:'#F59E0B', ac:'--am-400' },
      { key:'mgmt', emoji:'👑', title:'Management', color:'#10B981', ac:'--em-500' },
    ].map(a => `
      <div class="appr-card" style="--ac:${a.color}">
        <div class="ac-icon">${a.emoji}</div>
        <div class="ac-title">${a.title} Approval</div>
        <div class="ac-person">${DATA.approverNames[a.key]}</div>
        <div class="ac-stat">${counts[a.key]} / ${allAppr.length}</div>
        <div class="ac-sub">Approved of pending queue</div>
      </div>`).join('');

    this._fillTable(document.querySelector('#approvalTable tbody'), allAppr, e => {
      const a = e.approvals || {};
      const done = [a.tech, a.comm, a.mgmt].filter(Boolean).length;
      return `<tr>
        <td class="enq-id">${e.id}</td>
        <td><span class="hospital-cell">${e.hospital}</span></td>
        <td class="mono val-strong">${Utils.formatINR(e.value)}</td>
        <td>${a.tech ? `<span class="chip chip-em">✓ Approved</span>` : `<span class="chip chip-gray">⏳ Pending</span>`}</td>
        <td>${a.comm ? `<span class="chip chip-em">✓ Approved</span>` : `<span class="chip chip-gray">⏳ Pending</span>`}</td>
        <td>${a.mgmt ? `<span class="chip chip-em">✓ Approved</span>` : `<span class="chip chip-gray">⏳ Pending</span>`}</td>
        <td><div class="appr-progress">
          <div class="appr-pip ${a.tech?'done':''}"></div>
          <div class="appr-pip ${a.comm?'done':''}"></div>
          <div class="appr-pip ${a.mgmt?'done':''}"></div>
        </div></td>
        <td><button class="btn btn-primary btn-sm" onclick="app.openDetail('${e.id}','approvals')">
          <i class="fas fa-shield-check"></i> Review</button></td>
      </tr>`;
    });
  },

  /* ── ORDERS ──────────────────────────────────────────────────── */
  orders() {
    const won = DATA.enquiries.filter(e => e.stage === 'won');
    const totVal = won.reduce((s,e) => s+e.value, 0);
    const convRate = DATA.enquiries.length ? Math.round(won.length / DATA.enquiries.length * 100) : 0;
    const avgOrder = won.length ? Math.round(totVal / won.length) : 0;

    document.getElementById('ordersKpi').innerHTML = [
      { icon:'fa-trophy',       label:'Orders Won',     val: won.length,             sub:'Closed projects',           color:'#10B981' },
      { icon:'fa-rupee-sign',   label:'Total Revenue',  val: Utils.formatINR(totVal), sub:'Sum of won orders',        color:'#8B5CF6' },
      { icon:'fa-chart-pie',    label:'Win Rate',       val: convRate + '%',          sub:'Of all enquiries',         color:'#3B82F6' },
      { icon:'fa-scale-balanced','label':'Avg. Order',  val: Utils.formatINR(avgOrder),sub:'Per project',            color:'#F59E0B' },
    ].map(k => `
      <div class="kpi-card" style="--kpi-color:${k.color}">
        <div class="kpi-icon"><i class="fas ${k.icon}"></i></div>
        <div class="kpi-label">${k.label}</div>
        <div class="kpi-value">${k.val}</div>
        <div class="kpi-sub">${k.sub}</div>
      </div>`).join('');

    this._fillTable(document.querySelector('#ordersTable tbody'), won, e => `<tr>
      <td class="enq-id">${e.id}</td>
      <td><span class="hospital-cell">${e.hospital}</span><span class="city-small">${e.city}</span></td>
      <td>${e.otType}</td>
      <td class="mono">${e.otCount}</td>
      <td class="mono val-strong">${Utils.formatINRFull(e.value)}</td>
      <td>${e.engineer}</td>
      <td class="mono" style="color:var(--em-400)">${Utils.formatDate(e.date)}</td>
    </tr>`);
  },

  /* ── FOLLOW-UP ───────────────────────────────────────────────── */
  followup() {
    const data = DATA.enquiries.filter(e => e.stage === 'follow-up');
    this._fillTable(document.querySelector('#followupTable tbody'), data, e => `<tr>
      <td class="enq-id">${e.id}</td>
      <td><span class="hospital-cell">${e.hospital}</span><span class="city-small">${e.city}</span></td>
      <td class="mono val-strong">${Utils.formatINR(e.value)}</td>
      <td class="mono" style="color:var(--tx-muted)">${Utils.formatDate(e.date)}</td>
      <td style="max-width:280px;color:var(--tx-muted);font-size:12px">${e.notes || '—'}</td>
      <td><button class="btn btn-outline btn-sm" onclick="app.openDetail('${e.id}')">
        <i class="fas fa-rotate"></i> Revise</button></td>
    </tr>`);
  },

  /* ── REGISTER ────────────────────────────────────────────────── */
  register(query = '') {
    let data = [...DATA.enquiries];
    if (query) {
      const q = query.toLowerCase();
      data = data.filter(e =>
        e.hospital.toLowerCase().includes(q) ||
        e.id.toLowerCase().includes(q) ||
        e.contact.toLowerCase().includes(q) ||
        e.city.toLowerCase().includes(q) ||
        e.otType.toLowerCase().includes(q)
      );
    }
    this._fillTable(document.querySelector('#registerTable tbody'), data, (e, i) => `<tr>
      <td style="color:var(--tx-muted);font-family:var(--ff-mono)">${i + 1}</td>
      <td class="enq-id">${e.id}</td>
      <td class="mono" style="color:var(--tx-muted)">${Utils.formatDate(e.date)}</td>
      <td><span class="hospital-cell">${e.hospital}</span></td>
      <td>${e.city}</td>
      <td>${e.contact}</td>
      <td>${e.source}</td>
      <td>${e.otType}</td>
      <td class="mono">${e.otCount}</td>
      <td>${Utils.stageChip(e.stage)}</td>
      <td class="mono val-strong">${Utils.formatINR(e.value)}</td>
      <td>${e.engineer}</td>
    </tr>`);
  },

  /* ── FLOW MAP ─────────────────────────────────────────────────── */
  flowmap() {
    const w = document.getElementById('flowmapWrap');
    w.innerHTML = `
      <div class="fm-phase-label">ENQUIRY PHASE</div>

      <div class="fm-node phase-enquiry">
        <h4>📩 Enquiry Received</h4>
        <p>Doctor · Hospital · Architect · Referral</p>
      </div>
      <div class="fm-arrow">↓</div>
      <div class="fm-node phase-enquiry">
        <h4>📋 Log in Sales Register</h4>
        <p>Enquiry No. · Hospital · OT Type · Source</p>
      </div>
      <div class="fm-arrow">↓</div>

      <!-- Decision: Drawing? -->
      <div style="display:flex;align-items:center;gap:24px;width:100%;max-width:520px;justify-content:center">
        <div class="fm-node phase-decision" style="text-align:center">
          <h4>📐 Drawing Received?</h4>
        </div>
        <div style="display:flex;flex-direction:column;align-items:center">
          <span style="font-size:11px;font-weight:700;color:var(--am-400);margin-bottom:4px">No →</span>
          <div class="fm-node phase-lost" style="min-width:140px">
            <h4>⏳ Await Drawings</h4>
            <p>On receipt, re-enter flow</p>
          </div>
        </div>
      </div>
      <div style="font-size:12px;color:var(--tx-muted);margin:4px 0">↓ Yes</div>

      <div class="fm-phase-label">QUOTATION PREPARATION</div>
      ${[
        ['🏥','Introduction','Customer · Hospital · OT scope','phase-quot'],
        ['📐','Basis of Design','OT dims · Ceiling · Flooring type','phase-quot'],
        ['🧮','Calculations','Heat load · CFM · Air changes','phase-quot'],
        ['⚙️','Equipment Selection','ODU · AHU · Plenum · Pendants','phase-quot'],
        ['🚛','Transportation','Packing · Logistics · Cost','phase-quot'],
        ['📊','Quotation Prepared','7-Annexure BOQ with summary','phase-quot'],
      ].map((n,i,arr) => `
        <div class="fm-node ${n[3]}">
          <h4>${n[0]} ${n[1]}</h4><p>${n[2]}</p>
        </div>
        ${i < arr.length-1 ? '<div class="fm-arrow">↓</div>' : ''}`).join('')}

      <div class="fm-phase-label">APPROVALS</div>
      <div class="fm-approval-row">
        ${[['🔧','Technical','Rajan Mehta'],['💰','Commercial','Sunita Iyer'],['👑','Management','Vikram Shah']]
          .map(a => `<div class="fm-node phase-approval"><h4>${a[0]} ${a[1]}</h4><p>${a[2]}</p></div>`).join('')}
      </div>
      <div class="fm-arrow">↓</div>

      <div class="fm-phase-label">OUTCOME</div>
      <div class="fm-node phase-outcome" style="max-width:380px">
        <h4>📤 Quotation Sent to Client</h4>
        <p>Email · Formal Letter · Follow-up call</p>
      </div>
      <div class="fm-arrow">↓</div>

      <div class="fm-branch">
        <div class="fm-branch-item">
          <div class="fm-branch-lbl won">Won ↓</div>
          <div class="fm-node phase-outcome" style="width:100%">
            <h4>🏆 Order Received</h4>
            <p>Proceed to project execution</p>
          </div>
        </div>
        <div class="fm-branch-item">
          <div class="fm-branch-lbl lost">Lost ↓</div>
          <div class="fm-node phase-lost" style="width:100%">
            <h4>🔄 Follow-up / Revise</h4>
            <p>Revise BOQ · Re-quote · Re-engage</p>
          </div>
        </div>
      </div>`;
  },

  /* ── HELPERS ──────────────────────────────────────────────────── */
  _fillTable(tbody, data, rowFn) {
    if (!tbody) return;
    if (!data.length) {
      tbody.innerHTML = `<tr><td colspan="20" style="text-align:center;padding:36px;color:var(--tx-muted);font-style:italic">No records found</td></tr>`;
      return;
    }
    tbody.innerHTML = data.map((e,i) => rowFn(e, i)).join('');
  },

  all() {
    this.dashboard();
    this.enquiries();
    this.quotations();
    this.approvals();
    this.orders();
    this.followup();
    this.register();
    this.flowmap();
  }
};

/* ═══════════════════════════════════════════════════════════════
   MODAL SYSTEM
═══════════════════════════════════════════════════════════════ */
const Modal = {
  current: null,
  tab:     'overview',
  tempApprovals: null,

  open(id, startTab = 'overview') {
    const e = DATA.enquiries.find(x => x.id === id);
    if (!e) return;
    this.current = id;
    this.tab     = startTab;
    this.tempApprovals = { ...e.approvals };

    // Header
    document.getElementById('mEnqId').textContent = e.id;
    document.getElementById('mHospital').textContent = e.hospital;
    document.getElementById('mSubline').textContent = `${e.otType} · ${e.city} · ${e.engineer}`;

    const cfg = DATA.stageConfig[e.stage] || {};
    const pill = document.getElementById('mStagePill');
    pill.textContent = cfg.label || e.stage;
    pill.className = `stage-pill chip ${cfg.chipClass || 'chip-gray'}`;

    // Reset tabs
    document.querySelectorAll('.mtab').forEach(t => {
      t.classList.toggle('active', t.dataset.tab === startTab);
    });

    this.renderTab(startTab);
    document.getElementById('detailBackdrop').classList.add('open');
    document.getElementById('mfSaved').textContent = '';
  },

  renderTab(tab) {
    this.tab = tab;
    const id = this.current;
    const e  = DATA.enquiries.find(x => x.id === id);
    if (!e) return;
    const boq  = e.boq  || { equip:0, civil:0, electrical:0, install:0, amc:0, transport:0, contingency:0 };
    const appr = this.tempApprovals || e.approvals || {};
    const body = document.getElementById('modalBody');

    switch(tab) {

      /* ── OVERVIEW ─── */
      case 'overview':
        body.innerHTML = `
          <div class="form-section">
            <div class="form-section-title"><i class="fas fa-hospital"></i> Project Info</div>
            <div class="form-row">
              <div class="form-field"><label>Hospital</label><input value="${e.hospital}" disabled></div>
              <div class="form-field"><label>City</label><input value="${e.city}" disabled></div>
              <div class="form-field"><label>Contact Person</label><input value="${e.contact}" disabled></div>
              <div class="form-field"><label>Source</label><input value="${e.source}" disabled></div>
              <div class="form-field"><label>OT Type</label><input value="${e.otType}" disabled></div>
              <div class="form-field"><label>No. of OTs</label><input value="${e.otCount}" disabled></div>
              <div class="form-field"><label>Engineer</label><input value="${e.engineer}" disabled></div>
              <div class="form-field"><label>Date Logged</label><input value="${Utils.formatDate(e.date)}" disabled></div>
            </div>
          </div>
          <div class="form-section">
            <div class="form-section-title"><i class="fas fa-sliders"></i> Update Workflow</div>
            <div class="form-row">
              <div class="form-field">
                <label>Current Stage</label>
                <select id="m_stage">
                  ${Object.entries(DATA.stageConfig).map(([v,c]) =>
                    `<option value="${v}" ${e.stage===v?'selected':''}>${c.label}</option>`).join('')}
                </select>
              </div>
              <div class="form-field">
                <label>Drawing Received?</label>
                <select id="m_drawings">
                  <option value="yes" ${e.drawings==='yes'?'selected':''}>✅ Yes – Received</option>
                  <option value="no"  ${e.drawings==='no' ?'selected':''}>⏳ No – Awaiting</option>
                </select>
              </div>
            </div>
          </div>`;
        break;

      /* ── BOQ ─── */
      case 'boq':
        const total = Utils.boqTotal(boq);
        body.innerHTML = `
          <div style="margin-bottom:14px">
            <div class="decision-box">
              <i class="fas fa-triangle-exclamation"></i>
              <span>Drawing Status:</span>
              <select id="m_drawings_boq">
                <option value="yes" ${e.drawings==='yes'?'selected':''}>✅ Drawings Received</option>
                <option value="no"  ${e.drawings==='no' ?'selected':''}>⏳ Awaiting Drawings</option>
              </select>
            </div>
          </div>
          <div class="boq-grid">
            ${[
              ['boq_equip',    'Annexure 1 — Equipment',      boq.equip],
              ['boq_civil',    'Annexure 2 — Civil / Infra',   boq.civil],
              ['boq_elec',     'Annexure 3 — Electrical',      boq.electrical],
              ['boq_install',  'Annexure 4 — Installation',    boq.install],
              ['boq_amc',      'Annexure 5 — AMC / Warranty',  boq.amc],
              ['boq_trans',    'Annexure 6 — Transport / Pack', boq.transport],
              ['boq_cont',     'Annexure 7 — Contingency',     boq.contingency],
            ].map(([id,lbl,val]) => `
              <div class="boq-row">
                <label>${lbl}</label>
                <input type="number" id="${id}" value="${val||0}" min="0" class="boq-inp"
                  placeholder="0" oninput="Modal.updateTotal()">
              </div>`).join('')}
          </div>
          <div class="boq-total-box">
            <div class="boq-total-label"><i class="fas fa-rupee-sign"></i> Total Quotation Value</div>
            <div class="boq-total-val" id="boqTotalDisplay">${Utils.formatINRFull(total)}</div>
          </div>`;
        break;

      /* ── APPROVALS ─── */
      case 'approvals':
        body.innerHTML = `
          <div class="appr-chain">
            ${['tech','comm','mgmt'].map(k => {
              const done = appr[k];
              return `
                <div class="appr-block ${done?'done':''}" id="ab_${k}">
                  <div class="appr-emoji">${k==='tech'?'🔧':k==='comm'?'💰':'👑'}</div>
                  <div class="appr-name">${k==='tech'?'Technical':k==='comm'?'Commercial':'Management'}</div>
                  <div class="appr-person">${DATA.approverNames[k]}</div>
                  <div class="appr-status ${done?'done':'pending'}">${done?'✓ Approved':'⏳ Pending'}</div>
                </div>`;
            }).join('')}
          </div>
          <div class="appr-actions">
            <button class="btn btn-outline btn-sm" onclick="Modal.toggleAppr('tech')"><i class="fas fa-check"></i> Approve Technical</button>
            <button class="btn btn-outline btn-sm" onclick="Modal.toggleAppr('comm')"><i class="fas fa-check"></i> Approve Commercial</button>
            <button class="btn btn-outline btn-sm" onclick="Modal.toggleAppr('mgmt')"><i class="fas fa-check"></i> Approve Management</button>
          </div>
          <div style="margin-top:18px;padding:14px;background:var(--bg-overlay);border-radius:var(--r-md);border:1px solid var(--border)">
            <div style="font-size:11px;font-weight:700;color:var(--tx-muted);margin-bottom:8px;text-transform:uppercase;letter-spacing:.07em">Auto-Advance Rule</div>
            <div style="font-size:12.5px;color:var(--tx-secondary)">Once all three approvals are granted and stage is <em style="color:var(--bl-400)">Approvals</em>, the stage will automatically advance to <em style="color:var(--em-400)">Sent to Client</em> on save.</div>
          </div>`;
        break;

      /* ── TIMELINE ─── */
      case 'timeline':
        const steps = [
          { icon:'📩', title:'Enquiry Received',   done:true,      desc:`From ${e.source} (${e.contact}) · Logged ${Utils.formatDate(e.date)}` },
          { icon:'📋', title:'Logged in Register', done:true,      desc:`Assigned to ${e.engineer}` },
          { icon:'📐', title:'Drawings',           done:e.drawings==='yes', desc: e.drawings==='yes'?'Drawings received and confirmed.':'⏳ Awaiting drawings from client.' },
          { icon:'📊', title:'Quotation Prepared', done:Utils.boqTotal(e.boq)>0, desc: Utils.boqTotal(e.boq)>0 ? `BOQ Total: ${Utils.formatINRFull(e.value)}`:'⏳ BOQ not yet prepared.' },
          { icon:'🔧', title:'Technical Approval', done:e.approvals?.tech, desc: e.approvals?.tech ? `✓ Approved by ${DATA.approverNames.tech}`:'⏳ Awaiting technical review.' },
          { icon:'💰', title:'Commercial Approval',done:e.approvals?.comm, desc: e.approvals?.comm ? `✓ Approved by ${DATA.approverNames.comm}`:'⏳ Awaiting commercial review.' },
          { icon:'👑', title:'Management Approval',done:e.approvals?.mgmt, desc: e.approvals?.mgmt ? `✓ Approved by ${DATA.approverNames.mgmt}`:'⏳ Awaiting management sign-off.' },
          { icon:'📤', title:'Sent to Client',     done:['sent','won'].includes(e.stage), desc: ['sent','won'].includes(e.stage)?'Quotation sent via email and formal letter.':'⏳ Not yet sent.' },
          { icon:'🏆', title:'Final Outcome',      done:e.stage==='won', desc: e.stage==='won'?'🎉 Order received! Project won.' : e.stage==='follow-up'?'🔄 Follow-up in progress. Revision pending.':'⏳ Awaiting client decision.' },
        ];
        body.innerHTML = `<div class="timeline-list">${steps.map(s => `
          <div class="tl-item">
            <div class="tl-dot ${s.done?'done':'pending'}">${s.icon}</div>
            <div class="tl-content">
              <div class="tl-title">${s.title}</div>
              <div class="tl-desc">${s.desc}</div>
            </div>
          </div>`).join('')}</div>`;
        break;

      /* ── NOTES ─── */
      case 'notes':
        body.innerHTML = `
          <div style="margin-bottom:10px;font-size:12px;color:var(--tx-muted)">
            <i class="fas fa-pen-nib" style="color:var(--em-500)"></i>
            Free-form notes, client conversations, key decisions…
          </div>
          <textarea class="notes-area" id="m_notes">${e.notes || ''}</textarea>`;
        break;
    }
  },

  updateTotal() {
    const ids = ['boq_equip','boq_civil','boq_elec','boq_install','boq_amc','boq_trans','boq_cont'];
    const total = ids.reduce((s,id) => s + (parseFloat(document.getElementById(id)?.value)||0), 0);
    const el = document.getElementById('boqTotalDisplay');
    if (el) el.textContent = Utils.formatINRFull(total);
  },

  toggleAppr(type) {
    this.tempApprovals[type] = true;
    const block = document.getElementById(`ab_${type}`);
    if (block) {
      block.classList.add('done');
      block.querySelector('.appr-status').textContent = '✓ Approved';
      block.querySelector('.appr-status').className = 'appr-status done';
    }
  },

  save() {
    const id  = this.current;
    const idx = DATA.enquiries.findIndex(x => x.id === id);
    if (idx === -1) return;
    const e = DATA.enquiries[idx];

    // Overview tab fields
    const stageEl    = document.getElementById('m_stage');
    const drawEl     = document.getElementById('m_drawings') || document.getElementById('m_drawings_boq');
    const notesEl    = document.getElementById('m_notes');

    if (stageEl)  e.stage    = stageEl.value;
    if (drawEl)   e.drawings = drawEl.value;
    if (notesEl)  e.notes    = notesEl.value;

    // BOQ
    const boqIds = ['boq_equip','boq_civil','boq_elec','boq_install','boq_amc','boq_trans','boq_cont'];
    const boqVals = boqIds.map(bid => parseFloat(document.getElementById(bid)?.value)||0);
    const total   = boqVals.reduce((a,b)=>a+b,0);
    if (total > 0) {
      e.value = total;
      e.boq = { equip:boqVals[0], civil:boqVals[1], electrical:boqVals[2], install:boqVals[3], amc:boqVals[4], transport:boqVals[5], contingency:boqVals[6] };
    }

    // Approvals
    if (this.tempApprovals) e.approvals = { ...this.tempApprovals };

    // Auto-advance
    if (e.drawings==='yes' && e.stage==='awaiting') e.stage = 'quotation';
    const a = e.approvals || {};
    if (a.tech && a.comm && a.mgmt && e.stage==='approvals') e.stage = 'sent';

    // Update stage pill
    const cfg  = DATA.stageConfig[e.stage] || {};
    const pill = document.getElementById('mStagePill');
    pill.textContent = cfg.label || e.stage;
    pill.className   = `stage-pill chip ${cfg.chipClass || 'chip-gray'}`;

    document.getElementById('mfSaved').textContent = '✓ Saved';
    setTimeout(() => { const el = document.getElementById('mfSaved'); if(el) el.textContent=''; }, 2500);

    Render.all();
    Toast.show('Enquiry Updated', `${e.id} → ${cfg.label || e.stage}`, 'success');
  },

  close() {
    document.getElementById('detailBackdrop').classList.remove('open');
    this.current = null;
    this.tempApprovals = null;
  }
};
window.Modal = Modal; // expose for inline onclick

/* ═══════════════════════════════════════════════════════════════
   APP CONTROLLER
═══════════════════════════════════════════════════════════════ */
const app = {

  currentPage:   'dashboard',
  pageConfig: {
    dashboard:  { title:'Dashboard',       crumb:'Overview · Live Pipeline' },
    enquiries:  { title:'Enquiries',       crumb:'Records · All Enquiries' },
    quotations: { title:'Quotations',      crumb:'Records · Prepared Quotations' },
    approvals:  { title:'Approvals',       crumb:'Workflow · Pending Approvals' },
    orders:     { title:'Orders Won',      crumb:'Results · Closed Deals' },
    followup:   { title:'Follow-up',       crumb:'Workflow · Revise & Re-engage' },
    register:   { title:'Sales Register',  crumb:'Records · Full Sales Log' },
    flowmap:    { title:'Workflow Flow Map',crumb:'Reference · OT Project Process' },
  },

  nav(page, filter = null) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const pageEl = document.getElementById(`page-${page}`);
    if (!pageEl) return;
    pageEl.classList.add('active');
    this.currentPage = page;

    // Nav item
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.querySelector(`.nav-item[data-page="${page}"]`)?.classList.add('active');

    // Heading
    const cfg = this.pageConfig[page] || {};
    document.getElementById('pageTitle').textContent = cfg.title || page;
    document.getElementById('pageCrumb').textContent = cfg.crumb || '';

    // Render
    const renders = {
      dashboard:  () => Render.dashboard(),
      enquiries:  () => Render.enquiries(filter),
      quotations: () => Render.quotations(),
      approvals:  () => Render.approvals(),
      orders:     () => Render.orders(),
      followup:   () => Render.followup(),
      register:   () => Render.register(),
      flowmap:    () => Render.flowmap(),
    };
    renders[page]?.();
  },

  openDetail(id, tab = 'overview') {
    Modal.open(id, tab);
  },

  saveEnquiry() {
    Modal.save();
  },

  closeModal() {
    Modal.close();
  },

  openNewModal() {
    document.getElementById('newEnqBackdrop').classList.add('open');
  },

  closeNewModal() {
    document.getElementById('newEnqBackdrop').classList.remove('open');
  },

  createEnquiry() {
    const hospital = document.getElementById('f_hospital').value.trim();
    const city     = document.getElementById('f_city').value.trim();
    const contact  = document.getElementById('f_contact').value.trim();
    if (!hospital || !city || !contact) {
      Toast.show('Missing Fields', 'Please fill in hospital, city and contact.', 'error');
      return;
    }
    const newId = Utils.genId();
    DATA.enquiries.unshift({
      id: newId, hospital, city, contact,
      source:   document.getElementById('f_source').value,
      otType:   document.getElementById('f_ottype').value,
      otCount:  parseInt(document.getElementById('f_otcount').value) || 1,
      engineer: document.getElementById('f_engineer').value,
      drawings: document.getElementById('f_drawings').value,
      stage: 'enquiry', value: 0, date: Utils.today(),
      boq: null, approvals: { tech:false, comm:false, mgmt:false },
      notes: document.getElementById('f_notes').value || '',
    });
    this.closeNewModal();
    // Reset form
    ['f_hospital','f_city','f_contact','f_notes'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
    Render.all();
    Toast.show('Enquiry Created', `${newId} added for ${hospital}`, 'success');
    this.nav('enquiries');
  },

  exportCSV(type = 'register') {
    const enq = DATA.enquiries;
    const data = type === 'won' ? enq.filter(e => e.stage === 'won') : enq;
    const headers = ['ID','Hospital','City','Contact','Source','OT Type','OT Count','Drawings','Stage','Value (INR)','Engineer','Date'];
    const rows = data.map(e => [
      e.id, e.hospital, e.city, e.contact, e.source, e.otType,
      e.otCount, e.drawings, DATA.stageConfig[e.stage]?.label || e.stage,
      e.value, e.engineer, e.date
    ]);
    const csv = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type:'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = Object.assign(document.createElement('a'), {
      href: url, download: `MedOT_${type}_${Utils.today()}.csv`
    });
    a.click(); URL.revokeObjectURL(url);
    Toast.show('CSV Exported', `${data.length} records downloaded`, 'info');
  },

  globalSearch(q) {
    if (!q) { this.nav(this.currentPage); return; }
    const query = q.toLowerCase();
    const results = DATA.enquiries.filter(e =>
      e.hospital.toLowerCase().includes(query) ||
      e.id.toLowerCase().includes(query) ||
      e.contact.toLowerCase().includes(query) ||
      e.city.toLowerCase().includes(query) ||
      e.otType.toLowerCase().includes(query)
    );
    // Navigate to enquiries and render filtered
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById('page-enquiries').classList.add('active');
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

    document.getElementById('pageTitle').textContent = `Search: "${q}"`;
    document.getElementById('pageCrumb').textContent = `${results.length} result${results.length!==1?'s':''}`;

    document.getElementById('enqFilterPills').innerHTML = `<span class="filter-pill active">Search Results (${results.length})</span>`;
    Render._fillTable(document.querySelector('#enqTable tbody'), results, e => `<tr>
      <td class="enq-id">${e.id}</td>
      <td><span class="hospital-cell">${e.hospital}</span><span class="city-small">${e.city}</span></td>
      <td>${e.contact}</td>
      <td>${e.otType}</td>
      <td>${Utils.drawingChip(e.drawings)}</td>
      <td>${Utils.stageChip(e.stage)}</td>
      <td class="mono val-strong">${Utils.formatINR(e.value)}</td>
      <td>${e.engineer}</td>
      <td class="mono">${Utils.formatDate(e.date)}</td>
      <td><button class="btn btn-primary btn-sm" onclick="app.openDetail('${e.id}')">Open</button></td>
    </tr>`);
  },

  init() {
    // Nav clicks
    document.getElementById('mainNav')?.addEventListener('click', e => {
      const item = e.target.closest('.nav-item');
      if (item?.dataset.page) { e.preventDefault(); this.nav(item.dataset.page); }
    });
    document.querySelectorAll('.nav').forEach(nav => {
      nav.addEventListener('click', e => {
        const item = e.target.closest('.nav-item');
        if (item?.dataset.page) { e.preventDefault(); this.nav(item.dataset.page); }
      });
    });

    // Sidebar collapse
    document.getElementById('collapseBtn').addEventListener('click', () => {
      document.getElementById('sidebar').classList.toggle('collapsed');
    });

    // Mobile menu toggle
    document.getElementById('menuToggle').addEventListener('click', () => {
      document.getElementById('sidebar').classList.toggle('mobile-show');
    });

    // New enquiry
    document.getElementById('newEnqBtn').addEventListener('click', () => this.openNewModal());

    // Theme toggle
    document.getElementById('themeToggle').addEventListener('click', () => {
      const html = document.documentElement;
      const current = html.getAttribute('data-theme');
      html.setAttribute('data-theme', current === 'dark' ? 'light' : 'dark');
    });

    // Modal tabs
    document.getElementById('modalTabs').addEventListener('click', e => {
      const tab = e.target.closest('.mtab');
      if (!tab) return;
      document.querySelectorAll('.mtab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      Modal.renderTab(tab.dataset.tab);
    });

    // Backdrop close
    document.getElementById('detailBackdrop').addEventListener('click', e => {
      if (e.target === document.getElementById('detailBackdrop')) Modal.close();
    });
    document.getElementById('newEnqBackdrop').addEventListener('click', e => {
      if (e.target === document.getElementById('newEnqBackdrop')) this.closeNewModal();
    });

    // Global search
    let searchTimeout;
    document.getElementById('globalSearch').addEventListener('input', e => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => this.globalSearch(e.target.value.trim()), 280);
    });

    // ⌘K focus search
    document.addEventListener('keydown', e => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('globalSearch').focus();
      }
      if (e.key === 'Escape') {
        Modal.close();
        this.closeNewModal();
      }
    });

    // Enquiry sort
    document.getElementById('enqSortSelect')?.addEventListener('change', () => Render.enquiries());

    // Register search
    document.getElementById('registerSearch')?.addEventListener('input', e => Render.register(e.target.value));

    // Export buttons
    document.getElementById('exportRegBtn')?.addEventListener('click', () => this.exportCSV('register'));
    document.getElementById('exportWonBtn')?.addEventListener('click', () => this.exportCSV('won'));

    // Initial render
    Render.all();
    this.nav('dashboard');

    // Welcome toast
    setTimeout(() => Toast.show('MedOT Pro', 'CRM loaded · Pipeline ready', 'info'), 600);
  }
};

// Boot
document.addEventListener('DOMContentLoaded', () => app.init());
window.app = app;
