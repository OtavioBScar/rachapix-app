import { View } from "react-native";

import { SecondaryButton } from "../components/AppButton";
import { EmptyState } from "../components/EmptyState";
import { InfoBox } from "../components/InfoBox";
import { ListItem } from "../components/ListItem";
import { Section } from "../components/Section";
import type { Charge } from "../types";
import { formatCents } from "../utils/money";

interface ChargesPageProps {
  charges: Charge[];
  onGeneratePix: (chargeId: string) => void;
  pixCode: string | null;
}

export function ChargesPage({ charges, onGeneratePix, pixCode }: ChargesPageProps) {
  return (
    <Section title="Minhas cobrancas">
      {pixCode && <InfoBox text={pixCode} title="Codigo Pix mock" />}
      {charges.length === 0 ? (
        <EmptyState text="Nenhuma cobranca por enquanto." />
      ) : (
        charges.map((charge) => (
          <ListItem
            key={charge.id}
            footer={`${charge.status} - ${charge.expense.owner.name}`}
            title={charge.expense.title}
            value={formatCents(charge.amountCents)}
          >
            {charge.status !== "PAID" && charge.status !== "CANCELED" && (
              <View>
                <SecondaryButton label="Gerar Pix" onPress={() => onGeneratePix(charge.id)} />
              </View>
            )}
          </ListItem>
        ))
      )}
    </Section>
  );
}
