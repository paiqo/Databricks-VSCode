![Databricks-VSCode](https://github.com/paiqo/Databricks-VSCode/blob/master/images/Databricks-VSCode.jpg?raw=true "Databricks-VSCode")

# VS Code Extension for Databricks
This is a Visual Studio Code extension that allows you to work with Azure Databricks and Databricks on AWS locally in an efficient way, having everything you need integrated into VS Code. It can be downloaded from the official Visual Studio Code extension gallery: [Databricks VSCode](https://marketplace.visualstudio.com/items?itemName=paiqo.databricks-vscode)

# Features
- Workspace browser
	- Up-/download of notebooks
	- Compare/Diff of local vs online notebook (currently only supported for raw files but not for notebooks)
	- Execution of notebooks against a Databricks Cluster (via [Databricks-Connect](https://docs.databricks.com/dev-tools/databricks-connect.html))
	- Support for [Code Cells](https://code.visualstudio.com/docs/python/jupyter-support-py#_jupyter-code-cells) if you do not want to use the .ipynb format
- Cluster manager 
	- Start/stop clusters
	- Script cluster definition as JSON
- Job browser
	- Start/stop jobs
	- View job-run history + status
	- Script job definition as JSON
	- View job-run output as JSON
- DBFS browser
	- Supports static mount points (e.g. using Service Principals)
	- Upload files
	- Download files
- Secrets browser
	- Create/delete secret scopes
	- Create/delete secrets
- Integration for CI/CD using [DatabricksPS](https://www.powershellgallery.com/packages/DatabricksPS)
- Support for multiple Databricks workspace connections
- Easy configuration via standard VS Code settings

# Relase Notes
**v0.7.0**:
- Major rework of environment/connection configurations
	- **Please read the [Migration FAQ](#FAQ)**
	- Sensitive values (PAT) are now stored in the system key chain
	- Connections are stored in VSCode again - either per workspace or globally per user
- restructured repository
- added auto-update every 10 seconds for jobs and clusters
**v0.6.0**:
- Reworked DBFS browser - Thanks to [JacekPliszka9](https://github.com/JacekPliszka)
	- now also downloads to local sync folder (similar to Workspace browser)
	- supports up-/download from/to local file
- potential fix for "enableProposedAPI"

**v0.5.3**:
- fix issue with dots ('.') in folder names (e.g. in user-folders) - Thanks to [JacekPliszka9](https://github.com/JacekPliszka)
- another fix issue with deprecated '.py.ipynb' file extensions

**v0.5.2**:
- fix issues with deprecated file extension '.py.ipynb'. Also removed it from configuration settings (but it still works)
- reworked UseCodeCells to now use the code cell tags provided by Databricks instead of adding new ones
- refresh on Connections Tab now also re-activates the current connection to reload the configuration

**v0.5.1**:
- fix issues with unsupported file extensions (e.g. .scala.ipynb)

**v0.5.0**:
- added support for [Code Cells](https://code.visualstudio.com/docs/python/jupyter-support-py#_jupyter-code-cells) which can be enabled using the new configuration property "useCodeCells"
- minor fixes for connection manager

**v0.4.0**:
- Moved configuration from VSCode Workspace-settings to VSCode User-settings
	- avoids accidential check-in of sensitive information (Databricks API token) to GIT
	- allows you to use the same configuratino across multiple workspaces on the same machine
- added subfolders for different components (Workspace, clusters, jobs, ...) for better integration with [DatabricksPS](https://www.powershellgallery.com/packages/DatabricksPS)
- internally reworked configuration management
- Updated logo

**v0.3.5**:
- extended logging for all API calls 
- fixes for iOS and Linux users

**v0.3.0**:
- added feature to compare notebooks (currently only works for regular files but not for notebooks)
- added logging for all API calls to separate VS Code output channel ```paiqo.databricks-vscode```
- added configuration option for export formats

# Installation
The extension can be downloaded directly from within VS Code. Simply go to the Extensions tab and search for "Databricks" and select and install the extension "Databricks Integration" (ID: paiqo.databricks-vscode).

Alternatively it can also be downloaded from the VS Code marketplace: [Databricks VSCode](https://marketplace.visualstudio.com/items?itemName=paiqo.databricks-vscode).

# Setup and Configuration
The configuration happens directly via VS Code by simply [opening the settings](https://code.visualstudio.com/docs/getstarted/settings#_creating-user-and-workspace-settings)
Then either search for "Databricks" or expand Extensions -> Databricks.
The settings themselves are very well described and it should be easy for you to populate them. Also, not all of them are mandatory! Some of the optional settings are experimental or still work in progress.
To configure multiple Databricks Connections/workspaces, you need to use the JSON editor.
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
The sensitive values entere like `personalAccessToken` will be safely stored in the system key chain/credential manager once the configuration is read the first time. This happens if you open the extension.
Existing connections can be updated directly in VSCode settigns or via the JSON editor. To update a `personalAccessToken`, simply re-enter it and the extension will update it in the system key chain/credential manager.
The only important thing to keep in mind is that the `displayName` should be unique on the whole machine (across all VSCode workspaces) as the `displayName` is used to identify the `personalAccessToken` to load from the system key chain/credential manager.

Another important setting which requires modifying the JSON directly are the export formats which can be used to define the format in which notebooks are up-/downloaded. Again, there is a default/current setting ```databricks.connection.default.exportFormats``` and it can also configured per Connection:
``` json
		...
		"databricks.connection.default.exportFormats": 
		{
			"Scala": ".scala",
			"Python": ".py.ipynb",
			"SQL": ".sql",
			"R": ".r"
		},
		...
```
Each filetype can either be exported as raw/source file (.scala, .py, .sql, .r) or as a notebook (.scala.ipynb, .py.ipynb, .sql.ipynb, .r.ipynb). This is also very important if you want to upload a local file as these also have to match these extension and will be ignored otherwise!

If you are using raw/source files, you may also consider using [Code Cells](https://code.visualstudio.com/docs/python/jupyter-support-py#_jupyter-code-cells) be setting ```"useCodeCells" = true``` for your corresponding connection.

All these settings can either be configured on a global/user or on a workspace level. The recommendation is to use workspace configurations and then to include the localSyncFolders into your workspace for easy access to your notebooks and sync to GIT. 
Using a workspace configuration also allows you separate differnt Databricks Connections completely. 

# Connections
![Connections](https://github.com/paiqo/Databricks-VSCode/blob/master/images/Connections.jpg?raw=true "Connections")

You can either work with a single Connection or configure multiple Connections. If you use multiple Connections, you will see your list in the Connections view and icons indicating which one is currently active. To change the Connection, simply click the "Activate" button next to an inactive Connection. All other views will update automatically.

To change an existing connection - please see [Setup and Configuration](#setup-and-configuration)

# Workspace Browser
![Workspace Browser](https://github.com/paiqo/Databricks-VSCode/blob/master/images/WorkspaceBrowser.jpg?raw=true "Workspace Browser")

The workspace browser connects directly to the Databricks workspace and loads the whole folder strucuture recursively. It displays folders, notebooks and libraries. Notebooks and folders can be up- and downloaded manually by simply clicking the corresponding item next them. If you do an up-/download on a whole folder or on the root, it will up-/download all items recursively.
The files are stored in the ```databricks.connection.default.localSyncFolder``` (or your Connection) that you configured in your settings/for your Connection. If you doubleclick a file, it will be downloaded locally and opened. Depending on the ExportFormats that you have defined in ```databricks.connection.default.exportFormats``` (or your Connection), the item will be downloaded in the corresponding format - basically you can decide between Notebook format and raw/source format.
The downloaded files can then be executed directly against the Databricks cluster if Databricks-Connect is setup correctly ([Setup Databricks-Connect on AWS](https://docs.databricks.com/dev-tools/databricks-connect.html), [Setup Databricks-Connect on Azure](https://docs.microsoft.com/en-us/azure/databricks/dev-tools/databricks-connect))

The up-/downloaded state of the single items are also reflected in their icons:
![Workspace Browser Icons](https://github.com/paiqo/Databricks-VSCode/blob/master/images/WorkspaceBrowser_Icons.jpg?raw=true "Workspace Browser Icons")

If you have set ```useCodeCells = true``` in your connection, the Code Cells will be added once you download a raw/source file. They will not be removed again when you upload the raw/source file again!

**NOTE: The logic is currently not recursive - if a folder exists online and locally, does not mean that also all sub-folders and files exist online and locally!**
- A small red dot at the top right of an item indicates that it only exists online in the Databricks workspace but has not yet been downloaded to the ```localSyncFolder``` into the subfolder ```Workspace```.
- A small blue dot at the bottom right of an item indicates that it only exists locally but has not yet been uploaded to the Databricks workspace. Please note that only local files that match the file extensions defined in ```exportFormats``` will be considered for an upload. For all other files you will see a warning in VS Code.
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

**NOTE: The DBFS Browser also supports browsing of mount points if they were configured with a static authentication (e.g. an Azure Service Principal)!**

# Secrets Browser
![Secret Browser](https://github.com/paiqo/Databricks-VSCode/blob/master/images/SecretBrowser.jpg?raw=true "Secret Browser")

Another tool to help you working with Databricks locally is the Secrets Browser. It allows you to browse, create, update and delete your secret scopes and secrets.
This can come in handy if you want to quickly add a new secret as this is otherwise only supported using the plain REST API (or a CLI)!


## FAQ
**Q:** What can I do if none of the tabs/browsers is showing anything?

**A:** This is very likely an issue with the connection. Please make sure that especially `apiRootUrl` and `personalAccessToken` are set correctly. If you are sure th values are correct, please check the logs in the output window and filter for this extension.

**Q:** I just upgraded (or was upgraded automatically) to v0.7.0 and all my connections are lost. What shall I do?

**A:** No worries, this is _by design_. To restore your existing connections please open the [User Settings](https://code.visualstudio.com/docs/getstarted/settings) and edit them in JSON. There is a button at the top right that opens the JSON editor. You will find the property `databricks.userWorkspaceConfigurations` which contains a list of all VSCode workspaces that were used in combination with this extension. Search the one you want to restore and copy the `connections` property. Restore it in your existing workspace settings as `databricks.connections`. The next time you open the workspace again, it will read the settings from `databricks.connections`, extract the sensitive values and store them safely in the system key chain/credential manager. Once this is working, you can remove the original `databricks.userWorkspaceConfigurations`.

**Q:** My Personal Access Token (PAT) changed, how can I update my connection?

**A:** Whenever the property `personalAccessToken` is provided, it will be used and updated in the system key chain/credential manager. Once it is savely stored there, it will be removed again from the VSCode configuration.