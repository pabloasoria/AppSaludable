import { WeeklyPlanner } from '@/components/WeeklyPlanner';
import { getAllRecipes } from '@/lib/recipes';
import { getCurrentUser } from '@/lib/current-user';
import { LoginGate } from '@/components/LoginGate';

export default async function PlanificadorPage() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <div>
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-semibold tracking-tight text-on-surface">Planificador semanal</h1>
          <p className="mt-1.5 text-sm text-on-surface-variant">Inicia sesión para organizar tu semana.</p>
        </div>
        <LoginGate message="El planificador se guarda en tu cuenta — inicia sesión para usarlo." />
      </div>
    );
  }

  const recipes = await getAllRecipes();

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-semibold tracking-tight text-on-surface">Planificador semanal</h1>
        <p className="mt-1.5 text-sm text-on-surface-variant">
          Organiza tus comidas de lunes a domingo. Usa el icono de cada celda para elegir una receta del catálogo.
        </p>
      </div>
      <WeeklyPlanner recipes={recipes} />
    </div>
  );
}
