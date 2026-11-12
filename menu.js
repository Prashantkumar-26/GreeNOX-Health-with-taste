// Menu data service - loads categories & combos from menu.json

let MENU_DATA = null;
let MENU = [];
let POPULAR_ORDERS = [];

// Fallback data for offline / file:// protocol
const FALLBACK_MENU_DATA = {
  "restaurant": {
    "name": "GreeNox",
    "tagline": "Healthy Food Cafe",
    "location": "BML Munjal University",
    "deliveryTime": "20-25 mins",
    "rating": 4.9,
    "reviewCount": 1420
  },
  "combos": [
    {
      "id": "combo-protein",
      "title": "High-Protein Power Order",
      "badge": "Gym & Fitness Fav",
      "desc": "High Protein Chicken Bowl + Whey Protein Shake for maximum clean fuel.",
      "price": 259,
      "originalPrice": 278,
      "image": "images/order-protein-fuel.jpg",
      "tag": "High Protein",
      "items": [
        {
          "name": "High Protein Chicken Bowl",
          "price": 129,
          "quantity": 1
        },
        {
          "name": "Whey Protein Shake",
          "price": 149,
          "quantity": 1
        }
      ]
    },
    {
      "id": "combo-green-glow",
      "title": "Green Glow & Detox Order",
      "badge": "Superfood Rich",
      "desc": "Avocado Veg Burrito Bowl paired with our nutrient-dense ABC Red Nutritional Juice.",
      "price": 289,
      "originalPrice": 308,
      "image": "images/order-green-glow.jpg",
      "tag": "100% Vegan",
      "items": [
        {
          "name": "Avocado Veg Burrito Bowl",
          "price": 199,
          "quantity": 1
        },
        {
          "name": "ABC Red Nutritional Juice",
          "price": 109,
          "quantity": 1
        }
      ]
    },
    {
      "id": "combo-chill-bites",
      "title": "Campus Chill & Snack Order",
      "badge": "Student Bestseller",
      "desc": "Cheesy Veg Burger, crispy Peri Peri French Fries & our signature Classic Cold Coffee.",
      "price": 239,
      "originalPrice": 257,
      "image": "images/order-campus-chill.jpg",
      "tag": "Best Value",
      "items": [
        {
          "name": "Cheesy Veg Burger",
          "price": 79,
          "quantity": 1
        },
        {
          "name": "Peri Peri French Fries",
          "price": 89,
          "quantity": 1
        },
        {
          "name": "Classic Cold Coffee",
          "price": 89,
          "quantity": 1
        }
      ]
    },
    {
      "id": "combo-fiesta",
      "title": "Mexican Fiesta Bowl Order",
      "badge": "Chef Special",
      "desc": "Zesty Mexican Chicken Burrito Bowl + chilled Watermelon Mint Mojito + warm Chocolate Fudge Brownie.",
      "price": 339,
      "originalPrice": 367,
      "image": "images/order-fiesta.jpg",
      "tag": "Full Meal",
      "items": [
        {
          "name": "Mexican Chicken Burrito Bowl",
          "price": 199,
          "quantity": 1
        },
        {
          "name": "Watermelon Mint Mojito",
          "price": 79,
          "quantity": 1
        },
        {
          "name": "Chocolate Fudge Brownie",
          "price": 89,
          "quantity": 1
        }
      ]
    }
  ],
  "categories": [
    {
      "id": "chai",
      "name": "Chai",
      "emoji": "\u2615",
      "image": "images/chai.jpg",
      "items": [
        {
          "name": "Kulhad Chai",
          "desc": "Traditional spiced chai in an authentic clay kulhad.",
          "price": 20,
          "image": "images/chai.jpg",
          "chicken": false,
          "rating": 4.9,
          "popular": true,
          "calories": 95,
          "protein": 3
        },
        {
          "name": "Adrak Chai",
          "desc": "Fresh ginger steeped with aromatic tea leaves.",
          "price": 20,
          "image": "images/adrak-chai.jpg",
          "chicken": false,
          "rating": 4.8,
          "calories": 90,
          "protein": 3
        },
        {
          "name": "Lemon Tea",
          "desc": "Light, uplifting lemon infusion with honey.",
          "price": 20,
          "image": "images/lemon-tea.jpg",
          "chicken": false,
          "rating": 4.7,
          "calories": 45,
          "protein": 1
        }
      ]
    },
    {
      "id": "hot-coffee",
      "name": "Hot Coffee",
      "emoji": "\u2615",
      "image": "images/hot-coffee.jpg",
      "items": [
        {
          "name": "Espresso",
          "desc": "Strong and rich single-origin espresso shot.",
          "price": 59,
          "image": "images/espresso.jpg",
          "chicken": false,
          "rating": 4.8,
          "calories": 10,
          "protein": 1
        },
        {
          "name": "Hot Chocolate",
          "desc": "Warm, decadent dark chocolate drink.",
          "price": 79,
          "image": "images/hot-chocolate.jpg",
          "chicken": false,
          "rating": 4.9,
          "popular": true,
          "calories": 210,
          "protein": 6
        },
        {
          "name": "Cappuccino",
          "desc": "Freshly brewed espresso with steamed milk foam.",
          "price": 79,
          "image": "images/cappuccino.jpg",
          "chicken": false,
          "rating": 4.8,
          "calories": 120,
          "protein": 6
        },
        {
          "name": "Caf\u00e9 Latte",
          "desc": "Smooth espresso balanced with steamed milk.",
          "price": 89,
          "image": "images/latte.jpg",
          "chicken": false,
          "rating": 4.7,
          "calories": 140,
          "protein": 7
        }
      ]
    },
    {
      "id": "mocktails",
      "name": "Mocktails",
      "emoji": "\ud83c\udf79",
      "image": "images/mint-mojito.jpg",
      "items": [
        {
          "name": "Classic Mint Mojito",
          "desc": "Crushed garden mint, lime and sparkling soda.",
          "price": 69,
          "image": "images/mint-mojito.jpg",
          "chicken": false,
          "rating": 4.9,
          "popular": true,
          "calories": 85,
          "protein": 0
        },
        {
          "name": "Watermelon Mint Mojito",
          "desc": "Fresh watermelon puree and cooling mint.",
          "price": 79,
          "image": "images/watermelon-mojito.jpg",
          "chicken": false,
          "rating": 4.8,
          "calories": 90,
          "protein": 1
        },
        {
          "name": "Blue Lagoon Mint",
          "desc": "Vibrant blue citrus cooler with mint aroma.",
          "price": 79,
          "image": "images/blue-lagoon.jpg",
          "chicken": false,
          "rating": 4.7,
          "calories": 95,
          "protein": 0
        }
      ]
    },
    {
      "id": "burger-fries",
      "name": "Burger & Fries",
      "emoji": "\ud83c\udf54",
      "image": "images/burger.jpg",
      "items": [
        {
          "name": "Cheesy Veg Burger",
          "desc": "Crisp veggie patty with melted cheddar.",
          "price": 79,
          "image": "images/veg-burger.jpg",
          "chicken": false,
          "rating": 4.8,
          "popular": true,
          "calories": 380,
          "protein": 12
        },
        {
          "name": "Grilled Chicken Burger",
          "desc": "Herb-marinated chicken breast with fresh greens.",
          "price": 139,
          "image": "images/chicken-burger.jpg",
          "chicken": true,
          "rating": 4.9,
          "calories": 420,
          "protein": 29
        },
        {
          "name": "Peri Peri French Fries",
          "desc": "Golden fries dusted with spicy peri peri.",
          "price": 89,
          "image": "images/peri-peri-fries.jpg",
          "chicken": false,
          "rating": 4.8,
          "calories": 280,
          "protein": 4
        },
        {
          "name": "Loaded French Fries",
          "desc": "Fries topped with cheese sauce and jalape\u00f1os.",
          "price": 99,
          "image": "images/loaded-fries.jpg",
          "chicken": false,
          "rating": 4.9,
          "calories": 390,
          "protein": 9
        }
      ]
    },
    {
      "id": "wraps",
      "name": "Whole Wheat Wraps",
      "emoji": "\ud83c\udf2f",
      "image": "images/wraps.jpg",
      "items": [
        {
          "name": "Paneer Tikka Wrap",
          "desc": "Spiced cottage cheese rolled in whole wheat roti.",
          "price": 149,
          "image": "images/paneer-wrap.jpg",
          "chicken": false,
          "rating": 4.9,
          "popular": true,
          "calories": 390,
          "protein": 22
        },
        {
          "name": "Hummus Falafel Wrap",
          "desc": "Crispy chickpea falafel with house garlic hummus.",
          "price": 159,
          "image": "images/falafel-wrap.jpg",
          "chicken": false,
          "rating": 4.8,
          "calories": 370,
          "protein": 14
        }
      ]
    },
    {
      "id": "fresh-juice",
      "name": "Fresh Juice",
      "emoji": "\ud83c\udf4a",
      "image": "images/fresh-juice.jpg",
      "items": [
        {
          "name": "Watermelon Juice",
          "desc": "100% cold-pressed fresh watermelon, no added sugar.",
          "price": 79,
          "image": "images/watermelon-juice.jpg",
          "chicken": false,
          "rating": 4.9,
          "popular": true,
          "calories": 80,
          "protein": 2
        },
        {
          "name": "Orange Juice",
          "desc": "Freshly squeezed Valencia oranges loaded with Vitamin C.",
          "price": 99,
          "image": "images/orange-juice.jpg",
          "chicken": false,
          "rating": 4.8,
          "calories": 110,
          "protein": 2
        },
        {
          "name": "ABC Red Nutritional Juice",
          "desc": "Nutrient-packed Apple, Beetroot and Carrot elixir.",
          "price": 109,
          "image": "images/abc-juice.jpg",
          "chicken": false,
          "rating": 4.9,
          "calories": 120,
          "protein": 3
        }
      ]
    },
    {
      "id": "sandwiches",
      "name": "Sandwiches",
      "emoji": "\ud83e\udd6a",
      "image": "images/sandwiches.jpg",
      "items": [
        {
          "name": "Corn Cheese Sandwich",
          "desc": "Golden sweet corn and mozzarella on toasted multigrain.",
          "price": 89,
          "image": "images/corn-cheese-sandwich.jpg",
          "chicken": false,
          "rating": 4.8,
          "calories": 320,
          "protein": 10
        },
        {
          "name": "Paneer Tikka Sandwich",
          "desc": "Smoky paneer cubes with mint chutney spread.",
          "price": 99,
          "image": "images/paneer-sandwich.jpg",
          "chicken": false,
          "rating": 4.9,
          "popular": true,
          "calories": 360,
          "protein": 18
        },
        {
          "name": "Grilled Chicken Korean Sandwich",
          "desc": "Korean BBQ glazed chicken in crusty sourdough.",
          "price": 189,
          "image": "images/chicken-sandwich.jpg",
          "chicken": true,
          "rating": 4.9,
          "calories": 430,
          "protein": 28
        }
      ]
    },
    {
      "id": "shakes",
      "name": "Shakes",
      "emoji": "\ud83e\udd64",
      "image": "images/shakes.jpg",
      "items": [
        {
          "name": "Whey Protein Shake",
          "desc": "30g clean isolate whey blended with chilled almond milk.",
          "price": 149,
          "image": "images/protein-shake.jpg",
          "chicken": false,
          "rating": 5.0,
          "popular": true,
          "calories": 220,
          "protein": 32
        },
        {
          "name": "Dark Chocolate Shake",
          "desc": "Rich Dutch cocoa shake with roasted cacao nibs.",
          "price": 109,
          "image": "images/chocolate-shake.jpg",
          "chicken": false,
          "rating": 4.8,
          "calories": 330,
          "protein": 9
        },
        {
          "name": "Mix Berry Shake",
          "desc": "Strawberries, blueberries and raspberries with Greek yogurt.",
          "price": 129,
          "image": "images/berry-shake.jpg",
          "chicken": false,
          "rating": 4.9,
          "calories": 240,
          "protein": 8
        }
      ]
    },
    {
      "id": "subs",
      "name": "Subs",
      "emoji": "\ud83e\udd56",
      "image": "images/subs.jpg",
      "items": [
        {
          "name": "Hummus Falafel Sub",
          "desc": "Herbed falafel, tahini drizzle, and crisp garden veggies.",
          "price": 149,
          "image": "images/falafel-sub.jpg",
          "chicken": false,
          "rating": 4.8,
          "calories": 390,
          "protein": 15
        },
        {
          "name": "Paneer Tikka Sub",
          "desc": "Marinated cottage cheese with pickled onions and peppers.",
          "price": 159,
          "image": "images/paneer-sub.jpg",
          "chicken": false,
          "rating": 4.9,
          "calories": 420,
          "protein": 22
        },
        {
          "name": "Grilled Chicken Sub",
          "desc": "Juicy grilled chicken breast with honey mustard relish.",
          "price": 179,
          "image": "images/chicken-sub.jpg",
          "chicken": true,
          "rating": 4.9,
          "popular": true,
          "calories": 440,
          "protein": 31
        }
      ]
    },
    {
      "id": "cold-coffee",
      "name": "Cold Coffee",
      "emoji": "\ud83e\uddca",
      "image": "images/cold-coffee.jpg",
      "items": [
        {
          "name": "Classic Cold Coffee",
          "desc": "Double espresso blended with chilled milk and ice cream.",
          "price": 89,
          "image": "images/cold-coffee.jpg",
          "chicken": false,
          "rating": 4.9,
          "popular": true,
          "calories": 190,
          "protein": 5
        },
        {
          "name": "Iced Latte",
          "desc": "Chilled espresso poured over iced silky milk.",
          "price": 99,
          "image": "images/iced-latte.jpg",
          "chicken": false,
          "rating": 4.8,
          "calories": 110,
          "protein": 5
        }
      ]
    },
    {
      "id": "desserts",
      "name": "Desserts",
      "emoji": "\ud83c\udf70",
      "image": "images/brownie.jpg",
      "items": [
        {
          "name": "Chocolate Fudge Brownie",
          "desc": "Warm fudgy brownie baked with dark chocolate chips.",
          "price": 89,
          "image": "images/brownie.jpg",
          "chicken": false,
          "rating": 4.9,
          "popular": true,
          "calories": 310,
          "protein": 4
        },
        {
          "name": "Blueberry Cheesecake",
          "desc": "Velvety cheesecake topped with wild blueberry compote.",
          "price": 159,
          "image": "images/blueberry-cheesecake.jpg",
          "chicken": false,
          "rating": 4.9,
          "calories": 360,
          "protein": 7
        }
      ]
    },
    {
      "id": "salads",
      "name": "Salads",
      "emoji": "\ud83e\udd57",
      "image": "images/salads.jpg",
      "items": [
        {
          "name": "Classic Caesar Salad",
          "desc": "Crisp romaine, sourdough croutons and parmesan shavings.",
          "price": 149,
          "image": "images/caesar-salad.jpg",
          "chicken": false,
          "rating": 4.8,
          "calories": 250,
          "protein": 9
        },
        {
          "name": "Protein Packed Salad",
          "desc": "Quinoa, chickpeas, edamame and lemon-tahini dressing.",
          "price": 149,
          "image": "images/protein-salad.jpg",
          "chicken": false,
          "rating": 4.9,
          "popular": true,
          "calories": 320,
          "protein": 21
        },
        {
          "name": "Chicken Caesar Salad",
          "desc": "Grilled chicken breast over classic Caesar greens.",
          "price": 179,
          "image": "images/chicken-salad.jpg",
          "chicken": true,
          "rating": 4.9,
          "calories": 360,
          "protein": 31
        }
      ]
    },
    {
      "id": "wholesome-meals",
      "name": "Wholesome Meals",
      "emoji": "\ud83c\udf71",
      "image": "images/chicken-bowl.jpg",
      "items": [
        {
          "name": "High Protein Chicken Bowl",
          "desc": "Steamed chicken, saut\u00e9ed greens, brown rice and egg.",
          "price": 129,
          "image": "images/chicken-bowl.jpg",
          "chicken": true,
          "rating": 5.0,
          "popular": true,
          "calories": 440,
          "protein": 36
        },
        {
          "name": "Grilled Chicken Steak",
          "desc": "Tender grilled breast fillet served with herb potato mash.",
          "price": 199,
          "image": "images/chicken-steak.jpg",
          "chicken": true,
          "rating": 4.9,
          "calories": 390,
          "protein": 38
        }
      ]
    },
    {
      "id": "burrito-bowls",
      "name": "Burrito Bowls",
      "emoji": "\ud83c\udf2f",
      "image": "images/burrito-bowls.jpg",
      "items": [
        {
          "name": "Mexican Chicken Burrito Bowl",
          "desc": "Chipotle chicken, black beans, salsa and brown rice.",
          "price": 199,
          "image": "images/chicken-burrito-bowl.jpg",
          "chicken": true,
          "rating": 4.9,
          "popular": true,
          "calories": 510,
          "protein": 34
        },
        {
          "name": "Avocado Veg Burrito Bowl",
          "desc": "Hass avocado slices, pinto beans, grilled peppers and corn.",
          "price": 199,
          "image": "images/avocado-bowl.jpg",
          "chicken": false,
          "rating": 4.9,
          "calories": 460,
          "protein": 14
        }
      ]
    },
    {
      "id": "rice-bowls",
      "name": "Healthy Rice Bowls",
      "emoji": "\ud83c\udf5a",
      "image": "images/rice-bowls.jpg",
      "items": [
        {
          "name": "Soya Paneer Rice Bowl",
          "desc": "High-protein soya paneer cubes with cilantro rice.",
          "price": 169,
          "image": "images/paneer-rice-bowl.jpg",
          "chicken": false,
          "rating": 4.8,
          "calories": 420,
          "protein": 24
        },
        {
          "name": "Grilled Chicken Rice Bowl",
          "desc": "Herbed chicken fillets over fragrant jasmine rice.",
          "price": 189,
          "image": "images/chicken-rice-bowl.jpg",
          "chicken": true,
          "rating": 4.9,
          "calories": 470,
          "protein": 33
        }
      ]
    },
    {
      "id": "pasta",
      "name": "Pasta",
      "emoji": "\ud83c\udf5d",
      "image": "images/arrabiata-pasta.jpg",
      "items": [
        {
          "name": "Alfredo Pasta",
          "desc": "Penne tossed in silky parmesan cream sauce and garlic.",
          "price": 149,
          "image": "images/alfredo-pasta.jpg",
          "chicken": false,
          "rating": 4.8,
          "calories": 490,
          "protein": 14
        },
        {
          "name": "Arrabiata Pasta",
          "desc": "Spicy tomato sauce with fresh basil and crushed red chilli.",
          "price": 149,
          "image": "images/arrabiata-pasta.jpg",
          "chicken": false,
          "rating": 4.9,
          "popular": true,
          "calories": 380,
          "protein": 11
        },
        {
          "name": "Arrabiata Chicken Pasta",
          "desc": "Spicy Arrabiata pasta with seasoned tender chicken.",
          "price": 169,
          "image": "images/chicken-pasta.jpg",
          "chicken": true,
          "rating": 4.9,
          "calories": 460,
          "protein": 29
        }
      ]
    },
    {
      "id": "smoothie-bowls",
      "name": "Smoothie Bowls",
      "emoji": "\ud83e\udd5d",
      "image": "images/smoothie-bowl.jpg",
      "items": [
        {
          "name": "Fruits & Nuts Smoothie Bowl",
          "desc": "Acai base topped with banana, chia seeds and roasted almonds.",
          "price": 159,
          "image": "images/smoothie-bowl.jpg",
          "chicken": false,
          "rating": 4.9,
          "popular": true,
          "calories": 310,
          "protein": 11
        },
        {
          "name": "Mix Berries Kiwi & Nuts",
          "desc": "Wild berry puree with fresh kiwi wheels and pumpkin seeds.",
          "price": 179,
          "image": "images/berry-kiwi-bowl.jpg",
          "chicken": false,
          "rating": 4.9,
          "calories": 270,
          "protein": 8
        }
      ]
    },
    {
      "id": "tacos",
      "name": "Tacos",
      "emoji": "\ud83c\udf2e",
      "image": "images/tacos.jpg",
      "items": [
        {
          "name": "Mexican Veg Taco",
          "desc": "Warm tortillas packed with beans, guacamole and salsa (2 pcs).",
          "price": 109,
          "image": "images/tacos.jpg",
          "chicken": false,
          "rating": 4.8,
          "calories": 280,
          "protein": 10
        },
        {
          "name": "Mexican Chicken Taco",
          "desc": "Smoky grilled chicken with pico de gallo and crema (2 pcs).",
          "price": 149,
          "image": "images/chicken-taco.jpg",
          "chicken": true,
          "rating": 4.9,
          "calories": 340,
          "protein": 24
        }
      ]
    }
  ]
};

// Initial sync assignment
MENU_DATA = FALLBACK_MENU_DATA;
MENU = FALLBACK_MENU_DATA.categories;
POPULAR_ORDERS = FALLBACK_MENU_DATA.combos;

// Fetch menu data from menu.json
async function fetchMenuApi() {
  try {
    const response = await fetch("./menu.json?t=" + Date.now(), {
      headers: { "Accept": "application/json" }
    });
    if (!response.ok) {
      throw new Error("HTTP error " + response.status);
    }
    const data = await response.json();
    if (data && Array.isArray(data.categories)) {
      MENU_DATA = data;
      MENU = data.categories;
      POPULAR_ORDERS = data.combos || [];
      console.log("✓ Menu data imported successfully via API call from menu.json (" + MENU.length + " categories, " + POPULAR_ORDERS.length + " combos)");
      return data;
    }
    throw new Error("Invalid format in menu.json");
  } catch (error) {
    console.warn("API fetch from menu.json fallback triggered:", error.message);
    MENU_DATA = FALLBACK_MENU_DATA;
    MENU = FALLBACK_MENU_DATA.categories;
    POPULAR_ORDERS = FALLBACK_MENU_DATA.combos;
    return FALLBACK_MENU_DATA;
  }
}

// Resolve dish image from active menu, combos, or aliases
function getDishImage(dishName, categoryId) {
  if (!dishName && categoryId) {
    if (MENU_DATA && Array.isArray(MENU_DATA.categories)) {
      const cat = MENU_DATA.categories.find(c => c.id === categoryId);
      if (cat && cat.image) return cat.image;
    }
  }

  // 1. Direct dish match in categories
  if (MENU_DATA && Array.isArray(MENU_DATA.categories)) {
    for (const cat of MENU_DATA.categories) {
      if (Array.isArray(cat.items)) {
        const match = cat.items.find(function (item) {
          return item.name === dishName || (dishName && item.name && item.name.toLowerCase() === dishName.toLowerCase());
        });
        if (match && match.image) {
          return match.image;
        }
      }
      if (categoryId && cat.id === categoryId && cat.image) {
        return cat.image;
      }
    }
  }

  // 2. Direct combo match
  if (MENU_DATA && Array.isArray(MENU_DATA.combos)) {
    const comboMatch = MENU_DATA.combos.find(function (combo) {
      return combo.title === dishName || combo.id === dishName ||
        (dishName && combo.title && combo.title.toLowerCase() === dishName.toLowerCase());
    });
    if (comboMatch && comboMatch.image) {
      return comboMatch.image;
    }
  }

  // 3. Known aliases / popular tags
  const ALIAS_MAP = {
    "paneer power wrap": "images/paneer-wrap.jpg",
    "greek salad bowl": "images/caesar-salad.jpg",
    "strawberry protein shake": "images/berry-shake.jpg",
    "masala chai": "images/chai.jpg",
    "avocado veg burrito bowl": "images/avocado-bowl.jpg",
    "high protein chicken bowl": "images/chicken-bowl.jpg",
    "fruits & nuts smoothie bowl": "images/smoothie-bowl.jpg",
    "protein packed salad": "images/protein-salad.jpg"
  };
  if (dishName && ALIAS_MAP[dishName.toLowerCase()]) {
    return ALIAS_MAP[dishName.toLowerCase()];
  }

  return "images/salads.jpg";
}
