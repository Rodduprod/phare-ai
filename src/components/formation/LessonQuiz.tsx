'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

interface QcmQuestion {
  question: string;
  options: [string, string, string, string];
  answer: 0 | 1 | 2 | 3;
}

interface Props {
  moduleSlug: string;
  lessonSlug: string;
  questions: QcmQuestion[];
  next: { slug: string; title: string } | null;
  moduleHref: string;
  isLast: boolean;
}

type QuizState = 'unanswered' | 'submitted' | 'perfect' | 'auth-required';

export function LessonQuiz({ moduleSlug, lessonSlug, questions, next, moduleHref, isLast }: Props) {
  const router = useRouter();
  const [selected, setSelected] = useState<(number | null)[]>(questions.map(() => null));
  const [state, setState] = useState<QuizState>('unanswered');
  const [wrongIndexes, setWrongIndexes] = useState<Set<number>>(new Set());
  const [completing, setCompleting] = useState(false);

  const allAnswered = selected.every(s => s !== null);

  async function handleSubmit() {
    if (!allAnswered) return;

    // Calculer les erreurs
    const wrong = new Set<number>();
    questions.forEach((q, i) => {
      if (selected[i] !== q.answer) wrong.add(i);
    });

    if (wrong.size > 0) {
      setWrongIndexes(wrong);
      setState('submitted');
      return;
    }

    // 4/4 — vérifier l'auth
    const supabase = createSupabaseBrowserClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setState('auth-required');
      return;
    }

    // Enregistrer la progression
    setCompleting(true);
    try {
      const lessonPath = `${moduleSlug}/${lessonSlug}`;
      await Promise.allSettled([
        supabase.from("user_progress").upsert({
          user_id: user.id,
          lesson_path: lessonPath,
          completed_at: new Date().toISOString(),
        }, { onConflict: "user_id,lesson_path" }),
        supabase.from("user_enrollments").upsert({
          user_id: user.id,
          module_slug: moduleSlug,
          enrolled_at: new Date().toISOString(),
        }, { onConflict: "user_id,module_slug" }),
      ]);
    } catch (_) { /* non-bloquant */ }

    setState('perfect');
  }

  function handleReset() {
    setSelected(questions.map(() => null));
    setWrongIndexes(new Set());
    setState('unanswered');
  }

  function handleNavigateNext() {
    if (next) {
      router.push(`/formation/${moduleSlug}/${next.slug}`);
    } else {
      router.push(moduleHref);
    }
  }

  // ── État : 4/4 validé ──────────────────────────────────────────────────────
  if (state === 'perfect') {
    return (
      <div className="mt-12 pt-8 border-t border-border">
        <div className="bg-green-50 border border-green-200 rounded-2xl p-6 sm:p-8 text-center">
          <div className="text-4xl mb-3">🎉</div>
          <h3 className="font-display text-xl font-bold text-green-800 mb-2">
            Parfait ! 4/4
          </h3>
          <p className="text-green-700 text-sm mb-6">
            Leçon complétée et progression sauvegardée.
          </p>
          <button
            onClick={handleNavigateNext}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-hover text-white font-semibold rounded-xl transition-colors"
          >
            {isLast ? "Terminer le module" : `Leçon suivante : ${next?.title}`}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
        </div>
      </div>
    );
  }

  // ── État : auth requise ────────────────────────────────────────────────────
  if (state === 'auth-required') {
    const redirectUrl = encodeURIComponent(`/formation/${moduleSlug}/${lessonSlug}`);
    return (
      <div className="mt-12 pt-8 border-t border-border">
        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 sm:p-8 text-center">
          <div className="text-4xl mb-3">🔐</div>
          <h3 className="font-display text-xl font-bold text-text mb-2">
            Bravo ! 4/4 — une étape de plus
          </h3>
          <p className="text-text-muted text-sm mb-6 max-w-sm mx-auto">
            Créez un compte gratuit pour sauvegarder votre progression et débloquer la leçon suivante.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href={`/compte/inscription?redirect=${redirectUrl}`}
              className="px-6 py-3 bg-primary hover:bg-primary-hover text-white font-semibold rounded-xl transition-colors text-center"
            >
              S&apos;inscrire gratuitement
            </Link>
            <Link
              href={`/compte/connexion?redirect=${redirectUrl}`}
              className="px-6 py-3 border border-border text-text hover:border-primary/40 hover:text-primary font-medium rounded-xl transition-colors text-center"
            >
              Se connecter
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── QCM ───────────────────────────────────────────────────────────────────
  return (
    <div className="mt-12 pt-8 border-t border-border">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold shrink-0">
          ?
        </div>
        <div>
          <h3 className="font-semibold text-text">Testez vos connaissances</h3>
          <p className="text-xs text-text-muted">4 questions · il faut 4/4 pour valider la leçon</p>
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-6">
        {questions.map((q, qi) => {
          const isWrong = wrongIndexes.has(qi);
          const isAnswered = selected[qi] !== null;

          return (
            <div
              key={qi}
              className={`rounded-xl border p-4 sm:p-5 transition-colors ${
                state === 'submitted' && isWrong
                  ? 'border-red-200 bg-red-50'
                  : 'border-border bg-bg-alt'
              }`}
            >
              <p className="font-medium text-text text-sm sm:text-base mb-3">
                <span className="text-primary font-bold mr-2">{qi + 1}.</span>
                {q.question}
              </p>

              {state === 'submitted' && isWrong && (
                <p className="text-xs text-red-600 mb-2 font-medium">
                  ✗ Mauvaise réponse — réessayez après correction
                </p>
              )}

              <div className="space-y-2">
                {q.options.map((opt, oi) => {
                  const isSelected = selected[qi] === oi;
                  const isCorrect = state === 'submitted' && !isWrong && isSelected;

                  return (
                    <button
                      key={oi}
                      onClick={() => {
                        if (state === 'submitted') return; // locked after submit
                        const newSelected = [...selected];
                        newSelected[qi] = oi;
                        setSelected(newSelected);
                      }}
                      disabled={state === 'submitted'}
                      className={`w-full text-left px-4 py-2.5 rounded-lg border text-sm transition-all ${
                        isSelected
                          ? 'border-primary bg-primary/10 text-primary font-medium'
                          : 'border-border bg-white text-text-muted hover:border-primary/40 hover:text-text'
                      } disabled:cursor-default`}
                    >
                      <span className="font-medium mr-2 text-xs text-text-muted">
                        {['A', 'B', 'C', 'D'][oi]}.
                      </span>
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer actions */}
      <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center gap-3">
        {state === 'submitted' && wrongIndexes.size > 0 ? (
          <>
            <div className="flex items-center gap-2 text-red-600 text-sm font-medium">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {wrongIndexes.size} erreur{wrongIndexes.size > 1 ? 's' : ''} — relisez les réponses incorrectes
            </div>
            <button
              onClick={handleReset}
              className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-white text-sm font-semibold rounded-xl transition-colors"
            >
              Réessayer
            </button>
          </>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={!allAnswered || completing}
            className="px-6 py-3 bg-primary hover:bg-primary-hover text-white font-semibold rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {completing ? (
              <>
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Sauvegarde…
              </>
            ) : (
              'Vérifier mes réponses →'
            )}
          </button>
        )}

        {!allAnswered && state === 'unanswered' && (
          <p className="text-xs text-text-muted">
            Répondez aux {questions.filter((_, i) => selected[i] === null).length} question{questions.filter((_, i) => selected[i] === null).length > 1 ? 's' : ''} restante{questions.filter((_, i) => selected[i] === null).length > 1 ? 's' : ''}
          </p>
        )}
      </div>
    </div>
  );
}
