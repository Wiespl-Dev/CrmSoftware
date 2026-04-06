import { useState, useRef } from "react";

const COMPANY = {
  name: "ThermoTech Engineering Solutions",
  tagline: "HVAC & Modular OT Specialists",
  address: "Plot 12, Industrial Zone, Pune – 411019, Maharashtra",
  phone: "+91 98765 43210",
  email: "sales@thermotecheng.com",
  gstin: "27AABCT1234A1Z5",
};

const HVAC_ITEMS = [
  { id: "ahu", category: "Air Handling Units", name: "AHU (1000–3000 CFM)", unit: "Nos", basePrice: 85000 },
  { id: "ahu2", category: "Air Handling Units", name: "AHU (3000–6000 CFM)", unit: "Nos", basePrice: 145000 },
  { id: "fcu", category: "Fan Coil Units", name: "FCU – 2 Tr Split", unit: "Nos", basePrice: 28000 },
  { id: "fcu2", category: "Fan Coil Units", name: "FCU – 4 Tr Split", unit: "Nos", basePrice: 42000 },
  { id: "chiller", category: "Chillers", name: "Air-Cooled Chiller (20 Tr)", unit: "Nos", basePrice: 420000 },
  { id: "chiller2", category: "Chillers", name: "Water-Cooled Chiller (50 Tr)", unit: "Nos", basePrice: 890000 },
  { id: "ct", category: "Cooling Towers", name: "Cooling Tower (FRP, 20 Tr)", unit: "Nos", basePrice: 95000 },
  { id: "vrf", category: "VRF Systems", name: "VRF Outdoor Unit (8 Tr)", unit: "Nos", basePrice: 310000 },
  { id: "vrf2", category: "VRF Systems", name: "VRF Indoor Cassette (2 Tr)", unit: "Nos", basePrice: 52000 },
  { id: "duct", category: "Ductwork & Insulation", name: "GI Ductwork (per sqft)", unit: "Sqft", basePrice: 220 },
  { id: "ins", category: "Ductwork & Insulation", name: "Armaflex Insulation", unit: "Rm", basePrice: 180 },
  { id: "pump", category: "Pumps & Piping", name: "Chilled Water Pump (2 HP)", unit: "Nos", basePrice: 35000 },
  { id: "bms", category: "Controls & BMS", name: "BMS Controller (per point)", unit: "Points", basePrice: 4500 },
  { id: "vfd", category: "Controls & BMS", name: "VFD Drive (15 kW)", unit: "Nos", basePrice: 48000 },
  { id: "grille", category: "Diffusers & Grilles", name: "Supply Air Diffuser (24×24)", unit: "Nos", basePrice: 2200 },
  { id: "exhaust", category: "Diffusers & Grilles", name: "Exhaust Grille (12×6)", unit: "Nos", basePrice: 850 },
];

const OT_ITEMS = [
  { id: "laf", category: "Laminar Airflow", name: "Vertical LAF Unit (4×4 ft)", unit: "Nos", basePrice: 180000 },
  { id: "laf2", category: "Laminar Airflow", name: "Horizontal LAF Bench", unit: "Nos", basePrice: 95000 },
  { id: "hepa", category: "Filtration", name: "HEPA H14 Terminal Filter (24×24)", unit: "Nos", basePrice: 18500 },
  { id: "hepa2", category: "Filtration", name: "HEPA H13 In-duct Filter", unit: "Nos", basePrice: 12000 },
  { id: "prefilter", category: "Filtration", name: "Pre-Filter G4 Panel", unit: "Nos", basePrice: 3200 },
  { id: "panel", category: "Modular Panels", name: "Cleanroom Wall Panel (4×8 ft)", unit: "Nos", basePrice: 14500 },
  { id: "ceiling", category: "Modular Panels", name: "Grid Ceiling System (per sqft)", unit: "Sqft", basePrice: 1800 },
  { id: "floor", category: "Modular Panels", name: "Epoxy Flooring (per sqft)", unit: "Sqft", basePrice: 650 },
  { id: "passbox", category: "OT Equipment", name: "Dynamic Pass Box (SS)", unit: "Nos", basePrice: 68000 },
  { id: "passbox2", category: "OT Equipment", name: "Static Pass Box (SS)", unit: "Nos", basePrice: 38000 },
  { id: "uvc", category: "OT Equipment", name: "UV-C Germicidal Light (60W)", unit: "Nos", basePrice: 8500 },
  { id: "scrub", category: "OT Equipment", name: "Scrub Station (SS, 2-faucet)", unit: "Nos", basePrice: 42000 },
  { id: "pressctrl", category: "Controls & Monitoring", name: "Differential Pressure Monitor", unit: "Nos", basePrice: 22000 },
  { id: "particle", category: "Controls & Monitoring", name: "Particle Counter (remote)", unit: "Nos", basePrice: 85000 },
  { id: "iso5", category: "Cleanroom Class", name: "ISO 5 (Class 100) Validation", unit: "Lumpsum", basePrice: 120000 },
  { id: "iso7", category: "Cleanroom Class", name: "ISO 7 (Class 10000) Validation", unit: "Lumpsum", basePrice: 75000 },
  { id: "installation", category: "Services", name: "Installation & Commissioning", unit: "Lumpsum", basePrice: 95000 },
  { id: "amc", category: "Services", name: "Annual Maintenance Contract (1 yr)", unit: "Nos", basePrice: 55000 },
];

const TAX_RATE = 0.18;

function formatINR(n) {
  return "₹" + Number(n).toLocaleString("en-IN", { maximumFractionDigits: 0 });
}

function QuoteNumber() {
  const d = new Date();
  return `TTE-${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}${String(Math.floor(Math.random() * 9000) + 1000)}`;
}

export default function App() {
  const [step, setStep] = useState(1); // 1=client, 2=items, 3=preview
  const [quoteNo] = useState(QuoteNumber);
  const [quoteDate] = useState(new Date().toLocaleDateString("en-IN"));
  const [projectType, setProjectType] = useState("both"); // hvac | ot | both
  const [client, setClient] = useState({ name: "", company: "", address: "", phone: "", email: "", gstin: "" });
  const [items, setItems] = useState({}); // id -> {qty, discount}
  const [notes, setNotes] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const printRef = useRef();

  const allItems = projectType === "hvac" ? HVAC_ITEMS : projectType === "ot" ? OT_ITEMS : [...HVAC_ITEMS, ...OT_ITEMS];
  const categories = ["All", ...Array.from(new Set(allItems.map(i => i.category)))];
  const visibleItems = activeCategory === "All" ? allItems : allItems.filter(i => i.category === activeCategory);

  const updateItem = (id, field, val) => {
    setItems(prev => ({ ...prev, [id]: { qty: 0, discount: 0, ...(prev[id] || {}), [field]: Number(val) } }));
  };

  const selectedItems = allItems.filter(i => items[i.id]?.qty > 0);

  const subtotal = selectedItems.reduce((sum, i) => {
    const { qty = 0, discount = 0 } = items[i.id] || {};
    return sum + i.basePrice * qty * (1 - discount / 100);
  }, 0);
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax;

  const handlePrint = () => {
    window.print();
  };

  const stepLabel = ["", "Client Details", "Line Items", "Preview & Export"];

  return (
    <div style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif", minHeight: "100vh", background: "#0d1117", color: "#e6edf3" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Space+Mono:wght@400;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: #161b22; } ::-webkit-scrollbar-thumb { background: #30363d; border-radius: 3px; }
        input, textarea, select { background: #161b22; border: 1px solid #30363d; color: #e6edf3; border-radius: 6px; padding: 8px 12px; font-family: inherit; font-size: 14px; outline: none; transition: border .2s; width: 100%; }
        input:focus, textarea:focus, select:focus { border-color: #00b4d8; box-shadow: 0 0 0 3px rgba(0,180,216,.15); }
        button { cursor: pointer; font-family: inherit; }
        @media print {
          body * { visibility: hidden; }
          #print-area, #print-area * { visibility: visible; }
          #print-area { position: fixed; top: 0; left: 0; width: 100%; background: #fff !important; color: #000 !important; padding: 24px; }
        }
      `}</style>

      {/* HEADER */}
      <div style={{ background: "linear-gradient(135deg, #0d1117 0%, #161b22 100%)", borderBottom: "1px solid #21262d", padding: "16px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 42, height: 42, background: "linear-gradient(135deg, #00b4d8, #0077b6)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>❄</div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: ".5px", color: "#e6edf3" }}>{COMPANY.name}</div>
            <div style={{ fontSize: 11, color: "#7d8590", letterSpacing: "1.5px", textTransform: "uppercase", fontFamily: "'Space Mono', monospace" }}>{COMPANY.tagline}</div>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, color: "#00b4d8" }}>QUOTATION</div>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 16, fontWeight: 700, color: "#e6edf3" }}>{quoteNo}</div>
          <div style={{ fontSize: 11, color: "#7d8590" }}>{quoteDate}</div>
        </div>
      </div>

      {/* STEPS */}
      <div style={{ display: "flex", gap: 0, background: "#161b22", borderBottom: "1px solid #21262d", padding: "0 32px" }}>
        {[1, 2, 3].map(s => (
          <button key={s} onClick={() => s < step && setStep(s)} style={{ padding: "14px 24px", background: "transparent", border: "none", borderBottom: `2px solid ${step === s ? "#00b4d8" : "transparent"}`, color: step === s ? "#00b4d8" : step > s ? "#7d8590" : "#484f58", fontSize: 13, fontWeight: step === s ? 600 : 400, display: "flex", alignItems: "center", gap: 8, transition: "all .2s" }}>
            <span style={{ width: 20, height: 20, borderRadius: "50%", background: step > s ? "#00b4d8" : step === s ? "transparent" : "#21262d", border: `1.5px solid ${step >= s ? "#00b4d8" : "#30363d"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: step > s ? "#fff" : step === s ? "#00b4d8" : "#484f58", fontFamily: "'Space Mono', monospace", flexShrink: 0 }}>{step > s ? "✓" : s}</span>
            {stepLabel[s]}
          </button>
        ))}
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>

        {/* STEP 1: CLIENT */}
        {step === 1 && (
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24, color: "#e6edf3" }}>Project & Client Details</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 28 }}>
              <Card title="Project Type">
                <div style={{ display: "flex", gap: 10 }}>
                  {[["hvac", "❄ HVAC Only"], ["ot", "🏥 Modular OT Only"], ["both", "⚡ HVAC + Modular OT"]].map(([val, label]) => (
                    <button key={val} onClick={() => setProjectType(val)} style={{ flex: 1, padding: "10px 8px", borderRadius: 8, border: `1.5px solid ${projectType === val ? "#00b4d8" : "#30363d"}`, background: projectType === val ? "rgba(0,180,216,.1)" : "#0d1117", color: projectType === val ? "#00b4d8" : "#7d8590", fontSize: 12, fontWeight: 600, transition: "all .2s" }}>{label}</button>
                  ))}
                </div>
              </Card>
              <Card title="Quote Valid Until">
                <input type="date" defaultValue={new Date(Date.now() + 30 * 864e5).toISOString().split("T")[0]} style={{ width: "100%" }} />
              </Card>
            </div>
            <Card title="Client Information">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <Field label="Client / Contact Name" value={client.name} onChange={v => setClient(p => ({ ...p, name: v }))} placeholder="Dr. Rajesh Sharma" />
                <Field label="Hospital / Company Name" value={client.company} onChange={v => setClient(p => ({ ...p, company: v }))} placeholder="City Care Hospital Pvt. Ltd." />
                <Field label="Phone" value={client.phone} onChange={v => setClient(p => ({ ...p, phone: v }))} placeholder="+91 98xxxxxxxx" />
                <Field label="Email" value={client.email} onChange={v => setClient(p => ({ ...p, email: v }))} placeholder="admin@hospital.com" />
                <Field label="GSTIN (optional)" value={client.gstin} onChange={v => setClient(p => ({ ...p, gstin: v }))} placeholder="27AAAAA0000A1Z5" />
                <Field label="Site Address" value={client.address} onChange={v => setClient(p => ({ ...p, address: v }))} placeholder="123, MG Road, Pune – 411001" />
              </div>
            </Card>
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 24 }}>
              <PrimaryBtn onClick={() => setStep(2)}>Next: Add Line Items →</PrimaryBtn>
            </div>
          </div>
        )}

        {/* STEP 2: ITEMS */}
        {step === 2 && (
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <h2 style={{ fontSize: 22, fontWeight: 700, color: "#e6edf3" }}>Select Equipment & Services</h2>
              <div style={{ background: "#161b22", border: "1px solid #30363d", borderRadius: 8, padding: "8px 16px", fontFamily: "'Space Mono', monospace", fontSize: 13, color: "#00b4d8" }}>
                {selectedItems.length} items · {formatINR(total)} incl. GST
              </div>
            </div>

            {/* Category Tabs */}
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 20 }}>
              {categories.map(c => (
                <button key={c} onClick={() => setActiveCategory(c)} style={{ padding: "5px 12px", borderRadius: 20, border: `1px solid ${activeCategory === c ? "#00b4d8" : "#30363d"}`, background: activeCategory === c ? "rgba(0,180,216,.12)" : "#161b22", color: activeCategory === c ? "#00b4d8" : "#7d8590", fontSize: 12, fontWeight: 500, transition: "all .15s" }}>{c}</button>
              ))}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 24 }}>
              <div style={{ display: "grid", gridTemplateColumns: "2fr 80px 80px 80px 110px", gap: 10, padding: "8px 14px", background: "#161b22", borderRadius: 6, fontSize: 11, color: "#7d8590", fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase", fontFamily: "'Space Mono', monospace" }}>
                <span>Item / Description</span><span style={{ textAlign: "center" }}>Unit</span><span style={{ textAlign: "center" }}>Rate</span><span style={{ textAlign: "center" }}>Qty</span><span style={{ textAlign: "center" }}>Disc %</span>
              </div>
              {visibleItems.map(item => {
                const row = items[item.id] || { qty: 0, discount: 0 };
                const rowTotal = item.basePrice * row.qty * (1 - row.discount / 100);
                const active = row.qty > 0;
                return (
                  <div key={item.id} style={{ display: "grid", gridTemplateColumns: "2fr 80px 80px 80px 110px", gap: 10, padding: "10px 14px", background: active ? "rgba(0,180,216,.06)" : "#161b22", border: `1px solid ${active ? "rgba(0,180,216,.25)" : "#21262d"}`, borderRadius: 8, alignItems: "center", transition: "all .15s" }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: active ? 600 : 400, color: active ? "#e6edf3" : "#8b949e" }}>{item.name}</div>
                      <div style={{ fontSize: 11, color: "#484f58", marginTop: 1 }}>{item.category}</div>
                    </div>
                    <div style={{ textAlign: "center", fontSize: 11, color: "#7d8590", fontFamily: "'Space Mono', monospace" }}>{item.unit}</div>
                    <div style={{ textAlign: "center", fontSize: 12, color: "#7d8590", fontFamily: "'Space Mono', monospace" }}>₹{item.basePrice.toLocaleString("en-IN")}</div>
                    <div>
                      <input type="number" min="0" value={row.qty || ""} placeholder="0" onChange={e => updateItem(item.id, "qty", e.target.value)} style={{ textAlign: "center", padding: "6px 4px", fontSize: 13 }} />
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <input type="number" min="0" max="100" value={row.discount || ""} placeholder="0" onChange={e => updateItem(item.id, "discount", e.target.value)} style={{ textAlign: "center", padding: "6px 4px", fontSize: 13, width: 50 }} />
                      <div style={{ fontSize: 11, color: active ? "#00b4d8" : "#484f58", fontFamily: "'Space Mono', monospace", minWidth: 55, textAlign: "right" }}>{active ? formatINR(rowTotal) : "—"}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            <Card title="Terms & Notes">
              <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} placeholder="e.g. Payment terms: 50% advance, 40% on delivery, 10% on commissioning. Delivery: 6–8 weeks from PO." style={{ resize: "vertical" }} />
            </Card>

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24 }}>
              <GhostBtn onClick={() => setStep(1)}>← Back</GhostBtn>
              <PrimaryBtn onClick={() => setStep(3)} disabled={selectedItems.length === 0}>Preview Quotation →</PrimaryBtn>
            </div>
          </div>
        )}

        {/* STEP 3: PREVIEW */}
        {step === 3 && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h2 style={{ fontSize: 22, fontWeight: 700 }}>Quotation Preview</h2>
              <div style={{ display: "flex", gap: 10 }}>
                <GhostBtn onClick={() => setStep(2)}>← Edit Items</GhostBtn>
                <PrimaryBtn onClick={handlePrint}>🖨 Print / Save PDF</PrimaryBtn>
              </div>
            </div>

            <div id="print-area" ref={printRef} style={{ background: "#161b22", border: "1px solid #30363d", borderRadius: 12, overflow: "hidden" }}>
              {/* Quote Header */}
              <div style={{ background: "linear-gradient(135deg, #0d1117, #161b22)", padding: "28px 32px", borderBottom: "1px solid #21262d", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <div style={{ width: 36, height: 36, background: "linear-gradient(135deg, #00b4d8, #0077b6)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>❄</div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 16, color: "#e6edf3" }}>{COMPANY.name}</div>
                      <div style={{ fontSize: 11, color: "#7d8590" }}>{COMPANY.tagline}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: "#7d8590", lineHeight: 1.6 }}>
                    <div>{COMPANY.address}</div>
                    <div>{COMPANY.phone} · {COMPANY.email}</div>
                    <div>GSTIN: {COMPANY.gstin}</div>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ background: "rgba(0,180,216,.1)", border: "1px solid rgba(0,180,216,.3)", borderRadius: 8, padding: "12px 20px" }}>
                    <div style={{ fontSize: 10, color: "#7d8590", textTransform: "uppercase", letterSpacing: "1.5px", fontFamily: "'Space Mono', monospace" }}>Quotation No.</div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: "#00b4d8", fontFamily: "'Space Mono', monospace" }}>{quoteNo}</div>
                    <div style={{ fontSize: 11, color: "#7d8590", marginTop: 4 }}>Date: {quoteDate}</div>
                  </div>
                </div>
              </div>

              {/* Bill To */}
              <div style={{ padding: "20px 32px", borderBottom: "1px solid #21262d", background: "#0d1117" }}>
                <div style={{ fontSize: 10, color: "#7d8590", textTransform: "uppercase", letterSpacing: "1.5px", fontFamily: "'Space Mono', monospace", marginBottom: 8 }}>Bill To</div>
                <div style={{ fontWeight: 700, fontSize: 15, color: "#e6edf3" }}>{client.company || "—"}</div>
                <div style={{ fontSize: 13, color: "#8b949e", lineHeight: 1.7 }}>
                  {client.name && <div>Attn: {client.name}</div>}
                  {client.address && <div>{client.address}</div>}
                  {client.phone && <div>{client.phone}</div>}
                  {client.email && <div>{client.email}</div>}
                  {client.gstin && <div>GSTIN: {client.gstin}</div>}
                </div>
              </div>

              {/* Line Items Table */}
              <div style={{ padding: "24px 32px" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: "#0d1117" }}>
                      {["#", "Description", "Category", "Unit", "Rate (₹)", "Qty", "Disc %", "Amount (₹)"].map(h => (
                        <th key={h} style={{ padding: "10px 12px", textAlign: h === "#" || h === "Qty" || h === "Disc %" || h === "Rate (₹)" || h === "Amount (₹)" ? "center" : "left", fontSize: 10, fontWeight: 700, color: "#7d8590", textTransform: "uppercase", letterSpacing: "1px", fontFamily: "'Space Mono', monospace", borderBottom: "1px solid #30363d" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {selectedItems.map((item, idx) => {
                      const { qty = 0, discount = 0 } = items[item.id];
                      const amount = item.basePrice * qty * (1 - discount / 100);
                      return (
                        <tr key={item.id} style={{ borderBottom: "1px solid #21262d", background: idx % 2 === 0 ? "transparent" : "rgba(255,255,255,.015)" }}>
                          <td style={{ padding: "11px 12px", textAlign: "center", color: "#7d8590", fontFamily: "'Space Mono', monospace", fontSize: 11 }}>{idx + 1}</td>
                          <td style={{ padding: "11px 12px", fontWeight: 500, color: "#e6edf3" }}>{item.name}</td>
                          <td style={{ padding: "11px 12px", fontSize: 11, color: "#7d8590" }}>{item.category}</td>
                          <td style={{ padding: "11px 12px", textAlign: "center", color: "#8b949e" }}>{item.unit}</td>
                          <td style={{ padding: "11px 12px", textAlign: "center", fontFamily: "'Space Mono', monospace", color: "#8b949e" }}>{item.basePrice.toLocaleString("en-IN")}</td>
                          <td style={{ padding: "11px 12px", textAlign: "center", fontFamily: "'Space Mono', monospace", color: "#e6edf3", fontWeight: 600 }}>{qty}</td>
                          <td style={{ padding: "11px 12px", textAlign: "center", color: discount > 0 ? "#f0883e" : "#484f58", fontFamily: "'Space Mono', monospace" }}>{discount > 0 ? `${discount}%` : "—"}</td>
                          <td style={{ padding: "11px 12px", textAlign: "center", fontFamily: "'Space Mono', monospace", color: "#00b4d8", fontWeight: 600 }}>{amount.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {/* Totals */}
                <div style={{ marginTop: 20, display: "flex", justifyContent: "flex-end" }}>
                  <div style={{ width: 320 }}>
                    {[["Subtotal (Excl. GST)", subtotal], ["GST @ 18%", tax]].map(([label, val]) => (
                      <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 16px", borderBottom: "1px solid #21262d", fontSize: 13 }}>
                        <span style={{ color: "#8b949e" }}>{label}</span>
                        <span style={{ fontFamily: "'Space Mono', monospace", color: "#8b949e" }}>{formatINR(val)}</span>
                      </div>
                    ))}
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "14px 16px", background: "rgba(0,180,216,.1)", border: "1px solid rgba(0,180,216,.25)", borderRadius: "0 0 8px 8px", marginTop: 4 }}>
                      <span style={{ fontWeight: 700, fontSize: 15, color: "#e6edf3" }}>GRAND TOTAL</span>
                      <span style={{ fontFamily: "'Space Mono', monospace", fontWeight: 700, fontSize: 17, color: "#00b4d8" }}>{formatINR(total)}</span>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {notes && (
                  <div style={{ marginTop: 28, padding: 18, background: "#0d1117", borderRadius: 8, border: "1px solid #21262d" }}>
                    <div style={{ fontSize: 10, color: "#7d8590", textTransform: "uppercase", letterSpacing: "1.5px", fontFamily: "'Space Mono', monospace", marginBottom: 8 }}>Terms & Notes</div>
                    <div style={{ fontSize: 13, color: "#8b949e", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{notes}</div>
                  </div>
                )}

                {/* Footer */}
                <div style={{ marginTop: 32, paddingTop: 20, borderTop: "1px solid #21262d", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                  <div style={{ fontSize: 11, color: "#484f58", lineHeight: 1.7 }}>
                    <div>This quotation is valid for 30 days from the date of issue.</div>
                    <div>All prices are subject to applicable taxes and site conditions.</div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ width: 140, borderTop: "1px solid #30363d", paddingTop: 8, fontSize: 11, color: "#7d8590" }}>Authorised Signatory</div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "#8b949e" }}>{COMPANY.name}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Sub-components
function Card({ title, children }) {
  return (
    <div style={{ background: "#161b22", border: "1px solid #21262d", borderRadius: 10, padding: "20px 20px 20px" }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: "#7d8590", textTransform: "uppercase", letterSpacing: "1.5px", fontFamily: "'Space Mono', monospace", marginBottom: 14 }}>{title}</div>
      {children}
    </div>
  );
}

function Field({ label, value, onChange, placeholder }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: 11, color: "#7d8590", marginBottom: 5, fontWeight: 500 }}>{label}</label>
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  );
}

function PrimaryBtn({ onClick, children, disabled }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{ padding: "10px 22px", borderRadius: 8, border: "none", background: disabled ? "#21262d" : "linear-gradient(135deg, #00b4d8, #0077b6)", color: disabled ? "#484f58" : "#fff", fontSize: 14, fontWeight: 600, transition: "opacity .2s", opacity: disabled ? .5 : 1 }}>{children}</button>
  );
}

function GhostBtn({ onClick, children }) {
  return (
    <button onClick={onClick} style={{ padding: "10px 18px", borderRadius: 8, border: "1px solid #30363d", background: "transparent", color: "#8b949e", fontSize: 14, fontWeight: 500 }}>{children}</button>
  );
}
