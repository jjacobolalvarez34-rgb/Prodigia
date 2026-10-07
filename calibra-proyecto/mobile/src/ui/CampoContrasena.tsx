import { useState } from "react";
import { Pressable, StyleSheet, TextInput, View, type StyleProp, type TextStyle } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";
import { vibrar } from "~/lib/efectos";
import { color } from "~/tema";

// Contraseña con el ojito para verla mientras la escribes.
export default function CampoContrasena({
  valor,
  onCambio,
  placeholder = "Contraseña",
  onEnviar,
  estilo,
}: {
  valor: string;
  onCambio: (v: string) => void;
  placeholder?: string;
  onEnviar?: () => void;
  estilo: StyleProp<TextStyle>;
}) {
  const [ver, setVer] = useState(false);
  return (
    <View>
      <TextInput
        style={[estilo, { paddingRight: 52 }]}
        placeholder={placeholder}
        placeholderTextColor={color.texto2}
        secureTextEntry={!ver}
        autoCapitalize="none"
        autoCorrect={false}
        value={valor}
        onChangeText={onCambio}
        onSubmitEditing={onEnviar}
      />
      <Pressable
        onPress={() => {
          vibrar.seleccion();
          setVer((v) => !v);
        }}
        hitSlop={10}
        style={styles.ojo}
        accessibilityLabel={ver ? "Ocultar contraseña" : "Ver contraseña"}
      >
        <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={ver ? color.primarioClaro : color.texto2} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <Path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" />
          <Circle cx={12} cy={12} r={3} />
          {!ver && <Path d="M3 3l18 18" />}
        </Svg>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  ojo: { position: "absolute", right: 0, top: 0, bottom: 0, width: 50, alignItems: "center", justifyContent: "center" },
});
