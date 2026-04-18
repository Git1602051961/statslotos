import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, FlatList, Alert, TextInput, ScrollView } from 'react-native';

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

export default function LotoApp() {
  const [view, setView] = useState<'SAISIE' | 'STATS'>('SAISIE');
  const [menuVisible, setMenuVisible] = useState(false);
  const [modalPartieVisible, setModalPartieVisible] = useState(false);
  const [modalAddOrgVisible, setModalAddOrgVisible] = useState(false);
  const [modalSelectOrgVisible, setModalSelectOrgVisible] = useState(false);
  
  const [newOrgName, setNewOrgName] = useState('');
  const [organisateurs, setOrganisateurs] = useState<Organisateur[]>([
    { id: '1', nom: 'Karine', history: [] }
  ]);
  const [selectedOrgId, setSelectedOrgId] = useState('1');
  const [selectedTypePartie, setSelectedTypePartie] = useState('1');
  const [currentInput, setCurrentInput] = useState('');
  const [mode, setMode] = useState('Une ligne');
  const [statPeriod, setStatPeriod] = useState<'JOUR' | 'GLOBAL'>('GLOBAL');

  const currentOrg = organisateurs.find(o => o.id === selectedOrgId) || organisateurs[0];
  const today = new Date().toLocaleDateString();

  // --- ACTIONS ---
  const handlePressNumber = (val: string) => {
    let nextInput = currentInput + val;
    if (nextInput.length > 2) return;
    if (nextInput.length === 2) {
      const num = parseInt(nextInput);
      if (num >= 1 && num <= 90) validerNumero(num);
      else { 
        Alert.alert("Erreur", "Le numéro doit être entre 1 et 90"); 
        setCurrentInput(''); 
      }
    } else { 
      setCurrentInput(nextInput); 
    }
  };

  const validerNumero = (num: number) => {
    setOrganisateurs(prev => prev.map(org => {
      if (org.id === selectedOrgId) {
        const nouveau: NumeroSaisi = { val: num, mode, typePartie: selectedTypePartie, date: today };
        return { ...org, history: [nouveau, ...org.history] };
      }
      return org;
    }));
    setCurrentInput('');
  };

  const handleAnnuler = () => {
    if (currentInput.length > 0) { 
      setCurrentInput(''); 
    } else {
      setOrganisateurs(prev => prev.map(org => {
        if (org.id === selectedOrgId && org.history.length > 0) {
          const newHistory = [...org.history];
          newHistory.shift();
          return { ...org, history: newHistory };
        }
        return org;
      }));
    }
  };

  const viderHistorique = () => {
    Alert.alert("Démarquer", "Voulez-vous vider l'historique ?", [
      { text: "Non" },
      { text: "Oui", onPress: () => setOrganisateurs(prev => prev.map(o => o.id === selectedOrgId ? {...o, history:[]} : o)) }
    ]);
  };

  const supprimerOrganisateur = () => {
    if (organisateurs.length <= 1) return;
    const nouveaux = organisateurs.filter(o => o.id !== selectedOrgId);
    setOrganisateurs(nouveaux);
    setSelectedOrgId(nouveaux[0].id);
    setMenuVisible(false);
  };

  // --- LOGIQUE STATS ---
  const getFilteredStats = (filterMode: string, specialType: 'NORMAL' | 'BINGO' | 'SUPER' = 'NORMAL') => {
    const counts: { [key: number]: number } = {};
    currentOrg.history.forEach(item => {
      let match = false;
      if (specialType === 'NORMAL') match = item.mode === filterMode && item.typePartie !== "Bingo" && item.typePartie !== "Super";
      else if (specialType === 'BINGO') match = item.typePartie === "Bingo";
      else if (specialType === 'SUPER') match = item.typePartie === "Super";

      if (match) {
        if (statPeriod === 'GLOBAL' || item.date === today) {
          counts[item.val] = (counts[item.val] || 0) + 1;
        }
      }
    });
    return Object.entries(counts).map(([num, count]) => ({ num: parseInt(num), count }))
      .sort((a, b) => b.count - a.count).slice(0, 10);
  };

  return (
    <View style={styles.container}>
      {/* NAVIGATION TABS */}
      <View style={styles.topNav}>
        <View style={styles.tabContainer}>
          <TouchableOpacity onPress={() => setView('SAISIE')} style={[styles.tabBtn, view === 'SAISIE' && styles.tabActive]}><Text style={[styles.tabText, view === 'SAISIE' && styles.tabTextActive]}>SAISIE</Text></TouchableOpacity>
          <TouchableOpacity onPress={() => setView('STATS')} style={[styles.tabBtn, view === 'STATS' && styles.tabActive]}><Text style={[styles.tabText, view === 'STATS' && styles.tabTextActive]}>STATS</Text></TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.iconBtn} onPress={() => setMenuVisible(true)}><Text style={{fontSize: 22}}>≡</Text></TouchableOpacity>
      </View>

      {view === 'SAISIE' ? (
        <View style={{flex: 1}}>
          {/* SÉLECTIONS DU HAUT - PLUS ESPACÉES */}
          <View style={styles.headerSelectionRow}>
            <TouchableOpacity style={styles.flexOne} onPress={() => setModalSelectOrgVisible(true)}>
              <Text style={styles.labelHeader}>ORGANISATEUR</Text>
              <View style={styles.whiteBox}><Text style={styles.boldText} numberOfLines={1}>{currentOrg.nom} ▾</Text></View>
            </TouchableOpacity>
            
            <View style={{width: 12}} /> 

            <TouchableOpacity style={styles.flexOne} onPress={() => setModalPartieVisible(true)}>
              <Text style={styles.labelHeader}>PARTIE</Text>
              <View style={styles.partieBadge}><Text style={styles.partieBadgeText}>{selectedTypePartie} ▾</Text></View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.plusBtn} onPress={() => setModalAddOrgVisible(true)}><Text style={{color: '#fff', fontSize: 24}}>+</Text></TouchableOpacity>
          </View>

          {/* PAVÉ NUMÉRIQUE - DESIGN AÉRÉ */}
          <View style={styles.mainNumpadCard}>
            {/* 1. BARRE HISTORIQUE */}
            <View style={styles.numHistoryBar}>
              <View style={styles.historyScrollArea}>
                {[6, 5, 4, 3, 2, 1].map((offset) => {
                  const val = currentOrg.history[offset]?.val;
                  return (
                    <View key={offset} style={[styles.historySlot, val ? styles.bgBlue : styles.bgEmpty]}>
                      <Text style={styles.historyText}>{val || ''}</Text>
                    </View>
                  );
                })}
              </View>
              <View style={[styles.lastNumSlot, currentOrg.history[0] ? styles.bgBrown : styles.bgEmpty]}>
                <Text style={styles.historyText}>{currentOrg.history[0]?.val || ''}</Text>
              </View>
              <View style={styles.counterSection}>
                <Text style={styles.counterText}>{currentOrg.history.filter(h => h.date === today).length}</Text>
              </View>
            </View>

            {/* 2. MODES DE JEU (Hauteur augmentée) */}
            <View style={styles.modeGrid}>
              {['Une ligne', 'Deux lignes', 'Carton plein'].map(m => (
                <TouchableOpacity key={m} onPress={() => setMode(m)} style={[styles.modeItem, mode === m && styles.modeItemActive]}>
                  <Text style={[styles.modeItemText, mode === m && styles.modeItemTextActive]}>{m.toLowerCase()}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* 3. ACTIONS (Plus de marge interne) */}
            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.actionBtn} onPress={viderHistorique}>
                <Text style={styles.actionBtnText}>🧹 Démarquer</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn} onPress={handleAnnuler}>
                <Text style={styles.actionBtnText}>⌫ Annuler</Text>
              </TouchableOpacity>
            </View>

            {/* 4. GRILLE CHIFFRES (Plus haute) */}
            <View style={styles.numpadGrid}>
              <View style={styles.numbersPart}>
                <View style={styles.keyRow}>
                  {[1, 2, 3, 4, 5].map(n => (
                    <TouchableOpacity key={n} style={styles.key} onPress={() => handlePressNumber(n.toString())}><Text style={styles.keyText}>{n}</Text></TouchableOpacity>
                  ))}
                </View>
                <View style={styles.keyRow}>
                  {[6, 7, 8, 9, 0].map(n => (
                    <TouchableOpacity key={n} style={styles.key} onPress={() => handlePressNumber(n.toString())}><Text style={styles.keyText}>{n}</Text></TouchableOpacity>
                  ))}
                </View>
              </View>
              <TouchableOpacity style={styles.checkBtn} onPress={() => { if(currentInput.length === 1) validerNumero(parseInt(currentInput)) }}>
                <Text style={[styles.checkIcon, currentInput.length === 1 && {color: '#1B6E85'}]}>✓</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Saisie en cours plus visible */}
          <View style={styles.currentSaisieContainer}>
            {currentInput.length > 0 && <Text style={styles.currentSaisieText}>Entrée : {currentInput}</Text>}
          </View>
        </View>
      ) : (
        <ScrollView style={styles.statsContainer}>
          <Text style={styles.titleLarge}>Fréquence des numéros</Text>
          <View style={styles.periodRow}>
            <TouchableOpacity onPress={() => setStatPeriod('JOUR')} style={[styles.periodBtn, statPeriod === 'JOUR' && styles.periodActive]}><Text style={statPeriod === 'JOUR' && {color:'#fff'}}>Aujourd'hui</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => setStatPeriod('GLOBAL')} style={[styles.periodBtn, statPeriod === 'GLOBAL' && styles.periodActive]}><Text style={statPeriod === 'GLOBAL' && {color:'#fff'}}>Historique</Text></TouchableOpacity>
          </View>
          <StatSection title="TOP 1 LIGNE" data={getFilteredStats('Une ligne', 'NORMAL')} color="#1B4D6E" />
          <StatSection title="TOP 2 LIGNES" data={getFilteredStats('Deux lignes', 'NORMAL')} color="#E94E31" />
          <StatSection title="TOP CARTON PLEIN" data={getFilteredStats('Carton plein', 'NORMAL')} color="#6A4C93" />
          <View style={styles.statSeparator} />
          <StatSection title="TOP BINGO" data={getFilteredStats('', 'BINGO')} color="#DAA520" />
          <StatSection title="TOP SUPER" data={getFilteredStats('', 'SUPER')} color="#2E8B57" />
        </ScrollView>
      )}

      {/* --- MODALES --- */}
      <Modal visible={modalPartieVisible} transparent>
        <View style={styles.overlay}><View style={styles.modalContentLarge}>
          <Text style={styles.titleLarge}>Choisir la Partie</Text>
          <ScrollView contentContainerStyle={styles.gridParties}>
            {Array.from({length:21}, (_,i)=>(i+1).toString()).map(p => (
              <TouchableOpacity key={p} style={[styles.partSquare, selectedTypePartie === p && {backgroundColor:'#E94E31'}]} onPress={()=>{setSelectedTypePartie(p); setModalPartieVisible(false);}}><Text style={[styles.partText, selectedTypePartie === p && {color:'#fff'}]}>{p}</Text></TouchableOpacity>
            ))}
            {["Spéciale", "Bingo", "Super"].map(p => (
              <TouchableOpacity key={p} style={[styles.btnSpecial, selectedTypePartie === p && {backgroundColor:'#E94E31'}]} onPress={()=>{setSelectedTypePartie(p); setModalPartieVisible(false);}}><Text style={[styles.btnSpecialText, selectedTypePartie === p && {color:'#fff'}]}>{p}</Text></TouchableOpacity>
            ))}
          </ScrollView>
        </View></View>
      </Modal>

      <Modal visible={modalAddOrgVisible} transparent><View style={styles.overlay}><View style={styles.modalContent}>
        <TextInput style={styles.input} placeholder="Nom de l'organisateur" value={newOrgName} onChangeText={setNewOrgName} autoFocus />
        <TouchableOpacity style={styles.primaryBtn} onPress={()=>{if(!newOrgName) return; const id=Date.now().toString(); setOrganisateurs([...organisateurs,{id,nom:newOrgName,history:[]}]); setSelectedOrgId(id); setNewOrgName(''); setModalAddOrgVisible(false);}}><Text style={{color:'#fff', fontWeight: 'bold'}}>CRÉER</Text></TouchableOpacity>
      </View></View></Modal>

      <Modal visible={modalSelectOrgVisible} transparent><View style={styles.overlay}><View style={styles.modalContent}>
        <FlatList data={organisateurs} renderItem={({item})=>(<TouchableOpacity style={styles.orgItem} onPress={()=>{setSelectedOrgId(item.id); setModalSelectOrgVisible(false);}}><Text style={{fontSize: 16}}>{item.nom}</Text></TouchableOpacity>)} />
      </View></View></Modal>
      
      <Modal visible={menuVisible} transparent>
        <TouchableOpacity style={styles.overlay} onPress={() => setMenuVisible(false)}>
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.modalItem} onPress={supprimerOrganisateur}><Text style={{color: 'red', fontWeight: 'bold'}}>Supprimer cet organisateur</Text></TouchableOpacity>
            <TouchableOpacity style={styles.modalItem} onPress={() => setMenuVisible(false)}><Text>Fermer</Text></TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const StatSection = ({ title, data, color }: any) => (
  <View style={{marginBottom: 25}}>
    <Text style={{fontWeight:'bold', color, fontSize: 12, marginBottom: 10}}>{title}</Text>
    <View style={{flexDirection:'row', flexWrap:'wrap'}}>
      {data.map((it:any) => (
        <View key={it.num} style={{alignItems:'center', marginRight:12, marginBottom:10}}>
          <View style={{width:34, height:34, borderRadius:17, backgroundColor:color, justifyContent:'center', alignItems:'center'}}><Text style={{color:'#fff', fontWeight:'bold', fontSize:13}}>{it.num}</Text></View>
          <Text style={{fontSize:10, color:'#666', marginTop: 2}}>x{it.count}</Text>
        </View>
      ))}
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EDF2F7', paddingHorizontal: 16, paddingTop: 60 },
  topNav: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  tabContainer: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 12, padding: 4, flex: 1, marginRight: 10 },
  tabBtn: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 10 },
  tabActive: { backgroundColor: '#1B4D6E' },
  tabText: { color: '#888', fontWeight: 'bold', fontSize: 12 },
  tabTextActive: { color: '#fff' },
  iconBtn: { backgroundColor: '#fff', width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  
  headerSelectionRow: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 25 },
  labelHeader: { fontSize: 10, color: '#666', fontWeight: 'bold', marginBottom: 5, marginLeft: 2 },
  whiteBox: { backgroundColor: '#fff', borderRadius: 10, padding: 10, height: 48, justifyContent: 'center', borderWidth: 1, borderColor: '#D1D9E0' },
  boldText: { fontWeight: 'bold', fontSize: 14, color: '#333' },
  flexOne: { flex: 1 },
  partieBadge: { backgroundColor: '#E94E31', borderRadius: 10, height: 48, justifyContent: 'center', alignItems: 'center' },
  partieBadgeText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  plusBtn: { backgroundColor: '#1B4D6E', width: 48, height: 48, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginLeft: 12 },

  // PAVÉ NUMÉRIQUE AÉRÉ
  mainNumpadCard: { 
    backgroundColor: '#fff', 
    borderRadius: 8, 
    borderWidth: 1, 
    borderColor: '#ccc', 
    overflow: 'hidden',
    elevation: 3, 
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4
  },
  
  numHistoryBar: { flexDirection: 'row', height: 55, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  historyScrollArea: { flex: 1, flexDirection: 'row', alignItems: 'center', paddingLeft: 5 },
  historySlot: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 5 },
  lastNumSlot: { width: 55, height: 55, justifyContent: 'center', alignItems: 'center' },
  bgBlue: { backgroundColor: '#1B6E85' },
  bgBrown: { backgroundColor: '#A5522E' },
  bgEmpty: { backgroundColor: 'transparent' },
  counterSection: { width: 50, backgroundColor: '#F8F9FA', alignItems: 'center', justifyContent: 'center', borderLeftWidth: 1, borderLeftColor: '#eee' },
  historyText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  counterText: { fontSize: 20, color: '#1B4D6E', fontWeight: 'bold' },

  modeGrid: { flexDirection: 'row', height: 75, borderBottomWidth: 1, borderBottomColor: '#eee' },
  modeItem: { flex: 1, justifyContent: 'center', alignItems: 'center', borderRightWidth: 1, borderRightColor: '#eee' },
  modeItemActive: { backgroundColor: '#E8F1F3' },
  modeItemText: { textAlign: 'center', fontSize: 14, color: '#555', paddingHorizontal: 5 },
  modeItemTextActive: { color: '#1B6E85', fontWeight: 'bold' },

  actionRow: { flexDirection: 'row', height: 55, borderBottomWidth: 1, borderBottomColor: '#eee' },
  actionBtn: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', borderRightWidth: 1, borderRightColor: '#eee' },
  actionBtnText: { fontSize: 15, color: '#333' },

  numpadGrid: { flexDirection: 'row', height: 160 }, // Hauteur augmentée
  numbersPart: { flex: 1 },
  keyRow: { flexDirection: 'row', flex: 1, borderBottomWidth: 1, borderBottomColor: '#eee' },
  key: { flex: 1, justifyContent: 'center', alignItems: 'center', borderRightWidth: 1, borderRightColor: '#eee' },
  keyText: { fontSize: 28, color: '#333', fontWeight: '500' },
  checkBtn: { width: 70, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F0F4F7' },
  checkIcon: { fontSize: 40, color: '#CCC' },

  currentSaisieContainer: { height: 50, justifyContent: 'center', marginTop: 10 },
  currentSaisieText: { textAlign: 'center', fontSize: 18, fontWeight: 'bold', color: '#1B6E85' },

  // STATS ET MODALES
  statsContainer: { flex: 1, backgroundColor: '#fff', borderRadius: 15, padding: 20 },
  statSeparator: { height: 1, backgroundColor: '#eee', marginVertical: 20 },
  titleLarge: { fontSize: 18, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', color: '#1B4D6E' },
  periodRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 20 },
  periodBtn: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, backgroundColor: '#eee', marginHorizontal: 8 },
  periodActive: { backgroundColor: '#1B4D6E' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#fff', width: '85%', padding: 25, borderRadius: 15 },
  modalContentLarge: { backgroundColor: '#fff', width: '90%', maxHeight: '85%', padding: 20, borderRadius: 15 },
  gridParties: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  partSquare: { width: '18%', aspectRatio: 1, backgroundColor: '#F0F4F8', justifyContent: 'center', alignItems: 'center', marginBottom: 12, borderRadius: 8 },
  partText: { fontWeight: 'bold', fontSize: 16 },
  btnSpecial: { width: '31%', padding: 12, backgroundColor: '#F0F4F8', alignItems: 'center', marginBottom: 12, borderRadius: 8 },
  btnSpecialText: { fontSize: 12, fontWeight: 'bold' },
  input: { borderBottomWidth: 2, borderColor: '#1B4D6E', marginBottom: 25, fontSize: 18, padding: 8 },
  primaryBtn: { backgroundColor: '#1B4D6E', padding: 15, borderRadius: 10, alignItems: 'center' },
  orgItem: { padding: 18, borderBottomWidth: 1, borderBottomColor: '#eee' },
  modalItem: { padding: 15, alignItems: 'center' }
});
