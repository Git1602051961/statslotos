import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, FlatList, TextInput, ScrollView } from 'react-native';

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
  
  const [organisateurs, setOrganisateurs] = useState<Organisateur[]>([{ id: '1', nom: 'Karine', history: [] }]);
  const [selectedOrgId, setSelectedOrgId] = useState('1');
  const [selectedTypePartie, setSelectedTypePartie] = useState('1');
  const [currentInput, setCurrentInput] = useState('');
  const [mode, setMode] = useState('Une ligne');
  const [statPeriod, setStatPeriod] = useState<'JOUR' | 'GLOBAL'>('GLOBAL');

  const currentOrg = organisateurs.find(o => o.id === selectedOrgId) || organisateurs[0];
  const today = new Date().toLocaleDateString();

  // --- ACTIONS SAISIE ---
  const handlePressNumber = (val: string) => {
    let nextInput = currentInput + val;
    if (nextInput.length > 2) return;
    if (nextInput.length === 2) {
      const num = parseInt(nextInput);
      if (num >= 1 && num <= 90) validerNumero(num);
      else setCurrentInput('');
    } else { setCurrentInput(nextInput); }
  };

  const validerNumero = (num: number) => {
    setOrganisateurs(prev => prev.map(org => {
      if (org.id === selectedOrgId) {
        return { ...org, history: [{ val: num, mode, typePartie: selectedTypePartie, date: today }, ...org.history] };
      }
      return org;
    }));
    setCurrentInput('');
  };

  // --- LOGIQUE CARTON RÉEL (DISPOSITION PAR DIZAINES) ---
  const getStatsForCartons = () => {
    const counts: { [key: number]: number } = {};
    currentOrg.history.forEach(item => {
      if (statPeriod === 'GLOBAL' || item.date === today) {
        counts[item.val] = (counts[item.val] || 0) + 1;
      }
    });
    return Object.entries(counts)
      .map(([num, count]) => ({ num: parseInt(num), count }))
      .sort((a, b) => b.count - a.count)
      .map(item => item.num);
  };

  const generateRealDisposition = (numbers: number[]) => {
    // Un carton de loto : 3 lignes, 9 colonnes. 5 numéros par ligne.
    let grid = Array(27).fill(null);
    let sortedNums = [...numbers].slice(0, 15).sort((a, b) => a - b);
    
    sortedNums.forEach(num => {
      let col = Math.floor(num / 10);
      if (num === 90) col = 8; // Le 90 va en dernière colonne
      
      // Trouver une ligne libre dans la bonne colonne (max 3 numéros par colonne en vrai, ici on simplifie)
      for (let row = 0; row < 3; row++) {
        let pos = row * 9 + col;
        if (grid[pos] === null) {
          grid[pos] = num;
          break;
        }
      }
    });
    return grid;
  };

  const renderIdealCarton = (index: number, color: string) => {
    const allStats = getStatsForCartons();
    // On décale les numéros pour que les 6 cartons soient différents
    const offset = index * 5;
    const cartonData = generateRealDisposition(allStats.slice(offset));

    return (
      <View key={index} style={[styles.cartonContainer, { borderColor: color }]}>
        <View style={[styles.cartonHeader, {backgroundColor: color}]}>
           <Text style={styles.cartonTitle}>CARTON IDÉAL #{index + 1}</Text>
        </View>
        <View style={styles.cartonGrid}>
          {cartonData.map((num, i) => (
            <View key={i} style={[styles.cartonCell, num && { backgroundColor: color + '20' }]}>
              <Text style={[styles.cartonCellText, num && { color: color }]}>{num || ''}</Text>
            </View>
          ))}
        </View>
      </View>
    );
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
        <ScrollView>
          <View style={styles.headerSelectionRow}>
            <TouchableOpacity style={styles.flexOne} onPress={() => setModalSelectOrgVisible(true)}>
              <Text style={styles.labelHeader}>ORGANISATEUR</Text>
              <View style={styles.whiteBox}><Text style={styles.boldText}>{currentOrg.nom} ▾</Text></View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.plusBtn} onPress={() => setModalAddOrgVisible(true)}><Text style={{color: '#fff', fontSize: 24}}>+</Text></TouchableOpacity>
          </View>
          
          <View style={styles.mainNumpadCard}>
            <View style={styles.numHistoryBar}>
                <View style={[styles.lastNumSlotSquare, currentOrg.history[0] ? styles.bgBrown : styles.bgEmpty]}>
                    <Text style={styles.historyText}>{currentOrg.history[0]?.val || ''}</Text>
                </View>
                <ScrollView horizontal style={{flex:1, paddingLeft:10}}>
                    {currentOrg.history.slice(1).map((item, i) => (
                        <View key={i} style={[styles.historySlotSquare, styles.bgBlue]}><Text style={styles.historyText}>{item.val}</Text></View>
                    ))}
                </ScrollView>
            </View>
            <View style={styles.numpadGrid}>
                {[1,2,3,4,5,6,7,8,9,0].map(n => (
                    <TouchableOpacity key={n} style={styles.key} onPress={() => handlePressNumber(n.toString())}><Text style={styles.keyText}>{n}</Text></TouchableOpacity>
                ))}
            </View>
          </View>
          <Text style={styles.currentSaisieText}>{currentInput || ' '}</Text>
        </ScrollView>
      ) : (
        <ScrollView style={styles.statsScroll}>
          <Text style={styles.titleLarge}>Vos 6 Cartons Statistiques</Text>
          <View style={styles.periodRow}>
            <TouchableOpacity onPress={() => setStatPeriod('JOUR')} style={[styles.periodBtn, statPeriod === 'JOUR' && styles.periodActive]}><Text style={statPeriod === 'JOUR' && {color:'#fff'}}>Aujourd'hui</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => setStatPeriod('GLOBAL')} style={[styles.periodBtn, statPeriod === 'GLOBAL' && styles.periodActive]}><Text style={statPeriod === 'GLOBAL' && {color:'#fff'}}>Historique</Text></TouchableOpacity>
          </View>

          {['#E94E31', '#1B6E85', '#6A4C93', '#2E7D32', '#F9A825', '#C2185B'].map((color, i) => (
            renderIdealCarton(i, color)
          ))}
          <View style={{height: 40}} />
        </ScrollView>
      )}

      {/* MODALES SIMPLIFIÉES POUR LE CODE */}
      <Modal visible={modalAddOrgVisible} transparent><View style={styles.overlay}><View style={styles.modalContent}>
        <TextInput style={styles.input} placeholder="Nom de l'organisateur" onChangeText={setNewOrgName} />
        <TouchableOpacity style={styles.plusBtn} onPress={() => setModalAddOrgVisible(false)}><Text style={{color:'#fff'}}>Ajouter</Text></TouchableOpacity>
      </View></View></Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F4F8', paddingHorizontal: 15, paddingTop: 40 },
  topNav: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  tabContainer: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 12, padding: 4, flex: 1, marginRight: 10 },
  tabBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  tabActive: { backgroundColor: '#1B4D6E' },
  tabText: { color: '#888', fontWeight: 'bold' },
  tabTextActive: { color: '#fff' },
  iconBtn: { backgroundColor: '#fff', width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  
  // DESIGN DES CARTONS (Disposition réelle)
  statsScroll: { flex: 1 },
  titleLarge: { fontSize: 18, fontWeight: 'bold', color: '#1B4D6E', textAlign: 'center', marginVertical: 10 },
  cartonContainer: { backgroundColor: '#fff', borderRadius: 8, marginBottom: 20, borderWidth: 1, overflow: 'hidden', elevation: 2 },
  cartonHeader: { padding: 5, alignItems: 'center' },
  cartonTitle: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  cartonGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: 5 },
  cartonCell: { width: '11.11%', aspectRatio: 0.9, borderWidth: 0.5, borderColor: '#eee', justifyContent: 'center', alignItems: 'center' },
  cartonCellText: { fontSize: 14, fontWeight: 'bold' },

  // SAISIE
  headerSelectionRow: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 20 },
  flexOne: { flex: 1 },
  labelHeader: { fontSize: 10, color: '#666', fontWeight: 'bold' },
  whiteBox: { backgroundColor: '#fff', borderRadius: 10, padding: 10, marginTop: 5 },
  boldText: { fontWeight: 'bold' },
  plusBtn: { backgroundColor: '#1B4D6E', padding: 12, borderRadius: 10, marginLeft: 10 },
  mainNumpadCard: { backgroundColor: '#fff', borderRadius: 15, overflow: 'hidden' },
  numHistoryBar: { flexDirection: 'row', height: 60, alignItems: 'center' },
  lastNumSlotSquare: { width: 60, height: 60, justifyContent: 'center', alignItems: 'center' },
  historySlotSquare: { width: 40, height: 40, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginRight: 8 },
  bgBlue: { backgroundColor: '#1B6E85' },
  bgBrown: { backgroundColor: '#A5522E' },
  bgEmpty: { backgroundColor: '#F0F4F7' },
  historyText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  numpadGrid: { flexDirection: 'row', flexWrap: 'wrap', borderTopWidth: 1, borderColor: '#eee' },
  key: { width: '20%', aspectRatio: 1, justifyContent: 'center', alignItems: 'center', borderRightWidth: 1, borderBottomWidth: 1, borderColor: '#eee' },
  keyText: { fontSize: 20, fontWeight: 'bold' },
  currentSaisieText: { textAlign: 'center', fontSize: 40, fontWeight: 'bold', color: '#1B4D6E', marginTop: 10 },
  periodRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 15 },
  periodBtn: { padding: 8, px: 15, borderRadius: 15, backgroundColor: '#ddd', marginHorizontal: 5 },
  periodActive: { backgroundColor: '#1B4D6E' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#fff', padding: 20, borderRadius: 10, width: '80%' },
  input: { borderBottomWidth: 1, marginBottom: 15 },
});
