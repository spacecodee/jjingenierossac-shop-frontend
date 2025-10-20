import { CanDeactivateFn } from '@angular/router';

export interface CanComponentDeactivate {
  hasChanges(): boolean;
}

export const unsavedChangesGuard: CanDeactivateFn<CanComponentDeactivate> = (component) => {
  if (component.hasChanges?.()) {
    return confirm(
      'Hay cambios sin guardar en el formulario. ¿Estás seguro de que deseas salir sin guardarlos?'
    );
  }
  return true;
};
