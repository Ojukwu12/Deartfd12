import { useState } from "react"

const T = {
  blue: '#378ADD', teal: '#1D9E75', red: '#E24B4A',
  amber: '#BA7517', purple: '#7F77DD', green: '#639922',
}

// ── MOCK DATA ──────────────────────────────────────────────────────────────

const MARKETS = [
  { marketId:'0x1a2', title:'Will Bitcoin reach $150k by Dec 2026?', categories:['Crypto'], currentPrices:[0.42,0.58], options:['Yes','No'], liquidity:2450000, volume24h:187000, endDate:'2026-12-31', active:true, resolved:false, polymarketUrl:'https://polymarket.com/event/will-bitcoin-reach-150k-by-dec-2026' },
  { marketId:'0x2b3', title:'Will the Fed cut rates in Q2 2026?', categories:['Finance'], currentPrices:[0.68,0.32], options:['Yes','No'], liquidity:1820000, volume24h:94000, endDate:'2026-06-30', active:true, resolved:false, polymarketUrl:'https://polymarket.com/event/will-the-fed-cut-rates-in-q2-2026' },
  { marketId:'0x3c4', title:'Will SpaceX land on Mars by 2030?', categories:['Science'], currentPrices:[0.28,0.72], options:['Yes','No'], liquidity:890000, volume24h:45000, endDate:'2030-12-31', active:true, resolved:false, polymarketUrl:'https://polymarket.com/event/will-spacex-land-on-mars-by-2030' },
  { marketId:'0x4d5', title:'Will AI reach AGI by end of 2027?', categories:['Technology'], currentPrices:[0.15,0.85], options:['Yes','No'], liquidity:3200000, volume24h:220000, endDate:'2027-12-31', active:true, resolved:false, polymarketUrl:'https://polymarket.com/event/will-ai-reach-agi-by-end-of-2027' },
  { marketId:'0x5e6', title:'Will Ethereum ETF surpass Bitcoin ETF in AUM?', categories:['Crypto'], currentPrices:[0.35,0.65], options:['Yes','No'], liquidity:1100000, volume24h:78000, endDate:'2026-12-31', active:true, resolved:false, polymarketUrl:'https://polymarket.com/event/will-ethereum-etf-surpass-bitcoin-etf' },
  { marketId:'0x6f7', title:'Will US enter recession in 2026?', categories:['Finance'], currentPrices:[0.44,0.56], options:['Yes','No'], liquidity:2100000, volume24h:156000, endDate:'2026-12-31', active:true, resolved:false, polymarketUrl:'https://polymarket.com/event/will-us-enter-recession-in-2026' },
]

const PREDICTIONS = [
  { id:'p001', marketId:'0x1a2', marketTitle:'Will Bitcoin reach $150k by Dec 2026?', status:'approved', marketProbability:42, aiProbability:38, confidencePct:78, aiSelection:'No', confidence:'high', timeframe:'monthly', rationale:'On-chain accumulation metrics remain strong, however macro headwinds from elevated interest rates and slowing ETF inflows reduce the probability of a breakout above $150k within this timeframe. The AI favors the downside scenario.' },
  { id:'p002', marketId:'0x2b3', marketTitle:'Will the Fed cut rates in Q2 2026?', status:'approved', marketProbability:68, aiProbability:72, confidencePct:82, aiSelection:'Yes', confidence:'high', timeframe:'weekly', rationale:'Recent CPI readings have trended below expectations for three consecutive months. Fed futures pricing and FOMC member commentary strongly signal a cut is being prepared, with Q2 as the most probable window.' },
  { id:'p003', marketId:'0x3c4', marketTitle:'Will SpaceX land on Mars by 2030?', status:'approved', marketProbability:28, aiProbability:22, confidencePct:65, aiSelection:'No', confidence:'medium', timeframe:'monthly', rationale:'While Starship development is progressing, a crewed Mars landing by 2030 requires a sequence of milestones — orbital refueling, life support, and transit — none of which have been demonstrated at scale. Timeline risk is high.' },
  { id:'p004', marketId:'0x4d5', marketTitle:'Will AI reach AGI by end of 2027?', status:'approved', marketProbability:15, aiProbability:18, confidencePct:58, aiSelection:'No', confidence:'low', timeframe:'monthly', rationale:'Current LLM architectures show scaling improvements but lack the generalized reasoning, embodied learning, and self-directed goal pursuit typically associated with AGI definitions. 2027 is an aggressive timeline given present benchmarks.' },
  { id:'p005', marketId:'0x5e6', marketTitle:'Will Ethereum ETF surpass Bitcoin ETF?', status:'approved', marketProbability:35, aiProbability:31, confidencePct:61, aiSelection:'No', confidence:'medium', timeframe:'weekly', rationale:'Bitcoin ETF AUM leads by a significant margin with institutional momentum firmly established. Ethereum ETF adoption is growing but at a pace that makes surpassing BTC ETF unlikely without a major catalyst shift.' },
  { id:'p006', marketId:'0x6f7', marketTitle:'Will US enter recession in 2026?', status:'approved', marketProbability:44, aiProbability:49, confidencePct:64, aiSelection:'Yes', confidence:'medium', timeframe:'monthly', rationale:'Leading indicators including yield curve inversion duration, ISM manufacturing contraction, and consumer credit stress point to elevated recession risk. The AI slightly upgrades the probability above market consensus.' },
]

const PERF = {
  summary:{ totalPredictions:42, resolvedPredictions:30, pendingPredictions:12, correctPredictions:19, incorrectPredictions:11, winRate:63.33 },
  correct:[
    { marketTitle:'Will BTC hit $100k?', predictedAnswer:'YES', actualAnswer:'YES', confidence:78 },
    { marketTitle:'Will Fed pause in Jan 2026?', predictedAnswer:'YES', actualAnswer:'YES', confidence:82 },
    { marketTitle:'Will ETH break $4k?', predictedAnswer:'NO', actualAnswer:'NO', confidence:74 },
  ],
  incorrect:[
    { marketTitle:'Will ETH ETF launch by June?', predictedAnswer:'YES', actualAnswer:'NO', confidence:69 },
    { marketTitle:'Will Nvidia hit $200?', predictedAnswer:'YES', actualAnswer:'NO', confidence:61 },
  ],
  pending:[
    { marketTitle:'Will Bitcoin reach $150k by Dec 2026?', option:'Yes', confidence:65 },
    { marketTitle:'Will AI reach AGI by 2027?', option:'No', confidence:71 },
  ]
}

// ── SHARED COMPONENTS ──────────────────────────────────────────────────────

const Badge = ({ children, color=T.blue, size=11 }) => (
  <span style={{ display:'inline-block', padding:'2px 7px', borderRadius:3, fontSize:size,
    fontWeight:500, fontFamily:'var(--font-mono)', background:color+'18', color, letterSpacing:'0.04em' }}>
    {children}
  </span>
)

const Stat = ({ label, value, sub, accent=T.blue }) => (
  <div style={{ background:'var(--color-background-secondary)', borderRadius:'var(--border-radius-md)',
    padding:'0.85rem 1rem', borderLeft:`3px solid ${accent}` }}>
    <p style={{ margin:'0 0 3px', fontSize:11, color:'var(--color-text-secondary)', fontFamily:'var(--font-mono)',
      textTransform:'uppercase', letterSpacing:'0.07em' }}>{label}</p>
    <p style={{ margin:'0 0 2px', fontSize:22, fontWeight:500, fontFamily:'var(--font-mono)', color:'var(--color-text-primary)' }}>{value}</p>
    {sub && <p style={{ margin:0, fontSize:11, color:'var(--color-text-tertiary)' }}>{sub}</p>}
  </div>
)

const ConfBadge = ({ c }) => {
  const map = { high:[T.teal,'▲ HIGH'], medium:[T.amber,'◆ MED'], low:[T.red,'▼ LOW'] }
  const [col, lbl] = map[c] || map.medium
  return <Badge color={col}>{lbl}</Badge>
}

const Bar = ({ pct, color }) => (
  <div style={{ height:4, background:'var(--color-border-tertiary)', borderRadius:2, overflow:'hidden', marginTop:3 }}>
    <div style={{ height:'100%', width:`${pct}%`, background:color, borderRadius:2 }} />
  </div>
)

const Hdr = ({ title }) => (
  <p style={{ margin:'0 0 1rem', fontSize:11, fontFamily:'var(--font-mono)', textTransform:'uppercase',
    letterSpacing:'0.1em', color:'var(--color-text-secondary)', fontWeight:500 }}>{title}</p>
)

const Divider = () => <div style={{ height:'0.5px', background:'var(--color-border-tertiary)', margin:'1rem 0' }} />

const Card = ({ children, borderColor, style={} }) => (
  <div style={{ background:'var(--color-background-primary)', border:`0.5px solid ${borderColor||'var(--color-border-tertiary)'}`,
    borderRadius:'var(--border-radius-lg)', padding:'1.25rem', ...style }}>
    {children}
  </div>
)

const Code = ({ children }) => (
  <pre style={{ margin:'0 0 1rem', padding:'1rem', background:'var(--color-background-secondary)',
    borderRadius:6, fontSize:11, fontFamily:'var(--font-mono)', lineHeight:1.75,
    color:'var(--color-text-primary)', overflow:'auto', border:'0.5px solid var(--color-border-tertiary)',
    whiteSpace:'pre-wrap', wordBreak:'break-word' }}>{children}</pre>
)

const FilterBtn = ({ label, active, color=T.blue, onClick }) => (
  <button onClick={onClick} style={{ padding:'3px 10px', borderRadius:3, fontSize:11, cursor:'pointer',
    fontFamily:'var(--font-mono)', border:`0.5px solid ${active?color:'var(--color-border-tertiary)'}`,
    background:active?color+'18':'transparent', color:active?color:'var(--color-text-secondary)' }}>
    {label}
  </button>
)

// ── PUBLIC PAGES ───────────────────────────────────────────────────────────

function HomePage({ nav }) {
  return (
    <div>
      <div style={{ padding:'1.5rem 0 1.25rem', borderBottom:'0.5px solid var(--color-border-tertiary)', marginBottom:'1.25rem' }}>
        <div style={{ display:'flex', alignItems:'baseline', gap:10, marginBottom:6 }}>
          <h1 style={{ margin:0, fontSize:26, fontWeight:500, letterSpacing:'-0.03em' }}>Prediction Intelligence</h1>
          <Badge color={T.teal} size={10}>LIVE</Badge>
        </div>
        <p style={{ margin:0, color:'var(--color-text-secondary)', fontSize:13, maxWidth:520, lineHeight:1.6 }}>
          AI-generated probability analysis across active prediction markets. Transparent, performance-tracked, publicly readable.
        </p>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10, marginBottom:'1.5rem' }}>
        <Stat label="Win Rate (30d)" value="63.3%" sub="19/30 resolved" accent={T.teal} />
        <Stat label="Active Markets" value="847" sub="6 categories" accent={T.blue} />
        <Stat label="Predictions" value="1,847" sub="42 this month" accent={T.purple} />
        <Stat label="Avg Confidence" value="71%" sub="34% high conf." accent={T.amber} />
      </div>

      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.75rem' }}>
        <Hdr title="Trending Markets" />
        <button onClick={()=>nav('markets')} style={{ fontSize:12, color:T.blue, background:'none', border:'none', cursor:'pointer', padding:0 }}>All markets →</button>
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:7, marginBottom:'1.5rem' }}>
        {MARKETS.slice(0,4).map(m=>(
          <div key={m.marketId} onClick={()=>nav('market',{id:m.marketId})} style={{
            background:'var(--color-background-primary)', border:'0.5px solid var(--color-border-tertiary)',
            borderRadius:'var(--border-radius-md)', padding:'11px 14px', cursor:'pointer',
            display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ flex:1 }}>
              <p style={{ margin:'0 0 4px', fontSize:13, fontWeight:500 }}>{m.title}</p>
              <div style={{ display:'flex', gap:6, alignItems:'center' }}>
                <Badge color={T.blue} size={10}>{m.categories[0]}</Badge>
                <span style={{ fontSize:11, color:'var(--color-text-tertiary)', fontFamily:'var(--font-mono)' }}>
                  Vol 24h: ${(m.volume24h/1000).toFixed(0)}k · Liq: ${(m.liquidity/1000000).toFixed(1)}M
                </span>
              </div>
            </div>
            <div style={{ textAlign:'right', minWidth:70 }}>
              <p style={{ margin:'0 0 1px', fontSize:18, fontWeight:500, fontFamily:'var(--font-mono)', color:T.teal }}>{(m.currentPrices[0]*100).toFixed(0)}¢</p>
              <p style={{ margin:0, fontSize:10, color:'var(--color-text-tertiary)', fontFamily:'var(--font-mono)' }}>YES</p>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.75rem' }}>
        <Hdr title="Recent AI Predictions" />
        <button onClick={()=>nav('predictions')} style={{ fontSize:12, color:T.blue, background:'none', border:'none', cursor:'pointer', padding:0 }}>All predictions →</button>
      </div>
      {PREDICTIONS.slice(0,4).map(p=>(
        <div key={p.id} style={{ display:'flex', gap:10, padding:'9px 0', borderBottom:'0.5px solid var(--color-border-tertiary)', alignItems:'center' }}>
          <ConfBadge c={p.confidence} />
          <div style={{ flex:1 }}>
            <a href={MARKETS.find(m=>m.marketId===p.marketId)?.polymarketUrl||'#'} target="_blank" rel="noopener noreferrer" style={{ textDecoration:'none' }}>
              <p style={{ margin:0, fontSize:12, color:'var(--color-text-primary)' }}>{p.marketTitle} <span style={{ fontSize:10, color:T.blue }}>↗</span></p>
            </a>
          </div>
          <div style={{ textAlign:'right', fontFamily:'var(--font-mono)', fontSize:11, display:'flex', alignItems:'center', gap:8 }}>
            <span style={{ fontSize:15, fontWeight:500, color:p.aiSelection==='Yes'?T.teal:T.red }}>{p.aiSelection}</span>
            <span style={{ color:T.blue, fontWeight:500 }}>{p.confidencePct}%</span>
          </div>
        </div>
      ))}
    </div>
  )
}

function MarketsPage({ nav }) {
  const [cat, setCat] = useState('All')
  const [q, setQ] = useState('')
  const cats = ['All','Crypto','Finance','Science','Technology']
  const filtered = MARKETS.filter(m=>(cat==='All'||m.categories.includes(cat))&&(q===''||m.title.toLowerCase().includes(q.toLowerCase())))
  return (
    <div>
      <Hdr title={`Markets — ${filtered.length} results`} />
      <div style={{ display:'flex', gap:8, marginBottom:'1rem' }}>
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search markets..." style={{ flex:1, fontSize:13 }} />
      </div>
      <div style={{ display:'flex', gap:5, flexWrap:'wrap', marginBottom:'1.25rem' }}>
        {cats.map(c=><FilterBtn key={c} label={c} active={cat===c} onClick={()=>setCat(c)} />)}
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
        {filtered.map(m=>(
          <div key={m.marketId} onClick={()=>nav('market',{id:m.marketId})} style={{
            background:'var(--color-background-primary)', border:'0.5px solid var(--color-border-tertiary)',
            borderRadius:'var(--border-radius-md)', padding:'13px 15px', cursor:'pointer' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:14 }}>
              <div style={{ flex:1 }}>
                <p style={{ margin:'0 0 8px', fontSize:13, fontWeight:500 }}>{m.title}</p>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, maxWidth:300 }}>
                  {m.options.map((opt,i)=>(
                    <div key={opt}>
                      <div style={{ display:'flex', justifyContent:'space-between', fontSize:11 }}>
                        <span style={{ color:'var(--color-text-secondary)' }}>{opt}</span>
                        <span style={{ fontFamily:'var(--font-mono)', fontWeight:500, color:i===0?T.teal:T.red }}>{(m.currentPrices[i]*100).toFixed(0)}¢</span>
                      </div>
                      <Bar pct={m.currentPrices[i]*100} color={i===0?T.teal:T.red} />
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ textAlign:'right', fontFamily:'var(--font-mono)', minWidth:90 }}>
                <p style={{ margin:'0 0 3px', fontSize:10, color:'var(--color-text-tertiary)', textTransform:'uppercase', letterSpacing:'0.06em' }}>Liquidity</p>
                <p style={{ margin:'0 0 2px', fontSize:15, fontWeight:500 }}>${(m.liquidity/1000000).toFixed(1)}M</p>
                <p style={{ margin:'0 0 5px', fontSize:10, color:'var(--color-text-tertiary)' }}>Vol: ${(m.volume24h/1000).toFixed(0)}k/24h</p>
                <Badge color={T.blue} size={10}>{m.categories[0]}</Badge>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function MarketDetailPage({ marketId, nav }) {
  const m = MARKETS.find(x=>x.marketId===marketId)||MARKETS[0]
  const pred = PREDICTIONS.find(p=>p.marketId===m.marketId)
  const delta = pred ? Math.abs(pred.aiProbability-pred.marketProbability) : 0
  return (
    <div>
      <button onClick={()=>nav('markets')} style={{ fontSize:12, color:T.blue, background:'none', border:'none', cursor:'pointer', padding:'0 0 1rem' }}>← Markets</button>
      <Card style={{ marginBottom:'1rem' }}>
        <div style={{ display:'flex', gap:6, marginBottom:8 }}>
          <Badge color={T.blue} size={10}>{m.categories[0]}</Badge>
          {m.active&&<Badge color={T.teal} size={10}>● ACTIVE</Badge>}
          <Badge color={T.amber} size={10}>Closes {m.endDate}</Badge>
        </div>
        <a href={m.polymarketUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration:'none', color:'inherit' }}>
          <h2 style={{ margin:'0 0 4px', fontSize:17, fontWeight:500, lineHeight:1.35, cursor:'pointer' }}>{m.title}</h2>
          <p style={{ margin:'0 0 1rem', fontSize:11, color:T.blue, fontFamily:'var(--font-mono)' }}>View on Polymarket ↗</p>
        </a>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:'1rem' }}>
          {[['Liquidity',`$${(m.liquidity/1000000).toFixed(2)}M`],['24h Volume',`$${(m.volume24h/1000).toFixed(0)}k`]].map(([l,v])=>(
            <div key={l}>
              <p style={{ margin:'0 0 1px', fontSize:10, color:'var(--color-text-tertiary)', fontFamily:'var(--font-mono)', textTransform:'uppercase', letterSpacing:'0.06em' }}>{l}</p>
              <p style={{ margin:0, fontSize:13, fontWeight:500, fontFamily:'var(--font-mono)' }}>{v}</p>
            </div>
          ))}
        </div>
        <Divider />
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          {m.options.map((opt,i)=>(
            <div key={opt} style={{ padding:'12px', border:`0.5px solid ${i===0?T.teal:T.red}`, borderRadius:'var(--border-radius-md)', background:(i===0?T.teal:T.red)+'0a' }}>
              <p style={{ margin:'0 0 4px', fontSize:11, fontFamily:'var(--font-mono)', color:'var(--color-text-secondary)', textTransform:'uppercase' }}>{opt}</p>
              <p style={{ margin:0, fontSize:26, fontWeight:500, fontFamily:'var(--font-mono)', color:i===0?T.teal:T.red }}>{(m.currentPrices[i]*100).toFixed(0)}¢</p>
              <p style={{ margin:'2px 0 0', fontSize:11, color:'var(--color-text-tertiary)' }}>implied {(m.currentPrices[i]*100).toFixed(1)}% prob.</p>
            </div>
          ))}
        </div>
      </Card>

      {pred ? (
        <Card borderColor={T.blue}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1rem' }}>
            <span style={{ fontSize:11, fontFamily:'var(--font-mono)', textTransform:'uppercase', letterSpacing:'0.08em', color:T.blue }}>AI Prediction Analysis</span>
            <ConfBadge c={pred.confidence} />
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14, marginBottom:'1rem' }}>
            <div>
              <p style={{ margin:'0 0 3px', fontSize:10, color:'var(--color-text-tertiary)', fontFamily:'var(--font-mono)', textTransform:'uppercase' }}>AI Selection</p>
              <p style={{ margin:0, fontSize:28, fontWeight:500, fontFamily:'var(--font-mono)', color:pred.aiSelection==='Yes'?T.teal:T.red }}>{pred.aiSelection}</p>
              <p style={{ margin:'2px 0 0', fontSize:11, color:'var(--color-text-tertiary)' }}>AI-selected outcome</p>
            </div>
            <div>
              <p style={{ margin:'0 0 3px', fontSize:10, color:'var(--color-text-tertiary)', fontFamily:'var(--font-mono)', textTransform:'uppercase' }}>AI Confidence</p>
              <p style={{ margin:0, fontSize:28, fontWeight:500, fontFamily:'var(--font-mono)', color:T.blue }}>{pred.confidencePct}%</p>
              <p style={{ margin:'2px 0 0', fontSize:11, color:'var(--color-text-tertiary)' }}>confidence level</p>
            </div>
            <div>
              <p style={{ margin:'0 0 3px', fontSize:10, color:'var(--color-text-tertiary)', fontFamily:'var(--font-mono)', textTransform:'uppercase' }}>Market Consensus</p>
              <p style={{ margin:0, fontSize:28, fontWeight:500, fontFamily:'var(--font-mono)' }}>{pred.marketProbability}%</p>
              <p style={{ margin:'2px 0 0', fontSize:11, color:'var(--color-text-tertiary)' }}>implied from price</p>
            </div>
          </div>
          {delta>3&&(
            <div style={{ padding:'9px 12px', background:T.amber+'12', border:`0.5px solid ${T.amber}`, borderRadius:5, marginBottom:'1rem' }}>
              <p style={{ margin:0, fontSize:12, color:T.amber }}>
                ◆ AI-market divergence: {delta}pp — AI is {pred.aiProbability>pred.marketProbability?'more bullish':'more bearish'} than market consensus
              </p>
            </div>
          )}
          <div style={{ padding:'12px 14px', background:'var(--color-background-secondary)', borderRadius:'var(--border-radius-md)', borderLeft:`3px solid ${T.blue}` }}>
            <p style={{ margin:'0 0 6px', fontSize:10, color:'var(--color-text-tertiary)', fontFamily:'var(--font-mono)', textTransform:'uppercase', letterSpacing:'0.07em' }}>AI Rationale</p>
            <p style={{ margin:0, fontSize:13, color:'var(--color-text-secondary)', lineHeight:1.65 }}>{pred.rationale}</p>
          </div>
        </Card>
      ) : (
        <div style={{ padding:'2.5rem', textAlign:'center', border:'0.5px dashed var(--color-border-secondary)', borderRadius:'var(--border-radius-md)' }}>
          <p style={{ margin:0, fontSize:13, color:'var(--color-text-tertiary)' }}>No AI prediction available for this market yet.</p>
        </div>
      )}
    </div>
  )
}

function PredictionsPage() {
  const [timeFilter, setTimeFilter] = useState('all')
  const filtered = PREDICTIONS.filter(p=>timeFilter==='all'||p.timeframe===timeFilter)
  return (
    <div>
      <Hdr title="AI Predictions" />
      <div style={{ display:'flex', gap:5, flexWrap:'wrap', marginBottom:'1.25rem' }}>
        {['all','daily','weekly','monthly'].map(t=><FilterBtn key={t} label={t} active={timeFilter===t} color={T.purple} onClick={()=>setTimeFilter(t)} />)}
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:7 }}>
        {filtered.map(p=>(
          <div key={p.id} style={{ background:'var(--color-background-primary)', border:'0.5px solid var(--color-border-tertiary)',
            borderRadius:'var(--border-radius-md)', padding:'11px 14px', display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ display:'flex', gap:5, flexDirection:'column', minWidth:65, alignItems:'center' }}>
              <ConfBadge c={p.confidence} />
              <span style={{ fontSize:18, fontWeight:500, fontFamily:'var(--font-mono)', color:p.aiSelection==='Yes'?T.teal:T.red }}>{p.aiSelection}</span>
            </div>
            <div style={{ flex:1 }}>
              <a href={MARKETS.find(m=>m.marketId===p.marketId)?.polymarketUrl||'#'} target="_blank" rel="noopener noreferrer"
                style={{ textDecoration:'none' }} onClick={e=>e.stopPropagation()}>
                <p style={{ margin:'0 0 3px', fontSize:13, fontWeight:500, color:'var(--color-text-primary)' }}>{p.marketTitle} <span style={{ fontSize:10, color:T.blue }}>↗</span></p>
              </a>
              <div style={{ display:'flex', gap:5 }}>
                <Badge color={T.purple} size={10}>{p.timeframe}</Badge>
              </div>
            </div>
            <div style={{ textAlign:'right', fontFamily:'var(--font-mono)' }}>
              <div style={{ fontSize:20, fontWeight:500, color:T.blue }}>{p.confidencePct}%</div>
              <div style={{ fontSize:10, color:'var(--color-text-tertiary)', textTransform:'uppercase', letterSpacing:'0.04em' }}>confidence</div>
              <div style={{ fontSize:11, marginTop:2, color:Math.abs(p.aiProbability-p.marketProbability)>5?T.amber:'var(--color-text-tertiary)' }}>
                {p.aiProbability>p.marketProbability?'▲':'▼'}{Math.abs(p.aiProbability-p.marketProbability)}pp vs mkt
              </div>
            </div>
          </div>
        ))}
      </div>
      {filtered.length===0&&<p style={{ textAlign:'center', color:'var(--color-text-tertiary)', padding:'2.5rem 0', fontSize:13 }}>No predictions match these filters.</p>}
    </div>
  )
}

function PerformancePage() {
  const s = PERF.summary
  return (
    <div>
      <Hdr title="Prediction Performance — 30 Day Window" />
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, marginBottom:'1.5rem' }}>
        <Stat label="Win Rate" value={`${s.winRate.toFixed(1)}%`} sub={`${s.correctPredictions}/${s.resolvedPredictions} resolved`} accent={T.teal} />
        <Stat label="Total Predictions" value={s.totalPredictions} sub={`${s.pendingPredictions} pending`} accent={T.blue} />
        <Stat label="Incorrect" value={s.incorrectPredictions} sub="failed predictions" accent={T.red} />
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem', marginBottom:'1rem' }}>
        <Card>
          <p style={{ margin:'0 0 1rem', fontSize:11, fontFamily:'var(--font-mono)', textTransform:'uppercase', letterSpacing:'0.08em', color:T.teal }}>▲ Correct ({PERF.correct.length})</p>
          {PERF.correct.map((p,i)=>(
            <div key={i} style={{ padding:'8px 0', borderBottom:i<PERF.correct.length-1?'0.5px solid var(--color-border-tertiary)':'none' }}>
              <p style={{ margin:'0 0 3px', fontSize:12, fontWeight:500 }}>{p.marketTitle}</p>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <span style={{ fontSize:11, color:'var(--color-text-tertiary)', fontFamily:'var(--font-mono)' }}>{p.predictedAnswer}→{p.actualAnswer}</span>
                <Badge color={T.teal} size={10}>{p.confidence}%</Badge>
              </div>
            </div>
          ))}
        </Card>
        <Card>
          <p style={{ margin:'0 0 1rem', fontSize:11, fontFamily:'var(--font-mono)', textTransform:'uppercase', letterSpacing:'0.08em', color:T.red }}>▼ Incorrect ({PERF.incorrect.length})</p>
          {PERF.incorrect.map((p,i)=>(
            <div key={i} style={{ padding:'8px 0', borderBottom:i<PERF.incorrect.length-1?'0.5px solid var(--color-border-tertiary)':'none' }}>
              <p style={{ margin:'0 0 3px', fontSize:12, fontWeight:500 }}>{p.marketTitle}</p>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <span style={{ fontSize:11, color:'var(--color-text-tertiary)', fontFamily:'var(--font-mono)' }}>{p.predictedAnswer}→{p.actualAnswer}</span>
                <Badge color={T.red} size={10}>{p.confidence}%</Badge>
              </div>
            </div>
          ))}
        </Card>
      </div>
      <Card>
        <p style={{ margin:'0 0 1rem', fontSize:11, fontFamily:'var(--font-mono)', textTransform:'uppercase', letterSpacing:'0.08em', color:T.amber }}>◆ Pending Resolution ({PERF.pending.length})</p>
        {PERF.pending.map((p,i)=>(
          <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'7px 0', borderBottom:i<PERF.pending.length-1?'0.5px solid var(--color-border-tertiary)':'none' }}>
            <span style={{ fontSize:12 }}>{p.marketTitle} — <span style={{ color:'var(--color-text-secondary)' }}>{p.option}</span></span>
            <Badge color={T.amber} size={10}>{p.confidence}%</Badge>
          </div>
        ))}
      </Card>
    </div>
  )
}

function NotificationsPage() {
  const [tab, setTab] = useState('email')
  const [email, setEmail] = useState('')
  const [conf, setConf] = useState(70)
  const [done, setDone] = useState(false)
  const [prefType, setPrefType] = useState('email')

  return (
    <div>
      <Hdr title="Notifications" />
      <div style={{ display:'flex', gap:5, marginBottom:'1.5rem' }}>
        {['email','push','preferences'].map(t=><FilterBtn key={t} label={t} active={tab===t} onClick={()=>{setTab(t);setDone(false)}} />)}
      </div>

      {tab==='email'&&(
        <div style={{ maxWidth:460 }}>
          <Card>
            {done?(
              <div style={{ textAlign:'center', padding:'1.5rem 0' }}>
                <p style={{ margin:'0 0 4px', fontSize:20, color:T.teal }}>✓</p>
                <p style={{ margin:'0 0 4px', fontWeight:500, fontSize:14 }}>Verify your email</p>
                <p style={{ margin:'0 0 1rem', fontSize:12, color:'var(--color-text-secondary)' }}>Link sent to {email}</p>
                <button onClick={()=>setDone(false)} style={{ fontSize:12, color:T.blue, background:'none', border:'none', cursor:'pointer' }}>Subscribe another →</button>
              </div>
            ):(
              <>
                <Hdr title="Email Subscription" />
                <div style={{ marginBottom:10 }}>
                  <label style={{ display:'block', fontSize:11, color:'var(--color-text-secondary)', marginBottom:3 }}>Email address *</label>
                  <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" style={{ width:'100%', fontSize:13 }} />
                </div>
                <div style={{ marginBottom:10 }}>
                  <label style={{ display:'block', fontSize:11, color:'var(--color-text-secondary)', marginBottom:5 }}>
                    Min confidence: <span style={{ fontFamily:'var(--font-mono)', color:T.blue }}>{conf}%</span>
                  </label>
                  <input type="range" min="50" max="95" step="5" value={conf} onChange={e=>setConf(+e.target.value)} style={{ width:'100%' }} />
                </div>
                <div style={{ marginBottom:'1rem', padding:'9px 11px', background:'var(--color-background-secondary)', borderRadius:5, fontSize:11, color:'var(--color-text-secondary)' }}>
                  ◆ Email frequency is always monthly — enforced server-side regardless of payload.
                </div>
                <button onClick={()=>email.includes('@')&&setDone(true)} style={{ width:'100%', padding:'9px', borderRadius:5, fontSize:12,
                  background:T.blue+'18', border:`0.5px solid ${T.blue}`, color:T.blue, cursor:'pointer', fontWeight:500, fontFamily:'var(--font-mono)' }}>
                  Subscribe →
                </button>
              </>
            )}
          </Card>
        </div>
      )}

      {tab==='push'&&(
        <div style={{ maxWidth:460 }}>
          <Card>
            <Hdr title="Push Notifications" />
            <p style={{ margin:'0 0 1rem', fontSize:13, color:'var(--color-text-secondary)', lineHeight:1.6 }}>
              Browser push notifications for real-time prediction alerts. Uses Web Push API with VAPID keys fetched from the backend.
            </p>
            <div style={{ marginBottom:'1rem', padding:'9px 11px', background:'var(--color-background-secondary)', borderRadius:5, fontSize:12, color:'var(--color-text-secondary)' }}>
              Real-time prediction alerts delivered to your browser. No account required.
            </div>
            <button style={{ width:'100%', padding:'9px', borderRadius:5, fontSize:12,
              background:T.purple+'18', border:`0.5px solid ${T.purple}`, color:T.purple, cursor:'pointer', fontWeight:500, fontFamily:'var(--font-mono)' }}>
              Enable Push Notifications →
            </button>
          </Card>
          <div style={{ marginTop:'1rem', maxWidth:460 }}>
            <Card>
              <Hdr title="Unsubscribe from Push" />
              <input placeholder="Push endpoint URL" style={{ width:'100%', fontSize:13, marginBottom:10 }} />
              <button style={{ padding:'7px 14px', borderRadius:5, fontSize:12,
                background:T.red+'18', border:`0.5px solid ${T.red}`, color:T.red, cursor:'pointer', fontFamily:'var(--font-mono)' }}>
                Unsubscribe
              </button>
            </Card>
          </div>
        </div>
      )}

      {tab==='preferences'&&(
        <div style={{ maxWidth:460 }}>
          <Card>
            <Hdr title="Update Preferences" />
            <div style={{ marginBottom:10 }}>
              <label style={{ display:'block', fontSize:11, color:'var(--color-text-secondary)', marginBottom:3 }}>Type</label>
              <select value={prefType} onChange={e=>setPrefType(e.target.value)} style={{ width:'100%', fontSize:13 }}>
                <option value="email">email</option>
                <option value="push">push</option>
              </select>
            </div>
            <div style={{ marginBottom:10 }}>
              <label style={{ display:'block', fontSize:11, color:'var(--color-text-secondary)', marginBottom:3 }}>
                {prefType==='email'?'Email address':'Push endpoint'}
              </label>
              <input placeholder={prefType==='email'?'user@example.com':'https://push-service/...'} style={{ width:'100%', fontSize:13 }} />
            </div>
            <div style={{ marginBottom:'1rem' }}>
              <label style={{ display:'block', fontSize:11, color:'var(--color-text-secondary)', marginBottom:5 }}>
                Min confidence: <span style={{ fontFamily:'var(--font-mono)', color:T.blue }}>{conf}%</span>
              </label>
              <input type="range" min="50" max="95" step="5" value={conf} onChange={e=>setConf(+e.target.value)} style={{ width:'100%' }} />
            </div>
            <button style={{ width:'100%', padding:'9px', borderRadius:5, fontSize:12,
              background:T.teal+'18', border:`0.5px solid ${T.teal}`, color:T.teal, cursor:'pointer', fontWeight:500, fontFamily:'var(--font-mono)' }}>
              Save Preferences →
            </button>
          </Card>
        </div>
      )}
    </div>
  )
}

// ── ADMIN PAGES ────────────────────────────────────────────────────────────

function AdminLoginPage({ onAuth }) {
  const [ak, setAk] = useState('')
  const [sk, setSk] = useState('')
  const [err, setErr] = useState('')
  const login = () => ak.length>4&&sk.length>4 ? onAuth() : setErr('Both X-API-Key and x-admin-key are required.')
  return (
    <div style={{ maxWidth:400, margin:'2rem auto' }}>
      <Card borderColor={T.red}>
        <div style={{ marginBottom:'1.25rem' }}>
          <p style={{ margin:'0 0 4px', fontSize:11, fontFamily:'var(--font-mono)', textTransform:'uppercase', letterSpacing:'0.08em', color:T.red }}>⚠ Admin Authentication</p>
          <p style={{ margin:0, fontSize:12, color:'var(--color-text-secondary)', lineHeight:1.6 }}>
            Dual-header required. Keys are held in memory only — never written to localStorage or sessionStorage.
          </p>
        </div>
        <div style={{ marginBottom:10 }}>
          <label style={{ display:'block', fontSize:10, fontFamily:'var(--font-mono)', textTransform:'uppercase', letterSpacing:'0.06em', color:'var(--color-text-tertiary)', marginBottom:3 }}>X-API-Key</label>
          <input type="password" value={ak} onChange={e=>{setAk(e.target.value);setErr('')}} placeholder="Admin API key" style={{ width:'100%', fontSize:13, fontFamily:'var(--font-mono)' }} />
        </div>
        <div style={{ marginBottom:'1rem' }}>
          <label style={{ display:'block', fontSize:10, fontFamily:'var(--font-mono)', textTransform:'uppercase', letterSpacing:'0.06em', color:'var(--color-text-tertiary)', marginBottom:3 }}>x-admin-key</label>
          <input type="password" value={sk} onChange={e=>{setSk(e.target.value);setErr('')}} placeholder="Server admin secret" style={{ width:'100%', fontSize:13, fontFamily:'var(--font-mono)' }} />
        </div>
        {err&&<p style={{ margin:'0 0 10px', fontSize:11, color:T.red, fontFamily:'var(--font-mono)' }}>{err}</p>}
        <button onClick={login} style={{ width:'100%', padding:'9px', borderRadius:5, fontSize:12,
          background:T.red+'18', border:`0.5px solid ${T.red}`, color:T.red, cursor:'pointer', fontWeight:500, fontFamily:'var(--font-mono)' }}>
          Access Admin Panel →
        </button>
        <div style={{ marginTop:'0.75rem', padding:'8px 10px', background:'var(--color-background-secondary)', borderRadius:5 }}>
          <p style={{ margin:0, fontSize:10, color:'var(--color-text-tertiary)', lineHeight:1.5 }}>
            Both headers are attached per-request to admin routes only. Public client never receives admin keys. Keys clear on logout.
          </p>
        </div>
      </Card>
    </div>
  )
}

function AdminDashboard({ nav }) {
  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:'1.25rem' }}>
        <Hdr title="Admin Dashboard" />
        <Badge color={T.red} size={10}>RESTRICTED</Badge>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, marginBottom:'1.5rem' }}>
        <Stat label="Total Predictions" value="1,847" accent={T.blue} />
        <Stat label="Pending Review" value="2" sub="awaiting moderation" accent={T.amber} />
        <Stat label="Approved Today" value="8" accent={T.teal} />
        <Stat label="Cache Hit Rate" value="74.2%" accent={T.purple} />
        <Stat label="System Uptime" value="14d 6h" accent={T.teal} />
        <Stat label="API Calls (total)" value="5,203" accent={T.blue} />
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
        {[
          {label:'Prediction Moderation',desc:'Review, approve, reject predictions',route:'admin-predictions',color:T.amber},
          {label:'Cache Management',desc:'Clear expired / all / prediction cache',route:'admin-cache',color:T.blue},
          {label:'External Data Health',desc:'Source connectivity & signal metrics',route:'admin-external',color:T.teal},
          {label:'System Metrics',desc:'Requests, cache, error rates',route:'admin-metrics',color:T.purple},
        ].map(i=>(
          <div key={i.route} onClick={()=>nav(i.route)} style={{
            background:'var(--color-background-primary)', border:'0.5px solid var(--color-border-tertiary)',
            borderLeft:`3px solid ${i.color}`, borderRadius:'var(--border-radius-md)', padding:'12px 14px', cursor:'pointer' }}>
            <p style={{ margin:'0 0 3px', fontSize:13, fontWeight:500 }}>{i.label}</p>
            <p style={{ margin:0, fontSize:11, color:'var(--color-text-tertiary)' }}>{i.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function AdminPredictions() {
  const [preds, setPreds] = useState(PREDICTIONS.map(p=>({...p})))
  const act = (id, status) => setPreds(ps=>ps.map(p=>p.id===id?{...p,status}:p))
  return (
    <div>
      <Hdr title="Prediction Moderation · GET /admin/predictions" />
      <div style={{ display:'flex', flexDirection:'column', gap:7 }}>
        {preds.map(p=>(
          <div key={p.id} style={{ background:'var(--color-background-primary)', border:'0.5px solid var(--color-border-tertiary)', borderRadius:'var(--border-radius-md)', padding:'11px 14px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:10, marginBottom:p.status==='pending'?8:0 }}>
              <div style={{ flex:1 }}>
                <p style={{ margin:'0 0 4px', fontSize:13, fontWeight:500 }}>{p.marketTitle}</p>
                <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
                  <ConfBadge c={p.confidence} />
                  <Badge color={T.purple} size={10}>{p.timeframe}</Badge>
                  <span style={{ fontSize:11, color:'var(--color-text-tertiary)', fontFamily:'var(--font-mono)' }}>AI {p.aiProbability}% / Mkt {p.marketProbability}%</span>
                </div>
              </div>
              <Badge color={p.status==='approved'?T.teal:p.status==='rejected'?T.red:T.amber}>{p.status.toUpperCase()}</Badge>
            </div>
            {p.status==='pending'&&(
              <div style={{ display:'flex', gap:6 }}>
                <button onClick={()=>act(p.id,'approved')} style={{ padding:'4px 12px', fontSize:11, cursor:'pointer', borderRadius:3,
                  border:`0.5px solid ${T.teal}`, background:T.teal+'18', color:T.teal, fontFamily:'var(--font-mono)' }}>Approve ✓</button>
                <button onClick={()=>act(p.id,'rejected')} style={{ padding:'4px 12px', fontSize:11, cursor:'pointer', borderRadius:3,
                  border:`0.5px solid ${T.red}`, background:T.red+'18', color:T.red, fontFamily:'var(--font-mono)' }}>Reject ✗</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function AdminCache() {
  const [cleared, setCleared] = useState(null)
  return (
    <div>
      <Hdr title="Cache Management" />
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, marginBottom:'1.25rem' }}>
        <Stat label="Memory Keys" value="42" accent={T.blue} />
        <Stat label="DB Active" value="15" accent={T.teal} />
        <Stat label="Hit Rate" value="74.2%" accent={T.purple} />
      </div>
      <Card>
        <Hdr title="POST /admin/cache/clear" />
        {['all','expired','predictions'].map((type,i,arr)=>(
          <div key={type} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 0', borderBottom:i<arr.length-1?'0.5px solid var(--color-border-tertiary)':'none' }}>
            <div>
              <p style={{ margin:'0 0 2px', fontSize:13, fontFamily:'var(--font-mono)' }}>type: "{type}"</p>
              <p style={{ margin:0, fontSize:11, color:'var(--color-text-tertiary)' }}>
                {type==='all'?'Clear all cached data':type==='expired'?'Remove only expired entries':'Clear prediction cache'}
              </p>
            </div>
            <button onClick={()=>setCleared(type)} style={{ padding:'5px 12px', fontSize:11, cursor:'pointer', borderRadius:3,
              border:`0.5px solid ${cleared===type?T.teal:T.amber}`, background:cleared===type?T.teal+'18':T.amber+'18',
              color:cleared===type?T.teal:T.amber, fontFamily:'var(--font-mono)' }}>
              {cleared===type?'✓ Done':'Clear →'}
            </button>
          </div>
        ))}
      </Card>
    </div>
  )
}

function AdminExternal() {
  const sources = [
    {name:'sports',status:'healthy',rt:412,calls:21,errors:2},
    {name:'financial',status:'healthy',rt:188,calls:30,errors:2},
    {name:'geopolitical',status:'unconfigured',rt:null,calls:11,errors:2},
    {name:'corporate',status:'healthy',rt:229,calls:8,errors:0},
  ]
  const sc = s=>s==='healthy'?T.teal:T.amber
  const sl = s=>s==='healthy'?'● HEALTHY':'◆ CONFIG'
  return (
    <div>
      <Hdr title="External Data Health · GET /admin/health/external-sources" />
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:'1.25rem' }}>
        {sources.map(s=>(
          <div key={s.name} style={{ background:'var(--color-background-primary)', border:`0.5px solid ${sc(s.status)}40`, borderRadius:'var(--border-radius-md)', padding:'12px 14px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
              <span style={{ fontSize:11, fontFamily:'var(--font-mono)', textTransform:'uppercase', letterSpacing:'0.06em', color:'var(--color-text-secondary)' }}>{s.name}</span>
              <Badge color={sc(s.status)} size={10}>{sl(s.status)}</Badge>
            </div>
            {s.rt?<p style={{ margin:0, fontSize:18, fontWeight:500, fontFamily:'var(--font-mono)', color:s.rt>400?T.amber:T.teal }}>{s.rt}ms</p>
              :<p style={{ margin:0, fontSize:12, color:'var(--color-text-tertiary)' }}>API key not set</p>}
            <p style={{ margin:'4px 0 0', fontSize:11, color:'var(--color-text-tertiary)', fontFamily:'var(--font-mono)' }}>{s.calls} calls · {s.errors} errors</p>
          </div>
        ))}
      </div>
      <Card>
        <Hdr title="Signal Strength Distribution · GET /admin/metrics/external-data" />
        {[['high',14,T.teal],['medium',11,T.blue],['low',9,T.amber],['none',4,T.red]].map(([lv,n,c])=>(
          <div key={lv} style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
            <span style={{ fontSize:11, fontFamily:'var(--font-mono)', width:55, color:'var(--color-text-secondary)', textTransform:'uppercase' }}>{lv}</span>
            <div style={{ flex:1, height:5, background:'var(--color-border-tertiary)', borderRadius:2, overflow:'hidden' }}>
              <div style={{ height:'100%', width:`${(n/38)*100}%`, background:c }} />
            </div>
            <span style={{ fontSize:12, fontFamily:'var(--font-mono)', color:c, minWidth:20 }}>{n}</span>
          </div>
        ))}
        <div style={{ marginTop:'1rem', padding:'8px 10px', background:'var(--color-background-secondary)', borderRadius:5 }}>
          <p style={{ margin:0, fontSize:11, color:'var(--color-text-tertiary)', fontFamily:'var(--font-mono)' }}>Poll every 30–60s. Trigger on-demand via refresh. Use /admin/external-data/:marketId in market QA views.</p>
        </div>
      </Card>
    </div>
  )
}

function AdminMetrics() {
  return (
    <div>
      <Hdr title="System Metrics · GET /api/metrics" />
      <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:10, marginBottom:'1.5rem' }}>
        <Stat label="Total Requests" value="5,203" sub="200 failed" accent={T.blue} />
        <Stat label="Cache Hit Rate" value="75%" sub="45MB memory" accent={T.teal} />
        <Stat label="Predictions" value="1,000" sub="50 errors" accent={T.purple} />
        <Stat label="Uptime" value="86,400s" sub="~1 day" accent={T.amber} />
      </div>
      <Card>
        <Hdr title="Rate Limits" />
        {[['General endpoints','100 req / 5min / IP',T.blue],['Prediction endpoints','50 req / 5min / IP',T.amber],['Admin/sensitive','20 req / 5min / IP',T.red]].map(([l,v,c])=>(
          <div key={l} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'0.5px solid var(--color-border-tertiary)', alignItems:'center' }}>
            <span style={{ fontSize:12 }}>{l}</span>
            <Badge color={c} size={10}>{v}</Badge>
          </div>
        ))}
        <div style={{ paddingTop:'1rem' }}>
          <p style={{ margin:'0 0 6px', fontSize:11, color:'var(--color-text-secondary)' }}>External provider outbound pacing:</p>
          <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
            {['SportsDataIO','Football-Data','CoinGecko','Yahoo Finance','GDELT','NewsAPI','SEC EDGAR','Earnings API'].map(p=>(
              <Badge key={p} color={T.purple} size={10}>{p}</Badge>
            ))}
          </div>
        </div>
      </Card>
    </div>
  )
}

// ── ARCHITECTURE DOCS ──────────────────────────────────────────────────────

function ArchPage() {
  const [tab, setTab] = useState('structure')
  const tabs = [{id:'structure',label:'Folder'},{id:'types',label:'Types'},{id:'api',label:'API Client'},{id:'security',label:'Security'},{id:'routes',label:'Routes'}]
  return (
    <div>
      <Hdr title="Architecture Documentation" />
      <div style={{ display:'flex', gap:5, flexWrap:'wrap', marginBottom:'1.25rem', paddingBottom:'1rem', borderBottom:'0.5px solid var(--color-border-tertiary)' }}>
        {tabs.map(t=><FilterBtn key={t.id} label={t.label} active={tab===t.id} color={T.purple} onClick={()=>setTab(t.id)} />)}
      </div>

      {tab==='structure'&&<Code>{`src/
├── api/
│   ├── client.ts           # publicClient + adminClient (Axios)
│   ├── markets.ts          # GET /markets, /search, /trending, /:id
│   ├── predictions.ts      # GET /predictions, /approved, /performance, /:id, vote
│   ├── notifications.ts    # POST/GET/PATCH /notifications/**
│   ├── admin.ts            # All /admin/** routes (dual-header client)
│   └── metrics.ts          # GET /metrics (X-API-Key client)
│
├── components/
│   ├── ui/
│   │   ├── Badge.tsx
│   │   ├── StatCard.tsx
│   │   ├── LoadingSpinner.tsx
│   │   ├── ErrorState.tsx       # normalized error display
│   │   └── EmptyState.tsx
│   ├── markets/
│   │   ├── MarketCard.tsx
│   │   └── MarketFilters.tsx
│   ├── predictions/
│   │   ├── PredictionCard.tsx
│   │   └── ConfidenceBadge.tsx
│   └── admin/
│       ├── AdminGuard.tsx       # blocks unauthenticated admin access
│       └── ActionConfirm.tsx    # confirms destructive mutations
│
├── pages/
│   ├── public/
│   │   ├── Home.tsx
│   │   ├── Markets.tsx
│   │   ├── MarketDetail.tsx
│   │   ├── Predictions.tsx
│   │   ├── Performance.tsx
│   │   └── Notifications.tsx
│   └── admin/
│       ├── AdminLogin.tsx
│       ├── AdminDashboard.tsx
│       ├── AdminCache.tsx
│       ├── AdminCron.tsx
│       ├── AdminDebug.tsx
│       ├── AdminWebhooks.tsx
│       ├── AdminWebhookDetail.tsx
│       ├── AdminPredictions.tsx
│       ├── AdminExternalData.tsx
│       └── AdminMetrics.tsx
│
├── hooks/
│   ├── useMarkets.ts            # data + loading + error + refetch
│   ├── usePredictions.ts
│   ├── usePerformance.ts
│   ├── useAdminAuth.ts          # in-memory key store
│   └── useApiError.ts           # error normalization hook
│
├── types/
│   ├── api.ts                   # ApiSuccess<T>, ApiError, ErrorCode
│   ├── market.ts                # Market, MarketsResponse
│   ├── prediction.ts            # Prediction, PredictionPerformance, VoteSummary
│   ├── notification.ts          # EmailSub, PushSub, NotifPreference
│   ├── admin.ts                 # AdminHeaders, Webhook, WebhookEvent
│   └── external.ts              # ExternalDataHealth, ExternalDataMetrics
│
├── utils/
│   ├── errorNormalizer.ts       # backend code → safe UI message
│   ├── retryWithBackoff.ts      # 429-aware exponential retry
│   └── validators.ts            # Zod schemas for all POST/PATCH
│
└── routes/
    └── index.tsx                # React Router v6 route config`}</Code>}

      {tab==='types'&&(<>
        <Code>{`// types/api.ts
export interface ApiSuccess<T> {
  success: true
  data: T
  timestamp: string         // ISO 8601
}

export interface ApiError {
  success: false
  error: string             // human-readable message
  code: ErrorCode           // machine-readable
  timestamp: string
}

export type ErrorCode =
  | 'MISSING_API_KEY'
  | 'INVALID_API_KEY'
  | 'INVALID_ADMIN_KEY'
  | 'FORBIDDEN'
  | 'AUTH_REQUIRED'
  | 'PREDICTION_ENGINE_PRIVATE'
  | 'RATE_LIMITED'
  | 'VALIDATION_ERROR'
  | string

// types/market.ts
export interface Market {
  marketId: string
  title: string
  description?: string
  options: string[]
  currentPrices: number[]    // index-parallel to options
  liquidity: number
  volume24h: number
  volume?: number
  volume7d?: number
  endDate: string
  createdAt?: string
  categories: string[]
  active: boolean
  resolved: boolean
}

export interface MarketsResponse {
  markets: Market[]
  total: number
  page: number
  pages: number
}`}</Code>

        <Code>{`// types/prediction.ts
export type Confidence = 'high' | 'medium' | 'low'
export type Timeframe  = 'daily' | 'weekly' | 'monthly'
export type PredStatus = 'pending' | 'approved' | 'rejected'

export interface Prediction {
  id: string
  marketId: string
  status: PredStatus
  marketProbability: number   // 0–100
  aiProbability: number       // 0–100
  confidence: Confidence
  timeframe?: Timeframe
}

export interface ResolvedPrediction {
  marketId: string
  marketTitle: string
  option: string
  predictedAnswer: string
  actualAnswer: string
  winningOption: string
  confidence: number
  predictedAt: string
  polymarketUrl: string
}

export interface PredictionPerformance {
  windowDays: number
  summary: {
    totalPredictions: number
    resolvedPredictions: number
    pendingPredictions: number
    correctPredictions: number
    incorrectPredictions: number
    winRate: number
  }
  correctPredictions: ResolvedPrediction[]
  incorrectPredictions: ResolvedPrediction[]
  pendingPredictions: { marketTitle: string; option: string; confidence: number }[]
}

export interface VoteSummary {
  predictionId: string
  likes: number
  dislikes: number
  userVote?: 'like' | 'dislike' | null
}

// types/notification.ts
export interface MarketRef { marketId: string; marketTitle: string }
export interface NotificationPreference {
  frequency?: 'monthly'              // email only; always enforced monthly server-side
  minConfidence: number
  maxNotificationsPerDay: number
  categories?: string[]
  includeFeatures?: boolean
}
export interface EmailSubscriptionPayload {
  email: string
  markets: MarketRef[]
  preferences: NotificationPreference
}
export interface PushSubscriptionPayload {
  subscription: { endpoint: string; keys: { p256dh: string; auth: string } }
  markets: MarketRef[]
  preferences: Pick<NotificationPreference, 'minConfidence'|'maxNotificationsPerDay'>
}

// types/admin.ts
export interface AdminHeaders {
  'X-API-Key': string
  'x-admin-key': string
}
export interface Webhook {
  id: string; url: string
  events: ('prediction.created'|'prediction.updated'|'market.trending'|'whale.activity'|'high.confidence')[]
  active: boolean; createdAt: string
}

// types/external.ts
export interface ExternalSourceHealth {
  status: 'healthy' | 'unconfigured' | 'error'
  responseTime?: number
  message?: string
  lastCheck: string
}
export interface ExternalDataHealth {
  timestamp: string
  sources: Record<'sports'|'financial'|'geopolitical'|'corporate', ExternalSourceHealth>
  summary: { allHealthy: boolean; configuredSources: number }
}
export interface ExternalDataMetrics {
  timestamp: string
  metrics: {
    apiCalls: Record<string, { total: number; success: number; failures: number; avgResponseTime: number }>
    cache: { hits: number; misses: number; hitRate: number }
    probabilityAdjustments: { totalAdjustments: number; avgAdjustmentMagnitude: number; adjustmentRange: { min: number; max: number } }
    signalStrength: { avg: number; distribution: { high: number; medium: number; low: number; none: number } }
  }
  diagnosticsStored: number
}`}</Code>
      </>)}

      {tab==='api'&&(<>
        <Code>{`// api/client.ts
import axios, { type AxiosInstance } from 'axios'
import { normalizeError } from '../utils/errorNormalizer'

const BASE = import.meta.env.VITE_API_URL ?? 'https://polyscope.onrender.com/api'

// ── PUBLIC CLIENT (no auth) ──────────────────────────────────────────────
export const publicClient: AxiosInstance = axios.create({ baseURL: BASE, timeout: 10_000 })
publicClient.interceptors.response.use(res => res, err => Promise.reject(normalizeError(err)))

// ── METRICS CLIENT (X-API-Key only) ─────────────────────────────────────
export const metricsClient: AxiosInstance = axios.create({ baseURL: BASE, timeout: 10_000 })
metricsClient.interceptors.request.use(cfg => {
  const key = _session.apiKey
  if (!key) throw Object.assign(new Error('MISSING_API_KEY'), { code: 'MISSING_API_KEY' })
  cfg.headers['X-API-Key'] = key
  return cfg
})

// ── ADMIN CLIENT (X-API-Key + x-admin-key, dual-header) ─────────────────
export const adminClient: AxiosInstance = axios.create({ baseURL: BASE, timeout: 15_000 })
adminClient.interceptors.request.use(cfg => {
  const { apiKey, adminKey } = _session
  if (!apiKey)   throw Object.assign(new Error('MISSING_API_KEY'),   { code: 'MISSING_API_KEY' })
  if (!adminKey) throw Object.assign(new Error('INVALID_ADMIN_KEY'), { code: 'INVALID_ADMIN_KEY' })
  cfg.headers['X-API-Key']   = apiKey
  cfg.headers['x-admin-key'] = adminKey
  return cfg
})
adminClient.interceptors.response.use(res => res, err => Promise.reject(normalizeError(err)))

// ── SESSION (in-memory, never persisted) ────────────────────────────────
const _session: Record<string, string> = {}
export const setKeys   = (apiKey: string, adminKey: string) => { _session.apiKey = apiKey; _session.adminKey = adminKey }
export const clearKeys = () => { delete _session.apiKey; delete _session.adminKey }`}</Code>

        <Code>{`// api/markets.ts
import { publicClient } from './client'
import type { ApiSuccess, Market, MarketsResponse } from '../types'

export const marketsApi = {
  list: (p?: { category?:string; timeframe?:string; status?:string; limit?:number; offset?:number }) =>
    publicClient.get<ApiSuccess<MarketsResponse>>('/markets', { params: p }),

  search: (q: string, limit?: number) =>
    publicClient.get<ApiSuccess<MarketsResponse>>('/markets/search', { params: { q, limit } }),

  trending: (limit?: number) =>
    publicClient.get<ApiSuccess<MarketsResponse>>('/markets/trending', { params: { limit } }),

  byCategory: (category: string, limit?: number) =>
    publicClient.get<ApiSuccess<MarketsResponse>>(\`/markets/category/\${category}\`, { params: { limit } }),

  get: (id: string) =>
    publicClient.get<ApiSuccess<Market>>(\`/markets/\${id}\`),

  // ⛔ BLOCKED — NEVER call prediction-generation routes
  // /markets/:id/predict
  // /markets/:id/predict-unified
  // /markets/:id/predict-all
  // /markets/:id/features
  // /markets/:id/cache
}

// api/predictions.ts
import { publicClient } from './client'
import type { ApiSuccess, Prediction, PredictionPerformance, VoteSummary } from '../types'

export const predictionsApi = {
  list: (p?: { limit?:number; offset?:number; timeframe?:string }) =>
    publicClient.get<ApiSuccess<{ predictions: Prediction[]; total: number }>>('/predictions', { params: p }),

  approved: (p?: { limit?:number; offset?:number; timeframe?:string }) =>
    publicClient.get<ApiSuccess<{ predictions: Prediction[]; total: number }>>('/predictions/approved', { params: p }),

  performance: (p?: { days?:number; mode?:string; minResolved?:number; minLowerBound?:number }) =>
    publicClient.get<ApiSuccess<PredictionPerformance>>('/predictions/performance', { params: p }),

  get: (id: string) =>
    publicClient.get<ApiSuccess<Prediction>>(\`/predictions/\${id}\`),

  vote: (id: string, voteType: 'like'|'dislike') =>
    publicClient.post(\`/predictions/\${id}/vote\`, { voteType }),

  votes: (id: string) =>
    publicClient.get<ApiSuccess<VoteSummary>>(\`/predictions/\${id}/votes\`),

  // ⛔ BLOCKED — POST /predictions, POST /predictions/batch
}

// api/admin.ts
import { adminClient } from './client'

export const adminApi = {
  cache: {
    clear: (type: 'all'|'expired'|'predictions') => adminClient.post('/admin/cache/clear', { type }),
    stats: () => adminClient.get('/admin/cache/stats'),
    invalidate: (marketId: string) => adminClient.post(\`/admin/cache/invalidate/\${marketId}\`),
  },
  cron: { run: (job: 'refresh'|'compute') => adminClient.post('/admin/cron/run', { job }) },
  predictions: {
    list: () => adminClient.get('/admin/predictions'),
    approve: (id: string, reviewNotes?: string) => adminClient.post(\`/admin/predictions/\${id}/approve\`, { reviewNotes }),
    reject: (id: string, reviewNotes?: string) => adminClient.post(\`/admin/predictions/\${id}/reject\`, { reviewNotes }),
    setProbability: (id: string, aiProbability: number) => adminClient.patch(\`/admin/predictions/\${id}/probability\`, { aiProbability }),
  },
  webhooks: {
    list: () => adminClient.get('/admin/webhooks'),
    get: (id: string) => adminClient.get(\`/admin/webhooks/\${id}\`),
    create: (body: { url: string; events: string[] }) => adminClient.post('/admin/webhooks', body),
    update: (id: string, body: any) => adminClient.put(\`/admin/webhooks/\${id}\`, body),
    delete: (id: string) => adminClient.delete(\`/admin/webhooks/\${id}\`),
    test: (id: string) => adminClient.post(\`/admin/webhooks/\${id}/test\`),
  },
  external: {
    data: (marketId: string) => adminClient.get(\`/admin/external-data/\${marketId}\`),
    health: () => adminClient.get('/admin/health/external-sources'),
    metrics: () => adminClient.get('/admin/metrics/external-data'),
  },
  stats: {
    predictions: () => adminClient.get('/admin/stats/predictions'),
    notifications: () => adminClient.get('/admin/stats/notifications'),
  },
}`}</Code>
      </>)}

      {tab==='security'&&(<>
        <Code>{`// utils/errorNormalizer.ts
const MESSAGES: Record<string, string> = {
  MISSING_API_KEY:           'API key is required.',
  INVALID_API_KEY:           'The API key provided is invalid.',
  INVALID_ADMIN_KEY:         'Admin key authentication failed.',
  FORBIDDEN:                 'You do not have permission for this action.',
  AUTH_REQUIRED:             'Authentication is required.',
  PREDICTION_ENGINE_PRIVATE: 'Prediction generation is server-only and not publicly accessible.',
  RATE_LIMITED:              'Too many requests — please wait and try again.',
  VALIDATION_ERROR:          'Some fields have invalid values. Review and try again.',
}

export function normalizeError(err: unknown): { message: string; code: string; status?: number } {
  if (err && typeof err === 'object' && 'response' in err) {
    const res = (err as any).response
    const data = res?.data
    if (data?.code) return { message: MESSAGES[data.code] ?? data.error ?? 'Unexpected error.', code: data.code, status: res.status }
    if (res?.status === 429) return { message: MESSAGES.RATE_LIMITED, code: 'RATE_LIMITED', status: 429 }
    if (res?.status === 401) return { message: MESSAGES.AUTH_REQUIRED, code: 'AUTH_REQUIRED', status: 401 }
    if (res?.status === 403) return { message: MESSAGES.FORBIDDEN, code: 'FORBIDDEN', status: 403 }
  }
  return { message: 'An unexpected error occurred.', code: 'UNKNOWN' }
}`}</Code>

        <Code>{`// utils/retryWithBackoff.ts — 429-aware exponential backoff
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  opts = { maxRetries: 3, baseMs: 1000 }
): Promise<T> {
  let lastErr: unknown
  for (let i = 0; i <= opts.maxRetries; i++) {
    try { return await fn() }
    catch (err: any) {
      lastErr = err
      if (err?.code !== 'RATE_LIMITED' || i === opts.maxRetries) throw err
      await new Promise(r => setTimeout(r, opts.baseMs * 2 ** i))
    }
  }
  throw lastErr
}

// utils/validators.ts — Zod schemas for all POST/PATCH bodies
import { z } from 'zod'

export const emailSubSchema = z.object({
  email: z.string().email(),
  markets: z.array(z.object({ marketId: z.string(), marketTitle: z.string() })).min(1),
  preferences: z.object({
    frequency: z.literal('monthly').optional(),
    minConfidence: z.number().min(0).max(100),
    maxNotificationsPerDay: z.number().min(1).max(100),
    categories: z.array(z.string()).optional(),
    includeFeatures: z.boolean().optional(),
  })
})

export const voteSchema = z.object({ voteType: z.enum(['like','dislike']) })

export const reviewNotesSchema = z.object({
  reviewNotes: z.string().max(1000).optional()
})

export const webhookCreateSchema = z.object({
  url: z.string().url(),
  events: z.array(z.enum(['prediction.created','prediction.updated','market.trending','whale.activity','high.confidence'])).min(1)
})`}</Code>

        <div style={{ padding:'1rem', background:T.red+'0a', border:`0.5px solid ${T.red}40`, borderRadius:6, marginBottom:'1rem' }}>
          <p style={{ margin:'0 0 8px', fontSize:11, fontFamily:'var(--font-mono)', textTransform:'uppercase', letterSpacing:'0.06em', color:T.red }}>⛔ Hard Security Rules</p>
          {[
            'Never call GET /markets/:id/predict, /predict-unified, /predict-all, /features, /cache',
            'Never call POST /predictions or POST /predictions/batch',
            'Never store admin keys in localStorage or sessionStorage',
            'Never hardcode admin secrets in source files or build artifacts',
            'Never display raw backend stack traces in the UI',
            'Never trust frontend-only validation — always handle backend errors',
            'Never attach x-admin-key to non-admin requests',
          ].map((r,i)=>(
            <p key={i} style={{ margin:'0 0 4px', fontSize:12, color:T.red }}>✗ {r}</p>
          ))}
        </div>
        <div style={{ padding:'1rem', background:T.teal+'0a', border:`0.5px solid ${T.teal}40`, borderRadius:6 }}>
          <p style={{ margin:'0 0 8px', fontSize:11, fontFamily:'var(--font-mono)', textTransform:'uppercase', letterSpacing:'0.06em', color:T.teal }}>✅ Required Patterns</p>
          {[
            'Separate publicClient and adminClient — never mix',
            'Store admin keys in module-scope memory only; clear on logout',
            'Use normalizeError() on all API calls before displaying messages',
            'Wrap admin mutations in ActionConfirm component',
            'Apply retryWithBackoff() on all user-facing API calls',
            'Attach X-API-Key only to /metrics routes',
            'Attach both headers only to /admin/** routes via adminClient interceptor',
          ].map((r,i)=>(
            <p key={i} style={{ margin:'0 0 4px', fontSize:12, color:T.teal }}>✓ {r}</p>
          ))}
        </div>
      </>)}

      {tab==='routes'&&<Code>{`// routes/index.tsx — React Router v6
import { createBrowserRouter, Navigate } from 'react-router-dom'
import AdminGuard from '../components/admin/AdminGuard'

export const router = createBrowserRouter([
  // ── PUBLIC ────────────────────────────────────────────────────────
  { path: '/',                          element: <Home /> },
  { path: '/markets',                   element: <Markets /> },
  { path: '/markets/trending',          element: <Markets trending /> },
  { path: '/markets/:id',               element: <MarketDetail /> },
  { path: '/predictions',               element: <Predictions /> },
  { path: '/predictions/:predictionId', element: <PredictionDetail /> },
  { path: '/performance',               element: <Performance /> },
  { path: '/notifications',             element: <Notifications /> },
  { path: '/notifications/verify',      element: <NotificationsVerify /> },

  // ── ADMIN (all behind AdminGuard) ─────────────────────────────────
  { path: '/admin',                     element: <Navigate to="/admin/login" replace /> },
  { path: '/admin/login',               element: <AdminLogin /> },
  {
    path: '/admin',
    element: <AdminGuard />,   // redirects to /admin/login if not authenticated
    children: [
      { path: 'dashboard',              element: <AdminDashboard /> },
      { path: 'cache',                  element: <AdminCache /> },
      { path: 'cron',                   element: <AdminCron /> },
      { path: 'debug',                  element: <AdminDebug /> },
      { path: 'webhooks',               element: <AdminWebhooks /> },
      { path: 'webhooks/:id',           element: <AdminWebhookDetail /> },
      { path: 'predictions',            element: <AdminPredictions /> },
      { path: 'external-data',          element: <AdminExternalData /> },
      { path: 'metrics',                element: <AdminMetrics /> },
    ]
  },
  { path: '*',                          element: <Navigate to="/" replace /> },
])

// components/admin/AdminGuard.tsx
export default function AdminGuard() {
  const { isAuthenticated } = useAdminAuth()
  return isAuthenticated ? <Outlet /> : <Navigate to="/admin/login" replace />
}

// hooks/useAdminAuth.ts
const _keys = { apiKey: '', adminKey: '' }

export function useAdminAuth() {
  const [authed, setAuthed] = useState(!!_keys.apiKey && !!_keys.adminKey)
  const login = (apiKey: string, adminKey: string) => {
    setKeys(apiKey, adminKey)   // writes to axios interceptor scope
    _keys.apiKey = apiKey
    _keys.adminKey = adminKey
    setAuthed(true)
  }
  const logout = () => {
    clearKeys()
    _keys.apiKey = ''
    _keys.adminKey = ''
    setAuthed(false)
  }
  return { isAuthenticated: authed, login, logout }
}`}</Code>}
    </div>
  )
}

// ── MAIN APP ───────────────────────────────────────────────────────────────

const NAV = [
  {id:'home',label:'Overview'},
  {id:'markets',label:'Markets'},
  {id:'predictions',label:'Predictions'},
  {id:'performance',label:'Performance'},
  {id:'notifications',label:'Notifications'},
]

const ADMIN_NAV = [
  {id:'admin-dashboard',label:'Dashboard'},
  {id:'admin-predictions',label:'Predictions'},
  {id:'admin-cache',label:'Cache'},
  {id:'admin-external',label:'External Data'},
  {id:'admin-metrics',label:'Metrics'},
]

export default function App() {
  const [page, setPage] = useState({name:'home',params:{}})
  const [auth, setAuth] = useState(false)
  const [mode, setMode] = useState('app') // 'app' | 'arch'

  const nav = (name, params={}) => { setPage({name,params}); setMode('app') }

  const isAdminPage = page.name.startsWith('admin')

  const Page = () => {
    if (mode==='arch') return <ArchPage />
    switch(page.name) {
      case 'home':         return <HomePage nav={nav} />
      case 'markets':      return <MarketsPage nav={nav} />
      case 'market':       return <MarketDetailPage marketId={page.params.id} nav={nav} />
      case 'predictions':  return <PredictionsPage />
      case 'performance':  return <PerformancePage />
      case 'notifications':return <NotificationsPage />
      case 'admin-login':  return <AdminLoginPage onAuth={()=>{setAuth(true);nav('admin-dashboard')}} />
      case 'admin-dashboard': return auth?<AdminDashboard nav={nav}/>:<AdminLoginPage onAuth={()=>{setAuth(true);nav('admin-dashboard')}}/>
      case 'admin-predictions': return auth?<AdminPredictions/>:null
      case 'admin-cache':  return auth?<AdminCache/>:null
      case 'admin-external': return auth?<AdminExternal/>:null
      case 'admin-metrics': return auth?<AdminMetrics/>:null
      default: return <HomePage nav={nav} />
    }
  }

  return (
    <div style={{ fontFamily:'var(--font-sans)', maxWidth:820, margin:'0 auto', padding:'0 1rem' }}>
      {/* Top Nav */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 0',
        borderBottom:'0.5px solid var(--color-border-tertiary)', marginBottom:'1rem', gap:10, flexWrap:'wrap' }}>
        <button onClick={()=>nav('home')} style={{ background:'none', border:'none', cursor:'pointer', padding:0 }}>
          <span style={{ fontSize:15, fontWeight:500, letterSpacing:'-0.02em', color:'var(--color-text-primary)', fontFamily:'var(--font-mono)' }}>
            POLY<span style={{ color:T.blue }}>SCOPE</span>
          </span>
        </button>
        <div style={{ display:'flex', gap:2, flexWrap:'wrap', alignItems:'center' }}>
          {NAV.map(l=>(
            <button key={l.id} onClick={()=>nav(l.id)} style={{
              padding:'3px 9px', borderRadius:3, fontSize:12, cursor:'pointer', border:'none',
              background:page.name===l.id&&mode==='app'?'var(--color-background-secondary)':'transparent',
              color:page.name===l.id&&mode==='app'?'var(--color-text-primary)':'var(--color-text-secondary)',
              fontWeight:page.name===l.id&&mode==='app'?500:400
            }}>{l.label}</button>
          ))}
          <div style={{ width:'0.5px', background:'var(--color-border-secondary)', margin:'0 3px', height:16 }} />
          <button onClick={()=>{setMode('arch');setPage({name:'architecture',params:{}})}} style={{
            padding:'3px 9px', borderRadius:3, fontSize:12, cursor:'pointer', border:'none',
            background:mode==='arch'?T.purple+'18':'transparent',
            color:mode==='arch'?T.purple:'var(--color-text-secondary)' }}>
            Architecture
          </button>
          <button onClick={()=>nav(auth?'admin-dashboard':'admin-login')} style={{
            padding:'3px 9px', borderRadius:3, fontSize:12, cursor:'pointer',
            border:`0.5px solid ${isAdminPage&&mode==='app'?T.red:'var(--color-border-tertiary)'}`,
            background:isAdminPage&&mode==='app'?T.red+'0f':'transparent',
            color:isAdminPage&&mode==='app'?T.red:'var(--color-text-secondary)' }}>
            {auth?'● Admin':'Admin'}
          </button>
        </div>
      </div>

      {/* Admin sub-nav */}
      {isAdminPage&&auth&&mode==='app'&&(
        <div style={{ display:'flex', gap:4, marginBottom:'1rem', padding:'7px 10px',
          background:'var(--color-background-secondary)', borderRadius:5, flexWrap:'wrap', alignItems:'center' }}>
          {ADMIN_NAV.map(l=>(
            <button key={l.id} onClick={()=>nav(l.id)} style={{
              padding:'2px 9px', borderRadius:3, fontSize:11, cursor:'pointer', fontFamily:'var(--font-mono)',
              border:`0.5px solid ${page.name===l.id?T.red:'var(--color-border-tertiary)'}`,
              background:page.name===l.id?T.red+'0f':'transparent',
              color:page.name===l.id?T.red:'var(--color-text-secondary)' }}>{l.label}</button>
          ))}
          <button onClick={()=>{setAuth(false);nav('home')}} style={{
            marginLeft:'auto', padding:'2px 9px', borderRadius:3, fontSize:11, cursor:'pointer',
            fontFamily:'var(--font-mono)', border:'none', background:'transparent', color:'var(--color-text-tertiary)' }}>
            Sign out
          </button>
        </div>
      )}

      {/* Content */}
      <div style={{ paddingBottom:'2rem' }}><Page /></div>

      {/* Footer */}
      <div style={{ borderTop:'0.5px solid var(--color-border-tertiary)', padding:'10px 0',
        display:'flex', justifyContent:'flex-end', alignItems:'center' }}>
        <div style={{ display:'flex', gap:6 }}>
          <Badge color={T.teal} size={10}>● LIVE</Badge>
          <Badge color={T.blue} size={10}>v1.0.0</Badge>
        </div>
      </div>
    </div>
  )
}
