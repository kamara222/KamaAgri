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
import { useCreateBassin, useUpdateBassin } from "../services";
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
  // Mode édition : si fourni (avec id), le formulaire est pré-rempli et la
  // soumission déclenche une mise à jour (PATCH) au lieu d'une création.
  initialData?: BasinForm & { id?: string };
  resetForm?: boolean;
}

const EMPTY_FORM: BasinForm = { nom_bassin: "", espece: "", date: "", nombre: "" };

const AddBasinModal: React.FC<AddBasinModalProps> = ({
  isVisible,
  onClose,
  onSubmit,
  initialData,
  resetForm,
}) => {
  const isEdit = !!initialData?.id;

  // État du formulaire
  const [form, setForm] = useState<BasinForm>(initialData ?? EMPTY_FORM);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Synchroniser le formulaire avec les données d'édition / réinitialiser
  useEffect(() => {
    if (!isVisible) return;
    if (initialData) {
      setForm({
        nom_bassin: initialData.nom_bassin ?? "",
        espece: initialData.espece ?? "",
        date: initialData.date ?? "",
        nombre: initialData.nombre ?? "",
      });
    } else if (resetForm) {
      setForm(EMPTY_FORM);
    }
    setErrors({});
  }, [isVisible, initialData, resetForm]);

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

  // Hooks création / mise à jour
  const { mutate: createBassin, isPending: isCreating } = useCreateBassin();
  const { mutate: updateBassin, isPending: isUpdating } = useUpdateBassin();
  const isSubmitting = isCreating || isUpdating;

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

  // Gestion de la soumission (création ou mise à jour selon le mode)
  const handleSubmit = () => {
    if (!validateForm()) return;

    const basinData = {
      nom_bassin: form.nom_bassin,
      espece: form.espece,
      date: form.date,
      nombre: parseInt(form.nombre || "0"),
    };

    const handlers = {
      onSuccess: () => {
        Toast.show({
          type: "successToast",
          props: {
            message: isEdit ? "Bassin modifié avec succès" : "Bassin ajouté avec succès",
          },
        });
        onSubmit(form);
        if (!isEdit) setForm(EMPTY_FORM);
      },
      onError: (error: any) => {
        console.error("Erreur lors de l'enregistrement du bassin:", error);
        Toast.show({
          type: "errorToast",
          props: {
            message: isEdit
              ? "Erreur lors de la modification du bassin"
              : "Erreur lors de l’ajout du bassin",
          },
        });
      },
    };

    if (isEdit && initialData?.id) {
      updateBassin({ id: initialData.id, ...basinData }, handlers);
    } else {
      createBassin(basinData, handlers);
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
              <Text style={styles.modalTitle}>{isEdit ? "Modifier Bassin" : "Ajouter Bassin"}</Text>
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
              iterationCount={1}
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
                    {isSubmitting
                      ? isEdit
                        ? "Modification..."
                        : "Ajout en cours..."
                      : isEdit
                      ? "Modifier"
                      : "Ajouter"}
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

export default AddBasinModal;