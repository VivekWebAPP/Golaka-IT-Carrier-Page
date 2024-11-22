import createAdminTable from "./Admin.js";
import createUsersTable from "./UserRegestration.js";
import createAdminFeedback from './FeedbackModel.js';
import pool from '../db.js';
import createJobPosition from "./JobCreationModel.js";

const createTables = async () => {
    await createUsersTable();
    await createAdminTable();
    await createAdminFeedback();
    await createJobPosition();
    console.log('All tables created successfully');
};

export default createTables;