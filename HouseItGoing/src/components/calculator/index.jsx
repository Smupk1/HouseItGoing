import React, { useState, useEffect, useMemo } from 'react'
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../Context/authContext'
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TablePagination, TextField, Button, Select, MenuItem } from '@mui/material';
import { db } from "../../firebase/firebase";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { doc, setDoc, getDoc, getDocs, collection, runTransaction } from "firebase/firestore";



const Calculator = () => {
  const { userLoggedIn, currentUser } = useAuth();

  // State for Form 1
  const [formState, setFormState] = useState({
    mortgageAmount: '',
    downPayment: '',
    interestRate: '',
    loanDuration: '',
    extraMonthly: '',
    extraYearly: '',
    nameSaved: '',
  });

  const [rows, setRows] = useState([]); // Rows for Scenario 
  const [page, setPage] = useState(0); // Pagination page for Table 
  const [rowsPerPage, setRowsPerPage] = useState(20); // Rows per page
  const [options, setOptions] = useState([]); // Saved scenarios
  const [selectedOption, setSelectedOption] = useState('SelectValues'); // Selected scenario for Form 1
  const [formSaved, setFormSaved] = useState({
    interestSaved: '',
    monthsShavedOff: '',
    yearsShavedOff: '',
  }); // Selected scenario for Form 1

  if (!userLoggedIn) {
    // Redirect to the login page if the user is not logged in
    return <Navigate to="/login" replace />;
  }

  useEffect(() => {
    const newRows = calculateMortgage(formState);
    setRows(newRows);
  }, [formState]);
  // Fetch saved scenarios when the component mounts

  useEffect(() => {
    const fetchSavedScenarios = async () => {
      if (!currentUser?.uid) return;

      try {
        const savesCollectionRef = collection(db, "users", currentUser.uid, "saves");
        const querySnapshot = await getDocs(savesCollectionRef);
        const newOptions = querySnapshot.docs.map(doc => ({ value: doc.id, label: doc.id || "Untitled Save" }));
        setOptions([{ value: "SelectValues", label: "Select Values" }, ...newOptions]);
      } catch (error) {
        console.error("Error fetching saved scenarios:", error);
      }
    };

    fetchSavedScenarios();
  }, [currentUser]);

  // Function to calculate mortgage schedule
  const calculateMortgage = (formState) => {
    if (!currentUser?.uid || !formState.mortgageAmount ||
      !formState.downPayment ||
      !formState.interestRate ||
      !formState.loanDuration) {
      const newRows = [];
      return newRows;
    }
    
    const { mortgageAmount, downPayment, interestRate, loanDuration, extraMonthly, extraYearly } = formState;
    const loanAmount = parseFloat(mortgageAmount) - parseFloat(downPayment);
    const monthlyInterestRate = parseFloat(interestRate) / 12 / 100;
    const totalPayments = parseInt(loanDuration, 10) * 12;
    const extraMonthlyPayment = parseFloat(extraMonthly || 0);
    const extraYearlyPayment = parseFloat(extraYearly || 0);

    // Calculate the monthly payment without extra payments
    const monthlyPayment = loanAmount * (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, totalPayments)) / (Math.pow(1 + monthlyInterestRate, totalPayments) - 1);

    // Track the original schedule for interest and total payments comparison
    let originalRemainingBalance = loanAmount;
    let originalTotalInterest = 0;
    let originalTotalMonths = 0;

    for (let month = 1; month <= totalPayments; month++) {
      const interest = originalRemainingBalance * monthlyInterestRate;
      const principal = monthlyPayment - interest;
      originalRemainingBalance -= principal;
      
      if (originalRemainingBalance < 0) originalRemainingBalance = 0;
      originalTotalInterest += interest;
     
      originalTotalMonths = month;
        if (originalRemainingBalance === 0) {
          
        break;
      }
    }

    // Calculate the modified schedule with extra payments
    let remainingBalance = loanAmount;
    let newTotalInterest = 0;
    let newTotalMonths = 0;
    const newRows = [];

    for (let month = 1; month <= totalPayments; month++) {
      const interest = remainingBalance * monthlyInterestRate;
      const principal = monthlyPayment - interest;
      let totalPrincipal = principal + extraMonthlyPayment;
      remainingBalance -= totalPrincipal;

      // Apply yearly extra payment at the end of each year
      if (month % 12 === 0 && extraYearlyPayment > 0) {
        remainingBalance -= extraYearlyPayment;
      }

      if (remainingBalance < 0) remainingBalance = 0;

      newRows.push({
        month,
        monthlyPayment: monthlyPayment.toFixed(2),
        interest: interest.toFixed(2),
        principal: totalPrincipal.toFixed(2),
        remainingBalance: remainingBalance.toFixed(2),
      });

      newTotalInterest += interest;
      newTotalMonths = month;
      if (remainingBalance === 0) {
        
        break;
      }
    }

    // Calculate the interest saved and months shaved off
    const interestSaved = originalTotalInterest - newTotalInterest;
    const monthsShavedOff = originalTotalMonths - newTotalMonths;
    const yearsShavedOff = (monthsShavedOff / 12).toFixed(2);
    console.log(originalTotalInterest);
    // Ensure no negative values are passed to setFormSaved
    setFormSaved(prevState => ({
      ...prevState,
      interestSaved: Math.max(interestSaved, 0),
      monthsShavedOff: Math.max(monthsShavedOff),
      yearsShavedOff: Math.max(yearsShavedOff),
    }));


    return newRows;

  };

  // Save scenario to Firestore
  const saveScenario = async (formState) => {
    if (!currentUser?.uid || !formState.nameSaved || !formState.mortgageAmount ||
      !formState.downPayment ||
      !formState.interestRate ||
      !formState.loanDuration) {
      alert(`Please fill in all required fields before saving.`);
      return
    };

    try {
      const data = {
        mortgageAmount: formState.mortgageAmount,
        downPayment: formState.downPayment,
        interestRate: formState.interestRate,
        loanDuration: formState.loanDuration,
        extraYearly: formState.extraYearly,
        extraMonthly: formState.extraMonthly,
      };
      await setDoc(doc(db, "users", currentUser.uid, "saves", formState.nameSaved), data);
    } catch (e) {
      console.error("Error saving scenario:", e);
    }
  };

  // Load scenario from Firestore
  const loadScenario = async (selectedOption) => {
    if (!currentUser?.uid || selectedOption === 'SelectValues') return;

    try {
      const docRef = doc(db, "users", currentUser.uid, "saves", selectedOption);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const fetchedData = docSnap.data();
        setFormState(prevState => ({ ...prevState, ...fetchedData }));
      }
    } catch (error) {
      console.error('Error loading scenario:', error);
    }
  };

  const exportToExcel = () => {
    if (!currentUser?.uid || !formState.nameSaved || !formState.mortgageAmount ||
      !formState.downPayment ||
      !formState.interestRate ||
      !formState.loanDuration) {
      alert(`Please fill in all required fields before Exporting to excel.`);
      return
    }
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const finalBlob = new Blob([excelBuffer], { type: "application/octet-stream" });

    saveAs(finalBlob, formState.nameSaved + ".xlsx");
  };
  const paginatedRows = useMemo(() => rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage), [rows, page, rowsPerPage]);
  return (

    <div style={{ marginTop: '30px' }} className="bg-neutral-800 flex h-screen justify-center   items-center ">
      <Paper style={{ height: '90%', width: '70%', backgroundColor: '#1E1E1E', color: '#E0E0E0' }}>
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
          onPageChange={(e, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          style={{ height: '56px', color: '#E0E0E0' }}
        />
      </Paper>
      <div className="lg:p-36 md:p-52 sm:20 p-8 w-full lg:w-1/4 ">
        <div style={{
          backgroundColor: '#2C2C2C',
          borderRadius: '10px',
          padding: '20px',
          margin: '20px auto',
          width: '80%',
          maxWidth: '600px',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
        }}>
          <h2 style={{
            color: '#E0E0E0',
            fontSize: '24px',
            fontWeight: '600',
            marginBottom: '10px',
            textAlign: 'center'
          }}>
            Interest Saved: <span style={{ color: '#31a767' }}>${(formSaved.interestSaved || 0).toFixed(2)}</span>
          </h2>

          <h2 style={{
            color: '#E0E0E0',
            fontSize: '24px',
            fontWeight: '600',
            marginBottom: '10px',
            textAlign: 'center'
          }}>
            Months Shaved Off: <span style={{ color: '#81C784' }}>{formSaved.monthsShavedOff || "0"}</span> months
          </h2>

          <h2 style={{
            color: '#E0E0E0',
            fontSize: '24px',
            fontWeight: '600',
            marginBottom: '10px',
            textAlign: 'center'
          }}>
            Years Shaved Off: <span style={{ color: '#64B5F6' }}>{formSaved.yearsShavedOff || "0.00"}</span> years
          </h2>
        </div>
        {['mortgageAmount', 'downPayment', 'interestRate', 'loanDuration', 'extraYearly', 'extraMonthly'].map((field) => (
          <TextField
            key={field}
            label={field.replace(/([A-Z])/g, ' $1').trim()}
            type="number"
            value={formState[field]}
            onChange={(e) => setFormState(prevState => ({ ...prevState, [field]: e.target.value }))}
            fullWidth
            required={['mortgageAmount', 'downPayment', 'interestRate', 'loanDuration'].includes(field)}
            margin="normal"
            InputProps={{
              style: { color: "#E0E0E0", backgroundColor: "#333", borderRadius: '5px' },
            }}
            InputLabelProps={{
              style: { color: "#BBB" },
            }}
          />
        ))}
        <TextField
          label="Save as"
          type="text"
          value={formState.nameSaved}
          onChange={(e) => setFormState(prevState => ({ ...prevState, nameSaved: e.target.value }))}
          fullWidth
          margin="normal"
          InputProps={{
            style: { color: "#E0E0E0", backgroundColor: "#333", borderRadius: '5px' },
          }}
          InputLabelProps={{
            style: { color: "#BBB" },
          }}
        />
        <Button
          variant="contained"
          onClick={() => saveScenario(formState)}
          fullWidth
          style={{ backgroundColor: "#096f59", color: "#FFF", marginTop: '12px' }}
        >
          Save Scenario
        </Button>
        <Button
          onClick={exportToExcel}
          fullWidth
          disabled={!formState.nameSaved}
          style={{
            backgroundColor: formState.nameSaved ? "#0a8543" : "gray",
            color: "#FFF",
            marginTop: '12px',
            cursor: formState.nameSaved ? "pointer" : "not-allowed",
            opacity: formState.nameSaved ? 1 : 0.6
          }}>
          Download Excel
        </Button>

        <Select
          value={selectedOption}
          onChange={(e) => setSelectedOption(e.target.value)}
          fullWidth
          style={{ color: "#E0E0E0", backgroundColor: "#333", borderRadius: '5px', marginTop: '12px' }}
        >
          {options.map((option) => (
            <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
          ))}
        </Select>
        <Button
          variant="contained"
          onClick={() => loadScenario(selectedOption)}
          fullWidth
          style={{ backgroundColor: "#0a5685", color: "#FFF", marginTop: '12px' }}
        >
          Load Scenario
        </Button>
      </div>
    </div>
  );


};


export default Calculator