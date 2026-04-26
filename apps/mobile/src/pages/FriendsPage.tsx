import { useState } from "react";
import { Text, TextInput, View } from "react-native";

import { DangerButton, PrimaryButton, SecondaryButton } from "../components/AppButton";
import { EmptyState } from "../components/EmptyState";
import { ListItem } from "../components/ListItem";
import { Section } from "../components/Section";
import { styles } from "../styles/common";
import type { Friend, Invitation } from "../types";

interface FriendsPageProps {
  busy: boolean;
  friends: Friend[];
  incomingInvites: Invitation[];
  onInvite: (email: string) => Promise<void>;
  onInvitation: (id: string, action: "accept" | "reject") => void;
  outgoingInvites: Invitation[];
}

export function FriendsPage({
  busy,
  friends,
  incomingInvites,
  onInvite,
  onInvitation,
  outgoingInvites,
}: FriendsPageProps) {
  const [inviteEmail, setInviteEmail] = useState("");

  async function handleInvite() {
    await onInvite(inviteEmail);
    setInviteEmail("");
  }

  return (
    <Section title="Amigos">
      <TextInput
        autoCapitalize="none"
        keyboardType="email-address"
        onChangeText={setInviteEmail}
        placeholder="Email do amigo"
        style={styles.input}
        value={inviteEmail}
      />
      <PrimaryButton label="Enviar convite" loading={busy} onPress={handleInvite} />

      <Text style={styles.sectionDivider}>Convites recebidos</Text>
      {incomingInvites.length === 0 ? (
        <EmptyState text="Sem convites recebidos." />
      ) : (
        incomingInvites.map((invite) => (
          <ListItem key={invite.id} footer={invite.requester.email} title={invite.requester.name}>
            <View style={styles.actionRow}>
              <SecondaryButton label="Aceitar" onPress={() => onInvitation(invite.id, "accept")} />
              <DangerButton label="Recusar" onPress={() => onInvitation(invite.id, "reject")} />
            </View>
          </ListItem>
        ))
      )}

      <Text style={styles.sectionDivider}>Lista de amigos</Text>
      {friends.length === 0 ? (
        <EmptyState text="Nenhum amigo adicionado." />
      ) : (
        friends.map((friend) => <ListItem key={friend.id} footer={friend.friend.email} title={friend.friend.name} />)
      )}

      {outgoingInvites.length > 0 && (
        <>
          <Text style={styles.sectionDivider}>Convites enviados</Text>
          {outgoingInvites.map((invite) => (
            <ListItem key={invite.id} footer={invite.addressee.email} title={invite.addressee.name} />
          ))}
        </>
      )}
    </Section>
  );
}
