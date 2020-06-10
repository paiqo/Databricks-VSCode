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
The settings themselves are very well described and it should be easy for you to populate them. Also, not all of them are mandatory! Some of the optional settings will allow better integration with Databricks-Connect but this is still work in progress.
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
Even though the values are configured in the Workspace settings, they are not persisted there! Instead, they are converted and stored in the User settings to avoid any sensitive information like the ```personalAccessToken``` to be check-in to GIT accidentially. The workspace only contains a link to the User settings then.
Existing connections can be updated by using the settings UI and specifying the ```databricks.connection.defaultdisplayName``` you want to update. All other settings you configure will then overwrite the existing values. Also, new connections can be added this way at any time. To delete a connection, you need to manually remove it from the User settings at the moment (will be improved in future versions!). This works for single connections via ```databricks.connection.default.*``` but also via ```databricks.connections.[]``` if you want to add/modify multiple connections at once.
Alternatively, you can also modify the User settings directly - but this is for advanced users only! Check the configuration ```databricks.userWorkspaceConfigurations```. It list all workspace connections that were ever configured together with their unique workspace GUID which is used to link them to the corresponding VS Code workspace.

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
