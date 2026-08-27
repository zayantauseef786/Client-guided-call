"use client";

import { useState } from "react";
import Button from "../ui/Button";
import TextField from "../ui/TextField";

interface Props {
  name: string;
  email: string;
  age13Confirmed: boolean;
  onChange: (partial: { name?: string; email?: string; age13Confirmed?: boolean }) => void;
  onContinue: () => void;
}

export default function SignUpStep({ name, email, age13Confirmed, onChange, onContinue }: Props) {
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [password, setPassword] = useState("");
  const valid = name.trim().length > 1 && /\S+@\S+\.\S+/.test(email) && password.length >= 6 && age13Confirmed;

  return (
    <div className="px-6 pb-8 flex flex-col gap-5">
      <Button
        variant="secondary"
        fullWidth
        onClick={() => onChange({ name: name || "Alex Rivera", email: email || "alex.rivera@example.com" })}
      >
        <svg width="18" height="18" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.7-2.4 3.6v3h3.9c2.3-2.1 3.5-5.2 3.5-8.8z" />
          <path fill="#34A853" d="M12 24c3.2 0 5.9-1.1 7.9-2.9l-3.9-3c-1.1.7-2.4 1.2-4 1.2-3.1 0-5.7-2.1-6.6-4.9H1.4v3.1C3.4 21.4 7.4 24 12 24z" />
          <path fill="#FBBC05" d="M5.4 14.4c-.2-.7-.4-1.5-.4-2.4s.1-1.6.4-2.4V6.5H1.4A12 12 0 000 12c0 1.9.5 3.8 1.4 5.5l4-3.1z" />
          <path fill="#EA4335" d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4C17.9 1.2 15.2 0 12 0 7.4 0 3.4 2.6 1.4 6.5l4 3.1c.9-2.8 3.5-4.8 6.6-4.8z" />
        </svg>
        Continue with Google
      </Button>

      <div className="flex items-center gap-3">
        <div className="h-px flex-1" style={{ background: "var(--stone-border)" }} />
        <span className="text-xs font-semibold" style={{ color: "var(--fg-subtle)" }}>or use email</span>
        <div className="h-px flex-1" style={{ background: "var(--stone-border)" }} />
      </div>

      <TextField
        label="Name"
        placeholder="Your name"
        value={name}
        onChange={(e) => onChange({ name: e.target.value })}
      />
      <TextField
        label="Email"
        type="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => onChange({ email: e.target.value })}
      />
      <TextField
        label="Password"
        type="password"
        placeholder="At least 6 characters"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <label className="flex items-start gap-3 text-sm" style={{ color: "var(--fg-muted)" }}>
        <input
          type="checkbox"
          checked={age13Confirmed}
          onChange={(e) => onChange({ age13Confirmed: e.target.checked })}
          className="mt-0.5 w-5 h-5 accent-[var(--ganzy-orange)]"
        />
        I confirm I&apos;m 13 years of age or older.
      </label>

      <p className="text-xs" style={{ color: "var(--fg-subtle)" }}>
        Ganzy is a planner, not a tutor — it works alongside tools like Khan Academy, Bluebook, and Canvas.
      </p>

      <button
        onClick={() => setShowPrivacy((v) => !v)}
        className="text-sm font-bold text-left"
        style={{ color: "var(--ganzy-orange)" }}
      >
        What we collect →
      </button>
      {showPrivacy && (
        <p className="text-xs -mt-3" style={{ color: "var(--fg-subtle)" }}>
          Just your name, email, and the study preferences you enter here. Everything is stored on
          this device only — nothing is sent to a server in this preview.
        </p>
      )}

      <Button fullWidth size="lg" disabled={!valid} onClick={onContinue}>
        Create Account →
      </Button>
    </div>
  );
}
