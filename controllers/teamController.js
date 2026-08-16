// controllers/teamController.js
const db = require('../config/db');

// Participant: Create a team (Requires Transaction!)
exports.createTeam = async (req, res) => {
    const { team_name, event_id, user_id, total_members, competition_type } = req.body;

    // 1. Get a dedicated connection from the pool for the transaction
    const connection = await db.getConnection();

    try {
        // Check if the user is already registered for this event
        const checkQuery = `
            SELECT t.team_id 
            FROM Teams t 
            JOIN Team_Members tm ON t.team_id = tm.team_id 
            WHERE tm.user_id = ? AND t.event_id = ?
        `;
        const [existing] = await connection.execute(checkQuery, [user_id, event_id]);
        
        if (existing.length > 0) {
            connection.release();
            return res.status(400).json({ message: 'You are already participating in a team for this event.' });
        }

        // 2. Start the Transaction
        await connection.beginTransaction();

        // 3. INSERT the new team into the Teams table
        const insertTeamQuery = 'INSERT INTO Teams (team_name, event_id, total_member, competition_type) VALUES (?, ?, ?, ?)';
        const [teamResult] = await connection.execute(insertTeamQuery, [team_name, event_id, total_members, competition_type]);
        const newTeamId = teamResult.insertId;

        // 4. INSERT the creator into the Team_Members junction table
        const insertMemberQuery = 'INSERT INTO Team_Members (team_id, user_id) VALUES (?, ?)';
        await connection.execute(insertMemberQuery, [newTeamId, user_id]);

        // 5. If both queries succeed, COMMIT the transaction to the database
        await connection.commit();

        res.status(201).json({
            message: 'Team created and you were added as a member successfully!',
            team_id: newTeamId
        });

    } catch (error) {
        // 6. If ANYTHING fails, ROLLBACK the transaction so no orphaned data is saved
        await connection.rollback();
        console.error('Transaction Failed, rolling back:', error);
        res.status(500).json({ message: 'Failed to create team due to a server error.' });
    } finally {
        // 7. ALWAYS release the connection back to the pool
        if (connection) {
            try {
                connection.release();
            } catch (err) {
                // Connection might already be released
            }
        }
    }
};

// Participant: Get all events a user is registered for
exports.getUserRegistrations = async (req, res) => {
    try {
        const { user_id } = req.params;
        const query = `
            SELECT e.*, t.team_name, t.total_member, t.team_id 
            FROM Events e 
            JOIN Teams t ON e.event_id = t.event_id 
            JOIN Team_Members tm ON t.team_id = tm.team_id 
            WHERE tm.user_id = ?
            ORDER BY e.start_date ASC
        `;
        const [events] = await db.execute(query, [user_id]);
        res.status(200).json(events);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch user registrations.' });
    }
};

// Judge/Admin: Get all participants for a specific event
exports.getEventParticipants = async (req, res) => {
    try {
        const { event_id } = req.params;
        const query = `
            SELECT t.team_id, t.team_name, t.total_member, t.competition_type, u.name as member_name, u.email
            FROM Teams t
            JOIN Team_Members tm ON t.team_id = tm.team_id
            JOIN Users u ON tm.user_id = u.user_id
            WHERE t.event_id = ?
            ORDER BY t.team_id ASC
        `;
        const [participants] = await db.execute(query, [event_id]);
        res.status(200).json(participants);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch participants.' });
    }
};