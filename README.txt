GreeNox Healthy Food Cafe: website
===================================

Open index.html in any browser. No build step, no installs.

FILES
  index.html   Home page (hero, about, menu, why us, contact)
  order.html   Cart, checkout details, order tracking
  style.css    All styling. Colours are the variables at the top of the file.
  menu.js      THE MENU. Edit names, descriptions and prices here.
  script.js    Cart, filters, order submission, tracking

EDITING THE MENU
  In menu.js each dish is one line: ["Name", "Description", price]
  Add, remove or reorder lines and the home page updates by itself.
  A dish with "Chicken" in its name gets a Chicken tag and is hidden
  by the "No chicken" filter.

NOTES
  - Fonts (Bricolage Grotesque, Figtree) load from Google Fonts when online.
    Offline, the site falls back to system fonts and still works.
  - Orders and tracking are saved in the visitor's own browser (localStorage).
    There is no server, so the cafe does not receive orders from this
    version. Placing an order downloads a JSON file with its details.
