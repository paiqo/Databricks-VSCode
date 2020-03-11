# VS Code Extension for Databricks
This is a Visual Studio Code extension that allows you to work with Azure Databricks and Databricks on AWS locally in an efficient way, having everything you need integrated into VS Code. 

![Databricks-VSCode](https://github.com/paiqo/Databricks-VSCode/blob/master/images/Databricks-VSCode.jpg?raw=true "Databricks-VSCode")

# Features
- Workspace browser
	- Up-/download of notebooks
	- Execution of notebooks against a Databricks Cluster (via [Databricks-Connect](https://docs.databricks.com/dev-tools/databricks-connect.html))
- Cluster manager 
	- Start/stop clusters
	- Script cluster definition as JSON
- Job browser
	- Start/stop jobs
	- View job-run history + status
	- Script job definition as JSON
	- Script job-run output as JSON
- DBFS browser
	- Upload files
	- Download files
- Secrets browser
	- Create/delete secret scopes
	- Create/delete secrets
- Support for multiple Databricks workspaces
- Easy confiugration via standard VS Code settings

# Installation
The extension can be downloaded directly from within VS Code. Simply go to the Extensions tab and search for "Databricks" and select and install the extension "Databricks Integration" (ID: paiqo.databricks-vscode).

Alternatively it can also be downloaded from the VS Code marketplace: [Databricks VSCode](https://marketplace.visualstudio.com/items?itemName=paiqo.databricks-vscode).

# Setup and Configuration
The configuration happens directly via VS Code. Simply open the settings via File -> Preferences -> Settings or by using the keyboard shortcut ```CTRL + ,```
Then either search for "Databricks" or expand Extensions -> Databricks.
The settings themselves are very well described and it should be easy for you to populate them. Also, not all of them are mandatory! Some of the optional settings allow better integration with Databricks-Connect but this is still work in progress.
To configure multiple Databricks environments/workspaces, you need to use the JSON editor. 

``` json
		...
		"databricks.connections": [
			{
				"apiRootUrl": "https://westeurope.azuredatabricks.net",
				"cloudProvider": "Azure",
				"displayName": "My Dev workspace",
				"localSyncFolder": "c:\\Databricks\\dev",
				"personalAccessToken": "dapi219e30212312311c6721a66ce879e"
			},
			{
				"apiRootUrl": "https://westeurope.azuredatabricks.net",
				"cloudProvider": "Azure",
				"displayName": "My Test workspace",
				"localSyncFolder": "c:\\Databricks\\test",
				"personalAccessToken": "dapi219e30212312311c672aaaaaaaaaa"
			}
		],
		...
```

All these settings can either be configured on a global/user or on a workspace level. The recommendation is to use workspace configurations and then to include the localSyncFolders into your workspace for easy access to your notebooks and sync to GIT. 
Using a workspace configuration also allows you separate differnt Databricks environments completely. 

# Environments
![Environments](https://github.com/paiqo/Databricks-VSCode/blob/master/images/Environments.jpg?raw=true "Environments")
You can either work with a single environment or configure multiple environments. If you use multiple environments, you will see your list in the Environments view and icons indicating which one is currently active. To change the environment, simply click the "Activate" button next to an inactive environment. All other views will update automatically.

# Workspace Browser
![Workspace Browser](https://github.com/paiqo/Databricks-VSCode/blob/master/images/WorkspaceBrowser.jpg?raw=true "Workspace Browser")
The workspace browser connects directly to the Databricks workspace and loads the whole folder strucuture recursively. It displays folders, notebooks and libraries. Notebooks and folders can be up- and downloaded manually by simply clicking the corresponding item next them. If you do an up-/download on a whole folder or on the root, it will up-/download all items recursively.
The files are stored in the **databricks.connection.default.localSyncFolder** (or your environment) that you configured in your settings/for your environment. If you doubleclick a file, it will be downloaded locally and opened. Depending on the ExportFormats that you have defined in **databricks.connection.default.exportFormats** (or your environment), the item will be downloaded in the corresponding format - basically you can decide between Notebook format and raw/source format.
The downloaded files can then be executed directly against the Databricks cluster if Databricks-Connect is setup correctly ([Setup Databricks-Connect on AWS](https://docs.databricks.com/dev-tools/databricks-connect.html), [Setup Databricks-Connect on Azure](https://docs.microsoft.com/en-us/azure/databricks/dev-tools/databricks-connect))

The up-/downloaded state of the single items are also reflected in their icons:
![Workspace Browser Icons](https://github.com/paiqo/Databricks-VSCode/blob/master/images/WorkspaceBrowser_Icons.jpg?raw=true "Workspace Browser Icons")
- A small red dot at the top right of an item indicates that it only exists online in the Databricks workspace but has not yet been downloaded to the **localSyncFolder**.
- A small blue dot at the bottom right of an item indicates that it only exists locally but has not yet been uploaded to the Databricks workspace. Please note that only local files that match the file extensions defined in **exportFormats** will be considered for an upload. For all other files you will see a warning in VS Code.
- If there is no blue or red dot in the icon then the file/folder exists locally and also in the Databricks workspace. However, this does not mean that the files have to be in sync. It is up to you to know which file is more recent and then sync them accordingly!

# Cluster Manager
![Cluster Manager](https://github.com/paiqo/Databricks-VSCode/blob/master/images/ClusterManager.jpg?raw=true "Cluster Manager")
This VS Code extension also allows you to manage your Databricks clusters directly from within VS Code. So you do not need to open the web UI anymore to start or stop your clusters. It also distinguishes between regular clusters and job clusters which will be displayed in a separate folder.
In addition, the Cluster manager also allows you to script the definition of your cluster and store it locally - e.g. if you want to integrate it as part of your CI/CD. This cluster definition file can for example be used with the [DatabricksPS PowerShell Module](https://www.powershellgallery.com/packages/DatabricksPS) to automate the cluster deployment.
The cluster manager also distinguishes between regular user-created clusters and job-clusters.

# Job Manager
![Job Manager](https://github.com/paiqo/Databricks-VSCode/blob/master/images/JobManager.jpg?raw=true "Job Manager")
The Job Manager allows you to manage all your existing Databricks jobs from within VS Code. It gives you information about currently deployed jobs and their different job-runs/executions. You can also start and stop new job-runs which will then be executed on the cluster. Similar to the Cluster Manager, you can also script the jobs to integrate them in automated CI/CD deployment pipelines using the [DatabricksPS PowerShell Module](https://www.powershellgallery.com/packages/DatabricksPS).

# DBFS Browser
![DBFS Browser](https://github.com/paiqo/Databricks-VSCode/blob/master/images/DBFSBrowser.jpg?raw=true "DBFS Browser")
The DBFS Browser allows you to browse the whole Databricks File System including mountpoints! You can also download files, view or modify them locally and upload them again. For viewing files I highly recommend installing the extension [Data Preview](https://marketplace.visualstudio.com/items?itemName=RandomFractalsInc.vscode-data-preview) as it supports most formats communly used with Databricks.
Clicking a file will download it to yout TEMP folder and open it in VS Code. If you download it explicitly using the icon next to the item, you will be asked where to save it locally.

# Secrets Browser
![Secret Browser](https://github.com/paiqo/Databricks-VSCode/blob/master/images/SecretBrowser.jpg?raw=true "Secret Browser")
Another tool to help you working with Databricks locally is the Secrets Browser. It allows you to browse, create, update and delete your secret scopes and secrets.
