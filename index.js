document.addEventListener('DOMContentLoaded', () => {
    const entryForm = document.getElementById('entryForm');
    const messageDiv = document.getElementById('message');
    const tableBody = document.querySelector('#activeVisitorsTable tbody');

    // My database Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyABxfQ6eOaWAPwIDxthnLzU95zxZ6DzhZU",
  authDomain: "vms-9bf3b.firebaseapp.com",
  databaseURL: "https://vms-9bf3b-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "vms-9bf3b",
  storageBucket: "vms-9bf3b.firebasestorage.app",
  messagingSenderId: "295960341156",
  appId: "1:295960341156:web:dc20d4e37520e5d0239431"
};

    // 2. Initialize
    if (!firebaseConfig.apps.length) {
        firebaseConfig.initializeApp(firebaseConfig);
    }
    const database = firebase.database();

    // 3. Test Log (To see if the code is actually running)
    console.log("Firebase is initialized!");
    
    // --- Core Functions ---

    /**
     * Retrieves all visitor logs from localStorage, or an empty array if none exist.
     * @returns {Array<Object>} The array of visitor logs.
     */
    function getVisitorLogs() {
        const logs = localStorage.getItem('visitorLogs');
        return logs ? JSON.parse(logs) : [];
    }

    /**
     * Saves the updated visitor logs array back to localStorage.
     * @param {Array<Object>} logs The logs array to save.
     */
    function saveVisitorLogs(logs) {
        localStorage.setItem('visitorLogs', JSON.stringify(logs));
    }

    /**
     * Renders the security dahsboard table with active visitors.
     */
    function renderDashboard() {
        const logs = getVisitorLogs();
        tableBody.innerHTML = ''; // Clear exiting rows

        // Filter for visitors who have entered but NOT exited (time_out is null)
        const activeVisitors = logs.filter(log => !log.time_out);

        if (activeVisitors.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No active visitors currently in the residence.</td></tr>';
            return;
        }

        activeVisitors.forEach(log => {
            const row = tableBody.insertRow();
            row.id = `log-${log.id}`; // Add a unique ID for easy access

            // 1. Time In
            row.insertCell().textContent = new Date(log.time_in).toLocaleTimeString('en-MY', {hour: '2-digit', minute:'2-digit'});

            // 2. Plate Number (Anonymized display for quick check)
            row.insertCell().textContent = log.plate_number;

            // 3. Resident Unit
            row.insertCell().textContent = log.resident_unit || 'N/A';

            // 4. Details Button (Only show details on click for security/privacy)
            const detailsCell = row.insertCell();
            const detailsBtn = document.createElement('button');
            detailsBtn.textContent = 'View Details';
            detailsBtn.className = 'details-btn';
            detailsBtn.onclick = () => showDetailsModal(log);
            detailsCell.appendChild(detailsBtn);

            // 5. Action (Checkout)
            const actionCell = row.insertCell();
            const checkoutBtn = document.createElement('button');
            checkoutBtn.textContent = 'Check Out';
            checkoutBtn.className ='checkout-btn';
            checkoutBtn.onclick = () => logCheckout(log.id);
            actionCell.appendChild(checkoutBtn);

            // Status Badge Column
            const statusCell = row.insertCell();
            statusCell.innerHTML = `<span class="status-badge status-inside"> Inside</span>`
        });
    }

    /**
     * Handles the form submission by the delivery personnel.
     */
    entryForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // 1. Collect form data
        const newLog = {
            id: Date.now(), // Use timestamp as a unique ID
            plate_number: document.getElementById('plate_number').value.toUpperCase().trim(),
            driver_name: document.getElementById('driver_name').value.trim(),
            phone_number: document.getElementById('phone_number').value.trim(),
            resident_unit: document.getElementById('resident_unit').value.toUpperCase().trim(),
            time_in: new Date().toISOString(),
            time_out: null // Initially null
        };

        // 2. Save to "database" (localStorage)
        const logs = getVisitorLogs();
        logs.push(newLog);
        saveVisitorLogs(logs);

        // 3. Provide feedback and reset form
    messageDiv.textContent = `Entry Registered! Plate: ${newLog.plate_number}. Enter when gate opens.`;
    messageDiv.className = 'success';
    entryForm.reset();

    // 4. Update the security dashboad in real-time
    renderDashboard();
    });

    /**
     * Marks visitor as checked out (updates time_out).
     * @param {number} id The unique ID of the log entry.
     */
    function logCheckout(id) {
        if (!confirm('Confirm visitor is exiting the premises?')) return;

        const logs = getVisitorLogs();
        const logIndex = logs.findIndex(log => log.id === id);
        
        if (logIndex !== -1) {
            logs[logIndex]. time_out = new Date(). toISOString(); // Set exit time
            saveVisitorLogs(logs);
            renderDashboard(); // Re-render the table to remove the exited visitor
            alert(`Visitor ${logs[logIndex].plate_number} checked out.`);
        }
    }

    /**
     * Shows a modal with the full details of a specific log entry. (Guard only)
     * @param {Object} log The log object to display.
     */
    function showDetailsModal(log) {
        // Simple implementation of the guard-only details view
        alert(`
            --- Full Visitor Details ---
            Name: ${log.driver_name}
            Phone: ${log.phone_number}
            Plate: ${log.plate_number}
            Time In: ${new Date(log.time_in).toLocaleString('en-MY')}
            Unit: ${log.resident_unit}

            (This data is for guard viewing only.)
        `);
    }

    // Initial render of the dashboard when the page loads
    renderDashboard();
});