import { SecretBackendType } from './_types';

export interface iDatabricksSecretScope {
	name: string;
	backend_type: SecretBackendType;
}