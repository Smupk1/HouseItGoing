import Login from "./components/auth/login";
import Register from "./components/auth/register";

import Header from "./components/header";
import Home from "./components/home";
import Compare from "./components/compare";
import Calculator from "./components/calculator";
import { useRoutes } from 'react-router-dom';
import { AuthProvider } from "./Context/authContext";

function App() {

  const routesArray = [

    {
      path: "/login",
      element: <Login />,
    },
    {
      path: "/register",
      element: <Register />,
    },
    {
      path: "/home",
      element: <Home />,
    },
    {
      path: "/calculator",
      element: <Calculator />,
    },
    {
    path: "/compare",
    element: <Compare />,
    },
    {
      path: "*",
      element: <Login />,
    },
  ];
  let routesElement = useRoutes(routesArray);
  return (

    <AuthProvider>
      <Header />
    <div style={{ marginTop: '50px' }} className="w-full h-screen flex fixed flex-col">{routesElement}</div>
  </AuthProvider>
  );
}

export default App;

