/* eslint-disable prettier/prettier */
// src/config/firebase.config.ts

import * as admin from 'firebase-admin';
import { Logger } from '@nestjs/common';

export class FirebaseAdmin {
  private static instance: FirebaseAdmin;
  private logger = new Logger('FirebaseAdmin');

  private constructor() {
    this.initialize();
  }

  static getInstance(): FirebaseAdmin {
    if (!FirebaseAdmin.instance) {
      FirebaseAdmin.instance = new FirebaseAdmin();
    }
    return FirebaseAdmin.instance;
  }

  private initialize(): void {
    try {
      if (admin.apps.length > 0) {
        this.logger.log('Firebase Admin already initialized');
        return;
      }

      const serviceAccount = {
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      };

      if (!serviceAccount.projectId || !serviceAccount.clientEmail || !serviceAccount.privateKey) {
        throw new Error('Missing Firebase Admin SDK credentials in environment variables');
      }

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
      });

      this.logger.log('Firebase Admin SDK initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Firebase Admin SDK:', error);
      throw error;
    }
  }

  getAuth(): admin.auth.Auth {
    return admin.auth();
  }

  getMessaging(): admin.messaging.Messaging {
    return admin.messaging();
  }

  // Add other Firebase services as needed
}

// Initialize Firebase Admin SDK when this module is imported
FirebaseAdmin.getInstance();