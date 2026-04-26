import { StatusBar } from "expo-status-bar";
import { useState } from "react";

import { AuthPage } from "./src/pages/AuthPage";
import { DashboardPage } from "./src/pages/DashboardPage";
import type { AuthResponse } from "./src/types";

export default function App() {
  const [session, setSession] = useState<AuthResponse | null>(null);

  return (
    <>
      <StatusBar style="dark" />
      {session ? (
        <DashboardPage initialUser={session.user} onLogout={() => setSession(null)} token={session.token} />
      ) : (
        <AuthPage onAuthenticated={setSession} />
      )}
    </>
  );
}
