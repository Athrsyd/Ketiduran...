/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Question,
  MultipleChoiceQuestion,
  WordArrangeQuestion,
  MatchPairsQuestion,
  CategorySortQuestion,
} from '../../types/game';
import { useGameStore } from '../../store/gameStore';
import {
  validateMultipleChoice,
  validateWordArrange,
  validateMatchPairs,
  validateCategorySort,
} from '../../utils/gameLogic';
import { sound } from '../../services/soundEngine';
import { multiplayerSync } from '../../services/multiplayerSync';
import { CheckCircle2, AlertCircle, X, HelpCircle, ArrowRight, RefreshCw, BookOpen } from 'lucide-react';

interface QuestionModalProps {
  question: Question;
}

export const QuestionModal: React.FC<QuestionModalProps> = ({ question }) => {
  const closeQuestion = useGameStore((s) => s.closeQuestion);
  const solveQuestion = useGameStore((s) => s.solveQuestion);
  const myId = useGameStore((s) => s.myId);
  const roomCode = useGameStore((s) => s.roomCode);

  // Status state
  const [feedback, setFeedback] = useState<{ isError: boolean; message: string } | null>(null);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  // Type 1: Multiple Choice state
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);

  // Type 2: Word Arrange state
  const [placedWordIds, setPlacedWordIds] = useState<string[]>([]);

  // Type 3: Match Pairs state
  // selectedLeftId: string | null; matches: Record<leftId, rightId>
  const [selectedLeftId, setSelectedLeftId] = useState<string | null>(null);
  const [matches, setMatches] = useState<Record<string, string>>({});

  // Type 4: Category Sort state
  // selectedItemId: string | null; placements: Record<itemId, categoryId>
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [placements, setPlacements] = useState<Record<string, string>>({});

  // Handlers for Question Submissions
  const handleSubmit = () => {
    let isValid = false;

    if (question.type === 'multiple_choice') {
      const q = question as MultipleChoiceQuestion;
      isValid = validateMultipleChoice(selectedOptionId, q.correctOptionId);
    } else if (question.type === 'word_arrange') {
      const q = question as WordArrangeQuestion;
      isValid = validateWordArrange(placedWordIds, q.correctOrder);
    } else if (question.type === 'match_pairs') {
      const q = question as MatchPairsQuestion;
      isValid = validateMatchPairs(matches, q.pairs);
    } else if (question.type === 'category_sort') {
      const q = question as CategorySortQuestion;
      isValid = validateCategorySort(placements, q.items);
    }

    if (isValid) {
      setIsCompleted(true);
      setFeedback({
        isError: false,
        message: 'Luar biasa! Jawabanmu 100% tepat.',
      });
      solveQuestion(question.id);
      multiplayerSync.send({
        type: 'QUESTION_SOLVED',
        senderId: myId,
        roomCode,
        payload: { questionId: question.id },
        timestamp: Date.now(),
      });
    } else {
      sound.playWrong();
      setFeedback({
        isError: true,
        message: 'Jawaban belum tepat, ayo coba teliti lagi!',
      });
      // Reset current selections per requirement so student can retry
      if (question.type === 'multiple_choice') {
        setSelectedOptionId(null);
      } else if (question.type === 'word_arrange') {
        setPlacedWordIds([]);
      } else if (question.type === 'match_pairs') {
        setSelectedLeftId(null);
        setMatches({});
      } else if (question.type === 'category_sort') {
        setSelectedItemId(null);
        setPlacements({});
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-950/80 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold text-sm">
              L{question.floor}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wider font-semibold text-emerald-400">
                  {question.topic}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  {question.type === 'multiple_choice' && 'Pilihan Ganda'}
                  {question.type === 'word_arrange' && 'Susun Kata'}
                  {question.type === 'match_pairs' && 'Menjodohkan'}
                  {question.type === 'category_sort' && 'Mencocokkan Kategori'}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white line-clamp-1">
                {question.title}
              </h2>
            </div>
          </div>
          <button
            onClick={closeQuestion}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            title="Tutup (Bisa dikerjakan nanti)"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 text-slate-200">
          {/* Question Prompt */}
          <div className="p-3.5 sm:p-4 rounded-xl bg-slate-800/60 border border-slate-700/50">
            <p className="text-sm sm:text-base leading-relaxed text-slate-100 font-medium">
              {question.prompt}
            </p>
          </div>

          {/* ========================================================
              TYPE 1: PILIHAN GANDA (4 Large thumb-friendly buttons)
              ======================================================== */}
          {question.type === 'multiple_choice' && (
            <div className="space-y-2.5">
              {(question as MultipleChoiceQuestion).options.map((opt, idx) => {
                const isSelected = selectedOptionId === opt.id;
                const letter = String.fromCharCode(65 + idx); // A, B, C, D
                return (
                  <button
                    key={opt.id}
                    disabled={isCompleted}
                    onClick={() => {
                      sound.playInteract();
                      setSelectedOptionId(opt.id);
                      setFeedback(null);
                    }}
                    className={`w-full text-left p-3.5 sm:p-4 rounded-xl border flex items-start gap-3 transition cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-500/15 border-emerald-500 text-white shadow-lg shadow-emerald-500/10'
                        : 'bg-slate-800/40 border-slate-700 hover:bg-slate-800 hover:border-slate-600 text-slate-200'
                    }`}
                  >
                    <span
                      className={`flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold ${
                        isSelected
                          ? 'bg-emerald-500 text-slate-950'
                          : 'bg-slate-700/80 text-slate-300'
                      }`}
                    >
                      {letter}
                    </span>
                    <span className="text-xs sm:text-sm pt-0.5 leading-snug">{opt.text}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* ========================================================
              TYPE 2: SUSUN KATA (Tap to arrange / Tap to return)
              ======================================================== */}
          {question.type === 'word_arrange' && (
            <div className="space-y-4">
              <div className="text-xs text-slate-400 flex items-center gap-1.5">
                <HelpCircle size={14} className="text-emerald-400" />
                <span>
                  {(question as WordArrangeQuestion).hint || 'Ketuk kata untuk menyusun kalimat yang benar.'}
                </span>
              </div>

              {/* Target / Placed Words Box */}
              <div className="min-h-24 p-3 rounded-xl bg-slate-950/70 border-2 border-dashed border-emerald-500/40 flex flex-wrap gap-2 items-center">
                {placedWordIds.length === 0 ? (
                  <span className="text-xs sm:text-sm text-slate-500 italic mx-auto">
                    Urutan kata yang telah kamu pilih akan muncul di sini...
                  </span>
                ) : (
                  placedWordIds.map((id, index) => {
                    const item = (question as WordArrangeQuestion).scrambledWords.find(
                      (w) => w.id === id
                    );
                    if (!item) return null;
                    return (
                      <button
                        key={`placed_${id}`}
                        disabled={isCompleted}
                        onClick={() => {
                          if (isCompleted) return;
                          sound.playInteract();
                          setPlacedWordIds(placedWordIds.filter((pid) => pid !== id));
                          setFeedback(null);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-400 text-emerald-300 text-xs sm:text-sm font-semibold flex items-center gap-1.5 hover:bg-rose-500/20 hover:border-rose-400 hover:text-rose-300 transition cursor-pointer"
                        title="Ketuk untuk mengembalikan kata"
                      >
                        <span className="w-4 h-4 rounded-full bg-emerald-400/20 text-[10px] flex items-center justify-center font-bold">
                          {index + 1}
                        </span>
                        <span>{item.text}</span>
                      </button>
                    );
                  })
                )}
              </div>

              {/* Available Scrambled Words */}
              <div className="space-y-1.5">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Pilihan Potongan Kata (Ketuk untuk memilih):
                </div>
                <div className="flex flex-wrap gap-2">
                  {(question as WordArrangeQuestion).scrambledWords.map((item) => {
                    const isUsed = placedWordIds.includes(item.id);
                    return (
                      <button
                        key={item.id}
                        disabled={isUsed || isCompleted}
                        onClick={() => {
                          sound.playInteract();
                          setPlacedWordIds([...placedWordIds, item.id]);
                          setFeedback(null);
                        }}
                        className={`px-3 py-2 rounded-lg border text-xs sm:text-sm font-medium transition cursor-pointer ${
                          isUsed
                            ? 'bg-slate-800/30 border-slate-800 text-slate-600 opacity-40 cursor-not-allowed'
                            : 'bg-slate-800 border-slate-600 hover:bg-slate-700 hover:border-slate-500 text-slate-200'
                        }`}
                      >
                        {item.text}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================
              TYPE 3: MENJODOHKAN (Tap Left -> Tap Right)
              ======================================================== */}
          {question.type === 'match_pairs' && (
            <div className="space-y-4">
              <div className="text-xs text-slate-400 flex items-center gap-1.5">
                <HelpCircle size={14} className="text-emerald-400" />
                <span>Ketuk satu istilah di kolom KIRI, lalu ketuk pasangannya di kolom KANAN.</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {/* Left Column */}
                <div className="space-y-2">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
                    Kolom Kiri (Istilah)
                  </div>
                  {(question as MatchPairsQuestion).pairs.map((pair) => {
                    const isMatched = !!matches[pair.id];
                    const isSelected = selectedLeftId === pair.id;
                    return (
                      <button
                        key={`left_${pair.id}`}
                        disabled={isMatched || isCompleted}
                        onClick={() => {
                          sound.playInteract();
                          setSelectedLeftId(pair.id);
                          setFeedback(null);
                        }}
                        className={`w-full text-left p-3 rounded-xl border text-xs sm:text-sm font-semibold transition cursor-pointer ${
                          isMatched
                            ? 'bg-emerald-950/40 border-emerald-600/50 text-emerald-300 opacity-90'
                            : isSelected
                            ? 'bg-sky-500/20 border-sky-400 text-sky-200 ring-2 ring-sky-400/40'
                            : 'bg-slate-800/60 border-slate-700 hover:bg-slate-800 text-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span>{pair.left}</span>
                          {isMatched && <CheckCircle2 size={16} className="text-emerald-400" />}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Right Column */}
                <div className="space-y-2">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
                    Kolom Kanan (Deskripsi)
                  </div>
                  {(question as MatchPairsQuestion).pairs.map((pair) => {
                    // Check if this right item is already matched with any left item
                    const matchedWithLeftId = Object.keys(matches).find(
                      (lid) => matches[lid] === pair.id
                    );
                    const isMatched = !!matchedWithLeftId;

                    return (
                      <button
                        key={`right_${pair.id}`}
                        disabled={isMatched || isCompleted}
                        onClick={() => {
                          if (!selectedLeftId) {
                            setFeedback({
                              isError: true,
                              message: 'Pilih istilah di kolom KIRI terlebih dahulu!',
                            });
                            return;
                          }
                          sound.playInteract();
                          setMatches({
                            ...matches,
                            [selectedLeftId]: pair.id,
                          });
                          setSelectedLeftId(null);
                          setFeedback(null);
                        }}
                        className={`w-full text-left p-3 rounded-xl border text-xs sm:text-sm transition cursor-pointer ${
                          isMatched
                            ? 'bg-emerald-950/40 border-emerald-600/50 text-emerald-300 opacity-90'
                            : selectedLeftId
                            ? 'bg-slate-800/80 border-sky-500/60 hover:bg-sky-950/30 text-slate-200 ring-1 ring-sky-500/20'
                            : 'bg-slate-800/40 border-slate-700 text-slate-400'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <span className="flex-1 leading-snug">{pair.right}</span>
                          {isMatched && <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================
              TYPE 4: MENCOCOKKAN KATEGORI (Tap Item -> Tap Category Box)
              ======================================================== */}
          {question.type === 'category_sort' && (
            <div className="space-y-4">
              <div className="text-xs text-slate-400 flex items-center gap-1.5">
                <HelpCircle size={14} className="text-emerald-400" />
                <span>Ketuk butir amalan di bawah, lalu ketuk kotak kategori tujuannya.</span>
              </div>

              {/* Unplaced Items Pool */}
              <div className="space-y-1.5">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Daftar Pernyataan / Amalan:
                </div>
                <div className="flex flex-wrap gap-2">
                  {(question as CategorySortQuestion).items.map((item) => {
                    const isPlaced = !!placements[item.id];
                    const isSelected = selectedItemId === item.id;
                    return (
                      <button
                        key={item.id}
                        disabled={isPlaced || isCompleted}
                        onClick={() => {
                          sound.playInteract();
                          setSelectedItemId(item.id);
                          setFeedback(null);
                        }}
                        className={`px-3 py-2 rounded-xl border text-xs sm:text-sm font-medium transition cursor-pointer ${
                          isPlaced
                            ? 'hidden'
                            : isSelected
                            ? 'bg-sky-500/25 border-sky-400 text-white ring-2 ring-sky-400/50'
                            : 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-200'
                        }`}
                      >
                        {item.text}
                      </button>
                    );
                  })}
                  {Object.keys(placements).length === (question as CategorySortQuestion).items.length && (
                    <div className="text-xs text-emerald-400 font-semibold italic py-1">
                      Semua amalan telah dimasukkan ke dalam kategori. Siap diperiksa!
                    </div>
                  )}
                </div>
              </div>

              {/* Target Category Boxes */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {(question as CategorySortQuestion).categories.map((cat) => {
                  const itemsInThisCat = (question as CategorySortQuestion).items.filter(
                    (it) => placements[it.id] === cat.id
                  );

                  return (
                    <div
                      key={cat.id}
                      onClick={() => {
                        if (!selectedItemId || isCompleted) return;
                        sound.playInteract();
                        setPlacements({
                          ...placements,
                          [selectedItemId]: cat.id,
                        });
                        setSelectedItemId(null);
                        setFeedback(null);
                      }}
                      className={`min-h-36 p-3 rounded-xl border-2 flex flex-col justify-between transition cursor-pointer ${
                        selectedItemId
                          ? 'border-dashed border-sky-400/80 bg-sky-950/20 hover:bg-sky-900/30'
                          : 'border-slate-700 bg-slate-950/50'
                      }`}
                    >
                      <div>
                        <div className="font-bold text-xs sm:text-sm text-emerald-300">
                          {cat.name}
                        </div>
                        {cat.description && (
                          <div className="text-[11px] text-slate-400 mb-2">
                            {cat.description}
                          </div>
                        )}
                        <div className="space-y-1.5 mt-2">
                          {itemsInThisCat.map((it) => (
                            <button
                              key={`placed_${it.id}`}
                              disabled={isCompleted}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (isCompleted) return;
                                sound.playInteract();
                                const next = { ...placements };
                                delete next[it.id];
                                setPlacements(next);
                                setFeedback(null);
                              }}
                              className="w-full text-left p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-[11px] sm:text-xs text-slate-200 hover:bg-rose-950/40 hover:border-rose-500/50 hover:text-rose-300 transition"
                              title="Ketuk untuk membatalkan dan mengembalikan ke daftar"
                            >
                              • {it.text}
                            </button>
                          ))}
                        </div>
                      </div>
                      {selectedItemId && (
                        <div className="text-[11px] text-sky-400 font-semibold text-center mt-2 py-1 bg-sky-950/50 rounded-lg">
                          + Masukkan ke sini
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Feedback Banner */}
          {feedback && (
            <div
              className={`p-3.5 rounded-xl border flex items-center gap-2.5 text-xs sm:text-sm font-semibold animate-in fade-in ${
                feedback.isError
                  ? 'bg-rose-500/10 border-rose-500/40 text-rose-300'
                  : 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
              }`}
            >
              {feedback.isError ? (
                <AlertCircle size={18} className="text-rose-400 flex-shrink-0" />
              ) : (
                <CheckCircle2 size={18} className="text-emerald-400 flex-shrink-0" />
              )}
              <span>{feedback.message}</span>
            </div>
          )}

          {/* Explanation Banner (when completed) */}
          {isCompleted && question.explanation && (
            <div className="p-3.5 sm:p-4 rounded-xl bg-slate-800/80 border border-slate-700 text-xs sm:text-sm space-y-1">
              <div className="flex items-center gap-1.5 text-emerald-400 font-bold uppercase tracking-wider text-[11px]">
                <BookOpen size={14} />
                <span>Penjelasan Materi PAI:</span>
              </div>
              <p className="text-slate-300 leading-relaxed">{question.explanation}</p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between gap-3">
          <button
            onClick={closeQuestion}
            className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            {isCompleted ? 'Tutup' : 'Kerjakan Nanti'}
          </button>

          {!isCompleted ? (
            <button
              onClick={handleSubmit}
              className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-emerald-500/20 active:scale-95 transition flex items-center gap-2 cursor-pointer"
            >
              <span>Periksa Jawaban</span>
              <ArrowRight size={16} />
            </button>
          ) : (
            <button
              onClick={closeQuestion}
              className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-emerald-500/20 active:scale-95 transition flex items-center gap-2 cursor-pointer"
            >
              <span>Lanjut Jelajahi Sekolah</span>
              <ArrowRight size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
