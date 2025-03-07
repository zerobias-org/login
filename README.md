# Build your own login page

This project is used for customers who want to build their own version of the login page.  Clone this project to your local development environment to begin.

### Custom Login App

There are some simple steps to take in order to ramp up your custom login application:

1. `npm install` - This command is used to retrieve all the necessary packages.
2. Edit `server.js` and change the value of the `basePath` variable to `''` (see lines 12-14).
  
  ```javascript
  // const basePath = `${process.env.LOGIN_BASE_PATH || ''}/:domain`;
  // Comment previous line and uncomment next line for local dev
  const basePath = '';
  ```
3. `npm start` - This command is used to start the server.
4. Navigate to `http://localhost:3001` to interact with the application.
5. After making any changes to any of your customized templates, remember to stop the server, and re-run `npm start`.
6. Remember to reverse the changes you made to `server.js` in step 2 when you have completed your customizations.

### Styles

By default, all of the pages include the SDK's `/public/styles.css` file which you can then override by creating your your own custom `css` file and adding a link to it in your own `view` or `partial` override to customize styles of the page look and feel.

In the `/assets` folder, create your own `custom.css` file, and add a link to it in the `/views/head.hbs` template, or in any of the partials if you only want specific styles to be applied to specific partial. 

### Templates

You should copy template files you wish to override from `node_modules/@auditmation/dana-login-sdk` `partials` and `views` folders to the `partials` and `views` folders of your custom project, then make any customization to your copied override files.  Remember to restart the local dev `server.js` after you make any changes to your overridden files. Place any other local assets as needed into your assets folder and reference them in your override files.

The application will register the `partials` and `views` folders which can be used to define `handlebars` templates. Documentation for handlebars can be found on: `https://handlebarsjs.com/`.
