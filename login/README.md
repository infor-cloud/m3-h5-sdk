# Odin Multi-Tenant Login utility
This tool is used to handle authentication for the Odin CLI development proxy when targeting multi-tenant environments (`odin serve --multi-tenant`). The tool will let you log in to your environment, and configure the Odin CLI to use the appropriate Authorization headers and cookies for API requests.

## Installation
The executable and scripts to launch the program are contained in `OdinSDKMTLoginUtility.zip`. Unzip to any destination on your machine, no further installation is needed.

## Usage
1. Run `Launch M3 Only Login.cm` to start the tool.
2. Point the "Project Work Folder" setting to your Odin application folder (the one created with `odin new ...`).
3. Enter Tenant URL and M3 URL
4. Login
5. Run `odin serve --multi-tenant`
