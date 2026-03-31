/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, RotateCcw, Plus, Minus, Edit2, Save, History, Trash2, UserPlus, X } from 'lucide-react';

interface Player {
  id: string;
  name: string;
  score: number;
  history: number[];
}

const STORAGE_KEY = 'flip7-score-tracker-v2';

export default function App() {
  const [players, setPlayers] = useState<Player[]>([
    { id: 'p1', name: 'Joueur 1', score: 0, history: [] },
    { id: 'p2', name: 'Joueur 2', score: 0, history: [] },
    { id: 'p3', name: 'Joueur 3', score: 0, history: [] },
  ]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempName, setTempName] = useState('');
  const [addValues, setAddValues] = useState<Record<string, string>>({});

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setPlayers(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load scores", e);
      }
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(players));
  }, [players]);

  const addPlayer = () => {
    const newId = `p${Date.now()}`;
    setPlayers(prev => [
      ...prev,
      { id: newId, name: `Joueur ${prev.length + 1}`, score: 0, history: [] }
    ]);
  };

  const removePlayer = (id: string) => {
    if (players.length <= 1) return;
    if (window.confirm('Supprimer ce joueur ? Ses scores seront perdus.')) {
      setPlayers(prev => prev.filter(p => p.id !== id));
    }
  };

  const updateScore = (id: string, delta: number) => {
    setPlayers(prev => prev.map(p => {
      if (p.id === id) {
        const newScore = Math.max(0, p.score + delta);
        return { 
          ...p, 
          score: newScore,
          history: [delta, ...p.history].slice(0, 10)
        };
      }
      return p;
    }));
  };

  const handleAddCustom = (id: string) => {
    const val = parseInt(addValues[id] || '');
    if (!isNaN(val)) {
      updateScore(id, val);
      setAddValues(prev => ({ ...prev, [id]: '' }));
    }
  };

  const resetScores = () => {
    if (window.confirm('Voulez-vous vraiment réinitialiser tous les scores ?')) {
      setPlayers(prev => prev.map(p => ({ ...p, score: 0, history: [] })));
    }
  };

  const startEditing = (player: Player) => {
    setEditingId(player.id);
    setTempName(player.name);
  };

  const saveName = () => {
    if (editingId !== null) {
      setPlayers(prev => prev.map(p => p.id === editingId ? { ...p, name: tempName || p.name } : p));
      setEditingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-cyan-500/30 p-4 md:p-8">
      <header className="max-w-7xl mx-auto mb-12 flex flex-col md:flex-row justify-between items-start md:items-end border-b border-white/10 pb-6 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 bg-cyan-500 rounded-sm" />
            <h1 className="text-xs font-mono uppercase tracking-[0.3em] text-white/40">Flip 7 Tracker</h1>
          </div>
          <h2 className="text-4xl font-light tracking-tight">Gestion des Scores</h2>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button 
            onClick={addPlayer}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-cyan-500 text-black rounded-lg transition-all text-sm font-bold hover:bg-cyan-400"
          >
            <UserPlus className="w-4 h-4" />
            Ajouter un joueur
          </button>
          <button 
            onClick={resetScores}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white/5 hover:bg-red-500/20 hover:text-red-400 border border-white/10 rounded-lg transition-all text-sm font-medium"
          >
            <RotateCcw className="w-4 h-4" />
            Réinitialiser
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <AnimatePresence mode="popLayout">
          {players.map((player) => (
            <motion.div 
              key={player.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-[#141414] border border-white/10 rounded-2xl overflow-hidden flex flex-col relative group"
            >
              {/* Delete Button */}
              {players.length > 1 && (
                <button 
                  onClick={() => removePlayer(player.id)}
                  className="absolute top-2 right-2 p-1.5 bg-red-500/10 text-red-500/40 hover:text-red-500 hover:bg-red-500/20 rounded-lg opacity-0 group-hover:opacity-100 transition-all z-10"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}

              {/* Player Header */}
              <div className="p-6 border-b border-white/5 bg-white/[0.02]">
                <div className="flex justify-between items-start mb-4">
                  {editingId === player.id ? (
                    <div className="flex gap-2 w-full">
                      <input 
                        autoFocus
                        type="text" 
                        value={tempName}
                        onChange={(e) => setTempName(e.target.value)}
                        onBlur={saveName}
                        onKeyDown={(e) => e.key === 'Enter' && saveName()}
                        className="bg-white/10 border border-cyan-500/50 rounded px-2 py-1 text-lg w-full outline-none focus:ring-2 ring-cyan-500/20"
                      />
                      <button onClick={saveName} className="p-2 bg-cyan-500 text-black rounded">
                        <Save className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <h3 className="text-xl font-medium truncate pr-8">{player.name}</h3>
                      <button 
                        onClick={() => startEditing(player)}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/40 hover:text-white"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-6xl font-light font-mono tracking-tighter">{player.score}</span>
                  <span className="text-white/20 text-xs font-mono uppercase tracking-widest">Points</span>
                </div>
              </div>

              {/* Controls */}
              <div className="p-6 space-y-6 flex-grow">
                <div className="grid grid-cols-3 gap-2">
                  {[1, 5, 10].map(val => (
                    <button 
                      key={val}
                      onClick={() => updateScore(player.id, val)}
                      className="py-3 bg-white/5 hover:bg-cyan-500 hover:text-black border border-white/10 rounded-xl font-mono font-bold transition-all active:scale-95"
                    >
                      +{val}
                    </button>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input 
                    type="number" 
                    placeholder="Valeur..."
                    value={addValues[player.id] || ''}
                    onChange={(e) => setAddValues(prev => ({ ...prev, [player.id]: e.target.value }))}
                    className="flex-grow bg-white/5 border border-white/10 rounded-xl px-4 py-2 outline-none focus:border-cyan-500/50 transition-colors font-mono"
                  />
                  <button 
                    onClick={() => handleAddCustom(player.id)}
                    className="px-4 bg-cyan-500 text-black rounded-xl font-bold hover:bg-cyan-400 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>

                {/* History */}
                <div className="pt-4 border-t border-white/5">
                  <div className="flex items-center gap-2 text-white/20 text-[10px] font-mono uppercase tracking-widest mb-3">
                    <History className="w-3 h-3" />
                    Derniers ajouts
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {player.history.length === 0 ? (
                      <span className="text-white/10 text-[10px] font-mono italic">Aucun historique</span>
                    ) : (
                      player.history.map((h, i) => (
                        <span 
                          key={i} 
                          className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${h > 0 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}
                        >
                          {h > 0 ? '+' : ''}{h}
                        </span>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </main>

      <footer className="max-w-7xl mx-auto mt-12 pt-8 border-t border-white/5 flex justify-between items-center text-white/20 text-[10px] font-mono uppercase tracking-[0.2em]">
        <div>Flip 7 Score Manager v1.1</div>
        <div>{players.length} Joueurs Actifs</div>
      </footer>
    </div>
  );
}
