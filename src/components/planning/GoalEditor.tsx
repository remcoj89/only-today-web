import { Input } from "@/components/ui/Input";
import { Slider } from "@/components/ui/Slider";
import { Textarea } from "@/components/ui/Textarea";
import "./GoalEditor.css";

export type GoalEditorValue = {
  title: string;
  whatIsDifferent: string;
  consequencesIfNot: string;
  rewardIfAchieved: string;
  progress: number;
};

export type GoalEditorProps = {
  goals: [GoalEditorValue, GoalEditorValue, GoalEditorValue];
  labels: {
    goalTitle: string;
    whatIsDifferent: string;
    consequencesIfNot: string;
    rewardIfAchieved: string;
    progress: string;
    goalCard: string;
  };
  titleErrors?: [string | undefined, string | undefined, string | undefined];
  onChange: <K extends keyof GoalEditorValue>(index: 0 | 1 | 2, key: K, value: GoalEditorValue[K]) => void;
};

export function GoalEditor({ goals, labels, titleErrors, onChange }: GoalEditorProps) {
  return (
    <div className="goal-editor">
      {goals.map((goal, index) => {
        const goalIndex = index as 0 | 1 | 2;
        const cardLabel = labels.goalCard.replace("{{index}}", String(index + 1));
        return (
          <article key={goalIndex} className="goal-editor__card" aria-label={cardLabel}>
            <h3 className="goal-editor__card-title">{cardLabel}</h3>
            <Input
              label={labels.goalTitle}
              value={goal.title}
              error={titleErrors?.[goalIndex]}
              onChange={(event) => onChange(goalIndex, "title", event.target.value)}
              required
            />
            <Textarea
              label={labels.whatIsDifferent}
              value={goal.whatIsDifferent}
              onChange={(event) => onChange(goalIndex, "whatIsDifferent", event.target.value)}
              rows={3}
            />
            <Textarea
              label={labels.consequencesIfNot}
              value={goal.consequencesIfNot}
              onChange={(event) => onChange(goalIndex, "consequencesIfNot", event.target.value)}
              rows={3}
            />
            <Textarea
              label={labels.rewardIfAchieved}
              value={goal.rewardIfAchieved}
              onChange={(event) => onChange(goalIndex, "rewardIfAchieved", event.target.value)}
              rows={3}
            />
            <Slider
              label={labels.progress}
              min={0}
              max={100}
              step={1}
              value={goal.progress}
              onChange={(event) => onChange(goalIndex, "progress", Number(event.target.value))}
            />
          </article>
        );
      })}
    </div>
  );
}
