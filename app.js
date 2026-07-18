// app.js - Sajeena Manzil Family Calendar Engine

document.addEventListener("DOMContentLoaded", () => {
    // App State
    const state = {
        currentTab: "upcoming", // upcoming, birthdays, anniversaries, calendar, tree
        searchQuery: "",
        selectedFilterMonth: "all", // "all" or 0-11
        calendarYear: 2026, // Seeding to the current local year from environment
        calendarMonth: 6,   // July (0-indexed: 6)
        selectedCalendarDay: null
    };

    // Month Name Constants
    const MONTH_NAMES = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const MONTH_SHORT_NAMES = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    // Set initial dates from local time coordinate (July 18, 2026)
    const systemDate = new Date();
    if (systemDate.getFullYear() >= 2026) {
        state.calendarYear = systemDate.getFullYear();
        state.calendarMonth = systemDate.getMonth();
    }

    // DOM Elements
    const DOM = {
        tabBtns: document.querySelectorAll(".tab-btn"),
        tabContents: document.querySelectorAll(".tab-content"),
        controlsPanel: document.getElementById("controls-panel"),
        nameSearch: document.getElementById("name-search"),
        clearSearch: document.getElementById("clear-search"),
        filterBtns: document.querySelectorAll(".filter-btn"),
        quickCountdownCard: document.getElementById("quick-countdown-card"),

        // Lists
        upcomingEventsList: document.getElementById("upcoming-events-list"),
        upcomingCount: document.getElementById("upcoming-count"),
        birthdaysList: document.getElementById("birthdays-list"),
        birthdaysCount: document.getElementById("birthdays-count"),
        anniversariesList: document.getElementById("anniversaries-list"),
        anniversariesCount: document.getElementById("anniversaries-count"),

        // Calendar DOM
        calendarMonthYear: document.getElementById("current-calendar-month-year"),
        calendarDaysGrid: document.getElementById("calendar-days-grid"),
        prevMonthBtn: document.getElementById("prev-month"),
        nextMonthBtn: document.getElementById("next-month"),
        calendarFocusedMonth: document.getElementById("calendar-focused-month"),
        calendarFocusedEvents: document.getElementById("calendar-focused-events")
    };

    // --- Utility functions ---

    // Check if two dates are the same day (ignoring year)
    function isSameDayAndMonth(date1, date2) {
        return date1.getMonth() === date2.getMonth() && date1.getDate() === date2.getDate();
    }

    // Clear time from a date object to compare days
    function clearTime(date) {
        return new Date(date.getFullYear(), date.getMonth(), date.getDate());
    }

    // Calculate the target celebration date (this year or next year)
    function getNextCelebrationDate(month, day) {
        const today = clearTime(systemDate);
        let targetYear = today.getFullYear();
        let targetDate = new Date(targetYear, month, day);

        // If it's already occurred this year, it shifts to next year
        if (targetDate < today) {
            targetDate.setFullYear(targetYear + 1);
        }
        return targetDate;
    }

    // Get countdown in days
    function getDaysCount(month, day) {
        const todayClean = clearTime(systemDate);
        const targetDate = getNextCelebrationDate(month, day);
        const diffTime = targetDate - todayClean;
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    // Calculate milestone age/years married
    function calculateMilestone(eventDateOrYear, isAnniversary = false) {
        if (!eventDateOrYear) return null;
        const birthYear = typeof eventDateOrYear === 'object' ? eventDateOrYear.getFullYear() : eventDateOrYear;

        // Get the year of the next occurrence
        const todayClean = clearTime(systemDate);
        // Find if the event occurs this calendar year or next
        let occurYear = todayClean.getFullYear();
        // month and day check
        return occurYear - birthYear;
    }

    // Resolve years for upcoming celebrations based on celebration target
    function getCalculatedYears(event, isAnniversary = false) {
        if (!event.year) return null;
        const targetDate = getNextCelebrationDate(event.month, event.day);
        return targetDate.getFullYear() - event.year;
    }

    // Generate dynamic countdown description text
    function getCountdownText(days) {
        if (days === 0) return "Today! 🎉";
        if (days === 1) return "Tomorrow 🎂";
        return `In ${days} days`;
    }

    // Get list of events on a specific day
    function getEventsOnDay(month, day) {
        const bdays = BIRTHDAYS.filter(b => b.month === month && b.day === day)
            .map(b => ({ ...b, type: "birthday" }));
        const anns = ANNIVERSARIES.filter(a => a.month === month && a.day === day)
            .map(a => ({ ...a, type: "anniversary" }));
        return [...bdays, ...anns];
    }

    // Format ordinals (e.g. 1st, 2nd, 3rd...)
    function getOrdinalIndicator(n) {
        const s = ["th", "st", "nd", "rd"];
        const v = n % 100;
        return n + (s[(v - 20) % 10] || s[v] || s[0]);
    }

    // --- Rendering Engines ---

    // Render Top Header Quick Countdown
    function renderQuickCountdown() {
        // Combine all events with their immediate countdowns
        const allEvents = [
            ...BIRTHDAYS.map(b => ({ ...b, type: "birthday", displayName: b.name })),
            ...ANNIVERSARIES.map(a => ({ ...a, type: "anniversary", displayName: a.couple }))
        ];

        allEvents.forEach(e => {
            e.daysRemaining = getDaysCount(e.month, e.day);
        });

        // Sort by days remaining asc
        allEvents.sort((a, b) => a.daysRemaining - b.daysRemaining);

        if (allEvents.length === 0) {
            DOM.quickCountdownCard.innerHTML = `<div class="countdown-loading">No events registered.</div>`;
            return;
        }

        const nextEvent = allEvents[0];
        const days = nextEvent.daysRemaining;

        let iconHTML = "";
        let descHTML = "";

        if (nextEvent.type === "birthday") {
            iconHTML = `<div class="icon-holder birthday"><i data-lucide="cake"></i></div>`;
            const ageNum = getCalculatedYears(nextEvent);
            const ageString = ageNum ? `(${getOrdinalIndicator(ageNum)} Birthday)` : "";
            descHTML = `
        <div class="title">Next Birthday</div>
        <div class="detail">${nextEvent.displayName} ${ageString}</div>
      `;
        } else {
            iconHTML = `<div class="icon-holder anniversary"><i data-lucide="heart"></i></div>`;
            const yearsNum = getCalculatedYears(nextEvent);
            let yearsString = "";
            if (yearsNum !== null) {
                yearsString = yearsNum === 0 ? "(Wedding day!)" : `(${getOrdinalIndicator(yearsNum)} Anniversary)`;
            }
            descHTML = `
        <div class="title">Next Anniversary</div>
        <div class="detail">${nextEvent.displayName} ${yearsString}</div>
      `;
        }

        let countdownTimeLabel = "";
        if (days === 0) countdownTimeLabel = `<span class="badge bd-badge" style="background:#10b981; color:#fff; border:none; animation: pulse 1.5s infinite">TODAY 🎉</span>`;
        else if (days === 1) countdownTimeLabel = `<span class="badge bd-badge" style="background:#fbbf24; color:#000; border:none">TOMORROW</span>`;
        else countdownTimeLabel = `<span class="badge">${days} Days Left</span>`;

        DOM.quickCountdownCard.classList.remove("empty");
        DOM.quickCountdownCard.innerHTML = `
      <div class="quick-countdown-banner">
        ${iconHTML}
        <div>
          ${descHTML}
        </div>
      </div>
      <div style="margin-left: auto;">
        ${countdownTimeLabel}
      </div>
    `;

        lucide.createIcons();
    }

    // Render Upcoming Tab (Milestones in next 30 days)
    function renderUpcomingEvents() {
        const listContainer = DOM.upcomingEventsList;
        listContainer.innerHTML = "";

        const allEvents = [
            ...BIRTHDAYS.map(b => ({ ...b, type: "birthday", displayName: b.name })),
            ...ANNIVERSARIES.map(a => ({ ...a, type: "anniversary", displayName: a.couple }))
        ];

        allEvents.forEach(e => {
            e.daysRemaining = getDaysCount(e.month, e.day);
        });

        // Filter to next 30 days
        const upcoming = allEvents.filter(e => e.daysRemaining <= 30);

        // Sort by days remaining
        upcoming.sort((a, b) => a.daysRemaining - b.daysRemaining);

        DOM.upcomingCount.textContent = `${upcoming.length} ${upcoming.length === 1 ? 'event' : 'events'}`;

        if (upcoming.length === 0) {
            listContainer.innerHTML = `
        <div class="empty-state">
          <i data-lucide="sparkles"></i>
          <h3>No events in the next 30 days</h3>
          <p>Check the full Birthdays or Anniversaries tab to see other celebrations.</p>
        </div>
      `;
            lucide.createIcons();
            return;
        }

        upcoming.forEach(e => {
            const card = createEventCard(e);
            listContainer.appendChild(card);
        });

        lucide.createIcons();
    }

    // Render Birthdays Tab
    function renderBirthdays() {
        const listContainer = DOM.birthdaysList;
        listContainer.innerHTML = "";

        let items = BIRTHDAYS.map(b => ({ ...b, type: "birthday", displayName: b.name }));

        // Apply Search Filter
        if (state.searchQuery) {
            const query = state.searchQuery.toLowerCase();
            items = items.filter(a => a.displayName.toLowerCase().includes(query));
        }

        // Apply Month Filter
        if (state.selectedFilterMonth !== "all") {
            const mIdx = parseInt(state.selectedFilterMonth, 10);
            items = items.filter(a => a.month === mIdx);
        }

        // Sort: upcoming events first, followed by others sorted by month/day
        const today = clearTime(systemDate);
        items.forEach(item => {
            item.daysRemaining = getDaysCount(item.month, item.day);
        });
        items.sort((a, b) => a.daysRemaining - b.daysRemaining);

        DOM.birthdaysCount.textContent = `${items.length} ${items.length === 1 ? 'birthday' : 'birthdays'}`;

        if (items.length === 0) {
            listContainer.innerHTML = `
        <div class="empty-state">
          <i data-lucide="search-code"></i>
          <h3>No birthdays match your criteria</h3>
          <p>Try clearing your search query or selecting a different month.</p>
        </div>
      `;
            lucide.createIcons();
            return;
        }

        items.forEach(e => {
            const card = createEventCard(e);
            listContainer.appendChild(card);
        });

        lucide.createIcons();
    }

    // Render Wedding Anniversaries Tab
    function renderAnniversaries() {
        const listContainer = DOM.anniversariesList;
        listContainer.innerHTML = "";

        let items = ANNIVERSARIES.map(a => ({ ...a, type: "anniversary", displayName: a.couple }));

        // Apply Search Filter
        if (state.searchQuery) {
            const query = state.searchQuery.toLowerCase();
            items = items.filter(a => a.displayName.toLowerCase().includes(query));
        }

        // Apply Month Filter
        if (state.selectedFilterMonth !== "all") {
            const mIdx = parseInt(state.selectedFilterMonth, 10);
            items = items.filter(a => a.month === mIdx);
        }

        // Sort: upcoming anniversaries first
        items.forEach(item => {
            item.daysRemaining = getDaysCount(item.month, item.day);
        });
        items.sort((a, b) => a.daysRemaining - b.daysRemaining);

        DOM.anniversariesCount.textContent = `${items.length} ${items.length === 1 ? 'anniversary' : 'anniversaries'}`;

        if (items.length === 0) {
            listContainer.innerHTML = `
        <div class="empty-state">
          <i data-lucide="heart-off"></i>
          <h3>No anniversaries match your criteria</h3>
          <p>Try clearing your search query or selecting a different month.</p>
        </div>
      `;
            lucide.createIcons();
            return;
        }

        items.forEach(e => {
            const card = createEventCard(e);
            listContainer.appendChild(card);
        });

        lucide.createIcons();
    }

    // Card Builder Helper
    function createEventCard(event) {
        const card = document.createElement("div");
        card.className = `event-card ${event.type}`;

        const daysLeft = event.daysRemaining;
        const dateStr = `${MONTH_NAMES[event.month]} ${event.day}${event.dayUnknown ? '' : getDaySuffix(event.day)}`;

        // Icon selection
        const icon = event.type === "birthday" ? "cake" : "heart";

        // Milestones math
        let milestoneSub = "";
        if (event.year) {
            const ageNum = getCalculatedYears(event);
            if (event.type === "birthday") {
                milestoneSub = `Turning ${getOrdinalIndicator(ageNum)}`;
            } else {
                milestoneSub = ageNum === 0 ? "Celebrating Wedding Day!" : `Celebrating ${getOrdinalIndicator(ageNum)}`;
            }
        } else {
            milestoneSub = event.type === "birthday" ? "Birthday Celebration" : "Wedding Anniversary";
        }

        // Subtitle note
        let metaNote = "";
        if (event.note) {
            metaNote = `<span class="event-meta">${event.note}</span>`;
        } else if (event.generation) {
            metaNote = `<span class="event-meta">Gen ${event.generation} Family</span>`;
        }

        card.innerHTML = `
      <div class="event-header">
        <span class="event-date-stamp">${dateStr}</span>
        <div class="event-icon-block">
          <i data-lucide="${icon}"></i>
        </div>
      </div>
      <div class="event-body">
        <h4 class="event-name">${event.displayName}</h4>
        <p class="event-details">
          <span>${milestoneSub}</span>
        </p>
      </div>
      <div class="event-footer">
        <span class="countdown-text">${getCountdownText(daysLeft)}</span>
        ${metaNote}
      </div>
    `;
        return card;
    }

    function getDaySuffix(day) {
        if (day > 3 && day < 21) return 'th';
        switch (day % 10) {
            case 1: return "st";
            case 2: return "nd";
            case 3: return "rd";
            default: return "th";
        }
    }

    // --- Interactive Calendar Panel ---

    function renderCalendar() {
        const year = state.calendarYear;
        const month = state.calendarMonth;

        DOM.calendarMonthYear.textContent = `${MONTH_NAMES[month]} ${year}`;
        DOM.calendarDaysGrid.innerHTML = "";

        // Day of the week for the first day of the month (0 = Sun, 6 = Sat)
        const firstDayIndex = new Date(year, month, 1).getDay();
        // Days in current month
        const totalDays = new Date(year, month + 1, 0).getDate();
        // Days in previous month
        const prevMonthDays = new Date(year, month, 0).getDate();

        // Generate greyed-out cells from the previous month
        for (let i = firstDayIndex - 1; i >= 0; i--) {
            const cell = document.createElement("div");
            cell.className = "calendar-day-cell other-month";
            cell.textContent = prevMonthDays - i;
            DOM.calendarDaysGrid.appendChild(cell);
        }

        // Generate cells for the current month
        for (let day = 1; day <= totalDays; day++) {
            const cell = document.createElement("div");
            cell.className = "calendar-day-cell";
            cell.textContent = day;

            const cellDate = new Date(year, month, day);
            const isTodayCell = isSameDayAndMonth(cellDate, systemDate) && cellDate.getFullYear() === systemDate.getFullYear();

            if (isTodayCell) {
                cell.classList.add("today");
            }

            // Check events on this day
            const dayEvents = getEventsOnDay(month, day);
            if (dayEvents.length > 0) {
                cell.classList.add("has-event");

                const dotsContainer = document.createElement("div");
                dotsContainer.className = "event-dots";

                dayEvents.forEach(ev => {
                    const dot = document.createElement("span");
                    dot.className = `dot ${ev.type}`;
                    dotsContainer.appendChild(dot);
                });

                cell.appendChild(dotsContainer);
            }

            // Select handler
            cell.addEventListener("click", () => {
                document.querySelectorAll(".calendar-day-cell").forEach(c => c.classList.remove("selected"));
                cell.classList.add("selected");
                state.selectedCalendarDay = day;
                renderFocusedCalendarEvents(month, day);
            });

            // Maintain active state selection if matched
            if (state.selectedCalendarDay === day) {
                cell.classList.add("selected");
            }

            DOM.calendarDaysGrid.appendChild(cell);
        }

        // Append gray cells for remaining grid slots to maintain grid layout stability (6 weeks = 42 cells)
        const totalRendered = firstDayIndex + totalDays;
        const remainingCells = 42 - totalRendered;
        for (let i = 1; i <= remainingCells; i++) {
            const cell = document.createElement("div");
            cell.className = "calendar-day-cell other-month";
            cell.textContent = i;
            DOM.calendarDaysGrid.appendChild(cell);
        }

        // By default, render all events for the month if no day is selected yet
        if (!state.selectedCalendarDay) {
            renderFocusedCalendarEvents(month, null);
        } else {
            renderFocusedCalendarEvents(month, state.selectedCalendarDay);
        }
    }

    function renderFocusedCalendarEvents(month, day) {
        const listContainer = DOM.calendarFocusedEvents;
        listContainer.innerHTML = "";

        if (day === null) {
            // Show all events in the month
            DOM.calendarFocusedMonth.textContent = `the month of ${MONTH_NAMES[month]}`;

            const bdays = BIRTHDAYS.filter(b => b.month === month).map(b => ({ ...b, type: "birthday", displayName: b.name }));
            const anns = ANNIVERSARIES.filter(a => a.month === month).map(a => ({ ...a, type: "anniversary", displayName: a.couple }));
            const monthlyEvents = [...bdays, ...anns].sort((a, b) => a.day - b.day);

            if (monthlyEvents.length === 0) {
                listContainer.innerHTML = `<span class="text-muted">No family celebrations this month.</span>`;
                return;
            }

            monthlyEvents.forEach(e => {
                const item = createFocusedEventItem(e);
                listContainer.appendChild(item);
            });
        } else {
            // Show events specifically for selected day
            DOM.calendarFocusedMonth.textContent = `${MONTH_NAMES[month]} ${day}`;
            const dayEvents = getEventsOnDay(month, day);

            if (dayEvents.length === 0) {
                listContainer.innerHTML = `<span class="text-muted" style="padding: 0.5rem 0;">No family events recorded for this specific date.</span>`;
                return;
            }

            dayEvents.forEach(e => {
                const item = createFocusedEventItem(e);
                listContainer.appendChild(item);
            });
        }
        lucide.createIcons();
    }

    function createFocusedEventItem(event) {
        const item = document.createElement("div");
        item.className = `focused-event-item ${event.type}`;

        const daysLeft = getDaysCount(event.month, event.day);
        const dateStamp = `${MONTH_SHORT_NAMES[event.month]} ${event.day}`;

        let desc = "";
        if (event.year) {
            const ageNum = getCalculatedYears(event);
            if (event.type === "birthday") {
                desc = `Turning ${getOrdinalIndicator(ageNum)} (${event.year})`;
            } else {
                desc = ageNum === 0 ? "Wedding celebration!" : `Celebrating ${getOrdinalIndicator(ageNum)} (${event.year})`;
            }
        } else {
            desc = event.type === "birthday" ? "Birthday Celebration" : "Wedding Anniversary";
        }

        const icon = event.type === "birthday" ? "cake" : "heart";

        item.innerHTML = `
      <div class="focused-event-info">
        <div class="focused-event-icon">
          <i data-lucide="${icon}"></i>
        </div>
        <div>
          <div class="focused-event-name">${event.displayName || event.name || event.couple}</div>
          <div class="focused-event-desc">${dateStamp} &bull; ${desc}</div>
        </div>
      </div>
      <div class="focused-event-countdown">${getCountdownText(daysLeft)}</div>
    `;
        return item;
    }

    // --- Interaction Listeners ---

    // Tab navigation switching
    DOM.tabBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            const targetTab = btn.getAttribute("data-tab");
            state.currentTab = targetTab;

            // Update UI classes
            DOM.tabBtns.forEach(b => b.classList.remove("active"));
            DOM.tabContents.forEach(c => c.classList.remove("active"));

            btn.classList.add("active");
            document.getElementById(`tab-${targetTab}`).classList.add("active");

            // Control panel toggle. Only show filters on Book lists
            if (targetTab === "birthdays" || targetTab === "anniversaries") {
                DOM.controlsPanel.style.display = "flex";
            } else {
                DOM.controlsPanel.style.display = "none";
            }

            // Re-trigger layout renderings
            if (targetTab === "upcoming") renderUpcomingEvents();
            if (targetTab === "birthdays") renderBirthdays();
            if (targetTab === "anniversaries") renderAnniversaries();
            if (targetTab === "calendar") {
                state.selectedCalendarDay = null; // reset selection
                renderCalendar();
            }
        });
    });

    // Search logic
    DOM.nameSearch.addEventListener("input", (e) => {
        state.searchQuery = e.target.value;

        // Toggle clear search button visibility
        if (state.searchQuery) {
            DOM.clearSearch.style.display = "inline-block";
        } else {
            DOM.clearSearch.style.display = "none";
        }

        if (state.currentTab === "birthdays") renderBirthdays();
        if (state.currentTab === "anniversaries") renderAnniversaries();
    });

    DOM.clearSearch.addEventListener("click", () => {
        state.searchQuery = "";
        DOM.nameSearch.value = "";
        DOM.clearSearch.style.display = "none";

        if (state.currentTab === "birthdays") renderBirthdays();
        if (state.currentTab === "anniversaries") renderAnniversaries();
    });

    // Month filters
    DOM.filterBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            DOM.filterBtns.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");

            state.selectedFilterMonth = btn.getAttribute("data-month");

            if (state.currentTab === "birthdays") renderBirthdays();
            if (state.currentTab === "anniversaries") renderAnniversaries();
        });
    });

    // Calendar Controls
    DOM.prevMonthBtn.addEventListener("click", () => {
        state.selectedCalendarDay = null;
        if (state.calendarMonth === 0) {
            state.calendarMonth = 11;
            state.calendarYear -= 1;
        } else {
            state.calendarMonth -= 1;
        }
        renderCalendar();
    });

    DOM.nextMonthBtn.addEventListener("click", () => {
        state.selectedCalendarDay = null;
        if (state.calendarMonth === 11) {
            state.calendarMonth = 0;
            state.calendarYear += 1;
        } else {
            state.calendarMonth += 1;
        }
        renderCalendar();
    });


    // --- Theme Toggle Logic ---
    const themeToggleBtn = document.getElementById("theme-toggle");
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener("click", () => {
            document.body.classList.toggle("dark");
            const isDark = document.body.classList.contains("dark");
            localStorage.setItem("theme", isDark ? "dark" : "light");
        });
    }

    // --- Initial Startup Callouts ---

    // Set initial display view: Panel controls are hidden by default as 'upcoming' is first
    DOM.controlsPanel.style.display = "none";

    renderQuickCountdown();
    renderUpcomingEvents();
});
