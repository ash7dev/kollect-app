import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../app/context/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';

type TeaserType = 'photo' | 'video';

export interface CollectionTeaserData {
  name: string;
  description: string;
  teaserType: TeaserType;
  teaserUri: string | null;
  launchDate: Date;
  launchTime: Date;
}

interface CollectionTeaserStepProps {
  data?: CollectionTeaserData;
  onDataChange: (data: CollectionTeaserData) => void;
  onNext?: () => void;
  onPrevious?: () => void;
}

export function CollectionTeaserStep({
  data,
  onDataChange,
  onNext,
  onPrevious,
}: CollectionTeaserStepProps) {
  const { theme } = useTheme();
  const [name, setName] = useState(data?.name || '');
  const [description, setDescription] = useState(data?.description || '');
  const [teaserType, setTeaserType] = useState<TeaserType>(data?.teaserType || 'photo');
  const [teaserUri, setTeaserUri] = useState<string | null>(data?.teaserUri || null);
  const [launchDate, setLaunchDate] = useState(data?.launchDate || new Date(Date.now() + 86400000));
  const [launchTime, setLaunchTime] = useState(data?.launchTime || new Date(Date.now() + 86400000));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [videoLoading, setVideoLoading] = useState(false);
  const videoRef = React.useRef<Video>(null);

  React.useEffect(() => {
    return onDataChange({
      name,
      description,
      teaserType,
      teaserUri,
      launchDate,
      launchTime,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, description, teaserType, teaserUri, launchDate, launchTime]);

  React.useEffect(() => {
    if (!teaserUri && videoRef.current) {
      videoRef.current.unloadAsync();
    }
  }, [teaserUri]);

  const pickMedia = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission requise', 'Accès à la galerie nécessaire pour continuer');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: teaserType === 'photo' 
        ? ImagePicker.MediaTypeOptions.Images 
        : ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.85,
      videoMaxDuration: 60,
    });

    if (!result.canceled && result.assets[0]) {
      setTeaserUri(result.assets[0].uri);
      if (teaserType === 'video') {
        setVideoLoading(true);
      }
    }
  };

  const handleVideoLoad = (status: AVPlaybackStatus) => {
    if (status.isLoaded) {
      setVideoLoading(false);
    }
  };

  const handleVideoError = (error: string) => {
    setVideoLoading(false);
    console.error('Erreur de chargement vidéo:', error);
    Alert.alert(
      'Erreur',
      'Impossible de charger la vidéo. Veuillez réessayer avec un autre fichier.'
    );
  };

  const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (event.type === 'set' && selectedDate) {
      const newDate = new Date(launchDate);
      newDate.setFullYear(selectedDate.getFullYear());
      newDate.setMonth(selectedDate.getMonth());
      newDate.setDate(selectedDate.getDate());
      setLaunchDate(newDate);
    }
  };

  const handleTimeChange = (event: DateTimePickerEvent, selectedTime?: Date) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (event.type === 'set' && selectedTime) {
      const newDate = new Date(launchDate);
      newDate.setHours(selectedTime.getHours());
      newDate.setMinutes(selectedTime.getMinutes());
      setLaunchTime(newDate);
    }
  };

  const hasMedia = !!teaserUri;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Donne vie à ton drop.
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          {hasMedia 
            ? 'Un teaser sera affiché avant le lancement'
            : 'Le drop sera disponible immédiatement'}
        </Text>
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Info-bulle UX */}
        <View style={[styles.infoBox, { 
          backgroundColor: theme.colors.primary + '15',
          borderColor: theme.colors.primary + '30'
        }]}>
          <Ionicons name="information-circle" size={20} color={theme.colors.primary} />
          <Text style={[styles.infoText, { color: theme.colors.text }]}>
            Ajoute une image ou une vidéo pour créer un effet teaser avant le lancement.
            Si tu n&apos;ajoutes rien, le drop sera disponible immédiatement.
          </Text>
        </View>

        {/* Nom de la collection */}
        <View style={styles.fieldGroup}>
          <Text style={[styles.label, { color: theme.colors.text }]}>
            Nom de la collection
            <Text style={{ color: theme.colors.error }}> *</Text>
          </Text>
          <View style={[
            styles.inputContainer,
            {
              backgroundColor: theme.colors.surface,
              borderColor: name ? theme.colors.primary + '40' : theme.colors.border,
            },
          ]}>
            <Ionicons 
              name="pricetag-outline" 
              size={20} 
              color={theme.colors.textSecondary} 
              style={styles.inputIcon}
            />
            <TextInput
              style={[styles.input, { color: theme.colors.text }]}
              placeholder="Ex: Collection Printemps 2025"
              placeholderTextColor={theme.colors.textDisabled}
              value={name}
              onChangeText={setName}
              maxLength={100}
            />
          </View>
        </View>

        {/* Description */}
        <View style={styles.fieldGroup}>
          <Text style={[styles.label, { color: theme.colors.text }]}>
            Description courte
            <Text style={{ color: theme.colors.error }}> *</Text>
          </Text>
          <View style={[
            styles.textAreaContainer,
            {
              backgroundColor: theme.colors.surface,
              borderColor: description ? theme.colors.primary + '40' : theme.colors.border,
            },
          ]}>
            <TextInput
              style={[styles.textArea, { color: theme.colors.text }]}
              placeholder="Décris ta collection..."
              placeholderTextColor={theme.colors.textDisabled}
              value={description}
              onChangeText={setDescription}
              maxLength={500}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* Type de teaser */}
        <View style={styles.fieldGroup}>
          <Text style={[styles.label, { color: theme.colors.text }]}>
            Type de média (optionnel)
          </Text>
          <View style={styles.radioGroup}>
            <TouchableOpacity
              style={[
                styles.radioButton,
                {
                  backgroundColor: teaserType === 'photo' 
                    ? theme.colors.primary + '15' 
                    : theme.colors.surface,
                  borderColor: teaserType === 'photo' 
                    ? theme.colors.primary 
                    : theme.colors.border,
                  borderWidth: teaserType === 'photo' ? 2 : 1,
                },
              ]}
              onPress={() => {
                setTeaserType('photo');
                setTeaserUri(null);
              }}
              activeOpacity={0.7}
            >
              <View style={[
                styles.radioIconContainer,
                { backgroundColor: teaserType === 'photo' ? theme.colors.primary : 'transparent' }
              ]}>
                <Ionicons
                  name="image"
                  size={20}
                  color={teaserType === 'photo' ? '#FFFFFF' : theme.colors.textSecondary}
                />
              </View>
              <Text
                style={[
                  styles.radioLabel,
                  {
                    color: teaserType === 'photo' 
                      ? theme.colors.primary 
                      : theme.colors.text,
                  },
                ]}
              >
                Photo
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.radioButton,
                {
                  backgroundColor: teaserType === 'video' 
                    ? theme.colors.primary + '15' 
                    : theme.colors.surface,
                  borderColor: teaserType === 'video' 
                    ? theme.colors.primary 
                    : theme.colors.border,
                  borderWidth: teaserType === 'video' ? 2 : 1,
                },
              ]}
              onPress={() => {
                setTeaserType('video');
                setTeaserUri(null);
              }}
              activeOpacity={0.7}
            >
              <View style={[
                styles.radioIconContainer,
                { backgroundColor: teaserType === 'video' ? theme.colors.primary : 'transparent' }
              ]}>
                <Ionicons
                  name="videocam"
                  size={20}
                  color={teaserType === 'video' ? '#FFFFFF' : theme.colors.textSecondary}
                />
              </View>
              <Text
                style={[
                  styles.radioLabel,
                  {
                    color: teaserType === 'video' 
                      ? theme.colors.primary 
                      : theme.colors.text,
                  },
                ]}
              >
                Vidéo
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Upload teaser */}
        <View style={styles.fieldGroup}>
          <Text style={[styles.label, { color: theme.colors.text }]}>
            Média teaser (optionnel)
          </Text>
          {!teaserUri ? (
            <TouchableOpacity
              style={[
                styles.uploadButton,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                },
              ]}
              onPress={pickMedia}
              activeOpacity={0.7}
            >
              <View style={[styles.uploadIconContainer, { backgroundColor: theme.colors.primary + '20' }]}>
                <Ionicons
                  name="cloud-upload"
                  size={32}
                  color={theme.colors.primary}
                />
              </View>
              <Text style={[styles.uploadText, { color: theme.colors.text }]}>
                {teaserType === 'photo' ? 'Choisir une photo' : 'Choisir une vidéo'}
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.previewContainer}>
              {teaserType === 'photo' ? (
                <Image
                  source={{ uri: teaserUri }}
                  style={styles.preview}
                  resizeMode="cover"
                />
              ) : (
                <>
                  <Video
                    ref={videoRef}
                    source={{ uri: teaserUri }}
                    style={styles.preview}
                    resizeMode={ResizeMode.CONTAIN}
                    useNativeControls
                    isLooping
                    shouldPlay={false}
                    onLoadStart={() => setVideoLoading(true)}
                    onLoad={handleVideoLoad}
                    onError={handleVideoError}
                  />
                  {videoLoading && (
                    <View style={styles.videoLoadingOverlay}>
                      <ActivityIndicator size="large" color={theme.colors.primary} />
                    </View>
                  )}
                </>
              )}
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.7)']}
                style={styles.previewGradient}
              >
                <TouchableOpacity
                  style={[styles.changeButton, { backgroundColor: theme.colors.primary }]}
                  onPress={pickMedia}
                  activeOpacity={0.8}
                >
                  <Ionicons name="sync" size={16} color="#FFFFFF" />
                  <Text style={styles.changeButtonText}>Modifier</Text>
                </TouchableOpacity>
              </LinearGradient>
            </View>
          )}
        </View>

        {/* Date de lancement */}
        <View style={styles.fieldGroup}>
          <Text style={[styles.label, { color: theme.colors.text }]}>
            Date/heure de lancement
            <Text style={{ color: theme.colors.error }}> *</Text>
          </Text>
          <View style={styles.dateTimeRow}>
            <TouchableOpacity
              style={[
                styles.dateTimeButton,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                },
              ]}
              onPress={() => setShowDatePicker(true)}
              activeOpacity={0.7}
            >
              <View style={[styles.dateTimeIcon, { backgroundColor: theme.colors.primary + '20' }]}>
                <Ionicons
                  name="calendar"
                  size={18}
                  color={theme.colors.primary}
                />
              </View>
              <View style={styles.dateTimeContent}>
                <Text style={[styles.dateTimeLabel, { color: theme.colors.textSecondary }]}>
                  Date
                </Text>
                <Text style={[styles.dateTimeText, { color: theme.colors.text }]}>
                  {launchDate.toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.dateTimeButton,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                },
              ]}
              onPress={() => setShowTimePicker(true)}
              activeOpacity={0.7}
            >
              <View style={[styles.dateTimeIcon, { backgroundColor: theme.colors.primary + '20' }]}>
                <Ionicons
                  name="time"
                  size={18}
                  color={theme.colors.primary}
                />
              </View>
              <View style={styles.dateTimeContent}>
                <Text style={[styles.dateTimeLabel, { color: theme.colors.textSecondary }]}>
                  Heure
                </Text>
                <Text style={[styles.dateTimeText, { color: theme.colors.text }]}>
                  {launchDate.toLocaleTimeString('fr-FR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Preview du statut */}
        {hasMedia && (
          <View style={[styles.statusPreview, { backgroundColor: theme.colors.primary + '15' }]}>
            <Ionicons name="eye" size={20} color={theme.colors.primary} />
            <Text style={[styles.statusPreviewText, { color: theme.colors.primary }]}>
              Statut prévu: <Text style={{ fontWeight: '700' }}>Teaser</Text>
            </Text>
          </View>
        )}

        {showDatePicker && (
          <DateTimePicker
            value={launchDate}
            mode="date"
            display="default"
            minimumDate={new Date(Date.now() + 3600000)}
            onChange={handleDateChange}
          />
        )}

        {showTimePicker && (
          <DateTimePicker
            value={launchDate}
            mode="time"
            display="default"
            is24Hour={true}
            onChange={handleTimeChange}
          />
        )}
      </ScrollView>

      {/* Actions */}
      <View style={[styles.footer, { 
        borderTopColor: theme.colors.borderLight,
        backgroundColor: theme.colors.card,
      }]}>
        {onPrevious && (
          <TouchableOpacity
            style={[styles.backButton, { 
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            }]}
            onPress={onPrevious}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={18} color={theme.colors.textSecondary} />
            <Text style={[styles.backButtonText, { color: theme.colors.textSecondary }]}>
              Retour
            </Text>
          </TouchableOpacity>
        )}

        {onNext && (
          <TouchableOpacity
            style={[
              styles.nextButton,
              {
                backgroundColor: name.trim() && description.trim() ? theme.colors.primary : theme.colors.border,
                opacity: name.trim() && description.trim() ? 1 : 0.5,
              },
            ]}
            onPress={onNext}
            disabled={!name.trim() || !description.trim()}
            activeOpacity={0.8}
          >
            <Text style={styles.nextButtonText}>Suivant</Text>
            <Ionicons name="arrow-forward" size={20} color="#FFF" />
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  title: { fontSize: 24, fontWeight: '700', letterSpacing: -0.5 },
  subtitle: { fontSize: 14, marginTop: 4 },
  scrollView: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40 },
  infoBox: {
    flexDirection: 'row',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 24,
    gap: 10,
  },
  infoText: { flex: 1, fontSize: 13, lineHeight: 18 },
  fieldGroup: { marginBottom: 24 },
  label: { fontSize: 15, fontWeight: '600', marginBottom: 10 },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 54,
    borderRadius: 14,
    borderWidth: 1.5,
    paddingHorizontal: 16,
  },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, fontSize: 16, fontWeight: '500' },
  textAreaContainer: {
    minHeight: 120,
    borderRadius: 14,
    borderWidth: 1.5,
    padding: 16,
  },
  textArea: { fontSize: 16, lineHeight: 22, fontWeight: '400' },
  radioGroup: { flexDirection: 'row', gap: 12 },
  radioButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderRadius: 14,
    gap: 12,
  },
  radioIconContainer: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioLabel: { fontSize: 16, fontWeight: '600' },
  uploadButton: {
    height: 180,
    borderRadius: 16,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  uploadIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadText: { fontSize: 17, fontWeight: '600' },
  previewContainer: {
    position: 'relative',
    height: 240,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  preview: { width: '100%', height: '100%' },
  videoLoadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
    justifyContent: 'flex-end',
    padding: 16,
  },
  changeButton: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    gap: 6,
  },
  changeButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
  dateTimeRow: { flexDirection: 'row', gap: 12 },
  dateTimeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    gap: 12,
  },
  dateTimeIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateTimeContent: { flex: 1 },
  dateTimeLabel: { fontSize: 12, fontWeight: '500', marginBottom: 2 },
  dateTimeText: { fontSize: 15, fontWeight: '600' },
  statusPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    gap: 8,
    marginTop: 8,
  },
  statusPreviewText: { fontSize: 14, fontWeight: '500' },
  footer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
  },
  backButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    gap: 6,
  },
  backButtonText: { fontSize: 16, fontWeight: '600' },
  nextButton: {
    flex: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 14,
    gap: 8,
  },
  nextButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
});

