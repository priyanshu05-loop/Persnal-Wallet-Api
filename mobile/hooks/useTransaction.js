//react custom hookls file

import { useCallback, useState } from "react";
import { Alert } from "react-native";
import { API_URL } from "../constants/api";

// const API_URL = "https://persnal-wallet-api.onrender.com/api"; // Replace with your actual API URL

export default function useTransaction(userId) {
    const [transactions, setTransactions] = useState([]);
    const [summary, setSummary] = useState({
        balance : 0,
        income: 0,
        expenses: 0,
    });
    const [isloading, setIsLoading] = useState(true);

    //here we are using useCallback to memoize the fetchTransactions function
    // so that it does not get recreated on every render, which can help with performance
    // and prevent unnecessary re-renders of components that depend on it.
    const fetchTransactions = useCallback(async()=>{
        try {
            const response = await fetch(`${API_URL}/transactions/${userId}`)
            const data = await response.json();
            setTransactions(data)
        } catch (error) {
            console.error("Error fetching transactions:", error);
        }
    }, [userId]);

    const fetchSummary = useCallback(async() => {
        try {
            const response = await fetch(`${API_URL}/transactions/summary/${userId}`);
            const data = await response.json();
            setSummary(data);
        } catch (error) {
            console.error("Error fetching summary:", error);
        }
    }, [userId]);

    const loadData = useCallback(async () => {
        if(!userId) {
            console.error("User ID is required to load data");
            return;
        }
        setIsLoading(true);
        try {
            await Promise.all([fetchTransactions(), fetchSummary()]);
        } catch (error) {
            console.error("Error loading data:", error);
        } finally {
            setIsLoading(false);
        }
    }, [fetchTransactions, fetchSummary, userId]);

    const deleteTransaction =async (transactionId) => {
        try {
            const response = await fetch(`${API_URL}/transactions/${transactionId}`, {
                method: "DELETE",
            });
            if (!response.ok) {
                throw new Error("Failed to delete transaction");
            }
            //refresh the transactions list after deletion
            loadData();
            Alert.alert("Success", "Transaction deleted successfully");
        } catch (error) {
            console.error("Error deleting transaction:", error);
            Alert.alert("Error", error.message || "Failed to delete transaction");
        }
    }

    return {
        transactions,
        summary,
        isloading,
        loadData,
        deleteTransaction,
    };
}