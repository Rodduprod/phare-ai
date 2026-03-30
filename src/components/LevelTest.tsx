'use client';

import { useState, useEffect } from "react";
import Link from "next/link";

type Level = 'débutant' | 'amateur' | 'confirmé';

interface Question {
  id: number;
  text: string;
  options: { label: string; text: string; score: number }[];
}

const QUESTIONS: Question[] = [
  {
    id: 1,
    text: "Comment décririez-vous votre rapport à l'IA aujourd'hui ?",
    options: [
      { label: "A", text: "J'en entends parler partout mais je ne l'ai jamais vraiment utilisée", score: 0 },
      { label: "B", text: "J'utilise ChatGPT ou des outils similaires de temps en temps", score: 1 },
      { label: "C", text: "Je l'intègre au quotidien dans mon travail ou mes projets", score: 2 },
    ],
  },
  {
    id: 2,
    text: "Qu'est-ce qu'un LLM ?",
    options: [
      { label: "A", text: "Je ne sais pas", score: 0 },
      { label: "B", text: "C'est le type de modèle derrière ChatGPT, mais je ne connais pas les détails", score: 1 },
      { label: "C", text: "Un grand modèle de langage entraîné sur des milliards de textes — je comprends les bases techniques", score: 2 },
    ],
  },
  {
    id: 3,
    text: "Avez-vous déjà entendu parler de \"prompt engineering\" ?",
    options: [
      { label: "A", text: "Non, jamais", score: 0 },
      { label: "B", text: "Oui, c'est l'art de bien formuler ses demandes à une IA", score: 1 },
      { label: "C", text: "Oui, et j'utilise des techniques avancées : few-shot, chain-of-thought, instructions système...", score: 2 },
    ],
  },
  {
    id: 4,
    text: "Qu'est-ce que vous aimeriez faire avec l'IA dans les 6 prochains mois ?",
    options: [
      { label: "A", text: "Mieux comprendre ce que c'est vraiment, démêler le vrai du faux", score: 0 },
      { label: "B", text: "L'intégrer concrètement dans mon travail ou mes projets personnels", score: 1 },
      { label: "C", text: "Construire des applications, automatisations ou agents IA", score: 2 },
    ],
  },
  {
    id: 5,
    text: "Qu'est-ce que le RAG ?",
    options: [
      { label: "A", text: "Je ne connais pas ce terme", score: 0 },
      { label: "B", text: "J'en ai entendu parler, c'est lié aux LLMs mais je ne suis pas sûr des détails", score: 1 },
      { label: "C", text: "Retrieval-Augmented Generation : connecter un LLM à une base de connaissances externe", score: 2 },
    ],
  },
];

const LEVEL_CONFIG: Record<Level, {
  emoji: string;
  title: string;
  description: string;
  color: string;
  bg: string;
  border: string;
  cta: string;
  ctaLink: string;
}> = {
  débutant: {
    emoji: "🌱",
    title: "Débutant",
    description: "L'IA est encore floue pour toi : c'est normal, tout le monde commence quelque part. Le Labo AI est fait pour toi — des articles clairs, sans jargon, qui expliquent l'essentiel.",
    color: "text-green-700",
    bg: "bg-green-50",
    border: "border-green-200",
    cta: "Voir les articles débutant",
    ctaLink: "/articles?level=débutant",
  },
  amateur: {
    emoji: "🚀",
    title: "Amateur éclairé",
    description: "Tu connais les bases et tu veux aller plus loin. Les articles niveau amateur t'apportent du fond sans te noyer dans la technique — parfait pour être vraiment à jour.",
    color: "text-blue-700",
    bg: "bg-blue-50",
    border: "border-blue-200",
    cta: "Voir les articles amateur",
    ctaLink: "/articles?level=amateur",
  },
  confirmé: {
    emoji: "⚡",
    title: "Confirmé",
    description: "Tu maîtrises le sujet. Les articles niveau confirmé vont droit au fond : architecture, benchmarks, cas d'usage avancés. Pas de vulgarisation inutile.",
    color: "text-purple-700",
    bg: "bg-purple-50",
    border: "border-purple-200",
    cta: "Voir les articles confirmé",
    ctaLink: "/articles?level=confirmé",
  },
};

function computeLevel(scores: number[]): Level {
  const total = scores.reduce((a, b) => a + b, 0);
  if (total <= 3) return 'débutant';
  if (total <= 6) return 'amateur';
  return 'confirmé';
}

export function LevelTest() {
  const [step, setStep] = useState<'intro' | 'quiz' | 'result'>('intro');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [scores, setScores] = useState<number[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [result, setResult] = useState<Level | null>(null);
  const [animating, setAnimating] = useState(false);

  // Lire le niveau déjà sauvegardé
  const [savedLevel, setSavedLevel] = useState<Level | null>(null);
  useEffect(() => {
    const stored = localStorage.getItem('lelabo_user_level') as Level | null;
    if (stored) setSavedLevel(stored);
  }, []);

  function handleOptionClick(score: number, index: number) {
    if (animating) return;
    setSelectedOption(index);
  }

  function handleNext() {
    if (selectedOption === null) return;
    setAnimating(true);
    const newScores = [...scores, QUESTIONS[currentQuestion].options[selectedOption].score];

    setTimeout(() => {
      if (currentQuestion < QUESTIONS.length - 1) {
        setScores(newScores);
        setCurrentQuestion(currentQuestion + 1);
        setSelectedOption(null);
        setAnimating(false);
      } else {
        const level = computeLevel(newScores);
        setResult(level);
        localStorage.setItem('lelabo_user_level', level);
        setStep('result');
        setAnimating(false);
      }
    }, 300);
  }

  function handleReset() {
    setStep('intro');
    setCurrentQuestion(0);
    setScores([]);
    setSelectedOption(null);
    setResult(null);
  }

  // --- INTRO ---
  if (step === 'intro') {
    return (
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">🧪</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Quel est votre niveau en IA ?</h1>
          <p className="text-gray-600 text-lg">
            5 questions, 2 minutes. Le Labo AI s'adapte à votre profil pour vous montrer le contenu le plus pertinent.
          </p>
        </div>

        {savedLevel && (
          <div className={`mb-6 p-4 rounded-xl border ${LEVEL_CONFIG[savedLevel].bg} ${LEVEL_CONFIG[savedLevel].border}`}>
            <p className={`text-sm font-medium ${LEVEL_CONFIG[savedLevel].color}`}>
              {LEVEL_CONFIG[savedLevel].emoji} Votre niveau actuel : <strong>{savedLevel}</strong>
            </p>
            <p className="text-xs text-gray-500 mt-1">Refaites le test pour mettre à jour votre profil.</p>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
          <ul className="space-y-3">
            {[
              "Aucun jargon inutile — les questions sont directes",
              "Résultat immédiat, aucune inscription requise",
              "Le site s'adapte automatiquement à votre niveau",
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-gray-700">
                <span className="text-primary-deep font-bold mt-0.5">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <button
          onClick={() => setStep('quiz')}
          className="w-full bg-primary-deep hover:bg-blue-700 text-white font-semibold py-4 rounded-xl text-lg transition-colors"
        >
          Démarrer le test →
        </button>
      </div>
    );
  }

  // --- QUIZ ---
  if (step === 'quiz') {
    const q = QUESTIONS[currentQuestion];
    const progress = ((currentQuestion) / QUESTIONS.length) * 100;

    return (
      <div className="max-w-xl mx-auto">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-500 mb-2">
            <span>Question {currentQuestion + 1} / {QUESTIONS.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-deep rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <div className={`transition-opacity duration-300 ${animating ? 'opacity-0' : 'opacity-100'}`}>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">{q.text}</h2>

          <div className="space-y-3 mb-8">
            {q.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => handleOptionClick(opt.score, i)}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-start gap-3 ${
                  selectedOption === i
                    ? 'border-primary-deep bg-primary/10 text-gray-900'
                    : 'border-gray-200 bg-white hover:border-primary hover:bg-primary/5 text-gray-700'
                }`}
              >
                <span className={`font-bold text-sm mt-0.5 w-5 shrink-0 ${selectedOption === i ? 'text-primary-deep' : 'text-gray-400'}`}>
                  {opt.label}
                </span>
                <span className="text-sm leading-relaxed">{opt.text}</span>
              </button>
            ))}
          </div>

          <button
            onClick={handleNext}
            disabled={selectedOption === null}
            className={`w-full py-3 rounded-xl font-semibold text-white transition-all ${
              selectedOption !== null
                ? 'bg-primary-deep hover:bg-blue-700 cursor-pointer'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {currentQuestion < QUESTIONS.length - 1 ? 'Question suivante →' : 'Voir mon résultat →'}
          </button>
        </div>
      </div>
    );
  }

  // --- RESULT ---
  if (step === 'result' && result) {
    const cfg = LEVEL_CONFIG[result];
    return (
      <div className="max-w-xl mx-auto text-center">
        <div className="text-6xl mb-4">{cfg.emoji}</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Votre niveau : {cfg.title}</h1>

        <div className={`my-6 p-6 rounded-2xl border ${cfg.bg} ${cfg.border}`}>
          <p className={`text-base leading-relaxed ${cfg.color}`}>{cfg.description}</p>
        </div>

        <div className="space-y-3">
          <Link
            href={cfg.ctaLink}
            className="block w-full bg-primary-deep hover:bg-blue-700 text-white font-semibold py-4 rounded-xl text-lg transition-colors no-underline"
          >
            {cfg.cta}
          </Link>

          <Link
            href="/formation"
            className="block w-full border-2 border-primary-deep text-primary-deep hover:bg-primary/10 font-semibold py-3 rounded-xl transition-colors no-underline"
          >
            Découvrir la formation →
          </Link>

          <button
            onClick={handleReset}
            className="w-full text-sm text-gray-400 hover:text-gray-600 py-2 transition-colors"
          >
            Refaire le test
          </button>
        </div>
      </div>
    );
  }

  return null;
}
