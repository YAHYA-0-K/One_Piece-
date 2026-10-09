document.addEventListener("DOMContentLoaded", () => {
    // --------------------------------------------------
    // 1. DOM SELECTORS & STATE MANAGEMENT
    // --------------------------------------------------
    const chatInput = document.getElementById("chat-input");
    const sendBtn = document.getElementById("send-btn");
    const chatWindow = document.getElementById("chat-window");
    const messageList = document.getElementById("message-list");
    const welcomeContainer = document.getElementById("welcome-container");
    const typingIndicator = document.getElementById("typing-indicator");
    const typingStatusText = document.getElementById("typing-status-text");
    const clearChatBtn = document.getElementById("clear-chat-btn");
    
    // Header & Mobile drawer controls
    const mobileMenuBtn = document.getElementById("mobile-menu-btn");
    const sidebar = document.getElementById("sidebar");
    const sidebarOverlay = document.getElementById("sidebar-overlay");
    const brandCompass = document.getElementById("brand-compass");
    const brandCompassWrap = document.getElementById("brand-compass-wrap");
    const returnPortBtn = document.getElementById("return-port-btn");
    const headerPortBtn = document.getElementById("header-port-btn");

    // Hero Screen elements
    const heroScreen = document.getElementById("hero-screen");
    const chatAppContainer = document.getElementById("chat-app-container");
    const heroCtaBtn = document.getElementById("hero-cta-btn");
    const heroChipsContainer = document.getElementById("hero-chips-container");
    const heroTopicCards = document.querySelectorAll(".hero-topic-card");

    // Welcome layout fields
    const welcomeTitle = document.getElementById("welcome-title");
    const welcomeSubtitle = document.getElementById("welcome-subtitle");
    const welcomeMessage = document.getElementById("welcome-message");
    const welcomeDescription = document.getElementById("welcome-description");
    const welcomeHeroImg = document.getElementById("welcome-hero-img");
    const suggestedChipsContainer = document.getElementById("suggested-chips-container");
    const returnToChatBtn = document.getElementById("return-to-chat-btn");

    // Sidebar coordinates panel
    const metadataCard = document.getElementById("metadata-card");
    const metadataStats = metadataCard.querySelector(".info-stats");
    const metadataPlaceholder = metadataCard.querySelector(".info-placeholder");
    const valIntent = document.getElementById("val-intent");
    const valConfidence = document.getElementById("val-confidence");
    const valProgress = document.getElementById("val-progress");

    // Central Image override configuration state
    let ImageConfig = {};

    // Default startup layouts
    const DEFAULT_META = {
        title: "GRAND LINE CHRONICLES",
        subtitle: "ONE PIECE AI KNOWLEDGE NAVIGATOR",
        message: "Welcome, Nakama!",
        description: "Ask me anything about the vast world of One Piece, its characters, arcs, Devil Fruits, Haki, bounties, locations, and mysteries.",
        key: "ensemble"
    };

    const DEFAULT_QUESTIONS = [
        "Who is Luffy?",
        "When does Gear 5 appear?",
        "What is Haki?",
        "Who is Joy Boy?",
        "Tell me about Shanks.",
        "What is the Void Century?"
    ];

    if (brandCompass) {
        brandCompass.classList.add("rotating");
    }

    // --------------------------------------------------
    // HERO SCREEN TRANSITION CONTROLLER
    // --------------------------------------------------
    function enterGrandLine(initialQuery = null, targetCategory = null) {
        if (!heroScreen || !chatAppContainer) return;
        
        heroScreen.classList.add("hero-exit");

        setTimeout(() => {
            heroScreen.style.display = "none";
            chatAppContainer.classList.remove("app-hidden");
            chatAppContainer.classList.add("app-enter");

            if (targetCategory) {
                const matchedCategoryItem = document.querySelector(`.category-item[data-category="${targetCategory}"]`);
                if (matchedCategoryItem) {
                    categoryItems.forEach(i => i.classList.remove("active"));
                    matchedCategoryItem.classList.add("active");
                }
                openCategoryPortal(targetCategory);
            }

            if (initialQuery) {
                chatInput.value = initialQuery;
                sendMessage();
            } else {
                chatInput.focus();
            }
        }, 300);
    }

    function returnToPort() {
        if (!heroScreen || !chatAppContainer) return;

        chatAppContainer.classList.add("app-hidden");
        chatAppContainer.classList.remove("app-enter");

        heroScreen.style.display = "flex";
        heroScreen.classList.remove("hero-exit");
        heroScreen.classList.add("hero-enter");

        if (window.innerWidth <= 900 && sidebar) {
            toggleSidebar(false);
        }
    }

    if (heroCtaBtn) {
        heroCtaBtn.addEventListener("click", () => enterGrandLine());
    }

    if (heroChipsContainer) {
        heroChipsContainer.addEventListener("click", (e) => {
            const chip = e.target.closest(".hero-chip");
            if (chip) {
                const query = chip.getAttribute("data-query");
                enterGrandLine(query);
            }
        });
    }

    if (heroTopicCards) {
        heroTopicCards.forEach(card => {
            card.addEventListener("click", () => {
                const topic = card.getAttribute("data-topic");
                enterGrandLine(null, topic);
            });
        });
    }

    if (returnPortBtn) {
        returnPortBtn.addEventListener("click", returnToPort);
    }

    if (headerPortBtn) {
        headerPortBtn.addEventListener("click", returnToPort);
    }

    if (brandCompassWrap) {
        brandCompassWrap.addEventListener("click", returnToPort);
    }

    // Initialize config and run canvas
    initImageConfig().then(() => {
        openCategoryPortal(null);
    });

    // --------------------------------------------------
    // 2. FETCH AND MERGE IMAGE CONFIGURATIONS
    // --------------------------------------------------
    async function initImageConfig() {
        try {
            const response = await fetch("/static/image_config.json");
            if (response.ok) {
                ImageConfig = await response.json();
                console.log("Centralized image configuration loaded successfully.");
            } else {
                throw new Error(`HTTP ${response.status}`);
            }
        } catch (error) {
            console.warn("Failed to fetch image_config.json, using runtime fallback rules:", error);
            ImageConfig = {
                characters: {},
                devil_fruits: {},
                haki: {},
                locations: {},
                ships: {},
                hero: {}
            };
        }
    }

    // Resolves image fallbacks array: Local overrides (png/jpg/jpeg) first, then remote CDN
    function resolveImageArray(category, key) {
        let sources = [];

        // 1. Read from fetched JSON config if mapped
        if (ImageConfig && ImageConfig[category] && ImageConfig[category][key]) {
            sources = [...ImageConfig[category][key]];
        }

        // 2. Generate standard priority files if configuration is empty
        if (sources.length === 0) {
            // Check common local formats
            sources.push(`/static/images/${category}/${key}.png`);
            sources.push(`/static/images/${category}/${key}.jpg`);
            sources.push(`/static/images/${category}/${key}.jpeg`);

            // Attach static config CDN fallbacks
            const fallbackNode = window.GrandLineConfig[category]?.[key] || window.GrandLineConfig[category]?.[key + "_overview"];
            if (fallbackNode && fallbackNode.image) {
                sources.push(fallbackNode.image);
            }
        }

        return sources.filter(src => src && typeof src === "string");
    }

    // Vector SVG fallback icons
    function getFallbackSvg(category) {
        const fallbacks = window.GrandLineConfig.fallbacks;
        if (category === "characters" || category === "legends") return fallbacks.character;
        if (category === "devil_fruits") return fallbacks.devil_fruit;
        if (category === "locations") return fallbacks.location;
        return fallbacks.default;
    }

    // --------------------------------------------------
    // 3. ASYNC IMAGE LOADER & CAROUSEL BUILDER
    // --------------------------------------------------
    function loadMediaWithFallback(imgElement, category, key, cardBody = null) {
        const sources = resolveImageArray(category, key);
        
        if (sources.length === 0) {
            imgElement.src = getFallbackSvg(category);
            imgElement.classList.add("loaded");
            return;
        }

        let loadedSources = [];
        let completedChecks = 0;

        // Perform parallel pre-loading checks to prevent UI blocking
        sources.forEach((src) => {
            const temp = new Image();
            temp.src = src;
            temp.onload = () => {
                loadedSources.push(src);
                completedChecks++;
                if (completedChecks === sources.length) {
                    finalizeMedia();
                }
            };
            temp.onerror = () => {
                completedChecks++;
                if (completedChecks === sources.length) {
                    finalizeMedia();
                }
            };
        });

        function finalizeMedia() {
            // Retain config order priority (local sources first)
            loadedSources.sort((a, b) => sources.indexOf(a) - sources.indexOf(b));

            if (loadedSources.length > 0) {
                imgElement.src = loadedSources[0];
                imgElement.classList.add("loaded");

                // Render clickable thumbnail strip inside character/location cards
                if (loadedSources.length > 1 && cardBody) {
                    // Check if thumbnails already exist
                    if (cardBody.querySelector(".card-thumbnails")) return;

                    const thumbStrip = document.createElement("div");
                    thumbStrip.classList.add("card-thumbnails");

                    loadedSources.forEach((imgSrc, idx) => {
                        const thumb = document.createElement("img");
                        thumb.src = imgSrc;
                        thumb.classList.add("card-thumbnail-img");
                        if (idx === 0) thumb.classList.add("active");

                        thumb.addEventListener("click", (e) => {
                            e.stopPropagation();
                            imgElement.classList.remove("loaded");
                            
                            setTimeout(() => {
                                imgElement.src = imgSrc;
                                imgElement.classList.add("loaded");
                            }, 100);

                            thumbStrip.querySelectorAll(".card-thumbnail-img").forEach(t => t.classList.remove("active"));
                            thumb.classList.add("active");
                        });

                        thumbStrip.appendChild(thumb);
                    });

                    cardBody.appendChild(thumbStrip);
                }
            } else {
                imgElement.src = getFallbackSvg(category);
                imgElement.classList.add("loaded");
            }
        }
    }

    // --------------------------------------------------
    // 4. MOBILE DRAWER NAVIGATION
    // --------------------------------------------------
    function toggleSidebar(open) {
        if (open) {
            sidebar.classList.add("open");
            sidebarOverlay.classList.add("active");
        } else {
            sidebar.classList.remove("open");
            sidebarOverlay.classList.remove("active");
        }
    }

    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener("click", () => toggleSidebar(true));
    }
    if (sidebarOverlay) {
        sidebarOverlay.addEventListener("click", () => toggleSidebar(false));
    }
    window.addEventListener("resize", () => {
        if (window.innerWidth > 900) {
            toggleSidebar(false);
        }
    });

    // --------------------------------------------------
    // 5. INSTANT SPA CATEGORY SELECTORS
    // --------------------------------------------------
    const categoryItems = document.querySelectorAll(".category-item");
    categoryItems.forEach(item => {
        item.addEventListener("click", () => {
            const categoryKey = item.getAttribute("data-category");
            
            categoryItems.forEach(i => i.classList.remove("active"));
            item.classList.add("active");

            openCategoryPortal(categoryKey);

            if (window.innerWidth <= 900) {
                toggleSidebar(false);
            }
        });
    });

    function openCategoryPortal(categoryKey) {
        const config = window.GrandLineConfig;
        let title, subtitle, message, description, heroKey, questions;

        if (categoryKey && config.categoryMetadata[categoryKey]) {
            const meta = config.categoryMetadata[categoryKey];
            title = "GRAND LINE CHRONICLES";
            subtitle = "ONE PIECE AI KNOWLEDGE NAVIGATOR";
            message = meta.title;
            description = meta.description;
            heroKey = categoryKey;
            questions = config.categoryQuestions[categoryKey];
        } else {
            title = DEFAULT_META.title;
            subtitle = DEFAULT_META.subtitle;
            message = DEFAULT_META.message;
            description = DEFAULT_META.description;
            heroKey = DEFAULT_META.key;
            questions = DEFAULT_QUESTIONS;
        }

        // Fast transition
        welcomeContainer.style.opacity = "0";
        welcomeContainer.style.transform = "scale(0.98) translateY(5px)";

        setTimeout(() => {
            welcomeTitle.textContent = title;
            welcomeSubtitle.textContent = subtitle;
            welcomeMessage.textContent = message;
            welcomeDescription.textContent = description;

            // Load category hero visual with priority logic
            welcomeHeroImg.classList.remove("loaded");
            loadMediaWithFallback(welcomeHeroImg, "hero", heroKey);

            suggestedChipsContainer.innerHTML = "";
            questions.forEach((q, idx) => {
                const btn = document.createElement("button");
                btn.classList.add("chip");
                btn.setAttribute("data-question", q);
                btn.style.setProperty("--chip-idx", idx);
                btn.textContent = q;
                suggestedChipsContainer.appendChild(btn);
            });

            if (messageList.children.length > 0) {
                returnToChatBtn.style.display = "inline-block";
            } else {
                returnToChatBtn.style.display = "none";
            }

            messageList.style.display = "none";
            welcomeContainer.style.display = "block";
            
            welcomeContainer.style.opacity = "1";
            welcomeContainer.style.transform = "scale(1) translateY(0)";
            
            scrollToBottom();
        }, 150);
    }

    returnToChatBtn.addEventListener("click", () => {
        categoryItems.forEach(i => i.classList.remove("active"));
        welcomeContainer.style.opacity = "0";
        setTimeout(() => {
            welcomeContainer.style.display = "none";
            messageList.style.display = "flex";
            scrollToBottom();
        }, 150);
    });

    suggestedChipsContainer.addEventListener("click", (e) => {
        const targetChip = e.target.closest(".chip");
        if (targetChip) {
            chatInput.value = targetChip.getAttribute("data-question");
            sendMessage();
        }
    });

    // --------------------------------------------------
    // 6. CLEAR LOG & MODEL RESET
    // --------------------------------------------------
    clearChatBtn.addEventListener("click", () => {
        messageList.innerHTML = "";
        messageList.style.display = "none";
        
        categoryItems.forEach(i => i.classList.remove("active"));
        openCategoryPortal(null);
        resetMetadata();
        scrollToBottom();
    });

    function resetMetadata() {
        metadataPlaceholder.style.display = "block";
        metadataStats.style.display = "none";
        valIntent.textContent = "-";
        valConfidence.textContent = "-";
        valProgress.style.width = "0%";
    }

    function updateMetadata(intent, confidence) {
        if (!intent || intent === "error") {
            resetMetadata();
            return;
        }

        metadataPlaceholder.style.display = "none";
        metadataStats.style.display = "flex";
        valIntent.textContent = intent;
        
        const confPercent = Math.round(confidence * 100);
        valConfidence.textContent = `${confPercent}%`;
        valProgress.style.width = `${confPercent}%`;
    }

    function scrollToBottom() {
        chatWindow.scrollTo({
            top: chatWindow.scrollHeight,
            behavior: "smooth"
        });
    }

    // --------------------------------------------------
    // 7. SEND QUERY & DISPATCH (NO FORCED DELAYS)
    // --------------------------------------------------
    chatInput.addEventListener("input", () => {
        sendBtn.disabled = !chatInput.value.trim();
    });
    sendBtn.disabled = true;

    sendBtn.addEventListener("click", sendMessage);
    chatInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            sendMessage();
        }
    });

    async function sendMessage() {
        const query = chatInput.value.trim();
        if (!query) return;

        chatInput.value = "";
        sendBtn.disabled = true;

        if (welcomeContainer.style.display !== "none") {
            welcomeContainer.style.display = "none";
        }
        messageList.style.display = "flex";

        // Render User bubble immediately
        renderUserMessage(query);
        scrollToBottom();

        // Start processing status feedback
        const spinner = typingIndicator.querySelector(".spinner-icon");
        if (spinner) {
            spinner.classList.add("rotating");
            spinner.style.color = "var(--color-gold-hover)";
        }
        typingStatusText.textContent = "Reading the Grand Line...";
        showTyping(true);
        scrollToBottom();

        try {
            const response = await fetch("/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: query })
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();

            // Swift indicator changes
            typingStatusText.textContent = "Knowledge Found.";
            if (spinner) {
                spinner.style.color = "var(--color-gold)";
            }
            
            await new Promise(resolve => setTimeout(resolve, 150));
            showTyping(false);

            // Render Bot response containing the integrated visual card
            renderBotMessage(data.response, data.intent, data.confidence, data.image);
            updateMetadata(data.intent, data.confidence);

        } catch (error) {
            console.error("Connection failed:", error);
            showTyping(false);
            renderBotMessage("⚠ Navigation disrupted. Unable to reach the Grand Line knowledge server. Please check connection and try again, nakama!", "error", 0.0, null);
            updateMetadata("error", 0.0);
        }

        scrollToBottom();
    }

    function showTyping(visible) {
        if (visible) {
            messageList.appendChild(typingIndicator);
            typingIndicator.style.display = "flex";
        } else {
            typingIndicator.style.display = "none";
            document.body.appendChild(typingIndicator);
        }
    }

    // --------------------------------------------------
    // 8. RENDER USER MESSAGE BUBBLE
    // --------------------------------------------------
    function renderUserMessage(text) {
        const wrapper = document.createElement("div");
        wrapper.classList.add("message-wrapper", "user");

        const bubble = document.createElement("div");
        bubble.classList.add("message-bubble");
        bubble.textContent = text;
        
        wrapper.appendChild(bubble);
        messageList.appendChild(wrapper);
    }

    // --------------------------------------------------
    // 9. INTEGRATED CHARACTER CARD & DYNAMIC IMAGE GENERATION
    // --------------------------------------------------
    function renderBotMessage(text, intent, confidence, imageUrl = null) {
        const wrapper = document.createElement("div");
        wrapper.classList.add("message-wrapper", "bot");

        const config = window.GrandLineConfig || {};

        // Resolve active image from API payload or fallback configuration
        let activeImageUrl = imageUrl;
        if (!activeImageUrl && intent && intent !== "error" && intent !== "unknown") {
            if (config.characters && config.characters[intent]?.image) {
                activeImageUrl = config.characters[intent].image;
            } else if (config.locations && config.locations[intent]?.image) {
                activeImageUrl = config.locations[intent].image;
            } else if (config.ships && config.ships[intent]?.image) {
                activeImageUrl = config.ships[intent].image;
            } else if (ImageConfig) {
                for (const cat of ["characters", "locations", "ships", "devil_fruits", "haki"]) {
                    if (ImageConfig[cat] && ImageConfig[cat][intent]) {
                        const urls = ImageConfig[cat][intent];
                        if (Array.isArray(urls)) {
                            const found = urls.find(u => u && u.startsWith("http"));
                            if (found) {
                                activeImageUrl = found;
                                break;
                            }
                        }
                    }
                }
            }
        }

        // Setup base bubble wrapper container
        const cardBubble = document.createElement("div");
        cardBubble.classList.add("message-bubble");
        
        // Check for spoilers
        let isSpoiler = false;
        if (intent && intent !== "error") {
            const spoilers = ["gear_5", "nika", "joy_boy", "will_of_d", "void_century", "imu", "gorosei", "ancient_weapons", "rocks_pirates"];
            const textLower = text.toLowerCase();
            if (spoilers.includes(intent) || textLower.includes("gear 5") || textLower.includes("sun god nika") || textLower.includes("void century")) {
                isSpoiler = true;
            }
        }

        // RENDER METHOD 1: DYNAMIC AUTOMATED IMAGE CARD (Rounded, subtle gold/ocean border, skeleton loader)
        if (activeImageUrl) {
            const imgCard = document.createElement("div");
            imgCard.classList.add("bot-image-card");

            const skeletonLoader = document.createElement("div");
            skeletonLoader.classList.add("bot-image-skeleton");
            skeletonLoader.innerHTML = `
                <div class="skeleton-shimmer"></div>
                <i class="fa-solid fa-compass fa-spin skeleton-icon"></i>
            `;

            const imgEl = document.createElement("img");
            imgEl.classList.add("bot-card-media");
            imgEl.alt = intent ? intent.replace(/_/g, " ") : "One Piece";
            imgEl.setAttribute("referrerpolicy", "no-referrer");
            imgEl.setAttribute("loading", "lazy");

            // Skeleton dismiss & smooth fade-in blur removal when loaded
            imgEl.onload = () => {
                imgEl.classList.add("loaded");
                skeletonLoader.classList.add("fade-out");
                setTimeout(() => {
                    if (skeletonLoader.parentNode) skeletonLoader.remove();
                }, 350);
            };

            // Gracefully hide image element on 404 or network failure without breaking message text
            imgEl.onerror = () => {
                imgCard.style.display = "none";
                imgCard.remove();
            };

            imgEl.src = activeImageUrl;

            imgCard.appendChild(skeletonLoader);
            imgCard.appendChild(imgEl);

            // Optional metadata badge if entity is known in GrandLineConfig
            let entityNode = null;
            if (config.characters && config.characters[intent]) entityNode = config.characters[intent];
            else if (config.locations && config.locations[intent]) entityNode = config.locations[intent];
            else if (config.ships && config.ships[intent]) entityNode = config.ships[intent];

            if (entityNode && entityNode.name) {
                const badge = document.createElement("div");
                badge.classList.add("bot-image-badge");
                badge.innerHTML = `
                    <span class="badge-title">${entityNode.name}</span>
                    ${entityNode.subtitle ? `<span class="badge-subtitle">${entityNode.subtitle}</span>` : ""}
                `;
                imgCard.appendChild(badge);
            }

            cardBubble.appendChild(imgCard);

            const textEl = document.createElement("div");
            textEl.classList.add("bot-message-body");
            textEl.textContent = text;
            cardBubble.appendChild(textEl);
        }
        // RENDER METHOD 2: DEVIL FRUIT WIDGET (when no explicit image URL)
        else if (config.devil_fruits && config.devil_fruits[intent]) {
            const fruitNode = config.devil_fruits[intent];
            cardBubble.style.padding = "0";
            cardBubble.style.overflow = "hidden";
            cardBubble.innerHTML = `
                <div class="fruit-card" style="max-width: 100%; border: none; margin-top: 0; box-shadow: none;">
                    <div class="fruit-visual-container">
                        <img class="fruit-img" src="${getFallbackSvg('devil_fruits')}" alt="${fruitNode.name}">
                    </div>
                    <h4 class="fruit-name">${fruitNode.name}</h4>
                    <div class="fruit-info-row">
                        <span class="fruit-label">Type:</span>
                        <span class="fruit-val">${fruitNode.type}</span>
                    </div>
                    <div class="fruit-info-row" style="margin-bottom: 12px;">
                        <span class="fruit-label">User:</span>
                        <span class="fruit-val">${fruitNode.user}</span>
                    </div>
                    <p style="font-size: 14px; line-height: 1.6; color: var(--color-text-primary); border-top: 1px solid rgba(18,48,71,0.06); padding-top: 12px;">${text}</p>
                </div>
            `;
            const fruitImgEl = cardBubble.querySelector(".fruit-img");
            loadMediaWithFallback(fruitImgEl, "devil_fruits", intent);
        }
        // RENDER METHOD 3: HAKI WIDGET
        else if (config.haki && config.haki[intent]) {
            const hakiNode = config.haki[intent];
            cardBubble.style.padding = "0";
            cardBubble.style.overflow = "hidden";
            cardBubble.innerHTML = `
                <div class="haki-card ${hakiNode.styleClass}" style="max-width: 100%; border: none; margin-top: 0; box-shadow: none;">
                    <h4 class="haki-title">${hakiNode.name}</h4>
                    <span class="haki-type" style="margin-bottom: 15px; display: inline-block;">${hakiNode.type}</span>
                    <p style="font-size: 14px; line-height: 1.6; color: var(--color-text-primary); z-index: 5; position: relative;">${text}</p>
                </div>
            `;
        }
        // DEFAULT PLAIN BOT RESPONSE BUBBLE
        else {
            const textEl = document.createElement("div");
            textEl.classList.add("bot-message-body");
            textEl.textContent = text;
            cardBubble.appendChild(textEl);
        }

        // Apply spoiler warnings overlay on spoiler tags (World Government Emergency Intercept)
        if (isSpoiler) {
            const spoilerBox = document.createElement("div");
            spoilerBox.classList.add("spoiler-wrapper");
            
            cardBubble.classList.add("spoiler-content");
            spoilerBox.appendChild(cardBubble);

            const overlay = document.createElement("div");
            overlay.classList.add("spoiler-overlay");
            overlay.innerHTML = `
                <div class="spoiler-header">
                    <span class="spoiler-siren-icon"><i class="fa-solid fa-triangle-exclamation"></i></span>
                    <span class="spoiler-warning-title">⚠️ WORLD GOVERNMENT EMERGENCY INTERCEPT ⚠️</span>
                    <span class="spoiler-siren-icon"><i class="fa-solid fa-triangle-exclamation"></i></span>
                </div>
                <div class="spoiler-tag-badge">
                    <i class="fa-solid fa-shield-halved"></i> CLASS-OMEGA VOID CENTURY PROHIBITION
                </div>
                <p class="spoiler-warning-desc">
                    Halt, scholar. Inquiring into the Blank 900 Years or classified Grand Line secrets is high treason. The Five Elders (Gorosei) have authorized an immediate Buster Call upon your coordinates. Turn back or face annihilation.
                </p>
                <div class="spoiler-cipher-line">
                    <span class="cipher-symbol">𐤀</span>
                    <span class="cipher-status">CIPHER POL LOCK ENGAGED &bull; BUSTER CALL PENDING</span>
                    <span class="cipher-symbol">𐤁</span>
                </div>
                <button class="spoiler-reveal-btn" aria-label="Defy the World Government and Unseal">
                    <i class="fa-solid fa-skull-crossbones"></i> [ DEFY THE WORLD GOVERNMENT & UNSEAL ]
                </button>
            `;

            overlay.querySelector(".spoiler-reveal-btn").addEventListener("click", () => {
                // Dramatic Poneglyph deciphering & unseal dissolve transition
                spoilerBox.classList.add("unsealing");
                overlay.classList.add("dissolving");

                setTimeout(() => {
                    spoilerBox.classList.remove("unsealing");
                    spoilerBox.classList.add("revealed");
                    overlay.remove();
                }, 650);
            });

            spoilerBox.appendChild(overlay);
            wrapper.appendChild(spoilerBox);
        } else {
            wrapper.appendChild(cardBubble);
        }

        // Actions panel for copying response content
        const actions = document.createElement("div");
        actions.classList.add("message-actions");

        const copyBtn = document.createElement("button");
        copyBtn.classList.add("message-btn");
        copyBtn.setAttribute("data-tooltip", "Copy to Clipboard");
        copyBtn.innerHTML = `<i class="fa-solid fa-copy"></i> Copy`;

        copyBtn.addEventListener("click", () => {
            navigator.clipboard.writeText(text).then(() => {
                copyBtn.innerHTML = `<i class="fa-solid fa-check"></i> Copied!`;
                copyBtn.setAttribute("data-tooltip", "Success!");
                copyBtn.classList.add("copied");
                setTimeout(() => {
                    copyBtn.innerHTML = `<i class="fa-solid fa-copy"></i> Copy`;
                    copyBtn.setAttribute("data-tooltip", "Copy to Clipboard");
                    copyBtn.classList.remove("copied");
                }, 1500);
            });
        });
        actions.appendChild(copyBtn);

        // Technical details drawer inside card
        if (intent && intent !== "error" && intent !== "unknown") {
            const confPercent = Math.round(confidence * 100);
            const technicalDetails = document.createElement("details");
            technicalDetails.classList.add("tech-info-details");
            technicalDetails.innerHTML = `
                <summary class="tech-info-summary">Technical Info <i class="fa-solid fa-chevron-down"></i></summary>
                <div class="tech-info-content">
                    <div class="stat-row">
                        <span class="stat-label">Detected Intent:</span>
                        <span class="stat-value" style="font-size: 13px; font-family: var(--font-body);">${intent}</span>
                    </div>
                    <div class="stat-row">
                        <span class="stat-label">Confidence:</span>
                        <span class="stat-value" style="font-size: 13px; font-family: var(--font-body);">${confPercent}%</span>
                    </div>
                </div>
            `;
            
            technicalDetails.addEventListener("toggle", () => {
                if (technicalDetails.open) {
                    updateMetadata(intent, confidence);
                }
            });

            wrapper.appendChild(technicalDetails);
        }

        wrapper.appendChild(actions);
        messageList.appendChild(wrapper);
    }

    // --------------------------------------------------
    // 10. DEEP OCEAN ABYSS CANVAS ENGINE (BIOLUMINESCENCE & BUBBLES)
    // --------------------------------------------------
    const canvas = document.getElementById("ambient-bg");
    const ctx = canvas.getContext("2d");

    let bubbles = [];
    let plankton = [];
    let waveOffset = 0;
    
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        initAbyssElements();
    }

    // Rising Sea Bubble Simulation
    class SeaBubble {
        constructor(randomY = true) {
            this.reset(randomY);
        }

        reset(randomY = false) {
            this.x = Math.random() * canvas.width;
            this.y = randomY ? Math.random() * canvas.height : canvas.height + Math.random() * 50;
            this.radius = Math.random() * 8 + 2.5; // Bubble radius: 2.5px to 10.5px
            this.speed = Math.random() * 1.2 + 0.6; // Upward rise speed
            this.wobbleSpeed = Math.random() * 0.03 + 0.015;
            this.wobbleAmp = Math.random() * 12 + 4;
            this.angle = Math.random() * Math.PI * 2;
            this.opacity = Math.random() * 0.35 + 0.15;
        }

        update() {
            this.y -= this.speed;
            this.angle += this.wobbleSpeed;
            this.currentX = this.x + Math.sin(this.angle) * this.wobbleAmp;

            if (this.y < -30) {
                this.reset(false);
            }
        }

        draw() {
            ctx.save();
            ctx.beginPath();
            ctx.arc(this.currentX, this.y, this.radius, 0, Math.PI * 2);
            
            // Translucent inner fluid
            ctx.fillStyle = `rgba(56, 189, 248, ${this.opacity * 0.12})`;
            ctx.fill();

            // Glass bubble outer rim
            ctx.strokeStyle = `rgba(180, 230, 255, ${this.opacity * 0.75})`;
            ctx.lineWidth = 1;
            ctx.stroke();

            // Specular highlight orb (top-left glint)
            const hlRadius = Math.max(1, this.radius * 0.28);
            const hlX = this.currentX - this.radius * 0.38;
            const hlY = this.y - this.radius * 0.38;

            ctx.beginPath();
            ctx.arc(hlX, hlY, hlRadius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity * 0.9})`;
            ctx.fill();

            // Secondary subtle bottom-right reflection
            if (this.radius > 5) {
                ctx.beginPath();
                ctx.arc(this.currentX + this.radius * 0.3, this.y + this.radius * 0.3, this.radius * 0.15, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(142, 218, 255, ${this.opacity * 0.45})`;
                ctx.fill();
            }

            ctx.restore();
        }
    }

    // Glowing Bioluminescent Ocean Plankton / Particle
    class BioluminescentParticle {
        constructor() {
            this.reset();
            this.y = Math.random() * canvas.height;
        }

        reset() {
            this.x = Math.random() * canvas.width;
            this.y = canvas.height + Math.random() * 40;
            this.radius = Math.random() * 2.2 + 1.0;
            this.vx = (Math.random() - 0.5) * 0.35;
            this.vy = -(Math.random() * 0.45 + 0.12);
            
            // 65% Bioluminescent Cyan/Aquamarine, 35% Pirate Gold
            const isGold = Math.random() > 0.65;
            if (isGold) {
                this.color = { r: 245, g: 166, b: 35 }; // #f5a623 Pirate Gold
            } else {
                this.color = Math.random() > 0.5 
                    ? { r: 45, g: 212, b: 191 }  // Cyan/Teal #2dd4bf
                    : { r: 56, g: 189, b: 248 }; // Azure #38bdf8
            }

            this.baseAlpha = Math.random() * 0.4 + 0.35;
            this.pulsePhase = Math.random() * Math.PI * 2;
            this.pulseSpeed = Math.random() * 0.04 + 0.02;
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;
            this.pulsePhase += this.pulseSpeed;

            if (this.y < -20 || this.x < -20 || this.x > canvas.width + 20) {
                this.reset();
            }
        }

        draw() {
            const currentAlpha = Math.max(0.08, this.baseAlpha + Math.sin(this.pulsePhase) * 0.22);
            const glowRadius = this.radius * 4.5;

            ctx.save();
            // Radial glowing halo
            const halo = ctx.createRadialGradient(
                this.x, this.y, 0,
                this.x, this.y, glowRadius
            );
            halo.addColorStop(0, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${currentAlpha * 0.85})`);
            halo.addColorStop(0.4, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${currentAlpha * 0.3})`);
            halo.addColorStop(1, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, 0)`);

            ctx.fillStyle = halo;
            ctx.beginPath();
            ctx.arc(this.x, this.y, glowRadius, 0, Math.PI * 2);
            ctx.fill();

            // Concentrated bright core dot
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius * 0.7, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(1, currentAlpha * 1.2)})`;
            ctx.fill();

            ctx.restore();
        }
    }

    function initAbyssElements() {
        bubbles = [];
        plankton = [];

        // Number of bubbles scaled to screen width
        const bubbleCount = Math.min(42, Math.max(18, Math.floor(canvas.width / 45)));
        for (let i = 0; i < bubbleCount; i++) {
            bubbles.push(new SeaBubble(true));
        }

        // Bioluminescent particles
        const planktonCount = Math.min(50, Math.max(25, Math.floor(canvas.width / 35)));
        for (let i = 0; i < planktonCount; i++) {
            plankton.push(new BioluminescentParticle());
        }
    }

    // Subtle Log Pose Nautical Compass on Background
    function drawLogPoseCompass(x, y, radius) {
        ctx.save();
        ctx.strokeStyle = "rgba(245, 166, 35, 0.08)";
        ctx.lineWidth = 1;
        
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(x, y, radius - 8, 0, Math.PI * 2);
        ctx.stroke();

        // Crosshairs
        ctx.strokeStyle = "rgba(56, 189, 248, 0.06)";
        ctx.beginPath();
        ctx.moveTo(x - radius - 10, y);
        ctx.lineTo(x + radius + 10, y);
        ctx.moveTo(x, y - radius - 10);
        ctx.lineTo(x, y + radius + 10);
        ctx.stroke();

        // 8-point compass star points
        ctx.fillStyle = "rgba(245, 166, 35, 0.05)";
        ctx.beginPath();
        ctx.moveTo(x, y - radius + 2);
        ctx.lineTo(x + 7, y - 6);
        ctx.lineTo(x, y);
        ctx.lineTo(x - 7, y - 6);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(x, y + radius - 2);
        ctx.lineTo(x + 7, y + 6);
        ctx.lineTo(x, y);
        ctx.lineTo(x - 7, y + 6);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.restore();
    }

    // Faint Nautical Grand Line Grid Coordinates
    function drawNauticalCoordinates() {
        ctx.save();
        ctx.strokeStyle = "rgba(245, 166, 35, 0.035)";
        ctx.setLineDash([4, 16]);
        ctx.lineWidth = 1;

        for (let y = 120; y < canvas.height; y += 190) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
            ctx.fillStyle = "rgba(142, 168, 195, 0.18)";
            ctx.font = "9px Outfit, sans-serif";
            ctx.fillText(`${Math.floor(y / 12)}° 40' S`, 14, y - 5);
        }

        for (let x = 140; x < canvas.width; x += 280) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
            ctx.fillStyle = "rgba(142, 168, 195, 0.18)";
            ctx.font = "9px Outfit, sans-serif";
            ctx.fillText(`${Math.floor(x / 14)}° 15' E`, x + 5, 18);
        }

        ctx.restore();
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 1. Deep Ocean Abyss Background Gradient (#07111e to #040913)
        const abyssGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
        abyssGrad.addColorStop(0, "#07111e"); 
        abyssGrad.addColorStop(0.5, "#060e1a");
        abyssGrad.addColorStop(1, "#040913"); 
        ctx.fillStyle = abyssGrad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 2. Ambient Deep Sea Illumination (Central/Bottom glow)
        const abyssGlow = ctx.createRadialGradient(
            canvas.width * 0.5, canvas.height * 0.85, 20,
            canvas.width * 0.5, canvas.height * 0.85, canvas.width * 0.65
        );
        abyssGlow.addColorStop(0, "rgba(13, 30, 51, 0.45)");
        abyssGlow.addColorStop(0.5, "rgba(20, 48, 77, 0.15)");
        abyssGlow.addColorStop(1, "rgba(4, 9, 19, 0)");
        ctx.fillStyle = abyssGlow;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 3. Faint Nautical Coordinates & Log Pose Compass
        drawNauticalCoordinates();
        drawLogPoseCompass(canvas.width - 160, 160, 65);

        // 4. Glowing Bioluminescent Particles / Plankton
        for (let p of plankton) {
            p.update();
            p.draw();
        }

        // 5. Rising Sea Bubbles
        for (let b of bubbles) {
            b.update();
            b.draw();
        }

        // 6. Deep Abyss Undersea Current Waves
        ctx.save();
        ctx.fillStyle = "rgba(13, 30, 51, 0.25)";
        ctx.beginPath();
        ctx.moveTo(0, canvas.height);
        for (let x = 0; x <= canvas.width; x += 25) {
            let y = canvas.height - 40 + Math.sin(x * 0.003 + waveOffset) * 14;
            ctx.lineTo(x, y);
        }
        ctx.lineTo(canvas.width, canvas.height);
        ctx.fill();

        ctx.fillStyle = "rgba(7, 17, 30, 0.35)";
        ctx.beginPath();
        ctx.moveTo(0, canvas.height);
        for (let x = 0; x <= canvas.width; x += 25) {
            let y = canvas.height - 22 + Math.cos(x * 0.004 + waveOffset * 1.25) * 10;
            ctx.lineTo(x, y);
        }
        ctx.lineTo(canvas.width, canvas.height);
        ctx.fill();
        ctx.restore();

        waveOffset += 0.0025;
        requestAnimationFrame(animate);
    }

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();
    initAbyssElements();
    animate();
});
