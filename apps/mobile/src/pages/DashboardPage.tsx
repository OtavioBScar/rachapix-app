import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, SafeAreaView, ScrollView, Text, View } from "react-native";

import {
  acceptFriendInvitation,
  createExpense,
  createFriendInvitation,
  generatePixForCharge,
  getDashboard,
  rejectFriendInvitation,
  updateMe,
} from "../api";
import { Feedback } from "../components/Feedback";
import { SummaryBox } from "../components/SummaryBox";
import { TabBar } from "../components/TabBar";
import type { AppTab } from "../components/TabBar";
import { styles } from "../styles/common";
import type { Charge, CreateExpenseInput, Expense, Friend, Invitation, PublicUser, UpdateMeInput } from "../types";
import { formatCents } from "../utils/money";
import { ChargesPage } from "./ChargesPage";
import { ExpensesPage } from "./ExpensesPage";
import { FriendsPage } from "./FriendsPage";
import { ProfilePage } from "./ProfilePage";

interface DashboardPageProps {
  initialUser: PublicUser;
  onLogout: () => void;
  token: string;
}

export function DashboardPage({ initialUser, onLogout, token }: DashboardPageProps) {
  const [activeTab, setActiveTab] = useState<AppTab>("charges");
  const [user, setUser] = useState(initialUser);
  const [charges, setCharges] = useState<Charge[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [incomingInvites, setIncomingInvites] = useState<Invitation[]>([]);
  const [outgoingInvites, setOutgoingInvites] = useState<Invitation[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pixCode, setPixCode] = useState<string | null>(null);

  const totals = useMemo(() => {
    const pendingCharges = charges.reduce((sum, charge) => {
      if (charge.status === "PAID" || charge.status === "CANCELED") {
        return sum;
      }

      return sum + charge.amountCents;
    }, 0);
    const ownedExpenses = expenses.reduce((sum, expense) => sum + expense.originalAmountCents, 0);

    return { pendingCharges, ownedExpenses };
  }, [charges, expenses]);

  const loadDashboard = useCallback(async () => {
    const result = await getDashboard(token);
    setUser(result.user);
    setCharges(result.charges);
    setExpenses(result.expenses);
    setFriends(result.friends);
    setIncomingInvites(result.invitations.incoming);
    setOutgoingInvites(result.invitations.outgoing);
  }, [token]);

  useEffect(() => {
    runAction(loadDashboard);
  }, [loadDashboard]);

  async function runAction(action: () => Promise<void>, successMessage?: string) {
    setBusy(true);
    setError(null);
    setMessage(null);

    try {
      await action();
      if (successMessage) {
        setMessage(successMessage);
      }
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Nao foi possivel concluir a acao.");
    } finally {
      setBusy(false);
    }
  }

  function showValidationError(validationError: string) {
    setMessage(null);
    setError(validationError);
  }

  async function handleCreateExpense(input: CreateExpenseInput) {
    await runAction(async () => {
      await createExpense(token, input);
      await loadDashboard();
    }, "Despesa criada.");
  }

  async function handleInvite(email: string) {
    await runAction(async () => {
      await createFriendInvitation(token, email);
      await loadDashboard();
    }, "Convite enviado.");
  }

  async function handleInvitation(id: string, action: "accept" | "reject") {
    await runAction(async () => {
      if (action === "accept") {
        await acceptFriendInvitation(token, id);
      } else {
        await rejectFriendInvitation(token, id);
      }

      await loadDashboard();
    }, action === "accept" ? "Convite aceito." : "Convite recusado.");
  }

  async function handleGeneratePix(chargeId: string) {
    await runAction(async () => {
      const payment = await generatePixForCharge(token, chargeId);
      setPixCode(payment.pixCode);
      await loadDashboard();
    }, "Pix gerado.");
  }

  async function handleUpdateProfile(input: UpdateMeInput) {
    await runAction(async () => {
      const updatedUser = await updateMe(token, input);
      setUser(updatedUser);
      await loadDashboard();
    }, "Perfil atualizado.");
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>RachaPix</Text>
          <Text style={styles.title}>Oi, {user.name}</Text>
        </View>
        <Pressable onPress={() => runAction(loadDashboard, "Dados atualizados.")} style={styles.iconButton}>
          {busy ? <ActivityIndicator color="#0F172A" size="small" /> : <Text style={styles.iconButtonText}>Atualizar</Text>}
        </Pressable>
      </View>

      <View style={styles.summaryRow}>
        <SummaryBox label="A pagar" value={formatCents(totals.pendingCharges)} tone="amber" />
        <SummaryBox label="Criadas" value={formatCents(totals.ownedExpenses)} tone="green" />
      </View>

      <TabBar activeTab={activeTab} onChange={setActiveTab} />

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Feedback error={error} message={message} />
        {activeTab === "charges" && (
          <ChargesPage charges={charges} onGeneratePix={handleGeneratePix} pixCode={pixCode} />
        )}
        {activeTab === "expenses" && (
          <ExpensesPage
            busy={busy}
            expenses={expenses}
            friends={friends}
            onCreateExpense={handleCreateExpense}
            onValidationError={showValidationError}
          />
        )}
        {activeTab === "friends" && (
          <FriendsPage
            busy={busy}
            friends={friends}
            incomingInvites={incomingInvites}
            onInvitation={handleInvitation}
            onInvite={handleInvite}
            outgoingInvites={outgoingInvites}
          />
        )}
        {activeTab === "profile" && (
          <ProfilePage busy={busy} onLogout={onLogout} onUpdateProfile={handleUpdateProfile} user={user} />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
