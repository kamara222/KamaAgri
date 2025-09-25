import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
} from "react-native";
import Modal from "react-native-modal";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as Animatable from "react-native-animatable";
import Icon from "react-native-vector-icons/MaterialIcons";
import { COLORS, SIZES, FONTS } from "../styles/GlobalStyles";
import CustomSelect from "./CustomSelect";
import { useCreateFishSale, useEspeces } from "../services";
import Toast from "react-native-toast-message";

// Types pour le formulaire
interface SaleForm {
  date: string;
  type_de_vente: string;
  bassin: string;
  espece_poisson?: string;
  kg_poisson: string;
  prix_total: string;
  nom_complet_client?: string;
  mode_paiement: string;
}

interface AddFishSaleModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSubmit: (sale: SaleForm) => void;
}

const AddFishSaleModal: React.FC<AddFishSaleModalProps> = ({
  isVisible,
  onClose,
  onSubmit,
}) => {
  // État du formulaire
  const [form, setForm] = useState<SaleForm>({
    date: "",
    type_de_vente: "",
    bassin: "",
    espece_poisson: "",
    kg_poisson: "",
    prix_total: "",
    nom_complet_client: "",
    mode_paiement: "",
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Liste statique des bassins
  const bassins = [
    { label: "Sélectionner un bassin", value: "" },
    { label: "Bassin Nord", value: "Bassin Nord" },
    { label: "Bassin Sud", value: "Bassin Sud" },
  ];

  // Hook pour récupérer les espèces
  const { data: especesData = [] } = useEspeces();
  const especes = [
    { label: "Sélectionner une espèce", value: "" },
    ...especesData.map((espece: { label: string; value: string }) => ({
      label: espece.label,
      value: espece.value,
    })),
  ];

  // Options pour les types de vente et modes de paiement
  const typesVente = [
    { label: "Sélectionner un type", value: "" },
    { label: "Vente directe", value: "Vente directe" },
    { label: "Vente en gros", value: "Vente en gros" },
  ];
  const modesPaiement = [
    { label: "Sélectionner un mode", value: "" },
    { label: "Espèces", value: "Espèces" },
    { label: "Mobile Money", value: "Mobile Money" },
    { label: "Chèque", value: "Chèque" },
  ];

  // Hook pour créer une vente
  const { mutate: createFishSale, isLoading: isSubmitting } =
    useCreateFishSale();

  // Validation du formulaire
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!form.date) newErrors.date = "Date requise";
    if (!form.type_de_vente) newErrors.type_de_vente = "Type de vente requis";
    if (!form.bassin) newErrors.bassin = "Bassin requis";
    if (!form.kg_poisson || parseFloat(form.kg_poisson) <= 0)
      newErrors.kg_poisson = "Quantité positive requise";
    if (!form.prix_total || parseFloat(form.prix_total) <= 0)
      newErrors.prix_total = "Prix positif requis";
    if (!form.mode_paiement)
      newErrors.mode_paiement = "Mode de paiement requis";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Gestion de la soumission
  const handleSubmit = () => {
    if (validateForm()) {
      const saleData = {
        date: form.date,
        type_de_vente: form.type_de_vente,
        bassin: form.bassin,
        espece_poisson: form.espece_poisson || null,
        kg_poisson: parseFloat(form.kg_poisson),
        prix_total: parseFloat(form.prix_total),
        nom_complet_client: form.nom_complet_client || null,
        mode_paiement: form.mode_paiement,
      };
      console.log("Données envoyées à l'API:", saleData); // Log pour déboguer
      createFishSale(saleData, {
        onSuccess: (data) => {
          console.log("Vente créée avec succès:", data);
          Toast.show({
            type: "successToast",
            props: {
              message: "Succès",
              description: "Vente ajoutée avec succès",
            },
          });
          onSubmit(form);
          setForm({
            date: "",
            type_de_vente: "",
            bassin: "",
            espece_poisson: "",
            kg_poisson: "",
            prix_total: "",
            nom_complet_client: "",
            mode_paiement: "",
          });
        },

        onError: (error: any) => {
          console.error("Erreur lors de la création de la vente:", error);
          console.error("Détails de l'erreur:", error.response?.data);
          Toast.show({
            type: "errorToast",
            props: {
              message: "Erreur",
              description:
                error.response?.data?.message ||
                "Erreur lors de l'ajout de la vente",
            },
          });
        },
      });
    }
  };

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={onClose}
      style={styles.modal}
      animationIn="slideInUp"
      animationOut="slideOutDown"
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Animatable.View
            animation="slideInUp"
            duration={300}
            style={styles.modalContent}
          >
            <View style={styles.modalHandle} />
            {/* En-tête du modal */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Ajouter Vente</Text>
              <TouchableOpacity onPress={onClose}>
                <Icon name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            {/* Champ Date */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Date *</Text>
              <TouchableOpacity
                style={[styles.input, errors.date && styles.inputError]}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.inputText}>
                  {form.date
                    ? new Date(form.date).toLocaleDateString("fr-FR")
                    : "Sélectionner une date"}
                </Text>
                <Icon name="calendar-today" size={20} color={COLORS.text} />
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={form.date ? new Date(form.date) : new Date()}
                  mode="date"
                  display={Platform.OS === "ios" ? "inline" : "default"}
                  onChange={(event, date) => {
                    setShowDatePicker(false);
                    if (date) {
                      setForm({ ...form, date: date.toISOString() });
                      setErrors({ ...errors, date: "" });
                    }
                  }}
                  textColor={COLORS.text}
                  accentColor={COLORS.accent}
                  themeVariant="light"
                />
              )}
              {errors.date && (
                <Text style={styles.errorText}>{errors.date}</Text>
              )}
            </View>

            {/* Champ Type de vente */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Type de vente *</Text>
              <CustomSelect
                options={typesVente}
                value={form.type_de_vente}
                onChange={(value) => {
                  setForm({ ...form, type_de_vente: value });
                  setErrors({ ...errors, type_de_vente: "" });
                }}
                placeholder="Sélectionner un type"
                error={errors.type_de_vente}
              />
            </View>

            {/* Champ Bassin */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Bassin concerné *</Text>
              <CustomSelect
                options={bassins}
                value={form.bassin}
                onChange={(value) => {
                  setForm({ ...form, bassin: value });
                  setErrors({ ...errors, bassin: "" });
                }}
                placeholder="Sélectionner un bassin"
                error={errors.bassin}
              />
            </View>

            {/* Champ Espèce */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Espèce (optionnel)</Text>
              <CustomSelect
                options={especes}
                value={form.espece_poisson}
                onChange={(value) => {
                  setForm({ ...form, espece_poisson: value });
                  setErrors({ ...errors, espece_poisson: "" });
                }}
                placeholder="Sélectionner une espèce"
                error={errors.espece_poisson}
              />
            </View>

            {/* Champ Quantité */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Quantité vendue (kg) *</Text>
              <TextInput
                style={[styles.input, errors.kg_poisson && styles.inputError]}
                keyboardType="decimal-pad"
                value={form.kg_poisson}
                onChangeText={(text) => {
                  setForm({ ...form, kg_poisson: text });
                  setErrors({ ...errors, kg_poisson: "" });
                }}
                placeholder="Ex: 50"
                placeholderTextColor={COLORS.textLight}
              />
              {errors.kg_poisson && (
                <Text style={styles.errorText}>{errors.kg_poisson}</Text>
              )}
            </View>

            {/* Champ Prix total */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Prix total (XAF) *</Text>
              <TextInput
                style={[styles.input, errors.prix_total && styles.inputError]}
                keyboardType="decimal-pad"
                value={form.prix_total}
                onChangeText={(text) => {
                  setForm({ ...form, prix_total: text });
                  setErrors({ ...errors, prix_total: "" });
                }}
                placeholder="Ex: 250000"
                placeholderTextColor={COLORS.textLight}
              />
              {errors.prix_total && (
                <Text style={styles.errorText}>{errors.prix_total}</Text>
              )}
            </View>

            {/* Champ Client */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Client (optionnel)</Text>
              <TextInput
                style={styles.input}
                value={form.nom_complet_client}
                onChangeText={(text) =>
                  setForm({ ...form, nom_complet_client: text })
                }
                placeholder="Ex: Marché Local"
                placeholderTextColor={COLORS.textLight}
              />
            </View>

            {/* Champ Mode de paiement */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Mode de paiement *</Text>
              <CustomSelect
                options={modesPaiement}
                value={form.mode_paiement}
                onChange={(value) => {
                  setForm({ ...form, mode_paiement: value });
                  setErrors({ ...errors, mode_paiement: "" });
                }}
                placeholder="Sélectionner un mode"
                error={errors.mode_paiement}
              />
            </View>

            {/* Bouton de soumission */}
            <Animatable.View
              animation="pulse"
              iterationCount="infinite"
              duration={2000}
            >
              <TouchableOpacity
                style={[
                  styles.submitButton,
                  isSubmitting && styles.disabledButton,
                ]}
                onPress={handleSubmit}
                disabled={isSubmitting}
              >
                <View style={styles.submitGradient}>
                  <Text style={styles.submitButtonText}>
                    {isSubmitting ? "Ajout en cours..." : "Ajouter"}
                  </Text>
                </View>
              </TouchableOpacity>
            </Animatable.View>
          </Animatable.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    justifyContent: "flex-end",
    margin: 0,
  },
  keyboardAvoidingView: {
    // flex: 1,
  },
  scrollContainer: {
    // flexGrow: 1,
    paddingBottom: 20,
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: SIZES.radius,
    borderTopRightRadius: SIZES.radius,
    padding: SIZES.padding,
    minHeight: "40%",
  },
  modalHandle: {
    width: 40,
    height: 5,
    backgroundColor: COLORS.textLight,
    borderRadius: 3,
    alignSelf: "center",
    marginBottom: SIZES.margin,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SIZES.margin,
  },
  modalTitle: {
    fontSize: SIZES.fontTitle,
    fontFamily: FONTS.bold,
    color: COLORS.text,
  },
  inputContainer: {
    marginBottom: SIZES.margin,
  },
  label: {
    fontSize: SIZES.fontMedium,
    fontFamily: FONTS.medium,
    color: COLORS.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    fontSize: SIZES.fontMedium,
    fontFamily: FONTS.regular,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.textLight,
    shadowColor: COLORS.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  inputText: {
    fontSize: SIZES.fontMedium,
    fontFamily: FONTS.regular,
    color: COLORS.text,
  },
  inputError: {
    borderColor: COLORS.error,
  },
  errorText: {
    fontSize: SIZES.fontSmall,
    fontFamily: FONTS.regular,
    color: COLORS.error,
    marginTop: 4,
  },
  submitButton: {
    borderRadius: SIZES.radius,
    marginTop: SIZES.margin,
  },
  submitGradient: {
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    alignItems: "center",
    backgroundColor: COLORS.accent,
  },
  submitButtonText: {
    fontSize: SIZES.fontLarge,
    fontFamily: FONTS.bold,
    color: COLORS.white,
  },
  disabledButton: {
    opacity: 0.6,
  },
});

export default AddFishSaleModal;
