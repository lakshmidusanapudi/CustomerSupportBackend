const express = require("express");
const createQueries = require("../queries/tickets/post.json");
const getQueries = require("../queries/tickets/get.json");
const connection = require("../db/config.js");
const updateQuery = require("../queries/tickets/put.json");
const getAgentQuery = require("../queries/agents/get.json");
const router = express.Router();

router.post("/addTicket", async (req, res) => {
   
    try {
        await connection.query(createQueries.createTicketsTable); 
        const { CustomerEmail,AssigneeName,AgentId,CreatedDate, Priority,Subject, Description, OrderId } = req.body;
        if (!CustomerEmail || !Subject || !Description || !OrderId ||!AgentId ||!CreatedDate) {
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
        const insertQuery = createQueries.createTicket;
        // TicketId, CustomerEmail, AssigneeName, AgentId, Subject, Description,OrderId
        await connection.query(insertQuery, [newTId, CustomerEmail,AssigneeName,AgentId,CreatedDate,Priority,Subject, Description, OrderId]);
        return res.status(200).send({ message: "Ticket added successfully...." });
    } catch (error) {
        console.error("Error in the addTicket:", error);
        return res.status(500).send({ error: "Internal Server Error..." });
    } 
});

//status 
router.put("/updateTicket/:TicketId", async(req, res) => {

    try {
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
    try {
        const [result] = await connection.query(getQueries.getAllTickets);
        return res.status(200).send(result);
    } catch (error) {
        console.error("Error in the getAllTickets:", error);
        return res.status(500).send({ error: "Internal Server Error" });
    } 
});

router.get("/getPendingTickets", async (req, res) => {
    try {
        const [result] = await connection.query(getQueries.getTicketByStatusOpen);
        console.log(result)
        return res.status(200).send(result);
    } catch (error) {
        console.error("Error in the getPendingTickets:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

router.get("/getResolvedTickets", async(req, res) => {
    try {
        const [result] = await connection.query(getQueries.getTicketByStatusClose);
        return res.status(200).send(result);
    } catch (error) {
        console.error("Error in the getAllTickets:", error);
        return res.status(500).send({ error: "Internal Server Error" });
    } 
});


router.get("/getTicketCount", async(req, res) => {
    try {
        const [result] = await connection.query(getQueries.getTicketCount);
        return res.status(200).send(result);
    } catch (error) {
        console.error("Error in the getAllTickets:", error);
        return res.status(500).send({ error: "Internal Server Error" });
    } 
});

router.get("/getTicketStatus/:TicketId", async (req, res) => {

    try {
      
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
router.get('/getticket/month',async(req,res)=>{

})


module.exports = router;
