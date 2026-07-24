# Travel OS RC6 Static Data Contract Audit

Audit date: 2026-07-23  
Scope: RC6 workbook, RC6 restaurant CSV, `app.js`, `functions/api.js`, and repository backend documentation  
Method: static and read-only

## Scope and evidence

The three prior audit documents were confirmed present before inspection:

- `docs/RC6_STATIC_AUDIT.md`
- `docs/ARCHITECTURE_CURRENT.md`
- `docs/TECHNICAL_DEBT.md`

No application file was modified. The workbook was opened in memory with bundled Python 3, `openpyxl` 3.1.5, `data_only=False` for formulas/validations and `data_only=True` for cached formula values. It was never saved or rewritten. The CSV files were read as UTF-8. The application, browser, network endpoints, HTTP server, and deployment were not run.

No `.gs`, `appsscript.json`, or `.clasp.json` file exists in the repository. The deployed Apps Script implementation was therefore **not inspected**. Statements about how it may map tabs, normalize dates, or assemble JSON are explicitly inferred or unknown.

## Executive finding

The RC6 workbook is a rich, internally organized planning workbook, but it is not demonstrably plug-compatible with the current frontend contract.

The legacy data sheets generally align well with the section names and fields used by `app.js`, especially Restaurants, Maps, Phrases, Reservations, Rain Mode, Bathroom, Seasonal, and Transit Cards. However:

- the dedicated RC6 Reservation Assistant, Daily Timeline, Packing Intelligence, and Budget Dashboard sheets are never requested by the frontend;
- the frontend instead derives or hard-codes those RC6 experiences from legacy sheets and local state;
- several important legacy schemas do not match the fields the frontend reads, especially Packing, Money, Flights, GF Konbini, and GF Ryokan;
- typed workbook dates require Apps Script normalization to `YYYY-MM-DD`, but that implementation is absent;
- the frontend's new RC6 views are missing from `VIEW_SECTIONS`, so even compatible legacy data may not load on direct navigation.

The workbook can be a suitable Google Sheet source **only if** the deployed Apps Script contains a deliberate mapping and normalization layer. Without its source or representative endpoint payloads, that cannot be verified.

## Workbook summary

- Sheets: **104**
- Formula cells: **148**
- Data-validation rules: **36**
- Formula cells with blank cached values in the `.xlsx`: **0**
- Main itinerary rows: **17** including outbound and return travel days
- Restaurant rows: **128**
- RC6 CSV rows: **128**
- RC5 and RC6 restaurant CSVs: **byte-for-byte identical** (same SHA-256)
- Workbook Restaurants versus RC6 CSV: identical headers and 128/128 normalized rows

`openpyxl` reported unsupported extension and conditional-formatting-extension warnings while reading. Because the workbook was never saved, no unsupported feature was removed from the source file.

## 1. Workbook inventory

Conventions:

- “Header” is the detected tabular header row. Dashboard/presentation sheets are marked non-tabular.
- Dimensions are Excel used ranges, including formatted but blank rows.
- “Rows” counts nonblank rows below the detected header where a tabular header exists.
- “Likely section” is inferred from names and frontend requests, not verified Apps Script behavior.
- “Consumed” means `app.js` reads that section or likely core source. “Loaded only” means a section is requested but no renderer reads its rows.

| Exact sheet name | Dimensions / rows | Detected header and exact columns | Formulas / validation relevant to app | Likely API section | Consumed by `app.js` |
|---|---:|---|---|---|---|
| `START HERE` | A1:H51 / 35 | Row 6: blank, Step, Action, Why it matters, Done? | None | None | No |
| `⚙️ Control` | A1:H30 / 10 | Row 5: blank, Setting, Value, Notes, blank, Blackout Dates | None; contains typed trip dates and Today Selector | Part of `core` | Probably, through backend-derived selected date |
| `📅 Master Itinerary` | A1:N26 / 17 | Row 4: Day, Date, City, Morning, Afternoon, Evening, Hotel, Theme, Energy, Crowd, Walking, Bring / Hilda Reminder, Notes, Conflict | Energy list; Crowd list | Part of `core` | Yes, through `core.itinerary` / `core.today` |
| `🏠 Home` | A1:H42 | Non-tabular dashboard | 11 formulas: Control/itinerary lookups and reservation counts | None | No; frontend builds its own Home |
| `📱 Today` | A1:F40 | Non-tabular key/value dashboard | 9 Control/itinerary lookup formulas | None | No; frontend builds Today from `core` |
| `👩 Hilda` | A1:D40 | Non-tabular key/value dashboard | 9 Control/itinerary lookup formulas | None | No; frontend builds Hilda from `core` |
| `👨👩 David + Noelle` | A1:H40 | Non-tabular dashboard | 7 Control/itinerary lookup formulas | None | No |
| `👦 Nick` | A1:F35 | Non-tabular dashboard | 7 Control/itinerary lookup formulas | None | No |
| `🗓 Timeline` | A1:Q12 | Row 4 is a horizontal set of dates Sep 30–Oct 16; not a field header | None | None | No |
| `🎟 Reservations` | A1:K40 / 8 | Row 4: Item, Type, City, Target Date, Opens, Status, Owner, Cost, Link / QR, Notes, Urgency | Status validation duplicated over F5:F50 and F5:F100; Owner list | `reservations` | Yes |
| `✈️ Flights` | A1:J40 / 4 | Row 4: Group, Travelers, Route, Airline, Flight #, Depart Date/Time, Arrive Date/Time, Airport, Confirmation, Notes | None | `flights` | Yes |
| `🏨 Hotels` | A1:K40 / 5 | Row 4: City, Area, Hotel, Check-in, Check-out, Nights, Address, Phone, Nearest Station, Maps Link, Notes | None | `hotels` | Yes |
| `🚆 Transit` | A1:H40 / 6 | Row 4: Date, Route, Method, From, To, Reserved?, Luggage Plan, Notes | None | Ambiguous legacy transit | No; app asks for `transitCards` |
| `🧳 Packing` | A1:G40 / 10 | Row 4: Category, Item, David, Noelle, Nick, Hilda, Notes | None | `packing` | Yes, but schema mismatch |
| `🧳 Luggage` | A1:I40 / 6 | Row 4: Date, From, To, Bag Type, Action, Owner, Tracking #, Done?, Notes | None | `luggage` | Loaded only; rows not rendered |
| `💴 Budget` | A1:F40 / 7 | Row 4: Category, Planned, Actual, Remaining, Progress, Notes | 9 Remaining/total formulas | `budget` | Partially |
| `💳 Money` | A1:E40 / 5 | Row 4: Topic, What to know, Action, Helpful detail, Source | None | `money` | Partially; detail columns mismatch |
| `🍜 Food Guide` | A1:D40 / 6 | Row 4: Topic, Tip, Action, Notes | None | None | No |
| `🏪 Konbini` | A1:F40 / 5 | Row 4: Topic, What to know, Phrase, Phonetics, Try / Action, Hilda note | None | `konbini` | Loaded only |
| `🙏 Etiquette` | A1:D40 / 9 | Row 4: Situation, What to do, Why it helps, Simple rule | None | Ambiguous with `etiquetteCards` | No |
| `✅ Pre-Trip` | A1:E40 / 9 | Row 4: Task, Owner, Due, Done?, Notes | None | `pretrip` | Loaded only |
| `🗾 Tokyo Guide` | A1:E40 / 9 | Row 4: Area, Vibe, Highlights, Food / Notes, Best Use | None | `tokyo` | Loaded only |
| `⛩ Kyoto Guide` | A1:E40 / 10 | Row 4: Area / Attraction, Best Time, Why, Notes, Planner Reminder | None | `kyoto` | Loaded only |
| `♨ Hakone + Nara` | A1:D40 / 6 | Row 4: Place, What to do, Notes, Comfort / Hilda tip | None | `hakoneNara` | Loaded only |
| `🇯🇵 Phrases` | A1:G200 / 76 | Row 4: Category, English, Japanese, Romaji, Easy Phonetics, Use, Source / Notes | Category validation | `phrases` | Yes |
| `🚨 Emergency` | A1:F40 / 9 | Row 4: Item, Details, Phone / Link, Japanese Address, Owner, Notes | None | `emergency` | Yes |
| `🗺 Meetups` | A1:I40 / 3 | Row 4: Date, City, Meet Point, Time, Backup, Maps Link, Who, Notes, Status | None | None | No |
| `📚 Sources` | A1:C40 / 12 | Row 4: Source, Used for, Notes | None | None | No |
| `📍 Maps` | A1:I80 / 10 | Row 4: City, Area, Place, Type, Nearest Station, Google Maps Link, Apple Maps Link, Notes, Priority | None | `maps` | Yes |
| `🍽 Restaurants` | A1:AE132 / 128 | Row 4: ID, City, Area, Name, Cuisine, Category, Meal Tags, Breakfast, Lunch, Dinner, Cafe/Dessert, Michelin, Tabelog Research, GF Confidence, Lactose-Free Confidence, Price, Reservation, Must Order / Experience, Notes, Priority, Status, Favorite, Reservation Status, Opening Hours Check, Open Early, Google Maps Link, Tabelog Link, Michelin Source, Official / Booking Link, Last Checked, Dietary Note | Six validation rules for city, meals, priority, research status, favorite, reservation status | `restaurants` | Yes; strongest match |
| `☔ Rain Mode` | A1:H80 / 6 | Row 4: City, Outdoor Plan, Rain Backup, Indoor Option, Taxi Friendly?, Hilda Comfort Note, Maps Link, Notes | None | `rain` | Yes |
| `🚶 Walking` | A1:J80 / 5 | Row 4: Date, Day, City, D+N, Walking Estimate, Step Estimate, Energy, Hilda Rating, Taxi Backup, Notes | 30 formulas linked to itinerary | None | No |
| `🚉 Transit Cards` | A1:J80 / 6 | Row 4: Date, Route, Leave, Arrive, Method, Reservation, Platform / Gate, Luggage, Google Maps Link, Notes | None | `transitCards` | Yes |
| `📷 Journal` | A1:H100 / 15 | Row 4: Date, City, Favorite Meal, Best Moment, Photos Taken?, Rating, Notes, Export Include? | None | `journal` | Partially |
| `🎌 Etiquette Cards` | A1:F80 / 7 | Row 4: Category, Card Title, Do, Don't, Simple Rule, Source | None | `etiquetteCards` | Loaded only |
| `🍱 Food Challenge` | A1:G80 / 10 | Row 4: Food, City/Area, Category, Who Wants It, Tried?, Rating, Notes | None | `foodChallenge` | Loaded only |
| `🏯 Goshuin` | A1:F80 / 8 | Row 4: City, Temple/Shrine, Visited?, Goshuin?, Cash Needed, Notes | None | None | No |
| `🛍 Shopping` | A1:I80 / 8 | Row 4: City, Area, Store / Item, Category, Who, Priority, Bought?, Price, Notes | None | `shopping` | Yes |
| `🆘 Lost Mode` | A1:D80 / 7 | Row 4: Item, Info, Action, Japanese / Notes | B5 formula looks up current hotel | `lost` | Yes |
| `⏳ Countdown` | A1:E80 / 6 | Row 4: Event, Date, Days Remaining, Status, Notes | Four `MAX(0,date-TODAY())` formulas | `countdown` | Yes where loaded |
| `⭐ Phrase Favorites` | A1:G80 / 6 | Row 4: Favorite?, Category, English, Japanese, Romaji, Easy Phonetics, Use | None | `phraseFavorites` | Yes |
| `🍱 Konbini Guide` | A1:E80 / 7 | Row 4: Category, Recommendation, Why Useful, Phrase / Action, Notes | None | `konbiniGuide` | Yes |
| `🚽 Bathroom` | A1:D80 / 5 | Row 4: Topic, What to know, What to do, Notes | None | `bathroom` | Yes |
| `🌸 Seasonal` | A1:F80 / 4 | Row 4: City, Typical October Feel, Clothing, Rain/Typhoon Note, Crowds, Planning Tip | None | `seasonal` | Yes |
| `📅 Res Timeline` | A1:E80 / 8 | Row 4: Month, Task, Owner, Status, Notes | None | `resTimeline` | Yes |
| `🤖 Daily Brief` | A1:C80 / 9 | Row 4: Field, Auto / Fill, Notes | Eight Control/itinerary formulas | `dailyBrief` | Loaded only; frontend brief does not read it |
| `👩 Relax Mode` | A1:C80 / 8 | Row 4: Card, Info, Why it matters | Seven Control/itinerary formulas | None | No |
| `🧩 App Config` | A1:C80 / 10 | Row 4: Setting, Value, Notes | None | `appConfig` | Loaded only |
| `🎓 First-Time Japan` | A1:E80 / 10 | Row 4: Moment, Lesson, What Nick/Hilda Should Know, Action, Priority | None | `firstTime` | Yes |
| `🔔 Smart Alerts` | A1:E80 / 7 | Row 4: Trigger, Message, Who, Source, Enabled | None | `smartAlerts` | Yes |
| `🔐 Privacy` | A1:C80 / 6 | Row 4: Topic, Recommendation, Notes | None | None | No |
| `🧭 Data Model` | A1:F220 / 6 | Row 5: Layer, Update Frequency, Includes, Owner, App Strategy, Notes | None | Documentation | No |
| `🧳 Trip Data Index` | A1:G220 / 15 | Row 5: Sheet, Layer, Purpose, Priority, Used By, Key Fields, Compatibility Note | None | Documentation | No |
| `📚 Reference Data Index` | A1:G220 / 15 | Row 5: Sheet, Layer, Purpose, Priority, Used By, Key Fields, Reuse Note | None | Documentation | No |
| `🔌 App Routes` | A1:F220 / 18 | Row 5: Route, Screen, Purpose, Data Needed, Loading Strategy, Audience | None | Documentation | No |
| `📖 Data Dictionary` | A1:E220 / 15 | Row 5: Field, Sheet(s), Meaning, Format, App Use | None | Documentation | No |
| `📱 Apple Wallet Suica` | A1:D80 / 7 | Row 5: Topic, Recommendation, Notes, Before Trip Status | None | None; frontend Suica is static plus `transitCards` | No direct section |
| `🧭 Context Modes` | A1:F140 / 6 | Row 5: Mode, When It Appears, Primary Purpose, Data Needed, Best For, Future Upgrade | None | Documentation | No |
| `🛠 Admin Plan` | A1:E140 / 7 | Row 5: Admin Form, Writes To, Fields, Priority, Notes | None | Documentation | No |
| `📴 Offline Essentials` | A1:E140 / 8 | Row 5: Essential Info, Source Sheet, Offline Priority, Why It Matters, Status | None | Documentation | No |
| `✅ Confidence Rules` | A1:F140 / 5 | Row 5: Situation, Trigger Keywords, User Message, Audience, Data Source, Priority | None | None; frontend rules are hard-coded | No |
| `☀ Daily Brief Rules` | A1:E140 / 6 | Row 5: Brief Item, When to Show, Message Template, Source, Priority | None | None; frontend rules are hard-coded | No |
| `👥 Family Status` | A1:D140 / 4 | Row 5: Person, Default Status, Useful Statuses, Notes | None | None; frontend status is local | No |
| `🎨 City Art Direction` | A1:E140 / 4 | Row 5: Destination, Header Idea, Mood, Color Notes, David Art Notes | None | None | No |
| `📖 Memory Book Plan` | A1:E140 / 6 | Row 5: Section, Content, Source, Export Later?, Notes | None | None; frontend Memory Book is local | No |
| `🎨 Design System` | A1:D160 / 12 | Row 5: Token Group, Token, Value / Rule, Use | None | Documentation | No |
| `📱 Native App Plan` | A1:F160 / 4 | Row 5: Option, Status, Reason, When to Revisit, Current Decision, Notes | None | Documentation | No |
| `🧪 QA Checklist` | A1:D160 / 10 | Row 5: Area, Test, Expected Result, Status | None | Documentation | No |
| `🧱 Module Roadmap` | A1:D160 / 8 | Row 5: Module, Responsibility, Current Status, Future Work | None | Documentation | No |
| `📱 PWA Roadmap` | A1:E160 / 8 | Row 5: Phase, Focus, What To Build, Priority, Notes | None | Documentation | No |
| `🚀 Release RC1` | A1:F220 / 20 | Row 5: Area, Test, Expected Result, Status, Owner, Priority | Status and priority validations | QA/history | No |
| `👨‍👩‍👦 Family Test Script` | A1:E220 / 4 | Row 5: Person, Tasks, Success Criteria, Status, Notes | None | QA | No |
| `🧾 Content Completion` | A1:D220 / 9 | Row 5: Content Area, Fields To Complete, Priority, Status | None | Documentation | No |
| `💴 Money Hub` | A1:E160 / 6 | Row 5: Feature, Behavior, Data Source, Offline Behavior, Status | None | Documentation | No |
| `💱 Price Guide` | A1:E160 / 8 | Row 5: Category, Typical Yen, Approx USD @145, Judgment, Notes | Eight fixed-rate formulas | None; frontend has hard-coded guide | No |
| `🚀 RC2 Launch Checklist` | A1:F220 / 12 | Row 5: Area, Task, Expected Result, Status, Owner, Priority | Status and priority validations | QA/history | No |
| `🧾 Content Entry Guide` | A1:D220 / 8 | Row 5: Content Area, Fill These Fields First, Good Enough For Testing, Priority | None | Documentation | No |
| `✅ START HERE RC2` | A1:E220 / 10 | Row 5: Step, What To Do, Where, Priority, Done? | Priority/done validations | History | No |
| `🔍 Data Quality` | A1:E220 / 8 | Row 5: Check, Why It Matters, How To Verify, Priority, Status | None | QA | No |
| `✅ START HERE RC2.1` | A1:E220 / 27 | Row 5: Step, Action, Where, Priority, Done? | Priority/done validations | History | No |
| `🧪 RC2.1 QA` | A1:E220 / 10 | Row 5: Test Area, Test, Pass Criteria, Status, Notes | Status validation | QA/history | No |
| `🚩 Missing Data Tracker` | A1:E220 / 8 | Row 5: Data Type, Required Fields, Why It Matters, Status, Owner | Status validation | QA | No |
| `❤️ Peace of Mind` | A1:E220 / 7 | Row 5: Feature, Purpose, Data Source, Offline?, Status | None | Documentation | No |
| `🌾 GF Restaurants` | A1:J220 / 1 | Row 5: Name, City, Area / Station, Cuisine, GF Confidence, What to Order, Cross-Contact Notes, Reservation, Google Maps Link, Source / Confirmed Date | GF-confidence validation | `gfRestaurants` | Yes |
| `🏪 GF Konbini` | A1:H220 / 1 | Row 5: Store, Item, Category, GF Confidence, Label / Ingredient Notes, Cross-Contact Warning, Last Checked, Source | GF-confidence validation | `gfKonbini` | Partially; detail mismatch |
| `♨ GF Ryokan` | A1:I220 / 3 | Row 5: Ryokan, Area, GF Confidence, Private Onsen, Dietary Reply, Cross-Contact Notes, Contact Date, Link, Booking Status | Confidence and booking-status validations | `gfRyokan` | Partially; detail mismatch |
| `💊 Health Checklist` | A1:E220 / 7 | Row 5: Item, Owner, Category, Status, Notes | Status validation | None; frontend medication list is hard-coded/local | No |
| `🧭 Navigation RC3` | A1:F220 / 14 | Row 5: Area, Item, Route, Purpose, Bottom Bar?, Swipe Group | None | Documentation | No |
| `🌃 Osaka Guide` | A1:H220 / 8 | Row 5: Day / Category, Area, Plan / Place, Best Time, Food / Notes, Transit / Access, Map Link, Status | Status validation | `osaka` | Loaded only |
| `👥 Travelers` | A1:E220 / 4 | Row 5: Traveler, Primary Focus, Quick Actions, Bottom Bar Access, Notes | None | None | No |
| `☰ Menu Structure` | A1:D220 / 24 | Row 5: Section, Menu Item, Destination / Tool, Notes | None | Documentation | No |
| `🧪 RC3 Navigation QA` | A1:D220 / 11 | Row 5: Test, Expected Result, Status, Notes | Status validation | QA/history | No |
| `🗓 14-Day Route` | A1:J240 / 17 records | No true field header; row 3 is merged “Day”; row 4 begins data | Status validation on J6:J40; columns implicitly mirror itinerary | Duplicate/alternate core source | No direct request |
| `✦ Smart Mode Rules` | A1:E240 / 8 | Row 5: Context, Trigger, Home Recommendation, Primary Screen, Priority | None | None; frontend rules hard-coded | No |
| `📸 Photo Quest` | A1:D240 / 12 | Row 5: Quest, Category, Completed?, Favorite Photo / Note | Completion validation | None; frontend quest list hard-coded/local | No |
| `🍁 Seasonal Events` | A1:G240 / 5 | Row 5: City, Event / Illumination, Expected Timing, Confirmed 2026?, Ticket / Reservation, Source URL, Notes | Confirmation validation | No current matching request | No |
| `👤 Traveler Preferences` | A1:E240 / 4 | Row 5: Traveler, Default Dashboard, Large Text Recommended?, Primary Needs, Notes | None | None; frontend preferences local | No |
| `🧪 RC4 QA` | A1:D240 / 17 | Row 5: Test, Expected Result, Status, Notes | Status validation | QA/history | No |
| `🍣 Food Explorer RC5` | A1:L36 | Non-tabular dashboard | Nine COUNTIF/COUNTA formulas over Restaurants | None | No; frontend reads Restaurants directly |
| `🧭 Travel Companion RC6` | A1:L30 | Non-tabular dashboard | Six formulas over itinerary/restaurants | No current matching request | No |
| `🎟 Reservation Assistant RC6` | A1:Q44 / 40 | Row 4: Restaurant, City, Area, Priority, Michelin, Meal, Booking Channel, Opening Rule, Target Booking Date, Cancellation Deadline, Deposit, Dietary Request, Confirmation #, Status, Owner, Contact / Booking URL, Notes | Dietary-request and status validations; Excel table `ReservationAssistantRC6` | No current matching request | No; frontend derives assistant from Restaurants |
| `🕒 Daily Timeline RC6` | A1:L106 / 102 | Row 4: Date, Day, City, Start, End, Type, Plan, Area / Station, Reservation, Transit / Walking, Buffer, Notes | Excel table `DailyTimelineRC6` | No current matching request | No; frontend timeline is hard-coded |
| `🎒 Packing Intelligence RC6` | A1:H19 / 15 | Row 4: Context, Item, Who, When, Required, Reason, Packed?, Notes | Packed validation | No current matching request | No; frontend list is hard-coded/local |
| `💹 Budget Dashboard RC6` | A1:L13 / 8 | Row 4: Category, Planned, Actual, Remaining, % Used, Notes, blank, Metric, Value, Notes | 23 remaining, percent, total, and per-day formulas | No current matching request | No; frontend uses legacy Budget + local spend |

## 2. Frontend request inventory

### Direct fetches

| Request | Requesting function | Expected response |
|---|---|---|
| `GET ./api?action=core` | `syncCore()` | JSON object with `ok:true`, `today`, `itinerary`, `selectedDate`, and `selectedDateNice` |
| `GET ./api?action=weather` | `refreshWeather()` | JSON object with `ok:true` plus weather fields |
| `GET ./api?action=section&section=<name>` | `loadSection(name)`, invoked by `ensureSections()` and startup prefetch | `{ok:true, rows:[object,...]}` |
| `GET ./fx` | `refreshFx()` | `{ok:true, rate, source, updatedAt}`; not workbook-backed |

`functions/api.js` copies every query parameter to one hard-coded Apps Script deployment and returns its body without schema validation. It does not reveal tab mapping.

### Section requests and dependent views

Every row below uses `action=section` and expects `{ok:true, rows:[...]}`.

| Section | Current requesting views / startup | Workbook candidate | Renderer use |
|---|---|---|---|
| `appConfig` | admin | `🧩 App Config` | Loaded only |
| `bathroom` | useful, peaceOfMind, bathroom | `🚽 Bathroom` | Yes |
| `budget` | dn, budget, souvenirs, currency, money, david, noelle | `💴 Budget` | Partial |
| `countdown` | timeline | `⏳ Countdown` | Yes; Home does not request it and does not currently render it |
| `dailyBrief` | evening | `🤖 Daily Brief` | Loaded only |
| `emergency` | SOS, search, medical, peaceOfMind, airport; critical prefetch | `🚨 Emergency` | Yes |
| `etiquetteCards` | useful, confidence | `🎌 Etiquette Cards` | Loaded only |
| `firstTime` | academy, confidence | `🎓 First-Time Japan` | Yes |
| `flights` | beforeTrip, airport, reservationsPlus | `✈️ Flights` | Yes |
| `foodChallenge` | food, restaurantsPlus | `🍱 Food Challenge` | Loaded only |
| `gfKonbini` | peaceOfMind | `🏪 GF Konbini` | Partial |
| `gfRestaurants` | peaceOfMind | `🌾 GF Restaurants` | Partial |
| `gfRyokan` | peaceOfMind, hakone | `♨ GF Ryokan` | Partial |
| `hakoneNara` | explore, artDirection, hakone, nara | `♨ Hakone + Nara` | Loaded only |
| `hotels` | peaceOfMind, beforeTrip, airport, transitMode, familyStatus, travelers, reservationsPlus; critical prefetch | `🏨 Hotels` | Partial |
| `journal` | evening, memoryBook, journal | `📷 Journal` | Partial; Memory Book itself is local |
| `konbini` | konbiniExplorer | `🏪 Konbini` | Loaded only |
| `konbiniGuide` | useful, konbiniExplorer | `🍱 Konbini Guide` | Yes |
| `kyoto` | explore, artDirection, kyoto | `⛩ Kyoto Guide` | Loaded only |
| `lost` | lost, search, medical, peaceOfMind; critical prefetch | `🆘 Lost Mode` | Yes |
| `luggage` | packing | `🧳 Luggage` | Loaded only |
| `maps` | maps, search, favorites, explore, peaceOfMind, bathroom, beforeTrip, airport, transitMode, confidence, familyStatus, destinations, travelers, david; critical prefetch | `📍 Maps` | Yes |
| `money` | budget, suica, currency, money, transitMode | `💳 Money` | Partial |
| `osaka` | osaka | `🌃 Osaka Guide` | Loaded only |
| `packing` | dn, packing, beforeTrip, evening, david | `🧳 Packing` | Yes, but incompatible status/person fields |
| `phraseFavorites` | phrases, search, favorites; critical prefetch | `⭐ Phrase Favorites` | Yes |
| `phrases` | phrases, search, favorites, peaceOfMind, konbiniExplorer, airport; critical prefetch | `🇯🇵 Phrases` | Yes |
| `pretrip` | beforeTrip | `✅ Pre-Trip` | Loaded only |
| `rain` | rain, seasonalGuide, seasonalEvents | `☔ Rain Mode` | Yes |
| `resTimeline` | timeline, reservationsPlus | `📅 Res Timeline` | Yes |
| `reservations` | dn, timeline, search, beforeTrip, evening, david, noelle, reservationsPlus | `🎟 Reservations` | Yes |
| `restaurants` | food, search, favorites, explore, confidence, destinations, noelle, restaurantsPlus | `🍽 Restaurants` | Yes |
| `seasonal` | useful, explore, seasonalGuide, destinations, seasonalEvents | `🌸 Seasonal` | Yes, but event screen points at the wrong sheet |
| `shopping` | shopping, search, favorites, explore, souvenirs, osaka, noelle | `🛍 Shopping` | Yes |
| `smartAlerts` | dn, admin | `🔔 Smart Alerts` | Yes |
| `tokyo` | explore, artDirection, tokyo | `🗾 Tokyo Guide` | Loaded only |
| `transitCards` | transit, suica, beforeTrip, airport, transitMode, confidence, osaka, reservationsPlus | `🚉 Transit Cards` | Yes |
| `weather` | evening | No clear sheet | Loaded only; actual weather uses `action=weather` |

The new views `companion`, `timelinePro`, `reservationAssistant`, `liveTransit`, `weatherPlanner`, `packingIntel`, `budgetPro`, `mapExplorer`, and `dailyBriefPro` have no `VIEW_SECTIONS` entry and therefore make no section request when opened directly.

## 3. Renderer field inventory

| Section / action | Frontend fields read | Workbook source and result |
|---|---|---|
| `core` | top level: `today`, `itinerary`, `selectedDate`, `selectedDateNice`; itinerary/today: `Date`, `Date_nice`, `City`, `Morning`, `Afternoon`, `Evening`, `Hotel`, `Theme`, `Energy`, `Crowd`, `Walking`, `Bring / Hilda Reminder`, `Notes` | `📅 Master Itinerary` matches all row fields except `Date_nice`; top-level fields require backend assembly |
| `weather` action | `available`, `city`, `message`, `detail`, `icon`, `highF`, `lowF`, `summary`, `precipProbability`, `bring` | No matching workbook sheet; backend behavior unknown |
| `appConfig` | None | `🧩 App Config` is requested but ignored |
| `bathroom` | `Topic`, `What to know`, `What to do` | Exact |
| `budget` | count; `Category`, `Item`, `Date`, `Yen`, `Amount`, `Notes` | Only Category and Notes exact; Planned/Actual/Remaining/Progress ignored |
| `countdown` | `Event`, `Days Remaining`, fallback `Days`, `Notes` | Exact except optional fallback `Days` |
| `dailyBrief` | None | `🤖 Daily Brief` is requested but ignored |
| `emergency` | `Item`, `Details`, `Phone / Link`, `Notes` | Exact |
| `etiquetteCards` | None | Requested but ignored |
| `firstTime` | `Moment`, `Lesson`, `What Nick/Hilda Should Know`, `Action` | Exact |
| `flights` | `Route`, fallback `Flight`, `Status`, `Notes` | Route and Notes exact; Flight and Status absent |
| `foodChallenge` | None | Requested but ignored |
| `gfKonbini` | `Confidence`, `GF Confidence`, `Item`, `Product`, `Store`, `Notes`, `Warning` | GF Confidence, Item, Store exact; descriptive fields do not match |
| `gfRestaurants` | `Confidence`, `GF Confidence`, `Name`, `Restaurant`, `City`, `Notes`, `What to Order`, `Google Maps Link` | Exact primary fields; aliases absent; What to Order supplies fallback detail |
| `gfRyokan` | `Confidence`, `GF Confidence`, `Ryokan`, `Name`, `Notes`, `Private Onsen`, `Link` | Core identity fields exact; no Notes column, so Dietary Reply/Cross-Contact Notes are ignored |
| `hakoneNara` | None | Requested but ignored |
| `hotels` | `Hotel`, fallback `Name`, `City`, `Notes` | Hotel, City, Notes exact |
| `journal` | `Date`, fallback `Day`, `Notes`, fallback `Memory` | Date and Notes exact |
| `konbini` | None | Requested but ignored |
| `konbiniGuide` | `Recommendation`, `Why Useful`, `Phrase / Action` | Exact |
| `kyoto` | None | Requested but ignored |
| `lost` | `Item`, `Info`, `Action`, `Japanese / Notes` | Exact |
| `luggage` | None | Requested but ignored |
| `maps` | `Place`, `City`, `Type`, `Notes`, `Google Maps Link` | Exact |
| `money` | `Topic`, fallback `Item`, `Notes`, fallback `Details` | Only Topic exact; all useful workbook detail columns are ignored |
| `osaka` | None | Requested but ignored |
| `packing` | `Item`, fallback `Task`, `Status`, fallback `Done`, `Who`, fallback `Traveler`, `Notes` | Item and Notes exact; person/status model is incompatible |
| `phraseFavorites` | `Category`, `English`, `Japanese`, `Romaji`, `Easy Phonetics`, `Use` | Exact |
| `phrases` | `Category`, `English`, `Japanese`, `Romaji`, `Easy Phonetics`, `Use` | Exact |
| `pretrip` | None | Requested but ignored |
| `rain` | `City`, `Outdoor Plan`, `Rain Backup`, `Hilda Comfort Note` | Exact |
| `resTimeline` | `Month`, `Task`, `Status`, `Notes` | Exact |
| `reservations` | `Item`, `Status`, `Urgency`, `Notes`, search fallback `City` | Exact |
| `restaurants` | `ID`, `Name`, `City`, `Area`, `Cuisine`, `Meal Tags`, `Breakfast`, `Lunch`, `Dinner`, `Cafe/Dessert`, `Michelin`, `GF Confidence`, `Lactose-Free Confidence`, `Price`, `Reservation`, `Must Order / Experience`, fallback `Must Order`, `Notes`, `Priority`, `Reservation Status`, `Google Maps Link`, `Tabelog Link`, `Michelin Source`, `Last Checked`, `Dietary Note` | All primary fields exact; `Must Order` is only a fallback alias |
| `seasonal` | `City`, `Typical October Feel`, `Planning Tip`, `Clothing`, `Crowds`, plus event fallbacks `Event`, `Date`, `Timing`, `Notes` | Guide fields exact; event fields absent because `🍁 Seasonal Events` is not requested |
| `shopping` | `City`, `Store / Item`, `Who`, `Priority`, `Notes` | Exact |
| `smartAlerts` | `Trigger`, `Message`, `Who` | Exact |
| `tokyo` | None | Requested but ignored |
| `transitCards` | `Route`, `Method`, `Notes`, `Luggage`, `Reservation` | Exact |
| `weather` section | None | Requested by Evening but ignored |
| `/fx` | `rate`, `updatedAt`, `source` | Provided by `functions/fx.js`, not workbook-backed |

## 4. Contract matrix

Legend:

- **Exact**: frontend field and workbook column match exactly.
- **Probable**: conceptually maps or is an accepted frontend fallback, but backend transformation is needed or unverified.
- **Missing**: no matching workbook column in the likely source.
- **Unknown**: only Apps Script source or live JSON can resolve it.

| Frontend action | Section | Expected field | Workbook sheet | Workbook column | Match | Affected screen | Severity |
|---|---|---|---|---|---|---|---|
| `core` | — | `ok` | — | — | Unknown | Entire app startup | High |
| `core` | — | `itinerary` | `📅 Master Itinerary` | Full table | Probable | All date-driven screens | Critical |
| `core` | — | `today` | `📅 Master Itinerary` | Selected row | Probable | Home, Today, travelers, companion | Critical |
| `core` | — | `selectedDate` | `⚙️ Control` | Value for Today Selector | Probable | Date controls | High |
| `core` | — | `selectedDateNice` | — | — | Missing/derived | Date headings | Medium |
| `core` | — | `Date` | `📅 Master Itinerary` | Date | Exact column; serialization unknown | Date controls | Critical |
| `core` | — | `Date_nice` | `📅 Master Itinerary` | — | Missing/derived | Date headings | Medium |
| `core` | — | `City` | `📅 Master Itinerary` | City | Exact | Most daily screens | Info |
| `core` | — | `Morning` | `📅 Master Itinerary` | Morning | Exact | Today/timeline/brief | Info |
| `core` | — | `Afternoon` | `📅 Master Itinerary` | Afternoon | Exact | Today/timeline/brief | Info |
| `core` | — | `Evening` | `📅 Master Itinerary` | Evening | Exact | Today/timeline/brief | Info |
| `core` | — | `Hotel` | `📅 Master Itinerary` | Hotel | Exact | Traveler/help screens | Info |
| `core` | — | `Theme` | `📅 Master Itinerary` | Theme | Exact | Context text | Info |
| `core` | — | `Energy` | `📅 Master Itinerary` | Energy | Exact | Suggestions/metrics | Info |
| `core` | — | `Crowd` | `📅 Master Itinerary` | Crowd | Exact | Metrics | Info |
| `core` | — | `Walking` | `📅 Master Itinerary` | Walking | Exact | Metrics/suggestions | Info |
| `core` | — | `Bring / Hilda Reminder` | `📅 Master Itinerary` | Bring / Hilda Reminder | Exact | Today/brief | Info |
| `core` | — | `Notes` | `📅 Master Itinerary` | Notes | Exact | Suggestions/context | Info |
| `weather` | — | `available` | — | — | Unknown | Weather cards/planner | High |
| `weather` | — | `city` | — | — | Unknown | Weather cards | Medium |
| `weather` | — | `message` | — | — | Unknown | Weather unavailable state | Low |
| `weather` | — | `detail` | — | — | Unknown | Weather unavailable state | Low |
| `weather` | — | `icon` | — | — | Unknown | Weather cards | Low |
| `weather` | — | `highF` | — | — | Unknown | Weather cards/companion | High |
| `weather` | — | `lowF` | — | — | Unknown | Weather cards | Medium |
| `weather` | — | `summary` | — | — | Unknown | Weather cards | Medium |
| `weather` | — | `precipProbability` | — | — | Unknown | Rain decisions | High |
| `weather` | — | `bring` | — | — | Unknown | Weather cards | Medium |
| `section` | `appConfig` | no fields read | `🧩 App Config` | Setting, Value, Notes | Missing consumer | Admin | Medium |
| `section` | `bathroom` | `Topic` | `🚽 Bathroom` | Topic | Exact | Bathroom/Useful | Info |
| `section` | `bathroom` | `What to know` | `🚽 Bathroom` | What to know | Exact | Bathroom/Useful | Info |
| `section` | `bathroom` | `What to do` | `🚽 Bathroom` | What to do | Exact | Bathroom/Useful | Info |
| `section` | `budget` | `Category` | `💴 Budget` | Category | Exact | Money/Budget | Info |
| `section` | `budget` | `Item` | `💴 Budget` | — | Missing | Money/Budget | Medium |
| `section` | `budget` | `Date` | `💴 Budget` | — | Missing | Money/Budget | Medium |
| `section` | `budget` | `Yen` | `💴 Budget` | — | Missing | Money/Budget | High |
| `section` | `budget` | `Amount` | `💴 Budget` | — | Missing | Money/Budget | High |
| `section` | `budget` | `Notes` | `💴 Budget` | Notes | Exact | Money/Budget | Info |
| `section` | `budget` | planned/actual values | `💴 Budget` | Planned, Actual, Remaining, Progress | Workbook-only; frontend ignores | Budget Dashboard | High |
| `section` | `countdown` | `Event` | `⏳ Countdown` | Event | Exact | Timeline/countdown | Info |
| `section` | `countdown` | `Days Remaining` | `⏳ Countdown` | Days Remaining | Exact formula result | Timeline/countdown | Medium |
| `section` | `countdown` | `Days` | `⏳ Countdown` | — | Missing fallback | Timeline/countdown | Low |
| `section` | `countdown` | `Notes` | `⏳ Countdown` | Notes | Exact | Timeline | Info |
| `section` | `dailyBrief` | no fields read | `🤖 Daily Brief` | Field, Auto / Fill, Notes | Missing consumer | Evening/Home brief | High |
| `section` | `emergency` | `Item` | `🚨 Emergency` | Item | Exact | SOS/Medical | Info |
| `section` | `emergency` | `Details` | `🚨 Emergency` | Details | Exact | SOS/Medical | Info |
| `section` | `emergency` | `Phone / Link` | `🚨 Emergency` | Phone / Link | Exact | SOS/Medical | Info |
| `section` | `emergency` | `Notes` | `🚨 Emergency` | Notes | Exact | SOS | Info |
| `section` | `etiquetteCards` | no fields read | `🎌 Etiquette Cards` | All columns | Missing consumer | Useful/Confidence | Medium |
| `section` | `firstTime` | `Moment` | `🎓 First-Time Japan` | Moment | Exact | Academy | Info |
| `section` | `firstTime` | `Lesson` | `🎓 First-Time Japan` | Lesson | Exact | Academy | Info |
| `section` | `firstTime` | `What Nick/Hilda Should Know` | `🎓 First-Time Japan` | What Nick/Hilda Should Know | Exact | Academy | Info |
| `section` | `firstTime` | `Action` | `🎓 First-Time Japan` | Action | Exact | Academy | Info |
| `section` | `flights` | `Route` | `✈️ Flights` | Route | Exact | Airport/Bookings | Info |
| `section` | `flights` | `Flight` | `✈️ Flights` | Flight # | Probable but punctuation/name differs | Airport/Bookings | Low |
| `section` | `flights` | `Status` | `✈️ Flights` | — | Missing | Airport/Bookings | High |
| `section` | `flights` | `Notes` | `✈️ Flights` | Notes | Exact | Airport/Bookings | Info |
| `section` | `foodChallenge` | no fields read | `🍱 Food Challenge` | All columns | Missing consumer | Food | Medium |
| `section` | `gfKonbini` | `GF Confidence` | `🏪 GF Konbini` | GF Confidence | Exact | Peace of Mind | Info |
| `section` | `gfKonbini` | `Confidence` | `🏪 GF Konbini` | GF Confidence | Probable fallback alias | Peace of Mind | Low |
| `section` | `gfKonbini` | `Item` | `🏪 GF Konbini` | Item | Exact | Peace of Mind | Info |
| `section` | `gfKonbini` | `Product` | `🏪 GF Konbini` | Item | Probable fallback alias | Peace of Mind | Low |
| `section` | `gfKonbini` | `Store` | `🏪 GF Konbini` | Store | Exact | Peace of Mind | Info |
| `section` | `gfKonbini` | `Notes` | `🏪 GF Konbini` | — | Missing | Peace of Mind | Medium |
| `section` | `gfKonbini` | `Warning` | `🏪 GF Konbini` | Cross-Contact Warning | Probable semantic match, not exact | Peace of Mind | Medium |
| `section` | `gfRestaurants` | `GF Confidence` | `🌾 GF Restaurants` | GF Confidence | Exact | Peace of Mind | Info |
| `section` | `gfRestaurants` | `Name` | `🌾 GF Restaurants` | Name | Exact | Peace of Mind | Info |
| `section` | `gfRestaurants` | `City` | `🌾 GF Restaurants` | City | Exact | Peace of Mind | Info |
| `section` | `gfRestaurants` | `What to Order` | `🌾 GF Restaurants` | What to Order | Exact | Peace of Mind | Info |
| `section` | `gfRestaurants` | `Google Maps Link` | `🌾 GF Restaurants` | Google Maps Link | Exact | Peace of Mind | Info |
| `section` | `gfRestaurants` | `Notes` | `🌾 GF Restaurants` | — | Missing, but What to Order fallback exists | Peace of Mind | Low |
| `section` | `gfRyokan` | `GF Confidence` | `♨ GF Ryokan` | GF Confidence | Exact | Peace of Mind | Info |
| `section` | `gfRyokan` | `Ryokan` | `♨ GF Ryokan` | Ryokan | Exact | Peace of Mind | Info |
| `section` | `gfRyokan` | `Private Onsen` | `♨ GF Ryokan` | Private Onsen | Exact | Peace of Mind | Info |
| `section` | `gfRyokan` | `Link` | `♨ GF Ryokan` | Link | Exact | Peace of Mind | Info |
| `section` | `gfRyokan` | `Notes` | `♨ GF Ryokan` | — | Missing | Peace of Mind | High |
| `section` | `gfRyokan` | dietary/cross-contact detail | `♨ GF Ryokan` | Dietary Reply, Cross-Contact Notes | Workbook-only; frontend ignores | Peace of Mind | High |
| `section` | `hakoneNara` | no fields read | `♨ Hakone + Nara` | All columns | Missing consumer | Hakone/Nara/Explore | High |
| `section` | `hotels` | `Hotel` | `🏨 Hotels` | Hotel | Exact | Bookings | Info |
| `section` | `hotels` | `Name` | `🏨 Hotels` | Hotel | Probable fallback alias | Bookings | Low |
| `section` | `hotels` | `City` | `🏨 Hotels` | City | Exact | Bookings | Info |
| `section` | `hotels` | `Notes` | `🏨 Hotels` | Notes | Exact | Bookings | Info |
| `section` | `journal` | `Date` | `📷 Journal` | Date | Exact; serialization unknown | Journal | Medium |
| `section` | `journal` | `Day` | `📷 Journal` | — | Missing fallback | Journal | Low |
| `section` | `journal` | `Notes` | `📷 Journal` | Notes | Exact | Journal | Info |
| `section` | `journal` | `Memory` | `📷 Journal` | Best Moment | Probable semantic fallback, not exact | Journal | Low |
| `section` | `konbini` | no fields read | `🏪 Konbini` | All columns | Missing consumer | Konbini | Medium |
| `section` | `konbiniGuide` | `Recommendation` | `🍱 Konbini Guide` | Recommendation | Exact | Konbini/Useful | Info |
| `section` | `konbiniGuide` | `Why Useful` | `🍱 Konbini Guide` | Why Useful | Exact | Konbini/Useful | Info |
| `section` | `konbiniGuide` | `Phrase / Action` | `🍱 Konbini Guide` | Phrase / Action | Exact | Konbini/Useful | Info |
| `section` | `kyoto` | no fields read | `⛩ Kyoto Guide` | All columns | Missing consumer | Kyoto/Explore | High |
| `section` | `lost` | `Item` | `🆘 Lost Mode` | Item | Exact | Lost | Info |
| `section` | `lost` | `Info` | `🆘 Lost Mode` | Info | Exact | Lost | Info |
| `section` | `lost` | `Action` | `🆘 Lost Mode` | Action | Exact | Lost | Info |
| `section` | `lost` | `Japanese / Notes` | `🆘 Lost Mode` | Japanese / Notes | Exact | Lost | Info |
| `section` | `luggage` | no fields read | `🧳 Luggage` | All columns | Missing consumer | Packing | Medium |
| `section` | `maps` | `Place` | `📍 Maps` | Place | Exact | Maps/Explorer/Search | Info |
| `section` | `maps` | `City` | `📍 Maps` | City | Exact | Maps/Explorer/Search | Info |
| `section` | `maps` | `Type` | `📍 Maps` | Type | Exact | Maps/Explorer | Info |
| `section` | `maps` | `Notes` | `📍 Maps` | Notes | Exact | Maps/Explorer/Search | Info |
| `section` | `maps` | `Google Maps Link` | `📍 Maps` | Google Maps Link | Exact | Maps/Explorer | Info |
| `section` | `money` | `Topic` | `💳 Money` | Topic | Exact | Money/Budget | Info |
| `section` | `money` | `Item` | `💳 Money` | — | Missing fallback | Money/Budget | Low |
| `section` | `money` | `Notes` | `💳 Money` | — | Missing | Money/Budget | High |
| `section` | `money` | `Details` | `💳 Money` | Helpful detail / What to know | Probable semantic match, not exact | Money/Budget | High |
| `section` | `money` | workbook guidance | `💳 Money` | What to know, Action, Helpful detail, Source | Frontend ignores | Money/Budget | High |
| `section` | `osaka` | no fields read | `🌃 Osaka Guide` | All columns | Missing consumer | Osaka | High |
| `section` | `packing` | `Item` | `🧳 Packing` | Item | Exact | Packing/travelers | Info |
| `section` | `packing` | `Task` | `🧳 Packing` | — | Missing fallback | Packing | Low |
| `section` | `packing` | `Status` | `🧳 Packing` | — | Missing | Packing/progress | Critical |
| `section` | `packing` | `Done` | `🧳 Packing` | — | Missing | Packing/progress | Critical |
| `section` | `packing` | `Who` | `🧳 Packing` | David, Noelle, Nick, Hilda | Probable transformation required | Traveler packing | High |
| `section` | `packing` | `Traveler` | `🧳 Packing` | David, Noelle, Nick, Hilda | Probable transformation required | Traveler packing | High |
| `section` | `packing` | `Notes` | `🧳 Packing` | Notes | Exact | Packing | Info |
| `section` | `phraseFavorites` | `Category` | `⭐ Phrase Favorites` | Category | Exact | Phrases/Search | Info |
| `section` | `phraseFavorites` | `English` | `⭐ Phrase Favorites` | English | Exact | Phrases/Search | Info |
| `section` | `phraseFavorites` | `Japanese` | `⭐ Phrase Favorites` | Japanese | Exact | Phrases | Info |
| `section` | `phraseFavorites` | `Romaji` | `⭐ Phrase Favorites` | Romaji | Exact | Phrases | Info |
| `section` | `phraseFavorites` | `Easy Phonetics` | `⭐ Phrase Favorites` | Easy Phonetics | Exact | Phrases | Info |
| `section` | `phraseFavorites` | `Use` | `⭐ Phrase Favorites` | Use | Exact | Phrases/Search | Info |
| `section` | `phrases` | `Category` | `🇯🇵 Phrases` | Category | Exact | Phrases/Search | Info |
| `section` | `phrases` | `English` | `🇯🇵 Phrases` | English | Exact | Phrases/Search | Info |
| `section` | `phrases` | `Japanese` | `🇯🇵 Phrases` | Japanese | Exact | Phrases | Info |
| `section` | `phrases` | `Romaji` | `🇯🇵 Phrases` | Romaji | Exact | Phrases | Info |
| `section` | `phrases` | `Easy Phonetics` | `🇯🇵 Phrases` | Easy Phonetics | Exact | Phrases | Info |
| `section` | `phrases` | `Use` | `🇯🇵 Phrases` | Use | Exact | Phrases/Search | Info |
| `section` | `pretrip` | no fields read | `✅ Pre-Trip` | All columns | Missing consumer | Before Trip | High |
| `section` | `rain` | `City` | `☔ Rain Mode` | City | Exact | Rain/Weather Planner | Info |
| `section` | `rain` | `Outdoor Plan` | `☔ Rain Mode` | Outdoor Plan | Exact | Rain/Weather Planner | Info |
| `section` | `rain` | `Rain Backup` | `☔ Rain Mode` | Rain Backup | Exact | Rain/Weather Planner | Info |
| `section` | `rain` | `Hilda Comfort Note` | `☔ Rain Mode` | Hilda Comfort Note | Exact | Rain/Seasonal | Info |
| `section` | `resTimeline` | `Month` | `📅 Res Timeline` | Month | Exact | Timeline | Info |
| `section` | `resTimeline` | `Task` | `📅 Res Timeline` | Task | Exact | Timeline | Info |
| `section` | `resTimeline` | `Status` | `📅 Res Timeline` | Status | Exact | Timeline | Info |
| `section` | `resTimeline` | `Notes` | `📅 Res Timeline` | Notes | Exact | Timeline | Info |
| `section` | `reservations` | `Item` | `🎟 Reservations` | Item | Exact | Home/Timeline/Search | Info |
| `section` | `reservations` | `Status` | `🎟 Reservations` | Status | Exact | Home/Timeline | Info |
| `section` | `reservations` | `Urgency` | `🎟 Reservations` | Urgency | Exact | Home/Timeline | Info |
| `section` | `reservations` | `Notes` | `🎟 Reservations` | Notes | Exact | Planner/Search | Info |
| `section` | `reservations` | `City` | `🎟 Reservations` | City | Exact | Search fallback | Info |
| `section` | `restaurants` | `ID` | `🍽 Restaurants` | ID | Exact | Food status keys | Info |
| `section` | `restaurants` | `Name` | `🍽 Restaurants` | Name | Exact | Food/Assistant/Maps | Info |
| `section` | `restaurants` | `City` | `🍽 Restaurants` | City | Exact | Food/Assistant/Maps | Info |
| `section` | `restaurants` | `Area` | `🍽 Restaurants` | Area | Exact | Food/Assistant/Maps | Info |
| `section` | `restaurants` | `Cuisine` | `🍽 Restaurants` | Cuisine | Exact | Food/Maps | Info |
| `section` | `restaurants` | `Meal Tags` | `🍽 Restaurants` | Meal Tags | Exact | Food filters/cards | Info |
| `section` | `restaurants` | `Breakfast` | `🍽 Restaurants` | Breakfast | Exact | Food filters | Info |
| `section` | `restaurants` | `Lunch` | `🍽 Restaurants` | Lunch | Exact | Food filters | Info |
| `section` | `restaurants` | `Dinner` | `🍽 Restaurants` | Dinner | Exact | Food filters | Info |
| `section` | `restaurants` | `Cafe/Dessert` | `🍽 Restaurants` | Cafe/Dessert | Exact | Food filters | Info |
| `section` | `restaurants` | `Michelin` | `🍽 Restaurants` | Michelin | Exact | Food/Assistant | Info |
| `section` | `restaurants` | `GF Confidence` | `🍽 Restaurants` | GF Confidence | Exact | Food filters/cards | Info |
| `section` | `restaurants` | `Lactose-Free Confidence` | `🍽 Restaurants` | Lactose-Free Confidence | Exact | Food cards | Info |
| `section` | `restaurants` | `Price` | `🍽 Restaurants` | Price | Exact | Food/Assistant | Info |
| `section` | `restaurants` | `Reservation` | `🍽 Restaurants` | Reservation | Exact | Food/Assistant | Info |
| `section` | `restaurants` | `Must Order / Experience` | `🍽 Restaurants` | Must Order / Experience | Exact | Food cards | Info |
| `section` | `restaurants` | `Must Order` | `🍽 Restaurants` | — | Missing fallback only | Food cards | Low |
| `section` | `restaurants` | `Notes` | `🍽 Restaurants` | Notes | Exact | Food/Search/Maps | Info |
| `section` | `restaurants` | `Priority` | `🍽 Restaurants` | Priority | Exact | Food/Assistant | Info |
| `section` | `restaurants` | `Reservation Status` | `🍽 Restaurants` | Reservation Status | Exact | Food/Assistant fallback | Info |
| `section` | `restaurants` | `Google Maps Link` | `🍽 Restaurants` | Google Maps Link | Exact | Food/Maps/Assistant | Info |
| `section` | `restaurants` | `Tabelog Link` | `🍽 Restaurants` | Tabelog Link | Exact | Food/Assistant | Info |
| `section` | `restaurants` | `Michelin Source` | `🍽 Restaurants` | Michelin Source | Exact | Food | Info |
| `section` | `restaurants` | `Last Checked` | `🍽 Restaurants` | Last Checked | Exact | Food | Info |
| `section` | `restaurants` | `Dietary Note` | `🍽 Restaurants` | Dietary Note | Exact | Assistant | Info |
| `section` | `seasonal` | `City` | `🌸 Seasonal` | City | Exact | Seasonal/Explore | Info |
| `section` | `seasonal` | `Typical October Feel` | `🌸 Seasonal` | Typical October Feel | Exact | Seasonal/Explore | Info |
| `section` | `seasonal` | `Planning Tip` | `🌸 Seasonal` | Planning Tip | Exact | Seasonal/Explore | Info |
| `section` | `seasonal` | `Clothing` | `🌸 Seasonal` | Clothing | Exact | Seasonal | Info |
| `section` | `seasonal` | `Crowds` | `🌸 Seasonal` | Crowds | Exact | Seasonal | Info |
| `section` | `seasonal` | `Event` | `🌸 Seasonal` | — | Missing; exists as Event / Illumination on unused sheet | Seasonal Events | High |
| `section` | `seasonal` | `Date` | `🌸 Seasonal` | — | Missing | Seasonal Events | Medium |
| `section` | `seasonal` | `Timing` | `🌸 Seasonal` | — | Missing; Expected Timing exists on unused sheet | Seasonal Events | High |
| `section` | `seasonal` | `Notes` | `🌸 Seasonal` | — | Missing; exists on unused sheet | Seasonal Events | Medium |
| `section` | `shopping` | `City` | `🛍 Shopping` | City | Exact | Shopping/Search | Info |
| `section` | `shopping` | `Store / Item` | `🛍 Shopping` | Store / Item | Exact | Shopping/Search | Info |
| `section` | `shopping` | `Who` | `🛍 Shopping` | Who | Exact | Shopping | Info |
| `section` | `shopping` | `Priority` | `🛍 Shopping` | Priority | Exact | Shopping | Info |
| `section` | `shopping` | `Notes` | `🛍 Shopping` | Notes | Exact | Shopping/Search | Info |
| `section` | `smartAlerts` | `Trigger` | `🔔 Smart Alerts` | Trigger | Exact | D+N | Info |
| `section` | `smartAlerts` | `Message` | `🔔 Smart Alerts` | Message | Exact | D+N | Info |
| `section` | `smartAlerts` | `Who` | `🔔 Smart Alerts` | Who | Exact | D+N | Info |
| `section` | `tokyo` | no fields read | `🗾 Tokyo Guide` | All columns | Missing consumer | Tokyo/Explore | High |
| `section` | `transitCards` | `Route` | `🚉 Transit Cards` | Route | Exact | Transit/Suica/Live Transit | Info |
| `section` | `transitCards` | `Method` | `🚉 Transit Cards` | Method | Exact | Transit/Suica/Live Transit | Info |
| `section` | `transitCards` | `Notes` | `🚉 Transit Cards` | Notes | Exact | Transit/Suica/Live Transit | Info |
| `section` | `transitCards` | `Luggage` | `🚉 Transit Cards` | Luggage | Exact | Transit/Suica/Live Transit | Info |
| `section` | `transitCards` | `Reservation` | `🚉 Transit Cards` | Reservation | Exact | Transit/Suica/Live Transit | Info |
| `section` | `weather` | no fields read | — | — | Unknown / redundant request | Evening | Medium |
| `/fx` | — | `rate` | — | — | Function response, not workbook | Money | Info |
| `/fx` | — | `updatedAt` | — | — | Function response, not workbook | Money | Info |
| `/fx` | — | `source` | — | — | Function response, not workbook | Money | Info |

## 5. Structural mismatches and unused data

### Requested sections with no matching workbook sheet

- `weather`: no exact workbook tab and no renderer consumes `state.sections.weather`.
- All other named sections have a plausible legacy workbook sheet, but the mapping remains unverified without Apps Script source.

### Workbook sheets never requested by the app

The most consequential are:

- `🎟 Reservation Assistant RC6`
- `🕒 Daily Timeline RC6`
- `🎒 Packing Intelligence RC6`
- `💹 Budget Dashboard RC6`
- `🧭 Travel Companion RC6`
- `🍁 Seasonal Events`
- `📱 Apple Wallet Suica`
- `✅ Confidence Rules`
- `☀ Daily Brief Rules`
- `✦ Smart Mode Rules`
- `📸 Photo Quest`
- `💊 Health Checklist`
- `🚶 Walking`
- `🚆 Transit`
- `🗓 14-Day Route`

All dashboard, plan, QA, index, roadmap, design, privacy, and historical release sheets are also not requested.

### Requested but ignored sheets

The frontend requests these sections but does not read their row objects:

- `appConfig`
- `dailyBrief`
- `etiquetteCards`
- `foodChallenge`
- `hakoneNara`
- `konbini`
- `kyoto`
- `luggage`
- `osaka`
- `pretrip`
- `tokyo`
- `weather`

This produces network/cache work without user-visible content and makes workbook instructions misleading.

### Spelling, capitalization, punctuation, and spacing mismatches

- Flights: frontend `Flight`; workbook `Flight #`.
- Flights: frontend `Status`; workbook has no Status.
- Packing: frontend `Status` / `Done`; workbook has neither.
- Packing: frontend `Who` / `Traveler`; workbook uses four person-named columns.
- Money: frontend `Notes` / `Details`; workbook uses `What to know`, `Action`, and `Helpful detail`.
- Budget: frontend `Yen` / `Amount`; workbook uses `Planned`, `Actual`, `Remaining`, and `Progress`.
- GF Konbini: frontend `Warning`; workbook `Cross-Contact Warning`.
- GF Konbini: frontend `Notes`; workbook `Label / Ingredient Notes`.
- GF Ryokan: frontend `Notes`; workbook separates `Dietary Reply` and `Cross-Contact Notes`.
- Seasonal event view: frontend `Event`, `Date`, `Timing`; event workbook uses `Event / Illumination`, `Expected Timing`, and no exact Date column.
- Hotels: frontend fallback `Name`; workbook primary field is `Hotel` and therefore still works.
- Journal: frontend fallback `Memory`; workbook uses `Best Moment`, but `Notes` is exact and used first.

### Duplicate or ambiguous sheets

- `🚆 Transit` versus `🚉 Transit Cards`
- `🧳 Packing` versus `🎒 Packing Intelligence RC6`
- `💴 Budget` versus `💹 Budget Dashboard RC6`
- `🗓 Timeline`, `📅 Res Timeline`, and `🕒 Daily Timeline RC6`
- `🍽 Restaurants`, `🌾 GF Restaurants`, and `🎟 Reservation Assistant RC6`
- `🏪 Konbini`, `🍱 Konbini Guide`, and `🏪 GF Konbini`
- `🙏 Etiquette` and `🎌 Etiquette Cards`
- `🌸 Seasonal` and `🍁 Seasonal Events`
- `📅 Master Itinerary` and headerless `🗓 14-Day Route`
- workbook dashboards (`🏠 Home`, `📱 Today`, traveler dashboards) versus equivalent frontend-rendered screens

The Apps Script must choose deliberately among these. A simple normalization such as stripping emoji and spaces is insufficient.

### RC5 versus RC6 duplication

`Travel_OS_RC5_Restaurant_Database.csv` and `Travel_OS_RC6_Restaurant_Database.csv` are byte-for-byte identical:

- same SHA-256: `e75bb5e84b22d537c82d832727f77def418d81cb74dfa8f8a1948456fb923bcf`;
- same 31 headers;
- same 128 rows;
- same 128 IDs and names.

The RC6 workbook `🍽 Restaurants` sheet also has the same 31 headers and the same 128 rows after normalizing blank/type representation. The RC5 dashboard remains embedded as `🍣 Food Explorer RC5`.

This is valid release inheritance, but three maintained copies can drift. One canonical source should be designated.

### Formula and blank-value risks

- All 148 workbook formulas currently have cached values in the `.xlsx`.
- Apps Script `getValues()` would normally receive evaluated Sheet values, while an implementation based on formulas or raw export could behave differently. Source is required.
- Countdown, Lost Mode, dashboard, Daily Brief, Walking, and Budget values depend on formulas.
- Many sheets have used ranges extended to row 80, 100, 140, 160, 220, or 240 despite only a handful of nonblank records. A naïve `getDataRange()` serializer that does not filter blank rows could return hundreds of empty objects.
- GF Restaurants has 1 populated data row in a used range ending at row 220; GF Konbini has 1; GF Ryokan has 3.
- `🗓 14-Day Route` has no proper field-header row, so a generic header-row serializer cannot safely expose it.
- Workbook dates are typed datetimes, including itinerary `Date`, Control dates, reservation target dates, Countdown dates, Journal dates, and RC6 timeline dates.
- `app.js` expects `Date` and `selectedDate` values compatible with `<input type="date">` and exact string equality, effectively `YYYY-MM-DD`. ISO timestamps, locale-formatted dates, or Google Sheets serial numbers would break date selection and trip calculations.
- Blank fields are commonly rendered as empty text, but empty arrays are cached as “loaded” and will not be re-requested during that session.

### Fields present but ignored by the frontend

Notable examples:

- Restaurants: Category, Tabelog Research, Status, Favorite, Opening Hours Check, Open Early, Official / Booking Link.
- Maps: Area, Nearest Station, Apple Maps Link, Priority.
- Reservations: Type, Target Date, Opens, Owner, Cost, Link / QR.
- Hotels: Area, check-in/out, Nights, Address, Phone, Nearest Station, Maps Link.
- Transit Cards: Date, Leave, Arrive, Platform / Gate, Google Maps Link.
- Journal: City, Favorite Meal, Best Moment, Photos Taken?, Rating, Export Include?.
- Budget: Planned, Actual, Remaining, Progress.
- Money: What to know, Action, Helpful detail, Source.
- Packing: Category and all four traveler columns.
- GF Konbini: Label / Ingredient Notes, Cross-Contact Warning, Last Checked, Source.
- GF Ryokan: Dietary Reply, Cross-Contact Notes, Contact Date, Booking Status.
- All columns in the dedicated RC6 module sheets.

## 6. Suggested `VIEW_SECTIONS` corrections

These mappings reflect what the **current renderer code actually reads**, not a proposed rewrite to use the dedicated RC6 sheets:

```js
home: ['reservations'],
companion: ['restaurants'],
timelinePro: [],
reservationAssistant: ['restaurants'],
liveTransit: ['transitCards'],
weatherPlanner: ['rain'],
packingIntel: [],
budgetPro: ['budget'],
mapExplorer: ['maps', 'restaurants'],
dailyBriefPro: ['restaurants']
```

Notes:

- `timelinePro` is currently built from `core.today` and hard-coded time blocks.
- `packingIntel` is currently built from `core.today` and a hard-coded item list, with completion stored locally.
- `budgetPro` displays `budgetSummary()` plus local `state.spend` and FX state.
- `dailyBriefPro` uses core, weather, hard-coded packing logic, and restaurant confirmation state.
- If the dedicated RC6 workbook tabs are intended to drive these screens, new API sections and renderer changes are required; adding names to `VIEW_SECTIONS` alone is insufficient.

Other existing dependency problems worth correcting with the same change:

```js
home: ['reservations'],
seasonalEvents: ['seasonal', 'rain'] // current behavior only
```

For the workbook's actual event dataset, a new section such as `seasonalEventsData` mapped to `🍁 Seasonal Events` would be clearer than overloading `seasonal`.

## 7. Limitations and confidence boundaries

### Verified workbook facts

- Exact sheet names, dimensions, detected headers, columns, formulas, cached formula presence, validations, table names, typed dates, and populated-row counts.
- RC5/RC6 restaurant CSV identity.
- RC6 workbook Restaurants-to-CSV header and normalized-row identity.

### Verified frontend facts

- Every fetch call in `app.js`.
- Every named `VIEW_SECTIONS` dependency.
- Every direct section reference and renderer field listed above.
- Missing RC6 view mappings.
- Dedicated RC6 sheets are not named by any frontend request.

### Inferred Apps Script behavior

- `core` probably comes from Control plus Master Itinerary.
- Section names probably map to emoji-prefixed legacy tabs.
- Header rows are probably removed and row objects keyed by header text.
- Date and `Date_nice` values probably require transformation.

These are reasonable inferences only.

### Requires Apps Script source

- Exact action routing for `core`, `weather`, and `section`.
- Exact section-to-sheet map.
- Header-row selection and blank-row filtering.
- Date normalization.
- Formula-value handling.
- Whether aliases such as `Details`, `Status`, `Who`, or `Date_nice` are synthesized.
- Whether any RC6 dedicated sheet is folded into a legacy section response.
- Weather provider and response schema.

### Requires live endpoint testing

- Actual `/api?action=core` response.
- Actual `/api?action=weather` response.
- One sample response for every section, or at least all sections with mismatches.
- Permissions, redirects, latency, failures, and current deployment identity.

No live testing was performed.

## Ten highest-impact contract mismatches

| Rank | Mismatch | Affected screens |
|---:|---|---|
| 1 | RC6 views are absent from `VIEW_SECTIONS`, so direct navigation does not load required legacy sections | Companion, Reservation Assistant, Live Transit, Weather Planner, Budget Dashboard, Map Explorer, Daily Brief |
| 2 | `🎟 Reservation Assistant RC6` is never requested; frontend derives a reduced assistant from Restaurants and loses opening dates, deadlines, deposits, confirmations, owners, and booking URLs | Reservation Assistant |
| 3 | `🕒 Daily Timeline RC6` is never requested; frontend shows six hard-coded time blocks instead of 102 workbook timeline rows | Daily Timeline, Daily Brief |
| 4 | `🎒 Packing Intelligence RC6` is never requested; frontend uses a hard-coded list | Packing Intelligence |
| 5 | Legacy `🧳 Packing` uses person columns and no Status/Done field, so progress remains 0% and traveler filtering cannot work as designed | Packing, Before Trip, David/D+N |
| 6 | `💹 Budget Dashboard RC6` is never requested, while legacy Budget values do not match frontend Yen/Amount fields and local expense entry is absent | Budget Dashboard, Money Hub |
| 7 | Workbook dates are typed datetimes but the frontend requires `YYYY-MM-DD`; normalization cannot be verified without Apps Script | Startup, date controls, trip progress, Journal |
| 8 | Money guidance fields do not match: frontend reads Notes/Details while workbook uses What to know/Action/Helpful detail | Money Hub, Budget |
| 9 | Seasonal Events screen loads `🌸 Seasonal`, not `🍁 Seasonal Events`, so event names/timing/tickets/sources are unavailable | Seasonal Events |
| 10 | Flights has no Status column, and GF Konbini/Ryokan descriptive fields do not match renderer names | Airport/Bookings, Peace of Mind |

## Smallest safe correction plan

1. **Obtain the Apps Script source or payload samples first.** Do not change workbook or frontend contracts until the actual deployed transformation layer is known.
2. **Add only the current-code `VIEW_SECTIONS` mappings** shown above. This fixes navigation-order-dependent empty screens without changing schemas.
3. **Normalize core dates in one backend location** to `YYYY-MM-DD`, and explicitly generate `Date_nice`, `selectedDate`, and `selectedDateNice`.
4. **Add small adapters for legacy mismatches**:
   - Packing: convert person columns to a `Who`/`Status` shape, or update the renderer to understand per-person columns.
   - Money: map `What to know`/`Helpful detail` into the displayed detail.
   - Flights: add or derive `Status`.
   - GF sheets: map Cross-Contact and Dietary fields into displayed text.
5. **Make a product decision for the four RC6 module sheets.** Either expose new sections and render their real rows, or label them workbook-only and remove claims that the app is driven by them.
6. **Add a static contract fixture** containing representative `core`, `weather`, and section JSON. Validate exact field names before any live smoke test.

## Is the workbook suitable as the current Google Sheet source?

**Conditionally, not conclusively.**

It is suitable as a comprehensive planning/content source: the legacy sheets are strong, the restaurant dataset matches perfectly, formulas have cached results, and most established frontend sections have exact columns.

It is **not suitable as a drop-in source under a simple generic tab-to-JSON adapter** because of:

- ambiguous duplicate tabs;
- missing field matches;
- headerless/presentation sheets;
- large formatted blank ranges;
- date normalization requirements;
- ignored dedicated RC6 module sheets.

It becomes suitable if the deployed Apps Script deliberately selects the correct legacy tabs, filters blank rows, returns evaluated values, normalizes dates, assembles core/weather payloads, and aliases the documented mismatched fields.

## Information to supply next

Please supply one of:

1. the actual Apps Script `.gs` source, including any `doGet`, action router, sheet map, date serializer, and weather code; or
2. sanitized saved JSON responses for:
   - `action=core`
   - `action=weather`
   - `action=section&section=packing`
   - `money`
   - `flights`
   - `restaurants`
   - `seasonal`
   - `transitCards`
   - `gfKonbini`
   - `gfRyokan`

With either source, the remaining unknown mappings can be resolved statically without running the application.

## Files changed

No existing file was modified. This task created only:

- `docs/DATA_CONTRACT_AUDIT.md`
