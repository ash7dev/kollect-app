/* eslint-disable @typescript-eslint/no-unused-vars */
 
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
  Image,
  Platform,
  Alert,
  ActivityIndicator,
  Animated,
  Dimensions,
} from 'react-native';
import { BlurView } from 'expo-blur';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../app/context/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import { storage, CollectionDraft } from '../../utils/storage';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

type TeaserType = 'photo' | 'video' | 'none';

interface CreateCollectionModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    description: string;
    teaserType: TeaserType;
    teaserUri: string;
    launchDate: Date;
    launchTime: Date;
  }) => Promise<void>;
  brandId: string;
}

export function CreateCollectionModal({
  visible,
  onClose,
  onSubmit,
  brandId,
}: CreateCollectionModalProps) {
  const { theme, isDark } = useTheme();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [teaserType, setTeaserType] = useState<TeaserType>('photo');
  const [teaserUri, setTeaserUri] = useState<string | null>(null);
  const [launchDate, setLaunchDate] = useState(new Date(Date.now() + 86400000)); // +24h
  const [launchTime, setLaunchTime] = useState(new Date(Date.now() + 86400000)); // +24h
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const slideAnim = useState(new Animated.Value(SCREEN_HEIGHT))[0];
  const videoRef = useRef<Video>(null);

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [slideAnim, visible]);

  useEffect(() => {
    if (!visible && videoRef.current) {
      videoRef.current.unloadAsync();
    }
  }, [visible]);

  const resetForm = () => {
    setName('');
    setDescription('');
    setTeaserType('photo');
    setTeaserUri(null);
    setLaunchDate(new Date(Date.now() + 86400000));
    setLaunchTime(new Date(Date.now() + 86400000));
  };

  const pickMedia = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission requise', 'Accès à la galerie nécessaire');
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
      if (teaserType === 'video') setIsLoading(true);
    }
  };

  const handleVideoLoad = (status: AVPlaybackStatus) => {
    if (status.isLoaded && videoRef.current) {
      videoRef.current.playAsync().catch(console.error);
    }
  };

  const handleFullscreenUpdate = (event: { fullscreenUpdate: number }) => {
    if (event.fullscreenUpdate === 3) { // PLAYER_DID_PRESENT
      setIsFullscreen(true);
    } else if (event.fullscreenUpdate === 2) { // PLAYER_DID_DISMISS
      setIsFullscreen(false);
    }
  };

  const toggleFullscreen = () => {
    if (teaserType === 'video' && videoRef.current) {
      if (isFullscreen) {
        videoRef.current.dismissFullscreenPlayer();
      } else {
        videoRef.current.presentFullscreenPlayer();
      }
    } else if (teaserType === 'photo' && teaserUri) {
      setIsFullscreen(!isFullscreen);
    }
  };

  const handleVideoError = (error: string) => {
    setIsLoading(false);
    Alert.alert('Erreur vidéo', 'Impossible de charger la vidéo.');
  };

  const validateForm = (): string | null => {
    if (!name.trim()) return 'Le nom est requis';
    if (name.trim().length < 3) return 'Minimum 3 caractères';
    if (!description.trim()) return 'La description est requise';
    if (description.trim().length < 10) return 'Minimum 10 caractères';
    if (!teaserUri) return 'Ajoute un teaser (photo ou vidéo)';
    const minDate = new Date(Date.now() + 3600000); // +1h
    if (launchDate <= minDate) return 'Lancement dans au moins 1 heure';
    const minTime = new Date(Date.now() + 3600000); // +1h
    if (launchTime <= minTime) return 'Lancement dans au moins 1 heure';
    return null;
  };

  const handleSubmit = async () => {
    const error = validateForm();
    if (error) {
      Alert.alert('Validation', error);
      return;
    }

    setIsLoading(true);

    try {
      const draft: CollectionDraft = {
        name: name.trim(),
        description: description.trim(),
        launchDate: launchDate.toISOString(),
        launchTime: launchTime.toISOString(),
        isFeatured: false,
        coverImage: teaserType === 'photo' ? teaserUri  || undefined : undefined,
        teaserVideo: teaserType === 'video' ? teaserUri || undefined : undefined,
        products: [],
      };

      // Sauvegarde dans localStorage
      const saved = storage.saveDraftCollection(draft);
      if (!saved) throw new Error('Échec de la sauvegarde locale');

      // Appelle le callback parent
      await onSubmit({
        name: draft.name,
        description: draft.description!,
        teaserType,
        teaserUri: draft.coverImage || draft.teaserVideo!,
        launchDate,
        launchTime,
      });

      Alert.alert(
        'Drop créé !',
        'Tu peux maintenant ajouter des produits.',
        [{
          text: 'OK',
          onPress: () => {
            resetForm();
            onClose();
          }
        }]
      );
    } catch (err) {
      Alert.alert('Erreur', err instanceof Error ? err.message : 'Échec');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (name || description || teaserUri) {
      Alert.alert(
        'Annuler ?',
        'Le brouillon sera supprimé.',
        [
          { text: 'Rester', style: 'cancel' },
          {
            text: 'Quitter',
            style: 'destructive',
            onPress: () => {
              storage.clearDraftCollection();
              resetForm();
              onClose();
            }
          }
        ]
      );
    } else {
      onClose();
    }
  };

  const handleDateChange = (event: DateTimePickerEvent, selected?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (event.type === 'set' && selected) {
      const newDate = new Date(launchDate);
      newDate.setFullYear(selected.getFullYear());
      newDate.setMonth(selected.getMonth());
      newDate.setDate(selected.getDate());
      setLaunchDate(newDate);
    }
  };

  const handleTimeChange = (event: DateTimePickerEvent, selected?: Date) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (event.type === 'set' && selected) {
      const newDate = new Date(launchDate);
      newDate.setHours(selected.getHours());
      newDate.setMinutes(selected.getMinutes());
      setLaunchDate(newDate);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <BlurView 
        intensity={isDark ? 60 : 80} 
        tint={isDark ? 'dark' : 'light'} 
        style={styles.overlay}
      >
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={handleClose} />

        <Animated.View style={[styles.modal, { transform: [{ translateY: slideAnim }] }]}>
          <View 
            style={[
              styles.container, 
              { 
                backgroundColor: theme.colors.card,
                borderTopWidth: 2,
                borderLeftWidth: 2,
                borderRightWidth: 2,
                borderColor: theme.colors.borderLight,
                // BOOM: Ombre forte
                shadowColor: isDark ? theme.colors.shadowDark : theme.colors.shadowLight,
                shadowOffset: { width: 0, height: -8 },
                shadowOpacity: 1,
                shadowRadius: 20,
                elevation: 16,
              }
            ]}
          >
            <LinearGradient
              colors={[`${theme.colors.accent}08`, 'transparent']}
              style={styles.gradient}
            />

            {/* Header BOOM */}
            <View 
              style={[
                styles.header, 
                { 
                  borderBottomColor: theme.colors.borderLight,
                  borderBottomWidth: 1,
                }
              ]}
            >
              <View>
                <Text style={[styles.title, { color: theme.colors.text }]}>
                  Nouveau Drop
                </Text>
                <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
                  Collection avec teaser & countdown
                </Text>
              </View>
              <TouchableOpacity 
                onPress={handleClose} 
                style={[
                  styles.closeBtn,
                  {
                    backgroundColor: theme.colors.surface,
                    borderWidth: 1,
                    borderColor: theme.colors.borderLight,
                  }
                ]}
              >
                <Ionicons name="close" size={22} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
              {/* Info Box BOOM */}
              <View 
                style={[
                  styles.infoBox, 
                  { 
                    backgroundColor: theme.colors.accent + '15', 
                    borderColor: theme.colors.accent + '30',
                    borderWidth: 1,
                  }
                ]}
              >
                <Ionicons name="information-circle" size={20} color={theme.colors.accent} />
                <Text style={[styles.infoText, { color: theme.colors.text }]}>
                  Ajoute des produits après création pour activer le drop
                </Text>
              </View>

              {/* Nom */}
              <View style={styles.field}>
                <Text style={[styles.label, { color: theme.colors.text }]}>Nom *</Text>
                <View 
                  style={[
                    styles.inputWrapper, 
                    { 
                      borderColor: name ? theme.colors.accent : theme.colors.borderLight,
                      backgroundColor: theme.colors.surface,
                      borderWidth: 1,
                    }
                  ]}
                >
                  <Ionicons name="pricetag-outline" size={20} color={theme.colors.textSecondary} />
                  <TextInput
                    style={[styles.input, { color: theme.colors.text }]}
                    placeholder="Été 2025"
                    placeholderTextColor={theme.colors.textDisabled}
                    value={name}
                    onChangeText={setName}
                    maxLength={100}
                  />
                </View>
                <Text style={[styles.hint, { color: theme.colors.textDisabled }]}>
                  {name.length}/100
                </Text>
              </View>

              {/* Description */}
              <View style={styles.field}>
                <Text style={[styles.label, { color: theme.colors.text }]}>Description *</Text>
                <View 
                  style={[
                    styles.textArea, 
                    { 
                      borderColor: description ? theme.colors.accent : theme.colors.borderLight,
                      backgroundColor: theme.colors.surface,
                      borderWidth: 1,
                    }
                  ]}
                >
                  <TextInput
                    style={[styles.textAreaInput, { color: theme.colors.text }]}
                    placeholder="Collection estivale en coton bio..."
                    placeholderTextColor={theme.colors.textDisabled}
                    value={description}
                    onChangeText={setDescription}
                    multiline
                    maxLength={500}
                  />
                </View>
                <Text style={[styles.hint, { color: theme.colors.textDisabled }]}>
                  {description.length}/500
                </Text>
              </View>

              {/* Teaser Type BOOM */}
              <View style={styles.field}>
                <Text style={[styles.label, { color: theme.colors.text }]}>Type de teaser *</Text>
                <View style={styles.radioGroup}>
                  {(['photo', 'video'] as TeaserType[]).map((type) => {
                    const isSelected = teaserType === type;
                    return (
                      <TouchableOpacity
                        key={type}
                        style={[
                          styles.radioBtn,
                          {
                            backgroundColor: isSelected ? theme.colors.primary : theme.colors.surface,
                            borderColor: isSelected ? theme.colors.primary : theme.colors.borderLight,
                            borderWidth: isSelected ? 2 : 1,
                            // BOOM: Ombre si sélectionné
                            shadowColor: isSelected ? theme.colors.primary : 'transparent',
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: isSelected ? 0.3 : 0,
                            shadowRadius: 6,
                            elevation: isSelected ? 3 : 0,
                          },
                        ]}
                        onPress={() => {
                          setTeaserType(type);
                          setTeaserUri(null);
                        }}
                      >
                        <Ionicons
                          name={type === 'photo' ? 'image' : 'videocam'}
                          size={20}
                          color={isSelected ? '#FFFFFF' : theme.colors.textSecondary}
                        />
                        <Text 
                          style={[
                            styles.radioText, 
                            { 
                              color: isSelected ? '#FFFFFF' : theme.colors.text,
                              fontWeight: isSelected ? '700' : '600',
                            }
                          ]}
                        >
                          {type === 'photo' ? 'Photo' : 'Vidéo'}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Upload BOOM */}
              <View style={styles.field}>
                <Text style={[styles.label, { color: theme.colors.text }]}>Média teaser *</Text>
                {!teaserUri ? (
                  <TouchableOpacity 
                    style={[
                      styles.uploadBtn,
                      {
                        backgroundColor: theme.colors.surface,
                        borderColor: theme.colors.borderLight,
                      }
                    ]} 
                    onPress={pickMedia}
                  >
                    <Ionicons name="cloud-upload" size={32} color={theme.colors.accent} />
                    <Text style={{ color: theme.colors.text, fontWeight: '600' }}>
                      Choisir {teaserType === 'photo' ? 'une photo' : 'une vidéo'}
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <View 
                    style={[
                      styles.preview,
                      {
                        borderWidth: 2,
                        borderColor: theme.colors.borderLight,
                        // BOOM: Ombre forte
                        shadowColor: isDark ? theme.colors.shadowDark : theme.colors.shadowLight,
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 1,
                        shadowRadius: 12,
                        elevation: 6,
                      }
                    ]}
                  >
                    <TouchableOpacity 
                      activeOpacity={0.9} 
                      onPress={toggleFullscreen}
                      style={styles.mediaContainer}
                    >
                      {teaserType === 'photo' ? (
                        <Image 
                          source={{ uri: teaserUri }} 
                          style={styles.previewImg} 
                          resizeMode="contain"
                        />
                      ) : (
                        <Video
                          ref={videoRef}
                          source={{ uri: teaserUri }}
                          style={styles.previewImg}
                          resizeMode={ResizeMode.CONTAIN}
                          useNativeControls
                          onLoad={handleVideoLoad}
                          onError={handleVideoError}
                          onFullscreenUpdate={handleFullscreenUpdate}
                          shouldPlay
                        />
                      )}
                      <View style={styles.fullscreenOverlay}>
                        <Ionicons name="expand" size={24} color="white" />
                      </View>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[
                        styles.changeBtn,
                        { backgroundColor: theme.colors.accent }
                      ]} 
                      onPress={pickMedia}
                    >
                      <Text style={{ color: '#fff', fontWeight: '700' }}>Changer</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              {/* Date BOOM */}
              <View style={styles.field}>
                <Text style={[styles.label, { color: theme.colors.text }]}>Lancement *</Text>
                <View style={styles.dateRow}>
                  <TouchableOpacity 
                    style={[
                      styles.dateBtn,
                      {
                        backgroundColor: theme.colors.surface,
                        borderColor: theme.colors.borderLight,
                        borderWidth: 1,
                      }
                    ]} 
                    onPress={() => setShowDatePicker(true)}
                  >
                    <Ionicons name="calendar" size={18} color={theme.colors.accent} />
                    <Text style={{ color: theme.colors.text, fontWeight: '600' }}>
                      {launchDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[
                      styles.dateBtn,
                      {
                        backgroundColor: theme.colors.surface,
                        borderColor: theme.colors.borderLight,
                        borderWidth: 1,
                      }
                    ]} 
                    onPress={() => setShowTimePicker(true)}
                  >
                    <Ionicons name="time" size={18} color={theme.colors.accent} />
                    <Text style={{ color: theme.colors.text, fontWeight: '600' }}>
                      {launchDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {showDatePicker && (
                <DateTimePicker
                  value={launchDate}
                  mode="date"
                  minimumDate={new Date(Date.now() + 3600000)}
                  onChange={handleDateChange}
                />
              )}
              {showTimePicker && (
                <DateTimePicker
                  value={launchDate}
                  mode="time"
                  is24Hour
                  onChange={handleTimeChange}
                />
              )}
            </ScrollView>

            {/* Footer BOOM */}
            <View 
              style={[
                styles.footer, 
                { 
                  borderTopColor: theme.colors.borderLight,
                  borderTopWidth: 1,
                  backgroundColor: theme.colors.card,
                  // BOOM: Ombre subtile
                  shadowColor: isDark ? theme.colors.shadowDark : theme.colors.shadowLight,
                  shadowOffset: { width: 0, height: -2 },
                  shadowOpacity: 0.15,
                  shadowRadius: 8,
                  elevation: 4,
                }
              ]}
            >
              <TouchableOpacity 
                style={[
                  styles.cancelBtn,
                  {
                    backgroundColor: theme.colors.surface,
                    borderWidth: 1,
                    borderColor: theme.colors.borderLight,
                  }
                ]} 
                onPress={handleClose} 
                disabled={isLoading}
              >
                <Text style={{ color: theme.colors.text, fontWeight: '700' }}>
                  Annuler
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.submitBtn, 
                  { 
                    backgroundColor: theme.colors.accent,
                    opacity: isLoading ? 0.7 : 1,
                    // BOOM: Ombre forte CTA
                    shadowColor: theme.colors.accent,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.4,
                    shadowRadius: 10,
                    elevation: 6,
                  }
                ]}
                onPress={handleSubmit}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Ionicons name="rocket" size={20} color="#fff" />
                    <Text style={styles.submitText}>Créer</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>

      {/* Modal de prévisualisation plein écran pour les images */}
      <Modal
        visible={isFullscreen && teaserType === 'photo'}
        transparent={false}
        statusBarTranslucent
        onRequestClose={() => setIsFullscreen(false)}
      >
        <View style={styles.fullscreenContainer}>
          {teaserUri && (
            <Image
              source={{ uri: teaserUri }}
              style={styles.fullscreenImage}
              resizeMode="contain"
            />
          )}
          <TouchableOpacity
            style={styles.closeFullscreenButton}
            onPress={() => setIsFullscreen(false)}
          >
            <Ionicons name="close" size={30} color="white" />
          </TouchableOpacity>
        </View>
      </Modal>
    </BlurView>
  </Modal>
  );
}

// === STYLES ===
const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject },
  modal: {
    height: '92%',
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: SCREEN_HEIGHT * 0.9,
  },
  fullscreenContainer: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenImage: {
    width: '100%',
    height: '100%',
  },
  closeFullscreenButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradient: { 
    position: 'absolute', 
    top: 0, 
    left: 0, 
    right: 0, 
    height: 200 
  },
  preview: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 8,
    position: 'relative',
  },
  mediaContainer: {
    width: '100%',
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  fullscreenOverlay: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 15,
    padding: 5,
  },
  previewImg: {
    width: '100%',
    height: '100%',
  },
  changeBtn: { 
    position: 'absolute', 
    bottom: 16, 
    alignSelf: 'center', 
    paddingHorizontal: 20,
    paddingVertical: 10, 
    borderRadius: 10,
  },
  container: { 
    flex: 1, 
    borderTopLeftRadius: 28, 
    borderTopRightRadius: 28, 
    overflow: 'hidden' 
  },
  header: { 
    flexDirection: 'row', 
    padding: 24, 
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  title: { 
    fontSize: 28, 
    fontWeight: '700',
    letterSpacing: -0.8,
  },
  subtitle: { 
    fontSize: 14, 
    marginTop: 4,
    fontWeight: '500',
  },
  closeBtn: { 
    width: 36, 
    height: 36, 
    borderRadius: 18, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  content: { padding: 24 },
  infoBox: { 
    flexDirection: 'row', 
    padding: 14, 
    borderRadius: 12, 
    marginBottom: 24, 
    gap: 10,
    alignItems: 'center',
  },
  infoText: { 
    flex: 1, 
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  field: { marginBottom: 28 },
  label: { 
    fontSize: 15, 
    fontWeight: '700', 
    marginBottom: 10,
    letterSpacing: -0.2,
  },
  inputWrapper: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    height: 54, 
    borderRadius: 14, 
    paddingHorizontal: 16,
  },
  input: { 
    flex: 1, 
    marginLeft: 12, 
    fontSize: 16,
    fontWeight: '500',
  },
  hint: { 
    fontSize: 12, 
    marginTop: 6,
    fontWeight: '600',
  },
  textArea: { 
    minHeight: 120, 
    borderRadius: 14, 
    padding: 16,
  },
  textAreaInput: { 
    fontSize: 16, 
    lineHeight: 22,
    fontWeight: '500',
  },
  radioGroup: { flexDirection: 'row', gap: 12 },
  radioBtn: { 
    flex: 1, 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 16, 
    borderRadius: 14, 
    gap: 12 
  },
  radioText: { 
    fontSize: 16,
    letterSpacing: -0.2,
  },
  uploadBtn: { 
    height: 180, 
    borderRadius: 16, 
    borderWidth: 2, 
    borderStyle: 'dashed', 
    justifyContent: 'center', 
    alignItems: 'center', 
    gap: 12,
  },
  dateRow: { flexDirection: 'row', gap: 12 },
  dateBtn: { 
    flex: 1, 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 16, 
    borderRadius: 14, 
    gap: 12,
  },
  footer: { 
    flexDirection: 'row', 
    padding: 24, 
    gap: 12,
  },
  cancelBtn: { 
    flex: 1, 
    paddingVertical: 16, 
    borderRadius: 14, 
    alignItems: 'center' 
  },
  submitBtn: { 
    flex: 1.5, 
    flexDirection: 'row', 
    paddingVertical: 16, 
    borderRadius: 14, 
    justifyContent: 'center', 
    alignItems: 'center', 
    gap: 8 
  },
  submitText: { 
    color: '#fff', 
    fontWeight: '700', 
    fontSize: 16,
    letterSpacing: -0.2,
  },
});