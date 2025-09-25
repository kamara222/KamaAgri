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
import { useEspeces, useCreateBassin } from "../services";
import Toast from "react-native-toast-message";

// Types pour le formulaire
interface BasinForm {
  nom_bassin: string;
  espece: string;
  date?: string;
  nombre?: string;
}

interface AddBasinModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSubmit: (basin: BasinForm) => void;
}

const AddBasinModal: React.FC<AddBasinModalProps> = ({
  isVisible,
  onClose,
  onSubmit,
}) => {
  // État du formulaire
  const [form, setForm] = useState<BasinForm>({
    nom_bassin: "",
    espece: "",
    date: "",
    nombre: "",
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

  // Hook pour récupérer les espèces
  const {
    data: especesData = [],
    isLoading: isEspecesLoading,
    isError: isEspecesError,
  } = useEspeces();
  const especes = [
    { label: "Sélectionner une espèce", value: "" },
    ...especesData.map((espece: { label: string; value: string }) => ({
      label: espece.label,
      value: espece.value,
    })),
  ];

  // Hook pour créer un bassin
  const { mutate: createBassin, isLoading: isSubmitting } = useCreateBassin();

  // Validation du formulaire
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!form.nom_bassin) newErrors.nom_bassin = "Nom requis";
    if (!form.espece) newErrors.espece = "Espèce requise";
    if (!form.date) newErrors.date = "Date requise";
    if (!form.nombre || parseInt(form.nombre) <= 0)
      newErrors.nombre = "Nombre positif requis";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Gestion de la soumission
  const handleSubmit = () => {
    if (validateForm()) {
      const basinData = {
        nom_bassin: form.nom_bassin,
        espece: form.espece,
        date: form.date,
        nombre: parseInt(form.nombre),
      };
      console.log("Données envoyées à l'API:", basinData); // Log pour déboguer
      createBassin(basinData, {
        onSuccess: (data) => {
          console.log("Bassin créé avec succès:", data);
          Toast.show({
            type: "successToast",
            props: {
              message: "Bassin ajouté avec succès",
            },
          });
          onSubmit(form);
          setForm({ nom_bassin: "", espece: "", date: "", nombre: "" });
        },

        onError: (error) => {
          console.log("Erreur lors de la création du bassin:", error);
          Toast.show({
            type: "errorToast",
            props: {
              message: "Erreur lors de l’ajout du bassin",
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
              <Text style={styles.modalTitle}>Ajouter Bassin</Text>
              <TouchableOpacity onPress={onClose}>
                <Icon name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            {/* Champ Nom (Dropdown) */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Nom du bassin *</Text>
              <CustomSelect
                options={bassins}
                value={form.nom_bassin}
                onChange={(value) => {
                  setForm({ ...form, nom_bassin: value });
                  setErrors({ ...errors, nom_bassin: "" });
                }}
                placeholder="Sélectionner un bassin"
                error={errors.nom_bassin}
              />
              {errors.nom_bassin && (
                <Text style={styles.errorText}>{errors.nom_bassin}</Text>
              )}
            </View>

            {/* Champ Espèce */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Espèce *</Text>
              {isEspecesLoading ? (
                <Text style={styles.loadingText}>
                  Chargement des espèces...
                </Text>
              ) : isEspecesError ? (
                <Text style={styles.errorText}>
                  Erreur lors du chargement des espèces
                </Text>
              ) : (
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
              )}
            </View>

            {/* Champ Date mise en eau */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Date mise en eau *</Text>
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

            {/* Champ Nombre de poissons */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Nombre de poissons *</Text>
              <TextInput
                style={[styles.input, errors.nombre && styles.inputError]}
                keyboardType="number-pad"
                value={form.nombre}
                onChangeText={(text) => {
                  setForm({ ...form, nombre: text });
                  setErrors({ ...errors, nombre: "" });
                }}
                placeholder="Ex: 1000"
                placeholderTextColor={COLORS.textLight}
              />
              {errors.nombre && (
                <Text style={styles.errorText}>{errors.nombre}</Text>
              )}
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
  loadingText: {
    fontSize: SIZES.fontMedium,
    fontFamily: FONTS.regular,
    color: COLORS.text,
    textAlign: "center",
  },
  disabledButton: {
    opacity: 0.6,
  },
});

export default AddBasinModal;
