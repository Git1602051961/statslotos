import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, FlatList, Alert, TextInput, ScrollView } from 'react-native';

export default function LotoApp() {
  const [currentOrg, setCurrentOrg] = useState({ nom: 'Karine', history: [] });
  const [selectedTypePartie, setSelectedTypePartie] = useState('7');
  const [currentInput, setCurrentInput] = useState('');
  const [mode, setMode] = useState('une ligne');

  const handlePressNumber = (val: string) => {
    let nextInput = currentInput + val;
    if (nextInput.length > 2) return;
    if (nextInput.length === 2) {
      const num = parseInt(nextInput);
      if (num >= 1 && num <= 90) {
        setCurrentOrg(prev => ({ ...prev, history: [{val: num}, ...prev.history] }));
        setCurrentInput('');
      } else { setCurrentInput(''); }
    } else { setCurrentInput(nextInput); }
  };

  return (
    <View style={styles.container}>
      {/* HEADER : ORGANISATEUR & PARTIE */}
      <View style={styles.topHeader}>
        <View style={styles.whiteInput}><Text style={styles.inputText}>{currentOrg.nom} ▾</Text></View>
        <View style={styles.orangeInput}><Text style={styles.orangeText}>Partie {selectedTypePartie} ▾</Text></View>
        <TouchableOpacity style={styles.plusBtn}><Text style={styles.plusText}>+</Text></TouchableOpacity>
      </View>

      {/* CLAVIER PRINCIPAL */}
      <View style={styles.card}>
        {/* BARRE DE NUMÉROS (HISTORIQUE) */}
        <View style={styles.historyBar}>
          <View style={styles.historyBlueArea}>
            {[5,4,3,2,1,0].map(i => (
              <Text key={i} style={styles.historyNum}>{currentOrg.history[i+1]?.val || ''}</Text>
            ))}
          </View>
          <View style={styles.lastNumBrown}>
            <Text style={styles.historyNum}>{currentOrg.history[0]?.val || ''}</Text>
          </View>
          <View style={styles.counterArea}>
            <Text style={styles.arrowIcon}>▲▼</Text>
            <Text style={styles.counterNum}>{currentOrg.history.length}</Text>
          </View>
        </View>

        {/* MODES DE JEU (4 COLONNES) */}
        <View style={styles.modeRow}>
          {['une ligne', 'deux lignes', 'carton plein', 'carton vide'].map(m => (
            <TouchableOpacity key={m} onPress={() => setMode(m)} style={[styles.modeBtn, mode === m && styles.modeBtnActive]}>
              <Text style={[styles.modeText, mode === m && styles.modeTextActive]}>{m}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ACTIONS (BORDURES POINTILLÉES) */}
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => setCurrentOrg({...currentOrg, history: []})}>
            <Text style={styles.actionLabel}>🧹 Démarquer</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, {borderRightWidth: 0}]} onPress={() => setCurrentInput('')}>
            <Text style={styles.actionLabel}>⌫ Annuler</Text>
          </TouchableOpacity>
        </View>

        {/* PAVÉ NUMÉRIQUE */}
        <View style={styles.numpadGrid}>
          <View style={styles.numbersPart}>
            <View style={styles.keyRow}>
              {[1, 2, 3, 4, 5].map(n => (
                <TouchableOpacity key={n} style={styles.key} onPress={() => handlePressNumber(n.toString())}>
                  <Text style={styles.keyText}>{n}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.keyRow}>
              {[6, 7, 8, 9, 0].map(n => (
                <TouchableOpacity key={n} style={[styles.key, {borderBottomWidth: 0}]} onPress={() => handlePressNumber(n.toString())}>
                  <Text style={styles.keyText}>{n}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <View style={styles.checkSide}>
             <Text style={[styles.checkIcon, currentInput.length === 1 && {color: '#1B6E85'}]}>✓</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FCE4EC', padding: 12, paddingTop: 60 },
  topHeader: { flexDirection: 'row', marginBottom: 15, alignItems: 'center' },
  whiteInput: { flex: 1.5, backgroundColor: '#fff', height: 40, borderRadius: 5, justifyContent: 'center', paddingHorizontal: 10, borderWidth: 1, borderColor: '#ddd' },
  orangeInput: { flex: 1, backgroundColor: '#E94E31', height: 40, borderRadius: 5, justifyContent: 'center', alignItems: 'center', marginLeft: 10 },
  plusBtn: { backgroundColor: '#1B4D6E', width: 40, height: 40, borderRadius: 5, justifyContent: 'center', alignItems: 'center', marginLeft: 10 },
  inputText: { fontWeight: 'bold', fontSize: 14 },
  orangeText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  plusText: { color: '#fff', fontSize: 24 },

  card: { backgroundColor: '#fff', borderRadius: 5, borderWidth: 1, borderColor: '#1B6E85', overflow: 'hidden' },
  historyBar: { flexDirection: 'row', height: 50 },
  historyBlueArea: { flex: 1, backgroundColor: '#1B6E85', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', paddingHorizontal: 5 },
  lastNumBrown: { width: 60, backgroundColor: '#A5522E', justifyContent: 'center', alignItems: 'center' },
  counterArea: { width: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8F9FA' },
  historyNum: { color: '#fff', fontSize: 24, fontWeight: '500' },
  counterNum: { fontSize: 20, fontWeight: 'bold', marginLeft: 2 },
  arrowIcon: { fontSize: 10, color: '#333' },

  modeRow: { flexDirection: 'row', height: 75, borderBottomWidth: 1, borderColor: '#ddd' },
  modeBtn: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 5, borderRightWidth: 1, borderColor: '#ddd' },
  modeBtnActive: { backgroundColor: '#1B6E85' },
  modeText: { textAlign: 'center', fontSize: 16, color: '#333' },
  modeTextActive: { color: '#fff', fontWeight: 'bold' },

  actionRow: { flexDirection: 'row', height: 50, borderBottomWidth: 1, borderColor: '#999', borderStyle: 'dashed' },
  actionBtn: { flex: 1, justifyContent: 'center', alignItems: 'center', borderRightWidth: 1, borderColor: '#999', borderStyle: 'dashed' },
  actionLabel: { fontSize: 18, color: '#333' },

  numpadGrid: { flexDirection: 'row', height: 130 },
  numbersPart: { flex: 1 },
  keyRow: { flexDirection: 'row', flex: 1 },
  key: { flex: 1, justifyContent: 'center', alignItems: 'center', borderRightWidth: 1, borderBottomWidth: 1, borderColor: '#999', borderStyle: 'dashed' },
  keyText: { fontSize: 28, color: '#333' },
  checkSide: { width: 60, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8F9FA' },
  checkIcon: { fontSize: 40, color: '#CCC' }
});
