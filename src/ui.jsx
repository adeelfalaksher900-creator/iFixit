import React, { useState, useEffect, useRef } from "react";
import {
  ArrowUpRight,
  ArrowLeft,
  Check,
  Copy,
  RefreshCw,
  Plus,
  X,
  ArrowRight,
  Download,
  Search,
  CheckCircle2,
  Clock3,
  SlidersHorizontal,
  Layers,
  BookOpen,
  KeyRound,
  Menu,
  Unplug,
  Wrench,
  PackageCheck,
  AlertCircle,
  ChevronRight,
  MemoryStick,
  Keyboard,
  Fan,
  Link2,
} from "lucide-react";
export {
  ArrowUpRight,
  ArrowLeft,
  Check,
  Copy,
  RefreshCw,
  Plus,
  X,
  ArrowRight,
  Download,
  Search,
  CheckCircle2,
  Clock3,
  SlidersHorizontal,
  Layers,
  BookOpen,
  KeyRound,
  Menu,
  Unplug,
  Wrench,
  PackageCheck,
  AlertCircle,
  ChevronRight,
  MemoryStick,
  Keyboard,
  Fan,
  Link2,
};
export function Logo() {
  return (
    <a className="brand" href="/" aria-label="RepairRelay home">
      <svg viewBox="0 0 32 32" width="30" height="30" aria-hidden="true">
        <path
          d="M6 25V7h12a6 6 0 1 1 0 12h-5l10 9M5 15h8"
          stroke="currentColor"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span>
        RepairRelay<span className="brand-dot">.</span>
      </span>
    </a>
  );
}
export const date = (n) =>
  new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(n);
export function Button({ children, primary = false, small = false, ...props }) {
  return (
    <button
      {...props}
      className={`${primary ? "primary" : "button"} ${small ? "small" : ""} ${props.className || ""}`}
    >
      {children}
    </button>
  );
}
export function Tag({ children, tone = "" }) {
  return <span className={`tag ${tone}`}>{children}</span>;
}
export function Field({ label, name, textarea = false, children, ...props }) {
  const id = React.useId();
  return (
    <label className="field" htmlFor={id}>
      <span>{label}</span>
      {children ? (
        React.cloneElement(children, { id })
      ) : textarea ? (
        <textarea id={id} name={name} {...props} />
      ) : (
        <input id={id} name={name} {...props} />
      )}
    </label>
  );
}
export function CheckField({ children, ...props }) {
  return (
    <label className="check-field">
      <input type="checkbox" {...props} />
      <span>{children}</span>
    </label>
  );
}
export function ErrorBox({ error }) {
  return error ? (
    <div className="error" role="alert">
      <AlertCircle size={18} />
      <span>{error}</span>
    </div>
  ) : null;
}
export function Empty({ title, children }) {
  return (
    <div className="empty">
      <PackageCheck size={28} />
      <h2>{title}</h2>
      <p>{children}</p>
    </div>
  );
}
export function CopyLink({ value, label = "Copy link" }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="copy-row">
      <input aria-label={label + " value"} readOnly value={value} />
      <Button
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(value);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          } catch {
            setCopied(false);
          }
        }}
      >
        {copied ? <Check size={16} /> : <Copy size={16} />}{" "}
        {copied ? "Copied" : label}
      </Button>
    </div>
  );
}
export function Modal({ title, onClose, children }) {
  const ref = useRef();
  useEffect(() => {
    const el = ref.current,
      previous = document.activeElement;
    el.showModal();
    return () => {
      el.close();
      previous?.focus();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
    >
      <div className="modal-head">
        <h2>{title}</h2>
        <Button aria-label="Close dialog" onClick={onClose}>
          <X size={20} />
        </Button>
      </div>
      {children}
    </dialog>
  );
}
export function download(name, data, type = "application/json") {
  const url = URL.createObjectURL(
    new Blob(
      [typeof data === "string" ? data : JSON.stringify(data, null, 2)],
      { type },
    ),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export async function api(path, { key, ...options } = {}) {
  const r = await fetch("/api" + path, {
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(key ? { Authorization: "Bearer " + key } : {}),
      ...options.headers,
    },
  });
  const data = await r.json();
  if (!r.ok) throw new Error(data.error || "Request failed. Please retry.");
  return data;
}
export function readSaved(key, fallback = null) {
  try {
    return JSON.parse(localStorage.getItem(key)) || fallback;
  } catch {
    return fallback;
  }
}
export function persist(key, v) {
  try {
    localStorage.setItem(key, JSON.stringify(v));
    return true;
  } catch {
    return false;
  }
}
