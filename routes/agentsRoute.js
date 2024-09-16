const createQueries = require("../queries/agents/post.json");
const getQueries = require("../queries/agents/get.json");
const putQueries = require("../queries/tickets/put.json");
const express = require("express");
const connection = require("../db/config");
const router = express.Router();

router.post("/addAgent", async(req, res) => {
    try {
        const { AgentName, AgentDepartment, AgentEmail} = req.body;
        if( !AgentEmail || !AgentName || !AgentDepartment )
        {
            return res.status(400).send({error: "All fields are required..."});
        }
        await connection.execute(createQueries.createAgentTable);
        const [latestAId] = await connection.query(getQueries.getAgentID);
        let newAId = "AID1";

        if (latestAId && latestAId.length > 0) {
            const agentId = latestAId[0].AgentId;
            const numericPart = agentId.match(/\d+/g).join('');
            const currentId = parseInt(numericPart, 10);
            const newId = currentId + 1;
            newAId = `AID${newId}`;
        }
        const insertQuery = createQueries.createAgent;
        await connection.query(insertQuery, [newAId, AgentName, AgentDepartment, AgentEmail]);
        res.status(201).send({message: "Agent data added..."});
    } catch (error) {
        console.log("Error in the addAgent, ", error);
        return res.status(500).send({error: "Internal server error...."});
    }
});


router.get("/getAgents", async(req, res) => {
    try {
        const [rows] = await connection.execute(getQueries.getAllAgents);
        return res.status(200).send(rows);
    } catch (error) {
        console.log("Error in the getAgents.., ", error);
        return res.status(500).send({error: "Internal server error."});
    }
})


router.get("/getAgentById/:AgentId", async( req, res ) => {
    try {
        const {AgentId} = req.params;
        // console.log(AgentId)
        if(!AgentId) 
        {
            return res.status(400).send({error: "Parameter is required..."});
        }
        const [row] = await connection.execute(getQueries.getAgentByAgentId, [AgentId]);
        return res.status(200).send(row);
    } catch (error) {
        console.log("error in the getagentById, ", error);
        return res.status(500).send({error: "Internal Server error"});
    }
});

router.put("/updateStatus/:id", async(req, res) => {
    try {
        const {date, status} = req.body;
        const {id} = req.params;
        const query = putQueries.updateTicketDetails;
        const result = await connection.execute(query, [date, status, id]);
        if(result.length === 0)
        {
            return res.status.send({error: "Invalid agent or ticket..."});
        }
        return res.status(200).send({message: "Status updated successfully...."});
    } catch (error) {
        console.log("error in the updateStatus, ", error);
        return res.status(500).send({error: "Internal Server error"});
    }
})

router.get("/getAgentById/:id", async( req, res ) => {
    try {
        const {id} = req.params;
        // console.log(AgentId)
        if(!id) 
        {
            return res.status(400).send({error: "Parameter is required..."});
        }
        const [row] = await connection.execute(getQueries.getAgentByAgentId, [id]);
        return res.status(200).send(row);
    } catch (error) {
        console.log("error in the getagentById, ", error);
        return res.status(500).send({error: "Internal Server error"});
    }
});
router.get('/getagents',async (req,res)=>{
    try{}
    catch{}
})
module.exports = router;