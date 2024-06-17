import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TransactionsTable = ({ month, search }) => {
    const [transactions, setTransactions] = useState([]);
    const [page, setPage] = useState(1);
    const [perPage] = useState(10);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        const fetchData = async () => {
            const { data } = await axios.get('/api/transactions', {
                params: { month, search, page, perPage },
            });
            setTransactions(data.transactions);
            setTotalPages(data.totalPages);
        };
        fetchData();
    }, [month, search, page, perPage]);

    return (
        <div>
            <table>
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Description</th>
                        <th>Price</th>
                        <th>Date of Sale</th>
                        <th>Sold</th>
                        <th>Category</th>
                    </tr>
                </thead>
                <tbody>
                    {transactions.map(transaction => (
                        <tr key={transaction._id}>
                            <td>{transaction.title}</td>
                            <td>{transaction.description}</td>
                            <td>{transaction.price}</td>
                            <td>{new Date(transaction.dateOfSale).toLocaleDateString()}</td>
                            <td>{transaction.sold ? 'Yes' : 'No'}</td>
                            <td>{transaction.category}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div>
                <button onClick={() => setPage(page => Math.max(page - 1, 1))} disabled={page === 1}>Previous</button>
                <span> Page {page} of {totalPages} </span>
                <button onClick={() => setPage(page => Math.min(page + 1, totalPages))} disabled={page === totalPages}>Next</button>
            </div>
        </div>
    );
};

export default TransactionsTable;
