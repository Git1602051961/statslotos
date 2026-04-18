import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, FlatList, TextInput, ScrollView, Dimensions } from 'react-native';

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

  const currentOrg = organisateurs.find(o => o.id === selectedOrgId) || organisateurs[0];
  const today = new Date().toLocaleDateString();

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
    if (window.confirm("Vider l'historique ?")) {
        setOrganisateurs(prev => prev.map(o => o.id === selectedOrgId ? {...o, history:[]} : o));
    }
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
          <View style={styles.headerSelectionRow}>
            <TouchableOpacity style={styles.flexOne} onPress={() => setModalSelectOrgVisible(true)}>
              <Text style={styles.labelHeader}>ORGANISATEUR</Text>
              <View style={styles.whiteBox}><Text style={styles.boldText}>{currentOrg.nom} ▾</Text></View>
            </TouchableOpacity>
            <View style={{width: 10}} />
            <TouchableOpacity style={styles.flexOne} onPress={() => setModalPartieVisible(true)}>
              <Text style={styles.labelHeader}>PARTIE</Text>
              <View style={styles.partieBadge}><Text style={styles.partieBadgeText}>{selectedTypePartie} ▾</Text></View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.plusBtn} onPress={() => setModalAddOrgVisible(true)}><Text style={{color: '#fff', fontSize: 24}}>+</Text></TouchableOpacity>
          </View>

          <View style={styles.mainNumpadCard}>
            {/* BANDE BLANCHE CORRIGÉE POUR ÉVITER LE RECOUVREMENT */}
            <View style={styles.numHistoryBar}>
              {/* Le dernier numéro à gauche (Marron) */}
              <View style={[styles.lastNumSlotSquare, currentOrg.history[0] ? styles.bgBrown : styles.bgEmpty]}>
                <Text style={styles.historyText}>{currentOrg.history[0]?.val || ''}</Text>
              </View>
              
              {/* Séparateur visuel */}
              <View style={styles.separator} />

              {/* L'historique suivant (Bleu) */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.historyScrollArea}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((offset) => {
                  const val = currentOrg.history[offset]?.val;
                  if (!val) return null;
                  return (
                    <View key={offset} style={[styles.historySlotSquare, styles.bgBlue]}>
                      <Text style={styles.historyText}>{val}</Text>
                    </View>
                  );
                })}
              </ScrollView>

              <View style={styles.counterSection}>
                <Text style={styles.counterText}>{currentOrg.history.length}</Text>
              </View>
            </View>

            <View style={styles.modeGrid}>
              {['Une ligne', 'Deux lignes', 'Carton plein'].map(m => (
                <TouchableOpacity key={m} onPress={() => setMode(m)} style={[styles.modeItem, mode === m && styles.modeItemActive]}>
                  <Text style={[styles.modeItemText, mode === m && styles.modeItemTextActive]}>{m}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.actionBtn} onPress={viderHistorique}>
                <Text style={styles.actionBtnText}>🧹 Démarquer</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn} onPress={handleAnnuler}>
                <Text style={styles.actionBtnText}>⌫ Annuler</Text>
              </TouchableOpacity>
            </View>

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
                <Text style={[styles.checkIcon, currentInput.length === 1 ? {color: '#1B6E85'} : {color: '#CCC'}]}>✓</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.currentSaisieContainer}>
            {currentInput.length > 0 && <Text style={styles.currentSaisieText}>Saisie : {currentInput}</Text>}
          </View>
        </View>
      ) : null}

      {/* MODALES */}
      <Modal visible={modalPartieVisible} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.modalContentLarge}>
            <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Choisir la Partie</Text>
                <TouchableOpacity onPress={() => setModalPartieVisible(false)}><Text style={styles.closeX}>✕</Text></TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={styles.gridParties}>
                {Array.from({length:21}, (_,i)=>(i+1).toString()).map(p => (
                <TouchableOpacity key={p} style={[styles.partSquare, selectedTypePartie === p && {backgroundColor:'#E94E31'}]} onPress={()=>{setSelectedTypePartie(p); setModalPartieVisible(false);}}><Text style={[styles.partText, selectedTypePartie === p && {color:'#fff'}]}>{p}</Text></TouchableOpacity>
                ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal visible={modalAddOrgVisible} transparent animationType="slide">
        <View style={styles.overlay}>
            <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Nouvel Organisateur</Text>
                <TextInput style={styles.input} placeholder="Nom..." value={newOrgName} onChangeText={setNewOrgName} autoFocus />
                <View style={styles.modalRowBtns}>
                    <TouchableOpacity style={[styles.halfBtn, {backgroundColor: '#ccc'}]} onPress={() => setModalAddOrgVisible(false)}><Text>ANNULER</Text></TouchableOpacity>
                    <TouchableOpacity style={[styles.halfBtn, {backgroundColor: '#1B4D6E'}]} onPress={()=>{if(!newOrgName) return; const id=Date.now().toString(); setOrganisateurs([...organisateurs,{id,nom:newOrgName,history:[]}]); setSelectedOrgId(id); setNewOrgName(''); setModalAddOrgVisible(false);}}><Text style={{color:'#fff'}}>CRÉER</Text></TouchableOpacity>
                </View>
            </View>
        </View>
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
  labelHeader: { fontSize: 10, color: '#666', fontWeight: 'bold', marginBottom: 5 },
  whiteBox: { backgroundColor: '#fff', borderRadius: 10, padding: 10, height: 45, justifyContent: 'center', borderWidth: 1, borderColor: '#D1D9E0' },
  boldText: { fontWeight: 'bold', fontSize: 14 },
  flexOne: { flex: 1 },
  partieBadge: { backgroundColor: '#E94E31', borderRadius: 10, height: 45, justifyContent: 'center', alignItems: 'center' },
  partieBadgeText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  plusBtn: { backgroundColor: '#1B4D6E', width: 45, height: 45, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginLeft: 10 },

  // BANDE BLANCHE - STRUCTURE HORIZONTALE PROPRE
  mainNumpadCard: { backgroundColor: '#fff', borderRadius: 8, borderWidth: 1, borderColor: '#ccc', overflow: 'hidden' },
  numHistoryBar: { flexDirection: 'row', height: 60, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee', alignItems: 'center' },
  lastNumSlotSquare: { width: 60, height: 60, justifyContent: 'center', alignItems: 'center' },
  separator: { width: 2, height: '70%', backgroundColor: '#eee', marginHorizontal: 5 },
  historyScrollArea: { flex: 1, paddingVertical: 10 },
  historySlotSquare: { width: 40, height: 40, borderRadius: 4, justifyContent: 'center', alignItems: 'center', marginRight: 8 },
  bgBlue: { backgroundColor: '#1B6E85' },
  bgBrown: { backgroundColor: '#A5522E' },
  bgEmpty: { backgroundColor: '#F0F4F7' },
  counterSection: { width: 50, height: 60, backgroundColor: '#F8F9FA', alignItems: 'center', justifyContent: 'center', borderLeftWidth: 1, borderLeftColor: '#eee' },
  historyText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  counterText: { fontSize: 20, color: '#1B4D6E', fontWeight: 'bold' },

  modeGrid: { flexDirection: 'row', height: 60, borderBottomWidth: 1, borderBottomColor: '#eee' },
  modeItem: { flex: 1, justifyContent: 'center', alignItems: 'center', borderRightWidth: 1, borderRightColor: '#eee' },
  modeItemActive: { backgroundColor: '#E8F1F3' },
  modeItemText: { fontSize: 12, color: '#555' },
  modeItemTextActive: { color: '#1B6E85', fontWeight: 'bold' },
  actionRow: { flexDirection: 'row', height: 50, borderBottomWidth: 1, borderBottomColor: '#eee' },
  actionBtn: { flex: 1, justifyContent: 'center', alignItems: 'center', borderRightWidth: 1, borderRightColor: '#eee' },
  actionBtnText: { fontSize: 14, color: '#333' },
  numpadGrid: { flexDirection: 'row', height: 140 },
  numbersPart: { flex: 1 },
  keyRow: { flexDirection: 'row', flex: 1, borderBottomWidth: 1, borderBottomColor: '#eee' },
  key: { flex: 1, justifyContent: 'center', alignItems: 'center', borderRightWidth: 1, borderRightColor: '#eee' },
  keyText: { fontSize: 24, color: '#333', fontWeight: 'bold' },
  checkBtn: { width: 65, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F0F4F7' },
  checkIcon: { fontSize: 35 },
  currentSaisieContainer: { height: 40, justifyContent: 'center', marginTop: 10 },
  currentSaisieText: { textAlign: 'center', fontSize: 18, fontWeight: 'bold', color: '#1B6E85' },

  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#fff', width: '85%', padding: 20, borderRadius: 15 },
  modalContentLarge: { backgroundColor: '#fff', width: '90%', maxHeight: '80%', padding: 20, borderRadius: 15 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  modalTitle: { fontSize: 18, fontWeight: 'bold' },
  closeX: { fontSize: 24, color: '#999' },
  gridParties: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  partSquare: { width: '18%', aspectRatio: 1, backgroundColor: '#F0F4F8', justifyContent: 'center', alignItems: 'center', marginBottom: 10, borderRadius: 8 },
  partText: { fontWeight: 'bold' },
  input: { borderBottomWidth: 2, borderColor: '#1B4D6E', marginBottom: 20, fontSize: 18, padding: 5 },
  modalRowBtns: { flexDirection: 'row', justifyContent: 'space-between' },
  halfBtn: { flex: 0.48, padding: 12, borderRadius: 8, alignItems: 'center' },
});
