# VSCode Extension for Databricks
[![Version](https://vsmarketplacebadges.dev/version/paiqo.databricks-vscode.svg?color=blue&style=?style=for-the-badge&logo=visual-studio-code)](https://marketplace.visualstudio.com/items?itemName=paiqo.databricks-vscode)
[![Installs](https://vsmarketplacebadges.dev/installs/paiqo.databricks-vscode.svg?color=yellow)](https://marketplace.visualstudio.com/items?itemName=paiqo.databricks-vscode)
[![Downloads](https://vsmarketplacebadges.dev/downloads/paiqo.databricks-vscode.svg?color=yellow)](https://marketplace.visualstudio.com/items?itemName=paiqo.databricks-vscode)
[![Ratings](https://vsmarketplacebadges.dev/rating/paiqo.databricks-vscode.svg?color=green)](https://marketplace.visualstudio.com/items?itemName=paiqo.databricks-vscode)

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
  - Open in OS File Explorer
- [Notebook Kernel](#notebook-kernel)
  - Execute local code against a running Databricks cluster
  - interactive cell-by-cell execution as in Databricks web UI
  - rich output and visualization of results
  - support for [Widgets](#widgets)
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
  - Load Databricks directly from your Azure Account
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

# [Change Log](./CHANGELOG.md)

# Installation
The extension can be downloaded directly from within VS Code. Simply go to the Extensions tab, search for "Databricks" and select and install the extension "Databricks VSCode" (ID: paiqo.databricks-vscode).

Alternatively it can also be downloaded the `.vsix` directly  from the VS Code marketplace: [Databricks VSCode](https://marketplace.visualstudio.com/items?itemName=paiqo.databricks-vscode).

Preview-Versions might also be available via github [Releases](https://github.com/paiqo/Databricks-VSCode/releases) from this repository.

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
Using a workspace configuration also allows you to separate different Databricks Connections completely - e.g. for different projects.

**NOTE: Changing any of the connection settings only take effect once the connection is activated! If you make changes to your current connection, you need to activate another connection temporary and then the original one again! Alternatively, a restart of VSCode also works.**

# Setup and Configuration (Databricks CLI Connection Manager)
To use the Databricks CLI Connection Manager, you first need to install and configure the [Databricks CLI](https://docs.databricks.com/dev-tools/cli/index.html). Once you have created a connection or profiles, you can proceed here.
Basically all you need to do in VSCode for this extension to derive the connections from the Databricks CLI is to change the VSCode setting `databricks.connectionManager` to `Databricks CLI Profiles`. This can be done in the regular settings UI or by modifying the settings JSON directly.

## Additional settings
In order to work to its full potential, the VSCode extension needs some addional settings which are not maintained by the Databricks CLI. Foremost the `localSyncFolder` to store files locally (e.g. notebooks, cluster/job definitions, ...). For the Databricks CLI Connection Manager this path defaults to `<user home directory>/Databricks-VSCode/<profile name>`.
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
|host|apiRootUrl|text/URL|mandatory by Databricks CLI|
|token|personalAccessToken|text|mandatory by Databricks CLI|
|localSyncFolder|localSyncFolder|text|optional, defaults to `<user home directory>/Databricks-VSCode/<profile name>`|
|localSyncSubFolders|localSyncSubfolders|JSON|optional, defaults to VSCode default|
|exportFormats|exportFormats|JSON|optional, defaults to VSCode default|
|useCodeCells|useCodeCells|boolean|true/false|

# Setup and Configuration (Azure Connection Manager)
The Azure Connection Manager allows you to use your Azure Active Directory (AAD) account to interact with Databricks. This includes:
- loading Connections directly from your Azure Resources
- Use AAD authentication when using the Databricks API. No Personal Access Token (PAT) is needed!

VSCode will prompt you to use your Microsoft Account two times. The first time is to get a list of all available Azure Databricks workspaces that you have access to and then a second time to establish a connection to the selected/active workspace. Whenever you switch connection/workspace, you may get prompted again!

To activate the Azure Connection Manager, simply set the VSCode setting `databricks.connectionManager` to `Azure` and refresh your connections. No additional configurations need to be done. Currently most other connection settings like `useCodeCells`, `exportFormats`, etc. cannot currently be controlled and are set to their defaults.

The following Azure-specific settings exist and can be set in the workspace settings:
- `databricks.azure.tenantId`
- `databricks.azure.subscriptionIds`
- `databricks.azure.workspaces`

They are documented via VSCode settings documentation.

# Setup and Configuration (Databricks Extension Connection Manager)
This connection manager leverages the [official Databricks extensions](https://marketplace.visualstudio.com/items?itemName=databricks.databricks) to establish a connection with your Databricks workspace. It only supports a single connection hence the actual Connection Manager tab will be hidden for this connection manager.
It also derives the cluster automatically from the Databricks extensions to source the [SQL Browser](#sql-browser) but also allows you to change it directly from the [Cluster Manager](#cluster-manager) using the `Attach cluster` command.  

# Connection Manager
![Connection Manager](/images/ConnectionManager.jpg?raw=true "Connection Manager")

The extension supports various connection managers and the list can be easily extended. At the moment these connecton managers exist:
- [VSCode Settings](#setup-and-configuration-vscode-connection-manager)
- [Databricks CLI](#setup-and-configuration-databricks-cli-connection-manager)
- [Azure](#setup-and-configuration-azure-connection-manager)
- [Databricks Extensions](#setup-and-configuration-databricks-extensions-connection-manager)
- `Manual` where you are simply prompted to enter connection information at the start of your session.

You can specify the one to use by setting the VSCode setting `databricks.connectionManager`.
Once the extension loads, you will see your list in the Connections view and icons indicating which one is currently active (the green one). To change the Connection, simply click the `[Activate]` button next to an inactive Connection. All other views will update automatically.

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

Using Databricks Notebook Kernels you can execute local code againt a running Databricks cluster. Simply open a `.ipynb` notebook and select the Databricks kernel of your choice. A new kernel will be added automatically for each Databricks cluster that is currently running. In case you need to restart the kernel, you can do so by right-clicking the underlying cluster in the [Cluster Manager](#cluster-manager) and select `Restart Databricks Kernel` or use the `Restart Kernel` button from the toolbar.
The execution of the first cell may take a bit longer as the remote execution context has to be set up before any commands can be executed. The notebook kernel supports the magics `%sql`, `%python`, `%r`, `%scala`, `%md`, `%run` and also `%pip`. Depending on the output of the cell, the results are rendered accordingly - e.g. as text, as table or as image. Due to the limitations of the underlying APIs, the output is limited to one output type so you should avoid mixing `print(...)`, `display(df)` and `df.plot` as only one of them will be shown.
For better visualization of tabluar results this extension includes a dependency to the extension [vscode-data-table](https://github.com/RandomFractals/vscode-data-table) which offers much more features than the standard visualizations.

Notebook Kernels also support other features like [Files in Repo](https://docs.databricks.com/_static/notebooks/files-in-repos.html) to build libraries within your repo, [_sqldf](https://docs.databricks.com/notebooks/notebooks-use.html#explore-sql-cell-results-in-python-notebooks-natively-using-python) to expose results of SQL cells to Python/Pyspark, `%run` to run other notebooks inline with the current notebook and also [dbutils.notebook.run()](https://docs.databricks.com/dev-tools/databricks-utils.html#notebook-utility-dbutilsnotebook).

Whenever a notebook is opened from either the local sync folder or via the [Virtual File System](#file-system-integration) using `wsfs:/` URI, the Databricks notebook kernels are the preferred ones and should appear at the top of the list when you select a kernel.

## Execution Modes
We distinguish between Live-execution and Offline-execution. In Live-execution mode, files are opened directly from Databricks by mounting the Databricks Workspace into your VSCode Workspace using `wsfs:/` URI scheme. In this mode there is no intermediate local copy but you work directly against the Databricks Workspace. Everything you run must already exist online in the Databricks Workspace.

This is slightly different in Offline-execution where all files you want to work with need to be synced locally first using the [Workspace Manager](#workspace-manager). This is especially important when it comes `%run` which behaves slightly differntly compared to Live-execution mode. `%run` in Offline-execution runs the code from your local file instead of the code that exists in Dtabricks online!
Other commands like `dbutils.notebook.run()` always use the code thats currently online so if you have changed the refernced notebook locally, you have to upload it first. This is simply because we cannot easily replicate the behavior of `dbutils.notebook.run()` locally!

## Widgets
The extension can also handle classic Databricks Widgets created using `dbutils.widgets.xxx()`. However, there are some limitations that might work slightly different than in the Databricks UI:
- creation and querying of widgets must happen in separate cells
- the cell that creates the widget must be executed before the cell that gets the value form the widget `dbutils.widgets.get("myWidget")`
- to display the options in VSCode, the expression has to be evaluated which can take some time, even for simple expressions
- widgets that are commented out might still get evaluated

To mitigate those limitations, we highly recommend to:
- put all code that creates widgets into a single cell at the beginning of your notebook
- put all code that reads the widgets into a separate cell

You can also update the values of all already loaded widgets at once using the `Update Widgets` button in the notebook toolbar. If you simply update the widgets, they will not be re-evaluated (in case they are dynamic)! To re-evaluated them, you need to run the cell(s) where the widget(s) are created again.

# File System Integration
![File System Integration](/images/FileSystemIntegration.jpg?raw=true "File System Integration")

The File System Integration allows you to mount DBFS and the Databricks workspace/notebooks directly into your VSCode Explorer. You can simply open (or preview) all files and also save them back as if the files were local. So no local copy of your notebooks is necessary anymore but you can work with the files from the Databricks workspace directly. Everything happens automatically - when you open a file, it is downloaded, when you save it, it is uploaded again.
This integration also allows easy drag&drop between the different file systems, including the local file system!
You want to upload a local notebook to the Databricks workspace? Simply drag&drop it!
You want to download a file from DBFS? Simply drag&drop it!

There are two virtual file systems that come with this extension:
- `wsfs:/` to access your notebook from the DAtabricks workspace
- `dbws:/` (LEGACY) - to be replaced by `wsfs:/` in the long term
- `dbfs:/` to access files on the Databricks File System (DBFS) - similar to the [DBFS Browser](#dbfs-browser)

# SQL Browser
![SQL Browser](/images/SQLBrowser.jpg?raw=true "SQL Browser")

The SQL Browser is similar to the Data tab in the Databricks Web UI. It shows you all object that exist in the Hive metastore. To use the SQL Browser you first need to have a running cluster as the Hive metastore can only be browsed via a cluster. By default, the first running cluster is selected for you automatically. However, you can also change the cluster you want to use in the [Cluster Manager](#cluster-manager) by right-clicking the cluster of your choice and clicking `Use for SQL Browser`.
For large databases with a lot of tables, it can take quite some time to load all details so please be patient! This is because once you expand a database, the definition of all its tables are queried one by one to get and show all relevant information in the SQL browser then.

# Job Manager
![Job Manager](/images/JobManager.jpg?raw=true "Job Manager")

The Job Manager allows you to manage all your existing Databricks jobs from within VS Code. It gives you information about currently deployed jobs and their different job-runs/executions. You can also start and stop new job-runs which will then be executed on the cluster. Similar to the Cluster Manager, you can also script the jobs to integrate them in automated CI/CD deployment pipelines using the [DatabricksPS PowerShell Module](https://www.powershellgallery.com/packages/DatabricksPS).

# DBFS Browser
![DBFS Browser](/images/DBFSBrowser.jpg?raw=true "DBFS Browser")

The DBFS Browser allows you to browse the whole Databricks File System including mountpoints! You can also download files, view or modify them locally and upload them again. For viewing files I highly recommend installing the extension [Data Preview](https://marketplace.visualstudio.com/items?itemName=RandomFractalsInc.vscode-data-preview) as it supports most formats commonly used with Databricks.
Clicking a file will open it as a temporary file in VS Code. If you download it explicitly using the icon next to the item, it will be stored locally in the DBFS folder of your `localSyncFolder`.

**NOTE: The DBFS Browser also supports browsing of mount points if they were configured with a static authentication (e.g. an Azure Service Principal)!**

# Secret Manager
![Secret Browser](/images/SecretBrowser.jpg?raw=true "Secret Browser")

Another tool to help you working with Databricks locally is the Secrets Browser. It allows you to browse, create, update and delete your secret scopes and secrets.
This can come in handy if you want to quickly add a new secret as this is otherwise only supported using the plain REST API (or a CLI)!

# Repo Manager
![Repo Manager](/images/RepoManager.jpg?raw=true "Repo Manager")

Using the Repo Manager you can interact with the Repos API which allows you to add new repositories to the Databricks workspace and also update/check-out specific branches and tags. The latest branch/tag can then be found via the [Workspace Manager](#workspace-manager)

## FAQ

**Q:** What can I do if none of the tabs/browsers is showing anything?

**A:** This is very likely an issue with the connection. Depending on the [Connection Manager](#connection-manager), please make sure that all relevant fields, especially `apiRootUrl` and `personalAccessToken` are set correctly. If you are sure the values are correct, please check the logs in the output window and filter for `paiqo.databricks-vscode` to see the log outputs for this extension.

**Q:** My Personal Access Token (PAT) changed, how can I update my connection?

**A:** Whenever the property `personalAccessToken` is provided, it will be used and updated in the system key chain/credential manager. Once it is savely stored there, it will be removed again from the VSCode configuration.
