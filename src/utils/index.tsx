import React, { useRef, useEffect } from 'react';
import Toast, {BaseToast, ErrorToast} from 'react-native-toast-message';
import {View, Text} from "react-native";
import { SuccessComponent } from '../components/toast/successComponent';
import { ErrorComponent } from '../components/toast/ErrorComponent';

// ---------------------------------------------------------------------------
// Détail d'une vente : construit les lignes (label/valeur) pour DetailModal.
// Gère poulet (nombre_poulet) vs poisson (kg_poisson), et race/espèce string|{nom}.
// ---------------------------------------------------------------------------
type RaceOrEspece = string | { code?: string; nom?: string } | null | undefined;

interface SaleLike {
  date?: string;
  type_de_vente?: string;
  batiment?: string;
  bassin?: string;
  race_poulet?: RaceOrEspece;
  espece_poisson?: RaceOrEspece;
  nombre_poulet?: number;
  kg_poisson?: number;
  prix_unitaitre?: number;
  prix_kg_poisson?: number;
  prix_total?: number;
  nom_complet_client?: string;
  mode_paiement?: string;
  vendeur?: {
    id?: string;
    nom?: string;
    prenom?: string;
    email?: string;
    numeroTelephone?: string;
    role?: { code?: string; nom?: string } | string;
  } | null;
}

const labelOf = (v: RaceOrEspece): string => {
  if (!v) return 'Non spécifié';
  if (typeof v === 'string') return v;
  return v.nom || 'Non spécifié';
};

const xaf = (n?: number): string =>
  n === undefined || n === null ? '—' : `${n.toLocaleString('fr-FR')} XAF`;

const frDate = (d?: string): string => (d ? new Date(d).toLocaleDateString('fr-FR') : '—');

export const saleDetailRows = (sale: SaleLike): { label: string; value: string }[] => {
  const isPoisson = sale.kg_poisson !== undefined && sale.kg_poisson !== null;
  const rows: { label: string; value: string }[] = [
    { label: 'Date', value: frDate(sale.date) },
    { label: 'Type', value: isPoisson ? 'Poissons' : 'Poulets' },
  ];

  if (isPoisson) {
    rows.push(
      { label: 'Bassin', value: sale.bassin || 'Non spécifié' },
      { label: 'Espèce', value: labelOf(sale.espece_poisson) },
      { label: 'Quantité', value: `${sale.kg_poisson ?? 0} kg` },
      { label: 'Prix par kg', value: xaf(sale.prix_kg_poisson) },
    );
  } else {
    rows.push(
      { label: 'Bâtiment', value: sale.batiment || 'Non spécifié' },
      { label: 'Race', value: labelOf(sale.race_poulet) },
      { label: 'Nombre vendu', value: `${sale.nombre_poulet ?? 0}` },
      { label: 'Prix unitaire', value: xaf(sale.prix_unitaitre) },
    );
  }

  rows.push(
    { label: 'Prix total', value: xaf(sale.prix_total) },
    { label: 'Client', value: sale.nom_complet_client || 'Non spécifié' },
    { label: 'Mode de paiement', value: sale.mode_paiement || 'Non spécifié' },
  );

  // Vendeur (objet renvoyé par l'API) — affiché seulement s'il est présent
  if (sale.vendeur) {
    const v = sale.vendeur;
    const nomComplet = `${v.prenom ?? ''} ${v.nom ?? ''}`.trim();
    const roleNom = typeof v.role === 'object' ? v.role?.nom : v.role;
    const value =
      (nomComplet || v.email || 'Non spécifié') + (roleNom ? ` (${roleNom})` : '');
    rows.push({ label: 'Vendeur', value });
  }

  return rows;
};

export const toastConfig = {
    success: (props: any) => (
        <BaseToast
            {...props}
            // style={{borderLeftColor: 'pink'}}
            contentContainerStyle={{paddingHorizontal: 15}}
            text1Style={{
                fontSize: 15,
                fontWeight: '400',
            }}
        />
    ),

    error: (props: any) => (
        <ErrorToast
            {...props}
            text1Style={{
                fontSize: 17,
            }}
            text2Style={{
                fontSize: 15,
            }}
        />
    ),

    tomatoToast: ({text1, props}: any) => (
        <View style={{height: 60, width: '100%', backgroundColor: 'tomato'}}>
            <Text>{text1}</Text>
            <Text>{props.uuid}</Text>
        </View>
    ),

    successToast: ({props}: any) => <SuccessComponent {...props} />,
    errorToast: ({props}: any) => <ErrorComponent {...props} />,
};
