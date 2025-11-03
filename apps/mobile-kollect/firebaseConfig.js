// Import with error handling
import { Platform } from 'react-native';

import * as Notifications from 'expo-notifications';
let firebase;
try {
  // eslint-disable-next-line no-unused-vars
  firebase = require('@react-native-firebase/app').default;
// eslint-disable-next-line no-unused-vars
} catch (error) {
  console.warn('Firebase native module not found. Make sure to run "npx expo install @react-native-firebase/app" and rebuild your app.');
}

// Initialiser Firebase (automatique via app.json)
export const initializeFirebase = async () => {
  try {
    console.log('Firebase initialisé avec succès');
  } catch (error) {
    console.error('Erreur lors de l’initialisation de Firebase:', error);
  }
};

// Demander les permissions de notification
export const requestNotificationPermission = async () => {
  try {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status === 'granted') {
      console.log('Autorisation des notifications accordée');
      return true;
    } else {
      console.log('Autorisation des notifications refusée');
      return false;
    }
  } catch (error) {
    console.error('Erreur lors de la demande de permission:', error);
    return false;
  }
};

// Obtenir le token de notification (équivalent au FCM Token)
export const getNotificationToken = async () => {
  try {
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') {
      console.log('Permissions de notification non accordées');
      return null;
    }
    const token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log('Expo Push Token:', token);
    return token;
  } catch (error) {
    console.error('Erreur lors de la récupération du token:', error);
    return null;
  }
};

// Gérer les notifications
export const setupNotifications = async () => {
  // Notifications au premier plan
  Notifications.addNotificationReceivedListener(notification => {
    console.log('Notification reçue au premier plan:', notification);
  });

  // Réaction au clic sur une notification
  Notifications.addNotificationResponseReceivedListener(response => {
    console.log('Interaction avec la notification:', response);
  });

  // Configurer le canal de notification pour Android
  if (Platform.OS === 'android') {
    try {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    } catch (error) {
      console.warn('Could not set notification channel:', error);
    }
  }
};