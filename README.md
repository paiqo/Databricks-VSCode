# VSCode Extension for Databricks
[![Version](https://vsmarketplacebadge.apphb.com/version/paiqo.databricks-vscode.svg?color=orange&style=?style=for-the-badge&logo=visual-studio-code)](https://marketplace.visualstudio.com/items?itemName=paiqo.databricks-vscode)
[![Installs](https://vsmarketplacebadge.apphb.com/installs/paiqo.databricks-vscode.svg?color=orange)](https://marketplace.visualstudio.com/items?itemName=paiqo.databricks-vscode)
[![Downloads](https://vsmarketplacebadge.apphb.com/downloads/paiqo.databricks-vscode.svg?color=orange)](https://marketplace.visualstudio.com/items?itemName=paiqo.databricks-vscode)

![Databricks-VSCode](/images/Databricks-VSCode.jpg?raw=true "Databricks-VSCode")

This is a Visual Studio Code extension that allows you to work with Databricks locally from VSCode in an efficient way, having everything you need integrated into VS Code - see [Features](#features). It allows you to manage and execute your notebooks, start/stop clusters, execute jobs and much more!

The extensions can be downloaded from the official Visual Studio Code extension gallery: [Databricks VSCode](https://marketplace.visualstudio.com/items?itemName=paiqo.databricks-vscode)

# Features

- [Workspace Manager](#workspace-manager)
  - Up-/download of notebooks and whole folders
  - Compare/Diff of local vs online notebook
  - Support for [Code Cells](https://code.visualstudio.com/docs/python/jupyter-support-py#_jupyter-code-cells) if you do not want to use the .ipynb format
- [Cluster Manager](#cluster-manager)
  - Start/stop clusters
  - Script cluster definition as JSON
- [Notebook Kernel](#notebook-kernel)
  - Execute local code against a running Databricks cluster
  - interactive cell-by-cell execution as in Databricks web UI
  - rich output and visualization of results
- [File System Integration](#file-system-integration)
  - integrate DBFS and Databricks Workspace/notebooks next to your local file system
  - easy drag&drop between local, DBFS and also workspace/notebooks!
  - similar, well-known UI; same behavior as if DBFS and workspace/notebooks existed locally
- [Connection Manager](#connection-manager)
  - Easy configuration via standard VS Code settings
  - Manage and switch between multiple Databricks workspaces (e.g. DEV/TEST/PROD)
  - Supports Azure Databricks, Databricks on AWS and Dtabricks on GCP
  - control how notebooks are downloaded (Jupyter notebook, source code, ...)
  - various other settings
- [SQL / Data Browser](#sql-browser)
  - Browse availabl SQL objects from the Databricks metastore
  - databases, tables and views, columns, ...
- [Job Manager](#job-manager)
  - Start/stop jobs
  - View job-run history + status
  - Script job definition as JSON
  - View job-run output as JSON
- [DBFS Browser](#dbfs-browser)
  - Supports static mount points (e.g. using Service Principals)
  - Up-/Download of files
- [Secret Manager](#secret-manager)
  - Create/delete secret scopes
  - Create/delete secrets
  - view Azure Key Vault backed secret scopes
- [Repo Manager](#repo-manager)
  - Create/delete linked repositories
  - Update repository to repo or branch
- Integration for CI/CD using [DatabricksPS](https://www.powershellgallery.com/packages/DatabricksPS) PowerShell module

# Release Notes

**v1.2.1:**
- added `Restart Kernel` to Databricks notebooks
- added details specs of cluster to Notebook Kernel selector
- fixed an issue with `%run` and absolute paths ([#93](/../../issues/93))
- fixed an issue with `Files in Repos` ([#101](/../../issues/101))
- fixed an issues with CLI Connection Manager ([#99](/../../issues/99))
- fixed an issue when up-/downloading whole folders recursively in [Workspace Manager](#workspace-manager)
- prepare to make extension work in the web
  - reworked API connection to use generic [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) instead of Axios library
  - added build config for web-extension
  - removed all external dependencies

**v1.1.4:**
- added support for `dbutils.notebook.run` in Live-mode (via mounting `dbws:/...` in VSCode workspace)
- fixed some issues with legacy DBFS and Workspace browser
- fixed an issue with workspace browser file compare
- fixed an issue when opening a job in the browser
- fixed issue where Repo Manager did not use pagination of the API and hence did not show more than 20 entries

**v1.1.3:**
- added support for `%run` in notebooks
- added auto-refresh for new notebook kernels

**v1.1.2:**
- make [File System Integration](#file-system-integration) work without non-notebook files (e.g. Files in Repos)

**v1.1.1:**
- make [File System Integration](#file-system-integration) work without having to open the Databricks tab first
- fixed issues with [File System Integration](#file-system-integration)
  - folders with a single sub-folder only now work
  - fixed an issue where Repos did not work/could not be browsed properly
- switch focus to VSCode Explorer when adding DBFS/Workspace to the VSCode workspace
- added `Pull` Button to the [Repo Manager](#repo-manager) to pull the latest changes from Git
- added proper HTML output for notebooks/executions that returned HTML as plain text
- fixed issue with [Workspace Manager](#workspace-manager) where files could not be downloaded properly anymore

**v1.1.0:**
- added File System APIs for `dbfs:/` (same as in Databricks) and also `dbws:/` for the workspace/notebooks
- added support for [Files in Repos](https://docs.databricks.com/repos/work-with-notebooks-other-files.html)
- fixed issue with `Execute All Cells` in notebook kernel
- fixed issue with multiple notebooks connected to the same kernel
- added packaging of the source code with webpack for improved loading times

**v1.0.0:**
- added support for [Notebook Kernel](#notebook-kernel) to allow execution of code on the Databricks cluster from within VSCode notebooks
- major improvements for useability and user-interaction
- performance improvements when refreshing tree-views
- improved logging and output of messages
- use native VSCode icons instead of custom ones

**v0.9.4:**
- added support for VS Code setting `http.proxyStrictSSL` to optionally allow invalid certificates from the proxy. Can only be used in combination with `http.proxySupport = "on"`.
- use VS Code native secret management instead of `KeyTar`
- update Dev Dependencies to VS Code 1.66
- fix minor issue with SQL Browser refresh
- support for environment variables in `localSyncFolder`

**v0.9.3:**
- added `Copy Path` feature for Workspace and DBFS browser
- added Folders for Repositories as in the Databricks Web UI

**v0.9.2:**
- Make use of Databricks [Jobs API v2.1](https://docs.databricks.com/dev-tools/api/latest/jobs.html)

**v0.9.1:**
- fix issue when opening `.ipynb` files/notebooks

**v0.9.0:**
- Added support for [Repos API](https://docs.databricks.com/dev-tools/api/latest/repos.html)
- added new Repos tab
- switching branches
- deleteing a repo

**v0.8.9:**
- add support to list regular files from Git repositories. Up-/Download is not yet supported by the underlying API

**v0.8.8:**
- fix issues with Databricks running on GCP

**v0.8.7:**
- fix issue with repositories in workspace

**v0.8.6:**
- added support for Databricks CLI profiles
  - use Databricks CLI profiles to manage connections
  - support `DATABRICKS_CONFIG_FILE` for custom config file locations
- further improvements to the SQL Data browser
  - Show Definition
  - Datatypes for columns including complex columns (array, struct, map)
  - Table and column comments
  - improved tooltips and desciption
- improved tooltip for Connections
- fixed an issue with upload of whole workspace folders
- fixed an issue with Azure KeyVault secret scopes

**v0.8.0:**
- add SQL Data browser as in the Databricks UI
- fixed an issue with Secrets - you can now add/delete secrets again

# Outlook upcoming/planned features
- Support for Drag&Drop of local files directly into the workspace
- Fix remaining issues with Notebook Kernel and code cells
- whatever is requested by the users :)

# Installation
The extension can be downloaded directly from within VS Code. Simply go to the Extensions tab, search for "Databricks" and select and install the extension "Databricks VSCode" (ID: paiqo.databricks-vscode).

Alternatively it can also be downloaded the `.vsix` directly  from the VS Code marketplace: [Databricks VSCode](https://marketplace.visualstudio.com/items?itemName=paiqo.databricks-vscode).

# Setup and Configuration (VSCode Connection Manager)
The configuration happens directly via VS Code by simply [opening the settings](https://code.visualstudio.com/docs/getstarted/settings#_creating-user-and-workspace-settings)
Then either search for "Databricks" or expand Extensions -> Databricks.
The settings themselves are very well described and it should be easy for you to populate them. Also, not all of them are mandatory! Some of the optional settings are experimental or still work in progress.
To configure multiple Databricks Connections/workspaces, you need to use the JSON editor and add them to `databricks.connections`:

``` json
		...
		"databricks.connectionManager": "VSCode Settings",
		"databricks.connections": [
			{
				"apiRootUrl": "https://adb-98765421987.65.azuredatabricks.net",
				"displayName": "My DEV workspace",
				"localSyncFolder": "c:\\Databricks\\dev",
				"personalAccessToken": "dapi219e30212312311c672bbbbbbbbbb"
			},
			{
				"apiRootUrl": "https://adb-123456789123.45.azuredatabricks.net",
				"displayName": "My TEST workspace",
				"localSyncFolder": "c:\\Databricks\\test",
				"personalAccessToken": "dapi219e30212312311c672aaaaaaaaaa"
			}
		],
		...
```

The `localSyncFolder` is the location of a local folder which is used to download/sync files from Databricks and work with them locally (notebooks, DBFS, ...). It also supports environment variables - e.g. `%USERPROFILE%\\Databricks` or `~\\Databricks`.
The sensitive values entered like `personalAccessToken` will be safely stored in the system key chain/credential manager (see `databricks.sensitiveValueStore`) once the configuration is read the first time. This happens if you open the extension.
Existing connections can be updated directly in VSCode settigns or via the JSON editor. To update a `personalAccessToken`, simply re-enter it and the extension will update it in the system key chain/credential manager.
The only important thing to keep in mind is that the `displayName` should be unique on the whole machine (across all VSCode workspaces) as the `displayName` is used to identify the `personalAccessToken` to load from the system key chain/credential manager.

Another important setting which requires modifying the JSON directly are the export formats which can be used to define the format in which notebooks are up-/downloaded. Again, there is a default/current setting ```databricks.connection.default.exportFormats``` and it can also configured per Connection under `databricks.connections`:

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

Each filetype can either be exported as raw/source file (.scala, .py, .sql, .r) or, if supported, also as a notebook (.ipynb). This is also very important if you want to upload a local file as these also have to match these extension and will be ignored otherwise! For active development it is recommended to use `.ipynb` format as this also allows you to execute your local code against a running Databricks cluster - see [Notebook Kernel](#notebook-kernel).

If you prefer raw/source files (e.g. for better Git integration), you may also consider using [Code Cells](https://code.visualstudio.com/docs/python/jupyter-support-py#_jupyter-code-cells) be setting ```"useCodeCells" = true``` for your corresponding connection. Please be aware that this does currently not work properly with the [Notebook Kernel](#notebook-kernel)!

All these settings can either be configured on a global/user or on a workspace level. The recommendation is to use workspace configurations and then to include the localSyncFolders into your workspace for easy access to your notebooks and sync to GIT.
Using a workspace configuration also allows you separate differnt Databricks Connections completely.

**NOTE: Changing any of the connection settings only take effect once the connection is activated! If you make changes to your current connection, you need to activate another connection temporary and then the original one again! Alternatively, a restart of VSCode also works.**

# Setup and Configuration (Databricks CLI Connection Manager)
To use the Databricks CLI Connection Manager, you first need to install and configure the [Databricks CLI](https://docs.databricks.com/dev-tools/cli/index.html). Once you have created a connection or profiles, you can proceed here.
Basically all you need to do in VSCode for this extension to derive the connections from the Databricks CLI is to change the VSCode setting `databricks.connectionManager` to `Databricks CLI Profiles`. This can be done in the regular settings UI or by modifying the settings JSON directly.

## Additional settings
In order to work to its full potential, the VSCode extension needs some addional settings which are not maintained by the Databricks CLI. Foremost the `localSyncFolder` to store files locally (e.g. notebooks, cluster/job definitions, ...). For the Databricks CLI Connection Manager this path defaults to `<user home directory>/DatabricksSync/<profile name>`.
If you want to change this you can do so by manually extending your Databricks CLI config file which can usually be found at `<user home directory>/.databrickscfg`:

``` text
[DEV]
host = https://westeurope.azuredatabricks.net/
token = dapi219e30212312311c6721a66ce879e
localSyncFolder = D:\Desktop\sync\dev

[TEST]
host = https://westeurope.azuredatabricks.net/
token = dapi219e30212312311c672aaaaaaaaaa
localSyncFolder = D:\Desktop\sync\test
localSyncSubfolders = {"Workspace": "Workspace","Clusters": "Clusters","DBFS": "DBFS","Jobs": "Jobs"}
exportFormats = {"Scala": ".scala","Python": ".ipynb","SQL": ".sql","R": ".r"}
useCodeCells = true
```

You can also change the following other settings:

|CLI setting|VSCode setting|format|descrption|
|-----------|--------------|------|----------|
|host|apiRootUrl|text|mandatory by Databricks CLI|
|token|personalAccessToken|text|mandatory by Databricks CLI|
|localSyncFolder|localSyncFolder|text|optional, defaults to `<user home directory>/DatabricksSync/<profile name>`|
|localSyncSubFolders|localSyncSubfolders|JSON|optional, defaults to VSCode default|
|exportFormats|exportFormats|JSON|optional, defaults to VSCode default|
|useCodeCells|useCodeCells|boolean|true/false|

# Connection Manager
![Connection Manager](/images/ConnectionManager.jpg?raw=true "Connection Manager")

You can either work with a single Connection or configure multiple Connections. If you use multiple Connections, you will see your list in the Connections view and icons indicating which one is currently active. To change the Connection, simply click the "Activate" button next to an inactive Connection. All other views will update automatically.

To change an existing connection - please see [Setup and Configuration](#setup-and-configuration-vscode-connection-manager))

# Workspace Manager
![Workspace Manager](/images/WorkspaceManager.jpg?raw=true "Workspace Manager")

The Workspace Manager connects directly to the Databricks workspace and loads the whole folder strucuture. It displays folders, notebooks and libraries. Notebooks and folders can be up- and downloaded manually by simply clicking the corresponding item next them. If you do an up-/download on a whole folder or on the root, it will up-/download all items recursively.
The files are stored in the ```databricks.connection.default.localSyncFolder``` (or your Connection) that you configured in your settings/for your Connection. If you doubleclick a file, it will be downloaded locally and opened. Depending on the ExportFormats that you have defined in ```databricks.connection.default.exportFormats``` (or your Connection), the item will be downloaded in the corresponding format - basically you can decide between Notebook format and raw/source format.
The downloaded files can then be executed directly against the Databricks cluster if Databricks-Connect is setup correctly ([Setup Databricks-Connect on AWS](https://docs.databricks.com/dev-tools/databricks-connect.html), [Setup Databricks-Connect on Azure](https://docs.microsoft.com/en-us/azure/databricks/dev-tools/databricks-connect))

The up-/downloaded state of the single items are also reflected in their icons:
![Workspace Manager Icons](https://github.com/paiqo/Databricks-VSCode/blob/master/images/WorkspaceManager_Icons.jpg?raw=true "Workspace Manager Icons")

If you have set ```useCodeCells = true``` in your connection, the Code Cells will be added once you download a raw/source file. They will not be removed again when you upload the raw/source file again!

**NOTE: The logic is currently not recursive - if a folder exists online and locally, does not mean that also all sub-folders and files exist online and locally!**

- A small red dot at the top right of an item indicates that it only exists online in the Databricks workspace but has not yet been downloaded to the ```localSyncFolder``` into the subfolder ```Workspace```.
- A small blue dot at the bottom right of an item indicates that it only exists locally but has not yet been uploaded to the Databricks workspace. Please note that only local files that match the file extensions defined in ```exportFormats``` will be considered for an upload. For all other files you will see a warning in VS Code.
- If there is no blue or red dot in the icon then the file/folder exists locally and also in the Databricks workspace. However, this does not mean that the files have to be in sync. It is up to you to know which file is more recent and then sync them accordingly!

# Cluster Manager
![Cluster Manager](/images/ClusterManager.jpg?raw=true "Cluster Manager")

This extension also allows you to manage your Databricks clusters directly from within VS Code. So you do not need to open the web UI anymore to start or stop your clusters. It also distinguishes between regular clusters and job clusters which will be displayed in a separate folder.
In addition, the Cluster Manager also allows you to script the definition of your cluster and store it locally - e.g. if you want to integrate it as part of your CI/CD. This cluster definition file can for example be used with the [DatabricksPS PowerShell Module](https://www.powershellgallery.com/packages/DatabricksPS) to automate the cluster deployment.
The cluster manager also distinguishes between regular user-created clusters and job-clusters.

# Notebook Kernel
![Notebook Kernel](/images/NotebookKernel.jpg?raw=true "Notebook Kernel")

Using Databricks Notebook Kernels you can execute local code againt a running Databricks cluster. Simply open a `.ipynb` notebook and select the Databricks kernel of your choice. A new kernel will be added automatically for each Databricks cluster that is currently running. In case you need to restart the kernel, you can do so by right-clicking the underlying cluster in the [Cluster Manager](#cluster-manager) and select `Restart Databricks Kernel`.
The execution of the first cell may take a bit longer as the remote execution context has to be set up before any commands can be executed. The notebook kernel supports the magics `%sql`, `%python`, `%r`, `%scala`, `%md` and also `%pip`. Depending on the output of the cell, the results are rendered accordingly - e.g. as text, as table or as image. Due to the limitations of the underlying APIs, the output is limited to one output type so you should avoid mixing `print(...)`, `display(df)` and `df.plot` as only one of them will be show.
If you need richer output especially for tables, you can install additional Notebook Renderer Extensions. We recommend [vscode-data-table](https://github.com/RandomFractals/vscode-data-table). Unfortunately the author decided to unpublish the extension from the offical VSCode market place but it can still be downloaded the `.vsix` from the [Github Releases](https://github.com/RandomFractals/vscode-data-table/releases)

# File System Integration
![File System Integration](/images/FileSystemIntegration.jpg?raw=true "File System Integration")

The File System Integration allows you to mount DBFS and the Databricks workspace/notebooks directly into your VSCode Explorer. You can simply open (or preview) all files and also save them back as if the files were local. So no local copy of your notebooks is necessary anymore but you can work with the files from the Databricks workspace directly. Everything happens automatically - when you open a file, it is downloaded, when you save it, it is uploaded again.

# SQL Browser
![SQL Browser](/images/SQLBrowser.jpg?raw=true "SQL Browser")

The SQL Browser is similar to the Data tab in the Databricks Web UI. It shows you all object that exist in the Hive metastore. To use the SQL Browser you first need to have a running cluster as the Hive metastore can only be browsed via a cluster. By default, the first running cluster is selected for you automatically. However, you can also change the cluster you want to use in the [Cluster Manager](#cluster-manager) by right-clicking the cluster of your choice and clicking `Use for SQL Browser`.
For large databases with a lot of tables, it can take quite some time to load all details so please be patient! This is because once you expand a database, the definition of all its tables are queried one by one to get and show all relevant information in the SQL browser then.

# Job Manager
![Job Manager](/images/JobManager.jpg?raw=true "Job Manager")

The Job Manager allows you to manage all your existing Databricks jobs from within VS Code. It gives you information about currently deployed jobs and their different job-runs/executions. You can also start and stop new job-runs which will then be executed on the cluster. Similar to the Cluster Manager, you can also script the jobs to integrate them in automated CI/CD deployment pipelines using the [DatabricksPS PowerShell Module](https://www.powershellgallery.com/packages/DatabricksPS).

# DBFS Browser
![DBFS Browser](/images/DBFSBrowser.jpg?raw=true "DBFS Browser")

The DBFS Browser allows you to browse the whole Databricks File System including mountpoints! You can also download files, view or modify them locally and upload them again. For viewing files I highly recommend installing the extension [Data Preview](https://marketplace.visualstudio.com/items?itemName=paiqo.databricks-vscode) as it supports most formats communly used with Databricks.
Clicking a file will download it to yout TEMP folder and open it in VS Code. If you download it explicitly using the icon next to the item, you will be asked where to save it locally.

**NOTE: The DBFS Browser also supports browsing of mount points if they were configured with a static authentication (e.g. an Azure Service Principal)!**

# Secret Manager
![Secret Browser](/images/SecretBrowser.jpg?raw=true "Secret Browser")

Another tool to help you working with Databricks locally is the Secrets Browser. It allows you to browse, create, update and delete your secret scopes and secrets.
This can come in handy if you want to quickly add a new secret as this is otherwise only supported using the plain REST API (or a CLI)!

# Repo Manager
![Repo Manager](/images/RepoManager.jpg?raw=true "Repo Manager")

Using the Repo Manager you can interact with the Repos API which allows you to add new repositories to the Databricks workspace and also update/check-out specific branches and tags. The latest branch/tag can then be found via the [Workspace Manager](#workspace-manager)

## FAQ

**Q:** I cannot execute the downloaded notebooks against the Databricks cluster - what shall I do?

**A:** This extension allows you to manage your Databricks workspace via the provided REST API (up-/download notebooks, manage jobs, clusters, ..., etc. ). The interactive execution part of this extension. To execute a local code on an existing Databricks cluster please use [Databricks-Connect](https://docs.databricks.com/dev-tools/databricks-connect.html) - the official tool from DAtabricks to do this. These two tools are not directly related to/dependent on each other but work very well together and it makes sense to set them up together.

**Q:** What can I do if none of the tabs/browsers is showing anything?

**A:** This is very likely an issue with the connection. Please make sure that especially `apiRootUrl` and `personalAccessToken` are set correctly. If you are sure th values are correct, please check the logs in the output window and filter for this extension.

**Q:** I just upgraded (or was upgraded automatically) to v0.7.0 and all my connections are lost. What shall I do?

**A:** No worries, this is _by design_. To restore your existing connections please open the [User Settings](https://code.visualstudio.com/docs/getstarted/settings) and edit them in JSON. There is a button at the top right that opens the JSON editor. You will find the property `databricks.userWorkspaceConfigurations` which contains a list of all VSCode workspaces that were used in combination with this extension. Search the one you want to restore and copy the `connections` property. Restore it in your existing workspace settings as `databricks.connections`. The next time you open the workspace again, it will read the settings from `databricks.connections`, extract the sensitive values and store them safely in the system key chain/credential manager. Once this is working, you can remove the original `databricks.userWorkspaceConfigurations`.

**Q:** My Personal Access Token (PAT) changed, how can I update my connection?

**A:** Whenever the property `personalAccessToken` is provided, it will be used and updated in the system key chain/credential manager. Once it is savely stored there, it will be removed again from the VSCode configuration.
