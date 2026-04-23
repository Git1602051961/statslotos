import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, FlatList, TextInput, ScrollView, StatusBar } from 'react-native';

// --- INTERFACES ---
interface NumeroSaisi {
  val: number;
  mode: string;
  typePartie: string;
  date: string;
}

interface Organisateur {
  id: string;
  nom: string;
  currentSeance: NumeroSaisi[];
  archives: NumeroSaisi[];
}

interface MonCarton {
  id: string;
  numeros: number[];
  couleur: string;
}

export default function LotoApp() {
  const [view, setView] = useState<'SAISIE' | 'STATS' | 'MES_CARTONS'>('SAISIE');
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
  const [mode, setMode] = useState<string | null>(null);
  const [modesTermines, setModesTermines] = useState<string[]>([]);
  const [statPeriod, setStatPeriod] = useState<'JOUR' | 'GLOBAL'>('GLOBAL');

  // --- NOUVEAUX ETATS POUR LA PAUSE ---
  const [mesCartons, setMesCartons] = useState<MonCarton[]>([]);
  const [modalSaisieCarton, setModalSaisieCarton] = useState(false);
  const [tempCarton, setTempCarton] = useState<number[]>([]);

  const currentOrg = organisateurs.find(o => o.id === selectedOrgId) || organisateurs[0];
  const today = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });

  // PERSISTANCE
  useEffect(() => {
    const savedData = localStorage.getItem('@toploto_data');
    const savedId = localStorage.getItem('@toploto_selected_id');
    const savedCartons = localStorage.getItem('@toploto_mes_cartons');
    if (savedData) setOrganisateurs(JSON.parse(savedData));
    if (savedId) setSelectedOrgId(savedId);
    if (savedCartons) setMesCartons(JSON.parse(savedCartons));
  }, []);

  useEffect(() => {
    localStorage.setItem('@toploto_data', JSON.stringify(organisateurs));
    localStorage.setItem('@toploto_selected_id', selectedOrgId);
    localStorage.setItem('@toploto_mes_cartons', JSON.stringify(mesCartons));
  }, [organisateurs, selectedOrgId, mesCartons]);

  // LOGIQUE DE SAISIE
  const validerNumero = (num: number) => {
    if (!mode) {
      alert("⚠️ Sélectionnez d'abord un mode (Ligne, Double ou Carton)");
      setCurrentInput('');
      return;
    }
    setOrganisateurs(prev => prev.map(org => {
      if (org.id === selectedOrgId) {
        return { ...org, currentSeance: [{ val: num, mode, typePartie: selectedTypePartie, date: today }, ...org.currentSeance] };
      }
      return org;
    }));
    setCurrentInput('');
  };

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

  const handleAnnuler = () => {
    if (currentInput.length > 0) setCurrentInput('');
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

  const handleDemarquer = () => {
    if(window.confirm("Démarquer l'écran (Vider la séance en cours) ?")) {
      setOrganisateurs(prev => prev.map(o => o.id === selectedOrgId ? { ...o, currentSeance: [] } : o));
      setMode(null); 
    }
  };

  const resetOrganisateurData = () => {
    if(window.confirm(`⚠️ EFFACER TOUT : Supprimer l'historique ET les archives de ${currentOrg.nom} ?`)) {
      setOrganisateurs(prev => prev.map(o => o.id === selectedOrgId ? { ...o, currentSeance: [], archives: [] } : o));
      setMode(null);
      setMenuVisible(false);
    }
  };

  const handleGagne = () => {
    if (!mode) return;
    const currentMode = mode;
    setModesTermines([...modesTermines, currentMode]);
    setMode(null);

    if (currentMode === 'Carton plein') {
      if (window.confirm("🏆 Carton plein terminé ! Passer à la partie suivante ?")) {
        const nextPartie = (parseInt(selectedTypePartie) + 1).toString();
        setSelectedTypePartie(nextPartie);
        setModesTermines([]);
        setOrganisateurs(prev => prev.map(o => o.id === selectedOrgId ? { ...o, currentSeance: [] } : o));
      }
    }
  };

  // LOGIQUE CARTON IDÉAL (5 PAR LIGNE / MAX 2 PAR COLONNE / 15 TOTAL)
  const generateLotoGrid = (numbers: number[]) => {
    const grid = Array(27).fill(null);
    const selectedNums = numbers.slice(0, 15).sort((a, b) => a - b);
    
    const lineCounts = [0, 0, 0];
    const colCounts = Array(9).fill(0); // Suivi pour ne pas dépasser 2 par colonne

    selectedNums.forEach(num => {
      let col = Math.floor(num / 10);
      if (num === 90) col = 8;

      let placed = false;
      // Tentative de placement respectant les colonnes ET les lignes
      for (let row = 0; row < 3; row++) {
        let pos = row * 9 + col;
        if (grid[pos] === null && lineCounts[row] < 5 && colCounts[col] < 2) {
          grid[pos] = num;
          lineCounts[row]++;
          colCounts[col]++;
          placed = true;
          break;
        }
      }

      // Sécurité : si la colonne est pleine (2 numéros), on cherche la colonne vide la plus proche sur la même ligne
      if (!placed) {
        for (let row = 0; row < 3; row++) {
          if (lineCounts[row] < 5) {
            for (let c = 0; c < 9; c++) {
              if (grid[row * 9 + c] === null && colCounts[c] < 2) {
                grid[row * 9 + c] = num;
                lineCounts[row]++;
                colCounts[c]++;
                placed = true;
                break;
              }
            }
          }
          if (placed) break;
        }
      }
    });
    return grid;
  };

  const getStatsCumulees = () => {
    const counts: { [key: number]: number } = {};
    const source = statPeriod === 'JOUR' ? currentOrg.currentSeance : [...currentOrg.currentSeance, ...currentOrg.archives];
    source.forEach(item => { counts[item.val] = (counts[item.val] || 0) + 1; });
    return Object.entries(counts)
      .map(([num, count]) => ({ num: parseInt(num), count }))
      .sort((a, b) => b.count - a.count)
      .map(item => item.num);
  };

  // --- LOGIQUE SAISIE RAPIDE PAUSE ---
  const toggleNumInTempCarton = (num: number) => {
    if (tempCarton.includes(num)) {
      setTempCarton(tempCarton.filter(n => n !== num));
    } else {
      if (tempCarton.length < 15) setTempCarton([...tempCarton, num]);
    }
  };

  const sauvegarderCarton = () => {
    if (tempCarton.length !== 15) return;
    const couleurs = ['#E94E31', '#1B6E85', '#6A4C93', '#2E7D32', '#F9A825', '#C2185B'];
    const nouveau: MonCarton = {
      id: Date.now().toString(),
      numeros: [...tempCarton].sort((a,b) => a-b),
      couleur: couleurs[mesCartons.length % couleurs.length]
    };
    setMesCartons([...mesCartons, nouveau]);
    setTempCarton([]);
    setModalSaisieCarton(false);
  };

  const getScoreIdealite = (nums: number[]) => {
    const stats = getStatsCumulees();
    const tops = stats.slice(0, 30);
    return nums.filter(n => tops.includes(n)).length;
  };

  // --- NOUVEAU DESIGN CARTON (STYLE IMAGE) ---
  const renderCartonStats = (index: number, color: string) => {
    const allStats = getStatsCumulees();
    const cartonData = generateLotoGrid(allStats.slice(index * 5)); 
    return (
      <View key={index} style={[styles.cartonStatsCard, { borderColor: color }]}>
        <View style={[styles.cartonStatsHeader, {backgroundColor: color}]}>
            <Text style={styles.cartonStatsTitle}>CARTON IDÉAL #{index + 1}</Text>
        </View>
        <View style={styles.cartonStatsGrid}>
          {cartonData.map((num, i) => (
            <View key={i} style={[
                styles.cartonStatsCell, 
                !num && styles.cartonStatsCellEmpty, 
                num && styles.cartonStatsCellFull
            ]}>
              {num ? (
                  <Text style={styles.cartonStatsCellText}>{num}</Text>
              ) : (
                  <View style={styles.emptyCrossContainer}>
                    <View style={styles.emptyLineH} />
                    <View style={styles.emptyLineV} />
                  </View>
              )}
            </View>
          ))}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1B4D6E" />
      
      <View style={styles.appHeader}>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.appTitle}>TOPLOTO 🍀</Text>
          <Text style={styles.appSubtitle}>{today}</Text>
        </View>
        <TouchableOpacity style={styles.menuIconBtn} onPress={() => setMenuVisible(true)}>
          <Text style={{fontSize: 24, color: '#fff'}}>≡</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.contentPadding}>
        <View style={styles.topNav}>
          <View style={styles.tabContainer}>
            <TouchableOpacity onPress={() => setView('SAISIE')} style={[styles.tabBtn, view === 'SAISIE' && styles.tabActive]}><Text style={[styles.tabText, view === 'SAISIE' && styles.tabTextActive]}>SAISIE</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => setView('STATS')} style={[styles.tabBtn, view === 'STATS' && styles.tabActive]}><Text style={[styles.tabText, view === 'STATS' && styles.tabTextActive]}>STATS</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => setView('MES_CARTONS')} style={[styles.tabBtn, view === 'MES_CARTONS' && styles.tabActive]}><Text style={[styles.tabText, view === 'MES_CARTONS' && styles.tabTextActive]}>PAUSE</Text></TouchableOpacity>
          </View>
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
                  <Text style={styles.historyTextSmall}>{currentOrg.currentSeance[0]?.val || ''}</Text>
                </View>
                <View style={styles.separator} />
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.historyScrollArea}>
                  {currentOrg.currentSeance.slice(1).map((item, index) => (
                    <View key={index} style={[styles.historySlotSquare, styles.bgBlue]}><Text style={styles.historyTextSmall}>{item.val}</Text></View>
                  ))}
                </ScrollView>
                <View style={styles.counterSection}><Text style={styles.counterText}>{currentOrg.currentSeance.length}</Text></View>
              </View>

              <View style={styles.modeGrid}>
                {['Une ligne', 'Deux lignes', 'Carton plein'].map(m => {
                  const estFait = modesTermines.includes(m);
                  return (
                    <TouchableOpacity 
                      key={m} 
                      disabled={estFait}
                      onPress={() => setMode(m)} 
                      style={[styles.modeItem, mode === m && styles.modeItemActive, estFait && {backgroundColor: '#f0f0f0'}]}
                    >
                      <Text style={[styles.modeItemText, mode === m && styles.modeItemTextActive, estFait && {color: '#bbb', textDecorationLine: 'line-through'}]}>{m}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View style={styles.numpadGrid}>
                <View style={styles.numbersPart}>
                  <View style={styles.keyRow}>{[1,2,3,4,5].map(n=>(<TouchableOpacity key={n} style={styles.keyLarge} onPress={()=>handlePressNumber(n.toString())}><Text style={styles.keyTextLarge}>{n}</Text></TouchableOpacity>))}</View>
                  <View style={styles.keyRow}>{[6,7,8,9,0].map(n=>(<TouchableOpacity key={n} style={styles.keyLarge} onPress={()=>handlePressNumber(n.toString())}><Text style={styles.keyTextLarge}>{n}</Text></TouchableOpacity>))}</View>
                </View>
                <TouchableOpacity style={styles.checkBtnLarge} onPress={() => { if(currentInput.length === 1) validerNumero(parseInt(currentInput)) }}>
                  <Text style={[styles.checkIconLarge, currentInput.length === 1 ? {color: '#1B6E85'} : {color: '#CCC'}]}>✓</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={{ marginTop: 25 }}>
                <TouchableOpacity 
                    onPress={() => { if(window.confirm(`Valider la victoire (${mode}) ?`)) handleGagne(); }} 
                    disabled={!mode}
                    style={[styles.gagneBtn, !mode ? styles.gagneBtnInactive : styles.gagneBtnActive]}
                >
                    <Text style={styles.gagneBtnText}>{mode ? `🏆 GAGNÉ (${mode.toUpperCase()}) !` : "SÉLECTIONNEZ UN MODE"}</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.footerActions}>
                <TouchableOpacity style={styles.actionBtnSimple} onPress={handleAnnuler}><Text style={{color:'#666'}}>⌫ Annuler dernier</Text></TouchableOpacity>
                <TouchableOpacity style={styles.actionBtnSimple} onPress={handleDemarquer}><Text style={{color:'#666'}}>🧹 Démarquer</Text></TouchableOpacity>
            </View>
          </View>
        ) : view === 'STATS' ? (
          <ScrollView style={styles.statsScroll}>
            <Text style={styles.titleStats}>Mes 6 Cartons Idéaux</Text>
            <View style={styles.periodRow}>
              <TouchableOpacity onPress={() => setStatPeriod('JOUR')} style={[styles.periodBtn, statPeriod === 'JOUR' && styles.periodActive]}><Text style={statPeriod === 'JOUR' && {color:'#fff'}}>Session</Text></TouchableOpacity>
              <TouchableOpacity onPress={() => setStatPeriod('GLOBAL')} style={[styles.periodBtn, statPeriod === 'GLOBAL' && styles.periodActive]}><Text style={statPeriod === 'GLOBAL' && {color:'#fff'}}>Global</Text></TouchableOpacity>
            </View>
            {['#E94E31', '#1B6E85', '#6A4C93', '#2E7D32', '#F9A825', '#C2185B'].map((color, i) => (
              renderCartonStats(i, color)
            ))}
            <View style={{height: 100}} />
          </ScrollView>
        ) : (
          <View style={{flex: 1}}>
            <TouchableOpacity style={styles.addCartonBtn} onPress={() => setModalSaisieCarton(true)}>
              <Text style={styles.addCartonBtnText}>+ SCAN / SAISIE RAPIDE CARTON</Text>
            </TouchableOpacity>
            <ScrollView>
              {mesCartons.sort((a,b) => getScoreIdealite(b.numeros) - getScoreIdealite(a.numeros)).map((c) => (
                <View key={c.id} style={[styles.cartonMini, {borderColor: c.couleur}]}>
                  <View style={styles.cartonMiniHeader}>
                    <Text style={styles.cartonMiniTitle}>POTENTIEL : {getScoreIdealite(c.numeros)} / 15</Text>
                    <TouchableOpacity onPress={() => setMesCartons(mesCartons.filter(m => m.id !== c.id))}><Text style={{color: 'red', fontSize: 10}}>Suppr.</Text></TouchableOpacity>
                  </View>
                  <View style={styles.cartonMiniNums}>{c.numeros.map(n => <Text key={n} style={styles.miniNumText}>{n}</Text>)}</View>
                </View>
              ))}
            </ScrollView>
          </View>
        )}
      </View>

      {/* --- MODALS --- */}
      <Modal visible={modalSaisieCarton} animationType="slide">
        <View style={styles.modalFull}>
          <Text style={styles.modalFullTitle}>Saisie 15 numéros ({tempCarton.length}/15)</Text>
          <ScrollView contentContainerStyle={styles.gridSaisieRapide}>
            {Array.from({length: 90}, (_, i) => i + 1).map(n => (
              <TouchableOpacity key={n} onPress={() => toggleNumInTempCarton(n)} style={[styles.numTile, tempCarton.includes(n) && styles.numTileActive]}>
                <Text style={[styles.numTileText, tempCarton.includes(n) && {color:'#fff'}]}>{n}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.btnCancel} onPress={() => {setTempCarton([]); setModalSaisieCarton(false);}}><Text>ANNULER</Text></TouchableOpacity>
            <TouchableOpacity style={styles.btnSave} onPress={sauvegarderCarton}><Text style={{color:'#fff', fontWeight: 'bold'}}>VALIDER LE CARTON</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={menuVisible} transparent>
        <TouchableOpacity style={styles.overlay} onPress={() => setMenuVisible(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitleMenu}>Menu {currentOrg.nom}</Text>
            <TouchableOpacity style={styles.modalItem} onPress={() => {if(window.confirm("Clôturer la journée ?")){ setOrganisateurs(prev => prev.map(org => org.id === selectedOrgId ? { ...org, archives: [...org.currentSeance, ...org.archives], currentSeance: [] } : org)); setMenuVisible(false); }}}><Text style={{fontWeight: 'bold', color: '#1B4D6E'}}>📁 Clôturer la journée</Text></TouchableOpacity>
            <TouchableOpacity style={styles.modalItem} onPress={resetOrganisateurData}><Text style={{color: '#E94E31', fontWeight: 'bold'}}>🗑️ Effacer données {currentOrg.nom}</Text></TouchableOpacity>
            <TouchableOpacity style={styles.modalItem} onPress={() => {if(organisateurs.length > 1 && window.confirm("Supprimer l'organisateur ?")) { const n = organisateurs.filter(o => o.id !== selectedOrgId); setOrganisateurs(n); setSelectedOrgId(n[0].id); setMenuVisible(false); }}}><Text style={{color: 'red'}}>❌ Supprimer l'organisateur</Text></TouchableOpacity>
            <TouchableOpacity style={styles.modalItem} onPress={() => setMenuVisible(false)}><Text>Fermer</Text></TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal visible={modalAddOrgVisible} transparent><View style={styles.overlay}><View style={styles.modalContent}>
        <TextInput style={styles.input} placeholder="Nom de l'organisateur..." value={newOrgName} onChangeText={setNewOrgName} autoFocus />
        <View style={styles.modalRowBtns}>
            <TouchableOpacity style={[styles.halfBtn, {backgroundColor: '#ccc'}]} onPress={() => setModalAddOrgVisible(false)}><Text>ANNULER</Text></TouchableOpacity>
            <TouchableOpacity style={[styles.halfBtn, {backgroundColor: '#1B4D6E'}]} onPress={()=>{if(!newOrgName) return; const id=Date.now().toString(); setOrganisateurs([...organisateurs,{id,nom:newOrgName,currentSeance:[],archives:[]}]); setSelectedOrgId(id); setNewOrgName(''); setModalAddOrgVisible(false);}}><Text style={{color:'#fff'}}>CRÉER</Text></TouchableOpacity>
        </View>
      </View></View></Modal>
      
      <Modal visible={modalSelectOrgVisible} transparent><View style={styles.overlay}><View style={styles.modalContent}><FlatList data={organisateurs} keyExtractor={(item)=>item.id} renderItem={({item})=>(<TouchableOpacity style={styles.orgItem} onPress={()=>{setSelectedOrgId(item.id); setModalSelectOrgVisible(false);}}><Text style={styles.boldText}>{item.nom}</Text></TouchableOpacity>)} /></View></View></Modal>

      <Modal visible={modalPartieVisible} transparent><View style={styles.overlay}><View style={styles.modalContentLarge}><ScrollView contentContainerStyle={styles.gridParties}>{Array.from({length:21}, (_,i)=>(i+1).toString()).map(p => (<TouchableOpacity key={p} style={[styles.partSquare, selectedTypePartie === p && {backgroundColor:'#E94E31'}]} onPress={()=>{setSelectedTypePartie(p); setModalPartieVisible(false);}}><Text style={[styles.partText, selectedTypePartie === p && {color:'#fff'}]}>{p}</Text></TouchableOpacity>))}</ScrollView></View></View></Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EDF2F7' },
  appHeader: { backgroundColor: '#1B4D6E', paddingTop: 45, paddingBottom: 15, paddingHorizontal: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitleContainer: { justifyContent: 'center' },
  appTitle: { color: '#fff', fontSize: 20, fontWeight: '900' },
  appSubtitle: { color: 'rgba(255,255,255,0.7)', fontSize: 11, textTransform: 'capitalize' },
  menuIconBtn: { padding: 5 },
  contentPadding: { flex: 1, paddingHorizontal: 16 },
  topNav: { marginVertical: 15 },
  tabContainer: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 12, padding: 4, borderWidth: 1, borderColor: '#D1D9E0' },
  tabBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  tabActive: { backgroundColor: '#1B4D6E' },
  tabText: { color: '#888', fontWeight: 'bold', fontSize: 12 },
  tabTextActive: { color: '#fff' },
  headerSelectionRow: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 15 },
  labelHeader: { fontSize: 10, color: '#666', fontWeight: 'bold', marginBottom: 5 },
  whiteBox: { backgroundColor: '#fff', borderRadius: 10, padding: 10, height: 45, justifyContent: 'center', borderWidth: 1, borderColor: '#D1D9E0' },
  boldText: { fontWeight: 'bold', fontSize: 14 },
  flexOne: { flex: 1 },
  partieBadge: { backgroundColor: '#E94E31', borderRadius: 10, height: 45, justifyContent: 'center', alignItems: 'center' },
  partieBadgeText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  plusBtn: { backgroundColor: '#1B4D6E', width: 45, height: 45, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginLeft: 10 },
  mainNumpadCard: { backgroundColor: '#fff', borderRadius: 15, overflow: 'hidden', borderWidth: 1, borderColor: '#ccc' },
  numHistoryBar: { flexDirection: 'row', height: 45, alignItems: 'center' },
  lastNumSlotSquare: { width: 50, height: 45, justifyContent: 'center', alignItems: 'center' },
  separator: { width: 1, height: '60%', backgroundColor: '#eee' },
  historyScrollArea: { flex: 1, paddingLeft: 10 },
  historySlotSquare: { width: 32, height: 32, borderRadius: 6, justifyContent: 'center', alignItems: 'center', marginRight: 8 },
  bgBlue: { backgroundColor: '#1B6E85' },
  bgBrown: { backgroundColor: '#A5522E' },
  bgEmpty: { backgroundColor: '#F0F4F7' },
  historyTextSmall: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
  counterSection: { width: 35, alignItems: 'center' },
  counterText: { fontWeight: 'bold', color: '#1B4D6E', fontSize: 14 },
  modeGrid: { flexDirection: 'row', height: 50, borderTopWidth: 1, borderColor: '#eee' },
  modeItem: { flex: 1, justifyContent: 'center', alignItems: 'center', borderRightWidth: 1, borderColor: '#eee' },
  modeItemActive: { backgroundColor: '#E8F1F3' },
  modeItemText: { fontSize: 11, color: '#555', fontWeight: 'bold' },
  modeItemTextActive: { color: '#1B6E85' },
  numpadGrid: { flexDirection: 'row', borderTopWidth: 1, borderColor: '#eee' },
  numbersPart: { flex: 1 },
  keyRow: { flexDirection: 'row' },
  keyLarge: { flex: 1, aspectRatio: 1.1, justifyContent: 'center', alignItems: 'center', borderRightWidth: 1, borderBottomWidth: 1, borderColor: '#eee' },
  keyTextLarge: { fontSize: 28, fontWeight: 'bold' },
  checkBtnLarge: { width: 70, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F0F4F7' },
  checkIconLarge: { fontSize: 35 },
  gagneBtn: { height: 60, borderRadius: 15, justifyContent: 'center', alignItems: 'center', elevation: 3 },
  gagneBtnActive: { backgroundColor: '#E94E31' },
  gagneBtnInactive: { backgroundColor: '#CBD5E0' },
  gagneBtnText: { color: '#fff', fontWeight: '900', fontSize: 18 },
  footerActions: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 15 },
  actionBtnSimple: { padding: 10 },
  currentSaisieText: { textAlign: 'center', marginTop: 10, fontSize: 16, fontWeight: 'bold', color: '#1B4D6E' },
  statsScroll: { flex: 1 },
  titleStats: { fontSize: 18, fontWeight: 'bold', color: '#1B4D6E', textAlign: 'center', marginVertical: 15 },
  cartonStatsCard: { backgroundColor: '#fff', borderRadius: 10, marginBottom: 25, borderWidth: 4, overflow: 'hidden', elevation: 4 },
  cartonStatsHeader: { padding: 8, alignItems: 'center' },
  cartonStatsTitle: { color: '#fff', fontSize: 13, fontWeight: '900', textTransform: 'uppercase' },
  cartonStatsGrid: { flexDirection: 'row', flexWrap: 'wrap', backgroundColor: '#fff', padding: 3 },
  cartonStatsCell: { width: '11.11%', aspectRatio: 1, borderWidth: 1, borderColor: '#e0e0e0', justifyContent: 'center', alignItems: 'center' },
  cartonStatsCellFull: { backgroundColor: '#fff' },
  cartonStatsCellEmpty: { backgroundColor: '#f2f2f2', overflow: 'hidden' }, 
  cartonStatsCellText: { fontSize: 18, fontWeight: '900', color: '#000' },
  emptyCrossContainer: { position: 'absolute', width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
  emptyLineH: { position: 'absolute', width: '70%', height: 1, backgroundColor: '#b0b0b0', transform: [{ rotate: '45deg' }] },
  emptyLineV: { position: 'absolute', width: '70%', height: 1, backgroundColor: '#b0b0b0', transform: [{ rotate: '-45deg' }] },
  periodRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 20 },
  periodBtn: { padding: 8, paddingHorizontal: 20, borderRadius: 20, backgroundColor: '#ddd', marginHorizontal: 5 },
  periodActive: { backgroundColor: '#1B4D6E' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#fff', padding: 20, borderRadius: 15, width: '85%' },
  modalContentLarge: { backgroundColor: '#fff', width: '90%', padding: 20, borderRadius: 15 },
  modalTitleMenu: { fontSize: 16, fontWeight: 'bold', textAlign: 'center', marginBottom: 15, color: '#1B4D6E' },
  gridParties: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  partSquare: { width: '18%', aspectRatio: 1, backgroundColor: '#F0F4F8', justifyContent: 'center', alignItems: 'center', marginBottom: 10, borderRadius: 8 },
  partText: { fontWeight: 'bold' },
  input: { borderBottomWidth: 1, marginBottom: 20, padding: 5, fontSize: 16 },
  modalRowBtns: { flexDirection: 'row', justifyContent: 'space-between' },
  halfBtn: { width: '48%', padding: 12, borderRadius: 10, alignItems: 'center' },
  modalItem: { padding: 15, alignItems: 'center', borderBottomWidth: 1, borderColor: '#eee' },
  orgItem: { padding: 15, borderBottomWidth: 1, borderColor: '#eee' },

  // --- NOUVEAUX STYLES PAUSE ---
  addCartonBtn: { backgroundColor: '#2E7D32', padding: 15, borderRadius: 10, alignItems: 'center', marginVertical: 15 },
  addCartonBtnText: { color: '#fff', fontWeight: 'bold' },
  cartonMini: { backgroundColor: '#fff', borderRadius: 8, padding: 10, marginBottom: 15, borderWidth: 2 },
  cartonMiniHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5, borderBottomWidth: 1, borderColor: '#eee' },
  cartonMiniTitle: { fontWeight: 'bold', fontSize: 12, color: '#1B4D6E' },
  cartonMiniNums: { flexDirection: 'row', flexWrap: 'wrap' },
  miniNumText: { width: '13%', fontSize: 13, fontWeight: 'bold', textAlign: 'center', margin: 2, color: '#000' },
  modalFull: { flex: 1, backgroundColor: '#F0F4F8', padding: 20 },
  modalFullTitle: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginVertical: 20, color: '#1B4D6E' },
  gridSaisieRapide: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  numTile: { width: '18%', aspectRatio: 1, backgroundColor: '#fff', margin: '1%', justifyContent: 'center', alignItems: 'center', borderRadius: 8, borderWidth: 1, borderColor: '#ddd' },
  numTileActive: { backgroundColor: '#1B4D6E', borderColor: '#1B4D6E' },
  numTileText: { fontSize: 16, fontWeight: 'bold' },
  modalActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  btnCancel: { padding: 15, flex: 1, alignItems: 'center' },
  btnSave: { padding: 15, flex: 2, backgroundColor: '#1B4D6E', borderRadius: 10, alignItems: 'center' },
});8
