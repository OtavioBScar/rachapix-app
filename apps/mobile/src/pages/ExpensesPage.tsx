import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

import { PrimaryButton } from "../components/AppButton";
import { EmptyState } from "../components/EmptyState";
import { ListItem } from "../components/ListItem";
import { Section } from "../components/Section";
import { styles } from "../styles/common";
import type { Expense, Friend } from "../types";
import { formatCents, parseMoneyToCents } from "../utils/money";
import { optionalText } from "../utils/text";

interface ExpensesPageProps {
  busy: boolean;
  expenses: Expense[];
  friends: Friend[];
  onCreateExpense: (input: {
    title: string;
    description?: string;
    originalAmountCents: number;
    participantUserIds: string[];
  }) => Promise<void>;
  onValidationError: (message: string) => void;
}

export function ExpensesPage({ busy, expenses, friends, onCreateExpense, onValidationError }: ExpensesPageProps) {
  const [selectedFriendIds, setSelectedFriendIds] = useState<string[]>([]);
  const [form, setForm] = useState({
    title: "",
    amount: "",
    description: "",
  });

  async function handleCreateExpense() {
    const amountCents = parseMoneyToCents(form.amount);

    if (!amountCents) {
      onValidationError("Informe um valor valido para a despesa.");
      return;
    }

    if (selectedFriendIds.length === 0) {
      onValidationError("Selecione ao menos um amigo para dividir.");
      return;
    }

    await onCreateExpense({
      title: form.title,
      description: optionalText(form.description),
      originalAmountCents: amountCents,
      participantUserIds: selectedFriendIds,
    });
    setForm({ title: "", amount: "", description: "" });
    setSelectedFriendIds([]);
  }

  function toggleFriend(friendId: string) {
    setSelectedFriendIds((current) =>
      current.includes(friendId) ? current.filter((id) => id !== friendId) : [...current, friendId],
    );
  }

  return (
    <Section title="Nova despesa">
      <TextInput
        onChangeText={(title) => setForm((current) => ({ ...current, title }))}
        placeholder="Titulo"
        style={styles.input}
        value={form.title}
      />
      <TextInput
        keyboardType="decimal-pad"
        onChangeText={(amount) => setForm((current) => ({ ...current, amount }))}
        placeholder="Valor total, ex: 89,90"
        style={styles.input}
        value={form.amount}
      />
      <TextInput
        onChangeText={(description) => setForm((current) => ({ ...current, description }))}
        placeholder="Descricao opcional"
        style={styles.input}
        value={form.description}
      />
      <Text style={styles.fieldLabel}>Participantes</Text>
      <View style={styles.chipRow}>
        {friends.length === 0 ? (
          <Text style={styles.mutedText}>Adicione amigos antes de criar uma despesa.</Text>
        ) : (
          friends.map((friend) => {
            const selected = selectedFriendIds.includes(friend.friend.id);

            return (
              <Pressable
                key={friend.id}
                onPress={() => toggleFriend(friend.friend.id)}
                style={[styles.chip, selected && styles.chipActive]}
              >
                <Text style={[styles.chipText, selected && styles.chipTextActive]}>{friend.friend.name}</Text>
              </Pressable>
            );
          })
        )}
      </View>
      <PrimaryButton label="Criar despesa" loading={busy} onPress={handleCreateExpense} />

      <Text style={styles.sectionDivider}>Despesas criadas</Text>
      {expenses.length === 0 ? (
        <EmptyState text="Voce ainda nao criou despesas." />
      ) : (
        expenses.map((expense) => (
          <ListItem
            key={expense.id}
            footer={`${expense.status} - ${expense.participantCount} participantes`}
            title={expense.title}
            value={formatCents(expense.originalAmountCents)}
          />
        ))
      )}
    </Section>
  );
}
