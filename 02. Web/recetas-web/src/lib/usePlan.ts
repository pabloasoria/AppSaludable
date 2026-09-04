'use client';

import { useEffect, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { PLAN_STORAGE_KEY, type PlanState } from '@/lib/planner';

// Hook centralizado para el plan semanal, usado tanto por WeeklyPlanner como
// por ShoppingList (antes cada uno leía/escribía localStorage por su
// cuenta, con el riesgo de que se desincronizaran).
//
// Con sesión iniciada: el plan vive en la tabla `weekly_plans` de Supabase
// (una fila jsonb por usuario) y sincroniza entre dispositivos.
// Sin sesión: se mantiene el comportamiento anterior con localStorage, para
// no obligar a nadie a crear cuenta solo para probar el planificador.
export function usePlan() {
  const [plan, setPlanState] = useState<PlanState>({});
  const [loaded, setLoaded] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const supabaseRef = useRef(createClient());

  useEffect(() => {
    let active = true;
    const supabase = supabaseRef.current;

    async function loadForUser(uid: string | null) {
      if (uid) {
        const { data, error } = await supabase
          .from('weekly_plans')
          .select('plan')
          .eq('user_id', uid)
          .maybeSingle();
        if (!active) return;
        if (error) {
          console.error('No se pudo cargar el plan desde Supabase', error);
          setPlanState({});
        } else {
          setPlanState((data?.plan as PlanState) ?? {});
        }
      } else {
        try {
          const raw = window.localStorage.getItem(PLAN_STORAGE_KEY);
          setPlanState(raw ? JSON.parse(raw) : {});
        } catch {
          setPlanState({});
        }
      }
      if (active) setLoaded(true);
    }

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!active) return;
      setUserId(user?.id ?? null);
      loadForUser(user?.id ?? null);
    });

    // Recarga el plan si el usuario inicia o cierra sesión mientras la
    // página está abierta (p. ej. tras volver de /login en otra pestaña).
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const uid = session?.user?.id ?? null;
      setUserId(uid);
      loadForUser(uid);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const persist = (next: PlanState, uid: string | null) => {
    if (uid) {
      supabaseRef.current
        .from('weekly_plans')
        .upsert({ user_id: uid, plan: next, updated_at: new Date().toISOString() })
        .then(({ error }) => {
          if (error) console.error('No se pudo guardar el plan en Supabase', error);
        });
    } else {
      try {
        window.localStorage.setItem(PLAN_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // best-effort: si falla el guardado, el plan sigue funcionando en memoria.
      }
    }
  };

  const setPlan = (updater: PlanState | ((prev: PlanState) => PlanState)) => {
    setPlanState((prev) => {
      const next = typeof updater === 'function' ? (updater as (p: PlanState) => PlanState)(prev) : updater;
      persist(next, userId);
      return next;
    });
  };

  return { plan, setPlan, loaded, isLoggedIn: userId !== null };
}
