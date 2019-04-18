# Introduction
Odin is a framework for building web applications for M3, that consists of three parts:
- A command line interface (CLI), 'odin' that is used to create new projects and perform other development related tasks such as running a development server and building the project for production.
- Core API without any Angular dependencies that only requires RxJS
- Angular services for M3 related functions such as: executing MI programs and bookmarks, retrieving user context and launching programs in H5 (the M3 client) if the application is running in a tab in H5.

Odin is not a framework of UI components nor does it require the application developer to use a specific UI framework. There is however optional support for the Infor SoHo Xi controls using jQuery or Angular as well as Google Material.

# Content

* [Packages](#packages)
* [CLI installation](#cli-install)
* [Quickstart](#quick-start)
* [Projects](#projects)
* [Samples](#samples)
* [API Documentation](#api-documentation)
* [Code Editor](#code-editor)
* [Build](#build)
* [Install in H5 (Infor M3)](#install)
* [Code Examples](#code-examples)

# <a id="packages"></a> Packages
The M3 Odin SDK consists of three different NPM packages. The packages are published to the NPM registry and can be installed through npm. See more details about package installation in the following sections.

These are the names of the packages and their npm links:

- @infor-up/m3-odin-cli
   - https://www.npmjs.com/package/@infor-up/m3-odin-cli
- @infor-up/m3-odin
   - https://www.npmjs.com/package/@infor-up/m3-odi
- @infor-up/m3-odin-angular
   - https://www.npmjs.com/package/@infor-up/m3-odin-angular

# <a id="cli-install"></a> CLI installation
The M3 Odin CLI is a command line interface for creating and working with projects. The CLI needs to be installed before it can be used.

Run the following command to install the CLI globally on your local computer.

```
npm install -g @infor-up/m3-odin-cli
```

## Verify installation
Run the following command to verify that the CLI was installed successfully. The command should output the help for the CLI.

```
odin -h
```

# <a id="quick-start"></a> Quickstart
The M3 Odin CLI can be used to create different types of projects. The quickstart shows how to create an Angular application project using the Infor IDS (SoHo) components.

1. Navigate to a folder that should contain the project
2. Select a project name that adhere to the naming rules, we recommend characters and dashes (only, no space)
3. Run the 'odin new' command and answer all the questions in the wizard. Choose no (which is the default) when asked if dependencies should be installed. Other questions include values for M3 H5 URL and ION API URL.
   ```
   odin new
   ```
4. Navigate into the project folder and open a command window
5. Install dependencies for the application
   ```
   npm install
   ```
6. Start the project and access it in a browser using http://localhost:8080
   ```
   odin serve
   ```
7. Use an editor, for example Visual Studio Code, and start editing the code. Locate /src/app.component.html or /src/app.component.ts and start to do changes. The application will be automatically re-loaded in the browser.

# <a id="projects"></a> Projects
The M3 Odin CLI can be used to create different types of projects that includes different frameworks and functionality.

## Project names
Note that the project names must adhere to the rules for the name property of a package.json file. A summary of the rules are that the name must start with a character, only contain lower case characters that are URL safe. We would recommend sticking to characters and dashes. More details about names can be found here https://docs.npmjs.com/files/package.json#name

## New task  wizard
Navigate to the folder that should contain the project and open a command interface.
Run the following command to start the task wizard that can be used for the following;
- Create a new project
- Start development server
- Build project for production

## Angular project with SoHo XI
Create a new project, where the project name will be the context root for the application if deployed in H5. Follow the wizard to create a new project.

```
odin new
```
The following information will be requested:
- The name of the project (note that it must follow the project name rules above)
- Which framework to use: Angular / None
   - Select: Angular
- Which style library to use: SoHo / Material Design / None.
   - Select: SoHo

## Simple project
Create a non Angular, plain vanilla web project.

```
odin new my-project-name
```

# <a id="api-documentation"></a> API Documentation
The generated API documentation can be viewed here:

https://infor-cloud.github.io/m3-h5-sdk/m3-odin/docs/

# <a id="code-editor"></a> Code Editor
We recommend Visual Studio Code (https://code.visualstudio.com/) but any editor can be used.

# <a id="samples"></a> Samples
The Odin framework has two sets of samples using Angular. The focus of the samples are not to showcase UI Components but to show how the Odin API is used.

As Odin has no UI preference the samples are available using two different UI Component systems:
- SoHo Xi (https://design.infor.com//)
- Angular Material (https://material.angular.io/)

SoHo Xi has two sets of components, one for jQuery and then those are wrapped into Angular SoHo Components. Please note that with Angular you should use the Angular components for SoHo.

The samples are packaged as two Angular application and available as m3-odin-sample-soho-2.0.0.zip and m3-odin-sample-material-2.0.0.zip. The sample zip files can be downloaded from this directory: https://github.com/infor-cloud/m3-h5-sdk/tree/master/m3-odin/samples

## How to run a sample
The sample are packaged as an application. To run it unzip the sample zip and run it as an application.
1. Unzip the sample
2. In the project folder run the following command
   ```
   npm install
   ```
3. Update the proxy configuration
   ```
   odin set ion-proxy https://ionserver/TENANT
   ```
   ```
   odin set m3-proxy https://m3server
   ```

4. For the ION API example to work the source has to be manually edited to provide the ION Token
5. Run the server
   ```
   odin serve
   ```
6. Browse to http://localhost:8080

# <a id="build"></a> Build
Run the following command to build the project for production. A zip will be created in the dist folder. Note that the name of the zip as the name will be used as the application name when uploaded in H5. You can change the name of the zip file if necessary.

```
odin build
```

# <a id="install"></a> Install in H5 (Infor M3)
This section describes how to install the application in the H5 client. It is required to be an M3UI-Administrator to have access to the H5 Administration.
Take the zip file in the dist folder created by the build command and upload it using the H5 Administration tool. The name of the zip file will be used as the path to the application.
- Open the Infor M3 H5 client
- Select Administrations Tools -> H5 Administration
- Go to the Applications tab
- Click Install and select the zip file to upload
- The application will be visible under Installed applications

## Test in H5 tab system
To open an installed application within the H5 tab system press Crtl+R and paste in the URL to the application.

```
/mne/apps/my-project-name
```

Antoher option is to go to Start to access the Start pages and add a page with a Custom menu widget in which it is possible to add a New link with the link set to /mne/apps/my-project-name.

# <a id="code-examples"></a> Code Examples
## User Context
The user context contains the information for the user in MNS150. The MIService will use and pass the current company as matrix parameters to the M3 MI programs unless specific CONO and DIVI are passed in the MIRequest. Keep the reference to the UserContext objkect and it will be
automatically updated if company and division are changed during the session.

It is recommended to load the UserContext as part of the application initialization.

```typescript
import { Component } from "@angular/core";
import { ArrayUtil, CoreBase, IUserContext } from "@infor/m3-odin";
import { UserService } from "@infor/m3-odin-angular";

@Component({
  templateUrl: "./user-context.component.html"
})
export class UserContextSampleComponent extends CoreBase {
  userContext = {} as IUserContext;

  constructor(private userService: UserService) {
    super("UserSampleComponent");
    this.userService.getUserContext().subscribe((userContext: IUserContext) => {
      this.userContext = userContext;
      const lang = userContext.currentLanguage;
      const divi = userContext.currentDivision;
      const cono = userContext.currentCompany;
      const usid = userContext.USID;
      this.logInfo("User context: " + usid + ", cono: " + cono + ", divi: " + divi + ", lang: " + lang);
    }, (errorContext: IUserContext) => {
      // Handle error
      this.logError(errorContext.errorMessage);
    });
  }
}
```

## Calling MI transactions
Call M3 MI transactions to list, change and get M3 data. By default the framework will pass matrix parameters (visible as part of the URL path) for the current company and division if the user context has been retrieved. The example below assumes that the user context has already been retreived in another component, thus it will be automatically available within the MIService without having to explicity call it.

To override those default values pass in CONO and DIVI in the MIRecord that is set as input on the MIRequest.

When creating the input (MIRecord) for the transaction there are a number of set methods that can be used to set string, date and numbers. The format of input data is import for date fields and numeric fields that may contain decimals. The date format for date fields must be "yyyyMMdd" and the decimal separator for decimal fields must be ".". There are several set functions on the MIRecord class that can be used to set input data on the correct format.

```typescript
let inputRecord = new MIRecord();
inputRecord.setString("CUNO", "ACME");
inputRecord.setDate("TEEC", new Date());
inputRecord.setNumberString("AGBG", 123123.123);
```

The MI transactions may return a lot of data. Always specify the output fields to increase performance and reduce bandwidth. In the example below customer details are retreived for a customer but only part of the available output fields will be used.

```typescript
import { Component, OnInit, ViewChild } from "@angular/core";
import { CoreBase, IMIRequest, IMIResponse, IUserContext, MIRecord } from "@infor/m3-odin";
import { MIService } from "@infor/m3-odin-angular";

@Component({
  templateUrl: "./customer.component.html"
})
export class CustomerSampleComponent extends CoreBase implements OnInit {

  constructor(private miService: MIService) {
    super("CustomerComponent");
  }

  ngOnInit() {
    this.getDetails();
  }


  private getDetails() {
    const inputRecord = new MIRecord();
    const customer = "ACME";
    inputRecord.setString("CUNO", customer);

    const request: IMIRequest = {
      program: "CRS610MI",
      transaction: "GetBasicData",
      record: inputRecord,
      outputFields: ["CUNM", "CUNO", "CUA1", "CUA2", "CUA3", "CUA4", "YREF", "CSCD"]
    };
    this.setBusy(true);
    this.miService.execute(request).subscribe((response: IMIResponse) => {
      this.setBusy(false);
      if (!response.hasError()) {
        this.logInfo("Customer Basic data for " + customer);
        const record: MIRecord = response.item as MIRecord;
        const address1 = record["CUA1"];
        const address2 = record["CUA2"];
        this.logInfo("Address 1 " + address1);
        this.logInfo("Address 2 " + address2);
      } else {
        this.handleError(response, customer);
      }
      // Handle error
    }, (response) => {
      this.setBusy(false);
      this.handleError(response, customer);
    });
  }

  private handleError(response: IMIResponse, customer: string): void {

    this.logWarning("MI transaction " + response.transaction + " failed");
    const errorCode = response.errorCode;
    const errorField = response.errorField;
    const errorMessage = response.errorMessage;

    let message = "Unable to get basic data for customer " + customer;
    if (errorCode === "WCU0203") {
      message = "The customer " + customer + " does not exist";
    }

    this.logError(message + " " + errorMessage);
  }
  ```

### Calling MI List transactions
List transactions are MI transactions that returns multiple rows. The result is returned as a MIResponse with an items property. These types of transactions requires that maxReturnedRecords is set. The default value is 100.

Always specify the output fields that are required so improve performance. On the response check for erros as the MI program might have replied with an errorCode for the transaction. The errorMessage will always be set if there is an error such as a more generic http error that will result in a call to the errorHandler.

There are two error scenarios that needs to be considered:
- The MI transaction returns an error (check for hasError() in the response)
- The HTTP call fails (the error handler will be called)


```typescript
import { Component, OnInit, ViewChild } from "@angular/core";
import { CoreBase, IMIRequest, IMIResponse, IUserContext, MIRecord } from "@infor/m3-odin";
import { MIService, UserService } from "@infor/m3-odin-angular";
import { SohoDataGridComponent } from "ids-enterprise-ng";

@Component({
  templateUrl: "./customer.component.html"
})
export class CustomerSampleComponent extends CoreBase implements OnInit {
  @ViewChild("customersDatagrid") datagrid: SohoDataGridComponent;

  datagridOptions: SohoDataGridOptions;
  items: any[] = [];
  isBusy = false;

  private userContext: IUserContext;

  constructor(private miService: MIService, private userService: UserService) {
    super("CustomerComponent");
    this.initGrid();
  }

  ngOnInit() {
    this.listItems();
  }

  private initGrid() {
    // ...
  }

  listItems() {
    if (this.isBusy) { return; }
    this.setBusy(true);
    const request: IMIRequest = {
      program: "CRS610MI",
      transaction: "LstByNumber",
      outputFields: ["CUNO", "CUNM", "CUA1", "CUA2"],
      maxReturnedRecords: 10,
	};

	// Start the list with record 1000, example of input
    const inputRecord: MIRecord = new MIRecord();
    inputRecord.setString("CUNM", "1000");
    request.record = inputRecord;

    this.miService.execute(request).subscribe((response: IMIResponse) => {
      this.setBusy(false);
      if (!response.hasError()) {
		this.items = response.items;
		//
        this.updateGridData();
      }
    }, (error) => {
      this.setBusy(false);
      // Handle error
    });
  }
```
