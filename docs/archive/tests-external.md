#Tests - external

Shunter templates can also be tested with external tools, such as Selenium. We use test attributes to identify key elements in the templates. E.g:

```html
<div data-test="page-header"> ... </div>
```

By default, in production, these attributes are stripped from the HTML; this is to reduce page weight. You can disable the stripping of these attributes by amending the Client's `User-Agent` header, adding "disable-test-attribute-stripping" to the end. This will allow you to select these elements and verify that they are present/correct.

Instructions on how to set the user-agent header in various clients follow:


## cURL

Set the user-agent string with the `-A` command-line flag:

```sh
curl -A "disable-test-attribute-stripping" http://www.nature.com/example
```


## Google Chrome

1. Navigate to the page you wish to test
2. Click the "&#9776;" icon in the toolbar and select "More tools > Developer Tools"
3. Now click the mobile icon in the top left of the developer tools pane. This will open up device emulation mode
4. In the device emulation toolbar, enter "disable-test-attribute-stripping" into the `UA` field
5. Refresh the page, test attributes should now be visible in the source


## Firefox

1. In a new tab, navigate to the URL: "about:config" and click the "I'll be careful" button
2. Right-click on the page somewhere, and select "New > String"
3. When prompted for the preference name, enter "general.useragent.override" and click OK
4. When prompted for the preference value, enter "disable-test-attribute-stripping" and click OK
5. Navigate to the page you wish to test

**Note: other sites may behave differently if you change your user-agent like this. It's best to remove the "general.useragent.override" configuration when you're done testing.**
