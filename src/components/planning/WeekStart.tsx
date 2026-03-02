import { useState } from "react";
import { I18nProvider } from "@/context/I18nContext";
import { useTranslation } from "@/i18n/useTranslation";
import { usePlanningPeriods } from "@/hooks/usePlanningPeriods";
import { Button, Card, Checkbox, ConfirmDialog, Input, Modal, Select, Spinner, Textarea } from "@/components/ui";
import { GoalProgressCard } from "./GoalProgressCard";
import { WeekAgenda } from "./WeekAgenda";
import "./WeekStart.css";

function WeekStartContent() {
  const { t } = useTranslation();
  const [saving, setSaving] = useState(false);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingGoalIndex, setEditingGoalIndex] = useState<number | null>(null);
  const [deleteConfirmIndex, setDeleteConfirmIndex] = useState<number | null>(null);
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formLinkedMonthGoalId, setFormLinkedMonthGoalId] = useState("");
  const [formAssignedDays, setFormAssignedDays] = useState<number[]>([]);
  const [formTitleError, setFormTitleError] = useState<string | null>(null);
  const {
    periods,
    weekGoals,
    monthGoals,
    updateGoalProgress,
    replaceWeekGoals,
    refreshPeriod,
  } = usePlanningPeriods();
  const weekDocKey = periods.week.viewModel?.docKey ?? "";

  const state = periods.week;
  const isLoading = state.loading;
  const error = state.error;
  const viewModel = state.viewModel;

  const openAddModal = () => {
    setEditingGoalIndex(null);
    setFormTitle("");
    setFormDescription("");
    setFormLinkedMonthGoalId(monthGoals?.[0]?.id ?? "");
    setFormAssignedDays([]);
    setFormTitleError(null);
    setFormModalOpen(true);
  };

  const openEditModal = (index: number) => {
    const goal = weekGoals?.[index];
    if (!goal) return;
    setEditingGoalIndex(index);
    setFormTitle(goal.title);
    setFormDescription(goal.description ?? "");
    setFormLinkedMonthGoalId(goal.linkedMonthGoals?.[0] ?? "");
    setFormAssignedDays(goal.assignedDays ?? []);
    setFormTitleError(null);
    setFormModalOpen(true);
  };

  const closeFormModal = () => {
    setFormModalOpen(false);
    setEditingGoalIndex(null);
  };

  const handleSubmitGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    const title = formTitle.trim();
    if (!title) {
      setFormTitleError(t("planning.week.formTitleRequired"));
      return;
    }
    setFormTitleError(null);
    setSaving(true);
    try {
      const current = weekGoals ?? [];
      const baseGoals = current.map((g) => ({
        id: g.id,
        title: g.title,
        description: g.description,
        linkedMonthGoalId: g.linkedMonthGoals?.[0] ?? "",
        progress: g.progress,
        assignedDays: g.assignedDays ?? [],
      }));
      const updatedGoal = {
        id: editingGoalIndex !== null && current[editingGoalIndex] ? current[editingGoalIndex].id : undefined,
        title,
        description: formDescription.trim(),
        linkedMonthGoalId: formLinkedMonthGoalId || "",
        progress: editingGoalIndex !== null && current[editingGoalIndex] ? current[editingGoalIndex].progress : 0,
        assignedDays: formAssignedDays,
      };
      if (editingGoalIndex !== null) {
        baseGoals[editingGoalIndex] = { ...updatedGoal, id: updatedGoal.id ?? baseGoals[editingGoalIndex]!.id };
        await replaceWeekGoals(baseGoals);
      } else {
        await replaceWeekGoals([...baseGoals, updatedGoal]);
      }
      closeFormModal();
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteGoal = async () => {
    if (deleteConfirmIndex === null) return;
    const current = weekGoals ?? [];
    const filtered = current
      .filter((_, i) => i !== deleteConfirmIndex)
      .map((g) => ({
        id: g.id,
        title: g.title,
        description: g.description,
        linkedMonthGoalId: g.linkedMonthGoals?.[0] ?? "",
        progress: g.progress,
        assignedDays: g.assignedDays ?? [],
      }));
    setSaving(true);
    try {
      await replaceWeekGoals(filtered);
      setDeleteConfirmIndex(null);
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <section className="week-start">
        <div className="week-start__loading">
          <Spinner size="md" />
          <p>{t("planning.week.loading")}</p>
        </div>
      </section>
    );
  }

  if (error && !weekGoals?.length) {
    return (
      <section className="week-start">
        <Card variant="accent">
          <p className="week-start__error">{error}</p>
          <Button variant="secondary" onClick={() => void refreshPeriod("week")}>
            {t("common.retry")}
          </Button>
        </Card>
      </section>
    );
  }

  const weekDayStatuses = viewModel?.goals?.[0]?.weekDayStatuses;

  return (
    <section className="week-start" aria-label={t("planning.week.title")}>
      <header className="week-start__header">
        <h1>{t("planning.week.title")}</h1>
        <p>{t("planning.week.subtitle")}</p>
      </header>

      {error ? (
        <div className="week-start__error-row" role="alert">
          <p className="week-start__error">{error}</p>
          <Button variant="secondary" size="sm" onClick={() => void refreshPeriod("week")}>
            {t("common.retry")}
          </Button>
        </div>
      ) : null}

      {weekDayStatuses && weekDayStatuses.length === 7 ? (
        <div className="week-start__status-strip" role="img" aria-label="Week day status">
          {weekDayStatuses.map((status, i) => (
            <div
              key={i}
              className={`week-start__status week-start__status--${status}`}
              title={`${t(`planning.week.dayStatus.${status}`)}`}
            >
              {Number(i) + 1}
            </div>
          ))}
        </div>
      ) : null}

      <Modal
        isOpen={formModalOpen}
        title={editingGoalIndex !== null ? t("planning.week.editGoalModalTitle") : t("planning.week.addGoalModalTitle")}
        onClose={closeFormModal}
        footer={
          <>
            <Button variant="ghost" onClick={closeFormModal} disabled={saving}>
              {t("common.cancel")}
            </Button>
            <Button variant="primary" type="submit" form="week-add-goal-form" disabled={saving} loading={saving}>
              {t("common.save")}
            </Button>
          </>
        }
      >
        <form id="week-add-goal-form" onSubmit={handleSubmitGoal} className="week-start__add-form">
          <Input
            label={t("planning.week.formTitle")}
            value={formTitle}
            onChange={(e) => {
              setFormTitle(e.target.value);
              setFormTitleError(null);
            }}
            placeholder={t("planning.week.formTitlePlaceholder")}
            error={formTitleError ?? undefined}
            required
            autoFocus
          />
          <Textarea
            label={t("planning.week.formDescription")}
            value={formDescription}
            onChange={(e) => setFormDescription(e.target.value)}
            placeholder={t("planning.week.formDescriptionPlaceholder")}
            rows={3}
          />
          {monthGoals && monthGoals.length > 0 ? (
            <Select
              label={t("planning.week.formLinkedMonth")}
              value={formLinkedMonthGoalId}
              onChange={(e) => setFormLinkedMonthGoalId(e.target.value)}
              options={[
                { value: "", label: t("planning.week.formLinkedMonthNone") },
                ...monthGoals.map((m) => ({ value: m.id, label: m.title || "—" })),
              ]}
            />
          ) : null}
          <div className="week-start__form-days">
            <span className="week-start__form-days-label">{t("planning.week.formAssignedDays")}</span>
            <div className="week-start__form-days-row">
              {[0, 1, 2, 3, 4, 5, 6].map((dayIndex) => (
                <Checkbox
                  key={dayIndex}
                  label={t(`planning.week.dayShort.${dayIndex}`)}
                  checked={formAssignedDays.includes(dayIndex)}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setFormAssignedDays((prev) =>
                      checked ? [...prev, dayIndex].sort((a, b) => a - b) : prev.filter((d) => d !== dayIndex),
                    );
                  }}
                  className="week-start__form-day"
                />
              ))}
            </div>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={deleteConfirmIndex !== null}
        title={t("planning.week.deleteGoalTitle")}
        description={t("planning.week.deleteGoalDescription")}
        confirmLabel={t("common.delete")}
        cancelLabel={t("common.cancel")}
        destructive
        isConfirming={saving}
        onConfirm={() => void handleDeleteGoal()}
        onCancel={() => setDeleteConfirmIndex(null)}
      />

      <WeekAgenda
        weekDocKey={weekDocKey}
        weekGoals={weekGoals ?? []}
        monthGoals={monthGoals ?? []}
        onAddGoal={openAddModal}
        onEditGoal={openEditModal}
        onDeleteGoal={(index) => setDeleteConfirmIndex(index)}
        onProgressChange={(index, progress) => void updateGoalProgress("week", index, progress)}
        editLabel={t("planning.week.editGoal")}
        deleteLabel={t("planning.week.deleteGoal")}
        emptyLabel={t("planning.week.empty")}
      />
    </section>
  );
}

export function WeekStart() {
  return (
    <I18nProvider>
      <WeekStartContent />
    </I18nProvider>
  );
}
