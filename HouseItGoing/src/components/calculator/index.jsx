import React, { useState } from 'react'
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../Context/authContext'
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TablePagination, TextField, Button } from '@mui/material';

import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';


function createData(month, payment, interest, principal, remaining) {
  return { month, payment, interest, principal, remaining };
}



const Calculator = () => {

  const { userLoggedIn, currentUser } = useAuth();
  if (!userLoggedIn) {
    // Redirect to the login page if the user is not logged in
    return <Navigate to="/login" replace />;
  }

  const [mortgageAmount, setMortgageAmount] = useState('');
  const [downPayment, setDownPayment] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [loanDuration, setLoanDuration] = useState('');
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const handleCalculate = (event) => {
    event.preventDefault();

    // Convert inputs to numbers
    const loanAmount = parseFloat(mortgageAmount) - parseFloat(downPayment);
    const monthlyInterestRate = parseFloat(interestRate) / 12 / 100;
    const totalPayments = parseInt(loanDuration, 10) * 12;

    // Monthly mortgage payment calculation
    const monthlyPayment =
      loanAmount *
      (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, totalPayments)) /
      (Math.pow(1 + monthlyInterestRate, totalPayments) - 1);

    let remainingBalance = loanAmount;
    const newRows = [];

    for (let month = 1; month <= totalPayments; month++) {
      const interest = remainingBalance * monthlyInterestRate;
      const principal = monthlyPayment - interest;
      remainingBalance -= principal;

      // Prevent negative balance
      if (remainingBalance < 0) remainingBalance = 0;

      newRows.push({
        month,
        monthlyPayment: monthlyPayment.toFixed(2),
        interest: interest.toFixed(2),
        principal: principal.toFixed(2),
        remainingBalance: remainingBalance.toFixed(2),
      });

      if (remainingBalance === 0) break;
    }

    setRows(newRows); // Set rows for the table
  };



  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const options = [

    { label: 'Fruit', value: 'fruit' },

    { label: 'Vegetable', value: 'vegetable' },

    { label: 'Meat', value: 'meat' },

  ];

  const [value, setValue] = React.useState('fruit');

  const handleChange = (event) => {

    setValue(event.target.value);

  };

  // Paginated rows
  const paginatedRows = rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (

    <div className="bg-neutral-800 flex h-screen justify-center   items-center ">
      <Paper style={{ height: '90%', width: '95%', backgroundColor: '#1E1E1E', color: '#E0E0E0' }}>
        <TableContainer style={{ height: 'calc(100% - 56px)', width: '100%' }}>
          <Table stickyHeader>
            <TableHead >
              <TableRow >
                <TableCell style={{ color: '#E0E0E0', backgroundColor: '#333' }}>Month</TableCell>
                <TableCell align="right" style={{ color: '#E0E0E0', backgroundColor: '#333' }}>Monthly Payment</TableCell>
                <TableCell align="right" style={{ color: '#E0E0E0', backgroundColor: '#333' }}>Interest</TableCell>
                <TableCell align="right" style={{ color: '#E0E0E0', backgroundColor: '#333' }}>Principal</TableCell>
                <TableCell align="right" style={{ color: '#E0E0E0', backgroundColor: '#333' }}>Remaining Balance</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedRows.map((row) => (
                <TableRow key={row.month} style={{ backgroundColor: '#292929' }}>
                  <TableCell component="th" scope="row" style={{ color: '#E0E0E0' }}>{row.month}</TableCell>
                  <TableCell align="right" style={{ color: '#E0E0E0' }}>{row.monthlyPayment}</TableCell>
                  <TableCell align="right" style={{ color: '#E0E0E0' }}>{row.interest}</TableCell>
                  <TableCell align="right" style={{ color: '#E0E0E0' }}>{row.principal}</TableCell>
                  <TableCell align="right" style={{ color: '#E0E0E0' }}>{row.remainingBalance}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[20, 40, 60]}
          component="div"
          count={rows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          style={{ height: '56px', color: '#E0E0E0' }}
        />
      </Paper>
      <div className="lg:p-36 md:p-52 sm:20 p-8 w-full lg:w-1/5 ">
        <main className="w-full  flex self-center place-content-center place-items-center  ">
          <form onSubmit={handleCalculate}>
            <TextField
              label="Total Mortgage Amount"
              type="number"
              value={mortgageAmount}
              onChange={(e) => setMortgageAmount(e.target.value)}
              fullWidth
              required
              margin="normal"
              InputProps={{
                style: { color: "#E0E0E0", backgroundColor: "#333", borderRadius: '5px' },
              }}
              InputLabelProps={{
                style: { color: "#BBB" },
              }}
            />
            <TextField
              label="Down Payment"
              type="number"
              value={downPayment}
              onChange={(e) => setDownPayment(e.target.value)}
              fullWidth
              required
              margin="normal"
              InputProps={{
                style: { color: "#E0E0E0", backgroundColor: "#333", borderRadius: '5px' },
              }}
              InputLabelProps={{
                style: { color: "#BBB" },
              }}
            />
            <TextField
              label="Yearly Interest Rate (%)"
              type="number"
              value={interestRate}
              onChange={(e) => setInterestRate(e.target.value)}
              fullWidth
              required
              margin="normal"
              InputProps={{
                style: { color: "#E0E0E0", backgroundColor: "#333", borderRadius: '5px' },
              }}
              InputLabelProps={{
                style: { color: "#BBB" },
              }}
            />
            <TextField
              label="Loan Duration (Years)"
              type="number"
              value={loanDuration}
              onChange={(e) => setLoanDuration(e.target.value)}
              fullWidth
              required
              margin="normal"
              InputProps={{
                style: { color: "#E0E0E0", backgroundColor: "#333", borderRadius: '5px' },
              }}
              InputLabelProps={{
                style: { color: "#BBB" },
              }}
            />
            <Button type="submit" variant="contained" color="primary" fullWidth style={{ backgroundColor: "#1976D2", color: "#FFF", marginTop: '12px' }}>
              Calculate
            </Button>
          </form>
        </main>
        <div>
        <form onSubmit={handleCalculate}>
          <div className='mt-8'>
            <label>
              <select value={value} onChange={handleChange}>

                {options.map((option) => (

                  <option value={option.value}>{option.label}</option>

                ))}

              </select>
            </label>
          </div>
          <Button type="submit" variant="contained" color="primary" fullWidth style={{ backgroundColor: "#1976D2", color: "#FFF", marginTop: '12px' }}>
            Bring Back
          </Button>
        </form>
        </div>
      </div>
    </div>
  );
};


export default Calculator