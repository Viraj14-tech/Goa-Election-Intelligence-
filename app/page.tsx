"use client";

import { useEffect, useMemo, useState } from "react";
import rawData from "./election-data.json";

type Candidate = { AC:number; Constituency:string; "Ballot order":number; "Vote rank":number; Candidate:string; Party:string; "Party full name":string; Votes:number; "Vote share":number; Result:string };
type Seat = { AC:number; Constituency:string; "2022 winner":string; "2022 party":string; "2022 margin":number; "Current alignment":string; "2024 LS leader":string; "2024 LS margin":number; "2027 evidence rating":string; Confidence:string; "Community dynamics (qualitative)":string; "Key constituency issues":string; "Names to watch (tickets unconfirmed)":string; "2025 ZP/local signal":string; "Reservation watch":string; "Evidence rationale":string; candidates:Candidate[] };
type Party = { Party:string; "Full name":string; Candidates:number; Votes:number; "Vote share":number; Seats:number };
type Data = { meta:{title:string;subtitle:string;asOf:string;candidateCount:number;constituencyCount:number;closeSeatCount:number;bjp2024Leads:number;inc2024Leads:number}; ratingSummary:{rating:string;count:number}[]; constituencies:Seat[]; candidates:Candidate[]; parties:Party[] };
type View = "Overview" | "Constituencies" | "Candidates" | "Leadership" | "Goa primer";

const data = rawData as Data;
const nf = new Intl.NumberFormat("en-IN");
const pf = new Intl.NumberFormat("en-IN", { style:"percent", maximumFractionDigits:1 });
const views:View[] = ["Overview","Constituencies","Candidates","Leadership","Goa primer"];

const hinges = [
  ["Opposition coordination","A one-candidate opposition and a fragmented opposition produce very different maps, especially in Salcete and close three-way contests."],
  ["Ticket absorption after defections","Eight incumbents elected on Congress tickets are now in BJP. Personal vote and pre-existing BJP cadre vote cannot simply be added."],
  ["ST reservation","The legal mechanism exists, but the final number and identity of reserved Assembly seats are not yet notified."],
  ["Two open successions","Ponda and Taleigao are vacant. Candidate selection and inherited networks matter more than the old result alone."],
];
const arenas = [
  ["Sanquelim electoral rival","Dharmesh Saglani (INC)","Came within 666 votes of Pramod Sawant in 2022.","2027 ticket and alliance support are not final."],
  ["BJP / government power centres","Vishwajit Rane, Digambar Kamat, Rohan Khaunte, Mauvin Godinho, Ramesh Tawadkar and Damu Naik","Senior ministers, a former CM, dominant local leaders and the state organisation.","None should be described as a declared challenger to Sawant without an explicit statement."],
  ["Alliance bargaining centre","Sudin Dhavalikar (MGP)","Two MLAs, cabinet position and durable Marcaim–Priol organisation.","An ally and bargaining centre, not an opposition CM face."],
  ["Opposition political faces","Yuri Alemao, Girish Chodankar, Vijai Sardesai, Capt. Viriato Fernandes, Valmiki Naik and Venzy Viegas","Legislative, party, parliamentary and organisational visibility.","No common opposition CM face or final alliance existed as of 2 August 2026."],
  ["RGP / local-identity space","Viresh Borkar","Sitting MLA from St. Andre.","RGP founder Manoj Parab left active politics in 2026; organisational stability is uncertain."],
];
const profiles = [
  ["Pramod Sawant","Incumbent CM · Sanquelim","Clear incumbent BJP face. The 666-vote 2022 margin is a constituency vulnerability, while BJP's 15,764-vote 2024 segment lead shows a stronger party baseline."],
  ["Vishwajit Rane","Senior minister · Valpoi","Powerful Sattari leader and statewide power centre. Monitor his role and relationship with the CM; do not label him a declared successor."],
  ["Digambar Kamat","Former CM and minister · Margao","Dominant Margao base. His ability to transfer a Congress-era personal vote to BJP is a constituency and statewide test."],
  ["Rohan Khaunte","Minister · Porvorim","Strong urban incumbent with an IT and tourism profile; 2022 personal and 2024 party signals are favourable."],
  ["Damu Naik","BJP state president","Organisational power centre and likely Fatorda challenger if selected; not currently an MLA or announced CM claimant."],
  ["Yuri Alemao / Vijai Sardesai","Assembly opposition faces","Their relative strength depends on Congress–GFP coordination; Capt. Viriato Fernandes adds a strong South Goa parliamentary face."],
];
const history = [
  ["1963–1979","MGP versus United Goans","The merger and identity divide created MGP's temple-belt and Bahujan legacy."],
  ["1980s","Congress consolidation and statehood","Congress built broad networks, particularly in South Goa."],
  ["1990–2005","Coalition instability and defections","Candidate loyalty and post-poll formation became central concerns."],
  ["2000–2017","BJP expansion under Parrikar","BJP expanded from an urban base into a wider Bahujan coalition."],
  ["2017–2022","Coalition formation and large defections","Congress won more seats in 2017, but BJP formed government; ten Congress MLAs joined BJP in 2019."],
  ["2022–2026","BJP majority plus eight entrants","Current alignment differs sharply from the labels on which many MLAs were elected."],
];
const regions = [
  ["Pernem & coastal Bardez","OBC/Bhandari and Hindu villages, Catholic settlements, tourism and fishing.","Candidate networks interact with tourism, land and identity; no uniform coastal swing."],
  ["Tiswadi / Panaji periphery","Urban professionals, trading networks, villages, tenants and government workers.","Local organisations, housing and independents can dominate party arithmetic."],
  ["Bicholim–Sattari–mining belt","Bahujan/OBC villages, ST pockets and mining-dependent households.","Mining restart and strong local networks favour incumbency but do not eliminate close races."],
  ["Ponda temple belt","OBC/Bahujan temple and village networks with Gauda/Kunbi/ST presence.","MGP retains depth; BJP–MGP ticket allocation is central."],
  ["Mormugao port belt","Mixed city wards, industrial workers and migrant labour.","Jobs, airport/port issues and personal networks outweigh a simple North–South label."],
  ["Salcete","Large Catholic electorate, village institutions, professionals, fishing and agriculture.","Congress/GFP/AAP are structurally stronger; BJP openings depend on personal incumbents and fragmentation."],
  ["Quepem–Sanguem–Canacona","Mixed seats with significant Gauda, Kunbi and Velip/ST communities.","ST reservation and eligibility could redraw several contests."],
];
const issues = ["Jobs, recruitment credibility and visible local employment","Land, housing, change-of-zone decisions and village control","Mining restart, safeguards, transport and local benefit","Tourism quality, taxis, traffic, waste and coastal carrying capacity","Mhadei, water security, forests, fishing and environmental limits","Defection, candidate trust and post-poll stability","Everyday delivery: roads, drainage, ferries, health and education"];
const scenarios = [
  ["Fragmented opposition","Benaulim, Velim, Navelim, St. Andre, Cortalim, Ponda, Cumbarjua","Government bloc benefits from vote splitting without a large statewide swing."],
  ["Partial Congress–GFP coordination","Fatorda, Nuvem, Curtorim, Cuncolim, Quepem, Aldona","Opposition improves across Salcete; AAP/RGP seats remain multi-cornered."],
  ["Broad one-candidate opposition","St. Cruz, St. Andre, Aldona, Calangute, Navelim, Velim, Curchorem","Several government-advantage seats become genuine toss-ups."],
  ["BJP ticket disruption","Siolim, Saligao, Calangute, St. Cruz, Cumbarjua, Mormugao, Nuvem, Margao","Defector incumbents, old cadres and rebels prevent personal and party votes adding cleanly."],
  ["ST reservation implemented","Priol, Quepem, Sanguem and seats in the final notification","Eligibility and ticket allocation reset; affected ratings must be rerun."],
];

function rClass(r:string) { return r === "Government bloc strong" ? "gstrong" : r === "Government bloc advantage" ? "gadv" : r === "MGP strong" ? "mgp" : r === "Toss-up" ? "toss" : r === "Opposition advantage" ? "oadv" : "ostrong"; }
function Pill({rating}:{rating:string}) { return <span className={`pill ${rClass(rating)}`}>{rating}</span>; }
function Signal({seat}:{seat:Seat}) { return <>{seat["2024 LS leader"]} +{nf.format(seat["2024 LS margin"])}</>; }
function SectionHead({kicker,title,copy}:{kicker:string;title:string;copy?:string}) { return <div className="section-head"><p className="eyebrow">{kicker}</p><h2>{title}</h2>{copy && <p className="lead">{copy}</p>}</div>; }

function LeaderProfileImage() {
  const [imgError, setImgError] = useState(false);

  if (imgError) {
    return <div className="avatar">PS</div>;
  }

  return (
    <div className="leader-profile-image-wrapper">
      <img
        src="/CM_pramod_sawant.jpg"
        alt="Pramod Sawant"
        className="leader-profile-image"
        onError={() => setImgError(true)}
      />
    </div>
  );
}

export default function Dashboard() {
  const [view,setView] = useState<View>("Overview");
  const [query,setQuery] = useState("");
  const [seatFilter,setSeatFilter] = useState("all");
  const [selected,setSelected] = useState<Seat|null>(null);
  const [cq,setCq] = useState(""); const [party,setParty] = useState("all"); const [cseat,setCseat] = useState("all"); const [result,setResult] = useState("all"); const [sort,setSort] = useState("ballot"); const [page,setPage] = useState(1);
  useEffect(()=>{ const key=(e:KeyboardEvent)=>{ if(e.key==="Escape") setSelected(null); }; addEventListener("keydown",key); return()=>removeEventListener("keydown",key); },[]);
  const close = useMemo(()=>data.constituencies.filter(s=>s["2022 margin"]<=1000).sort((a,b)=>a["2022 margin"]-b["2022 margin"]),[]);
  const seats = useMemo(()=>data.constituencies.filter(s=>{
    const hay=[s.Constituency,s["2022 winner"],s["Names to watch (tickets unconfirmed)"],...s.candidates.map(c=>c.Candidate)].join(" ").toLowerCase();
    const rating=s["2027 evidence rating"]; const fm=seatFilter==="all"||(seatFilter==="close"&&s["2022 margin"]<=1000)||(seatFilter==="toss"&&rating==="Toss-up")||(seatFilter==="government"&&(rating.startsWith("Government")||rating==="MGP strong"))||(seatFilter==="opposition"&&rating.startsWith("Opposition"))||(seatFilter==="vacant"&&s["Current alignment"]==="Vacant");
    return (!query||hay.includes(query.toLowerCase()))&&fm;
  }),[query,seatFilter]);
  const parties=useMemo(()=>[...new Set(data.candidates.map(c=>c.Party))].sort(),[]);
  const candidates=useMemo(()=>data.candidates.filter(c=>(!cq||`${c.Candidate} ${c.Constituency} ${c.Party}`.toLowerCase().includes(cq.toLowerCase()))&&(party==="all"||c.Party===party)&&(cseat==="all"||c.AC===Number(cseat))&&(result==="all"||c.Result===result)).sort((a,b)=>sort==="votes"?b.Votes-a.Votes:sort==="share"?b["Vote share"]-a["Vote share"]:a.AC-b.AC||a["Ballot order"]-b["Ballot order"]),[cq,party,cseat,result,sort]);
  const pages=Math.max(1,Math.ceil(candidates.length/25)), safe=Math.min(page,pages), rows=candidates.slice((safe-1)*25,safe*25);
  const open=(s:Seat)=>setSelected(s); const jump=(s:Seat)=>{setQuery("");setSeatFilter("all");setView("Constituencies");open(s);};

  return <div className="shell">
    <aside className="rail"><button className="mark" onClick={()=>setView("Overview")} aria-label="Overview"><img src="/MMC Logo.svg" alt="Make My Campaign" style={{ objectFit: "contain" }} /></button><nav>{views.map((v,i)=><button key={v} className={view===v?"active":""} onClick={()=>setView(v)}><b>{i===0?"01":i===1?"40":i===2?"301":i===3?"CM":"i"}</b><span>{v}</span></button>)}</nav><div className="rail-note">Evidence as of<br/><strong>{data.meta.asOf}</strong></div></aside>
    <main>
      <div className="mobile-brand-bar">
        <img src="/MMC Logo.svg" alt="Make My Campaign" className="mobile-brand-logo" />
        <span className="mobile-brand-title">Make My Campaign Research</span>
      </div>
      <header className="top">
        <div>
          <div className="brand-header-badge">
            <img src="/MMC Logo.svg" alt="Make My Campaign" className="brand-logo-img" />
            <span>Make My Campaign Research</span>
          </div>
          <h1>{data.meta.title}</h1>
          <p>{data.meta.subtitle}</p>
        </div>
        <div className="controls">
          <label className="search">
            <span>⌕</span>
            <input value={query} onChange={e=>{setQuery(e.target.value);if(e.target.value)setView("Constituencies");}} placeholder="Search seat or candidate" aria-label="Search seat or candidate"/>
          </label>
          <label className="select">
            <span>◇</span>
            <select value={seatFilter} onChange={e=>{setSeatFilter(e.target.value);if(e.target.value!=="all")setView("Constituencies");}} aria-label="Filter seats">
              <option value="all">All 40 seats</option>
              <option value="close">10 close seats</option>
              <option value="toss">11 toss-ups</option>
              <option value="government">Government / MGP side</option>
              <option value="opposition">Opposition side</option>
              <option value="vacant">Vacant seats</option>
            </select>
          </label>
        </div>
      </header>
      <div className="mobile-nav">{views.map(v=><button key={v} className={view===v?"active":""} onClick={()=>setView(v)}>{v}</button>)}</div>

      {view==="Overview"&&<div className="stack">
        <section className="metrics"><article><strong>40</strong><span>Constituencies</span></article><article><strong>301</strong><span>Actual candidates</span></article><article><strong>BJP 20</strong><span>33.31% vote share</span></article><article><strong>INC 11</strong><span>23.46% vote share</span></article></section>
        <section className="overview-grid"><article className="panel outlook"><div className="panel-head"><div><p className="eyebrow">2027 evidence matrix</p><h2>Constituency outlook</h2></div><button onClick={()=>setView("Constituencies")}>Explore all seats →</button></div><div className="rating-summary">{data.ratingSummary.map(x=><div key={x.rating}><strong>{x.count}</strong><span>{x.rating}</span></div>)}</div><div className="bar">{data.ratingSummary.map(x=><i key={x.rating} className={rClass(x.rating)} style={{width:`${x.count/40*100}%`}}/>)}</div><div className="tiles">{data.constituencies.map(s=><button key={s.AC} className={rClass(s["2027 evidence rating"])} title={`${s.Constituency}: ${s["2027 evidence rating"]}`} onClick={()=>jump(s)}>{s.AC}</button>)}</div><p className="note">Dated starting conditions—not projected seats or statistical probabilities.</p></article>
          <article className="panel attention"><div className="panel-head"><div><p className="eyebrow">Margin ≤1,000</p><h2>High-attention seats</h2></div><em>10</em></div>{close.slice(0,6).map(s=><button className="attention-row" key={s.AC} onClick={()=>jump(s)}><span><strong>{s.Constituency}</strong><small>Margin {nf.format(s["2022 margin"])}</small></span><Pill rating={s["2027 evidence rating"]}/><b>›</b></button>)}<button className="footer-link" onClick={()=>{setSeatFilter("close");setView("Constituencies");}}>View all close seats →</button></article></section>
        <section className="panel signal-panel"><div className="panel-head"><div><p className="eyebrow">Cross-election check</p><h2>Closest results and 2024 signal</h2></div><span className="signal-count">BJP led 27 · INC led 13</span></div><div className="table-wrap"><table><thead><tr><th>Seat</th><th>2022 winner</th><th>Margin</th><th>2024 LS segment</th><th>2027 rating</th><th/></tr></thead><tbody>{close.map(s=><tr key={s.AC}><td><strong>{s.Constituency}</strong></td><td>{s["2022 winner"]} ({s["2022 party"]})</td><td>{nf.format(s["2022 margin"])}</td><td><Signal seat={s}/></td><td><Pill rating={s["2027 evidence rating"]}/></td><td><button className="arrow" onClick={()=>jump(s)}>›</button></td></tr>)}</tbody></table></div></section>
        <section className="brief-grid"><article className="panel narrative"><p className="eyebrow">Executive conclusion</p><h2>The map is not simply “North BJP, South Congress”</h2><p>Goa&apos;s 2027 contest cannot be read from one election. The 2022 result captured strong personal votes and fragmentation; the 2024 parliamentary election created a more consolidated two-bloc signal; the 2025 Zilla Panchayat result added a local organisational test.</p><div className="fact-row"><span><b>10</b>seats ≤1,000 votes</span><span><b>8</b>Congress MLAs joined BJP</span><span><b>2</b>current vacancies</span></div></article><article className="panel narrative"><p className="eyebrow">The 2027 hinge</p><h2>Four unresolved structures</h2><div className="hinges">{hinges.map((h,i)=><div key={h[0]}><span>{i+1}</span><p><strong>{h[0]}</strong>{h[1]}</p></div>)}</div></article></section>
        <section className="panel party-panel"><div className="panel-head"><div><p className="eyebrow">2022 statewide result</p><h2>Vote share did not convert evenly</h2></div><button onClick={()=>setView("Candidates")}>Open candidate ledger →</button></div><div className="party-bars">{data.parties.filter(p=>p.Party!=="NOTA").slice(0,8).map(p=><div key={p.Party}><b>{p.Party}</b><span><i style={{width:`${p["Vote share"]*100}%`}}/></span><strong>{pf.format(p["Vote share"])}</strong><small>{p.Seats} seats</small></div>)}</div></section>
      </div>}

      {view==="Constituencies"&&<div className="stack"><SectionHead kicker="All 40 constituencies" title="Constituency evidence explorer" copy="Open a seat for community context, issues, 2024/2025 overlays, names to watch and the complete 2022 candidate result."/><div className="result-line"><p>Showing <strong>{seats.length}</strong> of 40 seats</p>{(query||seatFilter!=="all")&&<button onClick={()=>{setQuery("");setSeatFilter("all");}}>Clear filters</button>}</div><section className="seat-grid">{seats.map(s=><button className="seat-card" key={s.AC} onClick={()=>open(s)}><div><span>AC {s.AC}</span><Pill rating={s["2027 evidence rating"]}/></div><h3>{s.Constituency}</h3><p className="winner"><small>2022 winner</small><strong>{s["2022 winner"]}</strong><span>{s["2022 party"]} · margin {nf.format(s["2022 margin"])}</span></p><div className="mini"><span><small>Current</small><b>{s["Current alignment"]}</b></span><span><small>2024 signal</small><b><Signal seat={s}/></b></span></div><p className="rationale">{s["Evidence rationale"]}</p><em>Open evidence brief →</em></button>)}</section>{!seats.length&&<div className="empty"><h3>No matching constituency</h3><p>Try another seat, candidate or filter.</p></div>}</div>}

      {view==="Candidates"&&<div className="stack"><SectionHead kicker="Complete 2022 universe" title="All 301 candidates" copy="NOTA is excluded as a candidate. Ballot order, party, votes, vote share and result status are preserved for every seat."/><section className="panel candidate-panel"><div className="filters"><label><span>Search</span><input value={cq} onChange={e=>setCq(e.target.value)} placeholder="Candidate, party or seat"/></label><label><span>Party</span><select value={party} onChange={e=>setParty(e.target.value)}><option value="all">All parties</option>{parties.map(p=><option key={p}>{p}</option>)}</select></label><label><span>Constituency</span><select value={cseat} onChange={e=>setCseat(e.target.value)}><option value="all">All 40 seats</option>{data.constituencies.map(s=><option key={s.AC} value={s.AC}>{s.AC}. {s.Constituency}</option>)}</select></label><label><span>Result</span><select value={result} onChange={e=>setResult(e.target.value)}><option value="all">All results</option><option>Winner</option><option>Runner-up</option><option>Other</option></select></label><label><span>Sort</span><select value={sort} onChange={e=>setSort(e.target.value)}><option value="ballot">AC and ballot order</option><option value="votes">Votes high to low</option><option value="share">Share high to low</option></select></label></div><div className="candidate-summary"><p><strong>{candidates.length}</strong> matching candidates</p><button onClick={()=>{setCq("");setParty("all");setCseat("all");setResult("all");setSort("ballot");}}>Reset ledger</button></div><div className="table-wrap"><table className="candidate-table"><thead><tr><th>AC</th><th>Constituency</th><th>Candidate</th><th>Party</th><th>Votes</th><th>Share</th><th>Result</th><th/></tr></thead><tbody>{rows.map(c=>{const s=data.constituencies.find(x=>x.AC===c.AC);return <tr key={`${c.AC}-${c["Ballot order"]}`}><td>{c.AC}</td><td>{c.Constituency}</td><td><strong>{c.Candidate}</strong><small>Ballot order {c["Ballot order"]}</small></td><td><span className="party-chip">{c.Party}</span></td><td>{nf.format(c.Votes)}</td><td>{pf.format(c["Vote share"])}</td><td><span className={`result-chip ${c.Result.replace("-","").toLowerCase()}`}>{c.Result}</span></td><td>{s&&<button className="arrow" onClick={()=>open(s)}>›</button>}</td></tr>})}</tbody></table></div><div className="pagination"><button disabled={safe===1} onClick={()=>setPage(p=>Math.max(1,p-1))}>← Previous</button><span>Page <strong>{safe}</strong> of {pages}</span><button disabled={safe===pages} onClick={()=>setPage(p=>Math.min(pages,p+1))}>Next →</button></div></section></div>}

      {view==="Leadership"&&<div className="stack"><SectionHead kicker="Leadership landscape" title="Separate an electoral rival from a political power centre" copy="The evidence does not support describing every senior leader as a declared CM challenger."/><section className="panel cm"><LeaderProfileImage /><div><p className="eyebrow">Incumbent chief minister</p><h2>Pramod Sawant</h2><p>The clearest BJP face statewide. His principal vulnerability is constituency-specific; his principal strength is organisational.</p></div><div className="cm-stats"><span><b>666</b>2022 Sanquelim margin</span><span><b>+15,764</b>BJP 2024 segment lead</span><span><b>Dharmesh Saglani</b>2022 constituency rival</span></div></section><section className="arena-grid">{arenas.map(a=><article className="panel arena" key={a[0]}><p className="eyebrow">{a[0]}</p><h3>{a[1]}</h3><p>{a[2]}</p><div><strong>Analytical caution</strong><span>{a[3]}</span></div></article>)}</section><section className="panel profiles"><div className="panel-head"><div><p className="eyebrow">Names to monitor</p><h2>Leadership profiles</h2></div></div><div className="profile-list">{profiles.map((p,i)=><article key={p[0]}><span>{String(i+1).padStart(2,"0")}</span><div><h3>{p[0]}</h3><b>{p[1]}</b><p>{p[2]}</p></div></article>)}</div></section></div>}

      {view==="Goa primer"&&<div className="stack"><SectionHead kicker="For a new entrant" title="Goa's political grammar in one briefing" copy="History, election mechanics, geography, community context and the issue agenda—without treating any community as politically uniform."/><section className="primer-top"><article className="panel primer"><p className="eyebrow">Identity and statehood</p><h2>Three dates still matter</h2><div><span><b>19 Dec 1961</b>Liberation</span><span><b>1967</b>Opinion Poll rejected merger</span><span><b>30 May 1987</b>Full statehood</span></div></article><article className="panel system"><p className="eyebrow">How the election works</p><h2>40 seats · 21 for a majority</h2><ul><li>Single-member seats using first-past-the-post.</li><li>23 seats in North Goa and 17 in South Goa.</li><li>Pernem was the only SC-reserved seat in 2022.</li><li>ST reservation process exists; implementation is pending.</li><li>Small seats magnify personal networks, rebels and three-way splits.</li></ul></article></section><section className="panel timeline"><div className="panel-head"><div><p className="eyebrow">Political phases</p><h2>Why history still shapes the map</h2></div></div><div>{history.map(h=><article key={h[0]}><span>{h[0]}</span><h3>{h[1]}</h3><p>{h[2]}</p></article>)}</div></section><section className="panel demo"><div><p className="eyebrow">Statewide 2011 context</p><h2>Demography is context—not a prediction</h2><p>Population about 1.46 million; 62.17% urban. Hindus 66.08%, Christians 25.10%, Muslims 8.33%, Scheduled Tribes 10.23% and Scheduled Castes 1.74%.</p></div><aside><strong>Important limitation on caste analysis</strong><p>No verified public caste census exists for each Assembly constituency. This dashboard uses broad geography and never assigns caste from a surname or invents seat-level percentages.</p></aside></section><section className="panel region-panel"><div className="panel-head"><div><p className="eyebrow">Social and political geography</p><h2>Seven useful regions</h2></div></div><div className="regions">{regions.map(r=><article key={r[0]}><h3>{r[0]}</h3><p>{r[1]}</p><span>{r[2]}</span></article>)}</div></section><section className="primer-bottom"><article className="panel issue-panel"><p className="eyebrow">Issue agenda</p><h2>What is likely to matter</h2><ol>{issues.map(i=><li key={i}>{i}</li>)}</ol></article><article className="panel sources"><p className="eyebrow">Method and downloads</p><h2>Evidence standard</h2><p>The rating combines the 2022 result, current alignment, 2024 segment, 2025 local signal, candidate changes and political geography. It is not a statistical probability.</p><a href="/downloads/Goa_Elections_2022_and_2027_Outlook_Report.docx">Download full report <b>DOCX</b></a><a href="/downloads/Goa_2022_Election_and_2027_Outlook_Annexure.xlsx">Download candidate annexure <b>XLSX</b></a><div className="source-links"><a href="https://www.eci.gov.in/statistical-reports" target="_blank" rel="noreferrer">Election Commission reports ↗</a><a href="https://www.goavidhansabha.gov.in/mlas.php" target="_blank" rel="noreferrer">Goa Assembly MLA roster ↗</a><a href="https://sec.goa.gov.in/general-election-to-zilla-panchayat-2025/" target="_blank" rel="noreferrer">Goa SEC ZP 2025 results ↗</a></div></article></section><SectionHead kicker="Scenario framework" title="The map changes with assumptions" copy="Conditional scenarios, not forecasts."/><section className="scenario-grid">{scenarios.map((s,i)=><article className="panel scenario" key={s[0]}><span>{String(i+1).padStart(2,"0")}</span><h3>{s[0]}</h3><p>{s[2]}</p><small>{s[1]}</small></article>)}</section></div>}

      <footer><div><strong>MakeMyCampaign Research</strong><span>Neutral evidence briefing · Updated {data.meta.asOf}</span></div><p>2027 names are unconfirmed. Community context is qualitative and is not a targeting instruction.</p></footer>
    </main>

    {selected&&<div className="overlay" onMouseDown={e=>{if(e.target===e.currentTarget)setSelected(null);}}><aside className="drawer" role="dialog" aria-modal="true" aria-labelledby="drawer-title"><div className="drawer-head"><div><p className="eyebrow">AC {selected.AC} · Evidence brief</p><h2 id="drawer-title">{selected.Constituency}</h2></div><button onClick={()=>setSelected(null)} aria-label="Close">×</button></div><div className="drawer-chips"><Pill rating={selected["2027 evidence rating"]}/><span>Confidence: {selected.Confidence}</span><span>Current: {selected["Current alignment"]}</span></div><div className="drawer-stats"><span><small>2022 winner</small><b>{selected["2022 winner"]}</b><em>{selected["2022 party"]}</em></span><span><small>Victory margin</small><b>{nf.format(selected["2022 margin"])}</b><em>votes</em></span><span><small>2024 LS signal</small><b><Signal seat={selected}/></b><em>directional overlay</em></span></div><section className="assessment"><p className="eyebrow">Evidence rationale</p><p>{selected["Evidence rationale"]}</p></section><div className="detail-grid"><section><h3>Community context</h3><p>{selected["Community dynamics (qualitative)"]}</p></section><section><h3>Key issues</h3><p>{selected["Key constituency issues"]}</p></section><section><h3>Names to watch</h3><p>{selected["Names to watch (tickets unconfirmed)"]}</p></section><section><h3>2025 local signal</h3><p>{selected["2025 ZP/local signal"]}</p></section></div><section className="reserve"><strong>Reservation watch</strong><p>{selected["Reservation watch"]}</p></section><div className="drawer-table"><p className="eyebrow">Complete 2022 result · {selected.candidates.length} candidates</p><div className="table-wrap"><table><thead><tr><th>Rank</th><th>Candidate</th><th>Party</th><th>Votes</th><th>Share</th></tr></thead><tbody>{selected.candidates.map(c=><tr key={`${c.AC}-${c["Ballot order"]}`}><td>{c["Vote rank"]}</td><td><strong>{c.Candidate}</strong></td><td>{c.Party}</td><td>{nf.format(c.Votes)}</td><td>{pf.format(c["Vote share"])}</td></tr>)}</tbody></table></div></div><p className="drawer-note">Community descriptions are broad context only. No seat-level caste census is claimed and no individual caste is inferred.</p></aside></div>}
  </div>;
}
