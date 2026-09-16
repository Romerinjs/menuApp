import { ITenantRepository } from './ITenantRepository';
import { LocalTenantRepository } from './LocalTenantRepository';

// Instancia singleton del repositorio. En el futuro, se puede intercambiar
// por un SupabaseTenantRepository o CloudTenantRepository sin modificar los componentes.
export const tenantRepository: ITenantRepository = new LocalTenantRepository();

export * from './ITenantRepository';
export * from './LocalTenantRepository';
