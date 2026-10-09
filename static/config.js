/**
 * GRAND LINE CHRONICLES - CENTRALIZED ASSET DATABASE & CONFIGURATION
 * 
 * Provides stable CDN image references, metadata subtitles, 
 * category-based recommended questions, and self-contained SVG fallbacks.
 */

const GrandLineConfig = {
    // --------------------------------------------------
    // 1. CHARACTER DATABASE
    // --------------------------------------------------
    characters: {
        luffy: {
            name: "Monkey D. Luffy",
            subtitle: "Captain of the Straw Hat Pirates",
            image: "https://cdn.myanimelist.net/images/characters/9/310307.jpg"
        },
        zoro: {
            name: "Roronoa Zoro",
            subtitle: "Straw Hat Chief Swordsman / First Mate",
            image: "https://cdn.myanimelist.net/images/characters/3/100534.jpg"
        },
        nami: {
            name: "Nami",
            subtitle: "Straw Hat Navigator / 'Cat Burglar'",
            image: "https://cdn.myanimelist.net/images/characters/2/263249.jpg"
        },
        usopp: {
            name: "Usopp",
            subtitle: "Straw Hat Sniper / 'God Usopp'",
            image: "https://cdn.myanimelist.net/images/characters/16/100537.jpg"
        },
        sanji: {
            name: "Vinsmoke Sanji",
            subtitle: "Straw Hat Chef / 'Black Leg'",
            image: "https://cdn.myanimelist.net/images/characters/5/100539.jpg"
        },
        chopper: {
            name: "Tony Tony Chopper",
            subtitle: "Straw Hat Doctor / Reindeer",
            image: "https://cdn.myanimelist.net/images/characters/3/481977.jpg"
        },
        robin: {
            name: "Nico Robin",
            subtitle: "Straw Hat Archaeologist / Ohara Survivor",
            image: "https://cdn.myanimelist.net/images/characters/12/100541.jpg"
        },
        franky: {
            name: "Franky",
            subtitle: "Straw Hat Shipwright / Cyborg",
            image: "https://cdn.myanimelist.net/images/characters/12/101897.jpg"
        },
        brook: {
            name: "Brook",
            subtitle: "Straw Hat Musician / 'Soul King' Skeleton",
            image: "https://cdn.myanimelist.net/images/characters/4/102061.jpg"
        },
        jinbe: {
            name: "Jinbe",
            subtitle: "Straw Hat Helmsman / Knight of the Sea",
            image: "https://cdn.myanimelist.net/images/characters/12/157299.jpg"
        },
        shanks: {
            name: "Shanks",
            subtitle: "Captain of the Red Hair Pirates / Emperor",
            image: "https://cdn.myanimelist.net/images/characters/12/100543.jpg"
        },
        blackbeard: {
            name: "Marshall D. Teach",
            subtitle: "Admiral of the Blackbeard Pirates / Emperor",
            image: "https://cdn.myanimelist.net/images/characters/8/101895.jpg"
        },
        mihawk: {
            name: "Dracule Mihawk",
            subtitle: "World's Strongest Swordsman / Cross Guild Leader",
            image: "https://cdn.myanimelist.net/images/characters/7/101885.jpg"
        },
        law: {
            name: "Trafalgar D. Water Law",
            subtitle: "Captain of Heart Pirates / 'Surgeon of Death'",
            image: "https://cdn.myanimelist.net/images/characters/4/119421.jpg"
        },
        kid: {
            name: "Eustass 'Captain' Kid",
            subtitle: "Captain of the Kid Pirates",
            image: "https://cdn.myanimelist.net/images/characters/6/101887.jpg"
        },
        ace: {
            name: "Portgas D. Ace",
            subtitle: "2nd Division Commander of Whitebeard Pirates",
            image: "https://cdn.myanimelist.net/images/characters/4/101869.jpg"
        },
        sabo: {
            name: "Sabo",
            subtitle: "Chief of Staff of the Revolutionary Army",
            image: "https://cdn.myanimelist.net/images/characters/15/263233.jpg"
        },
        dragon: {
            name: "Monkey D. Dragon",
            subtitle: "Supreme Commander of Revolutionary Army",
            image: "https://cdn.myanimelist.net/images/characters/12/101871.jpg"
        },
        roger: {
            name: "Gol D. Roger",
            subtitle: "The Legendary Pirate King",
            image: "https://cdn.myanimelist.net/images/characters/6/114949.jpg"
        },
        whitebeard: {
            name: "Edward Newgate",
            subtitle: "Captain of Whitebeard Pirates / Strongest Man",
            image: "https://cdn.myanimelist.net/images/characters/14/101893.jpg"
        },
        garp: {
            name: "Monkey D. Garp",
            subtitle: "Vice Admiral / Hero of the Marines",
            image: "https://cdn.myanimelist.net/images/characters/10/101889.jpg"
        },
        sengoku: {
            name: "Sengoku the Buddha",
            subtitle: "Former Fleet Admiral of the Marines",
            image: "https://cdn.myanimelist.net/images/characters/8/101879.jpg"
        },
        akainu: {
            name: "Sakazuki (Akainu)",
            subtitle: "Fleet Admiral / Absolute Justice Advocate",
            image: "https://cdn.myanimelist.net/images/characters/9/105423.jpg"
        },
        aokiji: {
            name: "Kuzan (Aokiji)",
            subtitle: "Former Marine Admiral / Blackbeard Ally",
            image: "https://cdn.myanimelist.net/images/characters/11/101875.jpg"
        },
        kizaru: {
            name: "Borsalino (Kizaru)",
            subtitle: "Marine Admiral / Glint-Glint Fruit User",
            image: "https://cdn.myanimelist.net/images/characters/3/101877.jpg"
        },
        fujitora: {
            name: "Issho (Fujitora)",
            subtitle: "Marine Admiral / Blind Swordsman",
            image: "https://cdn.myanimelist.net/images/characters/14/249117.jpg"
        },
        kaido: {
            name: "Kaido the King of Beasts",
            subtitle: "Former Emperor / Strongest Creature",
            image: "https://cdn.myanimelist.net/images/characters/5/341998.jpg"
        },
        big_mom: {
            name: "Charlotte Linlin",
            subtitle: "Captain of Big Mom Pirates / Former Emperor",
            image: "https://cdn.myanimelist.net/images/characters/10/328905.jpg"
        },
        katakuri: {
            name: "Charlotte Katakuri",
            subtitle: "Sweet Commander / Mochi-Mochi Fruit User",
            image: "https://cdn.myanimelist.net/images/characters/15/354027.jpg"
        },
        crocodile: {
            name: "Sir Crocodile",
            subtitle: "Cross Guild Founder / Former Warlord",
            image: "https://cdn.myanimelist.net/images/characters/3/101881.jpg"
        },
        doflamingo: {
            name: "Donquixote Doflamingo",
            subtitle: "Heavenly Yaksha / Former Warlord & King",
            image: "https://cdn.myanimelist.net/images/characters/9/101891.jpg"
        }
    },

    // --------------------------------------------------
    // 2. DEVIL FRUIT DATABASE
    // --------------------------------------------------
    devil_fruits: {
        devil_fruits_overview: {
            name: "Devil Fruits",
            type: "Mystical Fruits of the Sea",
            user: "Various Eaters"
        },
        paramecia: {
            name: "Paramecia Class",
            type: "Superhuman Powers",
            user: "Luffy (former), Robin, Law, Whitebeard"
        },
        zoan: {
            name: "Zoan Class",
            type: "Animal Transformations",
            user: "Chopper, Rob Lucci, Kaido"
        },
        logia: {
            name: "Logia Class",
            type: "Elemental Composition",
            user: "Ace, Sabo, Akainu, Crocodile, Eneru"
        },
        mythical_zoan: {
            name: "Mythical Zoan",
            type: "Legendary Creature Transformation",
            user: "Luffy, Sengoku, Marco, Kaido"
        },
        nika: {
            name: "Hito Hito no Mi, Model: Nika",
            type: "Mythical Zoan (God Nika / Sun God)",
            user: "Monkey D. Luffy"
        }
    },

    // --------------------------------------------------
    // 3. HAKI DATABASE (Abstract styling triggers)
    // --------------------------------------------------
    haki: {
        haki_overview: {
            name: "Haki",
            type: "Spiritual Willpower Force",
            styleClass: "haki-all"
        },
        observation_haki: {
            name: "Kenbunshoku Haki",
            type: "Observation Haki / Future Sight",
            styleClass: "haki-observation"
        },
        armament_haki: {
            name: "Busoshoku Haki",
            type: "Armament Haki / Ryuo Coating",
            styleClass: "haki-armament"
        },
        conquerors_haki: {
            name: "Haoshoku Haki",
            type: "Conqueror's Haki / Willpower Blast",
            styleClass: "haki-conqueror"
        }
    },

    // --------------------------------------------------
    // 4. LOCATIONS / ARCS DATABASE
    // --------------------------------------------------
    locations: {
        grand_line: {
            name: "The Grand Line",
            subtitle: "The Pirate's Graveyard / Sea Route",
            image: "https://cdn.myanimelist.net/images/anime/6/73245.jpg"
        },
        laugh_tale: {
            name: "Laugh Tale",
            subtitle: "The Final Island / Location of the One Piece",
            image: "https://cdn.myanimelist.net/images/anime/6/114949.jpg"
        },
        wano_country: {
            name: "Wano Country",
            subtitle: "The Land of Samurai / Isolationist Nation",
            image: "https://cdn.myanimelist.net/images/anime/1101/116035.jpg"
        },
        wano: {
            name: "Wano Country Arc",
            subtitle: "The Raid on Onigashima / Emperors Defeated",
            image: "https://cdn.myanimelist.net/images/anime/1101/116035.jpg"
        },
        dressrosa: {
            name: "Dressrosa",
            subtitle: "The Kingdom of Toys and Passion / Doflamingo's Domain",
            image: "https://cdn.myanimelist.net/images/anime/3/59385.jpg"
        },
        whole_cake_island: {
            name: "Whole Cake Island",
            subtitle: "Totto Land Archipelago / Big Mom's Territory",
            image: "https://cdn.myanimelist.net/images/anime/12/85148.jpg"
        },
        egghead_island: {
            name: "Egghead Island",
            subtitle: "The Island of the Future / Vegapunk's Lab",
            image: "https://cdn.myanimelist.net/images/anime/1815/140228.jpg"
        },
        egghead: {
            name: "Egghead Arc",
            subtitle: "Future Island / Straw Hats vs Elders & Admiral",
            image: "https://cdn.myanimelist.net/images/anime/1815/140228.jpg"
        },
        marineford: {
            name: "Marineford",
            subtitle: "Marine Headquarters / Summit War Battleground",
            image: "https://cdn.myanimelist.net/images/anime/3/28434.jpg"
        },
        skypiea: {
            name: "Skypiea",
            subtitle: "Island in the Sky / Eneru's Realm",
            image: "https://cdn.myanimelist.net/images/anime/13/11261.jpg"
        },
        water_7_enies_lobby: {
            name: "Enies Lobby / Water 7",
            subtitle: "CP9 Stronghold / Robin's Rescue",
            image: "https://cdn.myanimelist.net/images/anime/10/77514.jpg"
        },
        sabaody: {
            name: "Sabaody Archipelago",
            subtitle: "Red Line Gateway / Worst Generation Gathering",
            image: "https://cdn.myanimelist.net/images/anime/13/12028.jpg"
        },
        alabasta: {
            name: "Alabasta Kingdom",
            subtitle: "Desert Land of Baroque Works / Crocodile's Defeat",
            image: "https://cdn.myanimelist.net/images/anime/6/28169.jpg"
        },
        east_blue: {
            name: "East Blue Saga",
            subtitle: "The Weakest Sea / Crew Origins",
            image: "https://cdn.myanimelist.net/images/anime/6/73245.jpg"
        }
    },

    // --------------------------------------------------
    // 5. SHIPS DATABASE
    // --------------------------------------------------
    ships: {
        going_merry: {
            name: "Going Merry",
            subtitle: "First Straw Hat Pirate Ship / Beloved Companion",
            image: "https://cdn.myanimelist.net/images/characters/14/102057.jpg"
        },
        thousand_sunny: {
            name: "Thousand Sunny",
            subtitle: "Second Straw Hat Ship / Built of Treasure Wood Adam",
            image: "https://cdn.myanimelist.net/images/characters/16/102059.jpg"
        },
        oro_jackson: {
            name: "Oro Jackson",
            subtitle: "The Roger Pirates Ship / Crafted by Tom",
            image: "https://cdn.myanimelist.net/images/characters/6/114949.jpg"
        }
    },

    // --------------------------------------------------
    // 6. CATEGORY RECOMMENDED QUESTIONS CHIPS
    // --------------------------------------------------
    categoryQuestions: {
        straw_hats: [
            "Who is Luffy?",
            "Tell me about Zoro",
            "What is Nami's dream?",
            "Who is Sanji?",
            "Tell me about Nico Robin"
        ],
        devil_fruits: [
            "What is a Devil Fruit?",
            "Tell me about Luffy's fruit",
            "What is a Logia class fruit?",
            "Explain Zoan transformation",
            "What are Paramecia fruits?"
        ],
        haki_powers: [
            "What is Haki?",
            "What is Observation Haki?",
            "Explain Armament Haki",
            "Who has Conqueror's Haki?",
            "What is Ryuo in Wano?"
        ],
        world_history_lore: [
            "What is the Void Century?",
            "Who is Joy Boy?",
            "What are the Poneglyphs?",
            "Who is Imu?",
            "What is the Will of D.?"
        ],
        grand_line_locations: [
            "Where is Laugh Tale?",
            "Tell me about Wano Country",
            "What is Egghead Island?",
            "Explain the Grand Line",
            "What is Marineford?"
        ],
        legends_pirates: [
            "Who is Gol D. Roger?",
            "Tell me about Shanks",
            "Who is Whitebeard?",
            "Tell me about Blackbeard",
            "Who are the Four Emperors?"
        ]
    },

    // --------------------------------------------------
    // 7. CATEGORY METADATA (For SPA Navigator Portal Views)
    // --------------------------------------------------
    categoryMetadata: {
        straw_hats: {
            title: "Straw Hat Pirates Navigation Hub",
            description: "Explore the crew that sails with Captain Monkey D. Luffy. Get details about his swordsman, navigator, chef, doctor, and nakama.",
            image: "https://cdn.myanimelist.net/images/anime/6/73245.jpg"
        },
        devil_fruits: {
            title: "Devil Fruits Archive",
            description: "Explore the mystical fruits of the sea that grant superhuman powers in exchange for losing the ability to swim. Read about Paramecia, Logia, and Zoan classes.",
            image: "https://cdn.myanimelist.net/images/anime/1101/116035.jpg"
        },
        haki_powers: {
            title: "Haki Powers Registry",
            description: "Study the dormant spiritual willpower present in all living beings: Observation Haki (Future Sight), Armament Haki (Ryuo), and Conqueror's Haki.",
            image: "https://cdn.myanimelist.net/images/anime/1188/118228.jpg"
        },
        world_history_lore: {
            title: "World History & Lore Chronicles",
            description: "Unravel the mysteries of the Void Century, the Will of D., the Ancient Weapons, and the Poneglyphs left behind by the ancient civilization.",
            image: "https://cdn.myanimelist.net/images/anime/1209/119973.jpg"
        },
        grand_line_locations: {
            title: "Grand Line Locations Registry",
            description: "Chart the coordinates of islands across the world, from the East Blue to the New World, Wano Country, Egghead, and the legendary Laugh Tale.",
            image: "https://cdn.myanimelist.net/images/anime/1815/140228.jpg"
        },
        legends_pirates: {
            title: "Legends & Great Pirates Archives",
            description: "Read about the legendary figures who shaped the Era of Pirates: Gol D. Roger, Edward Newgate (Whitebeard), Shanks, and the Yonko.",
            image: "https://cdn.myanimelist.net/images/anime/6/114949.jpg"
        }
    },

    // --------------------------------------------------
    // 8. INLINE VECTOR SVG FALLBACK TEMPLATES
    // --------------------------------------------------
    fallbacks: {
        character: "data:image/svg+xml;utf8," + encodeURIComponent(
            `<svg viewBox='0 0 200 200' width='100%' height='100%' xmlns='http://www.w3.org/2000/svg'>
                <rect width='200' height='200' fill='#DFF8FF'/>
                <circle cx='100' cy='100' r='100' fill='none' stroke='#168AC4' stroke-width='2'/>
                <g transform='translate(50, 45)' fill='#F4B72A'>
                    <path d='M50,10 C25,10 10,25 10,50 C10,65 17,77 28,84 L28,95 C28,98 30,100 33,100 L67,100 C70,100 72,98 72,95 L72,84 C83,77 90,65 90,50 C90,25 75,10 50,10 Z' fill-opacity='0.15' stroke='#F4B72A' stroke-width='1.5'/>
                    <circle cx='35' cy='50' r='8' fill='#123047' opacity='0.3'/>
                    <circle cx='65' cy='50' r='8' fill='#123047' opacity='0.3'/>
                    <path d='M42,75 L58,75' stroke='#123047' stroke-width='2' opacity='0.4'/>
                    <path d='M30,90 L30,96 M43,90 L43,96 M57,90 L57,96 M70,90 L70,96' stroke='#F4B72A' stroke-width='2'/>
                    <path d='M10,48 C10,48 20,40 50,40 C80,40 90,48 90,48 C95,48 100,52 100,55 C100,55 90,53 50,53 C10,53 0,55 0,55 C0,52 5,48 10,48 Z' fill='#F4B72A' opacity='0.6'/>
                </g>
            </svg>`
        ),
        devil_fruit: "data:image/svg+xml;utf8," + encodeURIComponent(
            `<svg viewBox='0 0 200 200' width='100%' height='100%' xmlns='http://www.w3.org/2000/svg'>
                <rect width='200' height='200' fill='#DFF8FF'/>
                <g fill='none' stroke='#F4B72A' stroke-width='1.5' transform='translate(50, 40)'>
                    <path d='M50,10 C20,10 10,35 10,60 C10,95 50,110 50,110 C50,110 90,95 90,60 C90,35 80,10 50,10 Z' fill-opacity='0.15' stroke-dasharray='3 3'/>
                    <path d='M40,5 C40,5 45,-15 60,-10' stroke='#168AC4' stroke-width='3' stroke-linecap='round'/>
                    <path d='M25,50 C30,40 40,40 45,50 C50,60 40,70 30,65 C20,60 25,45 35,45' stroke='#F4B72A'/>
                    <path d='M75,65 C80,55 90,55 95,65 C100,75 90,85 80,80 C70,75 75,60 85,60' stroke='#F4B72A'/>
                    <path d='M50,90 C55,80 65,80 70,90 C75,100 65,110 55,105 C45,100 50,85 60,85' stroke='#F4B72A'/>
                </g>
            </svg>`
        ),
        location: "data:image/svg+xml;utf8," + encodeURIComponent(
            `<svg viewBox='0 0 200 200' width='100%' height='100%' xmlns='http://www.w3.org/2000/svg'>
                <rect width='200' height='200' fill='#DFF8FF'/>
                <g stroke='#168AC4' stroke-width='1' fill='none' opacity='0.3'>
                    <line x1='0' y1='100' x2='200' y2='100'/>
                    <line x1='100' y1='0' x2='100' y2='200'/>
                    <circle cx='100' cy='100' r='50'/>
                    <circle cx='100' cy='100' r='80'/>
                </g>
                <g transform='translate(60, 60)'>
                    <path d='M40,0 L48,32 L80,40 L48,48 L40,80 L32,48 L0,40 L32,32 Z' fill='#F4B72A' stroke='#F4B72A' stroke-width='1.5' fill-opacity='0.25'/>
                    <circle cx='40' cy='40' r='5' fill='#123047'/>
                </g>
            </svg>`
        ),
        default: "data:image/svg+xml;utf8," + encodeURIComponent(
            `<svg viewBox='0 0 200 200' width='100%' height='100%' xmlns='http://www.w3.org/2000/svg'>
                <rect width='200' height='200' fill='#DFF8FF'/>
                <circle cx='100' cy='100' r='60' fill='none' stroke='#2A3A52' stroke-width='2'/>
                <g fill='none' stroke='#F4B72A' stroke-width='3' stroke-linecap='round' stroke-linejoin='round' transform='translate(70, 50)'>
                    <line x1='30' y1='10' x2='30' y2='80'/>
                    <circle cx='30' cy='10' r='6'/>
                    <line x1='15' y1='25' x2='45' y2='25'/>
                    <path d='M5,60 C5,85 55,85 55,60'/>
                    <path d='M0,55 L5,60 L12,58 M60,55 L55,60 L48,58'/>
                </g>
            </svg>`
        )
    }
};

window.GrandLineConfig = GrandLineConfig;
