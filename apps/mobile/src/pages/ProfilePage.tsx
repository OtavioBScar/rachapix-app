import { useEffect, useState } from "react";
import { TextInput } from "react-native";

import { DangerButton, PrimaryButton } from "../components/AppButton";
import { Section } from "../components/Section";
import { styles } from "../styles/common";
import type { PublicUser, UpdateMeInput } from "../types";
import { optionalText } from "../utils/text";

interface ProfilePageProps {
  busy: boolean;
  onLogout: () => void;
  onUpdateProfile: (input: UpdateMeInput) => void;
  user: PublicUser;
}

export function ProfilePage({ busy, onLogout, onUpdateProfile, user }: ProfilePageProps) {
  const [form, setForm] = useState({
    name: user.name,
    phone: user.phone ?? "",
    pixKey: user.pixKey ?? "",
  });

  useEffect(() => {
    setForm({
      name: user.name,
      phone: user.phone ?? "",
      pixKey: user.pixKey ?? "",
    });
  }, [user]);

  function handleUpdateProfile() {
    onUpdateProfile({
      name: optionalText(form.name),
      phone: optionalText(form.phone) ?? null,
      pixKey: optionalText(form.pixKey) ?? null,
    });
  }

  return (
    <Section title="Meu perfil">
      <TextInput
        onChangeText={(name) => setForm((current) => ({ ...current, name }))}
        placeholder="Nome"
        style={styles.input}
        value={form.name}
      />
      <TextInput
        keyboardType="phone-pad"
        onChangeText={(phone) => setForm((current) => ({ ...current, phone }))}
        placeholder="Telefone"
        style={styles.input}
        value={form.phone}
      />
      <TextInput
        autoCapitalize="none"
        onChangeText={(pixKey) => setForm((current) => ({ ...current, pixKey }))}
        placeholder="Chave Pix"
        style={styles.input}
        value={form.pixKey}
      />
      <PrimaryButton label="Salvar perfil" loading={busy} onPress={handleUpdateProfile} />
      <DangerButton label="Sair" onPress={onLogout} />
    </Section>
  );
}
