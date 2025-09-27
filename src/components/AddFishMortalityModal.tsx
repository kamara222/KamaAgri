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
import { useCreateFishMortality } from "../services";
import Toast from "react-native-toast-message";

// Types pour le formulaire
interface MortalityForm {
  date?: string;
  bassin: string;
  nombre?: string;
  cause: string;
  causeDetails?: string;
  espece: string;
}

interface AddFishMortalityModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSubmit: (mortality: MortalityForm) => void;
}

const AddFishMortalityModal: React.FC<AddFishMortalityModalProps> = ({
  isVisible,
  onClose,
  onSubmit,
}) => {
  // État du formulaire
  const [form, setForm] = useState<MortalityForm>({
    date: "",
    bassin: "",
    nombre: "",
    cause: "",
    causeDetails: "",
    espece: "",
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Liste statique des bassins pour le dropdown
  const bassins = [
    { label: "Sélectionner un bassin", value: "" },
    { label: "Bassin Nord", value: "Bassin Nord" },
    { label: "Bassin Sud", value: "Bassin Sud" },
    { label: "Bassin Est", value: "Bassin Est" },
    { label: "Bassin Ouest", value: "Bassin Ouest" },
  ];

  // Liste statique des espèces
  const especes = [
    { label: "Sélectionner une espèce", value: "" },
    { label: "Tilapia", value: "tilapia" },
    { label: "Silure", value: "silure" },
    { label: "Carpe", value: "carpe" },
  ];

  // Options pour les causes (statiques)
  const causes = [
    { label: "Sélectionner une cause", value: "" },
    { label: "Maladie", value: "Maladie" },
    { label: "Qualité eau", value: "Qualité eau" },
    { label: "Autre", value: "Autre" },
  ];

  // Hook pour créer une mortalité
  const { mutate: createFishMortality, isLoading: isSubmitting } = useCreateFishMortality();

  // Validation du formulaire
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!form.bassin) newErrors.bassin = "Bassin requis";
    if (!form.espece) newErrors.espece = "Espèce requise";
    if (!form.nombre || parseInt(form.nombre) <= 0)
      newErrors.nombre = "Nombre positif requis";
    if (!form.cause) newErrors.cause = "Cause requise";
    if (form.cause === "Autre" && !form.causeDetails)
      newErrors.causeDetails = "Détails requis pour Autre";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Gestion de la soumission
  const handleSubmit = () => {
    if (validateForm()) {
      const mortalityData = {
        date: form.date,
        bassin: form.bassin,
        nombre: parseInt(form.nombre),
        cause: form.cause === "Autre" ? form.causeDetails || form.cause : form.cause,
        espece: form.espece,
      };
      console.log("Données envoyées à l'API:", JSON.stringify(mortalityData, null, 2));
      console.log("Espèce sélectionnée:", form.espece);
      createFishMortality(mortalityData, {
        onSuccess: (data) => {
          console.log("Mortalité créée avec succès:", JSON.stringify(data, null, 2));
          Toast.show({
            type: "successToast",
            props: {
              message: "Succès",
              description: "Mortalité ajoutée avec succès",
            },
          });
          onSubmit(form);
          setForm({
            date: "",
            bassin: "",
            nombre: "",
            cause: "",
            causeDetails: "",
            espece: "",
          });
        },
        onError: (error) => {
          console.error("Erreur lors de la création de la mortalité:", error);
          Toast.show({
            type: "errorToast",
            props: {
              message: "Erreur",
              description: "Erreur lors de l'ajout de la mortalité",
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
              <Text style={styles.modalTitle}>Ajouter Mortalité</Text>
              <TouchableOpacity onPress={onClose}>
                <Icon name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            {/* Champ Date */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Date</Text>
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
              {errors.bassin && (
                <Text style={styles.errorText}>{errors.bassin}</Text>
              )}
            </View>

            {/* Champ Espèce */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Espèce *</Text>
              <CustomSelect
                options={especes}
                value={form.espece}
                onChange={(value) => {
                  setForm({ ...form, espece: value });
                  setErrors({ ...errors, espece: "" });
                }}
                placeholder="Sélectionner une espèce"
                error={errors.espece}
              />
              {errors.espece && (
                <Text style={styles.errorText}>{errors.espece}</Text>
              )}
            </View>

            {/* Champ Nombre de morts */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Nombre de morts *</Text>
              <TextInput
                style={[styles.input, errors.nombre && styles.inputError]}
                keyboardType="number-pad"
                value={form.nombre}
                onChangeText={(text) => {
                  setForm({ ...form, nombre: text });
                  setErrors({ ...errors, nombre: "" });
                }}
                placeholder="Ex: 10"
                placeholderTextColor={COLORS.textLight}
              />
              {errors.nombre && (
                <Text style={styles.errorText}>{errors.nombre}</Text>
              )}
            </View>

            {/* Champ Cause */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Cause *</Text>
              <CustomSelect
                options={causes}
                value={form.cause}
                onChange={(value) => {
                  setForm({ ...form, cause: value, causeDetails: "" });
                  setErrors({ ...errors, cause: "", causeDetails: "" });
                }}
                placeholder="Sélectionner une cause"
                error={errors.cause}
              />
              {errors.cause && (
                <Text style={styles.errorText}>{errors.cause}</Text>
              )}
            </View>

            {/* Champ Détails pour Autre */}
            {form.cause === "Autre" && (
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Détails de la cause *</Text>
                <TextInput
                  style={[styles.input, errors.causeDetails && styles.inputError]}
                  value={form.causeDetails}
                  onChangeText={(text) => {
                    setForm({ ...form, causeDetails: text });
                    setErrors({ ...errors, causeDetails: "" });
                  }}
                  placeholder="Décrivez la cause"
                  placeholderTextColor={COLORS.textLight}
                  multiline
                />
                {errors.causeDetails && (
                  <Text style={styles.errorText}>{errors.causeDetails}</Text>
                )}
              </View>
            )}

            {/* Bouton de soumission */}
            <Animatable.View
              animation="pulse"
              iterationCount="infinite"
              duration={2000}
            >
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

export default AddFishMortalityModal;