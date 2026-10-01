import Svg, { Circle, Defs, G, LinearGradient, Path, Stop, Use } from "react-native-svg";

// El logo de Prodigia (components/Logo.tsx de la web, mismo trazo): aro violeta con
// una apertura de la que brota una chispa asimétrica de 4 puntas en degradé
// violeta → dorado.
export default function Logo({ tam = 64, colorAro = "#6C4CF1" }: { tam?: number; colorAro?: string }) {
  return (
    <Svg width={tam} height={tam} viewBox="0 0 100 100">
      <Defs>
        <LinearGradient id="prodigia-star-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
          <Stop offset="0%" stopColor="#A794FF" />
          <Stop offset="50%" stopColor="#E4CBA0" />
          <Stop offset="100%" stopColor="#FFC53D" />
        </LinearGradient>
        <Path id="prodigia-spark-arm" d="M0,0 C-10,-9 -5,-27 0.5,-36 C4,-24 7,-8 0,0 Z" />
      </Defs>
      <Circle cx="50" cy="50" r="34" fill="none" stroke={colorAro} strokeWidth={14} strokeDasharray="158.6 55" strokeDashoffset={27.5} transform="rotate(82 50 50)" />
      <G transform="translate(82 44) rotate(14)" fill="url(#prodigia-star-gradient)">
        <Use href="#prodigia-spark-arm" />
        <Use href="#prodigia-spark-arm" transform="rotate(180) scale(0.33)" />
        <Use href="#prodigia-spark-arm" transform="rotate(84) scale(0.2)" />
        <Use href="#prodigia-spark-arm" transform="rotate(268) scale(0.15)" />
      </G>
    </Svg>
  );
}
