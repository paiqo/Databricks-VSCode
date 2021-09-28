export type CloudProvider = 
	"Azure" 
| 	"AWS" 
;

export type ConnectionSource = 
	"databricks.connections" 
| 	"databricks.default" 
|	"CLI-profile"
;

export interface AccessTokenSecure {
	keyTarSettingName: string | undefined;
	databricksCLIProfileName: string | undefined;
}

export type SensitiveValueStore =

	// Databricks Personal Access Token is stored in the VSCode Settings as plain text! 
	// There is a potential risk that the PAT gets checked in to source control systems like git!
	"VSCodeSettings"
	
	// (Experimental!) Databricks Personal Access Token is securely stored in the System Key Chain. 
	// Easy Copying/Sharing connections with other users is not possible this way. 
	// VSCode only stores a reference to the the KeyChain entry.",
	| "SystemKeyChain"

	// (Experimental!) Databricks Personal Access Token is stored in an external Config file. 
	// This is useful to manage all your PATs in one place and also easily share it
	| "ExternalConfigFile"
;