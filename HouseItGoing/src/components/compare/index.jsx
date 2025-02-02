import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../Context/authContext';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TablePagination, TextField, Button, Select, MenuItem } from '@mui/material';
import { doc, setDoc, getDoc, getDocs, collection } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const CompareMortgages = () => {
  const { userLoggedIn, currentUser } = useAuth();

  // State for Form 1
  const [formState1, setFormState1] = useState({
    mortgageAmount: '',
    downPayment: '',
    interestRate: '',
    loanDuration: '',
    extraMonthly: '',
    extraYearly: '',
    nameSaved: '',
  });

  // State for Form 2
  const [formState2, setFormState2] = useState({
    mortgageAmount: '',
    downPayment: '',
    interestRate: '',
    loanDuration: '',
    extraMonthly: '',
    extraYearly: '',
    nameSaved: '',
  });

  const [rows1, setRows1] = useState([]); // Rows for Scenario 1
  const [rows2, setRows2] = useState([]); // Rows for Scenario 2
  const [page1, setPage1] = useState(0); // Pagination page for Table 1
  const [page2, setPage2] = useState(0); // Pagination page for Table 2
  const [rowsPerPage, setRowsPerPage] = useState(20); // Rows per page
  const [options, setOptions] = useState([]); // Saved scenarios
  const [selectedOption1, setSelectedOption1] = useState('SelectValues'); // Selected scenario for Form 1
  const [selectedOption2, setSelectedOption2] = useState('SelectValues'); // Selected scenario for Form 2

  // Automatically calculate mortgage schedules when form inputs change
  useEffect(() => {
    const newRows1 = calculateMortgage(formState1);
    setRows1(newRows1);
  }, [formState1]);

  useEffect(() => {
    const newRows2 = calculateMortgage(formState2);
    setRows2(newRows2);
  }, [formState2]);

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
    const { mortgageAmount, downPayment, interestRate, loanDuration, extraMonthly, extraYearly } = formState;
    const loanAmount = parseFloat(mortgageAmount) - parseFloat(downPayment);
    const monthlyInterestRate = parseFloat(interestRate) / 12 / 100;
    const totalPayments = parseInt(loanDuration, 10) * 12;
    const extraMonthlyPayment = parseFloat(extraMonthly || 0);
    const extraYearlyPayment = parseFloat(extraYearly || 0);

    const monthlyPayment = loanAmount * (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, totalPayments)) / (Math.pow(1 + monthlyInterestRate, totalPayments) - 1);
    let remainingBalance = loanAmount;
    const newRows = [];

    for (let month = 1; month <= totalPayments; month++) {
      const interest = remainingBalance * monthlyInterestRate;
      const principal = monthlyPayment - interest;
      let totalPrincipal = principal + extraMonthlyPayment;
      remainingBalance -= totalPrincipal;

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

      if (remainingBalance === 0) break;
    }

    return newRows;
  };

  // Save scenario to Firestore
  const saveScenario = async (formState, scenarioNumber) => {
    if (!currentUser?.uid || !formState.nameSaved ||!formState.mortgageAmount||
      !formState.downPayment||
      !formState.interestRate||
      !formState.loanDuration) {
        alert(`Please fill in all required fields for Scenario ${scenarioNumber} before saving.`);
        return};

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
      alert(`Calculation ${scenarioNumber} saved successfully!`);
    } catch (e) {
      console.error("Error saving scenario:", e);
    }
  };
  const exportToExcel = (formState, rows) => {
    if (!currentUser?.uid || !formState.nameSaved ||!formState.mortgageAmount||
      !formState.downPayment||
      !formState.interestRate||
      !formState.loanDuration) {
        alert(`Please fill in all required fields before Exporting to excel.`);
        return};
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const finalBlob = new Blob([excelBuffer], { type: "application/octet-stream" });

    saveAs(finalBlob, formState.nameSaved + ".xlsx");
  };

  // Load scenario from Firestore
  const loadScenario = async (selectedOption, setFormState) => {
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

  // Paginated rows for both tables
  const paginatedRows1 = useMemo(() => rows1.slice(page1 * rowsPerPage, page1 * rowsPerPage + rowsPerPage), [rows1, page1, rowsPerPage]);
  const paginatedRows2 = useMemo(() => rows2.slice(page2 * rowsPerPage, page2 * rowsPerPage + rowsPerPage), [rows2, page2, rowsPerPage]);

  // Redirect to login if user is not logged in
  if (!userLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="bg-neutral-800 flex flex-col min-h-screen p-8 overflow-auto">
      <div className="flex justify-between mb-8">
        {/* Form 1 */}
        <div className="w-1/2 pr-4">
          <h2 className="text-white text-2xl mb-4">Scenario 1</h2>
          {['mortgageAmount', 'downPayment', 'interestRate', 'loanDuration', 'extraYearly', 'extraMonthly'].map((field) => (
            <TextField
              key={field}
              label={field.replace(/([A-Z])/g, ' $1').trim()}
              type="number"
              value={formState1[field]}
              onChange={(e) => setFormState1(prevState => ({ ...prevState, [field]: e.target.value }))}
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
            value={formState1.nameSaved}
            onChange={(e) => setFormState1(prevState => ({ ...prevState, nameSaved: e.target.value }))}
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
            onClick={() => saveScenario(formState1, 1)}
            fullWidth
            style={{ backgroundColor: "#096f59", color: "#FFF", marginTop: '12px' }}
          >
            Save Scenario 1
          </Button>


          <Button
            onClick={() => exportToExcel(formState1, rows1)}
            fullWidth
            disabled={!formState1.nameSaved}
            style={{
              backgroundColor: formState1.nameSaved ? "#0a8543" : "gray",
              color: "#FFF",
              marginTop: '12px',
              cursor: formState1.nameSaved ? "pointer" : "not-allowed",
              opacity: formState1.nameSaved ? 1 : 0.6
            }}>
            Download Excel
          </Button>
          <Select
            value={selectedOption1}
            onChange={(e) => setSelectedOption1(e.target.value)}
            fullWidth
            style={{ color: "#E0E0E0", backgroundColor: "#333", borderRadius: '5px', marginTop: '12px' }}
          >
            {options.map((option) => (
              <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
            ))}
          </Select>
          <Button
            variant="contained"
            onClick={() => loadScenario(selectedOption1, setFormState1)}
            fullWidth
            style={{ backgroundColor: "#0a5685", color: "#FFF", marginTop: '12px' }}
          >
            Load Scenario 1
          </Button>
        </div>

        {/* Form 2 */}
        <div className="w-1/2 pl-4">
          <h2 className="text-white text-2xl mb-4">Scenario 2</h2>
          {['mortgageAmount', 'downPayment', 'interestRate', 'loanDuration', 'extraYearly', 'extraMonthly'].map((field) => (
            <TextField
              key={field}
              label={field.replace(/([A-Z])/g, ' $1').trim()}
              type="number"
              value={formState2[field]}
              onChange={(e) => setFormState2(prevState => ({ ...prevState, [field]: e.target.value }))}
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
            value={formState2.nameSaved}
            onChange={(e) => setFormState2(prevState => ({ ...prevState, nameSaved: e.target.value }))}
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
            onClick={() => saveScenario(formState2, 2)}
            fullWidth
            style={{ backgroundColor: "#096f59", color: "#FFF", marginTop: '12px' }}
          >
            Save Scenario 2
          </Button>
          <Button
            onClick={() => exportToExcel(formState2, rows2)}
            fullWidth
            disabled={!formState2.nameSaved}
            style={{
              backgroundColor: formState2.nameSaved ? "#0a8543" : "gray",
              color: "#FFF",
              marginTop: '12px',
              cursor: formState2.nameSaved ? "pointer" : "not-allowed",
              opacity: formState2.nameSaved ? 1 : 0.6
            }}>
            Download Excel
          </Button>
          <Select
            value={selectedOption2}
            onChange={(e) => setSelectedOption2(e.target.value)}
            fullWidth
            style={{ color: "#E0E0E0", backgroundColor: "#333", borderRadius: '5px', marginTop: '12px' }}
          >
            {options.map((option) => (
              <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
            ))}
          </Select>
          <Button
            variant="contained"
            onClick={() => loadScenario(selectedOption2, setFormState2)}
            fullWidth
            style={{ backgroundColor: "#0a5685", color: "#FFF", marginTop: '12px' }}
          >
            Load Scenario 2
          </Button>
        </div>
      </div>

      {/* Two Side-by-Side Tables */}
      <div className="flex justify-between gap-8">
        {/* Table for Scenario 1 */}
        <Paper style={{ height: '70%', width: '50%', backgroundColor: '#1E1E1E', color: '#E0E0E0' }}>
          <TableContainer style={{ height: 'calc(100% - 56px)', width: '100%' }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell style={{ color: '#E0E0E0', backgroundColor: '#333' }}>Month</TableCell>
                  <TableCell align="right" style={{ color: '#E0E0E0', backgroundColor: '#333' }}>Monthly Payment</TableCell>
                  <TableCell align="right" style={{ color: '#E0E0E0', backgroundColor: '#333' }}>Interest</TableCell>
                  <TableCell align="right" style={{ color: '#E0E0E0', backgroundColor: '#333' }}>Principal</TableCell>
                  <TableCell align="right" style={{ color: '#E0E0E0', backgroundColor: '#333' }}>Remaining Balance</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedRows1.map((row) => (
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
            count={rows1.length}
            rowsPerPage={rowsPerPage}
            page={page1}
            onPageChange={(e, newPage) => setPage1(newPage)}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage1(0);
            }}
            style={{ height: '56px', color: '#E0E0E0' }}
          />
        </Paper>

        {/* Table for Scenario 2 */}
        <Paper style={{ height: '70%', width: '50%', backgroundColor: '#1E1E1E', color: '#E0E0E0' }}>
          <TableContainer style={{ height: 'calc(100% - 56px)', width: '100%' }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell style={{ color: '#E0E0E0', backgroundColor: '#333' }}>Month</TableCell>
                  <TableCell align="right" style={{ color: '#E0E0E0', backgroundColor: '#333' }}>Monthly Payment</TableCell>
                  <TableCell align="right" style={{ color: '#E0E0E0', backgroundColor: '#333' }}>Interest</TableCell>
                  <TableCell align="right" style={{ color: '#E0E0E0', backgroundColor: '#333' }}>Principal</TableCell>
                  <TableCell align="right" style={{ color: '#E0E0E0', backgroundColor: '#333' }}>Remaining Balance</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedRows2.map((row) => (
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
            count={rows2.length}
            rowsPerPage={rowsPerPage}
            page={page2}
            onPageChange={(e, newPage) => setPage2(newPage)}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage2(0);
            }}
            style={{ height: '56px', color: '#E0E0E0' }}
          />
        </Paper>
      </div>
    </div>
  );
};

export default CompareMortgages;