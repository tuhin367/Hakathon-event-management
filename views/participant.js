document.addEventListener("DOMContentLoaded", () => {
    // 1. Authentication Guard
    const userId = localStorage.getItem("user_id");
    const roleId = localStorage.getItem("role_id");

    // Check if user is logged in AND is a Participant (role_id 4)
    if (!userId || roleId !== "4") {
        alert("Unauthorized access. Please log in as a Participant.");
        window.location.href = "login.html";
        return; // Stop execution
    }

    // 2. DOM Elements
    const logoutBtn = document.getElementById("logoutBtn");
    const availableEventsList = document.getElementById("availableEventsList");
    const myRegistrationsList = document.getElementById("myRegistrationsList");
    const registerTeamForm = document.getElementById("registerTeamForm");
    const eventSelect = document.getElementById("eventSelect");
    const competitionTypeInput = document.getElementById("competitionType");
    
    let allEvents = [];

    // 3. Logout Functionality
    logoutBtn.addEventListener("click", () => {
        localStorage.clear();
        window.location.href = "login.html";
    });

    // 4. Fetch and Render Available Events
    async function loadAvailableEvents() {
        try {
            // Replace with your actual Express.js endpoint for fetching events
            const response = await fetch("http://localhost:3000/api/events");

            if (response.ok) {
                const events = await response.json();
                allEvents = events;
                renderEvents(events, availableEventsList, "Register");
                
                if (eventSelect) {
                    eventSelect.innerHTML = '<option value="">Select an Event</option>';
                    events.forEach(event => {
                        const option = document.createElement("option");
                        option.value = event.event_id;
                        option.textContent = event.title || event.name;
                        eventSelect.appendChild(option);
                    });
                }
            } else {
                availableEventsList.innerHTML = "<p>Failed to load events.</p>";
            }
        } catch (error) {
            console.error("Error fetching events:", error);
            availableEventsList.innerHTML = "<p>Cannot connect to the server.</p>";
        }
    }

    // 5. Fetch and Render User's Registrations
    async function loadMyRegistrations() {
        try {
            // Replace with your actual Express.js endpoint for fetching a user's registrations
            const response = await fetch(`http://localhost:3000/api/registrations/${userId}`);

            if (response.ok) {
                const registrations = await response.json();
                if (registrations.length === 0) {
                    myRegistrationsList.innerHTML = "<p>You have not registered for any events yet.</p>";
                } else {
                    renderEvents(registrations, myRegistrationsList, "View Details");
                }
            } else {
                myRegistrationsList.innerHTML = "<p>Failed to load registrations.</p>";
            }
        } catch (error) {
            console.error("Error fetching registrations:", error);
            myRegistrationsList.innerHTML = "<p>Cannot connect to the server.</p>";
        }
    }

    // 6. Helper function to generate HTML cards dynamically
    function renderEvents(eventData, container, buttonText) {
        container.innerHTML = ""; // Clear existing content

        eventData.forEach(event => {
            // Create a card for each event
            const card = document.createElement("div");
            card.className = "event-card";

            // Format dates if they exist
            const startDate = event.start_date ? new Date(event.start_date).toLocaleDateString() : "TBD";
            const endDate = event.end_date ? new Date(event.end_date).toLocaleDateString() : "TBD";

            let teamInfoHtml = "";
            if (event.team_name) {
                teamInfoHtml += `<p><strong>Team Name:</strong> ${event.team_name}</p>`;
            }
            if (event.total_member) {
                teamInfoHtml += `<p><strong>Team Members:</strong> ${event.total_member}</p>`;
            }

            card.innerHTML = `
                <h4>${event.title || event.name}</h4>
                <p><strong>Type:</strong> ${event.event_type || 'N/A'}</p>
                ${teamInfoHtml}
                <p><strong>Start Date:</strong> ${startDate}</p>
                <p><strong>End Date:</strong> ${endDate}</p>
            `;

            container.appendChild(card);
        });
    }

    // Initial load
    loadAvailableEvents();
    loadMyRegistrations();
    
    if (eventSelect) {
        eventSelect.addEventListener("change", (e) => {
            const selectedEventId = e.target.value;
            const selectedEvent = allEvents.find(ev => ev.event_id == selectedEventId);
            if (selectedEvent && selectedEvent.event_type) {
                competitionTypeInput.value = selectedEvent.event_type;
            } else {
                competitionTypeInput.value = "";
            }
        });
    }

    if (registerTeamForm) {
        registerTeamForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            
            const teamName = document.getElementById("teamName").value;
            const eventId = eventSelect.value;
            const totalMembers = document.getElementById("totalMembers").value;

            try {
                const response = await fetch("http://localhost:3000/api/teams/create", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        team_name: teamName,
                        event_id: eventId,
                        user_id: userId,
                        total_members: totalMembers,
                        competition_type: competitionTypeInput.value
                    })
                });
                
                const result = await response.json();
                if (response.ok) {
                    alert(result.message || "Team registered successfully!");
                    registerTeamForm.reset();
                    competitionTypeInput.value = "";
                    loadMyRegistrations(); 
                } else {
                    alert("Error: " + result.message);
                }
            } catch (error) {
                console.error("Error registering team:", error);
                alert("Failed to connect to the server.");
            }
        });
    }
});

// 7. Global function to handle button clicks on the dynamically generated cards
window.handleEventAction = function (eventId, actionType) {
    if (actionType === "Register") {
        // Logic to send a POST request to your registration endpoint
        alert(`Registration logic for Event ID ${eventId} will go here.`);
    } else {
        // Logic to view details
        alert(`Viewing details for Event ID ${eventId}`);
    }
};