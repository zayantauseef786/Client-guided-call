"use client";

import { WHY_TAGS } from "@/lib/constants";
import Button from "../ui/Button";
import Chip from "../ui/Chip";
import TextField from "../ui/TextField";

const SCHOOL_YEARS = ["Freshman", "Sophomore", "Junior", "Senior"];

interface Props {
  schoolYear: string;
  collegeGoal: string;
  whyTags: string[];
  onChange: (partial: { schoolYear?: string; collegeGoal?: string; whyTags?: string[] }) => void;
  onContinue: () => void;
}

export default function BasicsStep({ schoolYear, collegeGoal, whyTags, onChange, onContinue }: Props) {
  const toggleTag = (tag: string) => {
    onChange({
      whyTags: whyTags.includes(tag) ? whyTags.filter((t) => t !== tag) : [...whyTags, tag],
    });
  };

  return (
    <div className="px-6 pb-8 flex flex-col gap-6">
      <div>
        <span className="text-xs font-bold uppercase tracking-[0.06em]" style={{ color: "var(--fg-label)" }}>
          School year
        </span>
        <div className="flex flex-wrap gap-2 mt-2">
          {SCHOOL_YEARS.map((y) => (
            <Chip key={y} active={schoolYear === y} onClick={() => onChange({ schoolYear: y })}>
              {y}
            </Chip>
          ))}
        </div>
      </div>

      <TextField
        label="Dream college or goal (optional)"
        placeholder="e.g. Stanford, or 'a strong scholarship'"
        value={collegeGoal}
        onChange={(e) => onChange({ collegeGoal: e.target.value })}
      />

      <div>
        <span className="text-xs font-bold uppercase tracking-[0.06em]" style={{ color: "var(--fg-label)" }}>
          Why does this matter to you?
        </span>
        <div className="flex flex-wrap gap-2 mt-2">
          {WHY_TAGS.map((tag) => (
            <Chip key={tag} active={whyTags.includes(tag)} onClick={() => toggleTag(tag)}>
              {tag}
            </Chip>
          ))}
        </div>
      </div>

      <Button fullWidth size="lg" disabled={!schoolYear} onClick={onContinue}>
        Continue →
      </Button>
    </div>
  );
}
