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
  currentSeance: NumeroSaisi[]; // Tirages de la session en cours
  archives: NumeroSaisi[];      // Historique total pour les stats globales
}

export default function LotoApp() {
  const [view, setView] = useState<'SAISIE' | 'STATS'>('SAISIE');
  const [menuVisible, setMenuVisible] = useState(false);
  const [modalPartieVisible, setModalPartieVisible] = useState(false);
  const [modalAddOrgVisible, setModalAddOrgVisible] = useState(false);
  const [modalSelectOrgVisible, setModalSelectOrgVisible] = useState(false);
  
  const [newOrgName, setNewOrgName] = useState('');
  const [organisateurs, setOrganisateurs] = useState<Organisateur[]>([
    { id: '1', nom: 'Karine', currentSeance: [], archives: [] }
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
    } else { setCurrentInput(nextInput); }
  };

  const validerNumero = (num: number) => {
    setOrganisateurs(prev => prev.map(org => {
      if (org.id === selectedOrgId) {
        return { ...org, currentSeance: [{ val: num, mode, typePartie: selectedTypePartie, date: today }, ...org.currentSeance] };
      }
      return org;
    }));
    setCurrentInput('');
  };

  // FONCTION DÉMARQUER (Efface la partie en cours)
  const viderHistorique = () => {
    if (confirm("Effacer les numéros de la partie en cours ?")) {
      setOrganisateurs(prev => prev.map(o => o.id === selectedOrgId ? { ...o, currentSeance: [] } : o));
    }
  };

  // FONCTION CLÔTURER (Archive la journée et vide le plateau)
  const cloturerJournee = () => {
    if (confirm("Clôturer la journée ? Cela enregistrera les numéros dans les stats globales.")) {
      setOrganisateurs(prev => prev.map(org => {
        if (org.id === selectedOrgId) {
          return { ...org, archives: [...org.currentSeance, ...org.archives], currentSeance: [] };
        }
        return org;
      }));
    }
  };

  // FONCTION SUPPRIMER ORGANISATEUR (Supprime tout : historique, stats, nom)
  const supprimerOrganisateur = () => {
    if (organisateurs.length <= 1) {
      alert("Impossible de supprimer le dernier organisateur.");
      return;
    }
    if (confirm(`Supprimer définitivement ${currentOrg.nom} ainsi que toutes ses statistiques ?`)) {
      const nouveaux = organisateurs.filter(o => o.id !== selectedOrgId);
      setOrganisateurs(nouveaux);
      setSelectedOrgId(nouveaux[0].id);
      setMenuVisible(false);
    }
  };

  const handleAnnuler = () => {
    if (currentInput.length > 0) { setCurrentInput(''); } 
    else {
      setOrganisateurs(prev => prev.map(org => {
        if (org.id === selectedOrgId && org.currentSeance.length > 0) {
          const newHistory = [...org.currentSeance];
          newHistory.shift();
          return { ...org, currentSeance: newHistory };
        }
        return org;
      }));
    }
  };

  // --- LOGIQUE STATS ---
  const getStatsCumulees = () => {
    const counts: { [key: number]: number } = {};
    const source = statPeriod === 'JOUR' ? currentOrg.currentSeance : [...currentOrg.currentSeance, ...currentOrg.archives];
    source.forEach(item => { counts[item.val] = (counts[item.val] || 0) + 1; });
    return Object.entries(counts)
      .map(([num, count]) => ({ num: parseInt(num), count }))
      .sort((a, b) => b.count - a.count)
      .map(item => item.num);
  };

  const generateLotoGrid = (numbers: number[]) => {
    let grid = Array(27).fill(null);
    let sortedNums = [...numbers].slice(0, 15).sort((a, b) => a - b);
    sortedNums.forEach(num => {
      let col = Math.floor(num / 10);
      if (num === 90) col = 8;
      for (let row = 0; row < 3; row++) {
        let pos = row * 9 + col;
        if (grid[pos] === null) { grid[pos] = num; break; }
      }
    });
    return grid;
  };

  const renderCartonStats = (index: number, color: string) => {
    const allStats = getStatsCumulees();
    const cartonData = generateLotoGrid(allStats.slice(index * 3));
    return (
      <View key={index} style={[styles.cartonStatsCard, { borderColor: color }]}>
        <View style={[styles.cartonStatsHeader, {backgroundColor: color}]}>
           <Text style={styles.cartonStatsTitle}>CARTON IDÉAL #{index + 1}</Text>
        </View>
        <View style={styles.cartonStatsGrid}>
          {cartonData.map((num, i) => (
            <View key={i} style={[styles.cartonStatsCell, num && { backgroundColor: color + '15' }]}>
              <Text style={[styles.cartonStatsCellText, num && { color: color }]}>{num || ''}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
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
              <View style={styles.whiteBox}><Text style={styles.boldText} numberOfLines={1}>{currentOrg.nom} ▾</Text></View>
            </TouchableOpacity>
            <View style={{width: 10}} />
            <TouchableOpacity style={styles.flexOne} onPress={() => setModalPartieVisible(true)}>
              <Text style={styles.labelHeader}>PARTIE</Text>
              <View style={styles.partieBadge}><Text style={styles.partieBadgeText}>{selectedTypePartie} ▾</Text></View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.plusBtn} onPress={() => setModalAddOrgVisible(true)}><Text style={{color: '#fff', fontSize: 24}}>+</Text></TouchableOpacity>
          </View>

          <View style={styles.mainNumpadCard}>
            <View style={styles.numHistoryBar}>
              <View style={[styles.lastNumSlotSquare, currentOrg.currentSeance[0] ? styles.bgBrown : styles.bgEmpty]}>
                <Text style={styles.historyText}>{currentOrg.currentSeance[0]?.val || ''}</Text>
              </View>
              <View style={styles.separator} />
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.historyScrollArea}>
                {currentOrg.currentSeance.slice(1).map((item, index) => (
                  <View key={index} style={[styles.historySlotSquare, styles.bgBlue]}><Text style={styles.historyText}>{item.val}</Text></View>
                ))}
              </ScrollView>
              <View style={styles.counterSection}><Text style={styles.counterText}>{currentOrg.currentSeance.length}</Text></View>
            </View>

            <View style={styles.modeGrid}>
              {['Une ligne', 'Deux lignes', 'Carton plein'].map(m => (
                <TouchableOpacity key={m} onPress={() => setMode(m)} style={[styles.modeItem, mode === m && styles.modeItemActive]}>
                  <Text style={[styles.modeItemText, mode === m && styles.modeItemTextActive]}>{m}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.actionBtn} onPress={handleAnnuler}><Text style={styles.actionBtnText}>⌫ Annuler</Text></TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn} onPress={viderHistorique}><Text style={styles.actionBtnText}>🧹 Démarquer</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtn, {backgroundColor: '#1B4D6E'}]} onPress={cloturerJournee}><Text style={[styles.actionBtnText, {color: '#fff'}]}>📁 Clôturer</Text></TouchableOpacity>
            </View>

            <View style={styles.numpadGrid}>
              <View style={styles.numbersPart}>
                <View style={styles.keyRow}>{[1,2,3,4,5].map(n=>(<TouchableOpacity key={n} style={styles.key} onPress={()=>handlePressNumber(n.toString())}><Text style={styles.keyText}>{n}</Text></TouchableOpacity>))}</View>
                <View style={styles.keyRow}>{[6,7,8,9,0].map(n=>(<TouchableOpacity key={n} style={styles.key} onPress={()=>handlePressNumber(n.toString())}><Text style={styles.keyText}>{n}</Text></TouchableOpacity>))}</View>
              </View>
              <TouchableOpacity style={styles.checkBtn} onPress={() => { if(currentInput.length === 1) validerNumero(parseInt(currentInput)) }}>
                <Text style={[styles.checkIcon, currentInput.length === 1 ? {color: '#1B6E85'} : {color: '#CCC'}]}>✓</Text>
              </TouchableOpacity>
            </View>
          </View>
          {currentInput.length > 0 && <Text style={styles.currentSaisieText}>Saisie : {currentInput}</Text>}
        </View>
      ) : (
        <ScrollView style={styles.statsScroll}>
          <Text style={styles.titleStats}>Mes 6 Cartons Idéaux</Text>
          <View style={styles.periodRow}>
            <TouchableOpacity onPress={() => setStatPeriod('JOUR')} style={[styles.periodBtn, statPeriod === 'JOUR' && styles.periodActive]}><Text style={statPeriod === 'JOUR' && {color:'#fff'}}>Journée en cours</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => setStatPeriod('GLOBAL')} style={[styles.periodBtn, statPeriod === 'GLOBAL' && styles.periodActive]}><Text style={statPeriod === 'GLOBAL' && {color:'#fff'}}>Global (Historique)</Text></TouchableOpacity>
          </View>
          {['#E94E31', '#1B6E85', '#6A4C93', '#2E7D32', '#F9A825', '#C2185B'].map((color, i) => (
            renderCartonStats(i, color)
          ))}
          <View style={{height: 50}} />
        </ScrollView>
      )}

      {/* MODALE MENU POUR SUPPRIMER ORGANISATEUR */}
      <Modal visible={menuVisible} transparent>
        <TouchableOpacity style={styles.overlay} onPress={() => setMenuVisible(false)}>
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.modalItem} onPress={supprimerOrganisateur}><Text style={{color: 'red', fontWeight: 'bold'}}>Supprimer cet organisateur</Text></TouchableOpacity>
            <TouchableOpacity style={styles.modalItem} onPress={() => setMenuVisible(false)}><Text>Fermer</Text></TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* MODALES D'ORIGINE (Ajout / Sélection) */}
      <Modal visible={modalAddOrgVisible} transparent><View style={styles.overlay}><View style={styles.modalContent}>
        <Text style={styles.modalTitle}>Nouveau</Text>
        <TextInput style={styles.input} placeholder="Nom..." value={newOrgName} onChangeText={setNewOrgName} autoFocus />
        <View style={styles.modalRowBtns}>
            <TouchableOpacity style={[styles.halfBtn, {backgroundColor: '#ccc'}]} onPress={() => setModalAddOrgVisible(false)}><Text>ANNULER</Text></TouchableOpacity>
            <TouchableOpacity style={[styles.halfBtn, {backgroundColor: '#1B4D6E'}]} onPress={()=>{if(!newOrgName) return; const id=Date.now().toString(); setOrganisateurs([...organisateurs,{id,nom:newOrgName,currentSeance:[],archives:[]}]); setSelectedOrgId(id); setNewOrgName(''); setModalAddOrgVisible(false);}}><Text style={{color:'#fff'}}>CRÉER</Text></TouchableOpacity>
        </View>
      </View></View></Modal>
      
      <Modal visible={modalSelectOrgVisible} transparent><View style={styles.overlay}><View style={styles.modalContent}><FlatList data={organisateurs} renderItem={({item})=>(<TouchableOpacity style={styles.orgItem} onPress={()=>{setSelectedOrgId(item.id); setModalSelectOrgVisible(false);}}><Text>{item.nom}</Text></TouchableOpacity>)} /></View></View></Modal>

      <Modal visible={modalPartieVisible} transparent><View style={styles.overlay}><View style={styles.modalContentLarge}><ScrollView contentContainerStyle={styles.gridParties}>{Array.from({length:21}, (_,i)=>(i+1).toString()).map(p => (<TouchableOpacity key={p} style={[styles.partSquare, selectedTypePartie === p && {backgroundColor:'#E94E31'}]} onPress={()=>{setSelectedTypePartie(p); setModalPartieVisible(false);}}><Text style={[styles.partText, selectedTypePartie === p && {color:'#fff'}]}>{p}</Text></TouchableOpacity>))}</ScrollView></View></View></Modal>
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
  labelHeader: { fontSize: 10, color: '#666', fontWeight: 'bold', marginBottom: 5 },
  whiteBox: { backgroundColor: '#fff', borderRadius: 10, padding: 10, height: 45, justifyContent: 'center', borderWidth: 1, borderColor: '#D1D9E0' },
  boldText: { fontWeight: 'bold', fontSize: 14 },
  flexOne: { flex: 1 },
  partieBadge: { backgroundColor: '#E94E31', borderRadius: 10, height: 45, justifyContent: 'center', alignItems: 'center' },
  partieBadgeText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  plusBtn: { backgroundColor: '#1B4D6E', width: 45, height: 45, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginLeft: 10 },
  mainNumpadCard: { backgroundColor: '#fff', borderRadius: 15, overflow: 'hidden', borderWidth: 1, borderColor: '#ccc' },
  numHistoryBar: { flexDirection: 'row', height: 60, alignItems: 'center' },
  lastNumSlotSquare: { width: 60, height: 60, justifyContent: 'center', alignItems: 'center' },
  separator: { width: 1, height: '60%', backgroundColor: '#eee' },
  historyScrollArea: { flex: 1, paddingLeft: 10 },
  historySlotSquare: { width: 40, height: 40, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginRight: 8 },
  bgBlue: { backgroundColor: '#1B6E85' },
  bgBrown: { backgroundColor: '#A5522E' },
  bgEmpty: { backgroundColor: '#F0F4F7' },
  historyText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  counterSection: { width: 40, alignItems: 'center' },
  counterText: { fontWeight: 'bold', color: '#1B4D6E' },
  modeGrid: { flexDirection: 'row', height: 50, borderTopWidth: 1, borderColor: '#eee' },
  modeItem: { flex: 1, justifyContent: 'center', alignItems: 'center', borderRightWidth: 1, borderColor: '#eee' },
  modeItemActive: { backgroundColor: '#E8F1F3' },
  modeItemText: { fontSize: 11, color: '#555' },
  modeItemTextActive: { color: '#1B6E85', fontWeight: 'bold' },
  actionRow: { flexDirection: 'row', height: 50, borderTopWidth: 1, borderColor: '#eee' },
  actionBtn: { flex: 1, justifyContent: 'center', alignItems: 'center', borderRightWidth: 1, borderColor: '#eee' },
  actionBtnText: { fontSize: 12, textAlign: 'center' },
  numpadGrid: { flexDirection: 'row', borderTopWidth: 1, borderColor: '#eee' },
  numbersPart: { flex: 1 },
  keyRow: { flexDirection: 'row' },
  key: { flex: 1, aspectRatio: 1.2, justifyContent: 'center', alignItems: 'center', borderRightWidth: 1, borderBottomWidth: 1, borderColor: '#eee' },
  keyText: { fontSize: 22, fontWeight: 'bold' },
  checkBtn: { width: 60, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F0F4F7' },
  checkIcon: { fontSize: 30 },
  currentSaisieText: { textAlign: 'center', fontSize: 18, fontWeight: 'bold', color: '#1B4D6E', marginTop: 10 },
  statsScroll: { flex: 1, padding: 10 },
  titleStats: { fontSize: 18, fontWeight: 'bold', color: '#1B4D6E', textAlign: 'center', marginVertical: 10 },
  cartonStatsCard: { backgroundColor: '#fff', borderRadius: 10, marginBottom: 20, borderWidth: 1, overflow: 'hidden' },
  cartonStatsHeader: { padding: 5, alignItems: 'center' },
  cartonStatsTitle: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  cartonStatsGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: 5 },
  cartonStatsCell: { width: '11.11%', aspectRatio: 0.9, borderWidth: 0.5, borderColor: '#eee', justifyContent: 'center', alignItems: 'center' },
  cartonStatsCellText: { fontSize: 14, fontWeight: 'bold' },
  periodRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 15 },
  periodBtn: { padding: 8, paddingHorizontal: 15, borderRadius: 15, backgroundColor: '#ddd', marginHorizontal: 5 },
  periodActive: { backgroundColor: '#1B4D6E' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#fff', padding: 20, borderRadius: 15, width: '85%' },
  modalContentLarge: { backgroundColor: '#fff', width: '90%', padding: 20, borderRadius: 15 },
  gridParties: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  partSquare: { width: '18%', aspectRatio: 1, backgroundColor: '#F0F4F8', justifyContent: 'center', alignItems: 'center', marginBottom: 10, borderRadius: 8 },
  partText: { fontWeight: 'bold' },
  input: { borderBottomWidth: 1, marginBottom: 20, padding: 5 },
  modalRowBtns: { flexDirection: 'row', justifyContent: 'space-between' },
  halfBtn: { width: '48%', padding: 12, borderRadius: 10, alignItems: 'center' },
  modalItem: { padding: 15, alignItems: 'center', borderBottomWidth: 1, borderColor: '#eee' },
  orgItem: { padding: 15, borderBottomWidth: 1, borderColor: '#eee' },
});
