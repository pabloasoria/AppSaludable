import { getCurrentUser } from '@/lib/current-user';
import { LoginGate } from '@/components/LoginGate';
import { ChangePasswordForm } from '@/components/ChangePasswordForm';

export default async function CuentaPage() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <div>
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-semibold tracking-tight text-on-surface">Mi cuenta</h1>
          <p className="mt-1.5 text-sm text-on-surface-variant">Inicia sesión para ver tu cuenta.</p>
        </div>
        <LoginGate message="Inicia sesión para gestionar tu cuenta." />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-semibold tracking-tight text-on-surface">Mi cuenta</h1>
        <p className="mt-1.5 text-sm text-on-surface-variant">{user.email}</p>
      </div>

      <div className="mx-auto max-w-sm rounded-2xl bg-surface-container-lowest p-6 shadow-sm sm:p-8">
        <h2 className="mb-4 font-serif text-lg font-semibold text-on-surface">Cambiar contraseña</h2>
        {user.isDevBypass ? (
          <p className="text-sm text-on-surface-variant">
            No disponible en modo dev bypass — inicia sesión con una cuenta real para cambiar la contraseña.
          </p>
        ) : (
          <ChangePasswordForm />
        )}
      </div>
    </div>
  );
}
