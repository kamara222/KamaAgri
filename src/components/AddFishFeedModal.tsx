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
import { useCreateFishFeedDistribution, useBassins } from "../services";
import Toast from "react-native-toast-message";

// Types pour le formulaire
interface FeedForm {
  date: string;
  nom_alimentation: string;
  type: string;
  poids: string;
  nombre: string;
}

interface AddFishFeedModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSubmit: (feed: FeedForm) => void;
}

const AddFishFeedModal: React.FC<AddFishFeedModalProps> = ({
  isVisible,
  onClose,
  onSubmit,
}) => {
  // État du formulaire
  const [form, setForm] = useState<FeedForm>({
    date: "",
    nom_alimentation: "",
    type: "",
    poids: "",
    nombre: "",
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Hook pour récupérer les bassins dynamiquement
  const { data: bassinsData = [] } = useBassins();
  const bassins = [
    { label: "Sélectionner un bassin", value: "" },
    ...bassinsData.map((basin: { nom_bassin: string }) => ({
      label: basin.nom_bassin,
      value: basin.nom_bassin,
    })),
  ];

  // Options pour les types d'aliment (statiques)
  const typesAliment = [
    { label: "Sélectionner un type", value: "" },
    { label: "Granulés", value: "Granulés" },
    { label: "Farine", value: "Farine" },
  ];

  // Hook pour créer une distribution
  const { mutate: createFishFeedDistribution, isLoading: isSubmitting } = useCreateFishFeedDistribution();

  // Validation du formulaire
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!form.date) newErrors.date = "Date requise";
    if (!form.nom_alimentation) newErrors.nom_alimentation = "Nom requis";
    if (!form.type) newErrors.type = "Type d’aliment requis";
    if (!form.poids || parseFloat(form.poids) <= 0) newErrors.poids = "Poids positif requis";
    if (!form.nombre || parseInt(form.nombre) <= 0) newErrors.nombre = "Nombre positif requis";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Gestion de la soumission
  const handleSubmit = () => {
    if (validateForm()) {
      const feedData = {
        date: form.date,
        nom_alimentation: form.nom_alimentation,
        type: form.type,
        poids: parseFloat(form.poids),
        nombre: parseInt(form.nombre),
      };
      console.log("Données envoyées à l'API:", JSON.stringify(feedData, null, 2));
      createFishFeedDistribution(feedData, {
        onSuccess: (data) => {
          console.log("Distribution créée avec succès:", JSON.stringify(data, null, 2));
          Toast.show({
            type: "successToast",
            props: {
              message: "Succès",
              description: "Distribution ajoutée avec succès",
            },
          });
          onSubmit(form);
          setForm({
            date: "",
            nom_alimentation: "",
            type: "",
            poids: "",
            nombre: "",
          });
        },
        onError: (error) => {
          console.error("Erreur lors de la création de la distribution:", error);
          Toast.show({
            type: "errorToast",
            props: {
              message: "Erreur",
              description: "Erreur lors de l'ajout de la distribution",
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
              <Text style={styles.modalTitle}>Ajouter Distribution</Text>
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

            {/* Champ Nom de l'alimentation */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Nom de l'alimentation *</Text>
              <TextInput
                style={[styles.input, errors.nom_alimentation && styles.inputError]}
                value={form.nom_alimentation}
                onChangeText={(text) => {
                  setForm({ ...form, nom_alimentation: text });
                  setErrors({ ...errors, nom_alimentation: "" });
                }}
                placeholder="Ex: Granulés flottants"
                placeholderTextColor={COLORS.textLight}
              />
              {errors.nom_alimentation && (
                <Text style={styles.errorText}>{errors.nom_alimentation}</Text>
              )}
            </View>

            {/* Champ Type d’aliment */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Type d’aliment *</Text>
              <CustomSelect
                options={typesAliment}
                value={form.type}
                onChange={(value) => {
                  setForm({ ...form, type: value });
                  setErrors({ ...errors, type: "" });
                }}
                placeholder="Sélectionner un type"
                error={errors.type}
              />
              {errors.type && (
                <Text style={styles.errorText}>{errors.type}</Text>
              )}
            </View>

            {/* Champ Poids */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Poids (kg) *</Text>
              <TextInput
                style={[styles.input, errors.poids && styles.inputError]}
                keyboardType="decimal-pad"
                value={form.poids}
                onChangeText={(text) => {
                  setForm({ ...form, poids: text });
                  setErrors({ ...errors, poids: "" });
                }}
                placeholder="Ex: 20"
                placeholderTextColor={COLORS.textLight}
              />
              {errors.poids && (
                <Text style={styles.errorText}>{errors.poids}</Text>
              )}
            </View>

            {/* Champ Nombre */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Nombre *</Text>
              <TextInput
                style={[styles.input, errors.nombre && styles.inputError]}
                keyboardType="number-pad"
                value={form.nombre}
                onChangeText={(text) => {
                  setForm({ ...form, nombre: text });
                  setErrors({ ...errors, nombre: "" });
                }}
                placeholder="Ex: 100"
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

export default AddFishFeedModal;