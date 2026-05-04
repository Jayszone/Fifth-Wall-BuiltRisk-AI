import { useState, useEffect } from 'react'

// ─── Global CSS ───────────────────────────────────────────────────────────────
const GLOBAL = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { min-height: 100vh; background: #f8fafc; font-family: 'Inter', sans-serif; }
  input, button { font-family: 'Inter', sans-serif; }
  @keyframes spin    { to { transform: rotate(360deg); } }
  @keyframes fadeUp  { from { opacity:0; transform:translateY(22px); } to { opacity:1; transform:translateY(0); } }
  @keyframes stepIn  { from { opacity:0; transform:translateX(-6px); } to { opacity:1; transform:translateX(0); } }
  @keyframes pop     { 0%,100% { transform:scale(1); } 50% { transform:scale(1.04); } }
  .fade-up { animation: fadeUp 0.45s cubic-bezier(.16,1,.3,1) forwards; }
  input[type=range] {
    -webkit-appearance: none; appearance: none;
    height: 4px; border-radius: 4px; outline: none; cursor: pointer; width: 100%;
  }
  input[type=range]::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 18px; height: 18px; border-radius: 50%;
    background: #fff; border: 2.5px solid #4f46e5; cursor: pointer;
    box-shadow: 0 1px 6px rgba(79,70,229,.3);
  }
  input[type=range]::-moz-range-thumb {
    width: 18px; height: 18px; border-radius: 50%;
    background: #fff; border: 2.5px solid #4f46e5; cursor: pointer;
  }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
`

// ─── Tokens ───────────────────────────────────────────────────────────────────
const C = {
  bg:         '#f8fafc',
  card:       '#ffffff',
  border:     '#e2e8f0',
  text:       '#0f172a',
  text2:      '#475569',
  text3:      '#94a3b8',
  accent:     '#4f46e5',
  accentBg:   '#eef2ff',
  accentText: '#4338ca',
  high:       '#ef4444',
  highBg:     '#fef2f2',
  mod:        '#d97706',
  modBg:      '#fffbeb',
  low:        '#16a34a',
  lowBg:      '#f0fdf4',
}

const card = {
  background:   C.card,
  border:       `1px solid ${C.border}`,
  borderRadius: 16,
  padding:      28,
  boxShadow:    '0 1px 4px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.04)',
}

// ─── Mock data ────────────────────────────────────────────────────────────────
const MOCK = {
  matchedAddress: '6255 W Sunset Blvd, Los Angeles, CA 90028',
  tract:          '06037193101',
  lat:            '34.0977°N',
  lon:            '118.3277°W',
  confidence:     'High',
  score:          79,
  riskLabel:      'High Risk',
  miniCards: [
    {
      label: 'Operational Risk', value: 'High', risk: 'high', note: 'EUI + compliance gap',
      detail: 'This asset\'s Energy Use Intensity of 119.3 kBtu/sqft is ~40% above the LA Class A office benchmark of ~85 kBtu/sqft. Its ENERGY STAR score of 34 sits well below the sector median of 57, signaling deferred investment in building systems. Combined with a Non-Compliant EBEWE reporting status, the building shows compounding operational underperformance that increases carry cost and limits access to ESG-aligned capital.',
    },
    {
      label: 'Hazard Exposure', value: 'Moderate', risk: 'mod', note: 'Wildfire · heat · flood',
      detail: 'Census Tract 06037193101 carries a FEMA NRI wildfire rating of High and a heat risk of Moderate, together adding +13 points to the total risk score. The Hollywood submarket sits within a designated High Fire Hazard Severity Zone under CalFire classifications. Flood risk is rated Low — the one physical hazard that meaningfully offsets overall climate exposure and keeps the rating from reaching High.',
    },
    {
      label: 'Data Quality', value: 'Strong', risk: 'low', note: '91% benchmark match',
      detail: 'Address-to-asset match confidence is 91%, based on fuzzy matching against LA EBEWE benchmarking records. Energy use, water intensity, and compliance data are all available for the 2022 reporting year with no material gaps. Census geocoding resolved to exact coordinates and a verified census tract. High data completeness means the risk score reflects the actual asset profile — not an estimate.',
    },
  ],
  building: {
    'Property Type':         { v: 'Office' },
    'Gross Floor Area':      { v: '416,000 sqft' },
    'Energy Use Intensity':  { v: '119.3 kBtu/sqft', risk: 'high' },
    'ENERGY STAR Score':     { v: '34 / 100',        risk: 'high' },
    'Water Use Intensity':   { v: '31.2 kgal/sqft' },
    'Compliance Status':     { v: 'Non-Compliant',   risk: 'high' },
    'Benchmark Year':        { v: '2022' },
  },
  breakdown: [
    { label: 'Base Score',             delta: 60,  base: true },
    { label: 'Wildfire / heat exposure', delta: +8 },
    { label: 'High energy intensity',  delta: +6  },
    { label: 'Non-compliant status',   delta: +5  },
    { label: 'Low ENERGY STAR score',  delta: +4  },
    { label: 'Low flood risk',         delta: -4, positive: true },
  ],
  memo: `6255 W Sunset Blvd scores 79/100 (High Risk), driven by compounding
operational underperformance and elevated wildfire exposure in the Hollywood
submarket. The asset's EUI of 119.3 kBtu/sqft exceeds the LA Class A office
benchmark by ~40%, while its ENERGY STAR score of 34 signals deferred capital
investment in building systems. Non-compliance with EBEWE creates additional
regulatory and financing risk. The low flood rating is the sole substantive
mitigant in the current operating profile.`,
  actions: [
    {
      n: '01',
      title: 'Commission ASHRAE Level II energy audit',
      desc:  'Target 15–20% EUI reduction via HVAC optimization and LED retrofit. Estimated cost: $0.40–$0.65/sqft.',
    },
    {
      n: '02',
      title: 'Restore EBEWE compliance immediately',
      desc:  'File outstanding 2023–2024 benchmarking reports to remove +5 pts from score and preserve ESG financing eligibility.',
    },
    {
      n: '03',
      title: 'Add operational monitoring layer',
      desc:  'Deploy sub-metering and real-time fault detection to reduce insurance carry cost and demonstrate proactive risk management to lenders.',
    },
  ],
}

// ─── Shared ───────────────────────────────────────────────────────────────────
const Sp = ({ h }) => <div style={{ height: h }} />

const Wrap = ({ children, maxW = 1080 }) => (
  <div style={{ maxWidth: maxW, margin: '0 auto', padding: '0 32px' }}>
    {children}
  </div>
)

const Label = ({ children, style: s }) => (
  <p style={{
    fontSize: 10, fontWeight: 700, letterSpacing: 2.5,
    textTransform: 'uppercase', color: C.text3,
    ...s,
  }}>
    {children}
  </p>
)

const Badge = ({ risk, children, large }) => {
  const map = {
    high: { color: C.high, bg: C.highBg },
    mod:  { color: C.mod,  bg: C.modBg  },
    low:  { color: C.low,  bg: C.lowBg  },
  }
  const s = map[risk] || {}
  return (
    <span style={{
      display: 'inline-block',
      fontSize: large ? 13 : 11, fontWeight: 700, letterSpacing: 0.2,
      padding: large ? '5px 12px' : '3px 8px', borderRadius: 8,
      color: s.color || C.text2, background: s.bg || '#f1f5f9',
    }}>
      {children}
    </span>
  )
}

const DataRow = ({ label, value, risk }) => {
  const vc = risk === 'high' ? C.high : risk === 'low' ? C.low : risk === 'mod' ? C.mod : C.text
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between',
      alignItems: 'center', padding: '9px 0',
      borderBottom: `1px solid ${C.border}`, gap: 12,
    }}>
      <span style={{ fontSize: 12, color: C.text2 }}>{label}</span>
      <span style={{ fontSize: 12, color: vc, fontWeight: 600, textAlign: 'right' }}>{value}</span>
    </div>
  )
}

// ─── Nav ──────────────────────────────────────────────────────────────────────
function Nav({ onBack }) {
  return (
    <div style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: 'rgba(248,250,252,0.92)',
      backdropFilter: 'blur(12px)',
      borderBottom: `1px solid ${C.border}`,
    }}>
      <Wrap>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 56 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 8, background: C.accent,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ color: '#fff', fontSize: 13, fontWeight: 900 }}>B</span>
            </div>
            <span style={{ fontSize: 15, fontWeight: 800, color: C.text, letterSpacing: -0.3 }}>
              BuiltRisk AI
            </span>
            <span style={{
              fontSize: 10, fontWeight: 600, color: C.accent,
              background: C.accentBg, padding: '2px 8px',
              borderRadius: 20, letterSpacing: 0.3,
            }}>
              Prototype
            </span>
          </div>
          {onBack && (
            <button
              onClick={onBack}
              style={{
                background: 'none', border: `1px solid ${C.border}`,
                borderRadius: 8, padding: '6px 14px',
                fontSize: 12, fontWeight: 600, color: C.text2,
                cursor: 'pointer',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = C.accent; e.currentTarget.style.color = C.accent }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.text2 }}
            >
              ← New search
            </button>
          )}
        </div>
      </Wrap>
    </div>
  )
}

// ─── VIEW 1: LANDING ─────────────────────────────────────────────────────────
function Landing({ onAnalyze }) {
  const [addr,    setAddr]    = useState('')
  const [focused, setFocused] = useState(false)
  const go = () => { if (addr.trim()) onAnalyze(addr.trim()) }

  return (
    <>
      <Nav />
      <Wrap maxW={600}>
        <Sp h={88} />

        <div style={{ textAlign: 'center' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: C.accentBg, borderRadius: 20,
            padding: '5px 14px', fontSize: 11, fontWeight: 600,
            color: C.accentText, letterSpacing: 0.3, marginBottom: 28,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.accent, display: 'inline-block' }} />
            Fifth Wall — Dynamic Underwriting
          </div>

          <h1 style={{
            fontSize: 'clamp(38px, 6vw, 62px)', fontWeight: 900,
            letterSpacing: -2.5, lineHeight: 1.06,
            color: C.text, marginBottom: 18,
          }}>
            Underwrite any<br />
            <span style={{ color: C.accent }}>building in seconds.</span>
          </h1>

          <p style={{
            fontSize: 16, color: C.text2, lineHeight: 1.7,
            maxWidth: 440, margin: '0 auto 48px',
          }}>
            Enter a commercial address. Get a dynamic risk score,
            AI-generated underwriting rationale, and live what-if analysis.
          </p>
        </div>

        {/* Search */}
        <div style={{ ...card, padding: 20 }}>
          <div style={{ display: 'flex', gap: 10 }}>
            <input
              value={addr}
              onChange={e => setAddr(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && go()}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder="100 Wilshire Blvd, 20th Floor, Santa Monica, CA 90401"
              style={{
                flex: 1, background: C.bg,
                border: `1.5px solid ${focused ? C.accent : C.border}`,
                borderRadius: 10, color: C.text,
                fontSize: 14, padding: '12px 16px', outline: 'none',
                transition: 'border-color 0.2s',
              }}
            />
            <button
              onClick={go}
              style={{
                background: C.accent, color: '#fff', border: 'none',
                borderRadius: 10, fontWeight: 700, fontSize: 14,
                padding: '12px 26px', cursor: 'pointer', flexShrink: 0,
                transition: 'opacity 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
            >
              Analyze Asset
            </button>
          </div>
          <p style={{ fontSize: 11, color: C.text3, marginTop: 10 }}>
            Try: &nbsp;6255 W Sunset Blvd, Los Angeles &nbsp;·&nbsp; 633 W 5th St, Los Angeles &nbsp;·&nbsp; 1999 Avenue of the Stars
          </p>
        </div>

        <Sp h={72} />

        {/* How it works */}
        <Label>How it works</Label>
        <Sp h={20} />
        {[
          { n: '01', title: 'Geocode the address', desc: 'One Census Bureau API call resolves the address to exact coordinates and census tract.' },
          { n: '02', title: 'Match asset records', desc: 'LA EBEWE energy benchmarking and FEMA National Risk Index data are matched to the property.' },
          { n: '03', title: 'Score + simulate', desc: 'A deterministic engine scores 5 risk factors. Adjust variables in real time to see how the score changes.' },
        ].map(({ n, title, desc }, i) => (
          <div key={n} style={{
            display: 'flex', gap: 18, padding: '18px 0',
            borderBottom: i < 2 ? `1px solid ${C.border}` : 'none',
          }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: C.accent, minWidth: 24, paddingTop: 2, letterSpacing: 0.5 }}>{n}</span>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 3 }}>{title}</div>
              <div style={{ fontSize: 13, color: C.text2, lineHeight: 1.6 }}>{desc}</div>
            </div>
          </div>
        ))}

        <Sp h={80} />
        <p style={{ fontSize: 11, color: C.text3, textAlign: 'center' }}>
          Uses live geocoding · LA EBEWE benchmarks · FEMA NRI hazard data
        </p>
        <Sp h={56} />
      </Wrap>
    </>
  )
}

// ─── VIEW 2: PROCESSING ──────────────────────────────────────────────────────
const STEPS = [
  { label: 'Live Geocoding',    run: 'Querying U.S. Census Bureau geocoder…',           done: 'Resolved: 34.0977°N, 118.3277°W · Tract 06037193101' },
  { label: 'Asset Matching',   run: 'Matching building and hazard datasets…',           done: '6255 W Sunset Blvd matched (Office · 91% confidence) · Hollywood submarket' },
  { label: 'Risk Analysis',    run: 'Scoring risk factors and generating memo…',        done: 'Score: 79 / 100 · High Risk · 5 factors · AI memo ready' },
]

function Processing({ address, onComplete }) {
  const [status, setStatus] = useState([1, 0, 0])
  useEffect(() => {
    const t = [
      setTimeout(() => setStatus([2, 1, 0]), 1400),
      setTimeout(() => setStatus([2, 2, 1]), 2700),
      setTimeout(() => setStatus([2, 2, 2]), 3800),
      setTimeout(() => onComplete(),         4400),
    ]
    return () => t.forEach(clearTimeout)
  }, [])

  return (
    <>
      <Nav />
      <Wrap maxW={600}>
        <Sp h={72} />
        <Label>Analyzing</Label>
        <Sp h={10} />
        <h2 style={{ fontSize: 'clamp(17px, 2.5vw, 24px)', fontWeight: 700, color: C.text, letterSpacing: -0.4, marginBottom: 36 }}>
          {address}
        </h2>

        <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
          {STEPS.map(({ label, run, done }, i) => {
            const s = status[i], isPending = s === 0, isRunning = s === 1, isDone = s === 2
            return (
              <div key={i} style={{
                display: 'flex', gap: 16, alignItems: 'flex-start',
                padding: '22px 26px',
                borderBottom: i < 2 ? `1px solid ${C.border}` : 'none',
                opacity: isPending ? 0.3 : 1,
                transition: 'opacity 0.4s ease, background 0.3s ease',
                background: isRunning ? C.accentBg : 'transparent',
              }}>
                <div style={{
                  width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: isDone ? C.accent : isRunning ? '#fff' : C.bg,
                  border: `2px solid ${isDone ? C.accent : isRunning ? C.accent : C.border}`,
                  transition: 'all 0.3s',
                }}>
                  {isDone ? (
                    <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ) : isRunning ? (
                    <div style={{ width: 10, height: 10, borderRadius: '50%', border: `2px solid ${C.border}`, borderTopColor: C.accent, animation: 'spin 0.7s linear infinite' }} />
                  ) : (
                    <div style={{ width: 7, height: 7, borderRadius: '50%', background: C.border }} />
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: 13, fontWeight: 700, marginBottom: 3,
                    color: isRunning ? C.accent : isDone ? C.text : C.text3,
                    animation: isRunning ? 'stepIn 0.3s ease-out' : 'none',
                  }}>
                    {label}
                  </div>
                  <div style={{ fontSize: 12, color: C.text2, lineHeight: 1.5 }}>
                    {isDone ? done : run}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        <Sp h={80} />
      </Wrap>
    </>
  )
}

// ─── VIEW 3: MATCH ────────────────────────────────────────────────────────────
function Match({ onContinue }) {
  const d = MOCK
  return (
    <div className="fade-up">
      <Nav />
      <Wrap maxW={600}>
        <Sp h={64} />

        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: C.lowBg, borderRadius: 20,
          padding: '5px 14px', fontSize: 11, fontWeight: 600,
          color: C.low, letterSpacing: 0.3, marginBottom: 28,
        }}>
          <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
            <path d="M2 6l3 3 5-5" stroke={C.low} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Asset Matched
        </div>

        <h2 style={{ fontSize: 'clamp(20px, 3vw, 30px)', fontWeight: 800, color: C.text, letterSpacing: -0.8, lineHeight: 1.2, marginBottom: 32 }}>
          {d.matchedAddress}
        </h2>

        <div style={{ ...card, marginBottom: 16 }}>
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr',
            gap: 0,
          }}>
            {[
              { label: 'Property Type', value: 'Office Building' },
              { label: 'Gross Floor Area', value: '416,000 sqft' },
              { label: 'Benchmark Year', value: '2022 (EBEWE)' },
              { label: 'Census Tract', value: d.tract },
              { label: 'Region', value: 'Hollywood, LA County' },
              { label: 'Coordinates', value: `${d.lat} · ${d.lon}` },
            ].map(({ label, value }, i) => (
              <div key={label} style={{
                padding: '14px 0',
                borderBottom: i < 4 ? `1px solid ${C.border}` : 'none',
                paddingRight: i % 2 === 0 ? 24 : 0,
                paddingLeft: i % 2 === 1 ? 24 : 0,
                borderLeft: i % 2 === 1 ? `1px solid ${C.border}` : 'none',
              }}>
                <div style={{ fontSize: 10, color: C.text3, fontWeight: 600, letterSpacing: 0.5, marginBottom: 4 }}>{label}</div>
                <div style={{ fontSize: 13, color: C.text, fontWeight: 600 }}>{value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Confidence */}
        <div style={{ ...card, padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 2 }}>Data Confidence</div>
            <div style={{ fontSize: 11, color: C.text2 }}>Address match · benchmark records · hazard data all resolved</div>
          </div>
          <Badge risk="low" large>High</Badge>
        </div>

        <button
          onClick={onContinue}
          style={{
            width: '100%', background: C.accent, color: '#fff',
            border: 'none', borderRadius: 12, fontWeight: 700,
            fontSize: 15, padding: '16px', cursor: 'pointer',
            transition: 'opacity 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
        >
          View Risk Analysis →
        </button>

        <Sp h={80} />
      </Wrap>
    </div>
  )
}

// ─── Toggle helper ────────────────────────────────────────────────────────────
function Toggle({ options, value, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 4, background: C.bg, borderRadius: 8, padding: 3, border: `1px solid ${C.border}` }}>
      {options.map(o => {
        const active = o.value === value
        return (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            style={{
              flex: 1, padding: '7px 10px', borderRadius: 6, border: 'none',
              fontSize: 12, fontWeight: 600, cursor: 'pointer',
              background: active ? C.accent : 'transparent',
              color: active ? '#fff' : C.text2,
              transition: 'all 0.15s',
            }}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}

// ─── VIEW 4: RESULTS ─────────────────────────────────────────────────────────
function Results({ onReset }) {
  const d = MOCK

  // Expandable mini cards
  const [expandedCards, setExpandedCards] = useState(new Set())
  const toggleCard = label => setExpandedCards(prev => {
    const next = new Set(prev)
    next.has(label) ? next.delete(label) : next.add(label)
    return next
  })

  // What-if state
  const [energyPct,   setEnergyPct]   = useState(0)
  const [compliance,  setCompliance]  = useState('delayed')
  const [maintenance, setMaintenance] = useState('low')

  const energyDelta      = -Math.round((energyPct / 20) * 6)
  const complianceDelta  = compliance  === 'current' ? -5 : 0
  const maintDelta       = maintenance === 'low' ? 0 : maintenance === 'medium' ? -2 : -4
  const projectedScore   = d.score + energyDelta + complianceDelta + maintDelta
  const totalDelta       = projectedScore - d.score
  const changed          = totalDelta !== 0

  const postureLabel = s => s >= 75 ? 'Elevated' : s >= 65 ? 'Moderate' : 'Standard'
  const postureColor = s => s >= 75 ? C.high : s >= 65 ? C.mod : C.low
  const postureBg    = s => s >= 75 ? C.highBg : s >= 65 ? C.modBg : C.lowBg

  const sliderBg = pct => `linear-gradient(to right, ${C.accent} ${pct}%, ${C.border} ${pct}%)`

  return (
    <div className="fade-up">
      <Nav onBack={onReset} />
      <Wrap maxW={1080}>
        <Sp h={40} />

        {/* Address header */}
        <div style={{ marginBottom: 32 }}>
          <p style={{ fontSize: 11, color: C.text3, marginBottom: 5 }}>
            Tract {d.tract} · {d.lat} · {d.lon}
          </p>
          <h2 style={{ fontSize: 'clamp(16px, 2vw, 22px)', fontWeight: 800, color: C.text, letterSpacing: -0.4 }}>
            {d.matchedAddress}
          </h2>
          <p style={{ fontSize: 12, color: C.text3, marginTop: 6 }}>
            Static view: annual benchmark snapshot &nbsp;·&nbsp; Dynamic view: operational + hazard-adjusted risk
          </p>
        </div>

        {/* ── Section A: Score hero + 3 mini cards ──────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 16, alignItems: 'stretch', marginBottom: 16 }}>

          {/* Score */}
          <div style={{ ...card, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <Label>Dynamic Risk Score</Label>
            <div>
              <Sp h={20} />
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                <span style={{ fontSize: 88, fontWeight: 900, color: C.text, letterSpacing: -5, lineHeight: 1 }}>
                  {d.score}
                </span>
                <span style={{ fontSize: 22, fontWeight: 300, color: C.text3 }}>/100</span>
              </div>
              <Sp h={10} />
              <Badge risk="high" large>{d.riskLabel}</Badge>
            </div>
            <div>
              <Sp h={20} />
              <div style={{ height: 1, background: C.border, marginBottom: 12 }} />
              <p style={{ fontSize: 11, color: C.text3, lineHeight: 1.5 }}>
                Operational underperformance and wildfire exposure are the primary risk drivers in this asset profile.
              </p>
            </div>
          </div>

          {/* Mini cards stacked */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {d.miniCards.map(({ label, value, risk, note, detail }) => {
              const open = expandedCards.has(label)
              const accentColor = risk === 'high' ? C.high : risk === 'mod' ? C.mod : C.low
              return (
                <div
                  key={label}
                  onClick={() => toggleCard(label)}
                  style={{
                    ...card, flex: 1, padding: '18px 22px',
                    borderLeft: `3px solid ${accentColor}`,
                    cursor: 'pointer',
                    transition: 'box-shadow 0.2s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)')}
                  onMouseLeave={e => (e.currentTarget.style.boxShadow = card.boxShadow)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: 11, color: C.text3, fontWeight: 600, marginBottom: 4 }}>{label}</div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: C.text }}>{value}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ textAlign: 'right' }}>
                        <Badge risk={risk}>{value}</Badge>
                        <div style={{ fontSize: 11, color: C.text3, marginTop: 4 }}>{note}</div>
                      </div>
                      <div style={{
                        width: 20, height: 20, borderRadius: '50%',
                        background: C.bg, border: `1px solid ${C.border}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        transition: 'transform 0.2s',
                        transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
                      }}>
                        <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                          <path d="M1.5 3L4 5.5L6.5 3" stroke={C.text3} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                  {open && (
                    <div style={{
                      marginTop: 14, paddingTop: 14,
                      borderTop: `1px solid ${C.border}`,
                      fontSize: 12, color: C.text2, lineHeight: 1.75,
                      animation: 'fadeUp 0.25s ease-out',
                    }}>
                      {detail}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* ── Section B: Score breakdown + Building data ─────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: 16, marginBottom: 16 }}>

          {/* Breakdown */}
          <div style={{ ...card }}>
            <Label style={{ marginBottom: 20 }}>Why this score</Label>
            {d.breakdown.map(({ label, delta, base, positive }) => (
              <div key={label} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '9px 0', borderBottom: `1px solid ${C.border}`,
              }}>
                <span style={{ fontSize: 12, color: C.text2 }}>{label}</span>
                <span style={{
                  fontSize: 12, fontWeight: 800, fontVariantNumeric: 'tabular-nums',
                  color: base ? C.text2 : positive ? C.low : C.high,
                }}>
                  {base ? delta : positive ? `−${Math.abs(delta)}` : `+${delta}`}
                </span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 12 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>Total</span>
              <span style={{ fontSize: 14, fontWeight: 900, color: C.text }}>{d.score} / 100</span>
            </div>
          </div>

          {/* Building data */}
          <div style={{ ...card }}>
            <Label style={{ marginBottom: 20 }}>Building Performance</Label>
            {Object.entries(d.building).map(([label, { v, risk }]) => (
              <DataRow key={label} label={label} value={v} risk={risk} />
            ))}
          </div>
        </div>

        {/* ── Section C: AI Underwriting Rationale ──────────────────────── */}
        <div style={{ ...card, marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
            <Label>AI Underwriting Rationale</Label>
            <span style={{
              fontSize: 10, fontWeight: 600, color: C.accentText,
              background: C.accentBg, padding: '2px 8px', borderRadius: 20,
            }}>
              Template mode
            </span>
          </div>
          <p style={{ fontSize: 14, color: C.text2, lineHeight: 1.85, maxWidth: 840, whiteSpace: 'pre-line' }}>
            {d.memo}
          </p>
        </div>

        {/* ── Section D: What-if analysis ────────────────────────────────── */}
        <div style={{
          background: '#fafaf9',
          border: `1px solid ${C.border}`,
          borderLeft: `3px solid ${C.accent}`,
          borderRadius: 16,
          padding: 28,
          marginBottom: 16,
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
            <div>
              <Label style={{ marginBottom: 8 }}>What-if analysis</Label>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: C.text, letterSpacing: -0.4 }}>
                What if the owner reduces risk?
              </h3>
            </div>

            {/* Live projection */}
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 11, color: C.text3, marginBottom: 6, fontWeight: 600 }}>Projected Score</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, justifyContent: 'flex-end' }}>
                <span style={{
                  fontSize: 48, fontWeight: 900, letterSpacing: -2, lineHeight: 1,
                  color: postureColor(projectedScore),
                  transition: 'color 0.3s ease',
                }}>
                  {projectedScore}
                </span>
                <span style={{ fontSize: 14, color: C.text3 }}>/100</span>
                {changed && (
                  <span style={{
                    fontSize: 13, fontWeight: 700,
                    color: C.low, marginLeft: 2,
                  }}>
                    ({totalDelta})
                  </span>
                )}
              </div>
              <div style={{ marginTop: 6, display: 'flex', gap: 6, justifyContent: 'flex-end', alignItems: 'center' }}>
                {changed && (
                  <>
                    <span style={{ fontSize: 11, color: C.text3 }}>
                      {postureLabel(d.score)}
                    </span>
                    <span style={{ fontSize: 11, color: C.text3 }}>→</span>
                  </>
                )}
                <span style={{
                  fontSize: 11, fontWeight: 700, padding: '2px 10px', borderRadius: 20,
                  color: postureColor(projectedScore),
                  background: postureBg(projectedScore),
                  transition: 'all 0.3s ease',
                }}>
                  {postureLabel(projectedScore)}
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 24 }}>

            {/* Energy slider */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: C.text }}>Energy efficiency improvement</span>
                <span style={{
                  fontSize: 12, fontWeight: 800, color: C.accent,
                  background: C.accentBg, padding: '1px 8px', borderRadius: 6,
                }}>
                  {energyPct}%
                </span>
              </div>
              <input
                type="range" min={0} max={20} step={1}
                value={energyPct}
                onChange={e => setEnergyPct(+e.target.value)}
                style={{ background: sliderBg((energyPct / 20) * 100) }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                <span style={{ fontSize: 10, color: C.text3 }}>0% (current)</span>
                <span style={{ fontSize: 10, color: C.text3 }}>20% improvement</span>
              </div>
              {energyPct > 0 && (
                <p style={{ fontSize: 11, color: C.low, marginTop: 6, fontWeight: 600 }}>
                  Score impact: {energyDelta} pts
                </p>
              )}
            </div>

            {/* Compliance toggle */}
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 10 }}>Compliance status</div>
              <Toggle
                value={compliance}
                onChange={setCompliance}
                options={[
                  { label: 'Delayed',  value: 'delayed' },
                  { label: 'Current',  value: 'current' },
                ]}
              />
              <p style={{ fontSize: 11, color: C.text3, marginTop: 8, lineHeight: 1.4 }}>
                Filing outstanding EBEWE reports restores compliance and unlocks ESG financing.
              </p>
              {compliance === 'current' && (
                <p style={{ fontSize: 11, color: C.low, marginTop: 4, fontWeight: 600 }}>
                  Score impact: −5 pts
                </p>
              )}
            </div>

            {/* Maintenance toggle */}
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 10 }}>Preventive maintenance visibility</div>
              <Toggle
                value={maintenance}
                onChange={setMaintenance}
                options={[
                  { label: 'Low',    value: 'low' },
                  { label: 'Medium', value: 'medium' },
                  { label: 'High',   value: 'high' },
                ]}
              />
              <p style={{ fontSize: 11, color: C.text3, marginTop: 8, lineHeight: 1.4 }}>
                Real-time fault detection and documented maintenance reduce lender risk premium.
              </p>
              {maintenance !== 'low' && (
                <p style={{ fontSize: 11, color: C.low, marginTop: 4, fontWeight: 600 }}>
                  Score impact: {maintDelta} pts
                </p>
              )}
            </div>
          </div>

          {changed && (
            <div style={{
              marginTop: 24, padding: '14px 18px',
              background: C.lowBg, border: `1px solid #bbf7d0`, borderRadius: 10,
            }}>
              <p style={{ fontSize: 13, color: C.low, fontWeight: 600 }}>
                With these changes, underwriting posture improves from <strong>{postureLabel(d.score)}</strong> to <strong>{postureLabel(projectedScore)}</strong> — a {Math.abs(totalDelta)}-point reduction in risk exposure.
              </p>
            </div>
          )}
        </div>

        {/* ── Section E: Recommended actions ────────────────────────────── */}
        <div style={{ ...card, marginBottom: 16 }}>
          <Label style={{ marginBottom: 24 }}>Recommended Actions</Label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20 }}>
            {d.actions.map(({ n, title, desc }) => (
              <div key={n} style={{
                border: `1px solid ${C.border}`, borderRadius: 12, padding: '20px 18px',
              }}>
                <div style={{
                  width: 30, height: 30, borderRadius: 8,
                  background: C.accentBg, color: C.accent,
                  fontSize: 11, fontWeight: 900, letterSpacing: 0.3,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 14,
                }}>
                  {n}
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 8, lineHeight: 1.3 }}>
                  {title}
                </div>
                <div style={{ fontSize: 12, color: C.text2, lineHeight: 1.65 }}>
                  {desc}
                </div>
              </div>
            ))}
          </div>

          <Sp h={24} />
          <div style={{
            padding: '16px 20px', background: C.bg, borderRadius: 10,
            border: `1px solid ${C.border}`,
          }}>
            <p style={{ fontSize: 13, color: C.text2, lineHeight: 1.7 }}>
              <span style={{ fontWeight: 700, color: C.text }}>BuiltRisk</span> turns static underwriting into a live portfolio-risk layer for asset owners —
              translating operational data and climate exposure into actionable, financeable intelligence.
            </p>
          </div>
        </div>

        <Sp h={48} />
        <p style={{ fontSize: 11, color: C.text3, textAlign: 'center' }}>
          BuiltRisk AI · Fifth Wall Prototype · Live geocoding · LA EBEWE benchmarks · FEMA NRI
        </p>
        <Sp h={56} />
      </Wrap>
    </div>
  )
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function BuiltRiskAI() {
  const [view,    setView]    = useState('landing')
  const [address, setAddress] = useState('')

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: GLOBAL }} />
      <div style={{ minHeight: '100vh', background: C.bg, color: C.text }}>
        {view === 'landing' && (
          <Landing onAnalyze={addr => { setAddress(addr); setView('processing') }} />
        )}
        {view === 'processing' && (
          <Processing address={address} onComplete={() => setView('match')} />
        )}
        {view === 'match' && (
          <Match onContinue={() => setView('results')} />
        )}
        {view === 'results' && (
          <Results address={address} onReset={() => { setAddress(''); setView('landing') }} />
        )}
      </div>
    </>
  )
}
