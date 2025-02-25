# Coveo Quantic

## Using the Library
[How to use the Coveo Quantic Library](https://docs.coveo.com/en/quantic/latest/)

[Install Coveo Quantic as a Salesforce unlocked package](https://docs.coveo.com/en/quantic/latest/usage/#install-quantic)


## Contributing

### Create a Salesforce Developer Organization

- [Sign up](https://developer.salesforce.com/signup)
- Use your @coveo.com email account. The username can be anything.

### Setup SFDX CLI

[SFDX cli](https://developer.salesforce.com/tools/sfdxcli)

### Update SFDX CLI Plugins

- Run `sfdx plugins:install @salesforce/lwc-dev-server`
- Run `sfdx plugins:update`

### Install VSCode Extension

[vscode Salesforce Extension Pack](https://marketplace.visualstudio.com/items?itemName=salesforce.salesforcedx-vscode)

**Note** Make sure you open the quantic project at the root (`/packages/quantic/`) in vscode in order for the entension to work properly.

### Enable Dev Hub in Your Salesforce Organization

- Connect to your salesforce developer organization [login](http://login.salesforce.com/)
- From Setup, enter Dev Hub in the Quick Find box and select Dev Hub.
- To enable Dev Hub, click Enable

### Authorize Your Dev Hub

- In VS Code, press Command + Shift P, enter sfdx, and select SFDX: Authorize a Dev Hub.
- You can also run this command from the command line. `sfdx force:auth:web:login -d -a LWC-Hub`
- Running this command opens a browser to the Salesforce login page. Enter your Salesforce username and password. Authorize only once, not every time you work on your project.

### Create a Default Scratch Org

- In VS Code, press Command + Shift P, enter sfdx, and select SFDX: Create a Default Scratch Org.
- You can also run this command from the command line. `sfdx force:org:create -s -f config/project-scratch-def.json -a "LWC"`
- `LWC` is an alias for the scratch org that you can use in other Salesforce CLI commands. You can create any alias that you like.

### Start the Local Development Server

Before starting the Local Development Server, you need to comment the Styling Hooks override because they are not supported.
In the file force-app/main/default/lwc/exampleSearch/exampleSearch.css

Remove or comment out the overrides under the `:host` property:

```
:host {
  --slds-c-checkbox-color-border: var(--lwc-colorTextIconDefault, #747474);
}
```

Otherwise you will get an error similar to this:

`CssSyntaxError: LWC1009: postcss-plugin-lwc: 2:3: Invalid definition of custom property "--slds-c-checkbox-color-border".`

Start the server.

- Run `npm run start`
- You can also run this command from the command line. `sfdx force:lightning:lwc:start`
- View the server at http://localhost:3334/.

The Local Development Server should be used to speed up development process, but is not a replacement to deploying your code to an actual Salesforce community to try it out. (There exists some variations of functionality and styling).

## Testing

### Deploy the Quantic Examples Community

Example components are available as a Salesforce community (Digital Experience) allowing you to experiment with Quantic components.

To setup the community in the `LWC` scratch org, run:

```bash
npm run setup:examples
```

This script creates, configures, and deploys everything required to have fully working examples. The community URL is provided at the end of the script output, as in the following example:

```
...

The 'Quantic Examples' community is ready, you can access it at the following URL:
https://your-salesforce-scratch-org-instance.force.com/examples

To open Cypress, run:
npm run cypress:open
```

Once the community has been deployed, you can deploy the `main` or `example` components only when needed. To do so, run:

```bash
npm run deploy:main
npm run deploy:examples
```

### Run Cypress for Quantic Components

**Note** Before attempting to run [Cypress](https://docs.cypress.io) tests, make sure the `Quantic Examples` community is deployed as described in the previous section.

To learn how to add tests, see [adding tests](./docs/adding-tests.md).

- All the tests will need to be under folder `cypress/integration`.

To open Cypress in browser mode, run:

```bash
npm run cypress:open
```

To run Cypress tests directly in your console, run:

```bash
npm run cypress:test
```

To get the [detailed report](./docs/detailed-reporting.md), run:

```bash
npm run cypress:test:detailed
```

## Use Quantic From Source

After you have cloned the repository and have run `npm install`, run the following commands:

- `npm run copy:staticresources`
- `sfdx force:source:deploy -m LightningComponentBundle`

## Other Useful Commands

- `-m LightningComponentBundle` can be changed for different types of "resources". To know which name, check the related `meta.xml` file for each type of resource.
- Create new web components. In VS Code, press Command + Shift P, enter sfdx, and select SFDX: Create Lightning Web Component.

## Learn About LWC

- [lwc.dev](https://lwc.dev/)
- [Components reference](https://developer.salesforce.com/docs/component-library/overview/components). Make sure you stay in the "Lightning web components section". Aura does not apply. Aura is the older UI library that is being deprecated by Salesforce.
- [Lightning design system](https://www.lightningdesignsystem.com/). Reference for styling, CSS utilities, icons, and more.
