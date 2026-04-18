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
  // --- ÉTATS ---
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
      else setCurrentInput('');
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

  const viderHistorique = () => {
    if (window.confirm("Vider l'historique de cet organisateur ?")) {
      setOrganisateurs(prev => prev.map(o => o.id === selectedOrgId ? { ...o, history: [] } : o));
    }
  };

  const supprimerOrganisateur = () => {
    if (organisateurs.length <= 1) return;
    const nouveaux = organisateurs.filter(o => o.id !== selectedOrgId);
    setOrganisateurs(nouveaux);
    setSelectedOrgId(nouveaux[0].id);
    setMenuVisible(false);
  };

  // --- LOGIQUE CARTONS RÉELS ---
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
    let grid = Array(27).fill(null);
    let sortedNums = [...numbers].slice(0, 15).sort((a, b) => a - b);
    
    sortedNums.forEach(num => {
      let col = Math.floor(num / 10);
      if (num === 90) col = 8;
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
    const offset = index * 3; // Décalage pour varier les 6 cartons
    const cartonData = generateRealDisposition(allStats.slice(offset));

    return (
      <View key={index} style={[styles.cartonContainer, { borderColor: color }]}>
        <View style={[styles.cartonHeader, {backgroundColor: color}]}>
           <Text style={styles.cartonTitle}>CARTON IDÉAL #{index + 1}</Text>
        </View>
        <View style={styles.cartonGrid}>
          {cartonData.map((num, i) => (
            <View key={i} style={[styles.cartonCell, num && { backgroundColor: color + '15' }]}>
              <Text style={[styles.cartonCellText, num && { color: color }]}>{num || ''}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* NAVIGATION */}
      <View style={styles.topNav}>
        <View style={styles.tabContainer}>
          <TouchableOpacity onPress={() => setView('SAISIE')} style={[styles.tabBtn, view === 'SAISIE' && styles.tabActive]}><Text style={[styles.tabText, view === 'SAISIE' && styles.tabTextActive]}>SAISIE</Text></TouchableOpacity>
          <TouchableOpacity onPress={() => setView('STATS')} style={[styles.tabBtn, view === 'STATS' && styles.tabActive]}><Text style={[styles.tabText, view === 'STATS' && styles.tabTextActive]}>STATS</Text></TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.iconBtn} onPress={() => setMenuVisible(true)}><Text style={{fontSize: 22}}>≡</Text></TouchableOpacity>
      </View>

      {view === 'SAISIE' ? (
        <View style={{flex: 1}}>
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
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.historyScrollArea}>
                {currentOrg.history.slice(1).map((item, index) => (
                  <View key={index} style={[styles.historySlotSquare, styles.bgBlue]}><Text style={styles.historyText}>{item.val}</Text></View>
                ))}
              </ScrollView>
              <View style={styles.counterSection}><Text style={styles.counterText}>{currentOrg.history.length}</Text></View>
            </View>

            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.actionBtn} onPress={() => setCurrentInput('')}><Text style={styles.actionBtnText}>⌫ Annuler</Text></TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn} onPress={viderHistorique}><Text style={styles.actionBtnText}>🧹 Démarquer</Text></TouchableOpacity>
            </View>

            <View style={styles.numpadGrid}>
              <View style={styles.numbersPart}>
                <View style={styles.keyRow}>{[1,2,3,4,5].map(n=>(<TouchableOpacity key={n} style={styles.key} onPress={()=>handlePressNumber(n.toString())}><Text style={styles.keyText}>{n}</Text></TouchableOpacity>))}</View>
                <View style={styles.keyRow}>{[6,7,8,9,0].map(n=>(<TouchableOpacity key={n} style={styles.key} onPress={()=>handlePressNumber(n.toString())}><Text style={styles.keyText}>{n}</Text></TouchableOpacity>))}</View>
              </View>
            </View>
          </View>
          <Text style={styles.currentSaisieText}>{currentInput || ' '}</Text>
        </View>
      ) : (
        <ScrollView style={styles.statsScroll}>
          <Text style={styles.titleLarge}>Vos 6 Cartons Idéaux</Text>
          <View style={styles.periodRow}>
            <TouchableOpacity onPress={() => setStatPeriod('JOUR')} style={[styles.periodBtn, statPeriod === 'JOUR' && styles.periodActive]}><Text style={statPeriod === 'JOUR' && {color:'#fff'}}>Aujourd'hui</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => setStatPeriod('GLOBAL')} style={[styles.periodBtn, statPeriod === 'GLOBAL' && styles.periodActive]}><Text style={statPeriod === 'GLOBAL' && {color:'#fff'}}>Historique</Text></TouchableOpacity>
          </View>

          {['#E94E31', '#1B6E85', '#6A4C93', '#2E7D32', '#F9A825', '#C2185B'].map((color, i) => (
            renderIdealCarton(i, color)
          ))}
          <View style={{height: 50}} />
        </ScrollView>
      )}

      {/* MODALES */}
      <Modal visible={menuVisible} transparent>
        <TouchableOpacity style={styles.overlay} onPress={() => setMenuVisible(false)}>
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.modalItem} onPress={supprimerOrganisateur}><Text style={{color: 'red', fontWeight: 'bold'}}>Supprimer l'organisateur</Text></TouchableOpacity>
            <TouchableOpacity style={styles.modalItem} onPress={() => setMenuVisible(false)}><Text>Fermer</Text></TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal visible={modalAddOrgVisible} transparent>
        <View style={styles.overlay}><View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Nouvel Organisateur</Text>
          <TextInput style={styles.input} placeholder="Nom..." value={newOrgName} onChangeText={setNewOrgName} autoFocus />
          <TouchableOpacity style={styles.plusBtn} onPress={()=>{if(!newOrgName) return; const id=Date.now().toString(); setOrganisateurs([...organisateurs,{id,nom:newOrgName,history:[]}]); setSelectedOrgId(id); setNewOrgName(''); setModalAddOrgVisible(false);}}><Text style={{color:'#fff'}}>Ajouter</Text></TouchableOpacity>
        </View></View>
      </Modal>

      <Modal visible={modalSelectOrgVisible} transparent>
        <View style={styles.overlay}><View style={styles.modalContent}>
          <FlatList data={organisateurs} renderItem={({item})=>(<TouchableOpacity style={styles.orgItem} onPress={()=>{setSelectedOrgId(item.id); setModalSelectOrgVisible(false);}}><Text>{item.nom}</Text></TouchableOpacity>)} />
        </View></View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EDF2F7', paddingHorizontal: 16, paddingTop: 40 },
  topNav: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  tabContainer: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 12, padding: 4, flex: 1, marginRight: 10 },
  tabBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  tabActive: { backgroundColor: '#1B4D6E' },
  tabText: { color: '#888', fontWeight: 'bold', fontSize: 12 },
  tabTextActive: { color: '#fff' },
  iconBtn: { backgroundColor: '#fff', width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  headerSelectionRow: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 20 },
  flexOne: { flex: 1 },
  labelHeader: { fontSize: 10, color: '#666', fontWeight: 'bold' },
  whiteBox: { backgroundColor: '#fff', borderRadius: 10, padding: 10, marginTop: 5, borderWidth: 1, borderColor: '#D1D9E0' },
  boldText: { fontWeight: 'bold' },
  plusBtn: { backgroundColor: '#1B4D6E', padding: 12, borderRadius: 10, marginLeft: 10, alignItems: 'center' },
  mainNumpadCard: { backgroundColor: '#fff', borderRadius: 15, overflow: 'hidden', borderWidth: 1, borderColor: '#ccc' },
  numHistoryBar: { flexDirection: 'row', height: 60, alignItems: 'center' },
  lastNumSlotSquare: { width: 60, height: 60, justifyContent: 'center', alignItems: 'center' },
  historyScrollArea: { flex: 1, paddingLeft: 10 },
  historySlotSquare: { width: 40, height: 40, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginRight: 8 },
  bgBlue: { backgroundColor: '#1B6E85' },
  bgBrown: { backgroundColor: '#A5522E' },
  bgEmpty: { backgroundColor: '#F0F4F7' },
  historyText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  counterSection: { width: 40, alignItems: 'center' },
  counterText: { fontWeight: 'bold', color: '#1B4D6E' },
  actionRow: { flexDirection: 'row', borderTopWidth: 1, borderColor: '#eee' },
  actionBtn: { flex: 1, padding: 15, alignItems: 'center', borderRightWidth: 1, borderColor: '#eee' },
  actionBtnText: { fontSize: 13 },
  numpadGrid: { borderTopWidth: 1, borderColor: '#eee' },
  numbersPart: { width: '100%' },
  keyRow: { flexDirection: 'row' },
  key: { flex: 1, aspectRatio: 1.2, justifyContent: 'center', alignItems: 'center', borderRightWidth: 1, borderBottomWidth: 1, borderColor: '#eee' },
  keyText: { fontSize: 22, fontWeight: 'bold' },
  currentSaisieText: { textAlign: 'center', fontSize: 40, fontWeight: 'bold', color: '#1B4D6E', marginTop: 15 },
  statsScroll: { flex: 1 },
  titleLarge: { fontSize: 18, fontWeight: 'bold', color: '#1B4D6E', textAlign: 'center', marginVertical: 15 },
  cartonContainer: { backgroundColor: '#fff', borderRadius: 8, marginBottom: 15, borderWidth: 1, overflow: 'hidden' },
  cartonHeader: { padding: 4, alignItems: 'center' },
  cartonTitle: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  cartonGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: 4 },
  cartonCell: { width: '11.11%', aspectRatio: 0.9, borderWidth: 0.5, borderColor: '#eee', justifyContent: 'center', alignItems: 'center' },
  cartonCellText: { fontSize: 14, fontWeight: 'bold' },
  periodRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 15 },
  periodBtn: { padding: 8, paddingHorizontal: 15, borderRadius: 15, backgroundColor: '#ddd', marginHorizontal: 5 },
  periodActive: { backgroundColor: '#1B4D6E' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#fff', padding: 20, borderRadius: 15, width: '80%' },
  modalTitle: { fontWeight: 'bold', marginBottom: 10 },
  input: { borderBottomWidth: 1, marginBottom: 15, padding: 5 },
  orgItem: { padding: 15, borderBottomWidth: 1, borderColor: '#eee' },
  modalItem: { padding: 15, alignItems: 'center' },
});
