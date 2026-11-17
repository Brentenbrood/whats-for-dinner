export const RECIPES = [
  {
    id: "pesto-burrata-pasta",
    title: "Burst-tomato pesto pasta",
    subtitle: "Blistered cherry tomatoes, basil pesto and torn mozzarella.",
    emoji: "🍝",
    minutes: 25,
    servings: 2,
    difficulty: "Easy",
    mainProtein: "veggie",
    vibe: "Weeknight comfort",
    tags: ["pasta", "vegetarian", "comfort", "quick"],
    ingredients: [
      { id: "pasta", name: "Penne or rigatoni", amount: "250 g", price: 1.29, essential: true },
      { id: "tomato", name: "Cherry tomatoes", amount: "250 g", price: 1.99, essential: true },
      { id: "mozzarella", name: "Mozzarella or burrata", amount: "125 g", price: 1.49, essential: true },
      { id: "pesto", name: "Basil pesto", amount: "3 tbsp", price: 2.29, essential: true },
      { id: "garlic", name: "Garlic", amount: "2 cloves", price: 0.59 },
      { id: "rucola", name: "Rocket", amount: "handful", price: 1.29 }
    ],
    steps: [
      "Boil the pasta in well-salted water until just al dente. Keep a splash of pasta water.",
      "Halve the tomatoes and sizzle them in a wide pan with a little olive oil until they burst and turn jammy.",
      "Add the garlic for 30 seconds, then stir in the pesto and a splash of pasta water.",
      "Toss in the pasta, season, and fold through the rocket.",
      "Tear the mozzarella over the top and finish with black pepper."
    ],
    tip: "A spoon of ricotta or a handful of toasted pine nuts makes it extra special."
  },
  {
    id: "chicken-teriyaki-rice",
    title: "Sticky chicken teriyaki rice bowl",
    subtitle: "Glossy chicken, crunchy broccoli and sesame rice.",
    emoji: "🍗",
    minutes: 30,
    servings: 2,
    difficulty: "Easy",
    mainProtein: "chicken",
    vibe: "Fakeaway at home",
    tags: ["chicken", "rice", "asian", "healthy"],
    ingredients: [
      { id: "chicken", name: "Chicken thighs or fillet", amount: "400 g", price: 4.99, essential: true },
      { id: "rice", name: "Jasmine rice", amount: "200 g", price: 1.09, essential: true },
      { id: "broccoli", name: "Broccoli", amount: "300 g", price: 1.79, essential: true },
      { id: "soy", name: "Soy sauce & honey", amount: "4 tbsp + 1 tbsp", price: 1.59, essential: true },
      { id: "carrot", name: "Carrot", amount: "1 large", price: 0.99 },
      { id: "garlic", name: "Garlic & ginger", amount: "2 cloves + thumb", price: 0.79 }
    ],
    steps: [
      "Cook the rice according to the packet, then keep warm.",
      "Mix soy sauce, honey, grated garlic and ginger with a splash of water.",
      "Sear the chicken in a hot pan until golden, then pour in the sauce and bubble until sticky.",
      "Steam or stir-fry the broccoli and carrot for 4–5 minutes so they stay crisp.",
      "Pile everything over the rice and spoon over the pan sauce."
    ],
    tip: "No honey? Brown sugar or maple syrup works just as well."
  },
  {
    id: "salmon-traybake",
    title: "Lemon salmon traybake",
    subtitle: "Crispy potatoes, green beans and a lemony salmon fillet.",
    emoji: "🐟",
    minutes: 40,
    servings: 2,
    difficulty: "Easy",
    mainProtein: "fish",
    vibe: "One-pan dinner",
    tags: ["fish", "one-pan", "healthy", "gluten-free"],
    ingredients: [
      { id: "salmon", name: "Salmon fillets", amount: "2 × 150 g", price: 6.99, essential: true },
      { id: "potato", name: "Baby potatoes", amount: "600 g", price: 1.69, essential: true },
      { id: "greenbeans", name: "Green beans", amount: "250 g", price: 1.79, essential: true },
      { id: "lemon", name: "Lemon", amount: "1", price: 0.69, essential: true },
      { id: "herbs", name: "Dill or parsley", amount: "small bunch", price: 1.29 }
    ],
    steps: [
      "Heat the oven to 220°C. Halve the potatoes and roast with oil, salt and pepper for 20 minutes.",
      "Add the green beans and lemon slices to the tray and roast for another 8 minutes.",
      "Nestle the salmon among the vegetables, season and roast for 10–12 minutes.",
      "Squeeze over the roasted lemon and scatter with fresh herbs.",
      "Serve straight from the tray with a spoon of yogurt if you like."
    ],
    tip: "Salmon is done when it flakes easily but still looks a little glossy in the centre."
  },
  {
    id: "mushroom-stroganoff",
    title: "Creamy mushroom stroganoff",
    subtitle: "Golden mushrooms in a smoky cream sauce with pasta.",
    emoji: "🍄",
    minutes: 25,
    servings: 2,
    difficulty: "Easy",
    mainProtein: "veggie",
    vibe: "Cosy bowl",
    tags: ["vegetarian", "pasta", "comfort", "creamy"],
    ingredients: [
      { id: "mushroom", name: "Chestnut mushrooms", amount: "300 g", price: 1.79, essential: true },
      { id: "pasta", name: "Tagliatelle", amount: "250 g", price: 1.29, essential: true },
      { id: "cream", name: "Cream or crème fraîche", amount: "150 ml", price: 1.09, essential: true },
      { id: "onion", name: "Onion", amount: "1", price: 0.79, essential: true },
      { id: "spinach", name: "Spinach", amount: "150 g", price: 1.49 },
      { id: "garlic", name: "Garlic", amount: "2 cloves", price: 0.59 }
    ],
    steps: [
      "Cook the pasta until al dente and reserve a mug of pasta water.",
      "Fry the onion in a wide pan until soft, then add the mushrooms and cook until deeply golden.",
      "Add garlic and a teaspoon of paprika, then pour in the cream and simmer for 2 minutes.",
      "Stir through the spinach and loosen with pasta water until silky.",
      "Fold in the pasta, season generously and serve with plenty of black pepper."
    ],
    tip: "A splash of soy sauce or a spoon of mustard adds a lovely savoury depth."
  },
  {
    id: "cauliflower-chickpea-curry",
    title: "Cauliflower & chickpea curry",
    subtitle: "A gently spiced coconut curry with rice and warm naan.",
    emoji: "🍛",
    minutes: 35,
    servings: 2,
    difficulty: "Easy",
    mainProtein: "veggie",
    vibe: "Plant-powered",
    tags: ["vegetarian", "curry", "healthy", "one-pot"],
    ingredients: [
      { id: "cauliflower", name: "Cauliflower", amount: "1 small head", price: 1.99, essential: true },
      { id: "chickpeas", name: "Chickpeas", amount: "1 can (400 g)", price: 0.99, essential: true },
      { id: "rice", name: "Basmati rice", amount: "200 g", price: 1.09, essential: true },
      { id: "curry", name: "Curry paste or powder", amount: "2 tbsp", price: 1.99, essential: true },
      { id: "spinach", name: "Spinach", amount: "150 g", price: 1.49 },
      { id: "naan", name: "Naan breads", amount: "2", price: 1.49 },
      { id: "onion", name: "Onion", amount: "1", price: 0.79 }
    ],
    steps: [
      "Cook the rice and warm the naan while the curry simmers.",
      "Soften the onion in a deep pan, then add the curry paste and cook for 1 minute.",
      "Add the cauliflower florets, chickpeas and a can of coconut milk or crushed tomatoes.",
      "Simmer for 15–18 minutes until the cauliflower is tender, then fold in the spinach.",
      "Season, squeeze over lime if you have it, and serve with rice and naan."
    ],
    tip: "A spoon of yogurt on top cools the curry beautifully."
  },
  {
    id: "meatballs-tomato-mash",
    title: "Beef meatballs with tomato sauce & mash",
    subtitle: "Tender meatballs, sweet tomato sauce and buttery mash.",
    emoji: "🍅",
    minutes: 35,
    servings: 2,
    difficulty: "Easy",
    mainProtein: "beef",
    vibe: "Proper comfort food",
    tags: ["beef", "comfort", "family", "dutch"],
    ingredients: [
      { id: "beef", name: "Beef mince", amount: "400 g", price: 4.49, essential: true },
      { id: "tomato_sauce", name: "Tomato passata", amount: "500 g", price: 1.49, essential: true },
      { id: "potato", name: "Floury potatoes", amount: "800 g", price: 1.69, essential: true },
      { id: "milk", name: "Milk", amount: "100 ml", price: 1.19 },
      { id: "butter", name: "Butter", amount: "40 g", price: 2.29 },
      { id: "onion", name: "Onion", amount: "1", price: 0.79 },
      { id: "herbs", name: "Parsley", amount: "small bunch", price: 1.29 }
    ],
    steps: [
      "Season the mince and roll into small meatballs. Brown them in a wide pan, then set aside.",
      "Soften the onion in the same pan, add the passata and a splash of water, and return the meatballs.",
      "Simmer gently for 18–20 minutes while you boil the potatoes.",
      "Mash the potatoes with butter and warm milk until fluffy.",
      "Serve the meatballs and sauce over the mash, scattered with parsley."
    ],
    tip: "A pinch of nutmeg in the mash tastes like a proper Dutch kitchen."
  },
  {
    id: "black-bean-quesadillas",
    title: "Bean quesadillas",
    subtitle: "Crispy tortillas, melted cheese, smoky beans and avocado.",
    emoji: "🌮",
    minutes: 20,
    servings: 2,
    difficulty: "Easy",
    mainProtein: "veggie",
    vibe: "10-minute feast",
    tags: ["vegetarian", "mexican", "quick", "comfort"],
    ingredients: [
      { id: "tortilla", name: "Tortillas", amount: "4", price: 1.99, essential: true },
      { id: "beans", name: "Black beans or white beans", amount: "1 can (400 g)", price: 1.09, essential: true },
      { id: "cheese", name: "Grated cheese", amount: "150 g", price: 3.29, essential: true },
      { id: "bellpepper", name: "Red pepper", amount: "1", price: 1.19 },
      { id: "avocado", name: "Avocado", amount: "1", price: 0.99 },
      { id: "corn", name: "Sweetcorn", amount: "small can", price: 0.99 }
    ],
    steps: [
      "Mash the beans with a pinch of cumin, salt and a squeeze of lime.",
      "Spread the beans over two tortillas, top with cheese, pepper and corn, and close with the remaining tortillas.",
      "Toast in a dry pan for 3–4 minutes per side until crisp and melty.",
      "Slice into wedges and serve with avocado, salsa and yogurt."
    ],
    tip: "Keep the pan at medium heat so the cheese melts before the tortilla burns."
  },
  {
    id: "spicy-chicken-noodles",
    title: "Spicy chicken noodles with pak choi",
    subtitle: "Fast wok noodles with garlic, chilli and crunchy greens.",
    emoji: "🍜",
    minutes: 20,
    servings: 2,
    difficulty: "Easy",
    mainProtein: "chicken",
    vibe: "Fakeaway at home",
    tags: ["chicken", "asian", "spicy", "quick"],
    ingredients: [
      { id: "noodles", name: "Wok noodles", amount: "250 g", price: 1.39, essential: true },
      { id: "chicken", name: "Chicken strips", amount: "350 g", price: 4.99, essential: true },
      { id: "pakchoi", name: "Pak choi", amount: "2 heads", price: 1.49, essential: true },
      { id: "soy", name: "Soy sauce, honey & chilli", amount: "3 tbsp + 1 tsp", price: 1.59, essential: true },
      { id: "bellpepper", name: "Red pepper", amount: "1", price: 1.19 },
      { id: "garlic", name: "Garlic", amount: "2 cloves", price: 0.59 }
    ],
    steps: [
      "Cook the noodles according to the packet and drain.",
      "Mix soy sauce, honey and chilli to make a quick stir-fry sauce.",
      "Stir-fry the chicken in a very hot wok until golden and cooked through.",
      "Add garlic, pepper and pak choi and toss for 2 minutes.",
      "Add the noodles and sauce, toss until glossy and serve immediately."
    ],
    tip: "A fried egg on top turns this into a late-night favourite."
  },
  {
    id: "loaded-oven-fries",
    title: "Loaded oven fries with pulled chicken",
    subtitle: "Crispy fries, smoky chicken, melted cheese and cool yogurt.",
    emoji: "🍟",
    minutes: 35,
    servings: 2,
    difficulty: "Easy",
    mainProtein: "chicken",
    vibe: "Friday night in",
    tags: ["chicken", "comfort", "family", "traybake"],
    ingredients: [
      { id: "potato", name: "Oven fries or potatoes", amount: "600 g", price: 1.69, essential: true },
      { id: "chicken", name: "Chicken thighs or cooked chicken", amount: "350 g", price: 4.99, essential: true },
      { id: "cheese", name: "Grated cheese", amount: "100 g", price: 3.29, essential: true },
      { id: "yogurt", name: "Greek yogurt or thick yogurt", amount: "150 g", price: 1.99 },
      { id: "rucola", name: "Rocket", amount: "handful", price: 1.29 },
      { id: "tomato", name: "Tomato", amount: "2", price: 1.99 }
    ],
    steps: [
      "Heat the oven to 220°C and bake the fries until golden and crisp.",
      "Rub the chicken with smoked paprika, salt and a little oil, then pan-fry until cooked.",
      "Shred the chicken with two forks.",
      "Pile the chicken over the fries, scatter with cheese and return to the oven for 5 minutes.",
      "Finish with rocket, chopped tomato and a dollop of yogurt."
    ],
    tip: "A squeeze of lemon over the yogurt makes the whole tray taste brighter."
  },
  {
    id: "fish-peas-mash",
    title: "Crispy fish with peas & mash",
    subtitle: "Golden fish, sweet peas and a cloud of buttery mash.",
    emoji: "🐟",
    minutes: 30,
    servings: 2,
    difficulty: "Easy",
    mainProtein: "fish",
    vibe: "Family favourite",
    tags: ["fish", "family", "comfort", "dutch"],
    ingredients: [
      { id: "whitefish", name: "Fish fillets or fish fingers", amount: "300 g", price: 4.99, essential: true },
      { id: "peas", name: "Peas", amount: "300 g", price: 1.49, essential: true },
      { id: "potato", name: "Floury potatoes", amount: "700 g", price: 1.69, essential: true },
      { id: "milk", name: "Milk", amount: "100 ml", price: 1.19 },
      { id: "butter", name: "Butter", amount: "40 g", price: 2.29 },
      { id: "lemon", name: "Lemon", amount: "1", price: 0.69 }
    ],
    steps: [
      "Boil the potatoes until tender, then mash with butter and warm milk.",
      "Cook the peas in the last 4 minutes of the potato cooking time.",
      "Pan-fry or oven-bake the fish until golden and cooked through.",
      "Serve the fish over the mash with plenty of peas and a wedge of lemon."
    ],
    tip: "A little grated lemon zest in the mash lifts the whole plate."
  },
  {
    id: "pumpkin-risotto",
    title: "Pumpkin risotto with sage",
    subtitle: "Slow-stirred, creamy risotto with sweet roasted pumpkin.",
    emoji: "🎃",
    minutes: 45,
    servings: 2,
    difficulty: "Medium",
    mainProtein: "veggie",
    vibe: "Autumn comfort",
    tags: ["vegetarian", "rice", "comfort", "autumn"],
    ingredients: [
      { id: "rice", name: "Risotto rice", amount: "200 g", price: 1.09, essential: true },
      { id: "pumpkin", name: "Pumpkin", amount: "500 g", price: 2.49, essential: true },
      { id: "onion", name: "Onion", amount: "1", price: 0.79, essential: true },
      { id: "cheese", name: "Parmesan", amount: "60 g", price: 3.29, essential: true },
      { id: "butter", name: "Butter", amount: "40 g", price: 2.29 },
      { id: "herbs", name: "Sage or thyme", amount: "small bunch", price: 1.29 }
    ],
    steps: [
      "Roast the pumpkin cubes with oil and salt at 220°C for 20 minutes.",
      "Soften the onion in butter, add the rice and toast for 1 minute.",
      "Add warm stock a ladle at a time, stirring, for about 18 minutes.",
      "Fold in the roasted pumpkin, most of the parmesan and a knob of butter.",
      "Rest for 2 minutes, then finish with herbs and the remaining cheese."
    ],
    tip: "Keep the stock warm — cold stock makes the rice cook unevenly."
  },
  {
    id: "shakshuka",
    title: "Shakshuka with crusty bread",
    subtitle: "Eggs poached in a smoky pepper and tomato sauce.",
    emoji: "🍳",
    minutes: 25,
    servings: 2,
    difficulty: "Easy",
    mainProtein: "veggie",
    vibe: "Brunch for dinner",
    tags: ["vegetarian", "eggs", "spicy", "quick"],
    ingredients: [
      { id: "egg", name: "Eggs", amount: "4", price: 1.99, essential: true },
      { id: "tomato", name: "Tomatoes", amount: "400 g", price: 1.99, essential: true },
      { id: "tomato_sauce", name: "Passata", amount: "300 g", price: 1.49, essential: true },
      { id: "bellpepper", name: "Red pepper", amount: "1", price: 1.19, essential: true },
      { id: "onion", name: "Onion", amount: "1", price: 0.79 },
      { id: "bread", name: "Crusty bread", amount: "1 loaf", price: 1.99 },
      { id: "herbs", name: "Coriander or parsley", amount: "small bunch", price: 1.29 }
    ],
    steps: [
      "Soften the onion and pepper in a wide pan for 8 minutes.",
      "Add cumin, smoked paprika and chilli, then the tomatoes and passata.",
      "Simmer for 10 minutes until thick and glossy.",
      "Make four wells, crack in the eggs, cover and cook for 6–8 minutes.",
      "Scatter with herbs and serve with warm bread for dipping."
    ],
    tip: "Keep the yolks a little soft — the bread is there to mop them up."
  },
  {
    id: "boerenkool-stamppot",
    title: "Boerenkool stamppot with rookworst",
    subtitle: "The Dutch classic: kale and potato mash with smoky sausage.",
    emoji: "🥔",
    minutes: 35,
    servings: 2,
    difficulty: "Easy",
    mainProtein: "pork",
    vibe: "Dutch comfort",
    tags: ["dutch", "comfort", "family", "pork"],
    ingredients: [
      { id: "kale", name: "Kale", amount: "400 g", price: 1.79, essential: true },
      { id: "potato", name: "Floury potatoes", amount: "800 g", price: 1.69, essential: true },
      { id: "sausage", name: "Rookworst", amount: "1", price: 3.49, essential: true },
      { id: "milk", name: "Milk", amount: "100 ml", price: 1.19 },
      { id: "butter", name: "Butter", amount: "30 g", price: 2.29 }
    ],
    steps: [
      "Boil the potatoes in salted water for 20 minutes, adding the kale for the last 8 minutes.",
      "Warm the rookworst in the same pan for the final 10 minutes.",
      "Drain, then mash the potatoes and kale with butter and warm milk.",
      "Season with salt, pepper and a little mustard if you like.",
      "Serve with the sausage sliced over the top and a well of gravy."
    ],
    tip: "A splash of the potato water keeps the stamppot creamy without extra butter."
  },
  {
    id: "pasta-bolognese",
    title: "Slow-ish pasta bolognese",
    subtitle: "A rich beef and tomato sauce with a hidden carrot.",
    emoji: "🍝",
    minutes: 40,
    servings: 2,
    difficulty: "Easy",
    mainProtein: "beef",
    vibe: "Family favourite",
    tags: ["beef", "pasta", "comfort", "family"],
    ingredients: [
      { id: "pasta", name: "Spaghetti", amount: "250 g", price: 1.29, essential: true },
      { id: "beef", name: "Beef mince", amount: "400 g", price: 4.49, essential: true },
      { id: "tomato_sauce", name: "Passata", amount: "500 g", price: 1.49, essential: true },
      { id: "onion", name: "Onion", amount: "1", price: 0.79 },
      { id: "carrot", name: "Carrot", amount: "1", price: 0.99 },
      { id: "cheese", name: "Parmesan", amount: "40 g", price: 3.29 },
      { id: "herbs", name: "Basil", amount: "small bunch", price: 1.29 }
    ],
    steps: [
      "Soften the onion and grated carrot in a wide pan for 8 minutes.",
      "Add the beef and brown it well, breaking it up as it cooks.",
      "Pour in the passata, season and simmer gently for 20 minutes.",
      "Cook the spaghetti until al dente and toss with a little sauce.",
      "Serve topped with the rest of the sauce, parmesan and basil."
    ],
    tip: "A splash of milk at the end makes the sauce rounder and less sharp."
  },
  {
    id: "tofu-stir-fry",
    title: "Crispy tofu stir-fry",
    subtitle: "Golden tofu, rainbow vegetables and a gingery soy glaze.",
    emoji: "🥢",
    minutes: 25,
    servings: 2,
    difficulty: "Easy",
    mainProtein: "plant",
    vibe: "Plant-powered",
    tags: ["vegan", "asian", "quick", "healthy"],
    ingredients: [
      { id: "tofu", name: "Firm tofu", amount: "400 g", price: 2.49, essential: true },
      { id: "rice", name: "Rice", amount: "200 g", price: 1.09, essential: true },
      { id: "mixedveg", name: "Stir-fry vegetables", amount: "400 g", price: 1.79, essential: true },
      { id: "soy", name: "Soy sauce & honey", amount: "3 tbsp + 1 tbsp", price: 1.59, essential: true },
      { id: "garlic", name: "Garlic & ginger", amount: "2 cloves + thumb", price: 0.79 }
    ],
    steps: [
      "Press the tofu dry, cube it and toss with a little cornflour.",
      "Fry the tofu in a hot pan until crisp on all sides, then set aside.",
      "Stir-fry the vegetables with garlic and ginger for 4 minutes.",
      "Mix soy sauce, honey and a splash of water, then return the tofu and glaze.",
      "Serve over rice with sesame seeds if you have them."
    ],
    tip: "Use maple syrup instead of honey to keep it fully vegan."
  },
  {
    id: "halloumi-flatbreads",
    title: "Halloumi flatbreads",
    subtitle: "Griddled halloumi, rocket and tomato in warm flatbreads.",
    emoji: "🫓",
    minutes: 20,
    servings: 2,
    difficulty: "Easy",
    mainProtein: "veggie",
    vibe: "Fresh & fast",
    tags: ["vegetarian", "quick", "summer", "grill"],
    ingredients: [
      { id: "halloumi", name: "Halloumi", amount: "225 g", price: 2.99, essential: true },
      { id: "naan", name: "Flatbreads or pita", amount: "2", price: 1.49, essential: true },
      { id: "tomato", name: "Tomatoes", amount: "2", price: 1.99, essential: true },
      { id: "rucola", name: "Rocket", amount: "handful", price: 1.29 },
      { id: "yogurt", name: "Greek yogurt", amount: "100 g", price: 1.99 },
      { id: "lemon", name: "Lemon", amount: "1", price: 0.69 }
    ],
    steps: [
      "Slice the halloumi and griddle in a dry hot pan until golden on both sides.",
      "Warm the flatbreads in the same pan.",
      "Mix yogurt with lemon juice, salt and a little grated garlic.",
      "Layer the flatbreads with yogurt, sliced tomato, halloumi and rocket.",
      "Roll up and eat while the cheese is still squeaky."
    ],
    tip: "A drizzle of honey and chilli flakes over the halloumi is a great shortcut to flavour."
  },
  {
    id: "sausage-bean-stew",
    title: "Sausage & bean stew",
    subtitle: "A smoky one-pot stew with crusty bread for dunking.",
    emoji: "🌭",
    minutes: 30,
    servings: 2,
    difficulty: "Easy",
    mainProtein: "pork",
    vibe: "One-pot wonder",
    tags: ["pork", "one-pot", "comfort", "family"],
    ingredients: [
      { id: "sausage", name: "Sausages", amount: "4", price: 3.49, essential: true },
      { id: "beans", name: "White beans", amount: "1 can (400 g)", price: 1.09, essential: true },
      { id: "tomato_sauce", name: "Passata", amount: "400 g", price: 1.49, essential: true },
      { id: "onion", name: "Onion", amount: "1", price: 0.79 },
      { id: "bellpepper", name: "Red pepper", amount: "1", price: 1.19 },
      { id: "bread", name: "Crusty bread", amount: "1 loaf", price: 1.99 }
    ],
    steps: [
      "Brown the sausages in a deep pan, then remove and slice into thick coins.",
      "Soften the onion and pepper in the same pan.",
      "Add the passata, beans and sausages with a splash of water.",
      "Simmer for 15 minutes until thick and smoky.",
      "Serve with torn bread and a grind of black pepper."
    ],
    tip: "A teaspoon of smoked paprika makes the stew taste like it simmered all day."
  },
  {
    id: "tortilla-pizza",
    title: "Crispy tortilla pizza",
    subtitle: "Blistered wraps with tomato, mozzarella and peppery rocket.",
    emoji: "🍕",
    minutes: 20,
    servings: 2,
    difficulty: "Easy",
    mainProtein: "veggie",
    vibe: "Friday night in",
    tags: ["vegetarian", "pizza", "comfort", "quick"],
    ingredients: [
      { id: "tortilla", name: "Large wraps or flatbreads", amount: "2", price: 1.99, essential: true },
      { id: "mozzarella", name: "Mozzarella", amount: "200 g", price: 1.49, essential: true },
      { id: "tomato_sauce", name: "Passata or pizza sauce", amount: "150 g", price: 1.49, essential: true },
      { id: "rucola", name: "Rocket", amount: "handful", price: 1.29 },
      { id: "olives", name: "Olives", amount: "small handful", price: 1.99 },
      { id: "cheese", name: "Parmesan", amount: "30 g", price: 3.29 }
    ],
    steps: [
      "Heat the oven as high as it goes with a baking tray inside.",
      "Spread the wraps with tomato sauce and top with torn mozzarella and olives.",
      "Bake on the hot tray for 6–8 minutes until the edges are crisp and blistered.",
      "Finish with rocket, shaved parmesan and a drizzle of olive oil."
    ],
    tip: "Less sauce than you think and more heat than you dare is the pizza rule."
  },
  {
    id: "cod-creamy-leek",
    title: "Cod with creamy leek & potatoes",
    subtitle: "Flaky white fish, soft leeks and buttery boiled potatoes.",
    emoji: "🐟",
    minutes: 30,
    servings: 2,
    difficulty: "Easy",
    mainProtein: "fish",
    vibe: "Weeknight comfort",
    tags: ["fish", "comfort", "dutch", "gluten-free"],
    ingredients: [
      { id: "whitefish", name: "Cod or pollock fillets", amount: "2 × 150 g", price: 4.99, essential: true },
      { id: "leek", name: "Leek", amount: "2", price: 1.09, essential: true },
      { id: "potato", name: "Baby potatoes", amount: "600 g", price: 1.69, essential: true },
      { id: "cream", name: "Cream", amount: "150 ml", price: 1.09, essential: true },
      { id: "butter", name: "Butter", amount: "30 g", price: 2.29 },
      { id: "lemon", name: "Lemon", amount: "1", price: 0.69 }
    ],
    steps: [
      "Boil the potatoes until tender and drain.",
      "Sweat the sliced leek in butter until soft but not brown.",
      "Pour in the cream and simmer for 3 minutes, then season with salt, pepper and lemon zest.",
      "Place the fish on top, cover and cook gently for 8–10 minutes.",
      "Serve with the potatoes and a squeeze of lemon."
    ],
    tip: "Keep the heat low so the cream stays silky and the fish stays flaky."
  },
  {
    id: "nasi-goreng",
    title: "Nasi goreng with egg",
    subtitle: "Day-old rice, crunchy vegetables and a crispy fried egg.",
    emoji: "🍚",
    minutes: 20,
    servings: 2,
    difficulty: "Easy",
    mainProtein: "veggie",
    vibe: "Leftover hero",
    tags: ["vegetarian", "asian", "quick", "rice"],
    ingredients: [
      { id: "rice", name: "Cooked rice", amount: "400 g", price: 1.09, essential: true },
      { id: "egg", name: "Eggs", amount: "2", price: 1.99, essential: true },
      { id: "mixedveg", name: "Stir-fry vegetables", amount: "300 g", price: 1.79, essential: true },
      { id: "soy", name: "Soy sauce & sambal", amount: "3 tbsp + 1 tsp", price: 1.59, essential: true },
      { id: "onion", name: "Onion", amount: "1", price: 0.79 },
      { id: "garlic", name: "Garlic", amount: "2 cloves", price: 0.59 }
    ],
    steps: [
      "Fry the onion and garlic in a hot wok until fragrant.",
      "Add the vegetables and stir-fry for 3 minutes.",
      "Add the rice, breaking up any clumps, then season with soy sauce and sambal.",
      "Fry until the rice is hot and slightly crisp in places.",
      "Serve topped with a crispy fried egg."
    ],
    tip: "Cold, day-old rice is the secret to proper fried rice."
  }
];
