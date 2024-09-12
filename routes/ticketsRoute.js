const express = require("express");
const createQueries = require("../queries/tickets/post.json");
const getQueries = require("../queries/tickets/get.json");
const pool = require("../db/config.js");
const updateQuery = require("../queries/tickets/put.json");
const getAgentQuery = require("../queries/agents/get.json");
const router = express.Router();



router.post("/addTicket", async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection(); 
        await connection.beginTransaction(); 
        
        await connection.query(createQueries.createTicketsTable);

        const { productId, customerId, CreatedDate, Priority, Subject, Description, Feedback, PhnNumber } = req.body;

        if (!productId || !customerId || !CreatedDate || !Priority || !Subject || !Description || !Feedback || !PhnNumber) {
            return res.status(400).send({ error: "All fields are required..." });
        }

        const [latestTId] = await connection.query(getQueries.getTicket);
        let newTId = "TID1";
        let currentId = 0;

        if (latestTId && latestTId.length > 0) {
            const ticketId = latestTId[0].TicketId;
            const numericPart = ticketId.match(/\d+/g).join('');
            currentId = parseInt(numericPart, 10);
            const newId = currentId + 1;
            newTId = `TID${newId}`;
        }

       
        const [agentCountResult] = await connection.query(getAgentQuery.getAgentCount);
        const agentsCount = agentCountResult[0]?.count;

      
        const [ticketsCountResult] = await connection.query(getQueries.getTicketCount);
        const ticketsCount = ticketsCountResult[0]?.count;

       
        const AssigneeIndex = ticketsCount % agentsCount;

        const [AssigneeData] = await connection.query(getAgentQuery.getAllAgents);
        const assignee = AssigneeData[AssigneeIndex]; 

      
        const insertQuery = createQueries.createTicket;
        await connection.query(insertQuery, [newTId, productId,customerId, assignee.AgentName, assignee.AgentId,CreatedDate,Priority, Subject, Description, Feedback, PhnNumber]);

        
        await connection.commit();

        return res.status(200).send({ message: "Ticket added successfully and assigned to agent...." });
    } catch (error) {
        if (connection) {
            await connection.rollback(); 
        }
        console.log("Error in the addTicket: ", error);
        return res.status(500).send({ error: "Internal Server error..." });
    } finally {
        if (connection) {
            connection.release(); 
        }
    }
});


//status 
router.put("/updateTicket/:TicketId", async(req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const { updateDate } = req.body;
        const { TicketId } = req.params;
        if (!updateDate || !TicketId) {
            return res.status(400).send({ error: "All fields are required..." });
        }

        const [result] = await connection.query(updateQuery.updateTicketDetails, [updateDate, TicketId]);
        if (result.affectedRows === 0) {
            return res.status(400).send({ error: "Error while updating the Resolved date..." });
        }

        return res.status(200).send({ message: "Resolved date is updated." });
    } catch (error) {
        console.error("Error in the updateTicket:", error);
        return res.status(500).send({ error: "Internal Server Error..." });
    } finally {
        if (connection) connection.release(); // Always release the connection
    }
});

router.get("/getAllTickets", async(req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const [result] = await connection.query(getQueries.getAllTickets);
        return res.status(200).send(result);
    } catch (error) {
        console.error("Error in the getAllTickets:", error);
        return res.status(500).send({ error: "Internal Server Error" });
    } 
});

router.get("/getPendingTickets", async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const [result] = await connection.query(getQueries.getTicketByStatusOpen);
        // console.log(result)
        return res.status(200).send(result);
    } catch (error) {
        console.error("Error in the getPendingTickets:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

router.get("/getResolvedTickets", async(req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const [result] = await connection.query(getQueries.getTicketByStatusClose);
        return res.status(200).send(result);
    } catch (error) {
        console.error("Error in the getAllTickets:", error);
        return res.status(500).send({ error: "Internal Server Error" });
    } 
});


router.get("/getTicketCount", async(req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const [result] = await connection.query(getQueries.getTicketCount);
        return res.status(200).send(result);
    } catch (error) {
        console.error("Error in the getAllTickets:", error);
        return res.status(500).send({ error: "Internal Server Error" });
    } 
});

router.get("/getTicketStatus/:TicketId", async (req, res) => {

    let connection;
    try {
        connection = await pool.getConnection();
        const { TicketId } = req.params;
        if (!TicketId) {
            return res.status(400).send({ error: "TicketId is required" });
        }
        const [result] = await connection.query(getQueries.getTicketStatus, [TicketId]);
        if (result.length === 0) {
            return res.status(404).send({ error: "Ticket not found" });
        }

        return res.status(200).send(result[0].Status);
    } catch (error) {
        console.error("Error fetching ticket status:", error);
        return res.status(500).send({ error: "Internal Server Error" });
    } 
});
router.get('/getticketsbymonth',async(req,res)=>{
    let connection;
    try {
        connection = await pool.getConnection();
        const [results] = await connection.query(getQueries.getTicketsbymonth)
        const formattedResults = results.map(row => ({
            month: row.Month,
            TicketsCount: row.TicketsCount
        }));

        res.status(200).send(formattedResults);
    } catch (err) {
        console.error('Error retrieving tickets count by month:', err.stack);
        res.status(500).send({ error: "Internal server error." });
    }
})


module.exports = router;
