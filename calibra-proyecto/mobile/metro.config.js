// La app comparte la lógica pura de la web (generadores de problemas, fórmulas de
// XP, rng...) leyéndola directo de ../calibra/src, sin copiarla: así un cambio en
// un generador llega a la web y a la app a la vez. Metro solo ve archivos dentro
// de la carpeta del proyecto salvo que se le agregue la carpeta a watchFolders.
// Cuando se arme el monorepo (docs/app-nativa/01-STACK-Y-ARQUITECTURA.md §4) esto
// pasa a ser packages/core.
const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

const webSrc = path.resolve(__dirname, "../calibra/src");
config.watchFolders = [...(config.watchFolders ?? []), webSrc];
// Los archivos compartidos no importan paquetes en tiempo de ejecución, pero si
// alguno lo hiciera, que se resuelvan con los node_modules de la app (una sola
// copia de React Native), nunca con los de la web.
config.resolver.nodeModulesPaths = [path.resolve(__dirname, "node_modules")];
config.resolver.disableHierarchicalLookup = true;

module.exports = config;
