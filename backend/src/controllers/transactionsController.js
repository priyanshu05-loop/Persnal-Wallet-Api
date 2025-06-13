import { sql } from "../config/db.js";

export async function getTransactionsByUserID(req, res) {
        try {
            const {userId} = req.params;
            const transactions = await sql`
            SELECT * FROM transactions WHERE user_id = ${userId} ORDER BY created_at DESC
            `
            console.log("Transactions fetched for user:", userId);
    
            res.status(200).json(transactions);
            
        } catch (error) {
            console.log("Error getting transaction:", error);
            res.status(500).json({message : "Internal server error"});
        }
}

export async function createTransaction(req, res) {
        // Create a new transaction    
        try {
            const { title, amount, category, user_id } = req.body;
            if(!title || !amount || !category || !user_id) {
                return res.status(400).json({message: "All fields are required" });
            }
    
            const transaction = await sql`
                INSERT INTO transactions (user_id, title, amount, category)
                VALUES (${user_id}, ${title}, ${amount}, ${category})
                RETURNING *;
            `
            console.log("Transaction created:",transaction);
            res.status(201).json(transaction[0]); // Return the created transaction
    
        } catch (error) {
            console.log("Error creating transaction:", error);
            res.status(500).json({message : "Internal server error"});
        }
}

export async function deleteTransaction(req, res) {
        // Delete a transaction by ID
        try {
            const {id} = req.params;
    
            if(isNaN(parseInt(id))){
                return res.status(400).json({message: "Invalid transaction ID"});
            }
    
            const result = await sql`
                DELETE FROM transactions WHERE id = ${id} RETURNING *;
            `
            if(result.length === 0){
                return res.status(404).json({message: "Transaction not found"});
            }
    
            res.status(200).json({message: "Transaction deleted successfully"});
            
        } catch (error) {
            console.log("Error Deleting transaction:", error);
            res.status(500).json({message : "Internal server error"});
        }
}

export async function getTransactionSummary(req, res) {
    
    try {
        const {userId} = req.params;
        const balanceResult = await sql`
        SELECT COALESCE(SUM(amount), 0) AS balance FROM transactions WHERE user_id = ${userId}
        `

        const incomeResult = await sql`
        SELECT COALESCE(SUM(amount), 0) AS income FROM transactions WHERE user_id = ${userId} AND amount > 0
        `
        const expensesResult = await sql`
        SELECT COALESCE(SUM(amount), 0) AS income FROM transactions WHERE user_id = ${userId} AND amount < 0
        `

        res.status(200).json({
            balance: balanceResult[0].balance,
            income: incomeResult[0].income,
            expenses: expensesResult[0].income
        });

    } catch (error) {
        console.log("Error getting summary:", error);
        res.status(500).json({message : "Internal server error"});
    }
}