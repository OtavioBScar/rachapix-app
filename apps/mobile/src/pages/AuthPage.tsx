import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, SafeAreaView, ScrollView, Text, TextInput, View } from "react-native";

import { login, register } from "../api";
import { PrimaryButton } from "../components/AppButton";
import { Feedback } from "../components/Feedback";
import { styles } from "../styles/common";
import type { AuthResponse } from "../types";
import { optionalText } from "../utils/text";

type AuthMode = "login" | "register";

const isValidEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

export function AuthPage({ onAuthenticated }: { onAuthenticated: (session: AuthResponse) => void }) {
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    pixKey: "",
  });

  const isLoginValid =
    authMode === "login"
      ? form.email.trim() !== "" && form.password.trim() !== "" && isValidEmail(form.email)
      : true;

  async function handleSubmit() {
    setBusy(true);
    setError(null);
    setMessage(null);

    try {
      const session =
        authMode === "login"
          ? await login({ email: form.email, password: form.password })
          : await register({
              name: form.name,
              email: form.email,
              password: form.password,
              phone: optionalText(form.phone),
              pixKey: optionalText(form.pixKey),
            });

      onAuthenticated(session);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Nao foi possivel entrar.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.authContent} keyboardShouldPersistTaps="handled">
          <Text style={styles.logo}>RachaPix</Text>
          <Text style={styles.subtitle}>Divida contas, acompanhe cobrancas e gere Pix para acertar rapido.</Text>

          <View style={styles.segmentedControl}>
            <Pressable
              onPress={() => setAuthMode("login")}
              style={[styles.segmentButton, authMode === "login" && styles.segmentButtonActive]}
            >
              <Text style={[styles.segmentText, authMode === "login" && styles.segmentTextActive]}>Entrar</Text>
            </Pressable>
            <Pressable
              onPress={() => setAuthMode("register")}
              style={[styles.segmentButton, authMode === "register" && styles.segmentButtonActive]}
            >
              <Text style={[styles.segmentText, authMode === "register" && styles.segmentTextActive]}>Criar conta</Text>
            </Pressable>
          </View>

          {authMode === "register" && (
            <TextInput
              autoCapitalize="words"
              onChangeText={(name) => setForm((current) => ({ ...current, name }))}
              placeholder="Nome"
              style={styles.input}
              value={form.name}
            />
          )}
          <TextInput
            autoCapitalize="none"
            keyboardType="email-address"
            onChangeText={(email) => setForm((current) => ({ ...current, email }))}
            placeholder="Email"
            style={styles.input}
            value={form.email}
          />
          <TextInput
            onChangeText={(password) => setForm((current) => ({ ...current, password }))}
            placeholder="Senha"
            secureTextEntry
            style={styles.input}
            value={form.password}
          />
          {authMode === "register" && (
            <>
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
            </>
          )}

          <PrimaryButton
            label={authMode === "login" ? "Entrar" : "Criar conta"}
            loading={busy}
            onPress={handleSubmit}
            disabled={!isLoginValid}
          />
          <Feedback error={error} message={message} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}