import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  SafeAreaView,
  Dimensions,
} from "react-native";

const { width } = Dimensions.get("window");

export default function LotoApp() {
  const [historique, setHistorique] = useState([]);
  const [derniereBoule, setDerniereBoule] = useState("");
  const [saisieEnCours, setSaisieEnCours] = useState("");

  const taperChiffre = (ch) => {
    if (saisieEnCours.length < 2) {
      setSaisieEnCours(prev => prev + ch);
    }
  };

  const validerNumero = () => {
    const num = parseInt(saisieEnCours);
    if (!isNaN(num) && num >= 1 && num <= 90) {
      setHistorique(prev => [num, ...prev]);
      setDerniereBoule(num.toString());
    }
    setSaisieEnCours("");
  };

  const handleDemarquer = () => {
    setHistorique([]);
    setDerniereBoule("");
    setSaisieEnCours("");
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER : COMPTEUR + HISTORIQUE */}
      <View style={styles.header}>
        <View style={styles.statsBox}>
          <Text style={styles.label}>BOULES</Text>
          <Text style={styles.valeur}>{historique.length}</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {historique.map((val, index) => (
            <View key={index} style={styles.bouleHisto}>
              <Text style={styles.texteBouleHisto}>{val}</Text>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* AFFICHAGE CENTRAL */}
      <View style={styles.mainDisplay}>
        <View style={styles.cercleDernier}>
          <Text style={styles.numeroDernier}>{derniereBoule || "--"}</Text>
        </View>
        <Text style={styles.texteSaisie}>Saisie : {saisieEnCours}</Text>
      </View>

      {/* CLAVIER */}
      <View style={styles.clavier}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, "⌫", 0, "OK"].map((touche) => (
          <TouchableOpacity
            key={touche}
            style={[
              styles.touche,
              touche === "OK" ? { backgroundColor: "#27AE60" } : null,
              touche === "⌫" ? { backgroundColor: "#C0392B" } : null
            ]}
            onPress={() => {
              if (touche === "OK") validerNumero();
              else if (touche === "⌫") setSaisieEnCours(saisieEnCours.slice(0, -1));
              else taperChiffre(touche.toString());
            }}
          >
            <Text style={styles.texteTouche}>{touche}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* BOUTON DÉMARQUER */}
      <TouchableOpacity 
        style={styles.boutonDemarquer} 
        onPress={handleDemarquer}
      >
        <Text style={styles.texteBouton}>DÉMARQUER (TOUT EFFACER)</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#2C3E50" },
  header: { flexDirection: "row", padding: 10, backgroundColor: "#1A252F", alignItems: 'center' },
  statsBox: { backgroundColor: "#D35400", padding: 8, borderRadius: 5, marginRight: 10, alignItems: 'center', minWidth: 60 },
  label: { color: "white", fontSize: 10, fontWeight: "bold" },
  valeur: { color: "white", fontSize: 20, fontWeight: "bold" },
  bouleHisto: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#34495E", justifyContent: "center", alignItems: "center", marginRight: 8, borderWidth: 1, borderColor: "white" },
  texteBouleHisto: { color: "white", fontWeight: "bold" },
  mainDisplay: { flex: 1, justifyContent: "center", alignItems: "center" },
  cercleDernier: { width: 140, height: 140, borderRadius: 70, backgroundColor: "#16A085", justifyContent: "center", alignItems: "center", borderWidth: 4, borderColor: "white" },
  numeroDernier: { fontSize: 80, color: "white", fontWeight: "bold" },
  texteSaisie: { color: "#F39C12", fontSize: 26, marginTop: 20, fontWeight: "bold" },
  clavier: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", padding: 10, backgroundColor: "#BDC3C7" },
  touche: { width: (width / 3) - 20, height: 70, backgroundColor: "#34495E", margin: 5, borderRadius: 10, justifyContent: "center", alignItems: "center" },
  texteTouche: { color: "white", fontSize: 30, fontWeight: "bold" },
  boutonDemarquer: { backgroundColor: "#E74C3C", padding: 25, alignItems: "center" },
  texteBouton: { color: "white", fontSize: 22, fontWeight: "bold" },
});
