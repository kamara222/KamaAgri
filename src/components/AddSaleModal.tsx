import React, { useState, useEffect } from "react";
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
import { useCreateChickenSale, useRaces } from "../services";
import Toast from "react-native-toast-message";

// Types pour le formulaire
interface SaleForm {
  date: string;
  batiment: string;
  race_poulet: string; // Rendre obligatoire
  nombre_poulet: string;
  prix_unitaitre: string;
  prix_total: string;
  nom_complet_client: string;
  mode_paiement: string;
}

// Type pour une race
interface Race {
  code: string;
  nom: string;
}

interface AddSaleModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSubmit: (sale: SaleForm) => void;
}

const AddSaleModal: React.FC<AddSaleModalProps> = ({
  isVisible,
  onClose,
  onSubmit,
}) => {
  // État du formulaire
  const [form, setForm] = useState<SaleForm>({
    date: new Date().toISOString(),
    batiment: "",
    race_poulet: "",
    nombre_poulet: "",
    prix_unitaitre: "",
    prix_total: "",
    nom_complet_client: "",
    mode_paiement: "",
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Liste statique des bâtiments
  const batiments = [
    { label: "Sélectionner un bâtiment", value: "" },
    { label: "Bâtiment A", value: "Bâtiment A" },
    { label: "Bâtiment B", value: "Bâtiment B" },
    { label: "Bâtiment C", value: "Bâtiment C" },
  ];

  // Récupérer les races dynamiquement
  const { data: racesData = [], isLoading: isRacesLoading, isError: isRacesError } = useRaces();
  const races = [
    { label: "Sélectionner une race", value: "" },
    ...racesData.map((race: Race) => ({
      label: race.nom,
      value: race.code,
    })),
  ];

  // Options pour les modes de paiement
  const modesPaiement = [
    { label: "Sélectionner un mode", value: "" },
    { label: "Espèces", value: "Espèces" },
    { label: "Mobile Money", value: "Mobile Money" },
    { label: "Chèque", value: "Chèque" },
  ];

  // Hook pour créer une vente
  const { mutate: createChickenSale, isLoading: isSubmitting } = useCreateChickenSale();

  // Calculer le prix total automatiquement
  useEffect(() => {
    const nombrePoulet = parseInt(form.nombre_poulet) || 0;
    const prixUnitaire = parseFloat(form.prix_unitaitre) || 0;
    const prixTotal = (nombrePoulet * prixUnitaire).toFixed(2);
    setForm((prev) => ({ ...prev, prix_total: prixTotal }));
  }, [form.nombre_poulet, form.prix_unitaitre]);

  // Validation du formulaire
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!form.date) newErrors.date = "Date requise";
    if (!form.batiment) newErrors.batiment = "Bâtiment requis";
    if (!form.race_poulet) newErrors.race_poulet = "Race requise"; // Rendre obligatoire
    if (!form.nombre_poulet || parseInt(form.nombre_poulet) <= 0)
      newErrors.nombre_poulet = "Nombre positif requis";
    if (!form.prix_unitaitre || parseFloat(form.prix_unitaitre) <= 0)
      newErrors.prix_unitaitre = "Prix unitaire positif requis";
    if (!form.nom_complet_client)
      newErrors.nom_complet_client = "Client requis";
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
        type_de_vente: "Poulet",
        batiment: form.batiment,
        race_poulet: form.race_poulet,
        nombre_poulet: parseInt(form.nombre_poulet),
        prix_unitaitre: parseFloat(form.prix_unitaitre),
        prix_total: parseFloat(form.prix_total),
        nom_complet_client: form.nom_complet_client,
        mode_paiement: form.mode_paiement,
      };
      console.log("Données envoyées à l'API:", saleData);
      console.log("Race sélectionnée:", form.race_poulet);
      createChickenSale(saleData, {
        onSuccess: (data) => {
          console.log("Vente poulet créée avec succès:", data);
          Toast.show({
            type: "successToast",
            props: {
              message: "Succès",
              description: "Vente ajoutée avec succès",
            },
          });
          onSubmit(form);
          setForm({
            date: new Date().toISOString(),
            batiment: "",
            race_poulet: "",
            nombre_poulet: "",
            prix_unitaitre: "",
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
              <Text style={styles.modalTitle}>Ajouter Vente Poulet</Text>
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

            {/* Champ Bâtiment */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Bâtiment concerné *</Text>
              <CustomSelect
                options={batiments}
                value={form.batiment}
                onChange={(value) => {
                  setForm({ ...form, batiment: value });
                  setErrors({ ...errors, batiment: "" });
                }}
                placeholder="Sélectionner un bâtiment"
                error={errors.batiment}
              />
            </View>

            {/* Champ Race */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Race *</Text>
              {isRacesLoading && <Text style={styles.loadingText}>Chargement des races...</Text>}
              {isRacesError && <Text style={styles.errorText}>Erreur lors du chargement des races</Text>}
              <CustomSelect
                options={races}
                value={form.race_poulet}
                onChange={(value) => {
                  setForm({ ...form, race_poulet: value });
                  setErrors({ ...errors, race_poulet: "" });
                }}
                placeholder="Sélectionner une race"
                error={errors.race_poulet}
                disabled={isRacesLoading}
              />
              {errors.race_poulet && (
                <Text style={styles.errorText}>{errors.race_poulet}</Text>
              )}
            </View>

            {/* Champ Nombre vendu */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Nombre vendu *</Text>
              <TextInput
                style={[styles.input, errors.nombre_poulet && styles.inputError]}
                keyboardType="number-pad"
                value={form.nombre_poulet}
                onChangeText={(text) => {
                  setForm({ ...form, nombre_poulet: text });
                  setErrors({ ...errors, nombre_poulet: "" });
                }}
                placeholder="Ex: 100"
                placeholderTextColor={COLORS.textLight}
              />
              {errors.nombre_poulet && (
                <Text style={styles.errorText}>{errors.nombre_poulet}</Text>
              )}
            </View>

            {/* Champ Prix unitaire */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Prix unitaire (XAF) *</Text>
              <TextInput
                style={[styles.input, errors.prix_unitaitre && styles.inputError]}
                keyboardType="decimal-pad"
                value={form.prix_unitaitre}
                onChangeText={(text) => {
                  setForm({ ...form, prix_unitaitre: text });
                  setErrors({ ...errors, prix_unitaitre: "" });
                }}
                placeholder="Ex: 5000"
                placeholderTextColor={COLORS.textLight}
              />
              {errors.prix_unitaitre && (
                <Text style={styles.errorText}>{errors.prix_unitaitre}</Text>
              )}
            </View>

            {/* Champ Prix total (lecture seule) */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Prix total (XAF) *</Text>
              <TextInput
                style={[styles.input, styles.readOnlyInput]}
                value={form.prix_total}
                editable={false}
                placeholder="Calculé automatiquement"
                placeholderTextColor={COLORS.textLight}
              />
              {errors.prix_total && (
                <Text style={styles.errorText}>{errors.prix_total}</Text>
              )}
            </View>

            {/* Champ Client */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Client *</Text>
              <TextInput
                style={[styles.input, errors.nom_complet_client && styles.inputError]}
                value={form.nom_complet_client}
                onChangeText={(text) => {
                  setForm({ ...form, nom_complet_client: text });
                  setErrors({ ...errors, nom_complet_client: "" });
                }}
                placeholder="Ex: Client A"
                placeholderTextColor={COLORS.textLight}
              />
              {errors.nom_complet_client && (
                <Text style={styles.errorText}>{errors.nom_complet_client}</Text>
              )}
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
            <Animatable.View animation="pulse" iterationCount="infinite" duration={2000}>
              <TouchableOpacity
                style={[styles.submitButton, isSubmitting && styles.disabledButton]}
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
  readOnlyInput: {
    backgroundColor: COLORS.textLight,
    opacity: 0.7,
  },
  errorText: {
    fontSize: SIZES.fontSmall,
    fontFamily: FONTS.regular,
    color: COLORS.error,
    marginTop: 4,
  },
  loadingText: {
    fontSize: SIZES.fontMedium,
    fontFamily: FONTS.regular,
    color: COLORS.text,
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

export default AddSaleModal;