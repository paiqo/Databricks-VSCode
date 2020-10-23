export type CloudProvider = 
	"Azure" 
| 	"AWS" 
;

export interface AccessTokenSecure {
	keyTarSettingName: string;
	databricksCLIProfileName: string;
}