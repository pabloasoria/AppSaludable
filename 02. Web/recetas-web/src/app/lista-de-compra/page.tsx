import { ShoppingList } from '@/components/ShoppingList';
import { getAllRecipes } from '@/lib/recipes';
import { getCurrentUser } from '@/lib/current-user';
import { LoginGate } from '@/components/LoginGate';

export default async function ListaDeCompraPage() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <div>
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-semibold tracking-tight text-on-surface">Lista de la compra</h1>
          <p className="mt-1.5 text-sm text-on-surface-variant">Inicia sesión para ver tu lista de la compra.</p>
        </div>
        <LoginGate message="La lista de la compra se genera desde tu planificador — inicia sesión para verla." />
      </div>
    );
  }

  const recipes = await getAllRecipes();

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-semibold tracking-tight text-on-surface">Lista de la compra</h1>
        <p className="mt-1.5 text-sm text-on-surface-variant">
          Generada automáticamente a partir de las recetas que has planificado esta semana.
        </p>
      </div>
      <ShoppingList recipes={recipes} />
    </div>
  );
}
