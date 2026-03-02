import { useState } from "react";
import { I18nProvider } from "@/context/I18nContext";
import { useTranslation } from "@/i18n/useTranslation";
import { usePlanningPeriods } from "@/hooks/usePlanningPeriods";
import { Button, Card, ConfirmDialog, Input, Modal, Select, Spinner, Textarea } from "@/components/ui";
import { GoalProgressCard } from "./GoalProgressCard";
import type { MonthGoalPayload } from "./types";
import "./MonthStart.css";

function MonthStartContent() {
  const { t } = useTranslation();
  const [saving, setSaving] = useState(false);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingGoalIndex, setEditingGoalIndex] = useState<number | null>(null);
  const [deleteConfirmIndex, setDeleteConfirmIndex] = useState<number | null>(null);
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formLinkedQuarterGoalId, setFormLinkedQuarterGoalId] = useState("");
  const [formTitleError, setFormTitleError] = useState<string | null>(null);
  const {
    periods,
    monthGoals,
    quarterGoals,
    updateGoalProgress,
    replaceMonthGoals,
    refreshPeriod,
  } = usePlanningPeriods();

  const state = periods.month;
  const isLoading = state.loading;
  const error = state.error;

  const openAddModal = () => {
    setEditingGoalIndex(null);
    setFormTitle("");
    setFormDescription("");
    setFormLinkedQuarterGoalId(quarterGoals?.[0]?.id ?? "");
    setFormTitleError(null);
    setFormModalOpen(true);
  };

  const openEditModal = (index: number) => {
    const goal = monthGoals?.[index];
    if (!goal) return;
    setEditingGoalIndex(index);
    setFormTitle(goal.title);
    setFormDescription(goal.description ?? "");
    setFormLinkedQuarterGoalId(goal.linkedQuarterGoals?.[0] ?? "");
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
      setFormTitleError(t("planning.month.formTitleRequired"));
      return;
    }
    setFormTitleError(null);
    setSaving(true);
    try {
      const current = monthGoals ?? [];
      const baseGoals = current.map((g) => ({
        title: g.title,
        description: g.description,
        linkedQuarterGoalId: g.linkedQuarterGoals?.[0] ?? "",
      }));
      const updatedGoal = {
        title,
        description: formDescription.trim(),
        linkedQuarterGoalId: formLinkedQuarterGoalId || "",
      };
      if (editingGoalIndex !== null) {
        baseGoals[editingGoalIndex] = updatedGoal;
        await replaceMonthGoals(baseGoals);
      } else {
        await replaceMonthGoals([...baseGoals, updatedGoal]);
      }
      closeFormModal();
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteGoal = async () => {
    if (deleteConfirmIndex === null) return;
    const current = monthGoals ?? [];
    const filtered = current
      .filter((_, i) => i !== deleteConfirmIndex)
      .map((g) => ({
        title: g.title,
        description: g.description,
        linkedQuarterGoalId: g.linkedQuarterGoals?.[0] ?? "",
      }));
    setSaving(true);
    try {
      await replaceMonthGoals(filtered);
      setDeleteConfirmIndex(null);
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <section className="month-start">
        <div className="month-start__loading">
          <Spinner size="md" />
          <p>{t("planning.month.loading")}</p>
        </div>
      </section>
    );
  }

  if (error && !monthGoals?.length) {
    return (
      <section className="month-start">
        <Card variant="accent">
          <p className="month-start__error">{error}</p>
          <Button variant="secondary" onClick={() => void refreshPeriod("month")}>
            {t("common.retry")}
          </Button>
        </Card>
      </section>
    );
  }

  return (
    <section className="month-start" aria-label={t("planning.month.title")}>
      <header className="month-start__header">
        <h1>{t("planning.month.title")}</h1>
        <p>{t("planning.month.subtitle")}</p>
      </header>

      {error ? (
        <div className="month-start__error-row" role="alert">
          <p className="month-start__error">{error}</p>
          <Button variant="secondary" size="sm" onClick={() => void refreshPeriod("month")}>
            {t("common.retry")}
          </Button>
        </div>
      ) : null}

      <div className="month-start__actions">
        <Button variant="primary" onClick={openAddModal} disabled={saving}>
          {t("planning.month.addGoal")}
        </Button>
      </div>

      <Modal
        isOpen={formModalOpen}
        title={editingGoalIndex !== null ? t("planning.month.editGoalModalTitle") : t("planning.month.addGoalModalTitle")}
        onClose={closeFormModal}
        footer={
          <>
            <Button variant="ghost" onClick={closeFormModal} disabled={saving}>
              {t("common.cancel")}
            </Button>
            <Button variant="primary" type="submit" form="month-add-goal-form" disabled={saving} loading={saving}>
              {t("common.save")}
            </Button>
          </>
        }
      >
        <form id="month-add-goal-form" onSubmit={handleSubmitGoal} className="month-start__add-form">
          <Input
            label={t("planning.month.formTitle")}
            value={formTitle}
            onChange={(e) => {
              setFormTitle(e.target.value);
              setFormTitleError(null);
            }}
            placeholder={t("planning.month.formTitlePlaceholder")}
            error={formTitleError ?? undefined}
            required
            autoFocus
          />
          <Textarea
            label={t("planning.month.formDescription")}
            value={formDescription}
            onChange={(e) => setFormDescription(e.target.value)}
            placeholder={t("planning.month.formDescriptionPlaceholder")}
            rows={3}
          />
          {quarterGoals && quarterGoals.length > 0 ? (
            <Select
              label={t("planning.month.formLinkedQuarter")}
              value={formLinkedQuarterGoalId}
              onChange={(e) => setFormLinkedQuarterGoalId(e.target.value)}
              options={[
                { value: "", label: t("planning.month.formLinkedQuarterNone") },
                ...quarterGoals.map((q) => ({ value: q.id, label: q.title || q.smartDefinition || "—" })),
              ]}
            />
          ) : null}
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={deleteConfirmIndex !== null}
        title={t("planning.month.deleteGoalTitle")}
        description={t("planning.month.deleteGoalDescription")}
        confirmLabel={t("common.delete")}
        cancelLabel={t("common.cancel")}
        destructive
        isConfirming={saving}
        onConfirm={() => void handleDeleteGoal()}
        onCancel={() => setDeleteConfirmIndex(null)}
      />

      {!monthGoals || monthGoals.length === 0 ? (
        <p className="month-start__empty">{t("planning.month.empty")}</p>
      ) : (
        <div className="month-start__goal-list">
          {monthGoals.map((goal: MonthGoalPayload, index: number) => (
            <GoalProgressCard
              key={goal.id}
              title={goal.title}
              description={goal.description}
              progress={goal.progress}
              onProgressChange={(progress) => void updateGoalProgress("month", index, progress)}
              readOnly={false}
              linkedGoals={
                goal.linkedQuarterGoals?.length
                  ? quarterGoals
                      ?.filter((q) => goal.linkedQuarterGoals?.includes(q.id))
                      .map((q) => ({ id: q.id, title: q.title, href: "/planning/quarter" })) ?? []
                  : []
              }
              onEdit={() => openEditModal(index)}
              onDelete={() => setDeleteConfirmIndex(index)}
              editLabel={t("planning.month.editGoal")}
              deleteLabel={t("planning.month.deleteGoal")}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export function MonthStart() {
  return (
    <I18nProvider>
      <MonthStartContent />
    </I18nProvider>
  );
}
