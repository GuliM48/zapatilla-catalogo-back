import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

@Injectable()
export class FirebaseService implements OnModuleInit {
  private db: Firestore;
  private storageBucket: any;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const bucketName = this.configService.get<string>('FIREBASE_STORAGE_BUCKET');

    if (getApps().length === 0) {
      const projectId = this.configService.get<string>('FIREBASE_PROJECT_ID');
      const clientEmail = this.configService.get<string>('FIREBASE_CLIENT_EMAIL');
      let privateKey = this.configService.get<string>('FIREBASE_PRIVATE_KEY');

      if (privateKey) {
        // Convert literal \n to actual newlines
        privateKey = privateKey.replace(/\\n/g, '\n');
      }

      initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
        storageBucket: bucketName,
      });
    }

    this.db = getFirestore();
    this.storageBucket = getStorage().bucket(bucketName);
  }

  getFirestore(): Firestore {
    return this.db;
  }

  getBucket(): any {
    return this.storageBucket;
  }
}
