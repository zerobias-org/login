# Build your own login page

This project is used for customers who want to build their own version of the login page.  Clone this project to your local development environment to begin.

### Custom Login App

There are some simple steps to take in order to ramp up your custom login application:

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

From this point, custom markup can be written. In order to style the existing markup, the `/assets`, `/partials` and `/views` folders exist.  By default, all of the pages include the SDK's `/public/styles.css` file which you can then override by creating your your own custom `css` file and adding a link to it in your own `view` or `partial` override to customize styles of the page look and feel.

You should copy files you wish to override from `node_modules/@auditmation/dana-login-sdk` `partials` and `views` folders to the `partials` and `views` folders of your custom project, then make any customization to your copied override files.  Remember to restart the local dev `server.js` after you make any changes to your overridden files. Place any other local assets as needed into your assets folder and reference them in your override files.

The application will register the `partials` and `views` folders which can be used to define `handlebars` templates. Documentation for handlebars can be found on: `https://handlebarsjs.com/`.
