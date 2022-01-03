export type RepoProvider =
	"gitHub"
	| "bitbucketCloud"
	| "gitLab"
	| "azureDevOpsServices"
	| "gitHubEnterprise"
	| "bitbucketServer"
	| "gitLabEnterpriseEdition"
	;



export interface iDatabricksRepo {
	id: number;
	path: string;
	url: string;
	provider: RepoProvider;
	branch: string;
	head_commit_id: string;
}
