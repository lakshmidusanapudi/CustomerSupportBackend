const express = require("express");
const createQueries = require("../queries/tickets/post.json");
const getQueries = require("../queries/tickets/get.json");
const connection = require("../db/config.js");
const updateQuery = require("../queries/tickets/put.json");

const router = express.Router();

router.post("/addTicket", async (req, res) => {
    
    try {
        await connection.query(createQueries.createTicketsTable);
        const { productId, customerId, Subject, Description, PhnNumber ,TicketCategory} = req.body;
        // if (!productId || !customerId || !Subject || !Description || !PhnNumber||!TicketCategory) {
        //     return res.status(400).send({ error: "All fields are required..." });
        // }
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
        await connection.query(insertQuery, [newTId, productId,customerId, Subject, Description, PhnNumber,TicketCategory]);
        // await connection.query(updateagent.updateTicketCountQuery,[newTId,assignee.AgentId])
        
        return res.status(200).send({ message: "Ticket added successfully and assigned to agent....", TID:newTId });
    } catch (error) {
        
        console.log("Error in the addTicket: ", error);
        return res.status(500).send({ error: "Internal Server error..." });
    
    }
});

router.get("/getAllTickets", async (req, res) => {
    try {
        const [result] = await connection.query(getQueries.getAllTickets);
        return res.status(200).send(result);
    } catch (error) {
        console.error("Error fetching all tickets:", error);
        return res.status(500).send({ error: "Internal Server Error" });
    } finally {
        if (connection) connection.release();
    }
});

router.get("/getOpenTickets", async (req, res) => {
    try {
        const [result] = await connection.query(getQueries.getopentickets,['OPEN']);
        return res.status(200).send(result);
    } catch (error) {
        console.error("Error fetching all tickets:", error);
        return res.status(500).send({ error: "Internal Server Error" });
    } 
});

router.get("/getClosedTickets", async (req, res) => {
    try {
        const [result] = await connection.query(getQueries.getopentickets,['CLOSED']);
        return res.status(200).send(result);
    } catch (error) {
        console.error("Error fetching all tickets:", error);
        return res.status(500).send({ error: "Internal Server Error" });
    } 
});

router.get("/getPendingTickets", async (req, res) => {
    try {
        const [result] = await connection.query(getQueries.getopentickets,['PENDING']);
        return res.status(200).send(result);
    } catch (error) {
        console.error("Error fetching all tickets:", error);
        return res.status(500).send({ error: "Internal Server Error" });
    } 
});

router.put("/updateassignedstatus/:id",async(req,res)=>{
    try {
        const {id}=req.params;
        const [result] = await connection.query(updateQuery.updateassingedstatus,[id]);
        if (result.affectedRows === 0) {
            return res.status(400).send({ error: "Ticket not found or unable to assigned" });
        }
        return res.status(200).send({ message: "Ticket assigned successfully." });
    }catch (error) {
        console.error("Error in assigning:", error);
        return res.status(500).send({ error: "Internal Server Error" });
    } 
})
router.put("/updateticketstatus/:id",async(req,res)=>{
    try {
        const {id}=req.params;
        const [result] = await connection.query(updateQuery.updateticketstatus,[id]);
        if (result.affectedRows === 0) {
            return res.status(400).send({ error: "Ticket not found or unable to assigned" });
        }
        return res.status(200).send({ message: "Ticket assigned successfully." });
    }catch (error) {
        console.error("Error in assigning:", error);
        return res.status(500).send({ error: "Internal Server Error" });
    } 
})
router.put("/updateTicket/:TicketId", async (req, res) => {
    try {   
        const { Status, Description, DueDate } = req.body;
        const { TicketId } = req.params;

        let updateFields = [];
        let values = [];

        if (Status) {
            updateFields.push("Status = ?");
            values.push(Status);
        }
        if (Description) {
            updateFields.push("Description = ?");
            values.push(Description);
        }
        if (DueDate) {
            updateFields.push("DueDate = ?");
            values.push(DueDate);
        }
        values.push(TicketId);
        const updateQuery = `UPDATE Customer_Support.Tickets SET ${updateFields.join(", ")} WHERE TicketId = ?`;
        const [result] = await connection.query(updateQuery, values);
        if (result.affectedRows === 0) {
            return res.status(400).send({ error: "Ticket not found or unable to update the details." });
        }

        return res.status(200).send({ message: "Ticket details updated successfully." });
    } catch (error) {
        console.error("Error updating ticket:", error);
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

        return res.status(200).send({ status: result[0].Status });
    } catch (error) {
        console.error("Error fetching ticket status:", error);
        return res.status(500).send({ error: "Internal Server Error" });
    } 
});
router.get('/getfeedback',async (req,res)=>{
    try{    
    const [result]=await connection.query(getQueries.getfeedback);
   
    return res.status(200).send(result)
}
catch(error)
{
    console.error("Error in fetching :", error);
        return res.status(500).send({ error: "Internal Server Error" });
}
})
// router.get('/getnegative',async(req,res)=>{
//  try{
//    const [result]=await connection.query(getQueries.getnegativefeedback);
//    return res.status(200).send({negative:result})
//  }
//  catch(error)
//  {
//     console.error("Error in fetching :", error);
//         return res.status(500).send({ error: "Internal Server Error" });
//  }
// })

module.exports = router;







