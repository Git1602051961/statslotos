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

// --- TYPES ---
interface NumeroSaisi {
  val: number;
  date: string;
}

const { width } = Dimensions.get("window");

export default function LotoApp() {
  const [historique, setHistorique] = useState<NumeroSaisi[]>([]);
  const [derniereBoule, setDerniereBoule] = useState<string>("");
  const [saisieEnCours, setSaisieEnCours] = useState<string>("");

  // FONCTION VALIDER
  const validerNumero = () => {
    const num = parseInt(saisieEnCours);
    if (!isNaN(num) && num >= 1 && num <= 90) {
      const nouveau: NumeroSaisi = { val: num, date: new Date().toLocaleTimeString() };
      setHistorique([nouveau, ...historique]);
      setDerniereBoule(num.toString());
    }
    setSaisieEnCours("");
  };

  // FONCTION DÉMARQUER (Version simplifiée au maximum)
  const handleDemarquer = () => {
    setHistorique([]);
    setDerniereBoule("");
    setSaisieEnCours("");
  };

  const taperChiffre = (ch) => {
    if (saisieEnCours.length < 2) setSaisieEnCours(prev => prev + ch);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER : COMPTEUR + HISTORIQUE */}
      <View style={styles.header}>
        <View style={styles.statsBox}>
          <Text style={styles.label}>BOULES</Text>
          <Text style={styles.valeur}>{historique.length}</Text>
        </View>
        <ScrollView horizontal style={{flexDirection: 'row'}}>
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
            key={touche}
            style={[
              styles.touche,
              touche === "OK" && { backgroundColor: "#27AE60" },
              touche === "⌫" && { backgroundColor: "#C0392B" }
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

      {/* BOUTON DÉMARQUER - Placé tout en bas avec un style bien distinct */}
      <TouchableOpacity 
        style={styles.boutonDemarquer} 
        onPress={handleDemarquer}
        activeOpacity={0.7}
      >
        <Text style={styles.texteBouton}>TOUT EFFACER (DÉMARQUER)</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#2C3E50" },
  header: { flexDirection: "row", padding: 10, backgroundColor: "#1A252F", height: 80, alignItems: 'center' },
  statsBox: { backgroundColor: "#D35400", padding: 8, borderRadius: 5, marginRight: 10 },
  label: { color: "white", fontSize: 10 },
  valeur: { color: "white", fontSize: 18, fontWeight: "bold" },
  bouleHisto: { width: 35, height: 35, borderRadius: 18, backgroundColor: "#34495E", justifyContent: "center", alignItems: "center", marginRight: 5, borderWidth: 1, borderColor: "white" },
  texteBouleHisto: { color: "white", fontSize: 14 },
  mainDisplay: { flex: 1, justifyContent: "center", alignItems: "center" },
  cercleDernier: { width: 130, height: 130, borderRadius: 65, backgroundColor: "#16A085", justifyContent: "center", alignItems: "center", borderWidth: 4, borderColor: "white", borderStyle: "dashed" },
  numeroDernier: { fontSize: 70, color: "white", fontWeight: "bold" },
  texteSaisie: { color: "white", fontSize: 22, marginTop: 15 },
  clavier: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", padding: 5, backgroundColor: "#F39C12" },
  touche: { width: (width / 3) - 15, height: 60, backgroundColor: "#34495E", margin: 5, borderRadius: 8, justifyContent: "center", alignItems: "center" },
  texteTouche: { color: "white", fontSize: 24, fontWeight: "bold" },
  boutonDemarquer: { backgroundColor: "#E74C3C", padding: 20, width: '100%', alignItems: "center", borderTopWidth: 2, borderColor: 'white' },
  texteBouton: { color: "white", fontSize: 18, fontWeight: "bold" },
});                styles.periodBtn,
                statPeriod === "GLOBAL" && styles.periodActive,
              ]}
            >
              <Text style={statPeriod === "GLOBAL" && { color: "#fff" }}>
                Historique
              </Text>
            </TouchableOpacity>
          </View>
          <StatSection
            title="TOP 1 LIGNE"
            data={getFilteredStats("Une ligne", "NORMAL")}
            color="#1B4D6E"
          />
          <StatSection
            title="TOP 2 LIGNES"
            data={getFilteredStats("Deux lignes", "NORMAL")}
            color="#E94E31"
          />
          <StatSection
            title="TOP CARTON PLEIN"
            data={getFilteredStats("Carton plein", "NORMAL")}
            color="#6A4C93"
          />
          <View style={styles.statSeparator} />
          <StatSection
            title="TOP BINGO"
            data={getFilteredStats("", "BINGO")}
            color="#DAA520"
          />
          <StatSection
            title="TOP SUPER"
            data={getFilteredStats("", "SUPER")}
            color="#2E8B57"
          />
        </ScrollView>
      )}

      {/* --- MODALES AVEC BOUTONS FERMER --- */}

      {/* Choix Partie */}
      <Modal visible={modalPartieVisible} transparent animationType="fade">
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setModalPartieVisible(false)}
        >
          <View
            style={styles.modalContentLarge}
            onStartShouldSetResponder={() => true}
          >
            <Text style={styles.titleLarge}>Choisir la Partie</Text>
            <ScrollView contentContainerStyle={styles.gridParties}>
              {Array.from({ length: 21 }, (_, i) => (i + 1).toString()).map(
                (p) => (
                  <TouchableOpacity
                    key={p}
                    style={[
                      styles.partSquare,
                      selectedTypePartie === p && {
                        backgroundColor: "#E94E31",
                      },
                    ]}
                    onPress={() => {
                      setSelectedTypePartie(p);
                      setModalPartieVisible(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.partText,
                        selectedTypePartie === p && { color: "#fff" },
                      ]}
                    >
                      {p}
                    </Text>
                  </TouchableOpacity>
                ),
              )}
              {["Spéciale", "Bingo", "Super"].map((p) => (
                <TouchableOpacity
                  key={p}
                  style={[
                    styles.btnSpecial,
                    selectedTypePartie === p && { backgroundColor: "#E94E31" },
                  ]}
                  onPress={() => {
                    setSelectedTypePartie(p);
                    setModalPartieVisible(false);
                  }}
                >
                  <Text
                    style={[
                      styles.btnSpecialText,
                      selectedTypePartie === p && { color: "#fff" },
                    ]}
                  >
                    {p}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              onPress={() => setModalPartieVisible(false)}
              style={styles.cancelLink}
            >
              <Text style={styles.cancelLinkText}>Fermer sans changer</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Ajout Organisateur */}
      <Modal visible={modalAddOrgVisible} transparent animationType="fade">
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setModalAddOrgVisible(false)}
        >
          <View
            style={styles.modalContent}
            onStartShouldSetResponder={() => true}
          >
            <Text style={styles.modalTitle}>Nouvel organisateur</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Karine"
              value={newOrgName}
              onChangeText={setNewOrgName}
              autoFocus
            />
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={() => {
                if (!newOrgName) return;
                const id = Date.now().toString();
                setOrganisateurs([
                  ...organisateurs,
                  { id, nom: newOrgName, history: [] },
                ]);
                setSelectedOrgId(id);
                setNewOrgName("");
                setModalAddOrgVisible(false);
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "bold" }}>CRÉER</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setModalAddOrgVisible(false)}
              style={styles.cancelLink}
            >
              <Text style={styles.cancelLinkText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Sélection Organisateur */}
      <Modal visible={modalSelectOrgVisible} transparent animationType="fade">
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setModalSelectOrgVisible(false)}
        >
          <View
            style={styles.modalContent}
            onStartShouldSetResponder={() => true}
          >
            <Text style={styles.modalTitle}>Changer d'organisateur</Text>
            <FlatList
              data={organisateurs}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.orgItem}
                  onPress={() => {
                    setSelectedOrgId(item.id);
                    setModalSelectOrgVisible(false);
                  }}
                >
                  <Text style={{ fontSize: 16 }}>{item.nom}</Text>
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item.id}
            />
            <TouchableOpacity
              onPress={() => setModalSelectOrgVisible(false)}
              style={styles.cancelLink}
            >
              <Text style={styles.cancelLinkText}>Fermer</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Menu Options (Suppression) */}
      <Modal visible={menuVisible} transparent animationType="fade">
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setMenuVisible(false)}
        >
          <View
            style={styles.modalContent}
            onStartShouldSetResponder={() => true}
          >
            <TouchableOpacity
              style={styles.modalItem}
              onPress={supprimerOrganisateur}
            >
              <Text style={{ color: "red", fontWeight: "bold" }}>
                Supprimer cet organisateur
              </Text>
            </TouchableOpacity>
            <View
              style={{ height: 1, backgroundColor: "#eee", marginVertical: 10 }}
            />
            <TouchableOpacity
              style={styles.modalItem}
              onPress={() => setMenuVisible(false)}
            >
              <Text>Annuler</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const StatSection = ({ title, data, color }: any) => (
  <View style={{ marginBottom: 25 }}>
    <Text style={{ fontWeight: "bold", color, fontSize: 12, marginBottom: 10 }}>
      {title}
    </Text>
    <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
      {data.map((it: any) => (
        <View
          key={it.num}
          style={{ alignItems: "center", marginRight: 12, marginBottom: 10 }}
        >
          <View
            style={{
              width: 34,
              height: 34,
              borderRadius: 17,
              backgroundColor: color,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 13 }}>
              {it.num}
            </Text>
          </View>
          <Text style={{ fontSize: 10, color: "#666", marginTop: 2 }}>
            x{it.count}
          </Text>
        </View>
      ))}
      {data.length === 0 && (
        <Text style={{ fontSize: 11, color: "#bbb" }}>Aucune donnée</Text>
      )}
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EDF2F7",
    paddingHorizontal: 16,
    paddingTop: 60,
  },
  topNav: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 4,
    flex: 1,
    marginRight: 10,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 10,
  },
  tabActive: { backgroundColor: "#1B4D6E" },
  tabText: { color: "#888", fontWeight: "bold", fontSize: 12 },
  tabTextActive: { color: "#fff" },
  iconBtn: {
    backgroundColor: "#fff",
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },

  headerSelectionRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 25,
  },
  labelHeader: {
    fontSize: 10,
    color: "#666",
    fontWeight: "bold",
    marginBottom: 5,
    marginLeft: 2,
  },
  whiteBox: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    height: 48,
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#D1D9E0",
  },
  boldText: { fontWeight: "bold", fontSize: 14, color: "#333" },
  flexOne: { flex: 1 },
  partieBadge: {
    backgroundColor: "#E94E31",
    borderRadius: 10,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
  },
  partieBadgeText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  plusBtn: {
    backgroundColor: "#1B4D6E",
    width: 48,
    height: 48,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 12,
  },

  mainNumpadCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  numHistoryBar: {
    flexDirection: "row",
    height: 55,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  historyScrollArea: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 5,
  },
  historySlot: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 5,
  },
  lastNumSlot: {
    width: 55,
    height: 55,
    justifyContent: "center",
    alignItems: "center",
  },
  bgBlue: { backgroundColor: "#1B6E85" },
  bgBrown: { backgroundColor: "#A5522E" },
  bgEmpty: { backgroundColor: "transparent" },
  counterSection: {
    width: 50,
    backgroundColor: "#F8F9FA",
    alignItems: "center",
    justifyContent: "center",
    borderLeftWidth: 1,
    borderLeftColor: "#eee",
  },
  historyText: { color: "#fff", fontSize: 20, fontWeight: "bold" },
  counterText: { fontSize: 20, color: "#1B4D6E", fontWeight: "bold" },

  modeGrid: {
    flexDirection: "row",
    height: 75,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modeItem: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRightWidth: 1,
    borderRightColor: "#eee",
  },
  modeItemActive: { backgroundColor: "#E8F1F3" },
  modeItemText: {
    textAlign: "center",
    fontSize: 14,
    color: "#555",
    paddingHorizontal: 5,
  },
  modeItemTextActive: { color: "#1B6E85", fontWeight: "bold" },

  actionRow: {
    flexDirection: "row",
    height: 55,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderRightWidth: 1,
    borderRightColor: "#eee",
  },
  actionBtnText: { fontSize: 15, color: "#333" },

  numpadGrid: { flexDirection: "row", height: 160 },
  numbersPart: { flex: 1 },
  keyRow: {
    flexDirection: "row",
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  key: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRightWidth: 1,
    borderRightColor: "#eee",
  },
  keyText: { fontSize: 28, color: "#333", fontWeight: "500" },
  checkBtn: {
    width: 70,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F0F4F7",
  },
  checkIcon: { fontSize: 40, color: "#CCC" },

  currentSaisieContainer: {
    height: 50,
    justifyContent: "center",
    marginTop: 10,
  },
  currentSaisieText: {
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
    color: "#1B6E85",
  },

  statsContainer: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
  },
  statSeparator: { height: 1, backgroundColor: "#eee", marginVertical: 20 },
  titleLarge: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#1B4D6E",
  },
  periodRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
  },
  periodBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "#eee",
    marginHorizontal: 8,
  },
  periodActive: { backgroundColor: "#1B4D6E" },

  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    width: "85%",
    padding: 25,
    borderRadius: 15,
  },
  modalContentLarge: {
    backgroundColor: "#fff",
    width: "90%",
    maxHeight: "85%",
    padding: 20,
    borderRadius: 15,
  },
  modalTitle: {
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 15,
    color: "#333",
  },
  gridParties: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  partSquare: {
    width: "18%",
    aspectRatio: 1,
    backgroundColor: "#F0F4F8",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    borderRadius: 8,
  },
  partText: { fontWeight: "bold", fontSize: 16 },
  btnSpecial: {
    width: "31%",
    padding: 12,
    backgroundColor: "#F0F4F8",
    alignItems: "center",
    marginBottom: 12,
    borderRadius: 8,
  },
  btnSpecialText: { fontSize: 12, fontWeight: "bold" },
  input: {
    borderBottomWidth: 2,
    borderColor: "#1B4D6E",
    marginBottom: 25,
    fontSize: 18,
    padding: 8,
  },
  primaryBtn: {
    backgroundColor: "#1B4D6E",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  cancelLink: { marginTop: 20, alignSelf: "center", padding: 10 },
  cancelLinkText: {
    color: "#666",
    fontSize: 14,
    textDecorationLine: "underline",
  },
  orgItem: { padding: 18, borderBottomWidth: 1, borderBottomColor: "#eee" },
  modalItem: { padding: 15, alignItems: "center" },
});
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

// --- TYPES ---
interface NumeroSaisi {
  val: number;
  date: string;
}

const { width } = Dimensions.get("window");

export default function LotoApp() {
  // --- ÉTATS (STATES) ---
  const [historique, setHistorique] = useState<NumeroSaisi[]>([]);
  const [derniereBoule, setDerniereBoule] = useState<string>("");
  const [saisieEnCours, setSaisieEnCours] = useState<string>("");

  // --- FONCTIONS ---

  // Ajouter un chiffre (clavier numérique)
  const taperChiffre = (chiffre: string) => {
    if (saisieEnCours.length < 2) {
      setSaisieEnCours((prev) => prev + chiffre);
    }
  };

  // Valider le numéro saisi
  const validerNumero = () => {
    const num = parseInt(saisieEnCours);
    if (isNaN(num) || num < 1 || num > 90) {
      alert("Numéro invalide (doit être entre 1 et 90)");
      setSaisieEnCours("");
      return;
    }

    const nouveau : NumeroSaisi = {
      val: num,
      date: new Date().toLocaleTimeString(),
    };

    setHistorique([nouveau, ...historique]);
    setDerniereBoule(num.toString());
    setSaisieEnCours("");
  };

  // EFFACER / DÉMARQUER (La fonction qui buggait)
  const handleDemarquer = () => {
    // Utilisation de confirm pour le web/mobile
    const confirmer = window.confirm("Voulez-vous vraiment vider l'historique ?");
    if (confirmer) {
      setHistorique([]);
      setDerniereBoule("");
      setSaisieEnCours("");
    }
  };

  // Supprimer un seul chiffre (touche retour)
  const effacerDernierChiffre = () => {
    setSaisieEnCours((prev) => prev.slice(0, -1));
  };

  // --- RENDU ---
  return (
    <SafeAreaView style={styles.container}>
      {/* ZONE DU HAUT : HISTORIQUE ET COMPTEUR */}
      <View style={styles.header}>
        <View style={styles.statsBox}>
          <Text style={styles.label}>BOULES</Text>
          <Text style={styles.valeur}>{historique.length}</Text>
        </View>
        <ScrollView style={styles.scrollHistorique} horizontal={true}>
          {historique.map((item, index) => (
            <View key={index} style={styles.bouleHisto}>
              <Text style={styles.texteBouleHisto}>{item.val}</Text>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* ZONE CENTRALE : DERNIER NUMÉRO */}
      <View style={styles.mainDisplay}>
        <View style={styles.cercleDernier}>
          <Text style={styles.numeroDernier}>{derniereBoule || "--"}</Text>
        </View>
        <View style={styles.saisieBox}>
          <Text style={styles.texteSaisie}>Saisie : {saisieEnCours}</Text>
        </View>
      </View>

      {/* CLAVIER NUMÉRIQUE */}
      <View style={styles.clavier}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <TouchableOpacity 
            key={num} 
            style={styles.touche} 
            onPress={() => taperChiffre(num.toString())}
          >
            <Text style={styles.texteTouche}>{num}</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity style={styles.toucheEffacer} onPress={effacerDernierChiffre}>
          <Text style={styles.texteTouche}>⌫</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.touche} onPress={() => taperChiffre("0")}>
          <Text style={styles.texteTouche}>0</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.toucheValider} onPress={validerNumero}>
          <Text style={styles.texteTouche}>OK</Text>
        </TouchableOpacity>
      </View>

      {/* BOUTON DÉMARQUER */}
      <TouchableOpacity style={styles.boutonDemarquer} onPress={handleDemarquer}>
        <Text style={styles.texteBouton}>DÉMARQUER</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

// --- STYLES ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#2C3E50", // Bleu foncé/gris
  },
  header: {
    flexDirection: "row",
    padding: 15,
    backgroundColor: "#1A252F",
    alignItems: "center",
  },
  statsBox: {
    backgroundColor: "#D35400", // Marron/Orange
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    marginRight: 10,
  },
  label: { color: "white", fontSize: 10, fontWeight: "bold" },
  valeur: { color: "white", fontSize: 20, fontWeight: "bold" },
  scrollHistorique: { flex: 1 },
  bouleHisto: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#34495E",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: "#BDC3C7",
  },
  texteBouleHisto: { color: "white", fontWeight: "bold" },
  mainDisplay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  cercleDernier: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "#16A085", // Bleu canard
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 5,
    borderColor: "white",
    borderStyle: "dashed",
  },
  numeroDernier: { fontSize: 80, color: "white", fontWeight: "bold" },
  saisieBox: { marginTop: 20 },
  texteSaisie: { color: "white", fontSize: 24, fontWeight: "bold" },
  clavier: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    padding: 10,
    backgroundColor: "#F39C12", // Jaune orangé pour le socle
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  touche: {
    width: width / 4,
    height: 60,
    backgroundColor: "#34495E",
    margin: 5,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
  },
  toucheValider: {
    width: width / 4,
    height: 60,
    backgroundColor: "#27AE60",
    margin: 5,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  toucheEffacer: {
    width: width / 4,
    height: 60,
    backgroundColor: "#C0392B",
    margin: 5,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  texteTouche: { color: "white", fontSize: 25, fontWeight: "bold" },
  boutonDemarquer: {
    backgroundColor: "#C0392B",
    padding: 15,
    alignItems: "center",
  },
  texteBouton: { color: "white", fontSize: 20, fontWeight: "bold" },
});
