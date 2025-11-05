/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/array-type */
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from '../store/authStore';

export type AppStateValue =
  | 'initializing'
  | 'onboarding'
  | 'login'
  | 'rolePrompt'
  | 'createBrand'
  | 'clientSpace'
  | 'ceoSpace'
  | 'transitioning';

export type AppEvent =
  | { type: 'INIT_COMPLETE'; hasSeenOnboarding: boolean; isAuthenticated: boolean; user: any | null }
  | { type: 'ONBOARDING_COMPLETE' }
  | { type: 'LOGIN_SUCCESS'; user: any }
  | { type: 'LOGOUT' }
  | { type: 'ROLE_SELECTED'; role: 'client' | 'vendeur'; user: any }
  | { type: 'BRAND_CREATED'; user: any }
  | { type: 'REFRESH_USER'; user: any };

interface AppContext {
  user: any | null;
  previousState: AppStateValue | null;
  transitionReason: string | null;
}

export class AppStateMachine {
  private state: AppStateValue = 'initializing';
  private context: AppContext = { user: null, previousState: null, transitionReason: null };
  private listeners: Array<(state: AppStateValue, ctx: AppContext) => void> = [];

  async send(event: AppEvent) {
    switch (this.state) {
      case 'initializing':
        if (event.type === 'INIT_COMPLETE') {
          if (!event.hasSeenOnboarding) this.transition('onboarding', null, 'Premier lancement');
          else if (!event.isAuthenticated) this.transition('login', null, 'Non authentifié');
          else await this.routeAuthenticatedUser(event.user);
        }
        break;

      case 'login':
        if (event.type === 'LOGIN_SUCCESS') await this.routeAuthenticatedUser(event.user);
        break;

      case 'rolePrompt':
        if (event.type === 'ROLE_SELECTED') {
          if (event.role === 'vendeur') this.transition('createBrand', event.user, 'Rôle vendeur');
          else this.transition('clientSpace', event.user, 'Rôle client');
        }
        break;

      case 'createBrand':
        if (event.type === 'BRAND_CREATED') this.transition('ceoSpace', event.user, 'Marque créée');
        break;

      case 'clientSpace':
      case 'ceoSpace':
        if (event.type === 'LOGOUT') this.transition('login', null, 'Déconnexion');
        break;
    }
  }

  private async routeAuthenticatedUser(user: any) {
    if (!user?.has_seen_creator_prompt) return this.transition('rolePrompt', user, 'Choix rôle requis');
    if (user.isCEO && !user.brand) return this.transition('createBrand', user, 'Création marque requise');
    if (user.isCEO) return this.transition('ceoSpace', user, 'Espace CEO');
    if (user.isClient) return this.transition('clientSpace', user, 'Espace client');
    return this.transition('login', null, 'État indéterminé');
  }

  private transition(newState: AppStateValue, user: any | null, reason: string) {
    const previous = this.state;
    this.state = newState;
    this.context = { user, previousState: previous, transitionReason: reason };
    this.notify();
  }

  private notify() {
    this.listeners.forEach((l) => l(this.state, this.context));
  }

  subscribe(listener: (state: AppStateValue, ctx: AppContext) => void) {
    this.listeners.push(listener);
    listener(this.state, this.context);
    return () => (this.listeners = this.listeners.filter((l) => l !== listener));
  }

  getState() {
    return this.state;
  }
}

let machineInstance: AppStateMachine | null = null;

export const useAppStateMachine = () => {
  if (!machineInstance) machineInstance = new AppStateMachine();
  const [state, setState] = useState<AppStateValue>(machineInstance.getState());
  const [context, setContext] = useState<AppContext>({ user: null, previousState: null, transitionReason: null });

  useEffect(() => {
    const unsubscribe = machineInstance!.subscribe((s, c) => {
      setState(s);
      setContext(c);
    });
    return unsubscribe;  // Return the cleanup function directly
  }, []);

  return { state, context, send: (e: AppEvent) => machineInstance!.send(e) };
};
