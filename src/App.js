import React, { useState, useEffect } from 'react';
import axios from 'axios';

const App = () => {
  const [statistics, setStatistics] = useState({});
  const [selectedMonth] = useState('2023-01'); // Example: January 2023
  const [search, setSearch] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch statistics for selected month
  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const response = await axios.get(`/api/statistics?month=${selectedMonth}`);
        setStatistics(response.data);
      } catch (error) {
        console.error('Error fetching statistics:', error);
      }
    };

    fetchStatistics();
  }, [selectedMonth]);

  // Fetch transactions based on month, search term, page, and perPage
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axios.get('http://localhost:5000/Transactions', {
          params: { month: selectedMonth, search, page, perPage },
        });
        setTransactions(data.transactions);
        setTotalPages(data.totalPages);
      } catch (error) {
        console.error('Error fetching transactions:', error);
      }
    };
    fetchData();
  }, [selectedMonth, search, page, perPage]);

  // Handle search term change
  const handleSearch = (searchTerm) => {
    setSearch(searchTerm);
    setPage(1); // Reset page to 1 when search term changes
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  return (
    <div style={{
      backgroundColor: '#30CEFC',
      margin: 0,
      padding: 0,
      fontFamily: 'Arial, sans-serif',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <h1>Transaction Dashboard</h1>

      {/* SearchBar Component */}
      <form onSubmit={(e) => { e.preventDefault(); }}>
        <input
          type="text"
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search transactions..."
        />
        <button type="submit">Search</button>
      </form>

      {/* TransactionsTable Component */}
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
          <button onClick={() => handlePageChange(page => Math.max(page - 1, 1))} disabled={page === 1}>Previous</button>
          <span> Page {page} of {totalPages} </span>
          <button onClick={() => handlePageChange(page => Math.min(page + 1, totalPages))} disabled={page === totalPages}>Next</button>
        </div>
      </div>

      {/* Display Statistics */}
      <div className="App">
        <h2>Statistics for {selectedMonth}</h2>
        <p>Total Sale Amount: ${statistics.totalSaleAmount}</p>
        <p>Total Sold Items: {statistics.totalSoldItems}</p>
        <p>Total Not Sold Items: {statistics.totalNotSoldItems}</p>
      </div>
    </div>
  );
};

export default App;
