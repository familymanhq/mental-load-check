window.ML = window.ML || {};

ML.CATEGORIES = [
  {
    id: 'meals', name: 'Meals & food', group: 'house',
    short: 'Weekly menu, groceries, cooking, packed lunches, pantry, special diets',
    covers: ['Deciding what the family eats each week', 'Grocery list and shopping', 'Cooking dinners', 'Packed lunches and snacks', 'Keeping the pantry and fridge stocked', 'Special diets, allergies and picky eaters'],
    stages: {
      c: { title: 'Conceive', looksLike: 'Noticing the fridge is low, the week is too busy to cook, or the kids are out of lunch snacks', question: 'Who notices the fridge is low, or that the kids are out of lunch snacks?' },
      p: { title: 'Plan', looksLike: 'Choosing the menu, writing the grocery list, deciding which store and when to go', question: 'Who picks the menu, writes the grocery list and decides when to shop?' },
      e: { title: 'Execute', looksLike: 'Shopping, cooking, packing lunches, cleaning up', question: 'Who shops, cooks, packs the lunches and cleans up?' }
    }
  },
  {
    id: 'clean', name: 'Home cleaning & tidying', group: 'house',
    short: 'Daily tidying, laundry, deep cleans, decluttering, supplies, a cleaner',
    covers: ['Daily tidying, dishes and laundry', 'Bathrooms, floors and surfaces', 'Deep cleans', 'Decluttering and donating', 'Cleaning supplies', 'Hiring and managing a cleaner'],
    stages: {
      c: { title: 'Conceive', looksLike: "Noticing it's time for a deep clean, a closet is overflowing, or the dish soap is nearly out", question: "Who notices it's time for a deep clean, or that supplies are running out?" },
      p: { title: 'Plan', looksLike: 'Setting the routine, deciding who takes which room, booking a cleaner, making the supply list', question: 'Who sets the routine, decides who takes which room, or books a cleaner?' },
      e: { title: 'Execute', looksLike: 'Running the laundry, doing the dishes, scrubbing, carrying out the donation bag', question: 'Who does the laundry, the dishes and the cleaning?' }
    }
  },
  {
    id: 'maint', name: 'Home maintenance & yard', group: 'house',
    short: 'Repairs, filters and batteries, yard and snow, contractors, car upkeep',
    covers: ['Repairs and fix-it jobs', 'Furnace filters, smoke detector batteries, seasonal upkeep', 'Yard work, snow and gardening', 'Finding and managing contractors', 'Appliances and vehicle upkeep'],
    stages: {
      c: { title: 'Conceive', looksLike: 'Noticing the filter is overdue, a gutter is clogged, or the car is due for service', question: 'Who notices the filter is overdue, something is leaking, or the car needs service?' },
      p: { title: 'Plan', looksLike: 'Researching contractors, getting quotes, deciding whether to fix it now or later', question: 'Who gets quotes, picks a contractor and decides whether to fix it now?' },
      e: { title: 'Execute', looksLike: 'Doing the repair, mowing or shoveling, meeting the contractor at the door', question: 'Who does the repair, the yard work and the shoveling, or meets the contractor?' }
    }
  },
  {
    id: 'money', name: 'Money & household admin', group: 'house',
    short: 'Bills, budget, taxes, insurance, subscriptions, big purchases',
    covers: ['Paying bills', 'Budgeting and saving goals', 'Taxes and paperwork', 'Insurance and renewals', 'Subscriptions and accounts', 'Big purchase decisions'],
    stages: {
      c: { title: 'Conceive', looksLike: 'Noticing a bill is due, a renewal is coming, or a subscription is still charging', question: 'Who notices a bill is due, a renewal is coming or a subscription is still charging?' },
      p: { title: 'Plan', looksLike: 'Setting the budget, comparing insurance options, deciding which account pays for what', question: 'Who sets the budget, compares options and decides what gets paid from where?' },
      e: { title: 'Execute', looksLike: 'Paying, filing, calling providers, filling out forms', question: 'Who pays the bills, files the paperwork and makes the calls?' }
    }
  },
  {
    id: 'school', name: "Kids' school", group: 'kids',
    short: 'Forms, teachers, homework, supplies, events, enrollment decisions',
    covers: ['Forms and permission slips', 'Teacher emails and conferences', 'Homework and reading help', 'Supplies, uniforms and spirit days', 'School events, fundraisers and volunteering', 'Enrollment and program decisions'],
    stages: {
      c: { title: 'Conceive', looksLike: 'Noticing a form is due, a spirit day is tomorrow, or a child is struggling with something', question: 'Who notices a form is due, an event is coming or a child is struggling?' },
      p: { title: 'Plan', looksLike: 'Deciding how to answer a teacher, how to handle homework, which school or program fits', question: 'Who decides how to answer a teacher, handle homework or choose a program?' },
      e: { title: 'Execute', looksLike: 'Signing and returning forms, attending conferences, sitting with them at homework, packing the bag', question: 'Who signs the forms, goes to conferences, helps with homework and packs the bag?' }
    }
  },
  {
    id: 'acts', name: "Kids' activities", group: 'kids',
    short: 'Signups, practices, carpools, gear, coaches',
    covers: ['Choosing activities', 'Signups and payments', 'Practice and game schedules', 'Carpools and rides', 'Gear and uniforms', 'Coaches, teachers and other parents'],
    stages: {
      c: { title: 'Conceive', looksLike: 'Noticing registration opens, the season is ending, or a child has outgrown the gear', question: 'Who notices registration is open, the season is ending or the gear no longer fits?' },
      p: { title: 'Plan', looksLike: 'Choosing the activity, working out carpools, fitting practices into the week', question: 'Who chooses the activity, sets up carpools and fits practices into the week?' },
      e: { title: 'Execute', looksLike: 'Signing up, paying, driving, buying gear, staying at practice', question: 'Who signs up, pays, drives and buys the gear?' }
    }
  },
  {
    id: 'health', name: "Kids' health & daily logistics", group: 'kids',
    short: 'Appointments, vaccines, clothes and sizes, routines, sick days',
    covers: ['Doctor and dentist appointments', 'Checkups and vaccines', 'Growth, milestones and development concerns', 'Clothes and shoe sizes', 'Morning and bedtime routines', 'Childcare coverage and sick days'],
    stages: {
      c: { title: 'Conceive', looksLike: "Noticing a checkup is overdue, shoes no longer fit, or a child's behavior has changed", question: "Who notices a checkup is overdue, shoes no longer fit or a child's behavior has changed?" },
      p: { title: 'Plan', looksLike: 'Booking the appointment, deciding who stays home on a sick day, lining up childcare', question: 'Who books the appointment, decides who stays home when someone is sick and lines up childcare?' },
      e: { title: 'Execute', looksLike: "Taking them to appointments, buying clothes, running the routines, staying home when they're sick", question: 'Who takes the kids to appointments, buys the clothes and runs the routines?' }
    }
  },
  {
    id: 'social', name: 'Social & extended family', group: 'family',
    short: 'Birthdays and gifts, holidays, RSVPs, staying in touch, trips',
    covers: ['Birthdays and gifts', 'Holidays and hosting', 'RSVPs and thank-you notes', 'Staying in touch with relatives and friends', 'Visits, trips and vacations'],
    stages: {
      c: { title: 'Conceive', looksLike: "Noticing a birthday is coming, a relative hasn't heard from us, or a trip needs planning", question: "Who notices a birthday is coming, a relative hasn't heard from us or a trip needs planning?" },
      p: { title: 'Plan', looksLike: 'Choosing the gift, deciding who hosts, mapping out the trip', question: 'Who picks the gift, decides who hosts and maps out the trip?' },
      e: { title: 'Execute', looksLike: 'Buying and wrapping, sending cards, making the calls, packing, hosting', question: 'Who buys and wraps, sends the cards, makes the calls and does the hosting?' }
    }
  },
  {
    id: 'emo', name: 'Emotional care', group: 'family',
    short: 'Noticing moods, check-ins, hard talks, comforting kids',
    covers: ['Noticing how each person is feeling', 'Check-ins and support', 'Hard conversations', 'Resolving conflicts', 'Comforting kids and handling big feelings', 'Remembering what matters to each person'],
    stages: {
      c: { title: 'Conceive', looksLike: 'Noticing someone is stressed, a child is withdrawn, or something needs to be talked about', question: 'Who notices someone is stressed, a child is withdrawn or something needs talking about?' },
      p: { title: 'Plan', looksLike: 'Deciding when and how to raise it, what to say, or whether to wait', question: 'Who decides when and how to raise it, and what to say?' },
      e: { title: 'Execute', looksLike: 'Having the conversation, comforting, following up afterward', question: 'Who has the conversation, offers comfort and follows up?' }
    }
  },
  {
    id: 'fam', name: 'Family time & traditions', group: 'family',
    short: 'Outings, date nights, rituals, traditions, organizing fun',
    covers: ['Weekly activities and outings', 'Date nights', 'Family rituals such as movie night or Sunday dinner', 'Holiday traditions', 'Thinking up and organizing things to do together'],
    stages: {
      c: { title: 'Conceive', looksLike: "Noticing the family hasn't done anything fun lately, or that a tradition is coming up", question: "Who notices the family hasn't done anything fun lately, or that a tradition is coming up?" },
      p: { title: 'Plan', looksLike: 'Choosing the activity, booking it, fitting it into the week', question: 'Who picks the activity, books it and fits it in?' },
      e: { title: 'Execute', looksLike: 'Packing, leading, setting up, making it happen on the day', question: 'Who packs, leads and makes it happen on the day?' }
    }
  }
];

ML.GUT_PAGES = [
  { title: 'Around the house', ids: ['meals', 'clean', 'maint', 'money'] },
  { title: 'For the kids', ids: ['school', 'acts', 'health'] },
  { title: 'For the family', ids: ['social', 'emo', 'fam'] }
];

ML.GROUP_ORDER = ['house', 'kids', 'family'];
ML.GROUP_TITLES = { house: 'Around the house', kids: 'For the kids', family: 'For the family' };
ML.GROUP_PHRASE = { house: 'around the house', kids: 'for the kids', family: 'for the family' };
