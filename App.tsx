import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  SafeAreaView,
  Dimensions,
  Modal,
  TextInput,
} from "react-native";

const { width } = Dimensions.get("window");

// --- TYPES ---
interface NumeroSaisi {
  val: number;
  date: string;
}

interface Organisateur {
  id: string;
  nom: string;
}

export default function LotoApp() {
  // --- ÉTATS ---
  const [view, setView] = useState("SAISIE");
  const [historique, setHistorique] = useState<NumeroSaisi[]>([]);
  const [derniereBoule, setDerniereBoule] = useState("");
  const [saisieEnCours, setSaisieEnCours] = useState("");
  
  // États pour les Organisateurs
  const [organisateurs, setOrganisateurs] = useState<Organisateur[]>([]);
  const [modalOrgVisible, setModalOrgVisible] = useState(false);
  const [nomOrg, setNomOrg] = useState("");

  // --- FONCTIONS ---

  const taperChiffre = (ch: string) => {
    if (saisieEnCours.length < 2) setSaisieEnCours(prev => prev + ch);
  };

  const validerNumero = () => {
    const num = parseInt(saisieEnCours);
    if (!isNaN(num) && num >= 1 && num <= 90) {
      const nouveau = { val: num, date: new Date().toLocaleTimeString() };
      setHistorique([nouveau, ...historique]);
      setDerniereBoule(num.toString());
    }
    setSaisieEnCours("");
  };

  // FONCTION DÉMARQUER CORRIGÉE
  const handleDemarquer = () => {
    setHistorique([]);
    setDerniereBoule("");
    setSaisieEnCours("");
  };

  const ajouterOrganisateur = () => {
    if (nomOrg.trim().length > 0) {
      const newOrg = { id: Date.now().toString(), nom: nomOrg };
      setOrganisateurs([...organisateurs, newOrg]);
      setNomOrg("");
      setModalOrgVisible(false);
    }
  };

  // --- RENDU ---
  return (
    <SafeAreaView style={styles.container}>
      {/* MENU NAVIGATION */}
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => setView("SAISIE")} style={[styles.navBtn, view === "SAISIE" && styles.navBtnActive]}>
          <Text style={styles.navText}>SAISIE</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setView("STATS")} style={[styles.navBtn, view === "STATS" && styles.navBtnActive]}>
          <Text style={styles.navText}>STATS</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setModalOrgVisible(true)} style={styles.navBtn}>
          <Text style={styles.navText}>+ ORG</Text>
        </TouchableOpacity>
      </View>

      {view === "SAISIE" ? (
        <>
          {/* HEADER : HISTORIQUE */}
          <View style={styles.header}>
            <View style={styles.statsBox}>
              <Text style={styles.label}>BOULES</Text>
              <Text style={styles.valeur}>{historique.length}</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {historique.map((item, index) => (
                <View key={index} style={styles.bouleHisto}>
                  <Text style={styles.texteBouleHisto}>{item.val}</Text>
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
                key={touche.toString()}
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

          <TouchableOpacity style={styles.boutonDemarquer} onPress={handleDemarquer}>
            <Text style={styles.texteBouton}>DÉMARQUER (TOUT EFFACER)</Text>
          </TouchableOpacity>
        </>
      ) : (
        /* VUE STATS */
        <ScrollView style={styles.statsContainer}>
          <Text style={styles.title}>Statistiques des numéros</Text>
          {organisateurs.map(org => (
            <View key={org.id} style={styles.orgItem}>
              <Text style={styles.orgText}>{org.nom}</Text>
            </View>
          ))}
          {historique.length === 0 && <Text style={styles.infoText}>Aucune donnée disponible</Text>}
        </ScrollView>
      )}

      {/* MODAL AJOUT ORGANISATEUR */}
      <Modal visible={modalOrgVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Nouvel Organisateur</Text>
            <TextInput 
              style={styles.input} 
              placeholder="Nom de l'organisateur" 
              value={nomOrg}
              onChangeText={setNomOrg}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity onPress={() => setModalOrgVisible(false)} style={styles.btnCancel}><Text style={styles.btnText}>Annuler</Text></TouchableOpacity>
              <TouchableOpacity onPress={ajouterOrganisateur} style={styles.btnSave}><Text style={styles.btnText}>Ajouter</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#2C3E50" },
  navBar: { flexDirection: "row", backgroundColor: "#1A252F", paddingVertical: 10 },
  navBtn: { flex: 1, alignItems: "center", padding: 10 },
  navBtnActive: { borderBottomWidth: 3, borderBottomColor: "#F39C12" },
  navText: { color: "white", fontWeight: "bold" },
  header: { flexDirection: "row", padding: 10, backgroundColor: "#1A252F", alignItems: 'center' },
  statsBox: { backgroundColor: "#D35400", padding: 8, borderRadius: 5, marginRight: 10, alignItems: 'center', minWidth: 60 },
  label: { color: "white", fontSize: 10 },
  valeur: { color: "white", fontSize: 20, fontWeight: "bold" },
  bouleHisto: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#34495E", justifyContent: "center", alignItems: "center", marginRight: 8, borderWidth: 1, borderColor: "white" },
  texteBouleHisto: { color: "white", fontWeight: "bold" },
  mainDisplay: { flex: 1, justifyContent: "center", alignItems: "center" },
  cercleDernier: { width: 140, height: 140, borderRadius: 70, backgroundColor: "#16A085", justifyContent: "center", alignItems: "center", borderWidth: 4, borderColor: "white" },
  numeroDernier: { fontSize: 80, color: "white", fontWeight: "bold" },
  texteSaisie: { color: "#F39C12", fontSize: 26, marginTop: 20, fontWeight: "bold" },
  clavier: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", padding: 10, backgroundColor: "#BDC3C7" },
  touche: { width: (width / 3) - 20, height: 60, backgroundColor: "#34495E", margin: 5, borderRadius: 10, justifyContent: "center", alignItems: "center" },
  texteTouche: { color: "white", fontSize: 28, fontWeight: "bold" },
  boutonDemarquer: { backgroundColor: "#E74C3C", padding: 20, alignItems: "center" },
  texteBouton: { color: "white", fontSize: 18, fontWeight: "bold" },
  statsContainer: { padding: 20 },
  title: { color: "white", fontSize: 22, fontWeight: "bold", marginBottom: 20 },
  orgItem: { backgroundColor: "#34495E", padding: 15, borderRadius: 8, marginBottom: 10 },
  orgText: { color: "white", fontSize: 16 },
  infoText: { color: "#BDC3C7", textAlign: "center", marginTop: 50 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.7)", justifyContent: "center", alignItems: "center" },
  modalContent: { backgroundColor: "white", padding: 20, borderRadius: 10, width: "80%" },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 15 },
  input: { borderBottomWidth: 1, borderColor: "#CCC", marginBottom: 20, padding: 8 },
  modalButtons: { flexDirection: "row", justifyContent: "space-between" },
  btnCancel: { backgroundColor: "#95A5A6", padding: 10, borderRadius: 5, flex: 0.45, alignItems: 'center' },
  btnSave: { backgroundColor: "#27AE60", padding: 10, borderRadius: 5, flex: 0.45, alignItems: 'center' },
  btnText: { color: "white", fontWeight: "bold" },
});
