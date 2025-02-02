import React, { useState, useEffect, useMemo } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../Context/authContext';
import { Select, MenuItem, Button, Paper, TextField } from '@mui/material';
import { Line } from 'react-chartjs-2';
import { doc, getDoc, setDoc, getDocs, collection } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';



// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Home = () => {

  const { userLoggedIn, currentUser } = useAuth();
  const [numGraphs, setNumGraphs] = useState(1); // Number of graphs to display
  const [options, setOptions] = useState([]); // Saved scenarios
  const [selectedScenarios, setSelectedScenarios] = useState([]); // Selected scenarios for each graph
  const [scenarioData, setScenarioData] = useState([]); // Data for each selected scenario
  const [userData, setUserData] = useState([]);

  // Fetch saved scenarios when the component mounts
  useEffect(() => {
    const fetchSavedScenarios = async () => {
      if (!currentUser?.uid) return;

      try {
        const savesCollectionRef = collection(db, "users", currentUser.uid, "saves");
        const querySnapshot = await getDocs(savesCollectionRef);
        const newOptions = querySnapshot.docs.map(doc => ({ value: doc.id, label: doc.id || "Untitled Save" }));
        setOptions(newOptions);
      } catch (error) {
        console.error("Error fetching saved scenarios:", error);
      }
    };

    fetchSavedScenarios();
  }, [currentUser]);

  useEffect(() => {
    const fetchSavedInfo = async () => {
      if (!currentUser?.uid) return;

      try {
        const savesCollectionRef = doc(db, "UserInfo", currentUser.uid, "data", "name");
        const querySnapshot = await getDoc(savesCollectionRef);
        
        if (!querySnapshot.exists()) {
          const userInput = prompt("Please add your name:");
          if (userInput) {
            try {
              const data = { userInput: userInput };
              await setDoc(doc(db, "UserInfo", currentUser.uid, "data", "name"), data);
              setUserData(userInput); // Set userData after input is saved
            } catch (e) {
              console.error("Error saving Name:", e);
            }
          }
        } else {
          const UserData = querySnapshot.data();
          setUserData(UserData.userInput || ''); // Set userData if found
        }
      } catch (error) {
        console.error("Error fetching saved scenarios:", error);
      }
    };

    fetchSavedInfo();
  }, [currentUser?.uid]);


  // Load data for selected scenarios
  useEffect(() => {
    const fetchScenarioData = async () => {
      const data = [];
      for (const scenarioId of selectedScenarios) {
        if (scenarioId === 'SelectValues') continue;

        try {
          const docRef = doc(db, "users", currentUser.uid, "saves", scenarioId);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const fetchedData = docSnap.data();
            const calculatedRows = calculateMortgage(fetchedData);
            data.push({ label: scenarioId, data: calculatedRows });
          }
        } catch (error) {
          console.error('Error loading scenario data:', error);
        }
      }
      setScenarioData(data);
    };

    if (selectedScenarios.length > 0) {
      fetchScenarioData();
    }
  }, [selectedScenarios, currentUser]);

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

  // Handle change in the number of graphs
  const handleNumGraphsChange = (e) => {
    const num = parseInt(e.target.value, 10);
    setNumGraphs(num);
    setSelectedScenarios(Array(num).fill('SelectValues')); // Reset selected scenarios
  };

  // Handle change in selected scenario for a graph
  const handleScenarioChange = (index, value) => {
    const newSelectedScenarios = [...selectedScenarios];
    newSelectedScenarios[index] = value;
    setSelectedScenarios(newSelectedScenarios);
  };

  // Generate graph data for Chart.js
  const generateGraphData = (scenario) => {
    const labels = scenario.data.map((row) => `Month ${row.month}`);
    const remainingBalanceData = scenario.data.map((row) => parseFloat(row.remainingBalance));

    return {
      labels,
      datasets: [
        {
          label: scenario.label,
          data: remainingBalanceData,
          borderColor: `#${Math.floor(Math.random() * 16777215).toString(16)}`, // Random color
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
        },
      ],
    };
  };



  const changeName = async () => {
    if (!currentUser?.uid) return;
  
    const userInput = prompt("Please add your name:");
    if (userInput) {
      try {
        const data = { userInput: userInput };
        await setDoc(doc(db, "UserInfo", currentUser.uid, "data", "name"), data);
        setUserData(userInput); // Directly use userInput instead of UserData
      } catch (e) {
        console.error("Error saving Name:", e);
      }
    }
  };
  
  // Redirect to login if user is not logged in
  if (!userLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  return (

    <div className="bg-neutral-800 flex flex-col h-screen p-8 overflow-auto">
      <div style={{ marginBottom: '30px', marginTop: '50px' }}>
        <h1 className="text-white text-3xl mb-8" >Mortgage Comparison Dashboard</h1>
        <div className="flex flex-col md:flex-row items-center">
          <h1 className="text-white text-3xl mb-8" style={{ marginRight: '30px', marginTop: '30px' }}>{userData ? `Welcome ${userData}` : 'Welcome Guest'}</h1>

          {/* Button will be hidden if userData is empty */}
          {userData && (
            <Button onClick={changeName} variant="contained" color="primary" className="ml-4">
              Change Name
            </Button>
          )}
        </div>
      </div>
      {/* Number of Graphs Selection */}
      <div className="mb-8">
        <TextField
          select
          label="Number of Graphs"
          value={numGraphs}
          onChange={handleNumGraphsChange}
          fullWidth
          InputProps={{
            style: { color: "#E0E0E0", backgroundColor: "#333", borderRadius: '5px' },
          }}
          InputLabelProps={{
            style: { color: "#BBB" },
          }}
        >
          {[1, 2, 3, 4].map((num) => (
            <MenuItem key={num} value={num}>
              {num}
            </MenuItem>
          ))}
        </TextField>
      </div>

      {/* Graph Selection and Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {Array.from({ length: numGraphs }).map((_, index) => (
          <Paper key={index} style={{ backgroundColor: '#1E1E1E', color: '#E0E0E0', padding: '16px' }}>
            <h2 className="text-white text-xl mb-4">Graph {index + 1}</h2>
            <Select
              value={selectedScenarios[index] || 'SelectValues'}
              onChange={(e) => handleScenarioChange(index, e.target.value)}
              fullWidth
              style={{ color: "#E0E0E0", backgroundColor: "#333", borderRadius: '5px', marginBottom: '16px' }}
            >
              <MenuItem value="SelectValues">Select a Scenario</MenuItem>
              {options.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
            {scenarioData[index] && (
              <Line
                data={generateGraphData(scenarioData[index])}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'top',
                    },
                    title: {
                      display: true,
                      text: `Scenario: ${scenarioData[index].label}`,
                      color: '#E0E0E0',
                    },
                  },
                  scales: {
                    x: {
                      ticks: {
                        color: '#E0E0E0',
                      },
                      grid: {
                        color: '#444',
                      },
                    },
                    y: {
                      ticks: {
                        color: '#E0E0E0',
                      },
                      grid: {
                        color: '#444',
                      },
                    },
                  },
                }}
              />
            )}
          </Paper>
        ))}
      </div>
    </div>
  );
}

export default Home