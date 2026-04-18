import React, { useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Dimensions,
} from "react-native";

// --- TYPES ---
interface NumeroSaisi {
  val: number;
  mode: string;
  typePartie: string;
  date: string;
}

interface Organisateur {
  id: string;
  nom: string;
  history: NumeroSaisi[];
}

const { width } = Dimensions.get("window");

export default function LotoApp() {
  const [view, setView] = useState<"SAISIE" | "STATS">("SAISIE");
  const [menuVisible, setMenuVisible] = useState(false);
  const [modalPartieVisible, setModalPartieVisible] = useState(false);
  const [modalAddOrgVisible, setModalAddOrgVisible] = useState(false);
  const [modalSelectOrgVisible, setModalSelectOrgVisible] = useState(false);

  const [newOrgName, setNewOrgName] = useState("");
  const [organisateurs, setOrganisateurs] = useState<Organisateur[]>([]);
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);

  const [currentInput, setCurrentInput] = useState("");
  const [typePartie, setTypePartie] = useState("Quine");
  const [history, setHistory] = useState<NumeroSaisi[]>([]);

  // --- FONCTIONS ---

  const handleNumberPress = (num: string) => {
    if (currentInput.length < 2) {
      setCurrentInput(prev => prev + num);
    }
  };

  const handleValidate = () => {
    const val = parseInt(currentInput);
    if (isNaN(val) || val < 1 || val > 90) {
      setCurrentInput("");
      return;
    }
    const newItem: NumeroSaisi = {
      val,
      mode: "Manuel",
      typePartie,
      date: new Date().toLocaleTimeString(),
    };
    setHistory([newItem, ...history]);
    setCurrentInput("");
  };

  const handleBackspace = () => {
    setCurrentInput(prev => prev.slice(0, -1));
  };

  // LA FONCTION DÉMARQUER CORRIGÉE
  const handleDemarquer = () => {
    setHistory([]);
    setCurrentInput("");
  };

  const addOrganisateur = () => {
    if (newOrgName.trim()) {
      const newOrg: Organisateur = {
        id: Date.now().toString(),
        nom: newOrgName,
        history: [],
      };
      setOrganisateurs([...organisateurs, newOrg]);
      setNewOrgName("");
      setModalAddOrgVisible(false);
    }
  };

  const currentOrg = organisateurs.find(o => o.id === selectedOrgId);

  return (
    <View style={styles.container}>
      {/* HEADER AVEC HISTORIQUE */}
      <View style={styles.header}>
        <View style={styles.statsContainer}>
          <Text style={styles.statsLabel}>BOULES</Text>
          <Text style={styles.statsValue}>{history.length}</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.historyScroll}>
          {history.map((item, index) => (
            <View key={index} style={styles.historyBall}>
              <Text style={styles.historyText}>{item.val}</Text>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* ZONE CENTRALE AFFICHAGE */}
      <View style={styles.displayArea}>
        <View style={styles.mainBall}>
          <Text style={styles.mainBallText}>{history[0]?.val || "--"}</Text>
        </View>
        <Text style={styles.inputPreview}>Saisie : {currentInput}</Text>
      </View>

      {/* CLAVIER DESIGN ORIGINAL */}
      <View style={styles.keyboardContainer}>
        <View style={styles.row}>
          {["1", "2", "3"].map(n => (
            <TouchableOpacity key={n} style={styles.key} onPress={() => handleNumberPress(n)}>
              <Text style={styles.keyText}>{n}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.row}>
          {["4", "5", "6"].map(n => (
            <TouchableOpacity key={n} style={styles.key} onPress={() => handleNumberPress(n)}>
              <Text style={styles.keyText}>{n}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.row}>
          {["7", "8", "9"].map(n => (
            <TouchableOpacity key={n} style={styles.key} onPress={() => handleNumberPress(n)}>
              <Text style={styles.keyText}>{n}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.row}>
          <TouchableOpacity style={[styles.key, styles.backKey]} onPress={handleBackspace}>
            <Text style={styles.keyText}>⌫</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.key} onPress={() => handleNumberPress("0")}>
            <Text style={styles.keyText}>0</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.key, styles.validKey]} onPress={handleValidate}>
            <Text style={styles.keyText}>OK</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* BOUTON DÉMARQUER STYLE ORIGINAL */}
      <TouchableOpacity style={styles.btnDemarquer} onPress={handleDemarquer}>
        <Text style={styles.btnDemarquerText}>DÉMARQUER</Text>
      </TouchableOpacity>

      {/* BARRE DE NAVIGATION BASSE */}
      <View style={styles.navBar}>
        <TouchableOpacity style={styles.navItem} onPress={() => setModalAddOrgVisible(true)}>
          <Text style={styles.navText}>+ ORG</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => setView("STATS")}>
          <Text style={styles.navText}>STATS</Text>
        </TouchableOpacity>
      </View>

      {/* MODAL ORGANISATEUR */}
      <Modal visible={modalAddOrgVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Nouvel Organisateur</Text>
            <TextInput
              style={styles.input}
              placeholder="Nom..."
              value={newOrgName}
              onChangeText={setNewOrgName}
            />
            <TouchableOpacity style={styles.modalBtn} onPress={addOrganisateur}>
              <Text style={styles.modalBtnText}>AJOUTER</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setModalAddOrgVisible(false)}>
              <Text style={{marginTop: 15, color: 'red'}}>Fermer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#1B6E85" },
  header: { flexDirection: "row", padding: 10, backgroundColor: "#0D3B46", alignItems: "center", height: 80 },
  statsContainer: { backgroundColor: "#D4A017", padding: 8, borderRadius: 5, alignItems: "center", marginRight: 10 },
  statsLabel: { color: "white", fontSize: 10, fontWeight: "bold" },
  statsValue: { color: "white", fontSize: 22, fontWeight: "bold" },
  historyScroll: { flex: 1 },
  historyBall: { width: 40, height: 40, borderRadius: 20, backgroundColor: "white", justifyContent: "center", alignItems: "center", marginRight: 8 },
  historyText: { color: "#1B6E85", fontWeight: "bold" },
  displayArea: { flex: 1, justifyContent: "center", alignItems: "center" },
  mainBall: { width: 150, height: 150, borderRadius: 75, backgroundColor: "#D4A017", justifyContent: "center", alignItems: "center", borderWidth: 4, borderColor: "white" },
  mainBallText: { fontSize: 80, color: "white", fontWeight: "bold" },
  inputPreview: { color: "white", fontSize: 24, marginTop: 20, fontWeight: "bold" },
  keyboardContainer: { backgroundColor: "#D4A017", padding: 10, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  row: { flexDirection: "row", justifyContent: "center" },
  key: { width: (width / 3) - 20, height: 60, backgroundColor: "#0D3B46", margin: 5, borderRadius: 10, justifyContent: "center", alignItems: "center" },
  keyText: { color: "white", fontSize: 30, fontWeight: "bold" },
  backKey: { backgroundColor: "#A52A2A" },
  validKey: { backgroundColor: "#2E8B57" },
  btnDemarquer: { backgroundColor: "#A52A2A", padding: 20, alignItems: "center" },
  btnDemarquerText: { color: "white", fontSize: 20, fontWeight: "bold" },
  navBar: { flexDirection: "row", backgroundColor: "#0D3B46", padding: 10 },
  navItem: { flex: 1, alignItems: "center" },
  navText: { color: "white", fontWeight: "bold" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.8)", justifyContent: "center", alignItems: "center" },
  modalContent: { backgroundColor: "white", padding: 25, borderRadius: 15, width: "80%", alignItems: "center" },
  modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 20 },
  input: { borderBottomWidth: 2, borderColor: "#D4A017", width: "100%", marginBottom: 20, fontSize: 18, padding: 5 },
  modalBtn: { backgroundColor: "#D4A017", padding: 12, borderRadius: 8, width: "100%", alignItems: "center" },
  modalBtnText: { color: "white", fontWeight: "bold", fontSize: 16 },
});
