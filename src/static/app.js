document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message and select
      activitiesList.innerHTML = "";
      activitySelect.innerHTML = '<option value="">-- Select an activity --</option>';

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        // Basic info
        const title = document.createElement("h4");
        title.textContent = name;
        activityCard.appendChild(title);

        const desc = document.createElement("p");
        desc.textContent = details.description;
        activityCard.appendChild(desc);

        const sched = document.createElement("p");
        sched.innerHTML = `<strong>Schedule:</strong> ${details.schedule}`;
        activityCard.appendChild(sched);

        const availability = document.createElement("p");
        availability.innerHTML = `<strong>Availability:</strong> ${spotsLeft} spots left (${details.participants.length}/${details.max_participants})`;
        activityCard.appendChild(availability);

        // Participants section
        const participantsWrap = document.createElement("div");
        participantsWrap.className = "participants-wrap";

        const participantsTitle = document.createElement("p");
        participantsTitle.className = "participants-title";
        participantsTitle.textContent = "Uczestnicy:";
        participantsWrap.appendChild(participantsTitle);

        const ul = document.createElement("ul");
        ul.className = "participants";

        if (!details.participants || details.participants.length === 0) {
          const li = document.createElement("li");
          li.className = "participant-item empty";
          li.textContent = "Brak zapisanych uczniów";
          ul.appendChild(li);
        } else {
          details.participants.forEach((email) => {
            const li = document.createElement("li");
            li.className = "participant-item";

            const avatar = document.createElement("span");
            avatar.className = "avatar";
            const initials = email
              .split("@")[0]
              .split(".")
              .map((s) => (s ? s[0] : ""))
              .slice(0, 2)
              .join("")
              .toUpperCase();
            avatar.textContent = initials;
            li.appendChild(avatar);

            const span = document.createElement("span");
            span.className = "participant-email";
            span.textContent = email;
            li.appendChild(span);

            ul.appendChild(li);
          });
        }

        participantsWrap.appendChild(ul);
        activityCard.appendChild(participantsWrap);

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json().catch(() => ({}));

      if (response.ok) {
        messageDiv.textContent = result.message || "Signed up successfully.";
        messageDiv.className = "message success";
        signupForm.reset();
        await fetchActivities(); // odśwież listę by pokazać nowego uczestnika
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "message error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "message error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
