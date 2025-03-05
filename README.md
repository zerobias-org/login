# Build your own login page

This project is used for customers who want to build their own version of the login page.

### Initial structure

When this repository is cloned, by default, it has an example of a login application which can be used as it is *or* modified to reflect the needs of each customer.

## Usage

### Communicating with the login library and retrieving meta data

The application runs in a docker image that gets meta data from a dana application through `http headers`. The meta data is using `base64` encoding. This meta data is named context and it is used to simplifiy the development process.

```json
    {
      "org": {
        "id": "371a0711-79a6-430a-bc8c-0b7c1a61f898",
        "name": "ACME Inc.",
        "supportEmail": "support@acme.com",
        "selfRegistration": true,
        "invitationsEnabled": false,
        "avatar": "https://s16-us2.startpage.com/cgi-bin/serveimage?url=https%3A%2F%2Fvignette.wikia.nocookie.net%2Flooneytunes%2Fimages%2F5%2F56%2FComp_2.jpg%2Frevision%2Flatest%3Fcb%3D20121102161419&sp=17cc53d91c5a07666053dafd024b2bbc&anticache=736148"
      },
      "loginProviders": [
          {
            "id": "sarumontsigil-waad",
            "logo": "https://cdn2.auth0.com/docs/media/connections/ms.png",
            "name": "Microsoft"
          },
          {
            "id": "github",
            "logo": "https://cdn2.auth0.com/docs/media/connections/github.png",
            "name": "Github"
    
          }
      ],
      "principal": {
        "id": "8ef16435-d688-4174-8847-67d8eb4891ea",
        "name": "Fred Astaire",
        "email": "fred@acme.com",
        "pictureUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Astaire%2C_Fred_-_Never_Get_Rich.jpg/440px-Astaire%2C_Fred_-_Never_Get_Rich.jpg"
      }
    }
```

The `loginContext` object presented above contains information about:
1. Organization (information about the company)
2. Login providers (information about the methods of login, provided by the company)
3. Principal ([NEED DETAILS ABOUT THE PRINCIPAL])

This set of data can be used together with the markup to build dynamic pages that interpolate values about these  categories.
In order to use `OAuth` for authenticating within the application, a login utils script file has been developed and needs to be included in the page, together with the 'auth0' library.

```html
<script src="/node_modules/auth0-js/dist/auth0.min.js"></script>
<script src="/node_modules/@auditmation/dana-login-client/login.js"></script>
```

The `auth0` script is standard authentication library, while `login.js` builds communication with the library on top of it.

#### `Login library consists in several methods that need to be used for the exact purpose they have been designed for.`

##### `getLoginProviders(email)` 
Returns the login profile based on the given email address. This method will cause a `window.location` change in the following cases:
 - the user does not exist, self-registration is disabled, AND invitations are disabled => _Access Denied_
 - the user does not exist, self-registration is disabled, AND invitations are enabled => _Request Access_
 - there is only one identity provider and either: the user exists OR (the user does not exist AND self-registration is enabled)
 - **@param {string} email** - The email address provided by the user to check.
 - **@returns {Array.<{id: string, name: string, logo: string}>}** - List of supported login providers.

The user lands on a login screen and inputs an e-mail address which is used to login to the application. When the user inputted a valid e-mail addres, the application should call this method with the e-mail address as a parameter.

**NOTE THAT:** In order to benefit of the capabilities of the library, the following routes should be defined and display the correct information of the following pages:
1. `/access_denied` - This page is used as an information for the users which are not allowed to login to the application. It will be shown in the conditions defined above.
2. `/request_access` - This page is used if the user has not been invited to the application and needs to make a request to the authorized user to retrieve access to it. This page needs to contain a URL parameter called `email` in order to correctly apply access for a desired e-mail address.
3. `/eula/{id}` - This page is used to display eula information that a user needs to accept in order to login to the application

##### `login(provider, onError)`
Begins the login flow for the given user using the given provider
 - **@param {string}** provider the ID of the provider being used
 - **@param {function}** onError An error callback for handling errors from the IdP

After the `getLoginProviders` method is called, in case there are multiple providers available for loggin in, the method will return the list of providers which will be displayed in a page. Once a user can see the list of providers, he is able to select one in order to engage in the login process with his e-mail address and the selected provider from the list. 
Starting this point the `auth0` library takes control and does the magic behind the scenes in order to allow the specified login provider to be used for authentication.
1. In case of **success**, the user will be redirected to the homepage of the application in a logged in state. 
2. In case of **error**, the method that is passed as a parameter to the login method will be called.

##### `accept()`
This method is used on the `/eula` page as an agreement from the user that he accepts the eula conditions. 
**BEST PRACTICES**: The best practice for accepting a eula is only after the user read all the document. The button needs to stay disabled until the user reaches the bottom of the document.

##### `request_access()`
This method is used on the `/request_access` page in order to get access to the application for a specific user. The e-mail address is fetched from the `URL` and is passed by this method automatically.

### By choosing `Node JS` and `Handlebars JS`

There are some simple steps to take in consideration to ramp up your first login application:

1. `npm install` - This command is used to retrieve all the necessary packages.
2. `node server.js` - This command is used to start the server and see how the application looks like in its initial form.
3. Navigate to `http://localhost:3001` and check the initial application.

In order to change from the initial implementation to a custom implementation which allows to create own structure and layout, the following step should be applied

4. Open `server.js` and change the value of the `basePath` variable to `''` (see lines 12-14).
  
  ```javascript
  // const basePath = `${process.env.LOGIN_BASE_PATH || ''}/:domain`;
  // Comment previous line and uncomment next line for local dev
  const basePath = '';
  ```

5. Stop and restart `node server.js`

From this point, customization is enabled and custom markup can be written. In order to style the existing markup, the `/assets`, `/partials` and `/views` folders exist.   At this point, all the pages include the SDK's `/public/styles.css` file which you can then override by creating your your own custom `css` file and adding a link to it in your own `view` or `partial` override to style the page look and feel.

You should copy files you wish to override from `node_modules/@auditmation/dana-login-sdk` `partials` and `views` folders to the `partials` and `views` folders of your custom project, as they are, then make any customization to your override files.  Remember to restart the local dev `server.js` after you make any changes to your overridden files. Place any other local assets as needed into your assets folder and reference them in your override files.

The application will register the `partials` and `views` folders which can be used to define `handlebars` templates. Documentation for handlebars can be found on: `https://handlebarsjs.com/`.

### By choosing own technology stack

There are some simple steps to take in consideration to ramp up your first login application:

1. `npm install` - This command is used to retrieve all the necessary packages.
2. Include the following assets to the developed login page

```html
<script src="/node_modules/auth0-js/dist/auth0.min.js"></script>
<script src="/node_modules/@auditmation/dana-login-client/login.js"></script>
```
