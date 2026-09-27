import Constants, { ExecutionEnvironment } from "expo-constants";
import { Platform } from "react-native";

// En Expo Go no existen los módulos nativos propios (widgets) ni el push remoto en
// Android: esas funciones se apagan solas y el resto de la app sigue andando. En un
// build propio (EAS, APK) sí funcionan.
export const esExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
export const esAndroid = Platform.OS === "android";
export const hayWidgets = esAndroid && !esExpoGo;
export const hayPushRemoto = !esExpoGo;

// Web de Prodigia, para lo que todavía no está en la app.
export const URL_WEB = "https://prodigia-sandy.vercel.app/es";
