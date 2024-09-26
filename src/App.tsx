import { ThemeProvider } from "@emotion/react";
import theme from "./constants/theme";
import MainLayout from "./layout/MainLayout";
import "./App.css";

function App() {
	return (
		<ThemeProvider theme={theme}>
			<MainLayout />
		</ThemeProvider>
	);
}

export default App;
