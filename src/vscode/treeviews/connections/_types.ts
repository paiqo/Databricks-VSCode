export type CloudProvider =
	"Azure"
| 	"AWS"
| 	"GCP"
;

export type ConnectionManager =
	"Default"
|	"VSCode Settings"
|	"Databricks CLI Profiles"
|	"Azure"
|	"Databricks Extension"
|	"Manual Input"
;

export type ConnectionSource =
	"databricks.connections"
| 	"databricks.default"
| 	"CLI-profile"
| 	"ManuallyAdded"
| 	"Azure"
| 	"DatabricksExtension"
;


export interface AccessTokenSecure {
	keyTarSettingName: string | undefined;
	databricksCLIProfileName: string | undefined;
}

export type SensitiveValueStore =

	// Databricks Personal Access Token is stored in the VSCode Settings as plain text! 
	// There is a potential risk that the PAT gets checked in to source control systems like git!
	"VSCodeSettings"

	// Easy Copying/Sharing connections with other users is not possible this way. 
	// VSCode only stores a reference to the the Systems KeyChain entry.",
	| "SystemKeyChain"

	// (Experimental!) Databricks Personal Access Token is stored in an external Config file. 
	// This is useful to manage all your PATs in one place and also easily share them.
	| "ExternalConfigFile"
	;

export interface AzureSubscription {
	displayName: string;
	id: string;
	state: string;
	subscriptionId: string;
	tenantId: string;
}
export interface AzureSubscriptionListRepsonse {
	count: {
		type: string,
		value: number
	};
	value: AzureSubscription[];
}

export interface AzureResource {
	id: string;
	location: string;
	name: string;
	sku: {
		name: string;
		tier: string;
	};
	tags: object;
	properties: {
		managedResourceGroupId: string;
		parameters: object;
		provisioningState: string;
		uiDefinitionUri: string;
		authorizations: {
			principalId: string;
			roleDefinitionId: string;
		}[];
		createdBy: {
			oid: string;
			puid: string;
			applicationId: string;
		};
		updatedBy: {
			oid: string;
			puid: string;
			applicationId: string;
		};
		createdDateTime: Date;
		workspaceId: string;
		workspaceUrl: string;
	}
}

export interface AzureResourceListRepsonse {
	nextLink: string;
	value: AzureResource[];
}