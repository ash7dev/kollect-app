// services/kindeConfig.ts
export const kindeConfig = {
    domain: 'https://kollectauth.kinde.com',
    clientId: '297fe293a2d845c8981038b321d6d81e',
    // ✅ Pour développement local avec Expo Go
    redirectUri: 'exp://192.168.1.7:8081',
    logoutRedirectTo: 'exp://192.168.1.7:8081',
    scopes: 'openid profile email offline',
  };