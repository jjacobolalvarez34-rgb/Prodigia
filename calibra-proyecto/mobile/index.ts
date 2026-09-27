// Entrada de la app: la de Expo Router + el registro de los widgets de Android (el
// sistema puede arrancar la app en segundo plano solo para dibujar un widget, así
// que el handler tiene que registrarse al cargar el bundle, no dentro de una pantalla).
import "expo-router/entry";
import { registrarWidgets } from "./src/widgets/registro";

registrarWidgets();
