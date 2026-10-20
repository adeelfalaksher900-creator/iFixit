import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import "./style.css";
import "./ios.css";
import { categories, compare, metrics, shortId, stages } from "./domain.js";
import {
  Logo,
  Button,
  Tag,
  Field,
  CheckField,
  ErrorBox,
  Empty,
  CopyLink,
  Modal,
  download,
  api,
  readSaved,
  persist,
  date,
  ArrowUpRight,
  ArrowLeft,
  Plus,
  ArrowRight,
  Download,
  Search,
  CheckCircle2,
  Clock3,
  Layers,
  BookOpen,
  KeyRound,
  Menu,
  Wrench,
  PackageCheck,
  RefreshCw,
  ChevronRight,
  MemoryStick,
  Keyboard,
  Fan,
  Link2,
} from "./ui.jsx";
import { Research, Privacy } from "./info.jsx";
import { Welcome } from "./welcome.jsx";
const text = { en: {board:"Repair board", outcomes:"Outcomes", research:"Research", access:"Settings & access", new:"New request", refresh:"Refresh", waiting:"Waiting for parts", received:"Ready for repair", repaired:"Confirmed repairs"}};
const safeFile = (f) => {
  if (f.size > 8000) throw new Error("Access file is too large.");
  return f.text().then(JSON.parse);
};
const validAccess = (x) =>
  x?.version === 1 &&
  /^[a-f0-9-]{36}$/.test(x.id) &&
  /^[a-f0-9]{64}$/.test(x.key);
function App() {
  const [access, setAccess] = useState(() => readSaved("rr-access"));
  const [page, setPage] = useState("board");
  const [bench, setBench] = useState(null);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [modal, setModal] = useState(null);
  const [menu, setMenu] = useState(false);
  const t = text.en;
  useEffect(() => {document.documentElement.lang="en"; document.documentElement.dir="ltr";}, []);
  const path = window.location.pathname.split("/").filter(Boolean);
  async function refresh(a = access) {
    if (!a) return;
    setError("");
    setBusy(true);
    try {
      const data = await api("/benches/" + a.id, { key: a.key });
      setBench(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  useEffect(() => {
    if (access && !["r", "receipt", "research", "privacy"].includes(path[0]))
      refresh();
  }, [access]);
  async function start(name, demo) {
    setBusy(true);
    setError("");
    try {
      const b = await api("/benches", {
        method: "POST",
        body: JSON.stringify({ name, demo }),
      });
      const a = { version: 1, id: b.id, key: b.key };
      persist("rr-access", a);
      setAccess(a);
      setModal("backup");
      setPage("board");
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function restore(e) {
    const f = e.target.files[0];
    if (!f) return;
    setError("");
    try {
      const a = await safeFile(f);
      if (!validAccess(a))
        throw new Error("Choose a valid iFixit private access file.");
      await api("/benches/" + a.id, { key: a.key });
      persist("rr-access", a);
      setAccess(a);
      setModal(null);
    } catch (e) {
      setError(e.message);
    } finally {
      e.target.value = "";
    }
  }
  const language = null;
  if (path[0] === "r")
    return <PublicRequest id={path[1]} language={language} />;
  if (path[0] === "receipt")
    return (
      <Receipt requestId={path[1]} offerId={path[2]} language={language} />
    );
  if (["research", "privacy"].includes(path[0]))
    return (
      <>
        <header className="public-head">
          <Logo />
          {language}
          <a href="/">
            Open workbench <ArrowRight size={16} />
          </a>
        </header>
        <main className="info-wrap">
          {path[0] === "research" ? <Research /> : <Privacy />}
        </main>
      </>
    );
  if (!access) return <Welcome busy={busy} error={error} start={name=>start(name,false)} startDemo={()=>start("Neighborhood repair desk · demo",true)} restore={restore}/>;
  const rows = bench?.repairs || [],
    current = rows.find((r) => r.id === selected),
    m = metrics(rows);
  const nav = [
    ["board", Layers, t.board],
    ["outcomes", CheckCircle2, t.outcomes],
    ["research", BookOpen, t.research],
    ["access", KeyRound, t.access],
  ];
  return (
    <div className="app-shell">
      <aside className={menu ? "sidebar open" : "sidebar"}>
        <Logo />
        <div className="scope">
          <span className="scope-mark">
            <Wrench size={18} />
          </span>
          <div>
            <strong>{bench?.name || "Your workbench"}</strong>
            <small>
              {bench?.demo ? "Example session" : "Private workbench"}
            </small>
          </div>
        </div>
        <nav>
          {nav.map(([key, Icon, label]) => (
            <button
              key={key}
              className={page === key ? "active" : ""}
              aria-current={page === key ? "page" : undefined}
              onClick={() => {
                setPage(key);
                setSelected(null);
                setMenu(false);
              }}
            >
              <Icon size={18} />
              {label}
              {key === "board" && m.offers > 0 && (
                <span
                  className="nav-count"
                  aria-label={m.offers + " pending offers"}
                >
                  {m.offers}
                </span>
              )}
            </button>
          ))}
        </nav>
        <div className="sidebar-foot">
          <p>
            From a missing part
            <br />
            to a working device.
          </p>
          <a href="/privacy">
            Privacy & pilot limits <ArrowUpRight size={14} />
          </a>
          <small>Built for Neighborhood Hacks</small>
        </div>
      </aside>
      <div className="workspace">
        <header className="workspace-head">
          <Button
            className="menu-toggle"
            aria-label="Toggle navigation"
            aria-expanded={menu}
            onClick={() => setMenu(!menu)}
          >
            <Menu size={20} />
          </Button>
          <span>
            Workbench <ChevronRight size={14} />{" "}
            {nav.find((n) => n[0] === page)?.[2]}
          </span>
          <div>
            {busy && (
              <span role="status" className="small-text">
                Updating…
              </span>
            )}
            {language}
          </div>
        </header>
        <main className="sheet">
          <ErrorBox error={error} />
          {!bench ? (
            <Empty
              title={busy ? "Loading your workbench…" : "Workbench unavailable"}
            >
              <Button onClick={() => refresh()}>Retry</Button>
              <label className="file-link">
                Restore access
                <input type="file" accept=".json" onChange={restore} />
              </label>
            </Empty>
          ) : (
            <>
              {!!bench.demo && (
                <div className="demo-notice">
                  <span>
                    <strong>Example session.</strong> Fictional cases and parts.
                  </span>
                  <Button small onClick={() => setModal("switch")}>
                    Start a real workbench <ArrowUpRight size={14} />
                  </Button>
                </div>
              )}
              {page === "board" &&
                (current ? (
                  <Detail
                    r={current}
                    bench={bench}
                    access={access}
                    onBack={() => setSelected(null)}
                    onRefresh={refresh}
                  />
                ) : (
                  <Board
                    rows={rows}
                    m={m}
                    t={t}
                    onSelect={setSelected}
                    onNew={() => setModal("new")}
                    onRefresh={refresh}
                    busy={busy}
                    demo={bench.demo}
                  />
                ))}
              {page === "outcomes" && (
                <Outcomes rows={rows} demo={bench.demo} />
              )}{" "}
              {page === "research" && <Research />}
              {page === "access" && (
                <Access
                  bench={bench}
                  access={access}
                  restore={restore}
                  onUpdate={async result=>{if(result.key){const next={...access,key:result.key};persist("rr-access",next);setAccess(next);return next;}await refresh();return access;}}
                  leave={() => {
                    localStorage.removeItem("rr-access");
                    setAccess(null);
                    setBench(null);
                  }}
                />
              )}
            </>
          )}
        </main>
      </div>
      {modal === "backup" && <Modal title="Keep a way back in" onClose={()=>setModal(null)}><p>Your workbench is ready. Save its private access file before adding requests or leaving this device. There is no email recovery.</p><div className="actions"><Button primary onClick={()=>download("ifixit-private-access.json",access)}><Download size={16}/>Save private access file</Button><Button onClick={()=>setModal(null)}>Continue to workbench</Button></div><p className="small-text">Anyone with this file can manage the workbench. Keep it private. You can save another copy or rotate access from Settings & access.</p></Modal>}
      {modal === "new" && (
        <Modal title="New diagnosed request" onClose={() => setModal(null)}>
          <RequestForm
            onSave={async (input) => {
              await api("/benches/" + access.id + "/requests", {
                key: access.key,
                method: "POST",
                body: JSON.stringify(input),
              });
              setModal(null);
              await refresh();
            }}
          />
        </Modal>
      )}
      {modal === "switch" && (
        <Modal title="Start an empty workbench" onClose={() => setModal(null)}>
          <p>
            Keep your example access file if you want to return to it. A new
            workbench starts with zero requests and zero repairs.
          </p>
          <Button
            onClick={() => download("ifixit-example-access.json", access)}
          >
            <Download size={16} />
            Save example access
          </Button>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              start(new FormData(e.currentTarget).get("name"), false);
            }}
          >
            <Field
              label="Repair shop or club name"
              name="name"
              required
              minLength={2}
              maxLength={60}
            />
            <Button primary disabled={busy}>
              Create workbench
            </Button>
            <ErrorBox error={error} />
          </form>
        </Modal>
      )}
    </div>
  );
}
function Board({ rows, m, t, onSelect, onNew, onRefresh, busy, demo }) {
  const [query, setQuery] = useState(""),
    [filter, setFilter] = useState("All");
  const priority = (r) => r.status === "Received" ? 4 : r.status === "Waiting for part" && r.offers.some(o => o.status === "Offered") ? 3 : r.status === "Reserved" ? 2 : r.status === "Waiting for part" ? 1 : 0;
  const filtered = rows.toSorted((a,b) => priority(b) - priority(a)).filter(
    (r) =>
      (filter === "All" || r.status === filter) &&
      [r.title, r.model, r.part, r.category]
        .join(" ")
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  const exact = rows
    .filter((r) => r.status === "Waiting for part")
    .reduce(
      (n, r) =>
        n +
        r.offers.filter(
          (o) => o.status === "Offered" && compare(r, o).level === "match",
        ).length,
      0,
    );
  return (
    <>
      <div className="title-row">
        <div>
          <h1>{t.board}</h1>
          <p>
            {m.offers
              ? `${m.offers} donor offers await your review.`
              : "Every request starts with a diagnosis."}
          </p>
        </div>
        <Button primary onClick={onNew}>
          <Plus size={17} />
          {t.new}
        </Button>
      </div>
      <div className="metrics">
        <div>
          <span>{t.waiting}</span>
          <strong>{m.waiting}</strong>
          <small>Diagnosed requests</small>
        </div>
        <div>
          <span>Parts reserved</span>
          <strong>{m.reserved}</strong>
          <small>48-hour collection window</small>
        </div>
        <div>
          <span>{t.received}</span>
          <strong>{m.received}</strong>
          <small>Physical handover recorded</small>
        </div>
        <div>
          <span>{t.repaired}</span>
          <strong>{m.repaired}</strong>
          <small>
            {demo ? "Example results only" : "Owner-confirmed outcomes"}
          </small>
        </div>
      </div>
      <div className="focus-strip">
        <div>
          <span className="signal" />
          <strong>
            {exact
              ? `${exact} ${exact === 1 ? "offer matches" : "offers match"} the recorded labels`
              : "The next repair starts here"}
          </strong>
          <span>
            {exact
              ? "Check the physical part before reserving."
              : "Record the required part, then share the request."}
          </span>
        </div>
        <a href="/research">
          How the checks work <ArrowUpRight size={15} />
        </a>
      </div>
      <div className="filter-tabs" role="group" aria-label="Filter repairs">
        {["All", "Waiting for part", "Reserved", "Received", "Repaired"].map(
          (f) => (
            <button
              key={f}
              aria-pressed={filter === f}
              className={filter === f ? "selected" : ""}
              onClick={() => setFilter(f)}
            >
              {f === "All" ? "All requests" : f}
              <span>
                {f === "All"
                  ? rows.length
                  : rows.filter((r) => r.status === f).length}
              </span>
            </button>
          ),
        )}
      </div>
      <div className="toolbar">
        <label className="search">
          <Search size={17} />
          <input
            aria-label="Search requests"
            placeholder="Search device, part or request"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <span className="small-text">{filtered.length} requests</span>
        <Button disabled={busy} onClick={() => onRefresh()}>
          <RefreshCw size={15} />
          {t.refresh}
        </Button>
      </div>
      {filtered.length ? (
        <div className="repair-table">
          <div className="table-head">
            <span>Repair / required part</span>
            <span>Stage</span>
            <span>Donor offers</span>
            <span />
          </div>
          {filtered.map((r) => {
            const Icon = {
              Memory: MemoryStick,
              Keyboard: Keyboard,
              "Cooling fan": Fan,
              Hinge: Link2,
            }[r.category];
            return (
              <button
                className="repair-row"
                key={r.id}
                onClick={() => onSelect(r.id)}
              >
                <div className="repair-identity">
                  <Icon size={25} />
                  <span>
                    <strong>{r.title}</strong>
                    <small>{r.part}</small>
                    <small className="mobile-only">
                      {r.category} · {r.offers.length} offers
                    </small>
                  </span>
                </div>
                <Tag
                  tone={
                    r.status === "Repaired"
                      ? "good"
                      : r.status === "Not repaired"
                        ? "bad"
                        : ""
                  }
                >
                  {r.status}
                </Tag>
                <div className="offer-count">
                  <strong>
                    {r.offers.filter((o) => o.status === "Offered").length}
                  </strong>
                  <small>to review</small>
                </div>
                <ChevronRight size={18} />
              </button>
            );
          })}
        </div>
      ) : (
        <Empty
          title={
            rows.length ? "No matching requests" : "No repair requests yet"
          }
        >
          {rows.length
            ? "Try another search or filter."
            : "Add a diagnosed repair and share its public request link."}
        </Empty>
      )}
      <div className="board-bottom">
        <span>
          <Wrench size={16} /> Technician inspection required for every part.
        </span>
        <span>
          {demo
            ? "Sample part references are fictional."
            : "Keep personal details out of public requests."}
        </span>
      </div>
    </>
  );
}
function RequestForm({ onSave }) {
  const [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        const input = Object.fromEntries(f);
        input.diagnosed = f.has("diagnosed");
        setError("");
        setBusy(true);
        try {
          await onSave(input);
        } catch (e) {
          setError(e.message);
        } finally {
          setBusy(false);
        }
      }}
    >
      <p>
        Copy exact labels from the diagnosed device and required assembly. One
        request is for one part.
      </p>
      <div className="form-grid">
        <Field
          label="Repair title"
          name="title"
          required
          minLength={4}
          maxLength={90}
        />
        <Field label="Part category">
          <select name="category">
            {categories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </Field>
        <Field
          label="Device model and revision"
          name="model"
          required
          minLength={2}
          maxLength={100}
        />
        <Field
          label="Exact part number"
          name="part"
          required
          minLength={2}
          maxLength={100}
        />
      </div>
      <Field
        label="Required specification / connector"
        name="spec"
        required
        minLength={2}
        maxLength={150}
        placeholder="Include generation, size, connector or revision as applicable"
      />
      <Field
        label="What did the technician diagnose?"
        name="diagnosis"
        textarea
        required
        minLength={15}
        maxLength={700}
      />
      <Field
        label="What will this repair help someone do?"
        name="purpose"
        required
        minLength={5}
        maxLength={240}
      />
      <Field
        label="General collection area"
        name="area"
        required
        minLength={2}
        maxLength={80}
        placeholder="Staffed repair desk or community location, no home addresses"
      />
      <CheckField name="diagnosed" required>
        A competent repairer diagnosed this need. These public fields contain no
        personal or sensitive information.
      </CheckField>
      <ErrorBox error={error} />
      <Button primary disabled={busy}>
        {busy ? "Saving…" : "Create request"}
      </Button>
    </form>
  );
}
function MatchTable({ r, o }) {
  const result = compare(r, o);
  return (
    <div className="match-table">
      <div className="match-head">
        <span>Label field</span>
        <span>Required</span>
        <span>Offered</span>
      </div>
      {result.fields.map((f) => (
        <div className={"match-line " + f.state} key={f.key}>
          <span>
            {
              {
                model: "Device model",
                part: "Part number",
                spec: "Specification",
              }[f.key]
            }
            <small>
              {
                {
                  match: "Label matches",
                  mismatch: "Mismatch",
                  unknown: "Missing detail",
                }[f.state]
              }
            </small>
          </span>
          <span>{f.wanted}</span>
          <span>{f.offered || "Not provided"}</span>
        </div>
      ))}
    </div>
  );
}
function Detail({ r, bench, access, onBack, onRefresh }) {
  const [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [chosen, setChosen] = useState(null),
    [notice, setNotice] = useState("");
  const o = r.offers.find((o) => o.id === chosen),
    selected = r.offers.find((o) => o.id === r.selected);
  const link = location.origin + "/r/" + r.id;
  async function action(input) {
    setError("");
    setBusy(true);
    try {
      await api("/requests/" + r.id + "/action", {
        key: access.key,
        method: "POST",
        body: JSON.stringify({ ...input, revision: r.revision }),
      });
      await onRefresh();
      setNotice("Saved. The repair record is up to date.");
      setChosen(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  const steps = ["Waiting for part", "Reserved", "Received", "Repaired"];
  const stage = steps.indexOf(r.status);
  return (
    <>
      <Button onClick={onBack}>
        <ArrowLeft size={16} />
        All requests
      </Button>
      <div className="title-row detail-title">
        <div>
          <div className="idline">
            Request {shortId(r.id)} · {r.category}
          </div>
          <h1>{r.title}</h1>
          <p>{r.purpose}</p>
        </div>
        <Button disabled={busy} onClick={() => onRefresh()}>
          <RefreshCw size={16} />
          Refresh
        </Button>
      </div>
      <div className="stage-track">
        {steps.map((s, i) => (
          <div key={s} className={i <= stage ? "done" : ""}>
            <span>
              {i < stage ? (
                <CheckCircle2 size={17} />
              ) : (
                <span className="stage-dot" />
              )}
            </span>
            <strong>
              {
                {
                  "Waiting for part": "Find a part",
                  Reserved: "Reserve",
                  Received: "Receive",
                  Repaired: "Confirm repair",
                }[s]
              }
            </strong>
          </div>
        ))}
      </div>
      {["Not repaired", "Closed"].includes(r.status) && (
        <p className="status-note">Current status: {r.status}</p>
      )}
      <div className="detail-grid">
        <section>
          <div className="section-head">
            <h2>Part request</h2>
            <Tag>{r.status}</Tag>
          </div>
          <dl className="spec-list">
            <div>
              <dt>Device model</dt>
              <dd>{r.model}</dd>
            </div>
            <div>
              <dt>Part number</dt>
              <dd>{r.part}</dd>
            </div>
            <div>
              <dt>Specification</dt>
              <dd>{r.spec}</dd>
            </div>
            <div>
              <dt>Collection area</dt>
              <dd>{r.area}</dd>
            </div>
          </dl>
          <p className="small-text">{r.diagnosis}</p>
        </section>
        <section className="share-panel">
          <h2>Find a local donor</h2>
          <p>
            Share this request with your community. Donors see the required part
            and submit their own label details.
          </p>
          <CopyLink value={link} />
          <a href={link} target="_blank" rel="noreferrer">
            Open donor view <ArrowUpRight size={16} />
          </a>
          <p className="small-text">
            Private offers and workbench keys stay out of this page.
          </p>
        </section>
      </div>
      <ErrorBox error={error} />
      {notice && (
        <p role="status" className="success">
          {notice}
        </p>
      )}
      <div className="section-head">
        <div>
          <h2>
            Donor offers <span className="muted">({r.offers.length})</span>
          </h2>
          <p>Label matching suggests a candidate. Your inspection decides.</p>
        </div>
      </div>
      {r.offers.length ? (
        <div className="offers-list">
          {r.offers.map((item) => {
            const result = compare(r, item);
            return (
              <div
                className={"offer " + (chosen === item.id ? "chosen" : "")}
                key={item.id}
              >
                <div className="offer-summary">
                  <div>
                    <strong>{item.alias}</strong>
                    <small>
                      {item.condition} · {date(item.created)}
                    </small>
                  </div>
                  <Tag
                    tone={
                      result.level === "match"
                        ? "good"
                        : result.level === "mismatch"
                          ? "bad"
                          : "warn"
                    }
                  >
                    {
                      {
                        match: "Labels match",
                        mismatch: "Mismatch",
                        unknown: "Needs detail",
                      }[result.level]
                    }
                  </Tag>
                  <span className="small-text">{item.status}</span>
                  <Button
                    onClick={() =>
                      setChosen(chosen === item.id ? null : item.id)
                    }
                  >
                    {chosen === item.id ? "Hide details" : "Review offer"}
                    <ChevronRight size={15} />
                  </Button>
                </div>
                {chosen === item.id && (
                  <div className="offer-detail">
                    <MatchTable r={r} o={item} />
                    <p>{item.note}</p>
                    {item.inspection && (
                      <p>
                        <strong>Technician check:</strong> {item.inspection}
                      </p>
                    )}
                    {item.demoReceiptKey && (
                      <a
                        href={`/receipt/${r.id}/${item.id}#key=${item.demoReceiptKey}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Open example donor receipt <ArrowUpRight size={15} />
                      </a>
                    )}
                    {item.status === "Offered" && (
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          const f = new FormData(e.currentTarget);
                          action({
                            action: e.nativeEvent.submitter.value,
                            offerId: item.id,
                            note: f.get("note"),
                            inspected: f.has("inspected"),
                          });
                        }}
                      >
                        <Field
                          textarea
                          name="note"
                          label="Inspection notes or reason to decline"
                          required
                          minLength={15}
                          maxLength={700}
                          placeholder="Record the actual label, connector and condition checks."
                        />
                        <CheckField name="inspected">
                          I checked the physical part, its condition and
                          suitability for this repair.
                        </CheckField>
                        <div className="actions">
                          <Button
                            primary
                            disabled={
                              busy ||
                              result.level !== "match" ||
                              r.status !== "Waiting for part"
                            }
                            name="action"
                            value="reserve"
                          >
                            Reserve for 48 hours
                          </Button>
                          <Button disabled={busy} name="action" value="reject">
                            Decline offer
                          </Button>
                        </div>
                        {result.level !== "match" && (
                          <p className="small-text">
                            Reservation is blocked until all fields match. The
                            donor must send corrected details as a new offer.
                          </p>
                        )}
                      </form>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <Empty title="No offers yet">
          Share the request link with local donors or record an offer together
          at your repair desk.
        </Empty>
      )}
      {r.status === "Reserved" && (
        <section className="action-panel">
          <h2>Record the physical handover</h2>
          <p>
            Reserved from {selected?.alias} until {date(r.reservedUntil)}. Get
            the code from their private receipt when you receive the part.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              action({
                action: e.nativeEvent.submitter.value,
                code: f.get("code") || "",
                note: f.get("note"),
              });
            }}
          >
            <div className="form-grid">
              <Field
                name="code"
                label="Donor handover code"
                maxLength={20}
                autoComplete="off"
              />
              <Field
                name="note"
                label="Receipt / release notes"
                required
                minLength={10}
                maxLength={700}
              />
            </div>
            <div className="actions">
              <Button primary value="receive" disabled={busy}>
                Confirm handover
              </Button>
              <Button value="release" disabled={busy}>
                Release reservation
              </Button>
            </div>
          </form>
        </section>
      )}
      {r.status === "Received" && (
        <section className="action-panel">
          <h2>Close the repair loop</h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              action({
                action: "complete",
                outcome: f.get("outcome"),
                test: f.get("test"),
                ownerConfirmed: f.has("ownerConfirmed"),
              });
            }}
          >
            <Field label="Repair outcome">
              <select name="outcome">
                <option>Repaired</option>
                <option>Not repaired</option>
              </select>
            </Field>
            <Field
              label="What was tested, and what happened?"
              name="test"
              textarea
              required
              minLength={20}
              maxLength={700}
            />
            <CheckField name="ownerConfirmed">
              The device owner confirmed that the repaired device works for its
              intended use.
            </CheckField>
            <Button primary disabled={busy}>
              Save repair outcome
            </Button>
          </form>
        </section>
      )}
      {r.outcome && (
        <section className="action-panel">
          <Tag tone={r.status === "Repaired" ? "good" : "warn"}>
            {r.outcome.result}
          </Tag>
          <h2>
            {r.status === "Repaired"
              ? "A repair, followed through."
              : "The result still matters."}
          </h2>
          <p>{r.outcome.test}</p>
          <p className="small-text">
            {r.outcome.ownerConfirmed
              ? "Device owner confirmation recorded."
              : "No successful repair claimed."}{" "}
            {date(r.outcome.at)}
          </p>
        </section>
      )}
      {["Waiting for part", "Not repaired", "Closed"].includes(r.status) && (
        <details className="manage-request">
          <summary>Manage this request</summary>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              action({
                action: r.status === "Waiting for part" ? "close" : "reopen",
                note: new FormData(e.currentTarget).get("note"),
              });
            }}
          >
            <Field
              name="note"
              label={
                r.status === "Waiting for part"
                  ? "Reason for closing"
                  : "Updated diagnosis / reason to reopen"
              }
              required
              minLength={10}
              maxLength={700}
            />
            <Button disabled={busy}>
              {r.status === "Waiting for part"
                ? "Close request"
                : "Reopen request"}
            </Button>
          </form>
        </details>
      )}
      <section className="history">
        <h2>Repair history</h2>
        <ol>
          {r.history
            .slice()
            .reverse()
            .map((h, i) => (
              <li key={i}>
                <span className="history-dot" />
                <div>
                  <strong>{h.event}</strong>
                  {h.note && <p>{h.note}</p>}
                  <small>{date(h.at)}</small>
                </div>
              </li>
            ))}
        </ol>
      </section>
    </>
  );
}
function Outcomes({ rows, demo }) {
  const m = metrics(rows),
    completed = rows.filter((r) => r.outcome);
  return (
    <>
      <div className="title-row">
        <div>
          <h1>Outcomes, with evidence.</h1>
          <p>
            {demo
              ? "Example-session outcomes. No real-world impact is claimed."
              : "Count repairs after a recorded test and owner confirmation."}
          </p>
        </div>
        <Button
          onClick={() =>
            download("ifixit-outcomes.json", {
              exported: new Date().toISOString(),
              demo: !!demo,
              outcomes: completed.map(({ offers, ...r }) => r),
            })
          }
        >
          <Download size={16} />
          Export outcomes
        </Button>
      </div>
      <div className="metrics">
        <div>
          <span>Confirmed repairs</span>
          <strong>{m.repaired}</strong>
          <small>Test + owner confirmation</small>
        </div>
        <div>
          <span>Not repaired</span>
          <strong>{m.unresolved}</strong>
          <small>Recorded unsuccessful outcomes</small>
        </div>
        <div>
          <span>Awaiting repair</span>
          <strong>{m.received}</strong>
          <small>Parts physically received</small>
        </div>
      </div>
      {completed.length ? (
        <div className="outcome-list">
          {completed.map((r) => (
            <article key={r.id}>
              <div className="section-head">
                <h2>{r.title}</h2>
                <Tag tone={r.status === "Repaired" ? "good" : "warn"}>
                  {r.outcome.result}
                </Tag>
              </div>
              <p>{r.outcome.test}</p>
              <small>
                {date(r.outcome.at)} · Request {shortId(r.id)}
              </small>
            </article>
          ))}
        </div>
      ) : (
        <Empty title="No completed outcomes yet">
          Once a part is received, record the technician's test and the device
          owner's confirmation.
        </Empty>
      )}
      <section className="measurement">
        <h2>What these numbers mean</h2>
        <p>
          An offer is not a repair. A handover is not a repair. Only a recorded
          successful test and owner confirmation count as a confirmed repair.
          This is coordinator-reported evidence, not an independent
          certification.
        </p>
        <p>
          We do not convert counts into kilograms of waste or carbon savings.
          Those need measurements and a defensible baseline.
        </p>
      </section>
    </>
  );
}
function Access({bench,access,restore,leave,onUpdate}) {
 const [error,setError]=useState(""); const [busy,setBusy]=useState(false);const [notice,setNotice]=useState("");const [rotate,setRotate]=useState(false);const [remove,setRemove]=useState(false);
 async function manage(input){setBusy(true);setError("");setNotice("");try{const result=await api(`/benches/${access.id}/manage`,{key:access.key,method:"POST",body:JSON.stringify(input)});if(input.action==="delete"){leave();return;}const next=await onUpdate(result);if(result.key){download("ifixit-private-access.json",next);setNotice("Access rotated. Save the new access file; all previous copies have stopped working.");setRotate(false);}else setNotice("Workbench updated.");}catch(e){setError(e.message);}finally{setBusy(false);}}
 return <div className="prose settings"><h1>Settings & access</h1><p>Manage your private workbench and its records.</p><ErrorBox error={error}/>{notice&&<p className="success" role="status">{notice}</p>}
 <section><h2>Your workbench</h2><form onSubmit={e=>{e.preventDefault();manage({action:"rename",name:new FormData(e.currentTarget).get("name")});}}><Field name="name" label="Repair shop or club name" defaultValue={bench.name} required minLength={2} maxLength={60}/><Button disabled={busy}>Save name</Button></form><p className="small-text">Public requests show this name. Use a club or shop name, without personal details.</p><p>Records available until {date(bench.expires)}.</p><Button disabled={busy} onClick={()=>manage({action:"renew"})}>Keep records for another 30 days</Button></section>
 <section><h2>Your private access</h2><p>This browser remembers a private key. Anyone with the key or access file can manage this workbench. There is no email recovery. Keep a copy somewhere private.</p><div className="actions"><Button primary onClick={()=>download("ifixit-private-access.json",access)}><Download size={16}/>Save access file</Button><label className="file-link">Restore access<input type="file" accept=".json" onChange={restore}/></label></div><details open={rotate||undefined}><summary onClick={e=>{e.preventDefault();setRotate(!rotate)}}>Replace a lost or shared key</summary><p>Rotation signs out other devices using the old key. Save the new file immediately. Donor receipt keys stay separate.</p><Button disabled={busy} onClick={()=>manage({action:"rotate"})}>Rotate private access</Button></details></section>
 <section><h2>Export your records</h2><p>Download requests, donor aliases, inspection notes and repair history. Access keys and handover codes are excluded. Keep this export private.</p><Button onClick={()=>download("ifixit-records.json",{name:bench.name,exported:new Date().toISOString(),repairs:bench.repairs.map(r=>({...r,offers:r.offers.map(({demoReceiptKey,...o})=>o)}))})}><Download size={16}/>Export repair records</Button></section>
 <section><h2>Leave this device</h2><p>Save your access file first. This removes remembered coordinator access from this browser and keeps your server records.</p><Button onClick={leave}>Leave this device</Button></section>
 <section className="danger-zone"><h2>Delete this workbench</h2><p>Deletes all requests, offers and outcomes from the active database. Public request links and donor receipts will stop working. Download your records first. Provider backups may retain deleted data temporarily.</p><Button onClick={()=>setRemove(!remove)} disabled={busy}>Review deletion</Button>{remove&&<form onSubmit={e=>{e.preventDefault();manage({action:"delete",confirmation:new FormData(e.currentTarget).get("confirmation")});}}><Field label={`Type ${bench.name} to confirm deletion`} name="confirmation" required autoComplete="off"/><Button className="destructive" disabled={busy}>Permanently delete workbench</Button></form>}</section>
 <p className="small-text">Independent Neighborhood Hacks project. Not affiliated with iFixit, Inc.</p></div>;
}
function PublicRequest({ id, language }) {
  const [r, setR] = useState(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const [draft, setDraft] = useState({ model: "", part: "", spec: "" });
  useEffect(() => {
    api("/requests/" + id)
      .then(setR)
      .catch((e) => setError(e.message));
  }, [id]);
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const f = new FormData(e.currentTarget),
      input = { ...Object.fromEntries(f), consent: f.has("consent") };
    try {
      const receipt = await api("/requests/" + id + "/offers", {
        method: "POST",
        body: JSON.stringify(input),
      });
      persist("rr-receipt-" + receipt.id, receipt.key);
      location.assign(`/receipt/${id}/${receipt.id}#key=${receipt.key}`);
    } catch (e) {
      setError(e.message);
      setBusy(false);
    }
  }
  return (
    <>
      <header className="public-head">
        <Logo />
        {language}
        <Tag>Donor view</Tag>
      </header>
      <main className="donor-layout">
        <ErrorBox error={error} />
        {r ? (
          <>
            {r.demo && (
              <div className="demo-notice">
                <strong>
                  Example request. Fictional part references. No real donation
                  is requested.
                </strong>
              </div>
            )}
            <div className="title-row">
              <div>
                <p className="idline">
                  {r.benchName} · Request {shortId(r.id)}
                </p>
                <h1>{r.title}</h1>
                <p>{r.purpose}</p>
              </div>
              <Tag>{r.status}</Tag>
            </div>
            <div className="donor-columns">
              <section className="request-card">
                <h2>The part that's needed</h2>
                <dl className="spec-list">
                  <div>
                    <dt>Device model</dt>
                    <dd>{r.model}</dd>
                  </div>
                  <div>
                    <dt>Exact part number</dt>
                    <dd>{r.part}</dd>
                  </div>
                  <div>
                    <dt>Specification</dt>
                    <dd>{r.spec}</dd>
                  </div>
                  <div>
                    <dt>Collection area</dt>
                    <dd>{r.area}</dd>
                  </div>
                </dl>
                <p>{r.diagnosis}</p>
                <p className="small-text">
                  Offer only a part you own and have permission to donate. Do
                  not open or dismantle a device for this form. A technician
                  will check suitability.
                </p>
              </section>
              <section>
                <h2>Offer a part</h2>
                <p>
                  Copy the labels from your own part. Leave a field blank if you
                  cannot read it. Please don't guess.
                </p>
                {r.status === "Waiting for part" ? (
                  <form onSubmit={submit}>
                    <Field
                      label="Your alias / donor reference"
                      name="alias"
                      required
                      minLength={2}
                      maxLength={50}
                      placeholder="A nickname is enough"
                    />
                    {[
                      ["model", "Device model and revision"],
                      ["part", "Part number on your part"],
                      ["spec", "Specification / connector on your part"],
                    ].map(([key, label]) => (
                      <Field
                        key={key}
                        name={key}
                        label={label}
                        value={draft[key]}
                        maxLength={key === "spec" ? 150 : 100}
                        onChange={(e) =>
                          setDraft({ ...draft, [key]: e.target.value })
                        }
                      />
                    ))}
                    <div className="comparison-preview">
                      <strong>
                        {
                          {
                            match:
                              "Labels match. Technician check still required.",
                            mismatch:
                              "Some labels differ. The repairer will see the mismatch.",
                            unknown:
                              "Some details are missing. This will need clarification.",
                          }[compare(r, draft).level]
                        }
                      </strong>
                    </div>
                    <Field label="Part condition">
                      <select name="condition">
                        <option>Untested</option>
                        <option>Tested working</option>
                      </select>
                    </Field>
                    <Field
                      label="Condition details and test notes"
                      name="note"
                      textarea
                      required
                      minLength={10}
                      maxLength={500}
                      placeholder="Say how you know it works, or clearly state that it is untested."
                    />
                    <CheckField name="consent" required>
                      I have permission to donate this part. I understand the
                      coordinator will see this offer. I have included no
                      personal or sensitive details.
                    </CheckField>
                    <ErrorBox error={error} />
                    <Button primary disabled={busy}>
                      {busy ? "Sending…" : "Send offer"}
                      <ArrowRight size={16} />
                    </Button>
                    <p className="small-text">
                      You'll receive a private receipt. Keep it to track the
                      offer, withdraw it, and confirm handover.
                    </p>
                  </form>
                ) : (
                  <Empty title="This request is not accepting offers">
                    Current status: {r.status}. Check back if the coordinator
                    reopens it.
                  </Empty>
                )}
              </section>
            </div>
          </>
        ) : (
          !error && <p>Loading request…</p>
        )}
      </main>
      <footer>
        <a href="/privacy">Privacy & pilot limits</a>
        <span>Arrange collection through your local repair coordinator.</span>
      </footer>
    </>
  );
}
function Receipt({ requestId, offerId, language }) {
  const [key, setKey] = useState(() => {
    const fragment = new URLSearchParams(location.hash.slice(1)).get("key");
    if (fragment && /^[a-f0-9]{64}$/.test(fragment)) {
      persist("rr-receipt-" + offerId, fragment);
      history.replaceState(null, "", location.pathname);
      return fragment;
    }
    return readSaved("rr-receipt-" + offerId, "");
  });
  const [data, setData] = useState(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  async function refresh() {
    if (!key) return;
    setBusy(true);
    setError("");
    try {
      setData(await api(`/receipts/${requestId}/${offerId}`, { key }));
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  useEffect(() => {
    refresh();
  }, [key]);
  return (
    <>
      <header className="public-head">
        <Logo />
        {language}
        <Tag>Private donor receipt</Tag>
      </header>
      <main className="receipt">
        <h1>Your part has a next step.</h1>
        <ErrorBox error={error} />
        {!key ? (
          <>
            <p>
              Restore the private receipt file you saved when sending the offer.
            </p>
            <label className="file-link">
              Restore donor receipt
              <input
                type="file"
                accept=".json"
                onChange={async (e) => {
                  try {
                    const f = await safeFile(e.target.files[0]);
                    if (
                      f.requestId !== requestId ||
                      f.offerId !== offerId ||
                      !/^[a-f0-9]{64}$/.test(f.key)
                    )
                      throw new Error("This file does not match this receipt.");
                    persist("rr-receipt-" + offerId, f.key);
                    setKey(f.key);
                  } catch (e) {
                    setError(e.message);
                  }
                }}
              />
            </label>
          </>
        ) : data ? (
          <>
            {data.request.demo && (
              <p className="demo-notice">
                Example receipt. No real-world donation or repair is claimed.
              </p>
            )}
            <div className="receipt-card">
              <Tag tone={data.offer.status === "Received" ? "good" : ""}>
                {data.offer.status}
              </Tag>
              <h2>{data.request.title}</h2>
              <p>
                Offered by {data.offer.alias} to {data.request.benchName}
              </p>
              <MatchTable r={data.request} o={data.offer} />
              <div className="handover">
                <span>Your handover code</span>
                <strong>{data.offer.code}</strong>
                <p>
                  Share this code only with the coordinator when you physically
                  hand over the part. It is not proof of safety or ownership.
                </p>
              </div>
              <p>Collection area: {data.request.area}</p>
              {data.offer.review && (
                <p>Coordinator note: {data.offer.review}</p>
              )}
              <p>
                Repair status: <strong>{data.request.status}</strong>
              </p>
              <div className="actions">
                <Button primary disabled={busy} onClick={refresh}>
                  <RefreshCw size={16} />
                  Refresh status
                </Button>
                <Button
                  onClick={() =>
                    download("ifixit-private-receipt.json", {
                      version: 1,
                      requestId,
                      offerId,
                      key,
                    })
                  }
                >
                  <Download size={16} />
                  Save private receipt
                </Button>
              </div>
              {["Offered", "Reserved"].includes(data.offer.status) && (
                <details>
                  <summary>Withdraw this offer</summary>
                  <p>
                    This releases any reservation. You still keep a record in
                    this receipt.
                  </p>
                  <Button
                    disabled={busy}
                    onClick={async () => {
                      setBusy(true);
                      try {
                        await api(`/receipts/${requestId}/${offerId}`, {
                          key,
                          method: "POST",
                          body: JSON.stringify({ consent: true }),
                        });
                        await refresh();
                      } catch (e) {
                        setError(e.message);
                      } finally {
                        setBusy(false);
                      }
                    }}
                  >
                    Confirm withdrawal
                  </Button>
                </details>
              )}
            </div>
          </>
        ) : (
          <p>
            {busy
              ? "Loading your receipt…"
              : "Receipt unavailable. Use Refresh to retry."}
            <Button onClick={refresh}>Refresh</Button>
          </p>
        )}
        <p className="small-text">
          Keep this page and its access file private. The coordinator cannot
          read your receipt key for a real offer.
        </p>
        <a href={"/r/" + requestId}>
          Back to public request <ArrowUpRight size={16} />
        </a>
      </main>
    </>
  );
}
class ErrorBoundary extends React.Component {
  state = { error: false };
  static getDerivedStateFromError() {
    return { error: true };
  }
  render() {
    return this.state.error ? (
      <main className="receipt">
        <h1>Something did not load.</h1>
        <p>Your saved server records are unchanged. Reload to try again.</p>
        <Button onClick={() => location.reload()}>Reload iFixit</Button>
      </main>
    ) : (
      this.props.children
    );
  }
}
createRoot(document.getElementById("root")).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>,
);
